import apiClient from '@/lib/axios';

export enum ResourceType {
  DASHBOARD = 'dashboard',
  DEVICE = 'device',
  ASSET = 'asset',
  WIDGET = 'widget',
}

export enum ShareType {
  EMAIL = 'email',
  LINK = 'link',
  PUBLIC = 'public',
}

export enum AccessLevel {
  VIEW = 'view',
  EDIT = 'edit',
  ADMIN = 'admin',
}

export interface Share {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  shareType: ShareType;
  sharedWith?: string; // email or user ID
  accessLevel: AccessLevel;
  expiresAt?: string;
  isPublic: boolean;
  token?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareQuery {
  resourceType?: ResourceType;
  shareType?: ShareType;
  accessLevel?: AccessLevel;
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

export const sharingApi = {
  // Get all shares (created by user)
  getAll: (params?: ShareQuery) =>
    apiClient.get<PaginatedResponse<Share>>('/sharing', { params }),

  // Get shared with me
  getSharedWithMe: (params?: ShareQuery) =>
    apiClient.get<PaginatedResponse<Share>>('/sharing/shared-with-me', {
      params,
    }),

  // Get share by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Share>>(`/sharing/${id}`),

  // Create share
  create: (data: Partial<Share>) =>
    apiClient.post<ApiResponse<Share>>('/sharing', data),

  // Update share
  update: (id: string, data: Partial<Share>) =>
    apiClient.patch<ApiResponse<Share>>(`/sharing/${id}`, data),

  // Delete share
  delete: (id: string) => apiClient.delete(`/sharing/${id}`),

  // Get share by token
  getByToken: (token: string) =>
    apiClient.get<ApiResponse<Share>>(`/sharing/token/${token}`),

  // Get shares for resource
  getByResource: (resourceType: ResourceType, resourceId: string) =>
    apiClient.get<ApiResponse<Share[]>>(
      `/sharing/${resourceType}/${resourceId}`
    ),

  // Revoke share
  revoke: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/sharing/${id}/revoke`),

  // Accept share
  accept: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/sharing/${id}/accept`),

  // Reject share
  reject: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/sharing/${id}/reject`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/sharing/statistics'),

  // Generate share link
  generateLink: (resourceType: ResourceType, resourceId: string) =>
    apiClient.post<ApiResponse<{ token: string; url: string }>>(
      '/sharing/generate-link',
      { resourceType, resourceId }
    ),
};