import apiClient from '@/lib/axios';

export enum NodeType {
  FILTER = 'filter',
  TRANSFORMATION = 'transformation',
  ENRICHMENT = 'enrichment',
  ACTION = 'action',
}

export interface NodeConfiguration {
  script?: string;
  messageTypes?: string[];
  originatorTypes?: string[];
  dataKeyMapping?: Record<string, string>;
  conversions?: Array<{ key: string; from: string; to: string }>;
  actionType?: string;
  [key: string]: any;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  description?: string;
  configuration: NodeConfiguration;
  position?: NodePosition;
  enabled: boolean;
  userId: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NodeQuery {
  search?: string;
  type?: NodeType;
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

export const nodesApi = {
  // Get all nodes
  getAll: (params?: NodeQuery) =>
    apiClient.get<PaginatedResponse<Node>>('/nodes', { params }),

  // Get node by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Node>>(`/nodes/${id}`),

  // Create node
  create: (data: Partial<Node>) =>
    apiClient.post<ApiResponse<Node>>('/nodes', data),

  // Update node
  update: (id: string, data: Partial<Node>) =>
    apiClient.patch<ApiResponse<Node>>(`/nodes/${id}`, data),

  // Delete node
  delete: (id: string) => apiClient.delete(`/nodes/${id}`),

  // Toggle node
  toggle: (id: string) =>
    apiClient.post<ApiResponse<Node>>(`/nodes/${id}/toggle`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/nodes/statistics'),

  // Get nodes by type
  getByType: (type: NodeType) =>
    apiClient.get<ApiResponse<Node[]>>(`/nodes/type/${type}`),

  // Test node
  test: (id: string, testData: any) =>
    apiClient.post<ApiResponse<any>>(`/nodes/${id}/test`, { data: testData }),

  // Get rule chain
  getRuleChain: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/nodes/rule-chain/${id}`),

  // Clone node
  clone: (id: string) =>
    apiClient.post<ApiResponse<Node>>(`/nodes/${id}/clone`),
};