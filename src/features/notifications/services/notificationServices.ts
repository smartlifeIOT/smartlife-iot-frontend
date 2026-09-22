import {
  notificationsApi,
  notificationTemplatesApi,
} from '@/services/api/index.ts';
import type {
  Notification,
  NotificationType,
  NotificationPriority,
} from '@/services/api/notifications.api.ts';

/**
 * Notifications Feature Service
 * Handles business logic for notification management
 */
export const notificationService = {
  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]) {
    await Promise.all(
      notificationIds.map((id) => notificationsApi.markAsRead(id))
    );

    return {
      marked: notificationIds.length,
      markedAt: new Date().toISOString(),
    };
  },

  /**
   * Get unread notifications with grouping
   */
  async getUnreadGrouped(userId?: string) {
    const unread = await notificationsApi.getAll({
      isRead: false,
      userId,
    });

    return unread.data.data.data;
  },

  /**
   * Get notifications by priority
   */
  async getByPriority(priority: NotificationPriority) {
    return notificationsApi.getAll({ priority });
  },

  /**
   * Send notification with template
   */
  async sendWithTemplate(
    templateId: string,
    userId: string,
    variables: Record<string, any>
  ) {
    const template = await notificationTemplatesApi.getById(templateId);

    // Replace variables in template
    let body = template.data.data.body;
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return notificationsApi.send({
      userId,
      type: template.data.data.type,
      title: template.data.data.subject || '',
      message: body,
    });
  },

  /**
   * Clean old notifications
   */
  // async cleanOldNotifications(daysOld: number = 30) {
  //   const cutoffDate = new Date();
  //   cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  //   const old = await notificationsApi.getAll({

  //     isRead: true,
  //   });

  //   // Access the nested data structure: BackendEnvelope<BackendEnvelope<PaginatedResponse<Notification>>>
  //   const oldNotifications = old.data.data;

  //   if (oldNotifications.length > 0) {
  //     await notificationsApi.bulkDelete(
  //       oldNotifications.map(n => n.id)
  //     );
  //   }

  //   return {
  //     deleted: oldNotifications.length,
  //     cutoffDate: cutoffDate.toISOString(),
  //   };
  // },

  /**
   * Get notification statistics
   */
  async getStatistics(userId?: string) {
    const [stats, unreadCount] = await Promise.all([
      notificationsApi.getStatistics(),
      notificationsApi.getUnreadCount(userId),
    ]);

    return {
      total: stats.data.data.total,
      unread: unreadCount.data.data.count,
      read: stats.data.data.read,
      byType: stats.data.data.byType,
      byPriority: stats.data.data.byPriority,
    };
  },

  /**
   * Batch send notifications
   */
  async batchSend(
    userIds: string[],
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      priority?: NotificationPriority;
    }
  ) {
    const results = await Promise.allSettled(
      userIds.map((userId) =>
        notificationsApi.send({ ...notification, userId })
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      total: userIds.length,
      successful,
      failed,
      sentAt: new Date().toISOString(),
    };
  },
};

/**
 * Notification Templates Feature Service
 */
export const templateService = {
  /**
   * Create template with validation
   */
  async createTemplate(template: {
    name: string;
    type: NotificationType;
    subject?: string;
    body: string;
    channels: Array<'EMAIL' | 'SMS' | 'IN_APP' | 'WEBHOOK'>;
  }) {
    // Validate template variables
    const variables = this.extractVariables(template.body);

    return notificationTemplatesApi.create({
      ...template,
      enabled: true,
      configuration: {
        variables,
      },
    });
  },

  /**
   * Extract variables from template
   */
  extractVariables(body: string): string[] {
    const regex = /{{(\w+)}}/g;
    const variables = [];
    let match;

    while ((match = regex.exec(body)) !== null) {
      variables.push(match[1]);
    }

    return [...new Set(variables)]; // Remove duplicates
  },

  /**
   * Test template with sample data
   */
  async testTemplate(templateId: string, sampleData: Record<string, any>) {
    return notificationTemplatesApi.test(templateId, sampleData);
  },

  /**
   * Clone template
   */
  async cloneTemplate(templateId: string, newName: string) {
    const original = await notificationTemplatesApi.getById(templateId);

    return notificationTemplatesApi.create({
      ...original.data.data,
      id: undefined,
      name: newName,
      createdAt: undefined,
      updatedAt: undefined,
    } as any);
  },
};
