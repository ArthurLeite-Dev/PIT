// src/models/Friendship.ts
export const FRIENDSHIPS_COLLECTION = 'friendships' as const;

/**
 * Representa a relação de amizade entre dois jogadores.
 * Armazenado na coleção 'friendships' no Firestore.
 */
export type Friendship = {
  id: string;               // ID do relacionamento de amizade (gerado automaticamente)
  player1Uid: string;       // ID do primeiro jogador
  player2Uid: string;       // ID do segundo jogador
  status: 'pending' | 'accepted';  // Status da amizade (pendente ou aceita)
  createdAt: Date;          // Data da criação da amizade
  updatedAt: Date;          // Data da última atualização da amizade
};
