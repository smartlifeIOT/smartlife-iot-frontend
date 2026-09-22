import type { Dashboard } from '@/services/api/dashboards.api';

export interface DashboardFilters {
  search?: string;
  public?: boolean;
}

export interface WidgetData {
  widgetId: string;
  data: any;
  loading: boolean;
  error?: string;
}