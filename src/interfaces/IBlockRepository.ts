// src/interfaces/IBlockRepository.ts
import type { Block } from '../models/Block.js';

export interface IBlockRepository {
  /**
   * Cria um novo bloqueio/denúncia
   */
  create(block: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>): Promise<Block>;

  /**
   * Verifica se um usuário bloqueou outro
   */
  isBlocked(reporterUid: string, reportedUid: string): Promise<boolean>;

  /**
   * Lista todos os usuários bloqueados por um usuário
   */
  listBlockedBy(reporterUid: string): Promise<string[]>; // Array de UIDs bloqueados

  /**
   * Remove um bloqueio (opcional, para casos de desbloqueio futuro)
   */
  remove(reporterUid: string, reportedUid: string): Promise<void>;
}

