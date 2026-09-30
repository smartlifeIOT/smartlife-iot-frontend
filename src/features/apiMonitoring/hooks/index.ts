import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ApiLogQuery,
  TimeRange,
  apiMonitoringApi,
  ResponseTimeByMinute,
  ApiPerformanceData,
  HealthStatus,
  HealthServicesStatus,
  HealthMemoryStatus,
  ApiLog,
} from '../services/api-monitoring.api';

export type {
  ResponseTimeByMinute,
  ApiPerformanceData,
  HealthStatus,
  HealthServicesStatus,
  HealthMemoryStatus,
  ApiLog,
  ApiLogQuery,
};

// 1. Dashboard
export const useGetApiDashboard = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-dashboard'],
    queryFn: async () => {
      const res = await apiMonitoringApi.getDashboard();
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 2. Stats (with timeRange filter)
export const useGetApiStats = (timeRange?: TimeRange) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-stats', timeRange],
    queryFn: async () => {
      const res = await apiMonitoringApi.getStats(timeRange);
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 3. Logs (paginated, filterable)
export const useGetApiLogs = (params?: ApiLogQuery) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-logs', params],
    queryFn: async () => {
      const res = await apiMonitoringApi.getLogs(params);
      return res.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 4. Export Logs as CSV
export const useExportApiLogs = () => {
  return useMutation({
    mutationFn: (params?: ApiLogQuery) => apiMonitoringApi.exportLogs(params),
  });
};

// 5. Metrics
export const useGetApiMetrics = (startDate?: string, endDate?: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-metrics', startDate, endDate],
    queryFn: async () => {
      const res = await apiMonitoringApi.getMetrics(startDate, endDate);
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 6. Statistics
export const useGetApiStatistics = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-statistics'],
    queryFn: async () => {
      const res = await apiMonitoringApi.getStatistics();
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 7. Performance
export const useGetApiPerformance = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-performance'],
    queryFn: async () => {
      const res = await apiMonitoringApi.getPerformance();
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// Alias for backward compatibility
export const useGetAPiperfomance = useGetApiPerformance;

// 8. Errors
export const useGetApiErrors = (params?: ApiLogQuery) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-errors', params],
    queryFn: async () => {
      const res = await apiMonitoringApi.getErrors(params);
      return res.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// Alias for backward compatibility
export const useGetAPIerrors = useGetApiErrors;

// 9. Slow requests
export const useGetSlowRequests = (threshold?: number, limit?: number) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-slow-requests', threshold, limit],
    queryFn: async () => {
      const res = await apiMonitoringApi.getSlowRequests(threshold, limit);
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 10. Top Endpoints
export const useGetTopEndpoints = (limit?: number) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-top-endpoints', limit],
    queryFn: async () => {
      const res = await apiMonitoringApi.getTopEndpoints(limit);
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 11. Platform Health
export const useGetHealth = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const res = await apiMonitoringApi.getHealth();
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// Alias for convenience
export const useGetApiHealth = useGetHealth;

// 12. My Logs
export const useGetMyLogs = (params?: ApiLogQuery) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-my-logs', params],
    queryFn: async () => {
      const res = await apiMonitoringApi.getMyLogs(params);
      return res.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 13. My Metrics
export const useGetMyMetrics = (startDate?: string, endDate?: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-my-metrics', startDate, endDate],
    queryFn: async () => {
      const res = await apiMonitoringApi.getMyMetrics(startDate, endDate);
      return res.data.data;
    },
  });
  return { data, isLoading, isError, refetch };
};

// 14. Log by ID
export const useGetLogById = (id: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-log-by-id', id],
    queryFn: async () => {
      const res = await apiMonitoringApi.getLogById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
  return { data, isLoading, isError, refetch };
};

// 15. Clear Logs Mutation
export const useClearLogs = () => {
  return useMutation({
    mutationFn: (beforeDate?: string) => apiMonitoringApi.clearLogs(beforeDate),
  });
};

// 16. Endpoint Stats
export const useGetEndpointStats = (endpoint: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-endpoint-stats', endpoint],
    queryFn: async () => {
      const res = await apiMonitoringApi.getEndpointStats(endpoint);
      return res.data.data;
    },
    enabled: !!endpoint,
  });
  return { data, isLoading, isError, refetch };
};

// 17. User Stats
export const useGetUserStats = (userId: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-user-stats', userId],
    queryFn: async () => {
      const res = await apiMonitoringApi.getUserStats(userId);
      return res.data.data;
    },
    enabled: !!userId,
  });
  return { data, isLoading, isError, refetch };
};
