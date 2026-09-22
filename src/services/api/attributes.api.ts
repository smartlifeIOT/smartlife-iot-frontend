import apiClient from '@/lib/axios';

export enum AttributeScope {
  SERVER = 'SERVER',
  SHARED = 'SHARED',
  CLIENT = 'CLIENT',
}

export enum EntityType {
  DEVICE = 'device',
  ASSET = 'asset',
  USER = 'user',
  CUSTOMER = 'customer',
  TENANT = 'tenant',
}

export interface Attribute {
  key: string;
  value: any;
  lastUpdateTs?: number;
}

export interface TimeseriesData {
  ts: number;
  value: any;
}

export interface AttributeKv {
  [key: string]: any;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const attributesApi = {
  // Save attributes
  saveAttributes: (
    entityType: EntityType,
    entityId: string,
    scope: AttributeScope,
    attributes: AttributeKv
  ) =>
    apiClient.post<ApiResponse<any>>(
      `/attributes/${entityType}/${entityId}/${scope.toLowerCase()}`,
      { attributes }
    ),

  // Get all attributes
  getAttributes: (
    entityType: EntityType,
    entityId: string,
    scope?: AttributeScope
  ) =>
    apiClient.get<ApiResponse<Attribute[]>>(
      `/attributes/${entityType}/${entityId}`,
      { params: scope ? { scope: scope.toLowerCase() } : {} }
    ),

  // Get specific attribute keys
  getAttributeKeys: (
    entityType: EntityType,
    entityId: string,
    keys: string[]
  ) =>
    apiClient.get<ApiResponse<Attribute[]>>(
      `/attributes/${entityType}/${entityId}/keys`,
      { params: { keys: keys.join(',') } }
    ),

  // Get timeseries data
  getTimeseries: (
    entityType: EntityType,
    entityId: string,
    keys: string[],
    startTs?: number,
    endTs?: number,
    limit?: number
  ) =>
    apiClient.get<ApiResponse<Record<string, TimeseriesData[]>>>(
      `/attributes/${entityType}/${entityId}/timeseries`,
      {
        params: {
          keys: keys.join(','),
          startTs,
          endTs,
          limit,
        },
      }
    ),

  // Delete attribute
  deleteAttribute: (
    entityType: EntityType,
    entityId: string,
    key: string,
    scope?: AttributeScope
  ) =>
    apiClient.delete(
      `/attributes/${entityType}/${entityId}/${key}`,
      { params: scope ? { scope: scope.toLowerCase() } : {} }
    ),

  // Delete multiple attributes
  deleteAttributes: (
    entityType: EntityType,
    entityId: string,
    keys: string[],
    scope?: AttributeScope
  ) =>
    apiClient.delete(`/attributes/${entityType}/${entityId}`, {
      params: {
        keys: keys.join(','),
        scope: scope?.toLowerCase(),
      },
    }),

  // Save telemetry
  saveTelemetry: (
    entityType: EntityType,
    entityId: string,
    data: Record<string, any>
  ) =>
    apiClient.post<ApiResponse<any>>(
      `/attributes/${entityType}/${entityId}/telemetry`,
      data
    ),

  // Get latest telemetry
  getLatestTelemetry: (
    entityType: EntityType,
    entityId: string,
    keys?: string[]
  ) =>
    apiClient.get<ApiResponse<Record<string, any>>>(
      `/attributes/${entityType}/${entityId}/telemetry/latest`,
      { params: keys ? { keys: keys.join(',') } : {} }
    ),
};