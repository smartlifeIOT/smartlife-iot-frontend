import { useQuery } from '@tanstack/react-query';
import { devicesApi, telemetryApi } from '@/services/api/index.ts';

export const useDeviceTelemetry = (deviceId: string, keys?: string[]) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'telemetry', keys],
    queryFn: () => devicesApi.getTelemetry(deviceId, keys),
    enabled: !!deviceId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time data
  });
};

export const useDeviceAttributes = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'attributes'],
    queryFn: () => devicesApi.getAttributes(deviceId),
    enabled: !!deviceId,
  });
};

export const useDeviceLatestTelemetry = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'telemetry', 'latest'],
    queryFn: () => telemetryApi.getLatest(deviceId),
    enabled: !!deviceId,
    refetchInterval: 3000, // Refresh every 3 seconds
  });
};
// get devices capabilities
export const useDeviceCapabilities = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'capabilities'],
    queryFn: () => devicesApi.getCapabilities(deviceId),
    enabled: !!deviceId,
  });
};
