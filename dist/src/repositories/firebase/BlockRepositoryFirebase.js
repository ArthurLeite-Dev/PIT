import { BLOCKS_COLLECTION } from '../../models/Block.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { fromDoc, now } from './_firestoreConverter.js';
import { randomUUID } from 'node:crypto';
/**
 * Implementação Firebase (Firestore) do repositório de bloqueio/denúncia.
 * Gerencia bloqueios e denúncias entre usuários.
 */
export class BlockRepositoryFirebase {
    col = adminDb.collection(BLOCKS_COLLECTION);
    async create(block) {
        if (block.reporterUid === block.reportedUid) {
            throw new Error('cannot_block_self');
        }
        // Verifica se já existe um bloqueio
        const existing = await this.col
            .where('reporterUid', '==', block.reporterUid)
            .where('reportedUid', '==', block.reportedUid)
            .get();
        if (!existing.empty) {
            throw new Error('block_already_exists');
        }
        const newBlock = {
            id: randomUUID(),
            ...block,
            createdAt: now(),
            updatedAt: now(),
        };
        await this.col.doc(newBlock.id).set(newBlock);
        return newBlock;
    }
    async isBlocked(reporterUid, reportedUid) {
        const snapshot = await this.col
            .where('reporterUid', '==', reporterUid)
            .where('reportedUid', '==', reportedUid)
            .get();
        return !snapshot.empty;
    }
    async listBlockedBy(reporterUid) {
        const snapshot = await this.col
            .where('reporterUid', '==', reporterUid)
            .get();
        return snapshot.docs.map(doc => {
            const block = fromDoc(doc.data());
            return block.reportedUid;
        });
    }
    async remove(reporterUid, reportedUid) {
        const snapshot = await this.col
            .where('reporterUid', '==', reporterUid)
            .where('reportedUid', '==', reportedUid)
            .get();
        if (snapshot.empty) {
            throw new Error('block_not_found');
        }
        await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
    }
}
