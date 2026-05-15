// src/repositories/firebase/CallRepositoryFirebase.ts
import { adminDb } from '../../config/firebaseAdmin.js';
import { randomUUID } from 'node:crypto';
import { ListOpenFilters } from '../../interfaces/ICallRepository.js';

/**
 * Estrutura básica de um chamado (LFG)
 */
export interface Call {
  id: string;
  ownerUid: string;
  title: string;
  description?: string;
  gameId: string;
  platform: string;
  participants: string[];
  status: 'open' | 'closed';
  callFriendly: 'friendly' | 'competitive';
  playstyles: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entrada para criar um novo chamado
 */
export interface CreateCallInput {
  ownerUid: string;
  title: string;
  description?: string;
  gameId: string;
  platform: string;
  callFriendly: 'friendly' | 'competitive';
  playstyles: string[];
}

/**
 * Contrato do repositório de chamados
 */
export interface ICallRepository {
  create(data: CreateCallInput): Promise<Call>;
  listOpen(limit?: number, filters?: ListOpenFilters): Promise<Call[]>;
  getById(id: string): Promise<Call | null>;
  getActiveCallByUser(uid: string): Promise<Call | null>;
  join(callId: string, uid: string): Promise<Call>;
  close(callId: string, ownerUid: string): Promise<Call>;
  removeParticipant(callId: string, participantUid: string): Promise<Call>;
}

/**
 * Implementação Firebase (Firestore) do repositório de chamados
 */
export class CallRepositoryFirebase implements ICallRepository {
  private col = adminDb.collection('calls');

  async create(data: CreateCallInput): Promise<Call> {
    const id = randomUUID();
    const now = new Date();
    const call: Call = {
      id,
      ownerUid: data.ownerUid,
      title: data.title,
      description: data.description,
      gameId: data.gameId,
      platform: data.platform,
      participants: [data.ownerUid],
      status: 'open',
      callFriendly: data.callFriendly,
      playstyles: data.playstyles,
      createdAt: now,
      updatedAt: now,
    };

    await this.col.doc(id).set(call);
    return call;
  }

  async listOpen(limit = 20, filters?: ListOpenFilters): Promise<Call[]> {
    let query = this.col.where('status', '==', 'open');

    if (filters?.gameId) {
      query = query.where('gameId', '==', filters.gameId.toLowerCase());
    }

    if (filters?.callFriendly) {
      query = query.where('callFriendly', '==', filters.callFriendly);
    }

    if (filters?.playstyles && filters.playstyles.length > 0) {
      // For array contains any, we need to use array-contains-any
      // But since Firestore doesn't support multiple array-contains-any in one query,
      // we'll use array-contains for single playstyle or handle multiple in client if needed
      // For now, filter by the first playstyle
      query = query.where('playstyles', 'array-contains', filters.playstyles[0]);
    }

    const snap = await query.orderBy('createdAt', 'desc').limit(limit).get();
    let calls = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: data.id,
        ownerUid: data.ownerUid,
        title: data.title,
        description: data.description || undefined,
        gameId: data.gameId,
        platform: data.platform,
        participants: data.participants || [],
        status: data.status || 'open',
        callFriendly: data.callFriendly || 'friendly',
        playstyles: data.playstyles || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      } as Call;
    });

    // Apply client-side search filtering if search term is provided
    if (filters?.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      calls = calls.filter(call =>
        call.title.toLowerCase().includes(searchTerm) ||
        call.gameId.toLowerCase().includes(searchTerm) ||
        (call.description && call.description.toLowerCase().includes(searchTerm))
      );
    }

    return calls;
  }

  async getById(id: string): Promise<Call | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    
    const data = doc.data() as any;
    return {
      id: data.id,
      ownerUid: data.ownerUid,
      title: data.title,
      description: data.description || undefined,
      gameId: data.gameId,
      platform: data.platform,
      participants: data.participants || [],
      status: data.status,
      callFriendly: data.callFriendly || 'friendly',
      playstyles: data.playstyles || [],
      createdAt: data.createdAt?.toDate() || data.createdAt,
      updatedAt: data.updatedAt?.toDate() || data.updatedAt,
    } as Call;
  }

  async getActiveCallByUser(uid: string): Promise<Call | null> {
    const snap = await this.col
      .where('status', '==', 'open')
      .where('participants', 'array-contains', uid)
      .limit(1)
      .get();
    
    if (snap.empty) return null;
    
    const data = snap.docs[0].data() as any;
    return {
      id: data.id,
      ownerUid: data.ownerUid,
      title: data.title,
      description: data.description || undefined,
      gameId: data.gameId,
      platform: data.platform,
      participants: data.participants || [],
      status: data.status,
      callFriendly: data.callFriendly || 'friendly',
      playstyles: data.playstyles || [],
      createdAt: data.createdAt?.toDate() || data.createdAt,
      updatedAt: data.updatedAt?.toDate() || data.updatedAt,
    } as Call;
  }

  async join(callId: string, uid: string): Promise<Call> {
    const ref = this.col.doc(callId);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('call_not_found');
      const call = snap.data() as Call;
      if (call.status !== 'open') throw new Error('call_closed');
      if (call.participants.includes(uid)) return;

      call.participants.push(uid);
      call.updatedAt = new Date();
      tx.update(ref, { participants: call.participants, updatedAt: call.updatedAt });
    });
    const after = await ref.get();
    return after.data() as Call;
  }

  async close(callId: string, ownerUid: string): Promise<Call> {
    const ref = this.col.doc(callId);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('call_not_found');
      const call = snap.data() as Call;
      if (call.ownerUid !== ownerUid) throw new Error('forbidden');
      if (call.status === 'closed') return;
      tx.update(ref, { status: 'closed', updatedAt: new Date() });
    });
    const after = await ref.get();
    return after.data() as Call;
  }

  async removeParticipant(callId: string, participantUid: string): Promise<Call> {
    const ref = this.col.doc(callId);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('call_not_found');
      const call = snap.data() as Call;
      if (call.status !== 'open') throw new Error('call_closed');
      if (!call.participants.includes(participantUid)) throw new Error('participant_not_found');

      call.participants = call.participants.filter(uid => uid !== participantUid);
      call.updatedAt = new Date();
      tx.update(ref, { participants: call.participants, updatedAt: call.updatedAt });
    });
    const after = await ref.get();
    return after.data() as Call;
  }
}
