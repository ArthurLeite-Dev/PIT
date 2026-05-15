// src/interfaces/INotificationRepository.ts
import { Notification } from '../models/Notification.js';

export interface INotificationRepository {
  create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  listByRecipient(recipientUid: string, limit?: number): Promise<Notification[]>;
  markAsRead(notificationId: string, recipientUid: string): Promise<void>;
  delete(notificationId: string, recipientUid: string): Promise<void>;
}
