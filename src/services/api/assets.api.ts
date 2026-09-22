import apiClient from '@/lib/axios.ts';

export interface Asset {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
  tenantId?: string | null;
  customerId?: string | null;
  name: string;
  label?: string | null;
  type: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  imageUrl?: string | null;
  active?: boolean;
  assetProfileId?: string | null;
  parentAssetId?: string | null;
  parentAsset?: any | null;
  childrenCount?: number;
  deviceCount?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
  attributes?: any[] | Record<string, any>;
  tags?: any[] | null;
  additionalInfo?: Record<string, any> | null;
  maintenanceSchedule?: {
    frequency: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
  };
}

export interface AssetQuery {
  search?: string;
  type?: string;
  assetProfileId?: string;
  parentId?: string;
  tenantId?: string;
  customerId?: string;
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
    totalItems: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const assetsApi = {
  // Get all assets
  getAll: (params?: AssetQuery) =>
    apiClient.get<ApiResponse<PaginatedResponse<Asset>>>('/assets', { params }),

  // Get asset by ID
  getById: (id: string) => apiClient.get<ApiResponse<Asset>>(`/assets/${id}`),

  // Create asset
  create: (data: Partial<Asset>) =>
    apiClient.post<ApiResponse<Asset>>('/assets', data),

  // Update asset
  update: (id: string, data: Partial<Asset>) =>
    apiClient.patch<ApiResponse<Asset>>(`/assets/${id}`, data),

  // Delete asset
  delete: (id: string) => apiClient.delete(`/assets/${id}`),

  // Get statistics
  getStatistics: () => apiClient.get<ApiResponse<any>>('/assets/statistics'),

  // Get root assets (no parent)
  getRoots: () => apiClient.get<ApiResponse<Asset[]>>('/assets/roots'),

  // Get asset hierarchy
  getHierarchy: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/assets/${id}/hierarchy`),

  // Get asset path
  getPath: (id: string) =>
    apiClient.get<ApiResponse<Asset[]>>(`/assets/${id}/path`),

  // Get children assets
  getChildren: (id: string) =>
    apiClient.get<ApiResponse<Asset[]>>(`/assets/${id}/children`),

  // Get devices assigned to asset
  getDevices: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/assets/${id}/devices`),

  // Assign device to asset
  assignDevice: (assetId: string, deviceId: string) =>
    apiClient.post(`/assets/${assetId}/devices`, { deviceId }),

  // Assign multiple devices to asset
  assignDevicesBulk: (assetId: string, deviceIds: string[]) =>
    apiClient.post(`/assets/${assetId}/devices/bulk`, { deviceIds }),

  // Remove device from asset
  removeDevice: (assetId: string, deviceId: string) =>
    apiClient.delete(`/assets/${assetId}/devices/${deviceId}`),

  // Search by location
  searchByLocation: (lat: number, lng: number, radius: number) =>
    apiClient.get<ApiResponse<Asset[]>>('/assets/search/location', {
      params: { lat, lng, radius },
    }),

  // Update attributes
  updateAttributes: (id: string, attributes: Record<string, any>) =>
    apiClient.patch<ApiResponse<Asset>>(`/assets/${id}/attributes`, {
      attributes,
    }),
};
