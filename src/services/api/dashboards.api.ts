import apiClient from '@/lib/axios.ts';

export interface Dashboard {
  name: string;
  id: string;
  title?: string;
  description?: string;
  tenantId?: string;
  customerId?: string;
  userId?: string;
  visibility?: string;
  widgets?: any;
  layout?: {
    cols: number;
    rowHeight: number;
  };
  settings?: {
    autoRefresh: boolean;
    refreshInterval: number;
  };
  filters?: Record<string, any> | null;
  isDefault?: boolean;
  isFavorite?: boolean;
  sharedWith?: any;
  viewCount?: number;
  lastViewedAt?: string;
  tags?: string[] | null;
  configuration?: {
    widgets?: Array<{
      id: string;
      widgetTypeId: string;
      config: any;
      position: {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      dataKeys?: Array<{
        name: string;
        label?: string;
        color?: string;
      }>;
    }>;
    gridSettings?: {
      columns: number;
      margin: number;
      outerMargin: boolean;
      backgroundColor?: string;
    };
    timeWindow?: {
      realtime?: {
        interval: number;
        timewindowMs: number;
      };
      history?: {
        historyType: 'LAST_INTERVAL';
        timewindowMs: number;
      };
    };
  };
  public?: boolean;
  shared?: boolean;
  assignedCustomers?: string[];
  mobileHide?: boolean;
  mobileOrder?: number;
  additionalInfo?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardQuery {
  search?: string;
  tenantId?: string;
  customerId?: string;
  public?: boolean;
  shared?: boolean;
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

export const dashboardsApi = {
  // Get all dashboards
  getAll: (params?: DashboardQuery) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log(accessToken, 'accessToken');
    return apiClient.get<PaginatedResponse<Dashboard>>('/dashboards', {
      params,
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
  },

  // Get dashboard by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Dashboard>>(`/dashboards/${id}`),

  // Create dashboard
  create: (data: Partial<Dashboard>) =>
    apiClient.post<ApiResponse<Dashboard>>('/dashboards', data),

  // Update dashboard
  update: (id: string | number, data: Partial<Dashboard>) =>
    apiClient.patch<ApiResponse<Dashboard>>(`/dashboards/${id}`, data),

  // Add widget to dashboard
  addWidget: (dashboardId: string | number, data: any) =>
    apiClient.post<ApiResponse<any>>(
      `/dashboards/${dashboardId}/widgets`,
      data
    ),

  // Update widget in dashboard
  updateWidget: (dashboardId: string | number, widgetId: string, data: any) =>
    apiClient.patch<ApiResponse<any>>(
      `/dashboards/${dashboardId}/widgets/${widgetId}`,
      data
    ),

  // delete widget
  deleteWidget: (dashboardId: string | number, widgetId: string) =>
    apiClient.delete<ApiResponse<any>>(
      `/dashboards/${dashboardId}/widgets/${widgetId}`
    ),

  // Update dashboard layout (widget positions)
  updateLayout: (dashboardId: string | number, layoutData: any) =>
    apiClient.patch<ApiResponse<any>>(
      `/dashboards/${dashboardId}/layout`,
      layoutData
    ),
  // Delete dashboard
  delete: (id: string) => apiClient.delete(`/dashboards/${id}`),

  // Get statistics
  getStatistics: () =>
    apiClient.get<ApiResponse<any>>('/dashboards/statistics'),

  // Clone dashboard
  clone: (id: string, newTitle: string) =>
    apiClient.post<ApiResponse<Dashboard>>(`/dashboards/${id}/clone`, {
      title: newTitle,
    }),

  // Share dashboard
  share: (id: string, customerIds: string[]) =>
    apiClient.post<ApiResponse<Dashboard>>(`/dashboards/${id}/share`, {
      customerIds,
    }),

  // Unshare dashboard
  unshare: (id: string, customerId: string) =>
    apiClient.delete<ApiResponse<Dashboard>>(
      `/dashboards/${id}/share/${customerId}`
    ),

  // Make dashboard public
  makePublic: (id: string) =>
    apiClient.patch<ApiResponse<Dashboard>>(`/dashboards/${id}/public`, {
      public: true,
    }),

  // Make dashboard private
  makePrivate: (id: string) =>
    apiClient.patch<ApiResponse<Dashboard>>(`/dashboards/${id}/public`, {
      public: false,
    }),

  // Export dashboard
  export: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/dashboards/${id}/export`),

  // Import dashboard
  import: (dashboardData: any) =>
    apiClient.post<ApiResponse<Dashboard>>('/dashboards/import', dashboardData),
};
