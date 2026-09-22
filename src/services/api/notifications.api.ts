import apiClient from '@/lib/axios.ts';
import { TemplateQuery } from '../../features/solution-templates/services/solution-templates.api';

export enum NotificationType {
  ALARM = 'ALARM',
  DEVICE = 'DEVICE',
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  RULE = 'RULE',
  OTHER = 'OTHER',
}

export enum NotificationPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  userId?: string;
  tenantId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
  readAt: string;
  isRead: boolean;
  endDate: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  body: string;
  enabled: boolean;
  channels: Array<'EMAIL' | 'SMS' | 'IN_APP' | 'WEBHOOK'>;
  configuration?: Record<string, any>;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQuery {
  search?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface PaginatedNotificationsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
  data: Notification[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
export interface BackendEnvelope<T> {
  data: T;
}
export const notificationsApi = {
  // Get all notifications
  // getAll: (params?: NotificationQuery) =>
  //   apiClient.get<PaginatedResponse<Notification>>('/notifications', { params }),

  getAll: (params?: NotificationQuery) =>
    apiClient.get<
      BackendEnvelope<BackendEnvelope<PaginatedNotificationsResponse>>
    >('/notifications', { params }),

  // Get notification by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`),

  // Create notification
  create: (data: Partial<Notification>) =>
    apiClient.post<ApiResponse<Notification>>('/notifications', data),

  // Update notification
  update: (id: string, data: Partial<Notification>) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}`, data),

  // Delete notification
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),

  // Mark as read
  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  // Mark as unread
  markAsUnread: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/unread`),

  // Mark all as read
  markAllAsRead: (userId?: string) =>
    apiClient.patch<ApiResponse<any>>('/notifications/read/all', { userId }),

  // Bulk delete
  bulkDelete: (notificationIds: string[]) =>
    apiClient.post<ApiResponse<any>>('/notifications/bulk/delete', {
      notificationIds,
    }),

  // Get unread count
  getUnreadCount: (userId?: string) =>
    apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread/count',
      {
        params: { userId },
      }
    ),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/notifications/statistics'),

  // Send notification
  send: (data: {
    userId?: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
  }) => apiClient.post<ApiResponse<Notification>>('/notifications/send', data),
};

// Notification Templates API
export const notificationTemplatesApi = {
  // Get all templates
  getAll: (params?: TemplateQuery) =>
    apiClient.get<PaginatedResponse<NotificationTemplate>>(
      '/notifications/templates',
      { params }
    ),

  // Get template by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<NotificationTemplate>>(
      `/notifications/templates/${id}`
    ),

  // Create template
  create: (data: Partial<NotificationTemplate>) =>
    apiClient.post<ApiResponse<NotificationTemplate>>(
      '/notifications/templates',
      data
    ),

  // Update template
  update: (id: string, data: Partial<NotificationTemplate>) =>
    apiClient.patch<ApiResponse<NotificationTemplate>>(
      `/notifications/templates/${id}`,
      data
    ),

  // Delete template
  delete: (id: string) => apiClient.delete(`/notifications/templates/${id}`),

  // Enable template
  enable: (id: string) =>
    apiClient.patch<ApiResponse<NotificationTemplate>>(
      `/notifications/templates/${id}/enable`
    ),

  // Disable template
  disable: (id: string) =>
    apiClient.patch<ApiResponse<NotificationTemplate>>(
      `/notifications/templates/${id}/disable`
    ),

  // Test template
  test: (id: string, testData?: any) =>
    apiClient.post<ApiResponse<any>>(
      `/notifications/templates/${id}/test`,
      testData
    ),
};
