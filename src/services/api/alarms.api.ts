import apiClient from '@/lib/axios.ts';

export enum AlarmSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  WARNING = 'WARNING',
  INDETERMINATE = 'INDETERMINATE',
}

export enum AlarmStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  CLEARED = 'CLEARED',
}
export type AlertStatus = 'active' | 'acknowledged' | 'cleared' | 'resolved';
export type AlertSeverity = 'critical' | 'error' | 'warning';
export type AlarmStats = {
  active: number;
  acknowledged: number;
  cleared: number;
  resolved: number;
};
export interface AlertsSummaryResponse {
  data: {
    total: number;
    byStatus: AlarmStats;
    bySeverity: severityStats;
    mostTriggered: AlertItem[];
    recent: AlertItem[];
  };
}

interface severityStats {
  critical: number;
  error: number;
  info: number;
  warning: number;
}

export interface AlertItem {
  id: string;
  title: string;
  status: AlertStatus;
  severity: AlertSeverity;
  triggeredAt: string;
  deviceId?: string;
}
export interface AlarmRuleCreateCondition {
  key: string;
  operation:
    | 'GREATER'
    | 'LESS'
    | 'GREATER_OR_EQUAL'
    | 'LESS_OR_EQUAL'
    | 'EQUAL'
    | 'NOT_EQUAL'
    | string;
  value: number | string;
}

export interface AlarmRuleConfig {
  alarmType: string;
  severity: string;
  createCondition: AlarmRuleCreateCondition;
  propagateToParent?: boolean;
}

export interface CreateAlarmRulePayload {
  name: string;
  description?: string;
  severity: string;
  deviceId?: string;
  assetId?: string;
  rule: AlarmRuleConfig;
  isEnabled: boolean;
  autoClear: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook?: string;
  notifications: {
    email: boolean;
    push: boolean;
    webhook?: string;
  };
  userIds: string[];
  emails: string[];
  phones: string[];
  recipients: {
    userIds: string[];
    emails: string[];
  };
  tags: string[];
  details?: string;
  status: 'active' | 'inactive' | string;
}

export interface AlarmRule {
  value: number;
  duration: number; // seconds
  condition:
    | 'GREATER_THAN'
    | 'LESS_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'LESS_THAN_OR_EQUAL'
    | 'EQUAL'
    | 'NOT_EQUAL';
  telemetryKey: string;
}

export interface Alarm {
  note: string;
  id: string;
  type: string;
  originatorId: string;
  originatorType: 'DEVICE' | 'ASSET' | 'ENTITY_VIEW';
  severity: AlarmSeverity;
  status: AlarmStatus;
  startTime: string;
  endTime?: string;
  ackTime?: string;
  clearTime?: string;
  details?: Record<string, any>;
  propagate?: boolean;
  tenantId?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  // UI / enriched fields returned by the backend
  name?: string;
  description?: string;
  currentValue?: string | number;
  rule?: AlarmRule;
  device?: {
    id: string;
    name: string;
  };
}

export interface AlarmQuery {
  search?: string;
  type?: string;
  severity?: AlarmSeverity;
  status?: AlarmStatus;
  originatorId?: string;
  originatorType?: 'DEVICE' | 'ASSET' | 'ENTITY_VIEW';
  tenantId?: string;
  customerId?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const alarmsApi = {
  // Get all alarms
  getAll: (params?: AlarmQuery) =>
    apiClient.get<ApiResponse<PaginatedResponse<Alarm>>>('/alarms', { params }),

  // Get alarm by ID
  getById: (id: string) => apiClient.get<ApiResponse<Alarm>>(`/alarms/${id}`),

  // Create alarm
  create: (data: Partial<Alarm>) =>
    apiClient.post<ApiResponse<Alarm>>('/alarms', data),

  // Update alarm
  update: (id: string, data: Partial<Alarm>) =>
    apiClient.patch<ApiResponse<Alarm>>(`/alarms/${id}`, data),

  // Delete alarm
  delete: (id: string) => apiClient.delete(`/alarms/${id}`),
  // Alarm analytics
  analytics: (timeRange?: string) =>
    apiClient.get<ApiResponse<any>>(
      `/analytics/alarms${timeRange ? `?timeRange=${timeRange}` : ''}`
    ),

  // Acknowledge alarm
  acknowledge: (id: string) =>
    apiClient.post<ApiResponse<Alarm>>(`/alarms/${id}/acknowledge`),

  // Clear alarm
  clear: (id: string) =>
    apiClient.post<ApiResponse<Alarm>>(`/alarms/${id}/clear`),

  // Bulk acknowledge
  bulkAcknowledge: (alarmIds: string[]) =>
    apiClient.post<ApiResponse<any>>('/alarms/bulk/acknowledge', { alarmIds }),

  // Bulk clear
  bulkClear: (alarmIds: string[]) =>
    apiClient.post<ApiResponse<any>>('/alarms/bulk/clear', { alarmIds }),
  // resolve
  resolve: ({ id, note }: { id: string; note: string }) =>
    apiClient.post<ApiResponse<Alarm>>(`/alarms/${id}/resolve`, { note }),

  // Get statistics
  getStatistics: () =>
    apiClient.get<AlertsSummaryResponse>('/alarms/statistics'),

  // Get alarm history
  getHistory: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/alarms/${id}/history`),

  // Get alarms by device
  getByDevice: (deviceId: string) =>
    apiClient.get<ApiResponse<Alarm[]>>(`/alarms/device/${deviceId}`),

  // Get alarms by asset
  getByAsset: (assetId: string) =>
    apiClient.get<ApiResponse<Alarm[]>>(`/alarms/asset/${assetId}`),

  // Get active alarms count
  getActiveCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/alarms/active/count'),

  // Get alarms by severity
  getBySeverity: (severity: AlarmSeverity) =>
    apiClient.get<ApiResponse<Alarm[]>>(`/alarms/severity/${severity}`),

  // Get critical alarms
  getCritical: () =>
    apiClient.get<ApiResponse<Alarm[] | PaginatedResponse<Alarm>>>(
      '/alarms/critical'
    ),

  // Get active alarms
  getActive: () =>
    apiClient.get<ApiResponse<Alarm[] | PaginatedResponse<Alarm>>>(
      '/alarms/active'
    ),

  // Delete alarm
  deleteAlarm: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/alarms/${id}`),

  // Create alarm rule
  createRule: (data: CreateAlarmRulePayload) =>
    apiClient.post<ApiResponse<any>>('/alarms', data),

  // Get alarm escalation history
  getEscalationHistory: (alarmId: string) =>
    apiClient.get<ApiResponse<any[]>>(`/alarms/${alarmId}/escalation-history`),
};
