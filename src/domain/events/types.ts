// src/domain/events/types.ts

/**
 * Interface base para eventos de domínio.
 * Define a estrutura mínima que todos os eventos devem ter.
 */
export interface Event {
  readonly type: string;
  readonly timestamp: Date;
}

/**
 * Evento disparado quando uma solicitação de amizade é criada
 */
export interface FriendRequestCreatedEvent extends Event {
  readonly type: 'FriendRequestCreated';
  readonly fromUid: string;
  readonly toUid: string;
}

/**
 * Evento disparado quando um chamado LFG é criado
 */
export interface CallCreatedEvent extends Event {
  readonly type: 'CallCreated';
  readonly callId: string;
  readonly ownerUid: string;
  readonly gameId: string;
  readonly platform: string;
}

/**
 * Evento disparado quando um jogador entra em um chamado
 */
export interface CallJoinedEvent extends Event {
  readonly type: 'CallJoined';
  readonly callId: string;
  readonly joinerUid: string;
  readonly ownerUid: string;
}

/**
 * Evento disparado quando um jogador é bloqueado/denunciado
 */
export interface BlockCreatedEvent extends Event {
  readonly type: 'BlockCreated';
  readonly reporterUid: string;
  readonly reportedUid: string;
  readonly reason?: string;
}

/**
 * Union type de todos os eventos do sistema
 */
export type DomainEvent =
  | FriendRequestCreatedEvent
  | CallCreatedEvent
  | CallJoinedEvent
  | BlockCreatedEvent;

/**
 * Helper para criar eventos com timestamp automático
 */
export function createEvent<T extends Event>(
  type: T['type'],
  data: Omit<T, 'type' | 'timestamp'>
): T {
  return {
    type: type as any,
    timestamp: new Date(),
    ...data,
  } as T;
}

/**
 * Helpers específicos para cada tipo de evento
 */
export function createFriendRequestCreatedEvent(data: { fromUid: string; toUid: string }): FriendRequestCreatedEvent {
  return createEvent<FriendRequestCreatedEvent>('FriendRequestCreated', data);
}

export function createCallCreatedEvent(data: { callId: string; ownerUid: string; gameId: string; platform: string }): CallCreatedEvent {
  return createEvent<CallCreatedEvent>('CallCreated', data);
}

export function createCallJoinedEvent(data: { callId: string; joinerUid: string; ownerUid: string }): CallJoinedEvent {
  return createEvent<CallJoinedEvent>('CallJoined', data);
}

export function createBlockCreatedEvent(data: { reporterUid: string; reportedUid: string; reason?: string }): BlockCreatedEvent {
  return createEvent<BlockCreatedEvent>('BlockCreated', data);
}

