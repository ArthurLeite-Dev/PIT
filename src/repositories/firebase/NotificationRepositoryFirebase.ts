// src/repositories/firebase/NotificationRepositoryFirebase.ts
import { INotificationRepository } from '../../interfaces/INotificationRepository.js';
import { Notification, NOTIFICATIONS_COLLECTION } from '../../models/Notification.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { fromDoc, now } from './_firestoreConverter.js';
import { randomUUID } from 'node:crypto';

export class NotificationRepositoryFirebase implements INotificationRepository {
  private col = adminDb.collection(NOTIFICATIONS_COLLECTION);

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const id = randomUUID();
    const createdNotification: Notification = {
      ...notification,
      id,
      createdAt: now(),
    };
    await this.col.doc(id).set(createdNotification);
    return createdNotification;
  }

  async listByRecipient(recipientUid: string, limit = 50): Promise<Notification[]> {
    const snap = await this.col
      .where('recipientUid', '==', recipientUid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(doc => fromDoc<Notification>(doc.data()));
  }

  async markAsRead(notificationId: string, recipientUid: string): Promise<void> {
    const docRef = this.col.doc(notificationId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error('notification_not_found');
    const notification = fromDoc<Notification>(doc.data());
    if (notification.recipientUid !== recipientUid) throw new Error('forbidden');
    await docRef.update({ read: true });
  }

  async delete(notificationId: string, recipientUid: string): Promise<void> {
    const docRef = this.col.doc(notificationId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error('notification_not_found');
    const notification = fromDoc<Notification>(doc.data());
    if (notification.recipientUid !== recipientUid) throw new Error('forbidden');
    await docRef.delete();
  }
}
