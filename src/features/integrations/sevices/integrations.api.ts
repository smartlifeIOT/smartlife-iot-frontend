import apiClient from '@/lib/axios';

export enum IntegrationType {
  WEBHOOK = 'webhook',
  MQTT = 'mqtt',
  HTTP = 'http',
  KAFKA = 'kafka',
  AWS_IOT = 'aws_iot',
  AZURE_IOT = 'azure_iot',
  GOOGLE_CLOUD = 'google_cloud',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  TESTING = 'testing',
}

export interface IntegrationConfig {
  url?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  certificate?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface Integration {
  id: string;
  name: string;
  description?: string | null;
  type: IntegrationType | string;
  protocol?: string;
  config?: IntegrationConfig;
  configuration?: Record<string, any> | null;
  deviceFilter?: {
    deviceType?: string;
    [key: string]: any;
  } | null;
  dataFilter?: {
    keys?: string[];
    [key: string]: any;
  } | null;
  status: IntegrationStatus | string;
  enabled: boolean;
  messagesProcessed?: number;
  messagesSucceeded?: number;
  messagesFailed?: number;
  lastActivity?: string | null;
  lastSuccess?: string | null;
  lastFailure?: string | null;
  lastError?: string | null;
  consecutiveFailures?: number;
  errorHistory?: any;
  rateLimiting?: any;
  tags?: string[] | null;
  additionalInfo?: any;
  lastSync?: string;
  errorMessage?: string;
  userId?: string;
  tenantId?: string;
  customerId?: string | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntegrationQuery {
  search?: string;
  type?: IntegrationType;
  status?: IntegrationStatus;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
export interface IntegrationStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  byType?: {
    mqtt?: number;
    tuya?: number;
    cloud?: number;
    webhook?: number;
    [key: string]: number | undefined;
  };
}

export interface IntegrationTestResult {
  connected: boolean;
  message: string;
  deviceCount?: number;
  latencyMs?: number;
}

export interface IntegrationTestResponse {
  success: boolean;
  data: IntegrationTestResult;
  timestamp?: string;
}

export const integrationsApi = {
  // Get all integrations
  getAll: (params?: IntegrationQuery) =>
    apiClient.get<ApiResponse<PaginatedResponse<Integration>>>(
      '/integrations',
      { params }
    ),
  //get integration stats
  getStats: () =>
    apiClient.get<ApiResponse<IntegrationStats>>('/integrations/statistics'),
  // Get integration by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Integration>>(`/integrations/${id}`),

  // Create integration
  create: (data: Partial<Integration>) =>
    apiClient.post<ApiResponse<Integration>>('/integrations', data),

  // Update integration
  update: (id: string, data: Partial<Integration>) =>
    apiClient.patch<ApiResponse<Integration>>(`/integrations/${id}`, data),

  // Delete integration
  delete: (id: string) => apiClient.delete(`/integrations/${id}`),

  // Toggle integration
  toggle: (id: string) =>
    apiClient.post<ApiResponse<Integration>>(`/integrations/${id}/toggle`),

  // Test integration
  test: (id: string) =>
    apiClient.post<IntegrationTestResponse>(`/integrations/${id}/test`),

  // Sync integration
  sync: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/integrations/${id}/sync`),

  // Get integration logs
  getLogs: (id: string, page?: number, limit?: number) =>
    apiClient.get<PaginatedResponse<any>>(`/integrations/${id}/logs`, {
      params: { page, limit },
    }),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/integrations/statistics'),

  // Get by type
  getByType: (type: IntegrationType) =>
    apiClient.get<ApiResponse<Integration[]>>(`/integrations/type/${type}`),

  //get recent activity
  getRecentActivity: () =>
    apiClient.get<ApiResponse<any>>('/integrations/recent-activity'),
};
