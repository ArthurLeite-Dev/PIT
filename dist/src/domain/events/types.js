// src/domain/events/types.ts
/**
 * Helper para criar eventos com timestamp automático
 */
export function createEvent(type, data) {
    return {
        type: type,
        timestamp: new Date(),
        ...data,
    };
}
/**
 * Helpers específicos para cada tipo de evento
 */
export function createFriendRequestCreatedEvent(data) {
    return createEvent('FriendRequestCreated', data);
}
export function createCallCreatedEvent(data) {
    return createEvent('CallCreated', data);
}
export function createCallJoinedEvent(data) {
    return createEvent('CallJoined', data);
}
export function createBlockCreatedEvent(data) {
    return createEvent('BlockCreated', data);
}
