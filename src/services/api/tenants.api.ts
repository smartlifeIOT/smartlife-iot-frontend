import apiClient from '@/lib/axios';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export interface TenantConfiguration {
  maxDevices?: number;
  maxUsers?: number;
  maxAssets?: number;
  maxDashboards?: number;
  maxRuleChains?: number;
  dataRetentionDays?: number;
  features?: string[];
}

export interface Tenant {
  id: string;
  name: string;
  title: string;
  description?: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  zip?: string;
  status: TenantStatus;
  configuration?: TenantConfiguration;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantQuery {
  search?: string;
  status?: TenantStatus;
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

export const tenantsApi = {
  // Get all tenants
  getAll: (params?: TenantQuery) =>
    apiClient.get<PaginatedResponse<Tenant>>('/tenants', { params }),

  // Get tenant by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Tenant>>(`/tenants/${id}`),

  // Create tenant
  create: (data: Partial<Tenant>) =>
    apiClient.post<ApiResponse<Tenant>>('/tenants', data),

  // Update tenant
  update: (id: string, data: Partial<Tenant>) =>
    apiClient.patch<ApiResponse<Tenant>>(`/tenants/${id}`, data),

  // Delete tenant
  delete: (id: string) => apiClient.delete(`/tenants/${id}`),

  // Get tenant statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/tenants/statistics'),

  // Get tenant users
  getUsers: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/tenants/${id}/users`),

  // Get tenant devices
  getDevices: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/tenants/${id}/devices`),

  // Update tenant status
  updateStatus: (id: string, status: TenantStatus) =>
    apiClient.patch<ApiResponse<Tenant>>(`/tenants/${id}/status`, { status }),

  // Update tenant configuration
  updateConfiguration: (id: string, config: TenantConfiguration) =>
    apiClient.patch<ApiResponse<Tenant>>(`/tenants/${id}/configuration`, {
      configuration: config,
    }),

  // Get tenant limits
  getLimits: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/tenants/${id}/limits`),

  // Get tenant usage
  getUsage: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/tenants/${id}/usage`),
};