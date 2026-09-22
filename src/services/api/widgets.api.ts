import apiClient from '@/lib/axios';

// Widget Type Categories
export enum WidgetTypeCategory {
  ALARM_WIDGETS = 'ALARM_WIDGETS',
  ANALOG_GAUGES = 'ANALOG_GAUGES',
  CARDS = 'CARDS',
  CHARTS = 'CHARTS',
  CONTROL_WIDGETS = 'CONTROL_WIDGETS',
  DATE_WIDGETS = 'DATE_WIDGETS',
  GAUGES = 'GAUGES',
  GPIO_WIDGETS = 'GPIO_WIDGETS',
  INPUT_WIDGETS = 'INPUT_WIDGETS',
  MAPS = 'MAPS',
  NAVIGATION_WIDGETS = 'NAVIGATION_WIDGETS',
  TABLES = 'TABLES',
  OTHER = 'OTHER',
}

export interface WidgetType {
  id: string;
  name: string;
  description?: string | null;
  category: WidgetTypeCategory | string;
  bundleFqn?: string | null;
  image?: string | null;
  iconUrl?: string | null;
  descriptor?: {
    type: 'timeseries' | 'latest' | 'rpc' | 'alarm' | 'static' | string;
    alias?: string;
    sizeX: number;
    sizeY: number;
    minSizeX?: number;
    minSizeY?: number;
    maxSizeX?: number;
    maxSizeY?: number;
    resources?: Array<{ url: string }>;
    templateHtml?: string;
    templateCss?: string;
    controllerScript?: string;
    settingsSchema?: Record<string, any>;
    dataKeySettingsSchema?: Record<string, any>;
    dataConfig?: Record<string, any>;
    defaultConfig?: Record<string, any>;
  };
  settingsTemplate?: Record<string, any> | null;
  tags?: string[];
  system?: boolean;
  deprecated?: boolean;
  tenantId?: string | null;
  additionalInfo?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetBundle {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  order?: number;
  system?: boolean;
  tenantId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetTypeQuery {
  search?: string;
  category?: WidgetTypeCategory;
  bundleFqn?: string;
  tenantId?: string;
  system?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface WidgetBundleQuery {
  search?: string;
  tenantId?: string;
  system?: boolean;
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

// Widget Types API
export const widgetTypesApi = {
  // Get all widget types
  getAll: (params?: WidgetTypeQuery) =>
    apiClient.get<PaginatedResponse<WidgetType>>('/widgets/types', { params }),

  // Get widget type by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<WidgetType>>(`/widgets/types/${id}`),

  // Create widget type
  create: (data: Partial<WidgetType>) =>
    apiClient.post<ApiResponse<WidgetType>>('/widgets/types', data),

  // Update widget type
  update: (id: string, data: Partial<WidgetType>) =>
    apiClient.patch<ApiResponse<WidgetType>>(`/widgets/types/${id}`, data),

  // Delete widget type
  delete: (id: string) =>
    apiClient.delete(`/widgets/types/${id}`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/widgets/types/statistics'),

  // Get by category
  getByCategory: (category: WidgetTypeCategory) =>
    apiClient.get<ApiResponse<WidgetType[]>>(`/widgets/types/category/${category}`),

  // Get by bundle
  getByBundle: (bundleFqn: string) =>
    apiClient.get<ApiResponse<WidgetType[]>>(`/widgets/types/bundle/${bundleFqn}`),

  // Export widget type
  export: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/widgets/types/${id}/export`),

  // Import widget type
  import: (widgetData: any) =>
    apiClient.post<ApiResponse<WidgetType>>('/widgets/types/import', widgetData),

  // Clone widget type
  clone: (id: string, newName: string) =>
    apiClient.post<ApiResponse<WidgetType>>(`/widgets/types/${id}/clone`, { name: newName }),
};

// Widget Bundles API
export const widgetBundlesApi = {
  // Get all widget bundles
  getAll: (params?: WidgetBundleQuery) =>
    apiClient.get<PaginatedResponse<WidgetBundle>>('/widgets/bundles', { params }),

  // Get widget bundle by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<WidgetBundle>>(`/widgets/bundles/${id}`),

  // Create widget bundle
  create: (data: Partial<WidgetBundle>) =>
    apiClient.post<ApiResponse<WidgetBundle>>('/widgets/bundles', data),

  // Update widget bundle
  update: (id: string, data: Partial<WidgetBundle>) =>
    apiClient.patch<ApiResponse<WidgetBundle>>(`/widgets/bundles/${id}`, data),

  // Delete widget bundle
  delete: (id: string) =>
    apiClient.delete(`/widgets/bundles/${id}`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/widgets/bundles/statistics'),

  // Get widgets in bundle
  getWidgets: (id: string) =>
    apiClient.get<ApiResponse<WidgetType[]>>(`/widgets/bundles/${id}/widgets`),

  // Add widget to bundle
  addWidget: (bundleId: string, widgetId: string) =>
    apiClient.post(`/widgets/bundles/${bundleId}/widgets/${widgetId}`),

  // Remove widget from bundle
  removeWidget: (bundleId: string, widgetId: string) =>
    apiClient.delete(`/widgets/bundles/${bundleId}/widgets/${widgetId}`),
};

// Combined widgets API
export const widgetsApi = {
  types: widgetTypesApi,
  bundles: widgetBundlesApi,
};