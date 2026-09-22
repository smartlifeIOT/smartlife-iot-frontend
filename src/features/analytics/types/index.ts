export interface AnalyticsQuery {
  entityId: string;
  keys: string[];
  startTime: number;
  endTime: number;
  interval?: number;
}

export interface MetricData {
  timestamp: number;
  value: number;
}

export interface ReportConfig {
  name: string;
  entityIds: string[];
  metrics: string[];
  startTime: number;
  endTime: number;
}
