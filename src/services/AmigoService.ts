// src/services/AmigoService.ts
import { IAmigoRepository } from '../interfaces/IAmigoRepository.js';
import { EventBus } from '../domain/events/EventBus.js';
import { createFriendRequestCreatedEvent } from '../domain/events/types.js';

export class AmigoService {
  constructor(private readonly repo: IAmigoRepository) {}

  /** Adiciona um amigo (envia solicitação) */
  async addFriend(playerUid: string, friendUid: string): Promise<void> {
    if (!playerUid) throw new Error('missing_playerUid');
    if (!friendUid) throw new Error('missing_friendUid');
    if (playerUid === friendUid) throw new Error('cannot_add_self_as_friend');

    await this.repo.addFriend(playerUid, friendUid);

    // Observer Pattern: Publica evento
    const event = createFriendRequestCreatedEvent({ fromUid: playerUid, toUid: friendUid });
    EventBus.getInstance().publish('FriendRequestCreated', event).catch(err => 
      console.error('[AmigoService] Erro ao publicar evento FriendRequestCreated:', err)
    );
  }

  /** Remove um amigo */
  async removeFriend(playerUid: string, friendUid: string): Promise<void> {
    if (!playerUid) throw new Error('missing_playerUid');
    if (!friendUid) throw new Error('missing_friendUid');

    await this.repo.removeFriend(playerUid, friendUid);
  }

  /** Lista amigos aceitos */
  async listFriends(playerUid: string): Promise<string[]> {
    if (!playerUid) throw new Error('missing_playerUid');
    return this.repo.listFriends(playerUid);
  }

  /** Lista solicitações pendentes recebidas */
  async listPendingRequests(playerUid: string): Promise<string[]> {
    if (!playerUid) throw new Error('missing_playerUid');
    return this.repo.listPendingRequests(playerUid);
  }

  /** Aceita uma solicitação de amizade */
  async acceptRequest(playerUid: string, friendUid: string): Promise<void> {
    if (!playerUid) throw new Error('missing_playerUid');
    if (!friendUid) throw new Error('missing_friendUid');

    await this.repo.acceptRequest(playerUid, friendUid);
  }

  /** Rejeita uma solicitação de amizade */
  async rejectRequest(playerUid: string, friendUid: string): Promise<void> {
    if (!playerUid) throw new Error('missing_playerUid');
    if (!friendUid) throw new Error('missing_friendUid');

    await this.repo.rejectRequest(playerUid, friendUid);
  }
}
