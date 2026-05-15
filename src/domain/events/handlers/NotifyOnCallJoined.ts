// src/domain/events/handlers/NotifyOnCallJoined.ts
import { NotificationService } from '../../../services/NotificationService.js';
import { RepositoryFactory } from '../../../repositories/factory/RepositoryFactory.js';
import type { CallJoinedEvent } from '../types.js';

/**
 * Handler de evento Observer que cria notificação quando um jogador entra em um chamado.
 * Implementa o padrão Observer.
 */
export class NotifyOnCallJoined {
  private notificationService: NotificationService;

  constructor(notificationService?: NotificationService) {
    this.notificationService = notificationService || new NotificationService(
      RepositoryFactory.createNotificationRepository()
    );
  }

  /**
   * Cria notificação para o dono do chamado quando alguém entra
   */
  async handle(event: CallJoinedEvent): Promise<void> {
    try {
      await this.notificationService.create({
        recipientUid: event.ownerUid,
        type: 'call_join',
        senderUid: event.joinerUid,
        callId: event.callId,
        message: `Alguém entrou no seu chamado`,
        read: false,
      });
    } catch (error) {
      console.error('[NotifyOnCallJoined] Erro ao criar notificação:', error);
      // Não relança o erro para não quebrar o fluxo principal
    }
  }
}

