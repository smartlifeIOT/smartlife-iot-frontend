import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardsApi } from '@/services/api';

// Chart color configuration
export const DASHBOARD_COLORS = {
  primary: '#C36BA9', // Purple/pink
  gray: '#E5E7EB',
  orange: '#F97316',
  green: '#22C55E',
} as const;

// Temperature data point interface
export interface TemperatureDataPoint {
  date: string;
  value: number;
}

// Humidity data point interface
export interface HumidityDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Dashboard Statistics API Response Interface
export interface DashboardStatistics {
  temperature?: {
    total?: number;
    unit?: string;
    trend?: TemperatureDataPoint[];
  };
  humidity?: {
    percentage?: number;
  };
  powerConsumption?: {
    value?: number;
    unit?: string;
  };
  systemStatus?: {
    isOnline?: boolean;
  };
  [key: string]: unknown;
}

/**
 * Custom hook for Main Dashboard page
 * Manages dashboard widgets data and state
 */
export const useMainDashboard = () => {
  // System status state (can be overridden by API)
  const [isOnline, setIsOnline] = useState(true);

  // Fetch dashboard statistics from API
  const {
    data: statisticsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: async () => {
      const response = await dashboardsApi.getStatistics();
      return response.data.data as DashboardStatistics;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  });

  console.log(statisticsResponse , 'statisticsResponse')
  // Extract dashboard metrics from API response
  const dashboardMetrics = statisticsResponse;

  // Update isOnline state when API data is available
  useEffect(() => {
    if (dashboardMetrics?.systemStatus?.isOnline !== undefined) {
      setIsOnline(dashboardMetrics.systemStatus.isOnline);
    }
  }, [dashboardMetrics]);

  // Temperature trend data
  const temperatureData: TemperatureDataPoint[] = useMemo(() => {
    // Use API data if available, otherwise fallback to empty array
    if (dashboardMetrics?.temperature?.trend && Array.isArray(dashboardMetrics.temperature.trend)) {
      return dashboardMetrics.temperature.trend;
    }
    // Fallback to empty array if no data
    return [];
  }, [dashboardMetrics]);

  // Humidity level data
  const humidityData: HumidityDataPoint[] = useMemo(() => {
    const percentage = dashboardMetrics?.humidity?.percentage || 50;
    return [
      { name: 'Used', value: percentage },
      { name: 'Remaining', value: 100 - percentage },
    ];
  }, [dashboardMetrics]);

  // Power consumption value
  const powerConsumption = useMemo(() => {
    return {
      value: dashboardMetrics?.powerConsumption?.value || 2.4,
      unit: dashboardMetrics?.powerConsumption?.unit || 'kW',
    };
  }, [dashboardMetrics]);

  // Temperature total (for display)
  const temperatureTotal = useMemo(() => {
    return {
      value: dashboardMetrics?.temperature?.total || 2000,
      unit: dashboardMetrics?.temperature?.unit || 'kW/h',
    };
  }, [dashboardMetrics]);

  // Humidity percentage (for display)
  const humidityPercentage = useMemo(() => {
    return dashboardMetrics?.humidity?.percentage || 50;
  }, [dashboardMetrics]);

  // Handler functions
  const handleSetting = () => {
    console.log('Settings clicked');
    // TODO: Implement settings modal or navigation
  };

  const toggleSystemStatus = () => {
    setIsOnline((prev) => !prev);
    // TODO: Call API to update system status
  };

  return {
    // State
    isOnline,
    isLoading,
    isError,
    error,

    // Data
    temperatureData,
    humidityData,
    powerConsumption,
    temperatureTotal,
    humidityPercentage,

    // Colors
    colors: DASHBOARD_COLORS,

    // Handlers
    handleSetting,
    toggleSystemStatus,
    setIsOnline,
    refetch,
  };
};

