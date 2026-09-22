import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Layout } from 'react-grid-layout';
import {
  WidgetCanvas,
  Widget,
} from '@/components/common/WidgetCanvas/WidgetCanvas';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardsApi } from '@/services/api';
import { useDashboardStore } from '@/stores/useDashboardStore';
import toast from 'react-hot-toast';

export default function WidgetEditorPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    widgets,
    layout,
    initFromDashboard,
    saveDashboard,
    setWidgets,
    setLayout,
  } = useDashboardStore();

  // Fetch dashboard data if editing an existing dashboard
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard', id],
    queryFn: () => {
      if (!id) throw new Error('Dashboard ID is required');
      return dashboardsApi.getById(id);
    },
    enabled: !!id,
  });

  const dashboard = (dashboardData?.data as any)?.data || dashboardData?.data;

  const dashboardId = useDashboardStore((s) => s.dashboardId);

  // Load saved layout/widgets from the fetched dashboard configuration into store ONLY once when dashboard ID changes
  useEffect(() => {
    if (dashboard && dashboard.id && dashboardId !== dashboard.id) {
      initFromDashboard(dashboard);
    }
  }, [dashboard, dashboardId, initFromDashboard]);

  /**
   * Called by WidgetCanvas "Save Layout" button.
   * Saves widgets and layout into Zustand store and sends API update request.
   */
  const handleSaveLayout = async (
    newLayout: Layout[],
    newWidgets: Widget[]
  ) => {
    if (!id) {
      toast.error('Dashboard ID is missing. Cannot save dashboard.');
      return;
    }

    setWidgets(newWidgets);
    setLayout(newLayout);

    const success = await saveDashboard(id);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['dashboard', id] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-gray-500">
            {(error as Error)?.message || 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {dashboard?.name || 'Dashboard Editor'}
          </h1>
          <p className="text-xs text-gray-500">
            Add widgets → configure device &amp; telemetry settings → save to
            &nbsp;<code className="font-mono text-primary">/dashboards</code>
          </p>
        </div>
      </div>

      {/* Canvas */}
      <Card>
        <CardContent
          className="p-0"
          style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}
        >
          <WidgetCanvas
            onSaveLayout={handleSaveLayout}
            initialLayout={layout}
            initialWidgets={widgets}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            How to use:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>
              Click <strong>"Widget Library"</strong> to browse Smart Life
              widget bundles and add widgets
            </li>
            <li>
              Click the <strong>⚙ Settings</strong> icon on any widget header to
              open the Device &amp; Telemetry Settings modal
            </li>
            <li>
              Select one or more <strong>devices</strong> and
              <strong> telemetry keys</strong> (e.g.&nbsp;temperature, humidity)
              to bind the widget to real data
            </li>
            <li>
              Drag and resize widgets to arrange your dashboard layout and it
              will be auto saved
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
