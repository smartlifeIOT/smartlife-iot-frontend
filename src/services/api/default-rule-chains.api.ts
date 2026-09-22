import apiClient from '@/lib/axios.ts';

export interface DefaultRuleChain {
  id: string;
  name: string;
  description?: string;
  type: 'DEVICE' | 'ASSET' | 'EDGE';
  ruleChainId: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DefaultRuleChainQuery {
  search?: string;
  type?: 'DEVICE' | 'ASSET' | 'EDGE';
  tenantId?: string;
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

export const defaultRuleChainsApi = {
  // Get all default rule chains
  getAll: (params?: DefaultRuleChainQuery) =>
    apiClient.get<PaginatedResponse<DefaultRuleChain>>('/default-rule-chains', {
      params,
    }),

  // Get default rule chain by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<DefaultRuleChain>>(`/default-rule-chains/${id}`),

  // Create default rule chain
  create: (data: Partial<DefaultRuleChain>) =>
    apiClient.post<ApiResponse<DefaultRuleChain>>('/default-rule-chains', data),

  // Update default rule chain
  update: (id: string, data: Partial<DefaultRuleChain>) =>
    apiClient.patch<ApiResponse<DefaultRuleChain>>(
      `/default-rule-chains/${id}`,
      data
    ),

  // Delete default rule chain
  delete: (id: string) => apiClient.delete(`/default-rule-chains/${id}`),

  // Get default rule chain by type
  getByType: (type: 'DEVICE' | 'ASSET' | 'EDGE') =>
    apiClient.get<ApiResponse<DefaultRuleChain>>(
      `/default-rule-chains/type/${type}`
    ),

  // Set default rule chain for type
  setDefault: (type: 'DEVICE' | 'ASSET' | 'EDGE', ruleChainId: string) =>
    apiClient.post<ApiResponse<DefaultRuleChain>>(
      `/default-rule-chains/type/${type}`,
      { ruleChainId }
    ),
};
