import type { Device } from '@/services/api/devices.api.ts';

export interface DeviceVariant {
  model: string;
  codecId: string;
  protocol: string;
}

export interface DeviceFamily {
  family: string;
  variants: DeviceVariant[];
  category: string;
  imageUrl: string;
  description?: string;
}

export interface DeviceFormData {
  name: string;
  type: string;
  deviceProfileId?: string;
  gatewayId?: string;
  description?: string;
  connectionType?: string;
  manufacturer?: string;
  category?: string;
  family?: string;
  model?: string;
  protocol?: string;
  codecId?: string;
  devEUI?: string;
  serialNumber?: string;
  installationDate?: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}

export interface DeviceFilters {
  search?: string;
  type?: string;
  active?: boolean;
  deviceProfileId?: string;
  gatewayId?: string;
}

export interface DeviceTelemetryData {
  key: string;
  value: any;
  timestamp: number;
}

export interface DeviceHealth {
  deviceId: string;
  deviceName: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: Date | null;
  minutesSinceLastSeen: number | null;
  active: boolean;
}

export interface DeviceProvisionResult {
  device: Device;
  success: boolean;
  message?: string;
}

export interface BulkProvisionResult {
  successful: Device[];
  failed: Array<{ device: string; error: string }>;
  total: number;
  successCount: number;
  failCount: number;
}

export interface DeviceListItem extends Device {
  health?: DeviceHealth;
  telemetry?: Record<string, any>;
}

export type DeviceAction =
  | 'view'
  | 'edit'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'clone'
  | 'export';

export interface DeviceProfileApiResponse {
  id: string;
  name: string;
  description?: string;
  type?: string;
  transportType?: string;
  provisionType?: string;
  default?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceCapabilityParam {
  key: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'boolean' | 'switch';
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: any }>;
}

export interface DeviceCommand {
  type: string;
  label: string;
  description?: string;
  params: DeviceCapabilityParam[];
}

export interface DeviceTelemetryKey {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean';
  unit?: string;
  enum?: string[];
}

export interface DeviceUIComponent {
  type: 'toggle' | 'value' | 'gauge' | 'slider' | 'chart';
  label: string;
  keys: string[];
  command?: string;
  unit?: string;
}

export interface DeviceCapabilities {
  codecId: string;
  manufacturer: string;
  model: string;
  description: string;
  telemetryKeys: DeviceTelemetryKey[];
  commands: DeviceCommand[];
  uiComponents: DeviceUIComponent[];
}
