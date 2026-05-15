import { FRIENDSHIPS_COLLECTION } from '../../models/Friendship.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { fromDoc, now } from './_firestoreConverter.js';
import { randomUUID } from 'node:crypto';
/**
 * Implementação Firebase (Firestore) do repositório de amizade.
 * Gerencia solicitações de amizade, aceitações e listagens.
 */
export class AmigoRepositoryFirebase {
    col = adminDb.collection(FRIENDSHIPS_COLLECTION);
    async addFriend(playerUid, friendUid) {
        if (playerUid === friendUid)
            throw new Error('cannot_add_self_as_friend');
        // Verifica se já existe uma amizade entre os dois
        const existing = await this.col
            .where('player1Uid', 'in', [playerUid, friendUid])
            .where('player2Uid', 'in', [playerUid, friendUid])
            .get();
        if (!existing.empty) {
            const friendship = fromDoc(existing.docs[0].data());
            if (friendship.status === 'accepted')
                throw new Error('already_friends');
            if (friendship.status === 'pending')
                throw new Error('friend_request_already_exists');
        }
        // Cria nova solicitação de amizade
        const friendship = {
            id: randomUUID(),
            player1Uid: playerUid,
            player2Uid: friendUid,
            status: 'pending',
            createdAt: now(),
            updatedAt: now(),
        };
        await this.col.doc(friendship.id).set(friendship);
    }
    async removeFriend(playerUid, friendUid) {
        const friendship = await this.findFriendship(playerUid, friendUid);
        if (!friendship)
            throw new Error('friendship_not_found');
        await this.col.doc(friendship.id).delete();
    }
    async listFriends(playerUid) {
        const sent = await this.col
            .where('player1Uid', '==', playerUid)
            .where('status', '==', 'accepted')
            .get();
        const received = await this.col
            .where('player2Uid', '==', playerUid)
            .where('status', '==', 'accepted')
            .get();
        const friends = [];
        sent.docs.forEach(doc => {
            const f = fromDoc(doc.data());
            friends.push(f.player2Uid);
        });
        received.docs.forEach(doc => {
            const f = fromDoc(doc.data());
            friends.push(f.player1Uid);
        });
        return friends;
    }
    async listPendingRequests(playerUid) {
        const received = await this.col
            .where('player2Uid', '==', playerUid)
            .where('status', '==', 'pending')
            .get();
        return received.docs.map(doc => {
            const f = fromDoc(doc.data());
            return f.player1Uid;
        });
    }
    async acceptRequest(playerUid, friendUid) {
        const friendship = await this.findFriendship(friendUid, playerUid);
        if (!friendship)
            throw new Error('friend_request_not_found');
        if (friendship.status !== 'pending')
            throw new Error('request_not_pending');
        if (friendship.player2Uid !== playerUid)
            throw new Error('forbidden');
        await this.col.doc(friendship.id).update({
            status: 'accepted',
            updatedAt: now(),
        });
    }
    async rejectRequest(playerUid, friendUid) {
        const friendship = await this.findFriendship(friendUid, playerUid);
        if (!friendship)
            throw new Error('friend_request_not_found');
        if (friendship.status !== 'pending')
            throw new Error('request_not_pending');
        if (friendship.player2Uid !== playerUid)
            throw new Error('forbidden');
        await this.col.doc(friendship.id).delete();
    }
    async findFriendship(uid1, uid2) {
        const snap = await this.col
            .where('player1Uid', '==', uid1)
            .where('player2Uid', '==', uid2)
            .limit(1)
            .get();
        if (!snap.empty) {
            return fromDoc(snap.docs[0].data());
        }
        // Verifica na ordem inversa
        const snap2 = await this.col
            .where('player1Uid', '==', uid2)
            .where('player2Uid', '==', uid1)
            .limit(1)
            .get();
        if (!snap2.empty) {
            return fromDoc(snap2.docs[0].data());
        }
        return null;
    }
}
