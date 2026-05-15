// src/models/Notification.ts
export const NOTIFICATIONS_COLLECTION = 'notifications' as const;

export type NotificationType = 'friend_request' | 'call_join' | 'call_leave' | 'call_open';

export interface Notification {
  id: string;                    // Unique notification ID
  recipientUid: string;          // User receiving the notification
  type: NotificationType;        // Type of notification
  senderUid?: string;            // User who triggered the notification (optional)
  callId?: string;               // Call ID if related to a call
  message: string;               // Human-readable message
  read: boolean;                 // Whether the notification has been read
  createdAt: Date;               // When the notification was created
  data?: Record<string, any>;    // Additional data (e.g., friend request details)
}
