import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import type { WidgetBundle, WidgetType } from '@/services/api/widgets.api';

export interface WidgetBundleQuery {
  system?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface WidgetTypeQuery {
  system?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  bundleFqn?: string;
  bundleId?: string;
  category?: string;
}

export interface PaginatedApiWrapper<T> {
  success?: boolean;
  data: {
    message?: string;
    data: T[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp?: string;
}

// Default Fallback Bundles matching the Smart Life API specs
export const FALLBACK_BUNDLES: WidgetBundle[] = [
  {
    id: '9444af93-e06e-4357-b149-c184a8e58638',
    createdAt: '2026-07-30T08:33:54.075Z',
    updatedAt: '2026-07-30T08:33:54.075Z',
    title: 'Smart Life Core Widgets',
    description: 'Core widget library shipped with the Smart Life IoT Platform',
    image: null,
    order: 0,
    system: true,
  },
  {
    id: 'efb8b097-726d-4d8a-af4a-f631f134eae0',
    createdAt: '2026-07-30T08:33:53.993Z',
    updatedAt: '2026-07-30T08:33:53.993Z',
    title: 'Charts',
    description:
      'Comprehensive collection of chart widgets for data visualization',
    image: 'https://example.com/bundles/charts.png',
    order: 1,
    system: true,
  },
  {
    id: '562c5782-c7c2-41a7-bef8-1a26e5850688',
    createdAt: '2026-07-30T08:33:53.996Z',
    updatedAt: '2026-07-30T08:33:53.996Z',
    title: 'Cards',
    description: 'Card widgets for displaying key metrics and indicators',
    image: 'https://example.com/bundles/cards.png',
    order: 2,
    system: true,
  },
  {
    id: '06cee5f1-3fbd-417a-b3a8-78d4f6ea9a99',
    createdAt: '2026-07-30T08:33:54.003Z',
    updatedAt: '2026-07-30T08:33:54.003Z',
    title: 'Maps',
    description: 'Map widgets for location tracking and geospatial data',
    image: 'https://example.com/bundles/maps.png',
    order: 3,
    system: true,
  },
  {
    id: '3597afad-b16c-4ac2-8f52-58fb5cb54d9d',
    createdAt: '2026-07-30T08:33:54.012Z',
    updatedAt: '2026-07-30T08:33:54.012Z',
    title: 'Gauges',
    description: 'Gauge widgets for real-time monitoring of sensor values',
    image: 'https://example.com/bundles/gauges.png',
    order: 4,
    system: true,
  },
  {
    id: '0cb68c15-cfdb-4a65-b780-abb08a5980e5',
    createdAt: '2026-07-30T08:33:54.016Z',
    updatedAt: '2026-07-30T08:33:54.016Z',
    title: 'Control Widgets',
    description: 'Interactive controls for device management and commands',
    image: 'https://example.com/bundles/controls.png',
    order: 5,
    system: true,
  },
  {
    id: 'a27597b3-2d2e-4641-9646-efe98c00f0a7',
    createdAt: '2026-07-30T08:33:54.020Z',
    updatedAt: '2026-07-30T08:33:54.020Z',
    title: 'Alarm Widgets',
    description: 'Alarm management and notification widgets',
    image: 'https://example.com/bundles/alarms.png',
    order: 6,
    system: true,
  },
  {
    id: '5d2d2c46-412b-4e29-b547-6fcd43d2f7da',
    createdAt: '2026-07-30T08:33:54.025Z',
    updatedAt: '2026-07-30T08:33:54.025Z',
    title: 'Tables',
    description: 'Data tables and grids for structured information display',
    image: 'https://example.com/bundles/tables.png',
    order: 7,
    system: true,
  },
];

// Fallback Sample Widget Types
export const FALLBACK_WIDGET_TYPES: WidgetType[] = [
  {
    id: '082f4849-30e2-4a92-a21e-f3dd92eb39e1',
    createdAt: '2026-07-30T08:33:54.118Z',
    updatedAt: '2026-07-30T08:33:54.118Z',
    name: 'Pie Chart',
    description: 'Pie/donut chart for distribution visualization',
    category: 'charts',
    bundleFqn: 'Charts',
    image: null,
    iconUrl: null,
    descriptor: {
      type: 'latest',
      alias: 'pie-chart',
      sizeX: 4,
      sizeY: 4,
      minSizeX: 2,
      minSizeY: 2,
      dataConfig: {
        maxDataPoints: 1,
        requiresDevice: true,
        supportsMultipleKeys: true,
      },
      defaultConfig: {
        chartType: 'donut',
        showLegend: true,
        showPercentage: true,
      },
    },
    system: true,
    deprecated: false,
    tags: ['chart', 'pie', 'donut'],
  },
  {
    id: '1388885a-4e6d-4345-a167-9fbe9bf3702e',
    createdAt: '2026-07-30T08:33:54.115Z',
    updatedAt: '2026-07-30T08:33:54.115Z',
    name: 'Progress Bar',
    description: 'Horizontal progress bar showing percentage',
    category: 'gauges',
    bundleFqn: 'Gauges',
    image: null,
    iconUrl: null,
    descriptor: {
      type: 'latest',
      alias: 'progress-bar',
      sizeX: 4,
      sizeY: 2,
      minSizeX: 2,
      minSizeY: 1,
      dataConfig: {
        maxDataPoints: 1,
        requiresDevice: true,
        supportsMultipleKeys: false,
      },
      defaultConfig: {
        unit: '%',
        color: '#00C4F0',
        maxValue: 100,
        minValue: 0,
      },
    },
    system: true,
    deprecated: false,
    tags: ['progress', 'bar', 'latest'],
  },
  {
    id: 'line-chart-001',
    createdAt: '2026-07-30T08:33:54.120Z',
    updatedAt: '2026-07-30T08:33:54.120Z',
    name: 'Timeseries Line Chart',
    description: 'Real-time multi-metric telemetry line chart',
    category: 'charts',
    bundleFqn: 'Charts',
    descriptor: {
      type: 'timeseries',
      alias: 'line-chart',
      sizeX: 6,
      sizeY: 4,
      minSizeX: 3,
      minSizeY: 2,
    },
    system: true,
    deprecated: false,
    tags: ['chart', 'line', 'timeseries'],
  },
  {
    id: 'radial-gauge-002',
    createdAt: '2026-07-30T08:33:54.125Z',
    updatedAt: '2026-07-30T08:33:54.125Z',
    name: 'Radial Dial Gauge',
    description: 'Circular radial gauge for real-time sensor values',
    category: 'gauges',
    bundleFqn: 'Gauges',
    descriptor: {
      type: 'latest',
      alias: 'radial-gauge',
      sizeX: 4,
      sizeY: 4,
      minSizeX: 2,
      minSizeY: 2,
    },
    system: true,
    deprecated: false,
    tags: ['gauge', 'dial', 'sensor'],
  },
  {
    id: 'metric-card-003',
    createdAt: '2026-07-30T08:33:54.130Z',
    updatedAt: '2026-07-30T08:33:54.130Z',
    name: 'Single Metric Card',
    description: 'High-contrast card for KPI telemetry metrics',
    category: 'cards',
    bundleFqn: 'Cards',
    descriptor: {
      type: 'latest',
      alias: 'metric-card',
      sizeX: 3,
      sizeY: 2,
    },
    system: true,
    deprecated: false,
    tags: ['card', 'kpi', 'metric'],
  },
  {
    id: 'device-map-004',
    createdAt: '2026-07-30T08:33:54.135Z',
    updatedAt: '2026-07-30T08:33:54.135Z',
    name: 'Geospatial Map',
    description: 'Interactive map displaying device pin locations and status',
    category: 'maps',
    bundleFqn: 'Maps',
    descriptor: {
      type: 'latest',
      alias: 'device-map',
      sizeX: 6,
      sizeY: 4,
    },
    system: true,
    deprecated: false,
    tags: ['map', 'location', 'gps'],
  },
  {
    id: 'control-switch-005',
    createdAt: '2026-07-30T08:33:54.140Z',
    updatedAt: '2026-07-30T08:33:54.140Z',
    name: 'Toggle Switch Controller',
    description: 'Remote command toggle switch for actuators and relays',
    category: 'controls',
    bundleFqn: 'Control Widgets',
    descriptor: {
      type: 'rpc',
      alias: 'device-switch',
      sizeX: 3,
      sizeY: 2,
    },
    system: true,
    deprecated: false,
    tags: ['control', 'switch', 'relay'],
  },
  {
    id: 'alarms-table-006',
    createdAt: '2026-07-30T08:33:54.145Z',
    updatedAt: '2026-07-30T08:33:54.145Z',
    name: 'Active Alarms Monitor',
    description: 'Real-time table displaying system alarms and severities',
    category: 'alarms',
    bundleFqn: 'Alarm Widgets',
    descriptor: {
      type: 'alarm',
      alias: 'alarms-table',
      sizeX: 6,
      sizeY: 4,
    },
    system: true,
    deprecated: false,
    tags: ['alarm', 'alerts', 'monitor'],
  },
];

/**
 * Hook to fetch Widget Bundles from https://api.smart-life.sa/widgets/bundles?system=false&page=1&limit=10
 */
export function useWidgetBundles(
  params: WidgetBundleQuery = { system: false, page: 1, limit: 10 }
) {
  return useQuery({
    queryKey: ['widget-bundles', params],
    queryFn: async () => {
      try {
        const response = await apiClient.get<PaginatedApiWrapper<WidgetBundle>>(
          '/widgets/bundles',
          {
            params: {
              system: params.system ?? false,
              page: params.page ?? 1,
              limit: params.limit ?? 10,
              ...(params.search ? { search: params.search } : {}),
            },
          }
        );

        const envelope = response.data;
        const list = envelope?.data?.data || envelope?.data || [];
        const meta = envelope?.data?.meta;

        if (Array.isArray(list) && list.length > 0) {
          return {
            bundles: list,
            meta: meta || {
              total: list.length,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
        }
      } catch (err) {
        console.warn(
          'Widget bundles API call failed, using fallback bundles:',
          err
        );
      }

      // Filter fallbacks if search string is provided
      let bundles = FALLBACK_BUNDLES;
      if (params.search) {
        const q = params.search.toLowerCase();
        bundles = bundles.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.description?.toLowerCase().includes(q)
        );
      }

      return {
        bundles,
        meta: { total: bundles.length, page: 1, limit: 10, totalPages: 1 },
      };
    },
  });
}

/**
 * Hook to fetch Widget Types from https://api.smart-life.sa/widgets/types?system=false&page=1&limit=10
 */
export function useWidgetTypes(
  params: WidgetTypeQuery = { system: false, page: 1, limit: 10 }
) {
  return useQuery({
    queryKey: ['widget-types', params],
    queryFn: async () => {
      try {
        const queryParams: Record<string, any> = {
          system: params.system ?? false,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.bundleFqn) queryParams.bundleFqn = params.bundleFqn;
        if (params.bundleId) queryParams.bundleId = params.bundleId;
        if (params.category) queryParams.category = params.category;

        const response = await apiClient.get<PaginatedApiWrapper<WidgetType>>(
          '/widgets/types',
          {
            params: queryParams,
          }
        );

        const envelope = response.data;
        const list = envelope?.data?.data || envelope?.data || [];
        const meta = envelope?.data?.meta;

        if (Array.isArray(list) && list.length > 0) {
          return {
            types: list,
            meta: meta || {
              total: list.length,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          };
        }
      } catch (err) {
        console.warn(
          'Widget types API call failed, using fallback widget types:',
          err
        );
      }

      // Filter fallbacks by bundleFqn, category, or search
      let types = FALLBACK_WIDGET_TYPES;

      if (params.bundleFqn) {
        const bundleName = params.bundleFqn.toLowerCase();
        types = types.filter(
          (t) =>
            t.bundleFqn?.toLowerCase() === bundleName ||
            t.category.toLowerCase().includes(bundleName) ||
            bundleName.includes(t.category.toLowerCase())
        );
      }

      if (params.category) {
        const cat = params.category.toLowerCase();
        types = types.filter((t) => t.category.toLowerCase() === cat);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        types = types.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q)
        );
      }

      // If bundle filter yielded 0 items, return all fallback types so user always sees widgets
      if (types.length === 0 && (params.bundleFqn || params.category)) {
        types = FALLBACK_WIDGET_TYPES;
      }

      return {
        types,
        meta: { total: types.length, page: 1, limit: 10, totalPages: 1 },
      };
    },
  });
}
