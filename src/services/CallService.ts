// src/services/CallService.ts
import { ICallRepository, CreateCallInput, Call } from '../repositories/firebase/CallRepositoryFirebase.js';
import { ListOpenFilters } from '../interfaces/ICallRepository.js';
import { EventBus } from '../domain/events/EventBus.js';
import { createCallCreatedEvent, createCallJoinedEvent } from '../domain/events/types.js';

export class CallService {
  constructor(private readonly repo: ICallRepository) {}

  /** Cria um novo chamado com validações */
  async create(input: CreateCallInput): Promise<Call> {
    if (!input?.ownerUid) throw new Error('missing_ownerUid');
    if (!input.title || input.title.trim().length < 3) throw new Error('invalid_title');
    if (!input.gameId) throw new Error('invalid_gameId');
    if (!input.platform) throw new Error('invalid_platform');

    const payload: CreateCallInput = {
      ownerUid: input.ownerUid,
      title: input.title.trim(),
      description: input.description?.trim(),
      gameId: String(input.gameId).trim().toLowerCase(),
      platform: String(input.platform).trim().toLowerCase(),
      callFriendly: input.callFriendly,
      playstyles: input.playstyles,
    };

    const call = await this.repo.create(payload);

    // Observer Pattern: Publica evento
    const event = createCallCreatedEvent({
      callId: call.id,
      ownerUid: call.ownerUid,
      gameId: call.gameId,
      platform: call.platform,
    });
    EventBus.getInstance().publish('CallCreated', event).catch(err => 
      console.error('[CallService] Erro ao publicar evento CallCreated:', err)
    );

    return call;
  }

  /** Lista chamados abertos (máximo de 20 por vez, por padrão) */
  async listOpen(limit = 20, filters?: ListOpenFilters): Promise<Call[]> {
    if (limit <= 0) limit = 20;
    if (limit > 100) limit = 100; // limite de segurança
    return this.repo.listOpen(limit, filters);
  }

  /** Obtém um chamado por ID */
  async getById(id: string): Promise<Call | null> {
    if (!id) throw new Error('missing_call_id');
    return this.repo.getById(id);
  }

  /** Busca o chamado ativo do usuário (se está participando) */
  async getActiveCallByUser(uid: string): Promise<Call | null> {
    if (!uid) throw new Error('missing_uid');
    return this.repo.getActiveCallByUser(uid);
  }

  /** Entra em um chamado existente */
  async join(callId: string, uid: string): Promise<Call> {
    // Verifica se o usuário já está em outro chamado
    const activeCall = await this.getActiveCallByUser(uid);
    if (activeCall && activeCall.id !== callId) {
      throw new Error('user_already_in_call');
    }
    
    if (!callId) throw new Error('missing_call_id');
    if (!uid) throw new Error('missing_uid');
    
    const call = await this.repo.join(callId, uid);

    // Observer Pattern: Publica evento
    const event = createCallJoinedEvent({
      callId: call.id,
      joinerUid: uid,
      ownerUid: call.ownerUid,
    });
    EventBus.getInstance().publish('CallJoined', event).catch(err => 
      console.error('[CallService] Erro ao publicar evento CallJoined:', err)
    );

    return call;
  }

  /** Fecha um chamado (somente o dono pode fechar) */
  async close(callId: string, ownerUid: string): Promise<Call> {
    if (!callId) throw new Error('missing_call_id');
    if (!ownerUid) throw new Error('missing_ownerUid');
    return this.repo.close(callId, ownerUid);
  }

  /** Remove um participante do chamado (somente o dono pode remover) */
  async removeParticipant(callId: string, participantUid: string): Promise<Call> {
    if (!callId) throw new Error('missing_call_id');
    if (!participantUid) throw new Error('missing_participantUid');
    return this.repo.removeParticipant(callId, participantUid);
  }

  /** Usuário sai do chamado por conta própria */
  async leave(callId: string, uid: string): Promise<Call> {
    if (!callId) throw new Error('missing_call_id');
    if (!uid) throw new Error('missing_uid');
    
    // Verifica se o usuário está no chamado
    const call = await this.repo.getById(callId);
    if (!call) throw new Error('call_not_found');
    if (!call.participants.includes(uid)) throw new Error('user_not_in_call');
    
    // Remove o usuário
    return this.repo.removeParticipant(callId, uid);
  }
}
