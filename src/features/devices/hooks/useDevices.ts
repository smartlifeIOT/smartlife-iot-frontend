import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesApi } from '@/services/api/index.ts';
import { deviceService } from '../services/deviceService.ts';
import type {
  DeviceQuery,
  DeviceType,
  Device,
} from '@/services/api/devices.api.ts';
import type { DeviceFormData } from '../types/index.ts';

export const useDevices = (params?: DeviceQuery) => {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => devicesApi.getAll(params),
  });
};

export const useDevice = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId],
    queryFn: () => devicesApi.getById(deviceId),
    enabled: !!deviceId,
  });
};
// get device by id and populate gateway
export const useGetDeviceById = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId],
    queryFn: () => devicesApi.getById(deviceId),
    enabled: !!deviceId,
  });
};

export const useDeviceWithTelemetry = (deviceId: string, keys?: string[]) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'telemetry', keys],
    queryFn: () => deviceService.getDeviceWithTelemetry(deviceId, keys),
    enabled: !!deviceId,
  });
};

export const useDeviceHealth = (deviceId: string) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'health'],
    queryFn: () => deviceService.getDeviceHealth(deviceId),
    enabled: !!deviceId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useDeviceStatistics = () => {
  return useQuery({
    queryKey: ['devices', 'statistics'],
    queryFn: () => devicesApi.getStatistics(),
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeviceFormData) => deviceService.provisionDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
  });
};

export const useUpdateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DeviceFormData>;
    }) => {
      // Convert DeviceFormData to Device format
      const deviceData: Partial<Device> = {
        ...data,
        type: data.type as DeviceType | undefined,
      };
      return devicesApi.update(id, deviceData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', variables.id] });
    },
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => devicesApi.delete(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useActivateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => devicesApi.activate(deviceId),
    onSuccess: (_, deviceId) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', deviceId] });
    },
  });
};

export const useDeactivateDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => devicesApi.deactivate(deviceId),
    onSuccess: (_, deviceId) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', deviceId] });
    },
  });
};

export const useCloneDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceId,
      newName,
    }: {
      deviceId: string;
      newName: string;
    }) => deviceService.cloneDevice(deviceId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useBulkProvision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (devices: DeviceFormData[]) =>
      deviceService.bulkProvision(devices),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useManufacturers = () => {
  return useQuery({
    queryKey: ['devices', 'manufacturers'],
    queryFn: () => devicesApi.getManufacturers(),
  });
};

export const useModels = (manufacturer: string) => {
  return useQuery({
    queryKey: ['devices', 'models', manufacturer],
    queryFn: () => devicesApi.getModels(manufacturer),
    enabled: !!manufacturer,
  });
};

export const useCategories = (manufacturer: string) => {
  return useQuery({
    queryKey: ['devices', 'categories', manufacturer],
    queryFn: () => devicesApi.getCategories(manufacturer),
    enabled: !!manufacturer,
  });
};

export const useFamilies = (manufacturer: string, category: string) => {
  return useQuery({
    queryKey: ['devices', 'families', manufacturer, category],
    queryFn: () => devicesApi.getFamilies(manufacturer, category),
    enabled: !!manufacturer && !!category,
  });
};

export const useDeviceCredentials = (deviceId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['devices', deviceId, 'credentials'],
    queryFn: () => devicesApi.getCredentials(deviceId),
    enabled: !!deviceId && enabled,
  });
};
