import { useQuery } from '@tanstack/react-query';
import { analyticsApi, DeviesAnaltyisParams } from '@/services/api';

export const useSystemAnalytics = (timeRange?: string) => {
  return useQuery({
    queryKey: ['analytics', 'system', timeRange],
    queryFn: async () => {
      const response = await analyticsApi.getSystemAnalytics(timeRange);
      return response.data.data;
    },
  });
};

export const useTimeSeries = (query: any) => {
  return useQuery({
    queryKey: ['analytics', 'timeseries', query],
    queryFn: () => analyticsApi.getTimeSeries(query),
    enabled: !!query.entityId,
  });
};
export const useDevicesAnalytics = (params?: DeviesAnaltyisParams) => {
  return useQuery({
    queryKey: ['analytics', 'devices', params],
    queryFn: async () => {
      const ApiResponse = await analyticsApi.getDevicesAnalytics(params);
      return ApiResponse.data.data;
    },
  });
};
// get device details by id
export const useDeviceDetails = (deviceId: string, timeRange?: string) => {
  return useQuery({
    queryKey: ['analytics', 'device', deviceId, timeRange],
    queryFn: async () => {
      const ApiResponse = await analyticsApi.getDeviceAnalytics(
        deviceId,
        timeRange
      );
      return ApiResponse.data.data;
    },
    enabled: !!deviceId,
  });
};
export const useDeviceAnalytics = (
  deviceId: string,
  startTime: number,
  endTime: number
) => {
  return useQuery({
    queryKey: ['analytics', 'device', deviceId, startTime, endTime],
    queryFn: () => analyticsApi.getDeviceAnalytics(deviceId),
    enabled: !!deviceId,
  });
};

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const response = await analyticsApi.getAnalyticsOverview();
      // The endpoint returns { success, data: { devices, telemetry, alarms, assets, subscription }, timestamp }
      return response.data.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useGeoAnalytics = (region?: string) => {
  return useQuery({
    queryKey: ['analytics', 'geo-analyics', region],
    queryFn: async () => {
      const response = await analyticsApi.getgeoDetails(region);
      return response.data.data;
    },
  });
};

export const useDataConsumptionAnalytics = (timeRange?: string) => {
  return useQuery({
    queryKey: ['analytics', 'data-consumption', timeRange],
    queryFn: async () => {
      const response = await analyticsApi.getDataConsumption(timeRange);
      return response.data.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// get daashboard analytics
export const useDashboardAnalytics = (timeRange?: string) => {
  return useQuery({
    queryKey: ['analytics', 'dashboards', timeRange],
    queryFn: async () => {
      const response = await analyticsApi.getDashboardAnalytics(timeRange);
      return response.data.data;
    },
  });
};
// get energy details

export const useEnergyDetails = (timeRange?: string) => {
  return useQuery({
    queryKey: ['analytics', 'energy', timeRange],
    queryFn: async () => {
      const response = await analyticsApi.getEnergyDetails(timeRange);
      return response.data.data;
    },
  });
};
