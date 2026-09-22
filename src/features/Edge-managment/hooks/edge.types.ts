export type EdgeType = "GATEWAY" | "SENSOR" | "CONTROLLER" | string;

export interface EdgeSyncConfig {
  syncRules: boolean;
  syncDashboards: boolean;
  syncDevices: boolean;
  syncInterval: number; // seconds
  offlineBufferHours: number;
}

export interface EdgePayload {
  name: string;
  description: string;
  type: EdgeType;
  location: string;
  latitude: number;
  longitude: number;
  syncConfig: EdgeSyncConfig;
  tags: string[];
  additionalInfo: Record<string, unknown>;
  customerId: string;
}

// What the API returns after creation/fetch (extends the payload with server fields)
export interface Edge extends EdgePayload {
  id: string;
  status?: "ONLINE" | "OFFLINE" | "PROVISIONING";
  createdAt: string;
  updatedAt: string;
}

// For list endpoints with pagination/filtering
export interface EdgeListParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  type?: EdgeType;
}

export interface EdgeListResponse {
  data: Edge[];
  total: number;
  page: number;
  limit: number;
}
