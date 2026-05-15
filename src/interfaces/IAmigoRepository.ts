// src/interfaces/IAmigoRepository.ts

/**
 * Interface para o repositório de amizade.
 * Manipula as operações de adicionar, remover e listar amigos.
 */
export interface IAmigoRepository {
  /** Adiciona um jogador como amigo (cria uma relação de amizade) */
  addFriend(playerUid: string, friendUid: string): Promise<void>;

  /** Remove um amigo */
  removeFriend(playerUid: string, friendUid: string): Promise<void>;

  /** Lista todos os amigos de um jogador */
  listFriends(playerUid: string): Promise<string[]>;

  /** Lista todas as solicitações de amizade pendentes */
  listPendingRequests(playerUid: string): Promise<string[]>;

  /** Aceita uma solicitação de amizade */
  acceptRequest(playerUid: string, friendUid: string): Promise<void>;

  /** Rejeita uma solicitação de amizade */
  rejectRequest(playerUid: string, friendUid: string): Promise<void>;
}
