import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDashboards } from './index';
import { dashboardsApi } from '@/services/api';
import type { Dashboard, DashboardQuery } from '@/services/api/dashboards.api';
import type { DashboardTableItem } from '@/components/common/DashboardTable';

// API response structure: { json: { data: T[], total: number, page: number, limit: number, totalPages: number } }
interface ApiResponseWrapper<T> {
  data: {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type DashboardTab = 'all' | 'group';

interface UseDashboardsPageOptions {
  initialTab?: DashboardTab;
  searchQuery?: string;
}

/**
 * Hook for managing dashboards page state and operations
 */
export const useDashboardsPage = (options: UseDashboardsPageOptions = {}) => {
  const { initialTab = 'all', searchQuery = '' } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState<DashboardTab>(initialTab);
  const [search, setSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);

  // Build query params based on tab and search
  const queryParams = useMemo((): DashboardQuery => {
    const params: DashboardQuery = {
      page: currentPage,
      limit: 10,
    };

    if (search) {
      params.search = search;
    }

    // If group tab is selected, filter by shared dashboards
    if (selectedTab === 'group') {
      params.shared = true;
    }

    return params;
  }, [selectedTab, search, currentPage]);

  // Fetch dashboards
  const {
    data: dashboardsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboards(queryParams);
  // Extract pagination info from response
  const paginationInfo = useMemo(() => {
    const responseData = dashboardsResponse?.data as
      | ApiResponseWrapper<Dashboard>
      | undefined;
    if (!responseData?.data) {
      return {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
      };
    }
    return {
      currentPage: responseData.data.page || 1,
      totalPages: responseData.data.totalPages || 0,
      totalItems: responseData.data.total || 0,
      itemsPerPage: responseData.data.limit || 10,
    };
  }, [dashboardsResponse]);

  // Transform API Dashboard data to DashboardTableItem format
  // API response structure: { data: { data: [...], total, page, limit, totalPages } }
  const dashboards: DashboardTableItem[] = useMemo(() => {
    // Type assertion for nested response structure
    const responseData = dashboardsResponse?.data as
      | ApiResponseWrapper<Dashboard>
      | undefined;
    if (!responseData?.data?.data || !Array.isArray(responseData.data.data)) {
      return [];
    }

    return responseData.data.data.map((dashboard: Dashboard) => {
      // Determine tag and color based on additionalInfo or default
      const tag = dashboard.additionalInfo?.tag;
      const tagColorMap: Record<string, string> = {
        City: 'bg-blue-100 text-blue-700',
        Energy: 'bg-green-100 text-green-700',
        Transport: 'bg-yellow-100 text-yellow-700',
        General: 'bg-gray-100 text-gray-700',
      };
      const tagColor =
        dashboard.additionalInfo?.tagColor ||
        tagColorMap[tag] ||
        tagColorMap.General;

      // Format created time
      const createdTime = dashboard.createdAt
        ? new Date(dashboard.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : '';

      // Determine status - use public field or additionalInfo.status
      const status: 'active' | 'deactivate' =
        dashboard.public !== false &&
        dashboard.additionalInfo?.status !== 'deactivate'
          ? 'active'
          : 'deactivate';

      // Get customer name from customerId or additionalInfo
      const customerName =
        dashboard.additionalInfo?.customerName || dashboard.customerId || 'N/A';

      return {
        id: dashboard.id,
        title: dashboard.title || dashboard.name,
        tag,
        tagColor,
        createdTime,
        status,
        customerName,
      };
    });
  }, [dashboardsResponse]);

  // Handle status toggle (active/deactivate)
  const handleStatusToggle = async (id: string) => {
    try {
      const dashboard = dashboards.find((d) => d.id === id);
      if (!dashboard) {
        toast.error('Dashboard not found');
        return;
      }

      const newStatus = dashboard.status === 'active' ? 'deactivate' : 'active';

      // Update dashboard - toggle public status or update additionalInfo
      await dashboardsApi.update(id, {
        public: newStatus === 'active',
        additionalInfo: {
          status: newStatus,
        },
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast.success(
        `Dashboard ${
          newStatus === 'active' ? 'activated' : 'deactivated'
        } successfully`
      );
    } catch (error: unknown) {
      console.error('Failed to toggle dashboard status:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update dashboard status';
      toast.error(errorMessage);
    }
  };

  // Handle actions (share, view, delete, download)
  const handleAction = async (
    action: 'share' | 'view' | 'delete' | 'download',
    id: string
  ) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/dashboards/${id}`);
          break;

        case 'delete':
          await dashboardsApi.delete(id);
          queryClient.invalidateQueries({ queryKey: ['dashboards'] });
          toast.success('Dashboard deleted successfully');
          break;

        case 'download': {
          const exportData = await dashboardsApi.export(id);
          // Create a blob and download
          const blob = new Blob(
            [JSON.stringify(exportData.data.data, null, 2)],
            {
              type: 'application/json',
            }
          );
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `dashboard-${id}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Dashboard exported successfully');
          break;
        }

        case 'share':
          // This would typically open a modal to select customers
          // For now, just show a message
          toast('Share functionality - select customers to share with', {
            icon: 'ℹ️',
          });
          break;

        default:
          console.warn('Unknown action:', action);
      }
    } catch (error: unknown) {
      console.error(`Failed to ${action} dashboard:`, error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || `Failed to ${action} dashboard`;
      toast.error(errorMessage);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch().then(() => {
      toast.success('Dashboards refreshed', { id: 'dashboards-refreshed' });
    });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearch(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle tab change
  const handleTabChange = (tab: DashboardTab) => {
    setSelectedTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle create new dashboard
  const handleCreateDashboard = () => {
    navigate('/solution-dashboards/create');
  };

  // Handle import dashboard
  const handleImportDashboard = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const dashboardData = JSON.parse(text) as Record<string, unknown>;

          // Import the dashboard
          await dashboardsApi.import(dashboardData);
          queryClient.invalidateQueries({ queryKey: ['dashboards'] });
          toast.success('Dashboard imported successfully');
        } catch (error: unknown) {
          console.error('Failed to import dashboard:', error);
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to import dashboard';
          toast.error(errorMessage);
        }
      };
      input.click();
    } catch (error: unknown) {
      console.error('Failed to import dashboard:', error);
      toast.error('Failed to import dashboard');
    }
  };

  // Handle show customer dashboards
  const handleShowCustomerDashboards = () => {
    // This could filter by customer or open a modal
    toast('Filtering by customer dashboards', {
      icon: 'ℹ️',
    });
    // You could add a filter state here
  };
  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };
  const handleFirstPage = () => {
    setCurrentPage(1);
  };
  const handleLastPage = () => {
    setCurrentPage(paginationInfo.totalPages);
  };

  return {
    // State
    selectedTab,
    search,
    dashboards,
    isLoading,
    isError,
    error,
    pagination: paginationInfo,

    // Actions
    handleStatusToggle,
    handleAction,
    handleRefresh,
    handleSearch,
    handleTabChange,
    handlePageChange,
    handleCreateDashboard,
    handleImportDashboard,
    handleShowCustomerDashboards,
    handleNextPage,
    handlePreviousPage,
    handleFirstPage,
    handleLastPage,
    // Direct access to refetch
    refetch,
  };
};
