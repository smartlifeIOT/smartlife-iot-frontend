import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { assetsApi } from '@/services/api';
import type { Asset } from '@/services/api/assets.api';

// Type for nested API response structure: { data: { data: { data: Asset } } }
interface NestedApiResponse {
  data: {
    data: {
      data: Asset;
    };
  };
}

export interface ConnectedDevice {
  id: string;
  name: string;
  status: 'active' | 'offline' | 'warning';
}

export interface RecentActivity {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
  time: string;
}

export interface AssetHierarchy {
  id: string;
  name: string;
  devices?: Array<{
    id: string;
    name: string;
    status: 'active' | 'offline';
  }>;
}

export interface AssetDetails {
  id: string;
  name: string;
  type: string;
  customer: string;
  status: 'active' | 'offline' | 'warning';
  createdAt: string;
  lastActivity: string;
  connectedDevices: ConnectedDevice[];
  recentActivity: RecentActivity[];
  assetHierarchy: AssetHierarchy[];
  activeDevicesCount: number;
  offlineDevicesCount: number;
  warningDevicesCount: number;
}

/**
 * Custom hook to fetch and transform asset details
 * @param assetId - The ID of the asset to fetch
 */
export const useAssetDetails = (assetId: string | undefined) => {
  // Fetch asset by ID
  const {
    data: assetResponse,
    isLoading: isLoadingAsset,
    isError: isErrorAsset,
    error: assetError,
  } = useQuery({
    queryKey: ['assets', assetId],
    queryFn: () => assetsApi.getById(assetId!),
    enabled: !!assetId,
    retry: 2,
  });
  // Fetch connected devices
  const {
    data: devicesResponse,
    isLoading: isLoadingDevices,
    isError: isErrorDevices,
    error: devicesError,
  } = useQuery({
    queryKey: ['assets', assetId, 'devices'],
    queryFn: () => assetsApi.getDevices(assetId!),
    enabled: !!assetId,
    retry: 2,
  });
  // Fetch asset hierarchy (children)
  const {
    data: hierarchyResponse,
    isLoading: isLoadingHierarchy,
    isError: isErrorHierarchy,
    error: hierarchyError,
  } = useQuery({
    queryKey: ['assets', assetId, 'hierarchy'],
    queryFn: () => assetsApi.getHierarchy(assetId!),
    enabled: !!assetId,
    retry: 2,
  });

  // Transform API data to component format
  const assetDetails: AssetDetails | null = useMemo(() => {
    // Handle nested response structure: assetResponse.data.data.data
    const responseData = assetResponse?.data as NestedApiResponse['data'] | undefined;
    if (!responseData?.data?.data) {
      return null;
    }

    const asset: Asset = responseData.data.data;

    // Transform devices
    const devices = devicesResponse?.data?.data || [];
    const connectedDevices: ConnectedDevice[] = [1,2,3,4].map((device: any) => {
      // Determine device status from API response
      const deviceStatus = device.status || device.active ? 'active' : 'offline';
      return {
        id: device.id || device.deviceId,
        name: device.name || device.label || 'Unknown Device',
        status: deviceStatus,
      };
    });

    // Transform hierarchy
    const hierarchyData = hierarchyResponse?.data?.data || [];
    const assetHierarchy: AssetHierarchy[] = Array.isArray(hierarchyData)
      ? hierarchyData.map((item: any) => ({
          id: item.id,
          name: item.name || item.label,
          devices: item.devices?.map((device: any) => ({
            id: device.id || device.deviceId,
            name: device.name || device.label || 'Unknown Device',
            status: device.status === 'active' || device.active ? 'active' : 'offline',
          })),
        }))
      : [];

    // Get customer from additionalInfo or customerId
    const customer =
      asset.additionalInfo?.customer ||
      asset.customerId ||
      'N/A';

    // Determine status from additionalInfo or default to active
    const statusFromInfo = asset.additionalInfo?.status;
    let status: 'active' | 'offline' | 'warning' = 'active';
    if (statusFromInfo === 'warning' || statusFromInfo === 'error') {
      status = statusFromInfo === 'warning' ? 'warning' : 'offline';
    } else if (statusFromInfo === 'inactive' || statusFromInfo === 'deactivated') {
      status = 'offline';
    }

    // Format dates
    const createdAt = asset.createdAt
      ? new Date(asset.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

    const lastActivity = asset.updatedAt
      ? formatTimeAgo(new Date(asset.updatedAt))
      : 'N/A';

    // Calculate device counts
    const activeDevicesCount = connectedDevices.filter(
      (d) => d.status === 'active'
    ).length;
    const offlineDevicesCount = connectedDevices.filter(
      (d) => d.status === 'offline'
    ).length;
    const warningDevicesCount = connectedDevices.filter(
      (d) => d.status === 'warning'
    ).length;

    // Generate recent activity from asset updates or device events
    // In a real app, this would come from an activity/audit log API
    const recentActivity: RecentActivity[] = generateRecentActivity(
      asset,
      connectedDevices
    );

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      customer,
      status,
      createdAt,
      lastActivity,
      connectedDevices,
      recentActivity,
      assetHierarchy,
      activeDevicesCount,
      offlineDevicesCount,
      warningDevicesCount,
    };
  }, [assetResponse, devicesResponse, hierarchyResponse]);

  const isLoading = isLoadingAsset || isLoadingDevices || isLoadingHierarchy;
  const isError = isErrorAsset || isErrorDevices || isErrorHierarchy;
  const error = assetError || devicesError || hierarchyError;

  return {
    assetDetails,
    isLoading,
    isError,
    error,
  };
};

/**
 * Format date as time ago (e.g., "2 minutes ago", "1 hour ago")
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
}

/**
 * Generate recent activity from asset and device data
 * In production, this should come from an audit log API
 */
function generateRecentActivity(
  asset: Asset,
  devices: ConnectedDevice[]
): RecentActivity[] {
  const activities: RecentActivity[] = [];

  // Add activity based on asset updates
  if (asset.updatedAt) {
    const updateDate = new Date(asset.updatedAt);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 24) {
      activities.push({
        id: '1',
        type: 'info',
        message: 'Configuration updated',
        time: formatTimeAgo(updateDate),
      });
    }
  }

  // Add activities based on device status changes
  const offlineDevices = devices.filter((d) => d.status === 'offline');
  const warningDevices = devices.filter((d) => d.status === 'warning');

  if (warningDevices.length > 0) {
    activities.push({
      id: '2',
      type: 'warning',
      message: 'Alarm triggered',
      time: '4h ago',
    });
  }

  if (devices.length > 0 && offlineDevices.length === 0) {
    activities.push({
      id: '3',
      type: 'success',
      message: 'Device added',
      time: '2h ago',
    });
  }

  // Sort by time (most recent first) - simplified for demo
  return activities.slice(0, 3);
}

