import apiClient from '@/lib/axios.ts';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXECUTE = 'EXECUTE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export enum AuditEntityType {
  USER = 'USER',
  DEVICE = 'DEVICE',
  ASSET = 'ASSET',
  ALARM = 'ALARM',
  DASHBOARD = 'DASHBOARD',
  RULE = 'RULE',
  WIDGET = 'WIDGET',
  PROFILE = 'PROFILE',
  TENANT = 'TENANT',
  CUSTOMER = 'CUSTOMER',
  OTHER = 'OTHER',
}

export interface AuditLog {
  timestamp: any;
  description: any;
  status: any;
  title: any;
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityName?: string;
  userId?: string;
  userName?: string;
  tenantId?: string;
  customerId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface AuditQuery {
  search?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  tenantId?: string;
  customerId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
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

export const auditApi = {
  // Get all audit logs
  getAll: (params?: AuditQuery) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/audit', { params }),

  // Get audit log by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<AuditLog>>(`/audit/logs/${id}`),
  getByCustomerId: (customerId: string, page?: number, limit?: number) =>
    apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(`/audit`, {
      params: { customerId, page, limit },
    }),

  // Export audit logs
  export: (query: AuditQuery, format: 'CSV' | 'JSON' | 'EXCEL') =>
    apiClient.post<Blob>(
      '/audit/logs/export',
      { query, format },
      {
        responseType: 'blob',
      }
    ),

  // Get recent activity
  getRecentActivity: (limit: number = 10) =>
    apiClient.get<ApiResponse<AuditLog[]>>('/audit/activity/recent', {
      params: { limit },
    }),

  // Get user activity
  getUserActivity: (userId: string, startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse<AuditLog[]>>(`/audit/activity/user/${userId}`, {
      params: { startDate, endDate },
    }),

  // Get failed actions
  getFailedActions: (startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse<AuditLog[]>>('/audit/logs/failed', {
      params: { startDate, endDate },
    }),

  // Get action count by type
  getActionCount: (startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse<Record<AuditAction, number>>>(
      '/audit/actions/count',
      {
        params: { startDate, endDate },
      }
    ),

  // Get entity access logs
  getEntityAccessLogs: (entityType: AuditEntityType, entityId: string) =>
    apiClient.get<ApiResponse<AuditLog[]>>(
      `/audit/access/${entityType}/${entityId}`
    ),
};
