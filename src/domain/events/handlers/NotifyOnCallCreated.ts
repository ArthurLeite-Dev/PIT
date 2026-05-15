// src/domain/events/handlers/NotifyOnCallCreated.ts
import { NotificationService } from '../../../services/NotificationService.js';
import { RepositoryFactory } from '../../../repositories/factory/RepositoryFactory.js';
import type { CallCreatedEvent } from '../types.js';

/**
 * Handler de evento Observer que cria notificação quando um chamado é criado.
 * Pode ser estendido para notificar jogadores similares.
 * Implementa o padrão Observer.
 */
export class NotifyOnCallCreated {
  private notificationService: NotificationService;

  constructor(notificationService?: NotificationService) {
    this.notificationService = notificationService || new NotificationService(
      RepositoryFactory.createNotificationRepository()
    );
  }

  /**
   * Handler para evento de chamado criado
   * Por enquanto apenas loga, mas pode ser estendido para notificar jogadores relevantes
   */
  async handle(event: CallCreatedEvent): Promise<void> {
    try {
      // Por enquanto apenas loga. Futuramente pode notificar jogadores interessados no mesmo jogo
      console.log(`[NotifyOnCallCreated] Chamado ${event.callId} criado para ${event.gameId} em ${event.platform}`);
    } catch (error) {
      console.error('[NotifyOnCallCreated] Erro:', error);
    }
  }
}

