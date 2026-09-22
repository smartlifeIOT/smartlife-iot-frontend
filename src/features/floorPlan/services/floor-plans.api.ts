import apiClient from '@/lib/axios';

export interface FloorPlanDimensions {
  width: number;
  height: number;
  scale?: number; // pixels per meter
}

export interface DevicePosition {
  x: number;
  y: number;
}

export interface FloorPlanDevice {
  name: string;
  type: string;
  deviceId: string;
  position: DevicePosition;
}

export interface ZoneBoundary {
  x: number;
  y: number;
}

/**
 * Payload to create a zone on a floor plan
 * POST /floor-plans/{id}/zones
 */
export interface CreateZonePayload {
  name: string;
  color?: string;
  boundaries: string[];
  floor?: string;
  deviceIds?: string[];
}

export interface UpdateZonePayload extends Partial<CreateZonePayload> {}

export interface FloorPlanZone {
  id: string;
  name: string;
  color?: string;
  boundaries: string[] | ZoneBoundary[];
  floor?: string;
  deviceIds?: string[];
}

export interface GridSettings {
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
}

export interface DefaultColors {
  zones: string;
  gateways: string;
  sensorsToGrid: string;
  sensorsToGateway: string;
}

export interface FloorPlanSettings {
  autoSave: boolean;
  gridSettings: GridSettings;
  defaultColors: DefaultColors;
  measurementUnit: string;
}

export interface DeviceMarker {
  deviceId: string;
  x: number;
  y: number;
  rotation?: number;
  icon?: string;
  // Legacy support - can also use the new structure
  name?: string;
  type?: string;
  position?: DevicePosition;
}

export interface ParsedGeometry {
  doors?: Array<{
    id: string;
    type: string;
    width: number;
    height: number;
    position: { x: number; y: number; z: number };
    rotation: number;
  }>;
  rooms?: Array<{
    id: string;
    area: number;
    name: string;
    floor: string;
    boundaries: Array<{ x: number; y: number }>;
  }>;
  walls?: Array<{
    id: string;
    height: number;
    points: Array<{ x: number; y: number; z: number }>;
    material: string;
    thickness: number;
  }>;
  stairs?: Array<unknown>;
  windows?: Array<{
    id: string;
    width: number;
    height: number;
    position: { x: number; y: number; z: number };
    rotation: number;
  }>;
  furniture?: Array<unknown>;
}

export interface FloorPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  name: string;
  description?: string;
  building?: string;
  floor?: string;
  imageUrl?: string;
  category?: string;
  status?: 'active' | 'archived' | 'draft';
  dimensions: FloorPlanDimensions;
  scale?: string;
  devices: FloorPlanDevice[];
  zones: FloorPlanZone[];
  deviceMarkers?: DeviceMarker[]; // Legacy support
  metadata?: Record<string, unknown>;
  userId: string;
  tenantId?: string | null;
  settings?: FloorPlanSettings;
  parsedGeometry?: ParsedGeometry;
}

export interface FloorPlanQuery {
  search?: string;
  building?: string;
  floor?: string;
  page?: number;
  limit?: number;
}

/**
 * Payload for creating a floor plan
 */
export interface CreateFloorPlanPayload {
  assetId?: string;
  name: string;
  description?: string;
  building?: string;
  floor?: string;
  status?: string;
  floorNumber?: number;
  category?: string;
  imageFile?: File;
  dimensions: { width: number; height: number; scale?: number };
  deviceMarkers?: DeviceMarker[];
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  message: string;
  data: {
    data: T[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
export interface PaginatedResponseFP<T> {
  message: string;
  data: {
    data: T[];
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

/**
 * Statistics returned by the GET /floor-plans/statistics endpoint
 */
export interface FloorPlanStatistics {
  /** Total number of floor plans */
  total: number;
  /** Number of active floor plans */
  active: number;
  /** Total devices mapped across floor plans */
  totalDevices: number;
  /** Total zones defined across floor plans */
  totalZones: number;
  /** Number of active floor plans (alias) */
  activePlans?: number;
  /** Number of inactive floor plans */
  inactivePlans?: number;
}

export const floorPlansApi = {
  // Get all floor plans
  getAll: (params?: FloorPlanQuery) =>
    apiClient.get<PaginatedResponseFP<FloorPlan>>('/floor-plans', { params }),

  // Get floor plan by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<FloorPlan>>(`/floor-plans/${id}`),
  // get parsed floor plan data
  getParsedDataByID: (id: string) =>
    apiClient.get<ApiResponse<FloorPlan>>(`/floor-plans/${id}/geometry`),

  // Create floor plan
  create: (data: CreateFloorPlanPayload | FormData) =>
    apiClient.post<ApiResponse<FloorPlan>>('/floor-plans', data, {
      headers: { 'Content-Type': 'application/json' },
    }),

  // Update floor plan
  update: (id: string, data: Partial<FloorPlan>) =>
    apiClient.patch<ApiResponse<FloorPlan>>(`/floor-plans/${id}`, data),

  // Delete floor plan
  delete: (id: string) => apiClient.delete(`/floor-plans/${id}`),
  //upload DWg

  // Upload image
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiResponse<{ imageUrl: string }>>(
      `/floor-plans/${id}/upload-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  // Add device marker
  addDeviceMarker: (id: string, marker: DeviceMarker) =>
    apiClient.post<ApiResponse<FloorPlan>>(
      `/floor-plans/${id}/markers`,
      marker
    ),

  // Update device marker
  updateDeviceMarker: (
    id: string,
    deviceId: string,
    marker: Partial<DeviceMarker>
  ) =>
    apiClient.patch<ApiResponse<FloorPlan>>(
      `/floor-plans/${id}/markers/${deviceId}`,
      marker
    ),

  // Remove device marker
  removeDeviceMarker: (id: string, deviceId: string) =>
    apiClient.delete(`/floor-plans/${id}/markers/${deviceId}`),

  // Get devices on floor plan
  getDevices: (id: string) =>
    apiClient.get<ApiResponse<FloorPlanDevice[]>>(`/floor-plans/${id}/devices`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<FloorPlanStatistics>>('/floor-plans/statistics'),

  // Clone floor plan
  clone: (id: string, newName: string) =>
    apiClient.post<ApiResponse<FloorPlan>>(`/floor-plans/${id}/clone`, {
      name: newName,
    }),

  // Upload DWG file — backend parses geometry synchronously and returns it in the response
  uploadDwg: (id: string, file: File, floor?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (floor) {
      formData.append('floor', floor);
    }
    return apiClient.post<
      ApiResponse<{
        fileUrl: string;
        floor?: string;
        parsedGeometry?: ParsedGeometry;
      }>
    >(`/floor-plans/${id}/dwg-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // add zone to floor plan (POST /floor-plans/{id}/zones)
  addZone: (id: string, zone: CreateZonePayload) =>
    apiClient.post<ApiResponse<FloorPlan>>(`/floor-plans/${id}/zones`, zone),

  // update zone in floor plan (PATCH /floor-plans/{id}/zones/{zoneId})
  updateZone: (id: string, zoneId: string, zone: UpdateZonePayload) =>
    apiClient.patch<ApiResponse<FloorPlan>>(
      `/floor-plans/${id}/zones/${zoneId}`,
      zone
    ),

  // remove zone from floor plan
  removeZone: (id: string, zoneId: string) =>
    apiClient.delete(`/floor-plans/${id}/zones/${zoneId}`),

  // get zones in floor plan
  getZones: (id: string) =>
    apiClient.get<ApiResponse<FloorPlanZone[]>>(`/floor-plans/${id}/zones`),
};
