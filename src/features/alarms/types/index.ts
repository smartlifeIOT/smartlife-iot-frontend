import type { Alarm, AlarmSeverity, AlarmStatus } from '@/services/api/alarms.api';

export interface AlarmFilters {
  search?: string;
  type?: string;
  severity?: AlarmSeverity;
  status?: AlarmStatus;
  originatorId?: string;
}

export interface AlarmMetrics {
  total: number;
  active: number;
  acknowledged: number;
  cleared: number;
  mtta: number;
  mttc: number;
}

export type AlarmAction = 'acknowledge' | 'clear' | 'view' | 'delete';