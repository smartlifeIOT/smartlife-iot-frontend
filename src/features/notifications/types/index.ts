import type { Notification, NotificationType, NotificationPriority } from '@/services/api/notifications.api';

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
}

export type NotificationAction = 'mark-read' | 'delete' | 'view';