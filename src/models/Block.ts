// src/models/Block.ts
export const BLOCKS_COLLECTION = 'blocks' as const;

/**
 * Representa um bloqueio/denúncia entre dois jogadores.
 * Armazenado na coleção 'blocks' no Firestore.
 */
export type Block = {
  id: string;               // ID do bloqueio (gerado automaticamente)
  reporterUid: string;     // ID do jogador que denunciou/bloqueou
  reportedUid: string;      // ID do jogador denunciado/bloqueado
  reason?: string;         // Motivo da denúncia (opcional)
  reportedAt: Date;        // Data da denúncia
  createdAt: Date;          // Data da criação do bloqueio
  updatedAt: Date;          // Data da última atualização
};

