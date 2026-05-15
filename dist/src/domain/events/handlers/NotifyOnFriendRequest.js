// src/domain/events/handlers/NotifyOnFriendRequest.ts
import { NotificationService } from '../../../services/NotificationService.js';
import { RepositoryFactory } from '../../../repositories/factory/RepositoryFactory.js';
/**
 * Handler de evento Observer que cria notificação quando uma solicitação de amizade é criada.
 * Implementa o padrão Observer.
 */
export class NotifyOnFriendRequest {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService || new NotificationService(RepositoryFactory.createNotificationRepository());
    }
    /**
     * Cria notificação quando uma solicitação de amizade é criada
     */
    async handle(event) {
        try {
            await this.notificationService.create({
                recipientUid: event.toUid,
                type: 'friend_request',
                senderUid: event.fromUid,
                message: `Você recebeu uma solicitação de amizade`,
                read: false,
            });
        }
        catch (error) {
            console.error('[NotifyOnFriendRequest] Erro ao criar notificação:', error);
            // Não relança o erro para não quebrar o fluxo principal
        }
    }
}
