import { AssetProfilesResponse } from '@/features/assets/types';
import { DeviceProfileMultiStepFormData } from '@/features/profiles/types';
import apiClient from '@/lib/axios.ts';

// Device Profile Types
export interface DeviceProfile {
  id: string;
  name: string;
  description?: string;
  type: 'default' | 'mqtt' | 'http' | 'coap' | 'lwm2m' | 'snmp';
  transportType: 'default' | 'mqtt' | 'http' | 'coap' | 'lwm2m' | 'snmp';
  provisionType?:
    | 'disabled'
    | 'allow_create_new_devices'
    | 'check_pre_provisioned_devices';
  default?: boolean;
  transportConfiguration?: Record<string, any>;
  telemetryKeys?: Array<{
    key: string;
    type: 'string' | 'long' | 'double' | 'boolean' | 'json';
    label?: string;
    units?: string;
    decimals?: number;
  }>;
  attributes?: {
    server?: Array<{ key: string; value: any }>;
    shared?: Array<{ key: string; value: any }>;
    client?: Array<{ key: string; value: any }>;
  };
  alarmRules?: Array<{
    name: string;
    condition: string;
    severity: 'critical' | 'major' | 'minor' | 'warning' | 'indeterminate';
  }>;
  provisionConfiguration?: Record<string, any>;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

// Asset Profile Types
export interface AssetProfile {
  id: string;
  name: string;
  description?: string;
  default?: boolean;
  customFields?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'json';
    label?: string;
    required?: boolean;
    defaultValue?: any;
  }>;
  metadataSchema?: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  alarmRules?: Array<{
    name: string;
    condition: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INDETERMINATE';
  }>;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileQuery {
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
    totalItems: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Device Profiles API
export const deviceProfilesApi = {
  // Get all device profiles
  getAll: (params?: ProfileQuery) =>
    apiClient.get<ApiResponse<PaginatedResponse<DeviceProfile>>>(
      '/profiles/device',
      {
        params,
      }
    ),

  // Get device profile by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<DeviceProfile>>(`/profiles/device/${id}`),

  // Create device profile
  create: (data: DeviceProfileMultiStepFormData) =>
    apiClient.post<ApiResponse<DeviceProfile>>('/profiles/device', data),

  // Update device profile
  update: (id: string, data: DeviceProfileMultiStepFormData) =>
    apiClient.patch<ApiResponse<DeviceProfile>>(`/profiles/device/${id}`, data),

  // Delete device profile
  delete: (id: string) => apiClient.delete(`/profiles/device/${id}`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/profiles/device/statistics'),

  // Get default profile
  getDefault: () =>
    apiClient.get<ApiResponse<DeviceProfile>>('/profiles/device/default'),

  // Set as default
  setDefault: (id: string) =>
    apiClient.patch<ApiResponse<DeviceProfile>>(
      `/profiles/device/${id}/default`
    ),

  // Get devices using this profile
  getDevices: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/profiles/device/${id}/devices`),

  // Validate telemetry data
  validateTelemetry: (id: string, telemetry: Record<string, any>) =>
    apiClient.post<ApiResponse<any>>(`/profiles/device/${id}/validate`, {
      telemetry,
    }),

  // Clone profile
  clone: (id: string, newName: string) =>
    apiClient.post<ApiResponse<DeviceProfile>>(`/profiles/device/${id}/clone`, {
      name: newName,
    }),
};

// Asset Profiles API
export const assetProfilesApi = {
  // Get all asset profiles
  getAll: (params?: ProfileQuery) =>
    apiClient.get<ApiResponse<AssetProfilesResponse>>('/profiles/asset', {
      params,
    }),

  // Get asset profile by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<AssetProfile>>(`/profiles/asset/${id}`),

  // Create asset profile
  create: (data: Partial<AssetProfile>) =>
    apiClient.post<ApiResponse<AssetProfile>>('/profiles/asset', data),

  // Update asset profile
  update: (id: string, data: Partial<AssetProfile>) =>
    apiClient.patch<ApiResponse<AssetProfile>>(`/profiles/asset/${id}`, data),

  // Delete asset profile
  delete: (id: string) => apiClient.delete(`/profiles/asset/${id}`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/profiles/asset/statistics'),

  // Get default profile
  getDefault: () =>
    apiClient.get<ApiResponse<AssetProfile>>('/profiles/asset/default'),

  // Set as default
  setDefault: (id: string) =>
    apiClient.patch<ApiResponse<AssetProfile>>(`/profiles/asset/${id}/default`),

  // Get assets using this profile
  getAssets: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/profiles/asset/${id}/assets`),

  // Validate asset data
  validateAssetData: (id: string, data: Record<string, any>) =>
    apiClient.post<ApiResponse<any>>(`/profiles/asset/${id}/validate`, {
      data,
    }),

  // Clone profile
  clone: (id: string, newName: string) =>
    apiClient.post<ApiResponse<AssetProfile>>(`/profiles/asset/${id}/clone`, {
      name: newName,
    }),
};

export const profilesApi = {
  device: deviceProfilesApi,
  asset: assetProfilesApi,
};
