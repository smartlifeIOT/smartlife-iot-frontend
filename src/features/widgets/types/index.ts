import type { WidgetType, WidgetTypeCategory } from '@/services/api/widgets.api';

export interface WidgetFilters {
  search?: string;
  category?: WidgetTypeCategory;
  bundleFqn?: string;
}