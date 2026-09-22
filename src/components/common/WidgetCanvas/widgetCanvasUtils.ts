import type { Layout } from 'react-grid-layout';
import type { DeviceTelemetry } from './TelemetryWidget';

export interface WidgetDataSource {
  deviceIds: string[];
  deviceName?: string;
  telemetryKeys: string[];
  timeRange: string;
}

export interface WidgetVisualization {
  chartType: string;
  colors: string[];
  showLegend: boolean;
}

export interface Widget {
  id: string;
  widgetTypeId?: string;
  type: string;
  title: string;
  category?: string;
  description?: string;
  descriptor?: any;
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  dataSource?: WidgetDataSource;
  visualization?: WidgetVisualization;
  filters?: Record<string, any>;
  content?: DeviceTelemetry[];
  config?: any;
}

export function buildDashboardPayload(widgets: Widget[], layout: Layout[]) {
  const formattedWidgets = widgets.map((widget) => {
    const layoutItem = layout.find((l) => l.i === widget.id);
    const pos = {
      x: layoutItem?.x ?? widget.position?.x ?? 0,
      y: layoutItem?.y ?? widget.position?.y ?? 0,
      w: layoutItem?.w ?? widget.position?.w ?? 4,
      h: layoutItem?.h ?? widget.position?.h ?? 4,
    };

    return {
      id: widget.id,
      type: widget.type,
      title: widget.title,
      position: pos,
      dataSource: {
        deviceIds:
          widget.dataSource?.deviceIds ||
          (widget.config?.deviceId ? [widget.config.deviceId] : []),
        deviceName: widget.dataSource?.deviceName,
        telemetryKeys:
          widget.dataSource?.telemetryKeys ||
          widget.config?.enabledMetrics ||
          [],
        timeRange: widget.dataSource?.timeRange || '24h',
      },
      visualization: {
        chartType: widget.visualization?.chartType || 'line',
        colors: widget.visualization?.colors || ['#3b82f6'],
        showLegend: widget.visualization?.showLegend ?? true,
      },
      filters: widget.filters || {},
    };
  });

  return {
    widgets: formattedWidgets,
    layout: {
      cols: 12,
      rowHeight: 100,
    },
    settings: {
      autoRefresh: true,
      refreshInterval: 30,
    },
  };
}

export function getNextWidgetPosition(layout: Layout[], w = 4, h = 4) {
  if (!layout || layout.length === 0) {
    return { x: 0, y: 0, w, h };
  }

  let maxY = 0;
  for (const item of layout) {
    const itemY = typeof item.y === 'number' && isFinite(item.y) ? item.y : 0;
    const itemH = typeof item.h === 'number' && isFinite(item.h) ? item.h : 4;
    const bottom = itemY + itemH;
    if (bottom > maxY) {
      maxY = bottom;
    }
  }

  const lastRowItems = layout.filter((item) => {
    const itemY = typeof item.y === 'number' && isFinite(item.y) ? item.y : 0;
    const itemH = typeof item.h === 'number' && isFinite(item.h) ? item.h : 4;
    return itemY + itemH === maxY;
  });

  let maxXInLastRow = 0;
  for (const item of lastRowItems) {
    const itemX = typeof item.x === 'number' && isFinite(item.x) ? item.x : 0;
    const itemW = typeof item.w === 'number' && isFinite(item.w) ? item.w : 4;
    const right = itemX + itemW;
    if (right > maxXInLastRow) {
      maxXInLastRow = right;
    }
  }

  if (maxXInLastRow + w <= 12) {
    const lastRowY =
      lastRowItems.length > 0
        ? typeof lastRowItems[0].y === 'number' && isFinite(lastRowItems[0].y)
          ? lastRowItems[0].y
          : 0
        : 0;
    return { x: maxXInLastRow, y: lastRowY, w, h };
  }

  return { x: 0, y: maxY, w, h };
}

export function buildSingleWidgetPayload(
  widget: Widget,
  layoutItem?: Layout,
  isUpdate = false
) {
  const posX =
    typeof layoutItem?.x === 'number' && isFinite(layoutItem.x)
      ? layoutItem.x
      : (widget.position?.x ?? 0);
  const posY =
    typeof layoutItem?.y === 'number' && isFinite(layoutItem.y)
      ? layoutItem.y
      : (widget.position?.y ?? 0);
  const posW =
    typeof layoutItem?.w === 'number' && isFinite(layoutItem.w)
      ? layoutItem.w
      : (widget.position?.w ?? 4);
  const posH =
    typeof layoutItem?.h === 'number' && isFinite(layoutItem.h)
      ? layoutItem.h
      : (widget.position?.h ?? 4);

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let targetWidgetTypeId = widget.widgetTypeId;

  if (!targetWidgetTypeId || !uuidRegex.test(targetWidgetTypeId)) {
    if (widget.descriptor?.id && uuidRegex.test(widget.descriptor.id)) {
      targetWidgetTypeId = widget.descriptor.id;
    } else if (widget.type && uuidRegex.test(widget.type)) {
      targetWidgetTypeId = widget.type;
    } else {
      targetWidgetTypeId = '00000000-0000-0000-0000-000000000000';
    }
  }

  const payload: Record<string, any> = {
    title: widget.title || 'Widget',
    row: posY,
    col: posX,
    width: posW,
    height: posH,
    datasource: {
      deviceId:
        widget.dataSource?.deviceIds?.[0] ||
        (widget.config?.deviceId ? widget.config.deviceId : ''),
      entityType: 'DEVICE',
      telemetryKeys:
        widget.dataSource?.telemetryKeys || widget.config?.enabledMetrics || [],
      timeWindow: widget.dataSource?.timeRange || '1h',
      aggregation: 'AVG',
    },
    config: {
      ...(widget.config || {}),
      // Persist visualization settings so the backend stores them and they
      // can be restored from config.colors / config.chartType on re-fetch.
      chartType:
        widget.visualization?.chartType || widget.config?.chartType || 'line',
      colors: widget.visualization?.colors ||
        widget.config?.colors || ['#3b82f6'],
      showLegend:
        widget.visualization?.showLegend ?? widget.config?.showLegend ?? true,
      minValue: (widget.config as any)?.minValue ?? 0,
      maxValue: (widget.config as any)?.maxValue ?? 50,
      unit: (widget.config as any)?.unit || '°C',
    },
  };

  if (!isUpdate) {
    payload.widgetTypeId = targetWidgetTypeId;
  }

  return payload;
}
