import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search as SearchIcon,
  RefreshCw,
  Diamond,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { DashboardTable } from '@/components/common/DashboardTable';
import { useDashboardsPage } from '@/features/dashboard/hooks/useDashboardsPage';
import { ImportDashboardModal } from '@/components/common/ImportDashboardModal';
import { dashboardsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';

export default function DashboardsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const {
    selectedTab,
    dashboards,
    isLoading,
    handleStatusToggle,
    handleAction,
    handleRefresh,
    handleTabChange,
    pagination,
    handleCreateDashboard,
    handleShowCustomerDashboards,
    handleNextPage,
    handlePreviousPage,
    handleFirstPage,
    handleLastPage,
  } = useDashboardsPage();
  // Handle opening import modal
  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };
  // Handle importing dashboard from modal
  const handleImportFromModal = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const dashboardData = JSON.parse(text) as Record<string, unknown>;

      // Import the dashboard via API
      await dashboardsApi.import(dashboardData);

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });

      toast.success('Dashboard imported successfully');

      // Close modal after successful import
      setIsImportModalOpen(false);
    } catch (error: unknown) {
      console.error('Failed to import dashboard:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to import dashboard';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };
  const getNavigationPath = (id: any) => {
    return `/solution-dashboards/${id}`;
  };
  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <PageHeader title={t('solutionDashboards.title')} />

        {/* Tabs */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90 text-white dark:bg-gray-800 dark:text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('solutionDashboards.createNewDashboard')}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 absolute border border-secondary/50 shadow-md rounded-md dark:bg-gray-950 dark:border-gray-700 "
              >
                <DropdownMenuItem
                  onClick={handleCreateDashboard}
                  className="dark:text-white dark:hover:bg-gray-800"
                >
                  {t('solutionDashboards.createNewDashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleOpenImportModal}
                  className="dark:text-white dark:hover:bg-gray-800"
                >
                  {t('solutionDashboards.importDashboard') ||
                    'Import Dashboard'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="border border-gray-300 dark:bg-gray-800 dark:text-white"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="border border-gray-300 dark:bg-gray-800 dark:text-white"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg rounded-xl border-secondary/50 dark:bg-gray-800 dark:text-white">
          <CardContent className="p-6">
            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
              </div>
            ) : (
              <DashboardTable
                linkto="dashboards"
                data={dashboards}
                onStatusToggle={handleStatusToggle}
                onAction={handleAction}
                pagination={pagination}
                handleNextPage={handleNextPage}
                handlePreviousPage={handlePreviousPage}
                handleFirstPage={handleFirstPage}
                handleLastPage={handleLastPage}
                getNavigationPath={getNavigationPath}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Dashboard Modal */}
      <ImportDashboardModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImport={handleImportFromModal}
        isLoading={isImporting}
      />
    </>
  );
}
