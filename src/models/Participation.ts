// src/models/Participation.ts
export const PARTICIPATIONS_COLLECTION = 'participations' as const;

/**
 * Representa a participação de um jogador em um chamado.
 */
export type Participation = {
  id: string;               // ID da participação (gerado automaticamente)
  callId: string;           // ID do chamado ao qual o jogador pertence
  playerId: string;         // ID do jogador
  role: 'owner' | 'member'; // O papel do jogador (dono ou membro)
  joinedAt: Date;           // Data em que o jogador entrou no chamado
  leftAt?: Date;            // Data em que o jogador saiu (caso tenha saído)
  result?: 'win' | 'loss' | 'draw';  // Resultado do chamado (se for um jogo competitivo)
};
