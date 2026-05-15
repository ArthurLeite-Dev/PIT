// src/models/Call.ts

/** Nome da coleção no Firestore */
export const CALLS_COLLECTION = 'calls' as const;

/**
 * Estrutura do chamado (LFG).
 * Armazena dados do chamado, como dono, participantes e status.
 */
export type Call = {
  id: string;                  // ID do chamado (gerado automaticamente)
  ownerUid: string;            // ID do usuário dono do chamado
  title: string;               // Título do chamado (ex: "Ranked Duo")
  description?: string;         // Descrição opcional do chamado
  gameId: string;              // ID do jogo (ex: "valorant")
  platform: string;            // Plataforma (ex: "pc", "playstation")
  participants: string[];      // IDs dos participantes (inclui o dono)
  status: 'open' | 'closed';   // Status do chamado (aberto ou fechado)
  callFriendly: 'friendly' | 'competitive'; // Tipo de chamado (amigável ou competitivo)
  playstyles: string[];        // Estilos de jogo (ex: ["competitive", "fps"])
  createdAt: Date;             // Data de criação
  updatedAt: Date;             // Data de última atualização
};
