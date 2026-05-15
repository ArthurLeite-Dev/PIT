// src/bootstrap/events.ts
import { EventBus } from '../domain/events/EventBus.js';
import { NotifyOnFriendRequest } from '../domain/events/handlers/NotifyOnFriendRequest.js';
import { NotifyOnCallJoined } from '../domain/events/handlers/NotifyOnCallJoined.js';
import { NotifyOnCallCreated } from '../domain/events/handlers/NotifyOnCallCreated.js';

/**
 * Registra todos os event handlers na inicialização da aplicação.
 * Implementa o padrão Observer via assinaturas de eventos.
 */
export function registerEventHandlers(): void {
  const eventBus = EventBus.getInstance();

  // Handler para notificar quando uma solicitação de amizade é criada
  const notifyOnFriendRequest = new NotifyOnFriendRequest();
  eventBus.subscribe('FriendRequestCreated', (event) => notifyOnFriendRequest.handle(event));

  // Handler para notificar quando alguém entra em um chamado
  const notifyOnCallJoined = new NotifyOnCallJoined();
  eventBus.subscribe('CallJoined', (event) => notifyOnCallJoined.handle(event));

  // Handler para quando um chamado é criado
  const notifyOnCallCreated = new NotifyOnCallCreated();
  eventBus.subscribe('CallCreated', (event) => notifyOnCallCreated.handle(event));

  console.log('✅ Event handlers registrados');
}

