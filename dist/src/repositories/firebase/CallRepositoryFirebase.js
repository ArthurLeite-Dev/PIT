// src/repositories/firebase/CallRepositoryFirebase.ts
import { adminDb } from '../../config/firebaseAdmin.js';
import { randomUUID } from 'node:crypto';
/**
 * Implementação Firebase (Firestore) do repositório de chamados
 */
export class CallRepositoryFirebase {
    col = adminDb.collection('calls');
    async create(data) {
        const id = randomUUID();
        const now = new Date();
        const call = {
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
    async listOpen(limit = 20, filters) {
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
            const data = d.data();
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
            };
        });
        // Apply client-side search filtering if search term is provided
        if (filters?.search && filters.search.trim()) {
            const searchTerm = filters.search.trim().toLowerCase();
            calls = calls.filter(call => call.title.toLowerCase().includes(searchTerm) ||
                call.gameId.toLowerCase().includes(searchTerm) ||
                (call.description && call.description.toLowerCase().includes(searchTerm)));
        }
        return calls;
    }
    async getById(id) {
        const doc = await this.col.doc(id).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
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
        };
    }
    async getActiveCallByUser(uid) {
        const snap = await this.col
            .where('status', '==', 'open')
            .where('participants', 'array-contains', uid)
            .limit(1)
            .get();
        if (snap.empty)
            return null;
        const data = snap.docs[0].data();
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
        };
    }
    async join(callId, uid) {
        const ref = this.col.doc(callId);
        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            if (!snap.exists)
                throw new Error('call_not_found');
            const call = snap.data();
            if (call.status !== 'open')
                throw new Error('call_closed');
            if (call.participants.includes(uid))
                return;
            call.participants.push(uid);
            call.updatedAt = new Date();
            tx.update(ref, { participants: call.participants, updatedAt: call.updatedAt });
        });
        const after = await ref.get();
        return after.data();
    }
    async close(callId, ownerUid) {
        const ref = this.col.doc(callId);
        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            if (!snap.exists)
                throw new Error('call_not_found');
            const call = snap.data();
            if (call.ownerUid !== ownerUid)
                throw new Error('forbidden');
            if (call.status === 'closed')
                return;
            tx.update(ref, { status: 'closed', updatedAt: new Date() });
        });
        const after = await ref.get();
        return after.data();
    }
    async removeParticipant(callId, participantUid) {
        const ref = this.col.doc(callId);
        await adminDb.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            if (!snap.exists)
                throw new Error('call_not_found');
            const call = snap.data();
            if (call.status !== 'open')
                throw new Error('call_closed');
            if (!call.participants.includes(participantUid))
                throw new Error('participant_not_found');
            call.participants = call.participants.filter(uid => uid !== participantUid);
            call.updatedAt = new Date();
            tx.update(ref, { participants: call.participants, updatedAt: call.updatedAt });
        });
        const after = await ref.get();
        return after.data();
    }
}
