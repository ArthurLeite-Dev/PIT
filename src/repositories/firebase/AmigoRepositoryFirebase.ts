// src/repositories/firebase/AmigoRepositoryFirebase.ts
import { IAmigoRepository } from '../../interfaces/IAmigoRepository.js';
import { Friendship, FRIENDSHIPS_COLLECTION } from '../../models/Friendship.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { fromDoc, now } from './_firestoreConverter.js';
import { randomUUID } from 'node:crypto';

/**
 * Implementação Firebase (Firestore) do repositório de amizade.
 * Gerencia solicitações de amizade, aceitações e listagens.
 */
export class AmigoRepositoryFirebase implements IAmigoRepository {
  private col = adminDb.collection(FRIENDSHIPS_COLLECTION);

  async addFriend(playerUid: string, friendUid: string): Promise<void> {
    if (playerUid === friendUid) throw new Error('cannot_add_self_as_friend');

    // Verifica se já existe uma amizade entre os dois
    const existing = await this.col
      .where('player1Uid', 'in', [playerUid, friendUid])
      .where('player2Uid', 'in', [playerUid, friendUid])
      .get();

    if (!existing.empty) {
      const friendship = fromDoc<Friendship>(existing.docs[0].data());
      if (friendship.status === 'accepted') throw new Error('already_friends');
      if (friendship.status === 'pending') throw new Error('friend_request_already_exists');
    }

    // Cria nova solicitação de amizade
    const friendship: Friendship = {
      id: randomUUID(),
      player1Uid: playerUid,
      player2Uid: friendUid,
      status: 'pending',
      createdAt: now(),
      updatedAt: now(),
    };

    await this.col.doc(friendship.id).set(friendship);
  }

  async removeFriend(playerUid: string, friendUid: string): Promise<void> {
    const friendship = await this.findFriendship(playerUid, friendUid);
    if (!friendship) throw new Error('friendship_not_found');

    await this.col.doc(friendship.id).delete();
  }

  async listFriends(playerUid: string): Promise<string[]> {
    const sent = await this.col
      .where('player1Uid', '==', playerUid)
      .where('status', '==', 'accepted')
      .get();

    const received = await this.col
      .where('player2Uid', '==', playerUid)
      .where('status', '==', 'accepted')
      .get();

    const friends: string[] = [];
    sent.docs.forEach(doc => {
      const f = fromDoc<Friendship>(doc.data());
      friends.push(f.player2Uid);
    });
    received.docs.forEach(doc => {
      const f = fromDoc<Friendship>(doc.data());
      friends.push(f.player1Uid);
    });

    return friends;
  }

  async listPendingRequests(playerUid: string): Promise<string[]> {
    const received = await this.col
      .where('player2Uid', '==', playerUid)
      .where('status', '==', 'pending')
      .get();

    return received.docs.map(doc => {
      const f = fromDoc<Friendship>(doc.data());
      return f.player1Uid;
    });
  }

  async acceptRequest(playerUid: string, friendUid: string): Promise<void> {
    const friendship = await this.findFriendship(friendUid, playerUid);
    if (!friendship) throw new Error('friend_request_not_found');
    if (friendship.status !== 'pending') throw new Error('request_not_pending');
    if (friendship.player2Uid !== playerUid) throw new Error('forbidden');

    await this.col.doc(friendship.id).update({
      status: 'accepted',
      updatedAt: now(),
    });
  }

  async rejectRequest(playerUid: string, friendUid: string): Promise<void> {
    const friendship = await this.findFriendship(friendUid, playerUid);
    if (!friendship) throw new Error('friend_request_not_found');
    if (friendship.status !== 'pending') throw new Error('request_not_pending');
    if (friendship.player2Uid !== playerUid) throw new Error('forbidden');

    await this.col.doc(friendship.id).delete();
  }

  private async findFriendship(uid1: string, uid2: string): Promise<Friendship | null> {
    const snap = await this.col
      .where('player1Uid', '==', uid1)
      .where('player2Uid', '==', uid2)
      .limit(1)
      .get();

    if (!snap.empty) {
      return fromDoc<Friendship>(snap.docs[0].data());
    }

    // Verifica na ordem inversa
    const snap2 = await this.col
      .where('player1Uid', '==', uid2)
      .where('player2Uid', '==', uid1)
      .limit(1)
      .get();

    if (!snap2.empty) {
      return fromDoc<Friendship>(snap2.docs[0].data());
    }

    return null;
  }
}
