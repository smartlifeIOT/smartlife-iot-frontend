import { create } from 'zustand';
import type { Layout } from 'react-grid-layout';
import type {
  Widget,
  WidgetDataSource,
  WidgetVisualization,
} from '@/components/common/WidgetCanvas/widgetCanvasUtils';
import {
  buildDashboardPayload,
  buildSingleWidgetPayload,
} from '@/components/common/WidgetCanvas/widgetCanvasUtils';
import { dashboardsApi, Dashboard } from '@/services/api/dashboards.api';
import toast from 'react-hot-toast';

export function extractWidgetsFromDashboard(dashboard: any): any[] {
  if (!dashboard) return [];

  let rawWidgets = dashboard.widgets ?? dashboard.configuration?.widgets;
  if (!rawWidgets) return [];

  // Flatten nested arrays if backend returns [[widget1, widget2]]
  while (
    Array.isArray(rawWidgets) &&
    rawWidgets.length > 0 &&
    Array.isArray(rawWidgets[0])
  ) {
    rawWidgets = rawWidgets.flat();
  }

  return Array.isArray(rawWidgets) ? rawWidgets : [];
}

interface DashboardState {
  dashboardId: string | null;
  currentDashboard: Dashboard | null;
  widgets: Widget[];
  layout: Layout[];
  isSaving: boolean;

  // Actions
  setDashboard: (dashboard: Dashboard) => void;
  setWidgets: (widgets: Widget[]) => void;
  setLayout: (layout: Layout[]) => void;
  initFromDashboard: (dashboard: Dashboard) => void;
  saveDashboard: (id: string) => Promise<boolean>;
  addWidgetToApi: (
    id: string,
    widget: Widget,
    layoutItem?: Layout
  ) => Promise<void>;
  saveWidgetToApi: (
    dashboardId: string,
    widgetId: string,
    dataSource: WidgetDataSource,
    visualization: WidgetVisualization,
    title?: string,
    config?: { minValue?: number; maxValue?: number }
  ) => Promise<boolean>;
  deleteWidgetFromApi: (dashboardId: string, widgetId: string) => Promise<void>;
  updateWidgetSettings: (
    widgetId: string,
    dataSource: WidgetDataSource,
    visualization: WidgetVisualization,
    title?: string,
    config?: { minValue?: number; maxValue?: number }
  ) => void;
  updateLayoutToApi: (dashboardId: string, layout: Layout[]) => Promise<void>;
  addWidget: (widget: Widget, layoutItem: Layout) => void;
  removeWidget: (widgetId: string) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboardId: null,
  currentDashboard: null,
  widgets: [],
  layout: [],
  isSaving: false,

  setDashboard: (dashboard) =>
    set({ currentDashboard: dashboard, dashboardId: dashboard.id }),
  setWidgets: (widgets) => set({ widgets }),
  setLayout: (layout) => set({ layout }),

  initFromDashboard: (dashboard) => {
    if (!dashboard) return;
    const rawWidgets = extractWidgetsFromDashboard(dashboard);

    const mappedWidgets: Widget[] = rawWidgets.map((w: any, index: number) => {
      const widgetId = w.id || `widget-${Date.now()}-${index}`;
      const type =
        w.widgetTypeAlias ||
        w.type ||
        w.config?.chartType ||
        w.visualization?.chartType ||
        'pie-chart';
      const title = w.title || w.config?.title || type;
      const position = w.position || {
        x: w.col ?? (index * 4) % 12,
        y: w.row ?? Math.floor((index * 4) / 12) * 4,
        w: w.width ?? 4,
        h: w.height ?? 4,
      };

      const rawDs = w.dataSource || w.datasource;
      const primaryDeviceId =
        rawDs?.deviceId || rawDs?.deviceIds?.[0] || w.config?.deviceId || '';

      const deviceIds =
        Array.isArray(rawDs?.deviceIds) && rawDs.deviceIds.length > 0
          ? rawDs.deviceIds
          : primaryDeviceId
            ? [primaryDeviceId]
            : [];

      const dataSource: WidgetDataSource = {
        deviceIds,
        deviceName: rawDs?.deviceName || w.config?.deviceName,
        telemetryKeys: rawDs?.telemetryKeys || w.config?.enabledMetrics || [],
        timeRange: rawDs?.timeRange || rawDs?.timeWindow || '24h',
      };

      const visualization: WidgetVisualization = w.visualization || {
        chartType: w.config?.chartType || w.widgetTypeAlias || 'line',
        colors: w.config?.colors || ['#3b82f6'],
        showLegend: w.config?.showLegend ?? true,
      };

      const config = w.config || {
        deviceId: primaryDeviceId,
        enabledMetrics: dataSource.telemetryKeys,
        refreshInterval: 5000,
      };

      return {
        id: widgetId,
        widgetTypeId: w.widgetTypeId,
        type,
        title,
        position,
        dataSource,
        visualization,
        filters: w.filters || {},
        config,
      };
    });

    const mappedLayout: Layout[] = mappedWidgets.map((w) => ({
      i: w.id,
      x: w.position?.x ?? 0,
      y: w.position?.y ?? 0,
      w: w.position?.w ?? 4,
      h: w.position?.h ?? 4,
    }));

    set({
      dashboardId: dashboard.id,
      currentDashboard: dashboard,
      widgets: mappedWidgets,
      layout: mappedLayout,
    });
  },

  saveDashboard: async (id: string) => {
    const { widgets, layout } = get();
    set({ isSaving: true });
    try {
      const payload = buildDashboardPayload(widgets, layout);

      // Send POST /dashboards/:dashboardId/widgets for each widget
      for (const widget of widgets) {
        const layoutItem = layout.find((l) => l.i === widget.id);
        const singlePayload = buildSingleWidgetPayload(widget, layoutItem);
        try {
          await dashboardsApi.addWidget(id, singlePayload);
        } catch (widgetErr) {
          console.warn(`[POST /dashboards/${id}/widgets]`, widgetErr);
        }
      }

      const res = await dashboardsApi.update(id, payload as Partial<Dashboard>);
      const updatedDashboard = (res?.data as any)?.data || res?.data || payload;

      set((state) => ({
        currentDashboard: state.currentDashboard
          ? {
              ...state.currentDashboard,
              ...updatedDashboard,
              widgets: payload.widgets,
              layout: payload.layout,
            }
          : (updatedDashboard as Dashboard),
        isSaving: false,
      }));

      toast.success('Dashboard saved successfully!');
      return true;
    } catch (err: unknown) {
      const apiError =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to save dashboard';
      toast.error(apiError);
      set({ isSaving: false });
      return false;
    }
  },

  addWidgetToApi: async (id: string, widget: Widget, layoutItem?: Layout) => {
    const singlePayload = buildSingleWidgetPayload(widget, layoutItem);
    try {
      await dashboardsApi.addWidget(id, singlePayload);
      console.log(`[POST /dashboards/${id}/widgets] Success:`, singlePayload);
    } catch (err) {
      console.error(`[POST /dashboards/${id}/widgets] Error:`, err);
    }
  },

  saveWidgetToApi: async (
    dashboardId: string,
    widgetId: string,
    dataSource: WidgetDataSource,
    visualization: WidgetVisualization,
    title?: string,
    config?: { minValue?: number; maxValue?: number }
  ) => {
    const { widgets, layout } = get();
    const targetWidget = widgets.find((w) => w.id === widgetId);
    if (!targetWidget) return false;

    const layoutItem = layout.find((l) => l.i === widgetId);
    const updatedWidget: Widget = {
      ...targetWidget,
      title: title || targetWidget.title,
      dataSource,
      visualization,
      config: {
        ...targetWidget.config,
        deviceId: dataSource.deviceIds[0],
        enabledMetrics: dataSource.telemetryKeys as any,
        ...(config
          ? { minValue: config.minValue, maxValue: config.maxValue }
          : {}),
      },
    };

    const isTemporaryId =
      typeof widgetId === 'string' &&
      widgetId.startsWith('widget-') &&
      /^\d+/.test(widgetId.replace('widget-', ''));
    const isExistingWidget = !isTemporaryId;

    const singlePayload = buildSingleWidgetPayload(
      updatedWidget,
      layoutItem,
      isExistingWidget
    );

    try {
      let res;
      if (isExistingWidget) {
        try {
          res = await dashboardsApi.updateWidget(
            dashboardId,
            widgetId,
            singlePayload
          );
        } catch (updateErr: any) {
          // Only fallback to POST if the server returned 404 Not Found (meaning widget was not saved on server yet)
          if (updateErr?.response?.status === 404) {
            console.warn(
              `[PATCH /dashboards/${dashboardId}/widgets/${widgetId}] returned 404, attempting POST`,
              updateErr
            );
            const createPayload = buildSingleWidgetPayload(
              updatedWidget,
              layoutItem,
              false
            );
            res = await dashboardsApi.addWidget(dashboardId, createPayload);
          } else {
            throw updateErr;
          }
        }
      } else {
        res = await dashboardsApi.addWidget(dashboardId, singlePayload);
      }
      const apiResponseData = (res?.data as any)?.data || res?.data;

      // 1. If backend returned the full updated dashboard, re-initialize store directly
      const extractedWidgets = extractWidgetsFromDashboard(apiResponseData);
      if (
        apiResponseData &&
        extractedWidgets.length > 0 &&
        (apiResponseData.id === dashboardId ||
          apiResponseData.configuration ||
          apiResponseData.widgets)
      ) {
        get().initFromDashboard(apiResponseData);
        toast.success(`Widget "${updatedWidget.title}" saved to dashboard!`);
        return true;
      }

      // 2. Fetch fresh dashboard data from API so all newly assigned server UUIDs are synced
      try {
        const freshRes = await dashboardsApi.getById(dashboardId);
        const freshDashboard = (freshRes?.data as any)?.data || freshRes?.data;
        if (
          freshDashboard &&
          extractWidgetsFromDashboard(freshDashboard).length > 0
        ) {
          get().initFromDashboard(freshDashboard);
          toast.success(`Widget "${updatedWidget.title}" saved to dashboard!`);
          return true;
        }
      } catch (freshErr) {
        console.warn(
          '[saveWidgetToApi] Could not fetch fresh dashboard, falling back to local update',
          freshErr
        );
      }

      // 3. Fallback: single widget response handling or local state update
      let finalId = widgetId;
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (apiResponseData) {
        const possibleWidgetId =
          apiResponseData.id || apiResponseData._id || apiResponseData.widgetId;

        // If response is a single widget object and its ID is NOT the dashboard ID
        if (possibleWidgetId && possibleWidgetId !== dashboardId) {
          finalId = possibleWidgetId;
        } else if (extractedWidgets.length > 0) {
          let matched = extractedWidgets.find(
            (w: any) =>
              (w.id && w.id === widgetId) || (w._id && w._id === widgetId)
          );
          if (!matched) {
            matched =
              extractedWidgets.find(
                (w: any) =>
                  (w.row === singlePayload.row &&
                    w.col === singlePayload.col) ||
                  w.title === singlePayload.title ||
                  w.widgetTypeId === singlePayload.widgetTypeId
              ) || extractedWidgets[extractedWidgets.length - 1];
          }
          if (matched) {
            const matchedId = matched.id || matched._id;
            if (matchedId && matchedId !== dashboardId) {
              finalId = matchedId;
            }
          }
        }
      }

      // Safeguard: Never allow dashboardId to become finalId for a widget
      if (finalId === dashboardId) {
        finalId = uuidRegex.test(widgetId) ? widgetId : `widget-${Date.now()}`;
      }

      const finalWidget: Widget = {
        ...updatedWidget,
        id: finalId,
        position: {
          x: singlePayload.col,
          y: singlePayload.row,
          w: singlePayload.width,
          h: singlePayload.height,
        },
      };

      set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === widgetId ? finalWidget : w
        ),
        layout: state.layout.map((l) =>
          l.i === widgetId
            ? {
                ...l,
                i: finalId,
                x: singlePayload.col,
                y: singlePayload.row,
                w: singlePayload.width,
                h: singlePayload.height,
              }
            : l
        ),
      }));

      toast.success(`Widget "${updatedWidget.title}" saved to dashboard!`);
      return true;
    } catch (err: unknown) {
      const apiError =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to save widget to API';
      console.error('[POST /dashboards/:id/widgets] Error:', apiError);
      toast.error(apiError);

      set((state) => ({
        widgets: state.widgets.map((w) =>
          w.id === widgetId ? updatedWidget : w
        ),
      }));
      return false;
    }
  },

  updateWidgetSettings: (
    widgetId,
    dataSource,
    visualization,
    title?,
    config?
  ) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              title: title || w.title,
              dataSource,
              visualization,
              config: {
                ...w.config,
                deviceId: dataSource.deviceIds[0],
                enabledMetrics: dataSource.telemetryKeys as any,
                ...(config
                  ? { minValue: config.minValue, maxValue: config.maxValue }
                  : {}),
              },
            }
          : w
      ),
    }));
  },

  updateLayoutToApi: async (dashboardId: string, newLayout: Layout[]) => {
    const { widgets } = get();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Only send layout update when all widgets have been saved (have UUID IDs)
    const allSaved = newLayout.every((item) => uuidRegex.test(item.i));
    if (!allSaved) {
      console.log('[Layout] Skipping API call — unsaved widgets detected');
      return;
    }

    const layoutPayload = newLayout
      .map((item) => {
        const widget = widgets.find((w) => w.id === item.i);
        if (!widget) return null;
        return {
          id: item.i,
          row: typeof item.y === 'number' && isFinite(item.y) ? item.y : 0,
          col: typeof item.x === 'number' && isFinite(item.x) ? item.x : 0,
          width: typeof item.w === 'number' && isFinite(item.w) ? item.w : 4,
          height: typeof item.h === 'number' && isFinite(item.h) ? item.h : 4,
        };
      })
      .filter(Boolean);

    try {
      await dashboardsApi.updateLayout(dashboardId, { widgets: layoutPayload });
      toast.success('Layout updated successfully!');
      console.log(
        `[PATCH /dashboards/${dashboardId}/layout] Success:`,
        layoutPayload
      );
    } catch (err: unknown) {
      const apiError =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to update layout';
      console.error(
        `[PATCH /dashboards/${dashboardId}/layout] Error:`,
        apiError
      );
      toast.error(apiError);
    }
  },

  addWidget: (widget, layoutItem) => {
    set((state) => ({
      widgets: [...state.widgets, widget],
      layout: [...state.layout, layoutItem],
    }));
  },

  deleteWidgetFromApi: async (dashboardId: string, widgetId: string) => {
    const { widgets, layout } = get();
    // Optimistically remove widget from local state
    set({
      widgets: widgets.filter((w) => w.id !== widgetId),
      layout: layout.filter((l) => l.i !== widgetId),
    });

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(widgetId)) {
      try {
        await dashboardsApi.deleteWidget(dashboardId, widgetId);
        toast.success('Widget deleted from dashboard');
      } catch (err: unknown) {
        const apiError =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to delete widget from server';
        console.error(
          `[DELETE /dashboards/${dashboardId}/widgets/${widgetId}] Error:`,
          apiError
        );
        toast.error(apiError);
      }
    } else {
      toast.success('Widget removed');
    }
  },

  removeWidget: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== widgetId),
      layout: state.layout.filter((l) => l.i !== widgetId),
    }));
  },

  reset: () =>
    set({
      dashboardId: null,
      currentDashboard: null,
      widgets: [],
      layout: [],
      isSaving: false,
    }),
}));
