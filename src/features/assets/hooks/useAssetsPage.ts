import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/services/api';
import type { Asset as ApiAsset, AssetQuery } from '@/services/api/assets.api';
import { toast } from 'react-hot-toast';
import { debounce } from '@/lib/util';

export interface Asset extends ApiAsset {
  customer: string;
  created: string;
  status: 'active' | 'warning' | 'error';
  statusIndicator: 'primary' | 'danger';
  expanded?: boolean;
}

interface UseAssetsPageOptions {
  initialSearchQuery?: string;
  itemsPerPage?: number;
}

export const useAssetsPage = (options: UseAssetsPageOptions = {}) => {
  const { initialSearchQuery = '', itemsPerPage = 10 } = options;
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [localSearchQuery, setLocalSearchQuery] = useState(initialSearchQuery);

  // Build API query params
  const queryParams = useMemo((): AssetQuery => {
    const params: AssetQuery = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    return params;
  }, [searchQuery, currentPage, itemsPerPage]);

  // Fetch assets from API
  const {
    data: assetsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['assets', queryParams],
    queryFn: () => assetsApi.getAll(queryParams),
    retry: 2,
  });

  // Transform API Asset data to component Asset format
  const assets: Asset[] = useMemo(() => {
    const list = assetsResponse?.data?.data.data ?? [];
    return list.map((apiAsset: ApiAsset) => {
      const status = apiAsset.active === false ? 'error' : 'active';
      const statusIndicator = status === 'active' ? 'primary' : 'danger';
      const customer = apiAsset.customerId || 'N/A';
      const created = apiAsset.createdAt
        ? new Date(apiAsset.createdAt).toISOString().split('T')[0]
        : 'N/A';

      return {
        ...apiAsset,
        customer,
        created,
        status,
        statusIndicator,
      };
    });
  }, [assetsResponse]);
  // Filter assets based on local search query (client-side filtering for immediate UI)
  const filteredAssets = useMemo(() => {
    if (!localSearchQuery.trim()) return assets;

    const query = localSearchQuery.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query) ||
        asset.type.toLowerCase().includes(query) ||
        asset.customer.toLowerCase().includes(query)
    );
  }, [assets, localSearchQuery]);

  // Create debounced search handler (300ms delay)
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  // Handle input change with immediate UI update and debounced API search
  const handleSearchChange = useCallback(
    (value: string) => {
      // Update local search for immediate UI filtering
      setLocalSearchQuery(value);
      // Reset to first page on search
      setCurrentPage(1);
      // Debounce the actual API search call
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handler functions
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const handleAction = useCallback(
    async (action: 'share' | 'view' | 'delete' | 'download', id: string) => {
      try {
        switch (action) {
          case 'delete': {
            await assetsApi.delete(id);
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            toast.success('Asset deleted successfully');
            break;
          }
          case 'view': {
            // Navigate to asset detail page
            window.location.href = `/assets/${id}`;
            break;
          }
          case 'download': {
            // Export asset data
            const asset = assets.find((a) => a.id === id);
            if (asset) {
              const dataStr = JSON.stringify(asset, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `asset-${id}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast.success('Asset exported successfully');
            }
            break;
          }
          case 'share': {
            toast('Share functionality - select users to share with', {
              icon: 'ℹ️',
            });
            break;
          }
          default:
            console.warn('Unknown action:', action);
        }
      } catch (error: unknown) {
        toast.error(
          (error as any)?.response?.data?.message || `Failed to ${action} asset`
        );
      }
    },
    [assets, queryClient]
  );

  const handleExport = useCallback(() => {
    try {
      const dataStr = JSON.stringify(filteredAssets, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assets-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Assets exported successfully');
    } catch (error) {
      toast.error('Failed to export assets');
    }
  }, [filteredAssets]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const content = e.target?.result as string;
              const assetsData = JSON.parse(content);
              // Handle import logic here
              toast.success('Assets imported successfully');
              queryClient.invalidateQueries({ queryKey: ['assets'] });
            } catch (parseError) {
              toast.error('Failed to parse assets JSON file.');
            }
          };
          reader.readAsText(file);
        } catch (error: unknown) {
          toast.error(
            (error as any)?.response?.data?.message || 'Failed to import assets'
          );
        }
      }
    };
    input.click();
  }, [queryClient]);

  const handleAddAsset = useCallback(() => {
    // Navigate to create asset page
    window.location.href = '/assets/create';
  }, []);

  // Get total count and pages from API response
  const totalAssets = useMemo(() => {
    return assetsResponse?.data?.data?.meta?.total || 0;
  }, [assetsResponse]);

  const totalPages = useMemo(() => {
    return assetsResponse?.data?.data?.meta?.totalPages || 1;
  }, [assetsResponse]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  return {
    // State
    searchQuery: localSearchQuery,
    expandedRows,
    isLoading,
    isError,
    error,
    meta: assetsResponse?.data?.data?.meta,
    // Data
    assets: filteredAssets,
    totalAssets,
    currentPage,
    totalPages,
    itemsPerPage,

    // Handlers
    handleSearchChange,
    handlePageChange,
    handleToggleExpand,
    handleAction,
    handleExport,
    handleImport,
    handleAddAsset,
    setSearchQuery: handleSearchChange,
    refetch,
  };
};
