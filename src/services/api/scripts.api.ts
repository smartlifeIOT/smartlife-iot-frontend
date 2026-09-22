import apiClient from '@/lib/axios';

export enum ScriptType {
  FUNCTION = 'function',
  FILTER = 'filter',
  PROCESSOR = 'processor',
  VALIDATOR = 'validator',
}

export enum ScriptLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
}

export interface Script {
  id: string;
  name: string;
  description?: string;
  type: ScriptType;
  language: ScriptLanguage;
  code: string;
  parameters?: Record<string, any>;
  isPublic: boolean;
  version: string;
  userId: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptQuery {
  search?: string;
  type?: ScriptType;
  language?: ScriptLanguage;
  isPublic?: boolean;
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

export const scriptsApi = {
  // Get all scripts
  getAll: (params?: ScriptQuery) =>
    apiClient.get<PaginatedResponse<Script>>('/scripts', { params }),

  // Get script by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Script>>(`/scripts/${id}`),

  // Create script
  create: (data: Partial<Script>) =>
    apiClient.post<ApiResponse<Script>>('/scripts', data),

  // Update script
  update: (id: string, data: Partial<Script>) =>
    apiClient.patch<ApiResponse<Script>>(`/scripts/${id}`, data),

  // Delete script
  delete: (id: string) => apiClient.delete(`/scripts/${id}`),

  // Test script
  test: (id: string, testData: any) =>
    apiClient.post<ApiResponse<any>>(`/scripts/${id}/test`, {
      data: testData,
    }),

  // Execute script
  execute: (id: string, params?: any) =>
    apiClient.post<ApiResponse<any>>(`/scripts/${id}/execute`, { params }),

  // Get script versions
  getVersions: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/scripts/${id}/versions`),

  // Clone script
  clone: (id: string, newName: string) =>
    apiClient.post<ApiResponse<Script>>(`/scripts/${id}/clone`, {
      name: newName,
    }),

  // Validate script
  validate: (code: string, language: ScriptLanguage) =>
    apiClient.post<ApiResponse<{ valid: boolean; errors?: string[] }>>(
      '/scripts/validate',
      { code, language }
    ),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/scripts/statistics'),

  // Get by type
  getByType: (type: ScriptType) =>
    apiClient.get<ApiResponse<Script[]>>(`/scripts/type/${type}`),
};