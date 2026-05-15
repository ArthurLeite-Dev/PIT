// src/repositories/firebase/BlockRepositoryFirebase.ts
import { IBlockRepository } from '../../interfaces/IBlockRepository.js';
import { Block, BLOCKS_COLLECTION } from '../../models/Block.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { fromDoc, now } from './_firestoreConverter.js';
import { randomUUID } from 'node:crypto';

/**
 * Implementação Firebase (Firestore) do repositório de bloqueio/denúncia.
 * Gerencia bloqueios e denúncias entre usuários.
 */
export class BlockRepositoryFirebase implements IBlockRepository {
  private col = adminDb.collection(BLOCKS_COLLECTION);

  async create(block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>): Promise<Block> {
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

    const newBlock: Block = {
      id: randomUUID(),
      ...block,
      createdAt: now(),
      updatedAt: now(),
    };

    await this.col.doc(newBlock.id).set(newBlock);
    return newBlock;
  }

  async isBlocked(reporterUid: string, reportedUid: string): Promise<boolean> {
    const snapshot = await this.col
      .where('reporterUid', '==', reporterUid)
      .where('reportedUid', '==', reportedUid)
      .get();

    return !snapshot.empty;
  }

  async listBlockedBy(reporterUid: string): Promise<string[]> {
    const snapshot = await this.col
      .where('reporterUid', '==', reporterUid)
      .get();

    return snapshot.docs.map(doc => {
      const block = fromDoc<Block>(doc.data());
      return block.reportedUid;
    });
  }

  async remove(reporterUid: string, reportedUid: string): Promise<void> {
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

