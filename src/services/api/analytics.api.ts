import apiClient from '@/lib/axios.ts';

export interface TimeSeriesData {
  timestamp: number;
  value: number | string | boolean;
}

export interface AnalyticsQuery {
  entityId: string;
  entityType: 'DEVICE' | 'ASSET';
  keys: string[];
  startTime: number;
  endTime: number;
  interval?: number;
  aggregation?: 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT';
  limit?: number;
}

export interface DeviceAnalytics {
  deviceId: string;
  deviceName: string;
  totalMessages: number;
  activeTime: number;
  lastActivityTime?: string;
  telemetryStats: Record<
    string,
    {
      min: number;
      max: number;
      avg: number;
      count: number;
    }
  >;
}

export interface DeviceDetailsInfo {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSeenAt?: string | null;
  firmwareVersion?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  deviceKey?: string | null;
  deviceProfileName?: string | null;
}

export interface DeviceDetailsStats {
  uptimePercentage: number;
  dataRate: string;
  messagesInWindow: number;
  totalMessages: number;
  errorCount: number;
  activeAlarms: number;
  lastSeenAgo: string;
}

export interface TelemetryTrendItem {
  timestamp?: string;
  bucket?: string;
  key?: string;
  value?: number | string | boolean;
  messages?: number;
  bytes?: number;
  [key: string]: any;
}

export interface TelemetrySummaryItem {
  key: string;
  min?: number;
  max?: number;
  avg?: number;
  samples?: number;
  latest?: string | number;
  unit?: string;
  normalPercentage?: number;
}

export interface DeviceAlarmHistoryItem {
  id?: string;
  type?: string;
  severity?: string;
  message: string;
  timestamp?: string;
  time?: string;
  color?: string;
}

export interface HourlyActivityItem {
  hour: number;
  messages: number;
}

export interface DeviceAnalyticsDetailsPeriod {
  since: string;
  until: string;
  days: number;
}

export interface SingleDeviceAnalyticsDetails {
  device: DeviceDetailsInfo;
  stats: DeviceDetailsStats;
  telemetryTrend?: TelemetryTrendItem[];
  telemetrySummary?: TelemetrySummaryItem[];
  alarmHistory?: DeviceAlarmHistoryItem[];
  hourlyActivity?: HourlyActivityItem[];
  period?: DeviceAnalyticsDetailsPeriod;

  // Backward compatibility fields
  deviceId?: string;
  deviceName?: string;
  totalMessages?: number;
  activeTime?: number;
  lastActivityTime?: string;
  telemetryStats?: Record<string, any>;
}

export interface DashboardPerformanceMetrics {
  viewsInWindow?: number;
  viewsPerDay?: number;
  avgLoadTimeMs?: number | null;
  p95LoadTimeMs?: number | null;
  errorCount?: number;
  errorRatePercent?: number;
}

export interface DashboardAnalyticsItem {
  dashboardId: string;
  dashboardName: string;
  visibility: 'shared' | 'private' | 'public' | string;
  widgetCount: number;
  lastUpdated: string;
  lastViewedAt: string;
  totalViewCount: number;
  performanceMetrics?: DashboardPerformanceMetrics;
  widgetPerformance?: any[];
}

export interface DashboardAnalyticsSummary {
  totalDashboards: number;
  totalViewsInWindow: number;
}

export interface DashboardAnalyticsPeriod {
  since: string;
  until: string;
  days: number;
}

export interface DashboardAnalyticsResponse {
  dashboards: DashboardAnalyticsItem[];
  summary: DashboardAnalyticsSummary;
  period: DashboardAnalyticsPeriod;
}

export interface SystemAnalytics {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  totalAssets: number;
  totalAlarms: number;
  activeAlarms: number;
  totalMessages: number;
  messagesPerHour: number;
  topDevicesByActivity: Array<{
    deviceId: string;
    deviceName: string;
    messageCount: number;
  }>;
  alarmsBySeverity: Record<string, number>;
  devicesByType: Record<string, number>;
}

export interface SystemPerformanceSummary {
  totalApiCalls: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  maxResponseTime: number;
  totalErrors: number;
  errorRate: number;
  peakUsageHour: string;
}

export interface ApiResponseTrendItem {
  bucket: string;
  avgResponseTime: number;
  calls: number;
  errorRate: number;
}

export interface ErrorBreakdownItem {
  type: string;
  statusCode: number;
  count: number;
  percentage: number;
}

export interface TopEndpointItem {
  endpoint: string;
  calls: number;
  avgResponseTime: number;
  errorRate: number;
}

export interface SystemHealthStatus {
  database: string;
  cache: string;
  messageQueue: string;
  fileStorage: string;
  checkedAt: string;
}

//

export interface SystemAlertItem {
  id?: string;
  title?: string;
  severity?: string;
  message?: string;
  timestamp?: string;
  time?: string;
  color?: string;
  dot?: string;
  [key: string]: any;
}

export interface SystemPerformancePeriod {
  since: string;
  until: string;
}

export interface SystemPerformanceAnalytics {
  summary: SystemPerformanceSummary;
  apiResponseTrend: ApiResponseTrendItem[];
  errorBreakdown: ErrorBreakdownItem[];
  topEndpoints: TopEndpointItem[];
  systemHealth: SystemHealthStatus;
  recentAlerts: SystemAlertItem[];
  period: SystemPerformancePeriod;

  // Optional legacy fields for backward compatibility
  activeDevices?: number;
  inactiveDevices?: number;
  totalAssets?: number;
  totalAlarms?: number;
  alarmsBySeverity?: Record<string, number>;
  totalMessages?: number;
  messagesPerHour?: number;
  topDevicesByActivity?: Array<{
    deviceId: string;
    deviceName: string;
    messageCount: number;
  }>;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface DataConsumptionSummary {
  totalMessages: number;
  avgDailyMessages: number;
  peakHour: string;
  estimatedBytes: number;
  bytesPerRow: number;
  bytesPerRowMeasured: boolean;
  storageEfficiencyPercent: number;
  vsLastPeriodPercent: number | null;
  previousPeriodMessages: number;
}

export interface DataConsumptionTrend {
  bucket: string;
  messages: number;
  estimatedBytes: number;
}

export interface DataConsumptionByType {
  telemetry: number;
  attributes: number;
  commands: number;
  apiCalls: number;
}

export interface DataConsumer {
  type: string;
  id: string;
  name: string;
  messages: number;
  estimatedBytes: number;
  percentage: number;
}

export interface HourlyDistributionItem {
  hour: number;
  messages: number;
}

export interface DataConsumptionPeriod {
  since: string;
  until: string;
  days: number;
}

export interface DataConsumptionAnalytics {
  summary: DataConsumptionSummary;
  trend: DataConsumptionTrend[];
  byType: DataConsumptionByType;
  topConsumers: DataConsumer[];
  hourlyDistribution: HourlyDistributionItem[];
  period: DataConsumptionPeriod;
}
// types/systemOverview.ts

export interface SystemOverviewResponse {
  message: string;
  data: SystemOverviewData;
}

export interface SystemOverviewData {
  devices: DeviceStats;
  users: UserStats;
  alarms: AnalyticsAlarmStats;
  telemetry: TelemetryStats;
  timestamp: string; // ISO date string
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
}

export interface UserStats {
  total: number;
}

export interface AnalyticsAlarmStats {
  active: number;
}

export interface TelemetryStats {
  today: number;
}

// Analytics Overview types - matching actual /analytics/overview endpoint
export interface AnalyticsOverviewDevices {
  total: number;
  online: number;
  offline: number;
  onlinePercentage: number;
}

export interface AnalyticsOverviewTelemetry {
  totalMessagesToday: number;
  totalMessagesThisWeek: number;
  totalMessagesThisMonth: number;
  avgMessagesPerHour: number;
  peakHour: string;
  peakHourMessages: number;
}

export interface AnalyticsOverviewAlarms {
  totalActive: number;
  critical: number;
  error: number;
  warning: number;
  info: number;
  resolvedToday: number;
}

export interface AnalyticsOverviewAssets {
  total: number;
  withDevices: number;
}

export interface AnalyticsOverviewSubscription {
  plan: string;
  devicesUsed: number;
  devicesLimit: number;
  messagesUsed: number;
  messagesLimit: number;
  usagePercentage: number;
}

export interface AnalyticsOverviewData {
  devices: AnalyticsOverviewDevices;
  telemetry: AnalyticsOverviewTelemetry;
  alarms: AnalyticsOverviewAlarms;
  assets: AnalyticsOverviewAssets;
  subscription: AnalyticsOverviewSubscription;
}

export interface AnalyticsOverviewResponse {
  success: boolean;
  data: AnalyticsOverviewData;
  timestamp: string;
}
export const TimeRangeType = {
  lastHour: '1h',
  last24h: '24h',
  lastWeek: '7d',
  last30d: '30d',
  last90d: '90d',
} as const;
export type TimeRangeType = (typeof TimeRangeType)[keyof typeof TimeRangeType];

export interface DeviesAnaltyisParams {
  timeRange?: TimeRangeType;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GeoCentroid {
  latitude: number | null;
  longitude: number | null;
}

export interface GeoDevice {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | string;
  latitude: number | null;
  longitude: number | null;
  location?: string;
  lastSeenAt?: string;
  activeAlarms?: number;
  messagesInWindow?: number;
}

export interface GeoRegionStat {
  region: string;
  deviceCount: number;
  onlineCount: number;
  offlineCount: number;
  messages: number;
  dataGeneratedBytes: number;
  activeAlarms: number;
  alertRate: number;
  centroid: GeoCentroid;
  status: 'online' | 'offline' | string;
}

export interface GeoSummary {
  totalDevices: number;
  locatedDevices: number;
  regions: number;
}

export interface GeoPeriod {
  since: string;
  until: string;
}

export interface GeoAnalyticsData {
  devices?: GeoDevice[];
  regionStats?: GeoRegionStat[];
  summary?: GeoSummary;
  period?: GeoPeriod;
}

export interface GeoAnalyticsResponse {
  success: boolean;
  data: GeoAnalyticsData;
  timestamp?: string;
}

// Backward compatibility aliases if needed
export type GeoStat = GeoRegionStat;
export type DeviceDistribution = GeoDevice;
export type PerformanceMetric = GeoRegionStat;

export interface DeviceAnalyticsListItem {
  id: any;
  deviceId: string;
  name?: string;
  type?: string;
  status?: string;
  dataGeneratedBytes?: number;
  lastSeenAt?: string;
  uptimePercentage?: number;
  activeAlarms?: number;
  alarmCount?: number;
}

export interface DeviceTopGenerator {
  name?: string;
  dataGeneratedBytes?: number;
}

export interface DeviceStatusDistribution {
  online?: number;
  offline?: number;
  maintenance?: number;
}

export interface DevicesAnalyticsMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  totalItems?: number;
}

export interface DevicesAnalyticsOverview {
  devices?: DeviceAnalyticsListItem[];
  topGenerators?: DeviceTopGenerator[];
  statusDistribution?: DeviceStatusDistribution;
  total?: number;
  meta?: DevicesAnalyticsMeta;
}

export const analyticsApi = {
  //get analytics overview
  getAnalyticsOverview: () =>
    apiClient.get<AnalyticsOverviewResponse>('/analytics/overview'),
  // Get time series data
  getTimeSeries: (query: AnalyticsQuery) =>
    apiClient.post<ApiResponse<Record<string, TimeSeriesData[]>>>(
      '/analytics/timeseries',
      query
    ),

  getDevicesAnalytics: (params: DeviesAnaltyisParams = {}) =>
    apiClient.get<ApiResponse<DevicesAnalyticsOverview>>('/analytics/devices', {
      params,
    }),

  // Get device analytics
  getDeviceAnalytics: (deviceId: string, timeRange?: string) =>
    apiClient.get<ApiResponse<SingleDeviceAnalyticsDetails>>(
      `/analytics/devices/${deviceId}`,
      { params: timeRange ? { timeRange } : undefined }
    ),
  // get dashboards analytics
  getDashboardAnalytics: (timeRange?: string) =>
    apiClient.get<ApiResponse<DashboardAnalyticsResponse>>(
      `/analytics/dashboards`,
      { params: timeRange ? { timeRange } : undefined }
    ),

  // Get system analytics
  getSystemAnalytics: (timeRange?: string) =>
    apiClient.get<ApiResponse<SystemPerformanceAnalytics>>(
      '/analytics/system-performance',
      { params: timeRange ? { timeRange } : undefined }
    ),

  // Get telemetry statistics
  getTelemetryStats: (
    entityId: string,
    key: string,
    startTime: number,
    endTime: number
  ) =>
    apiClient.get<ApiResponse<any>>('/analytics/telemetry/stats', {
      params: { entityId, key, startTime, endTime },
    }),
  // get details based on the geo
  getgeoDetails: (region?: string) =>
    apiClient.get<ApiResponse<GeoAnalyticsResponse>>('/analytics/geo', {
      params: { region },
    }),
  // Get device activity report
  getDeviceActivityReport: (startTime: number, endTime: number) =>
    apiClient.get<ApiResponse<any[]>>('/analytics/reports/device-activity', {
      params: { startTime, endTime },
    }),

  // Get alarm analytics
  getAlarmAnalytics: (startTime: number, endTime: number) =>
    apiClient.get<ApiResponse<any>>('/analytics/alarms', {
      params: { startTime, endTime },
    }),

  // Get usage analytics
  getUsageAnalytics: (startTime: number, endTime: number) =>
    apiClient.get<ApiResponse<any>>('/analytics/usage', {
      params: { startTime, endTime },
    }),

  // Generate custom report
  generateReport: (config: {
    name: string;
    type: string;
    startTime: number;
    endTime: number;
    filters?: Record<string, any>;
  }) => apiClient.post<ApiResponse<any>>('/analytics/reports/generate', config),

  // Export analytics data
  exportData: (query: AnalyticsQuery, format: 'CSV' | 'JSON' | 'EXCEL') =>
    apiClient.post<Blob>(
      '/analytics/export',
      { query, format },
      {
        responseType: 'blob',
      }
    ),

  // Get real-time statistics
  getRealTimeStats: () =>
    apiClient.get<ApiResponse<any>>('/analytics/realtime'),

  // Get aggregated data
  getAggregatedData: (
    entityId: string,
    keys: string[],
    startTime: number,
    endTime: number,
    aggregation: 'AVG' | 'SUM' | 'MIN' | 'MAX',
    interval: number
  ) =>
    apiClient.get<ApiResponse<any>>('/analytics/aggregate', {
      params: {
        entityId,
        keys: keys.join(','),
        startTime,
        endTime,
        aggregation,
        interval,
      },
    }),

  // get data-consumption
  getDataConsumption: (timeRange?: string) =>
    apiClient.get<ApiResponse<DataConsumptionAnalytics>>(
      `/analytics/data-consumption${timeRange ? `?timeRange=${timeRange}` : ''}`
    ),

  // get energy details
  getEnergyDetails: (timeRange?: string) =>
    apiClient.get<ApiResponse<any>>(
      `/analytics/energy${timeRange ? `?timeRange=${timeRange}` : ''}`
    ),
};
