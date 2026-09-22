import apiClient from '@/lib/axios';
import type { ApiResponse } from './devices.api';

export interface TelemetryData {
  id: string;
  deviceId: string;
  deviceKey: string;
  timestamp: string;
  data: Record<string, any>;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  latitude: number | null;
  longitude: number | null;
  batteryLevel: number | null;
  signalStrength: number | null;
  metadata: {
    fPort?: number;
    model?: string;
    topic?: string;
    devEUI?: string;
    codecId?: string;
    protocol?: string;
    manufacturer?: string;
  };
}

export const telemetryApi = {
  // Get latest telemetry for a device
  getLatest: (deviceId: string) =>
    apiClient.get<ApiResponse<TelemetryData>>(
      `/telemetry/devices/${deviceId}/latest`
    ),
};
