import apiClient from '@/lib/axios.ts';

export interface Queue {
  id: string;
  name: string;
  description?: string;
  topic?: string;
  partitions?: number;
  consumerPerPartition?: boolean;
  pollInterval?: number;
  packProcessingTimeout?: number;
  maxPollRecords?: number;
  maxPollInterval?: number;
  maxRequestSize?: number;
  maxPendingMessages?: number;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueQuery {
  search?: string;
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

export const queuesApi = {
  // Get all queues
  getAll: (params?: QueueQuery) =>
    apiClient.get<PaginatedResponse<Queue>>('/queues', { params }),

  // Get queue by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Queue>>(`/queues/${id}`),

  // Create queue
  create: (data: Partial<Queue>) =>
    apiClient.post<ApiResponse<Queue>>('/queues', data),

  // Update queue
  update: (id: string, data: Partial<Queue>) =>
    apiClient.patch<ApiResponse<Queue>>(`/queues/${id}`, data),

  // Delete queue
  delete: (id: string) =>
    apiClient.delete(`/queues/${id}`),

  // Get queue statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/queues/statistics'),
};

