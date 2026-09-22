import apiClient from '@/lib/axios';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface ApiLog {
  id: string;
  method: HttpMethod | string;
  endpoint: string;
  url?: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
  ipAddress?: string;
  userRole?: string;
  errorMessage?: string;
  error?: string;
  errorStack?: string | null;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  isError?: boolean;
  timestamp?: string;
  createdAt: string;
}

export interface RequestByEndpointStat {
  endpoint: string;
  count: number;
}

export interface ApiMetrics {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  requestsByEndpoint: RequestByEndpointStat[];
  requestsByMethod: Record<string, number>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  database: boolean;
  cache: boolean;
  queue: boolean;
  timestamp: string;
}

export interface ApiLogQuery {
  method?: HttpMethod;
  endpoint?: string;
  statusCode?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export type TimeRange = '1h' | '24h' | '7d' | '30d';

export interface DashboardPeriodSummary {
  requests: number;
  errors: number;
  avgResponseTime?: number;
}
//
export interface HourlyTrendStat {
  hour: string;
  timestamp: string;
  requests: number;
  errors: number;
  avgTime: number;
}

export interface StatusCodeDistributionStat {
  statusCode: number;
  count: number;
  percentage: number;
}

export interface DashboardSubscription {
  plan: string;
  used: number;
  limit: number;
  unlimited: boolean;
  percentage: number;
  loggedThisMonth: number;
}

export interface ApiDashboard {
  today: DashboardPeriodSummary;
  thisWeek: DashboardPeriodSummary;
  thisMonth: DashboardPeriodSummary;
  hourlyTrend: HourlyTrendStat[];
  statusCodeDistribution: StatusCodeDistributionStat[];
  subscription: DashboardSubscription;
}

export interface TopEndpointUsageStat {
  endpoint: string;
  count: number;
  avgResponseTime: number;
  errorCount: number;
}

export interface TopEndpointStat {
  endpoint: string;
  count: number;
  avgTime: number;
  errorRate: number;
}

export interface TopErrorStat {
  statusCode: number;
  endpoint: string;
  count: number;
}

export interface SlowestEndpointStat {
  endpoint: string;
  avgTime: number;
  maxTime: number;
  count: number;
}

export interface ApiStats {
  timeRange: TimeRange | string;
  windowStart: string;
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  errorRate: number;
  avgResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerMinute: number;
  topEndpoints: TopEndpointStat[];
  topErrors: TopErrorStat[];
  slowestEndpoints: SlowestEndpointStat[];
}

export interface PaginatedResponse<T> {
  message?: string;
  success?: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export const apiMonitoringApi = {
  // GET /api-monitoring/dashboard - API monitoring dashboard
  getDashboard: () =>
    apiClient.get<ApiResponse<ApiDashboard>>('/api-monitoring/dashboard'),

  // GET /api-monitoring/stats - Aggregate API statistics
  getStats: (timeRange?: TimeRange) =>
    apiClient.get<ApiResponse<ApiStats>>('/api-monitoring/stats', {
      params: { timeRange },
    }),

  // GET /api-monitoring/logs - Get API logs (paginated, filterable)
  getLogs: (params?: ApiLogQuery) =>
    apiClient.get<PaginatedResponse<ApiLog>>('/api-monitoring/logs', {
      params,
    }),

  // GET /api-monitoring/export - Export API logs as CSV
  exportLogs: (params?: ApiLogQuery) =>
    apiClient.get('/api-monitoring/export', {
      params,
      responseType: 'blob',
    }),

  // GET /api-monitoring/metrics - Get API metrics (last 24h)
  getMetrics: (startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse<ApiMetrics>>('/api-monitoring/metrics', {
      params: { startDate, endDate },
    }),

  // GET /api-monitoring/statistics - All-time totals by status code
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/api-monitoring/statistics'),

  // GET /api-monitoring/performance - Per-minute performance for chart
  getPerformance: () =>
    apiClient.get<ApiResponse<ApiMetrics>>('/api-monitoring/performance'),

  // Alias for backward compatibility
  getAPiperfomance: () =>
    apiClient.get<ApiResponse<ApiMetrics>>('/api-monitoring/performance'),

  // GET /api-monitoring/errors - Get error logs (status >= 400)
  getErrors: (params?: ApiLogQuery) =>
    apiClient.get<PaginatedResponse<ApiLog>>('/api-monitoring/errors', {
      params,
    }),

  // GET /api-monitoring/slow-requests - Get slow requests
  getSlowRequests: (threshold?: number, limit?: number) =>
    apiClient.get<ApiResponse<ApiLog[]>>('/api-monitoring/slow-requests', {
      params: { threshold, limit },
    }),

  // GET /api-monitoring/endpoints/top - Top endpoints by usage
  getTopEndpoints: (limit?: number) =>
    apiClient.get<ApiResponse<TopEndpointUsageStat[]>>(
      '/api-monitoring/endpoints/top',
      {
        params: { limit },
      }
    ),

  // GET /api-monitoring/health - Platform health
  getHealth: () =>
    apiClient.get<ApiResponse<HealthStatus>>('/api-monitoring/health'),

  // GET /api-monitoring/logs/my - Get my API logs
  getMyLogs: (params?: ApiLogQuery) =>
    apiClient.get<PaginatedResponse<ApiLog>>('/api-monitoring/logs/my', {
      params,
    }),

  // GET /api-monitoring/metrics/my - Get my API metrics (last 24h)
  getMyMetrics: (startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse<ApiMetrics>>('/api-monitoring/metrics/my', {
      params: { startDate, endDate },
    }),

  // Get log by ID
  getLogById: (id: string) =>
    apiClient.get<ApiResponse<ApiLog>>(`/api-monitoring/logs/${id}`),

  // Clear logs
  clearLogs: (beforeDate?: string) =>
    apiClient.delete('/api-monitoring/logs', { params: { beforeDate } }),

  // Get statistics by endpoint
  getEndpointStats: (endpoint: string) =>
    apiClient.get<ApiResponse<any>>(`/api-monitoring/endpoint/${endpoint}`),

  // Get statistics by user
  getUserStats: (userId: string) =>
    apiClient.get<ApiResponse<any>>(`/api-monitoring/user/${userId}`),
};
