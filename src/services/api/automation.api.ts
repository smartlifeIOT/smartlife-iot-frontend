import apiClient from '@/lib/axios';
import { Automation } from '@/features/automation/types';

export enum TriggerType {
  THRESHOLD = 'threshold',
  SCHEDULE = 'schedule',
  DEVICE_STATE = 'device_state',
  ATTRIBUTE_CHANGE = 'attribute_change',
}

export enum ActionType {
  NOTIFICATION = 'notification',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  DEVICE_COMMAND = 'device_command',
  ATTRIBUTE_UPDATE = 'attribute_update',
}

export interface AutomationTrigger {
  type: TriggerType;
  device?: string;
  attribute?: string;
  operator?: '>' | '<' | '=' | '>=' | '<=' | '!=';
  value?: any;
  schedule?: string; // cron expression
}

export interface AutomationAction {
  type: ActionType;
  target?: string;
  command?: string;
  message?: string;
  url?: string;
  method?: string;
  body?: any;
}

export interface AutomationQuery {
  search?: string;
  enabled?: boolean;
  type?: TriggerType;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  message: string;
  data: {
    data: T;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AutomationStatistics {
  data: {
    total: number;
    active: number;
    totalExecutions: number;
    error: number;
  };
}

export const automationApi = {
  // Get all automations
  getAll: (params?: AutomationQuery) =>
    apiClient.get<ApiResponse<Automation[]>>('/automations', {
      params,
    }),

  // Get automation by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Automation>>(`/automation/${id}`),

  // Create automation
  create: (data: Partial<Automation>) =>
    apiClient.post<ApiResponse<Automation>>('/automations', data),

  // Update automation
  update: (id: string, data: Partial<Automation>) =>
    apiClient.patch<ApiResponse<Automation>>(`/automation/${id}`, data),

  // Delete automation
  delete: (id: string) => apiClient.delete(`/automations/${id}`),

  // Toggle automation
  toggle: (id: string) =>
    apiClient.post<ApiResponse<Automation>>(`/automation/${id}/toggle`),

  // Execute automation manually
  execute: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/automation/${id}/execute`),

  // Get execution history
  getHistory: (id: string, page?: number, limit?: number) =>
    apiClient.get<ApiResponse<any[]>>(`/automation/${id}/history`, {
      params: { page, limit },
    }),

  // Get statistics
  getStatistics: () =>
    apiClient.get<AutomationStatistics>('/automations/statistics'),

  // Bulk enable/disable
  bulkToggle: (ids: string[], enabled: boolean) =>
    apiClient.post<ApiResponse<any>>('/automation/bulk/toggle', {
      ids,
      enabled,
    }),

  // Test automation
  test: (data: Partial<Automation>) =>
    apiClient.post<ApiResponse<any>>('/automation/test', data),
};
