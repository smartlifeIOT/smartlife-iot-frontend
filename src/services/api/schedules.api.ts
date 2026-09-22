import apiClient from '@/lib/axios';

export enum ScheduleType {
  CRON = 'cron',
  INTERVAL = 'interval',
  ONE_TIME = 'one_time',
}

export interface ScheduleAction {
  type: string;
  target?: string;
  command?: string;
  params?: any;
}

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  type: ScheduleType;
  cronExpression?: string;
  intervalMs?: number;
  executeAt?: string;
  action: ScheduleAction;
  enabled: boolean;
  lastExecuted?: string;
  nextExecution?: string;
  executionCount: number;
  userId: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleQuery {
  search?: string;
  type?: ScheduleType;
  enabled?: boolean;
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

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const schedulesApi = {
  // Get all schedules
  getAll: (params?: ScheduleQuery) =>
    apiClient.get<PaginatedResponse<Schedule>>('/schedules', { params }),

  // Get all schedules statistics
  getAllStatistics: () =>
    apiClient.get<PaginatedResponse<Schedule>>('/schedules/statistics'),

  // Get schedule by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Schedule>>(`/schedules/${id}`),

  // Create schedule
  create: (data: Partial<Schedule>) =>
    apiClient.post<ApiResponse<Schedule>>('/schedules', data),

  // Update schedule
  update: (id: string, data: Partial<Schedule>) =>
    apiClient.patch<ApiResponse<Schedule>>(`/schedules/${id}`, data),

  // Delete schedule
  delete: (id: string) => apiClient.delete(`/schedules/${id}`),

  // Toggle schedule
  toggle: (id: string) =>
    apiClient.post<ApiResponse<Schedule>>(`/schedules/${id}/toggle`),

  // Execute schedule manually
  execute: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/schedules/${id}/execute`),

  // Get execution history
  getHistory: (id: string, page?: number, limit?: number) =>
    apiClient.get<PaginatedResponse<any>>(`/schedules/${id}/history`, {
      params: { page, limit },
    }),

  // Get statistics
  getStatistics: () => apiClient.get<ApiResponse<any>>('/schedules/statistics'),

  // Validate cron expression
  validateCron: (expression: string) =>
    apiClient.post<ApiResponse<{ valid: boolean; nextExecutions: string[] }>>(
      '/schedules/validate-cron',
      { expression }
    ),

  // Get upcoming executions
  getUpcoming: (limit?: number) =>
    apiClient.get<ApiResponse<Schedule[]>>('/schedules/upcoming', {
      params: { limit },
    }),
};
