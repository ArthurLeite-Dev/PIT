export class NotificationService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(notification) {
        if (!notification.recipientUid)
            throw new Error('missing_recipientUid');
        if (!notification.message)
            throw new Error('missing_message');
        return this.repo.create(notification);
    }
    async listByRecipient(recipientUid, limit) {
        if (!recipientUid)
            throw new Error('missing_recipientUid');
        return this.repo.listByRecipient(recipientUid, limit);
    }
    async markAsRead(notificationId, recipientUid) {
        if (!notificationId)
            throw new Error('missing_notificationId');
        if (!recipientUid)
            throw new Error('missing_recipientUid');
        await this.repo.markAsRead(notificationId, recipientUid);
    }
    async delete(notificationId, recipientUid) {
        if (!notificationId)
            throw new Error('missing_notificationId');
        if (!recipientUid)
            throw new Error('missing_recipientUid');
        await this.repo.delete(notificationId, recipientUid);
    }
}
