import { NOTIFICATIONS_COLLECTION } from '../../models/Notification.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { fromDoc, now } from './_firestoreConverter.js';
import { randomUUID } from 'node:crypto';
export class NotificationRepositoryFirebase {
    col = adminDb.collection(NOTIFICATIONS_COLLECTION);
    async create(notification) {
        const id = randomUUID();
        const createdNotification = {
            ...notification,
            id,
            createdAt: now(),
        };
        await this.col.doc(id).set(createdNotification);
        return createdNotification;
    }
    async listByRecipient(recipientUid, limit = 50) {
        const snap = await this.col
            .where('recipientUid', '==', recipientUid)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return snap.docs.map(doc => fromDoc(doc.data()));
    }
    async markAsRead(notificationId, recipientUid) {
        const docRef = this.col.doc(notificationId);
        const doc = await docRef.get();
        if (!doc.exists)
            throw new Error('notification_not_found');
        const notification = fromDoc(doc.data());
        if (notification.recipientUid !== recipientUid)
            throw new Error('forbidden');
        await docRef.update({ read: true });
    }
    async delete(notificationId, recipientUid) {
        const docRef = this.col.doc(notificationId);
        const doc = await docRef.get();
        if (!doc.exists)
            throw new Error('notification_not_found');
        const notification = fromDoc(doc.data());
        if (notification.recipientUid !== recipientUid)
            throw new Error('forbidden');
        await docRef.delete();
    }
}
