import apiClient from '@/lib/axios';
import {
  Edge,
  EdgeListParams,
  EdgeListResponse,
  EdgePayload,
} from './edge.types';

const BASE_URL = '/edge';

// Single object holding every endpoint related to Edge/Gateway resources.
// Add new endpoints here as the API grows — hooks below just call into this.
export const edgeService = {
  create: async (payload: EdgePayload): Promise<Edge> => {
    const { data } = await apiClient.post<Edge>(BASE_URL, payload);
    return data;
  },

  getAll: async (params?: EdgeListParams): Promise<EdgeListResponse> => {
    const { data } = await apiClient.get<EdgeListResponse>(BASE_URL, {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Edge> => {
    const { data } = await apiClient.get<Edge>(`${BASE_URL}/${id}`);
    return data;
  },

  update: async (id: string, payload: Partial<EdgePayload>): Promise<Edge> => {
    const { data } = await apiClient.put<Edge>(`${BASE_URL}/${id}`, payload);
    return data;
  },

  patch: async (id: string, payload: Partial<EdgePayload>): Promise<Edge> => {
    const { data } = await apiClient.patch<Edge>(`${BASE_URL}/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // Example of a nested/action endpoint you'll likely need for a gateway
  triggerSync: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean }>(
      `${BASE_URL}/${id}/sync`
    );
    return data;
  },
};
