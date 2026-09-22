import { useState, useCallback, useRef, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { Plus, Trash2, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import { WidgetRenderer } from './WidgetRenderer';
import { WidgetLibraryModal } from './WidgetLibraryModal';
import type { MetricType } from './TelemetryWidget';
import type { WidgetType } from '@/services/api/widgets.api';
import { useDashboardStore } from '@/stores/useDashboardStore';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  WidgetDataSource,
  WidgetVisualization,
  Widget,
  buildDashboardPayload,
  getNextWidgetPosition,
  buildSingleWidgetPayload,
} from './widgetCanvasUtils';

export type { WidgetDataSource, WidgetVisualization, Widget };
export {
  buildDashboardPayload,
  getNextWidgetPosition,
  buildSingleWidgetPayload,
};

interface WidgetCanvasProps {
  onSaveLayout?: (layout: Layout[], widgets: Widget[], payload?: any) => void;
  initialLayout?: Layout[];
  initialWidgets?: Widget[];
  readOnly?: boolean;
}

export function WidgetCanvas({
  initialLayout = [],
  initialWidgets = [],
  readOnly = false,
}: WidgetCanvasProps) {
  const store = useDashboardStore();

  const widgets = readOnly ? initialWidgets : store.widgets;
  const layout = readOnly ? initialLayout : store.layout;
  const [showWidgetLibraryModal, setShowWidgetLibraryModal] = useState(false);
  const [selectedSettingWidget, setSelectedSettingWidget] =
    useState<Widget | null>(null);

  // Dynamic canvas width measured from the container element
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(1180);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) setCanvasWidth(width);
      }
    });

    observer.observe(el);
    // Set initial width immediately
    setCanvasWidth(el.getBoundingClientRect().width || 1180);

    return () => observer.disconnect();
  }, []);

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      if (!readOnly) {
        store.setLayout(newLayout);
      }
    },
    [readOnly, store]
  );

  const handleDragOrResizeStop = useCallback(
    (currentLayout: Layout[]) => {
      if (!readOnly && store.dashboardId) {
        store.setLayout(currentLayout);

        // Skip API call if any widget has a non-UUID ID (e.g., newly added unsaved widget)
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const allSaved = currentLayout.every((item) => uuidRegex.test(item.i));
        if (!allSaved) {
          console.log('[Layout] Skipping API call — unsaved widgets detected');
          return;
        }

        store.updateLayoutToApi(store.dashboardId, currentLayout);
      }
    },
    [readOnly, store]
  );

  // Add Widget from API Widget Library Selection
  const handleAddWidgetFromType = useCallback(
    (widgetType: WidgetType) => {
      const alias =
        widgetType.descriptor?.alias || widgetType.category || 'telemetry';
      const catUpper = String(widgetType.category || '').toUpperCase();
      const nameOrAlias = String(
        widgetType.descriptor?.alias || widgetType.name || ''
      ).toLowerCase();

      let defaultChartType = 'line-chart';
      if (
        catUpper === 'GAUGES' ||
        catUpper === 'ANALOG_GAUGES' ||
        nameOrAlias.includes('gauge')
      ) {
        defaultChartType = nameOrAlias.includes('progress')
          ? 'progress-bar'
          : nameOrAlias.includes('digital')
            ? 'digital-gauge'
            : 'radial-gauge';
      } else if (
        catUpper === 'CONTROL_WIDGETS' ||
        catUpper === 'GPIO_WIDGETS' ||
        catUpper === 'INPUT_WIDGETS' ||
        nameOrAlias.includes('switch') ||
        nameOrAlias.includes('control') ||
        nameOrAlias.includes('relay')
      ) {
        if (
          nameOrAlias.includes('thermostat') ||
          nameOrAlias.includes('climate') ||
          nameOrAlias.includes('temp control')
        ) {
          defaultChartType = 'thermostat-control';
        } else if (
          nameOrAlias.includes('slider') ||
          nameOrAlias.includes('dimmer') ||
          nameOrAlias.includes('speed')
        ) {
          defaultChartType = 'slider-control';
        } else if (
          nameOrAlias.includes('command') ||
          nameOrAlias.includes('button') ||
          nameOrAlias.includes('action')
        ) {
          defaultChartType = 'command-control';
        } else {
          defaultChartType = 'device-switch';
        }
      } else if (
        catUpper === 'CARDS' ||
        nameOrAlias.includes('card') ||
        nameOrAlias.includes('metric')
      ) {
        if (
          nameOrAlias.includes('multi') ||
          nameOrAlias.includes('grid') ||
          nameOrAlias.includes('overview')
        ) {
          defaultChartType = 'multi-metric-card';
        } else if (
          nameOrAlias.includes('health') ||
          nameOrAlias.includes('status')
        ) {
          defaultChartType = 'status-card';
        } else {
          defaultChartType = 'metric-card';
        }
      } else if (
        catUpper === 'MAPS' ||
        nameOrAlias.includes('map') ||
        nameOrAlias.includes('gps')
      ) {
        defaultChartType = 'device-map';
      } else if (
        catUpper === 'ALARM_WIDGETS' ||
        nameOrAlias.includes('alarm') ||
        nameOrAlias.includes('alert')
      ) {
        defaultChartType = 'alarms-table';
      } else if (
        catUpper === 'TABLES' ||
        nameOrAlias.includes('table') ||
        nameOrAlias.includes('grid') ||
        nameOrAlias.includes('log')
      ) {
        defaultChartType = 'data-table';
      } else if (
        catUpper === 'CHARTS' ||
        nameOrAlias.includes('chart') ||
        nameOrAlias.includes('pie') ||
        nameOrAlias.includes('donut')
      ) {
        if (nameOrAlias.includes('pie') || nameOrAlias.includes('donut')) {
          defaultChartType = 'pie-chart';
        } else if (nameOrAlias.includes('bar')) {
          defaultChartType = 'bar-chart';
        } else {
          defaultChartType = 'line-chart';
        }
      }

      const newWidget: Widget = {
        id: `widget-${Date.now()}`,
        widgetTypeId: widgetType.id,
        type: alias,
        title: widgetType.name,
        category: widgetType.category as string,
        description: widgetType.description || '',
        descriptor: widgetType.descriptor,
        dataSource: {
          deviceIds: [],
          telemetryKeys: [],
          timeRange: '24h',
        },
        visualization: {
          chartType: defaultChartType,
          colors: ['#3b82f6'],
          showLegend: true,
        },
        config: {
          refreshInterval: 5000,
          enabledMetrics: [
            'temperature',
            'humidity',
            'battery',
            'power',
            'signal',
          ] as MetricType[],
        },
      };

      const w = widgetType.descriptor?.sizeX || 4;
      const h = widgetType.descriptor?.sizeY || 4;

      const pos = getNextWidgetPosition(layout, w, h);
      newWidget.position = pos;

      const newLayoutItem: Layout = {
        i: newWidget.id,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        minW: widgetType.descriptor?.minSizeX || 2,
        minH: widgetType.descriptor?.minSizeY || 2,
      };

      if (!readOnly) {
        store.addWidget(newWidget, newLayoutItem);
      }

      setShowWidgetLibraryModal(false);
      setSelectedSettingWidget(newWidget);
    },
    [layout.length, readOnly, store]
  );

  const handleRemoveWidget = useCallback(
    async (widgetId: string) => {
      if (!readOnly) {
        if (store.dashboardId) {
          await store.deleteWidgetFromApi(store.dashboardId, widgetId);
        } else {
          store.removeWidget(widgetId);
        }
      }
    },
    [readOnly, store]
  );

  const handleSaveWidgetSettings = useCallback(
    async (
      widgetId: string,
      dataSource: WidgetDataSource,
      visualization: WidgetVisualization,
      title?: string,
      config?: { minValue?: number; maxValue?: number }
    ) => {
      if (!readOnly) {
        if (store.dashboardId) {
          await store.saveWidgetToApi(
            store.dashboardId,
            widgetId,
            dataSource,
            visualization,
            title,
            config
          );
        } else {
          store.updateWidgetSettings(
            widgetId,
            dataSource,
            visualization,
            title,
            config
          );
        }
      }
    },
    [readOnly, store]
  );

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg">
      {/* Toolbar */}
      {!readOnly && (
        <div className="absolute -top-18 right-4 z-40 flex items-center gap-2">
          <Button
            onClick={() => setShowWidgetLibraryModal(true)}
            className="bg-secondary text-white hover:bg-secondary/95 shadow-md font-medium border border-gray-300"
          >
            <Layers className="h-4 w-4 mr-2 text-white" />
            Widget Library
          </Button>
        </div>
      )}
      {/* Widget Library Modal */}
      <WidgetLibraryModal
        isOpen={showWidgetLibraryModal}
        onClose={() => setShowWidgetLibraryModal(false)}
        onSelectWidgetType={handleAddWidgetFromType}
      />

      {/* Widget Settings Modal for Device & Telemetry Selection */}
      <WidgetSettingsModal
        open={!!selectedSettingWidget}
        onOpenChange={(open) => !open && setSelectedSettingWidget(null)}
        widget={selectedSettingWidget}
        onSave={handleSaveWidgetSettings}
      />

      {/* Canvas */}
      <div
        ref={canvasContainerRef}
        className="h-full overflow-auto bg-gray-300 dark:bg-gray-800  "
      >
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <button
              onClick={() => setShowWidgetLibraryModal(true)}
              className="flex bg-white flex-col items-center justify-center gap-3 px-12 py-10 border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-primary hover:bg-white dark:hover:bg-gray-900 transition-all group"
            >
              <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8" />
              </div>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Add New Widget from Library
              </span>
              <span className="text-xs text-gray-500 max-w-xs text-center">
                Browse Smart Life Widget Bundles including Charts, Gauges,
                Cards, Maps & Alarms
              </span>
            </button>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={layout}
            onLayoutChange={handleLayoutChange}
            onDragStop={handleDragOrResizeStop}
            onResizeStop={handleDragOrResizeStop}
            cols={12}
            rowHeight={20}
            width={canvasWidth}
            isDraggable={!readOnly}
            isResizable={!readOnly}
            draggableHandle=".drag-handle"
            draggableCancel=".no-drag"
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="widget-container">
                <Card className="h-full rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors flex flex-col overflow-hidden">
                  {/* Widget Header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <div className="drag-handle flex items-center gap-2 truncate cursor-move flex-1">
                      {widget.title && (
                        <span
                          className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium px-1.5 py-0.5 rounded-md truncate max-w-[140px]"
                          title={widget.title}
                        >
                          {widget.title}
                        </span>
                      )}
                    </div>
                    {!readOnly && (
                      <div
                        className="no-drag flex items-center gap-1 shrink-0"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSettingWidget(widget);
                          }}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300 relative z-20 cursor-pointer"
                          title="Configure Device & Telemetry Settings"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWidget(widget.id);
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600 dark:text-red-400 relative z-20 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Widget Content */}
                  <CardContent className="p-2 flex-1 overflow-auto bg-white dark:bg-gray-900">
                    <WidgetRenderer
                      widget={widget}
                      onDeviceChange={(deviceId) => {
                        if (!readOnly) {
                          store.updateWidgetSettings(
                            widget.id,
                            {
                              ...(widget.dataSource || {
                                deviceIds: [deviceId],
                                telemetryKeys: [],
                                timeRange: '24h',
                              }),
                              deviceIds: [deviceId],
                            },
                            widget.visualization || {
                              chartType: 'line',
                              colors: ['#3b82f6'],
                              showLegend: true,
                            }
                          );
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
}
