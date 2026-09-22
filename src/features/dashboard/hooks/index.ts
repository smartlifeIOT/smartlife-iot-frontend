import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { dashboardsApi } from '@/services/api';
import { dashboardService } from '../services/dashboardService';
import type { Dashboard, DashboardQuery } from '@/services/api/dashboards.api';

// API response structure: { data: { data: T[], total: number, page: number, limit: number, totalPages: number } }
interface ApiResponseWrapper<T> {
  data: {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useDashboards = (params?: DashboardQuery) => {
  return useQuery({
    queryKey: ['dashboards', params],
    queryFn: () => dashboardsApi.getAll(params),
  });
};

export interface UsePaginatedDashboardsOptions {
  initialPage?: number;
  itemsPerPage?: number;
  search?: string;
  tenantId?: string;
  customerId?: string;
  public?: boolean;
  shared?: boolean;
}

export interface UsePaginatedDashboardsReturn {
  dashboards: Dashboard[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => void;
  refetch: () => void;
}

/**
 * Hook for managing paginated dashboards
 */
export const usePaginatedDashboards = (
  options: UsePaginatedDashboardsOptions = {}
): UsePaginatedDashboardsReturn => {
  const {
    initialPage = 1,
    itemsPerPage = 10,
    search,
    tenantId,
    customerId,
    public: isPublic,
    shared,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (search) params.search = search;
    if (tenantId) params.tenantId = tenantId;
    if (customerId) params.customerId = customerId;
    if (isPublic !== undefined) params.public = isPublic;
    if (shared !== undefined) params.shared = shared;

    return params;
  }, [currentPage, itemsPerPage, search, tenantId, customerId, isPublic, shared]);

  // Fetch dashboards
  const {
    data: dashboardsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboards(queryParams);

  // Extract pagination data from response
  const responseData = dashboardsResponse?.data as ApiResponseWrapper<Dashboard> | undefined;
  const dashboards = responseData?.data?.data || [];
  const totalPages = responseData?.data?.totalPages || 0;
  const totalItems = responseData?.data?.total || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    dashboards,
    isLoading,
    isError,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    refetch,
  };
};

export const useDashboard = (dashboardId: string) => {
  return useQuery({
    queryKey: ['dashboards', dashboardId],
    queryFn: () => dashboardService.loadDashboard(dashboardId),
    enabled: !!dashboardId,
  });
};

export const useSystemOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardService.getSystemOverview(),
    refetchInterval: 30000,
  });
};

export const useCreateDashboard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Dashboard>) => dashboardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
};

export { useDashboardsPage } from './useDashboardsPage';
export { useMainDashboard, DASHBOARD_COLORS } from './useMainDashboard';
export type {
  TemperatureDataPoint,
  HumidityDataPoint,
  DashboardStatistics,
} from './useMainDashboard';