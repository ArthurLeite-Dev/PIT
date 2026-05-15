// src/services/NotificationService.ts
import { INotificationRepository } from '../interfaces/INotificationRepository.js';
import { Notification } from '../models/Notification.js';

export class NotificationService {
  constructor(private readonly repo: INotificationRepository) {}

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    if (!notification.recipientUid) throw new Error('missing_recipientUid');
    if (!notification.message) throw new Error('missing_message');
    return this.repo.create(notification);
  }

  async listByRecipient(recipientUid: string, limit?: number): Promise<Notification[]> {
    if (!recipientUid) throw new Error('missing_recipientUid');
    return this.repo.listByRecipient(recipientUid, limit);
  }

  async markAsRead(notificationId: string, recipientUid: string): Promise<void> {
    if (!notificationId) throw new Error('missing_notificationId');
    if (!recipientUid) throw new Error('missing_recipientUid');
    await this.repo.markAsRead(notificationId, recipientUid);
  }

  async delete(notificationId: string, recipientUid: string): Promise<void> {
    if (!notificationId) throw new Error('missing_notificationId');
    if (!recipientUid) throw new Error('missing_recipientUid');
    await this.repo.delete(notificationId, recipientUid);
  }
}
