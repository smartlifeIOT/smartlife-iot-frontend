import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import {
  Cpu,
  Activity,
  Search,
  CheckCircle2,
  WifiOff,
  Wifi,
  Loader2,
  ChevronRight,
  RefreshCw,
  Clock,
  Palette,
  Type,
} from 'lucide-react';
import { devicesApi } from '@/services/api/devices.api';
import type { Device, DeviceStatus } from '@/services/api/devices.api';
import type {
  Widget,
  WidgetDataSource,
  WidgetVisualization,
} from './WidgetCanvas';
import { telemetryApi, TelemetryData } from '@/services/api';
import { flattenObject } from '@/utils/helpers/FlattenObject';

interface WidgetSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: Widget | null;
  onSave: (
    widgetId: string,
    dataSource: WidgetDataSource,
    visualization: WidgetVisualization,
    title?: string,
    config?: { minValue?: number; maxValue?: number }
  ) => Promise<void> | void;
}

const TIME_RANGES = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

const THEME_COLORS = [
  { color: '#3b82f6', label: 'Blue' },
  { color: '#10b981', label: 'Emerald' },
  { color: '#f59e0b', label: 'Amber' },
  { color: '#ef4444', label: 'Red' },
  { color: '#8b5cf6', label: 'Purple' },
  { color: '#06b6d4', label: 'Cyan' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#f97316', label: 'Orange' },
];

function statusColor(status: DeviceStatus | string): string {
  switch (status) {
    case 'online':
    case 'active':
      return 'bg-emerald-500';
    case 'offline':
      return 'bg-red-500';
    case 'idle':
      return 'bg-amber-400';
    case 'maintenance':
      return 'bg-purple-500';
    default:
      return 'bg-gray-400';
  }
}

export function WidgetSettingsModal({
  open,
  onOpenChange,
  widget,
  onSave,
}: WidgetSettingsModalProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [deviceSearch, setDeviceSearch] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedTelemetryKeys, setSelectedTelemetryKeys] = useState<string[]>(
    []
  );
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [telemetryKeyColors, setTelemetryKeyColors] = useState<
    Record<string, string>
  >({});
  const [cardTitle, setCardTitle] = useState('');
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chart type is determined by widget library choice
  const chartType =
    widget?.visualization?.chartType ||
    widget?.descriptor?.alias ||
    widget?.type ||
    'line';

  // Pie/donut charts support a distinct color per telemetry key
  const isPieChart = ['pie-chart', 'pie', 'donut'].includes(
    chartType.toLowerCase()
  );

  // Progress bar widgets support a configurable min/max range
  const isProgressBar =
    chartType.toLowerCase() === 'progress-bar' ||
    chartType.toLowerCase().includes('progress');

  // Sync state when widget opens or changes
  useEffect(() => {
    if (widget) {
      const devId = widget.dataSource?.deviceIds?.[0] || null;
      const savedKeys = widget.dataSource?.telemetryKeys || [];
      const savedColors = widget.visualization?.colors || [];

      setSelectedDeviceId(devId);
      setSelectedTelemetryKeys(savedKeys);
      setTimeRange(widget.dataSource?.timeRange || '24h');
      setSelectedColor(widget.visualization?.colors?.[0] || '#3b82f6');
      setCardTitle(widget.title || '');
      setMinValue(Number(widget.config?.minValue ?? 0));
      setMaxValue(Number(widget.config?.maxValue ?? 100));

      // Restore per-key colors, aligned to the saved telemetry key order
      const colorMap: Record<string, string> = {};
      savedKeys.forEach((key, i) => {
        colorMap[key] =
          savedColors[i] || THEME_COLORS[i % THEME_COLORS.length].color;
      });
      setTelemetryKeyColors(colorMap);
    }
  }, [widget, open]);

  // ── Fetch Devices from /devices API ──────────────────────────────────
  const {
    data: devicesData,
    isLoading: isLoadingDevices,
    isError: isDevicesError,
    refetch: refetchDevices,
  } = useQuery({
    queryKey: ['devices-list-modal', deviceSearch],
    queryFn: async () => {
      const res = await devicesApi.getAll({
        limit: 100,
        search: deviceSearch || undefined,
      });
      const items: Device[] =
        (res.data as any)?.data?.data ?? (res.data as any)?.data ?? [];
      return Array.isArray(items) ? items : [];
    },
    enabled: open,
    staleTime: 30_000,
  });

  const devices: Device[] = devicesData ?? [];

  // Filtered locally on top of server search
  const filteredDevices = deviceSearch
    ? devices.filter(
        (d) =>
          d.name?.toLowerCase().includes(deviceSearch.toLowerCase()) ||
          d.id?.toLowerCase().includes(deviceSearch.toLowerCase()) ||
          d.type?.toLowerCase().includes(deviceSearch.toLowerCase())
      )
    : devices;

  // ── Fetch Latest Telemetry for Single Selected Device ──
  const { data: telemetryResponse, isLoading: isLoadingTelemetry } = useQuery({
    queryKey: ['device-latest-telemetry', selectedDeviceId],
    queryFn: () =>
      selectedDeviceId
        ? telemetryApi.getLatest(selectedDeviceId)
        : Promise.resolve(null),
    enabled: !!selectedDeviceId && open,
    refetchInterval: 15000,
  });

  const telemetry: TelemetryData | undefined = telemetryResponse?.data?.data;

  // Flatten telemetry.data JSON into key-value pairs
  const flatDataEntries = React.useMemo(() => {
    if (!telemetry?.data) return [];
    return flattenObject(telemetry.data);
  }, [telemetry?.data]);

  if (!widget) return null;

  // ── Handlers ──────────────────────────────────────────────────────────
  // Single device selection handler
  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId((prev) => {
      const nextDeviceId = prev === deviceId ? null : deviceId;
      // Clear selected telemetry keys whenever the device selection changes
      // (telemetry keys are device-specific and must be re-selected per device)
      if (prev !== nextDeviceId) {
        setSelectedTelemetryKeys([]);
        setTelemetryKeyColors({});
      }
      return nextDeviceId;
    });
  };

  // Multiple telemetry keys selection handler
  const toggleTelemetryKey = (key: string) => {
    setSelectedTelemetryKeys((prev) => {
      if (prev.includes(key)) {
        // Deselect: remove the key and its assigned color
        setTelemetryKeyColors((colors) => {
          const next = { ...colors };
          delete next[key];
          return next;
        });
        return prev.filter((k) => k !== key);
      }

      // Select: assign the next theme color to this key
      const next = [...prev, key];
      setTelemetryKeyColors((colors) => {
        if (colors[key]) return colors;
        const index = next.length - 1;
        return {
          ...colors,
          [key]: THEME_COLORS[index % THEME_COLORS.length].color,
        };
      });
      return next;
    });
  };

  const setKeyColor = (key: string, color: string) => {
    setTelemetryKeyColors((prev) => ({ ...prev, [key]: color }));
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const handleSave = async () => {
    const dataSource: WidgetDataSource = {
      deviceIds: selectedDeviceId ? [selectedDeviceId] : [],
      deviceName: selectedDevice?.name || selectedDeviceId || undefined,
      telemetryKeys: selectedTelemetryKeys,
      timeRange,
    };
    const visualization: WidgetVisualization = {
      chartType,
      colors: isPieChart
        ? selectedTelemetryKeys.map(
            (key) =>
              telemetryKeyColors[key] ||
              THEME_COLORS[
                selectedTelemetryKeys.indexOf(key) % THEME_COLORS.length
              ].color
          )
        : [selectedColor],
      showLegend: widget.visualization?.showLegend ?? true,
    };

    setIsSubmitting(true);
    try {
      await onSave(
        widget.id,
        dataSource,
        visualization,
        cardTitle?.trim(),
        isProgressBar ? { minValue, maxValue } : undefined
      );
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-base font-medium text-white dark:text-white">
            <div className="p-1.5   rounded-lg  ">
              <Activity className="w-4 h-4" />
            </div>
            <span>Configure Widget: {widget.title}</span>
          </DialogTitle>
          <p className="text-xs  dark:text-slate-400 mt-0.5 pl-0.5">
            Select one target device and multiple dynamic telemetry keys from
            API
          </p>
        </DialogHeader>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ── Section 1: Single Target Device Selection ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Cpu className="w-4 h-4 text-blue-500" />
                Select Target Device (Single Choice)
              </Label>
              <button
                type="button"
                onClick={() => refetchDevices()}
                className="text-[11px] text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search devices by name, ID or type..."
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Device list */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {isLoadingDevices ? (
                <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading devices from API...
                </div>
              ) : isDevicesError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-red-400 text-xs">
                  <WifiOff className="w-5 h-5" />
                  <span>Could not reach /devices API</span>
                  <button
                    type="button"
                    onClick={() => refetchDevices()}
                    className="text-primary underline"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400 text-xs">
                  <Cpu className="w-5 h-5 opacity-40" />
                  <span>No devices found</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-44 overflow-y-auto">
                  {filteredDevices.map((device) => {
                    const isSelected = selectedDeviceId === device.id;
                    return (
                      <button
                        key={device.id}
                        type="button"
                        onClick={() => handleSelectDevice(device.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-primary'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div
                              className={`w-2 h-2 rounded-full ${statusColor(device.status)}`}
                            />
                            {(device.status === 'online' ||
                              device.status === 'active') && (
                              <div
                                className={`absolute inset-0 w-2 h-2 rounded-full ${statusColor(device.status)} animate-ping opacity-60`}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {device.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {device.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize px-1.5 py-0"
                          >
                            {device.type || 'sensor'}
                          </Badge>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Dynamic Telemetry Keys (Flattened telemetry.data JSON) ── */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Activity className="w-4 h-4 text-primary" />
                Select Telemetry Keys
                {selectedTelemetryKeys.length > 0 && (
                  <Badge className="bg-primary text-white border-primary text-[10px]">
                    {selectedTelemetryKeys.length} selected
                  </Badge>
                )}
              </Label>
              {isLoadingTelemetry && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading API keys...
                </span>
              )}
            </div>

            {!selectedDeviceId ? (
              <p className="text-xs text-slate-400 italic py-2">
                Please select a target device above to load telemetry keys from
                API.
              </p>
            ) : flatDataEntries.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-lg">
                {flatDataEntries.map(([key, val]) => {
                  const isSelected = selectedTelemetryKeys.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleTelemetryKey(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary'
                      }`}
                    >
                      <span>{key}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        ({String(val)})
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3 h-3 ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No active telemetry payload received for this device yet.
              </p>
            )}
          </div>

          {/* ── Section 3: Time Range ── */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
              <Clock className="w-3.5 h-3.5 text-secondary" />
              Time Range
            </Label>
            <div className="grid grid-cols-6 gap-1.5">
              {TIME_RANGES.map((tr) => {
                const isSelected = timeRange === tr.value;
                return (
                  <button
                    key={tr.value}
                    type="button"
                    onClick={() => setTimeRange(tr.value)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium border transition-all text-center ${
                      isSelected
                        ? 'bg-secondary text-white border-secondary font-semibold shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-secondary'
                    }`}
                  >
                    {tr.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Section 5: Card Appearance ── */}
          <div className="space-y-3 py-4 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Type className="w-4 h-4  " />
              Card Appearance
            </Label>
            <div className="space-y-1.5">
              <Label
                htmlFor="card-title"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Card Title
              </Label>
              <Input
                id="card-title"
                placeholder="Enter a title for this widget card..."
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
              <p className="text-[11px] text-slate-400">
                This title is displayed on the widget card header.
              </p>
            </div>
            {/* ── Range (Progress Bar only) ── */}
            {isProgressBar && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Range
                  <span className="text-[10px] font-normal text-slate-400">
                    (min & max scale for the progress bar)
                  </span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="range-min"
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Min Value
                    </Label>
                    <Input
                      id="range-min"
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(Number(e.target.value))}
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="range-max"
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Max Value
                    </Label>
                    <Input
                      id="range-max"
                      type="number"
                      value={maxValue}
                      onChange={(e) => setMaxValue(Number(e.target.value))}
                      className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  The telemetry value is mapped onto this range to compute the
                  progress bar fill.
                </p>
              </div>
            )}
            {/* ── Section 2b: Per-Key Colors (Pie/Donut only) ── */}
            {isPieChart && selectedTelemetryKeys.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                  <Palette className="w-3.5 h-3.5 text-purple-500" />
                  Colors
                  <span className="text-[10px] font-normal text-slate-400">
                    (one color per selected telemetry key)
                  </span>
                </Label>
                <div className="space-y-2">
                  {selectedTelemetryKeys.map((key) => {
                    const currentColor =
                      telemetryKeyColors[key] ||
                      THEME_COLORS[
                        selectedTelemetryKeys.indexOf(key) % THEME_COLORS.length
                      ].color;
                    return (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: currentColor }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                              {key}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {currentColor}
                          </span>
                          <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => setKeyColor(key, e.target.value)}
                            title={`Pick color for ${key}`}
                            className="w-9 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Summary ── */}
          {selectedDeviceId && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                Widget Binding Summary
              </p>
              <p>
                <span className="font-medium">Selected Device:</span>{' '}
                {selectedDevice?.name || selectedDeviceId}
              </p>
              <p>
                <span className="font-medium">Selected Keys:</span>{' '}
                {selectedTelemetryKeys.length > 0
                  ? selectedTelemetryKeys.join(', ')
                  : 'None'}
              </p>
              {isPieChart ? (
                <p className="font-medium inline-flex items-center gap-1 flex-wrap">
                  Colors:{' '}
                  {selectedTelemetryKeys.map((key, i) => {
                    const color =
                      telemetryKeyColors[key] ||
                      THEME_COLORS[i % THEME_COLORS.length].color;
                    return (
                      <span
                        key={key}
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </p>
              ) : (
                <p>
                  <span className="font-medium">Time Range:</span> {timeRange} ·{' '}
                  <span className="font-medium inline-flex items-center gap-1">
                    Color:{' '}
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-white min-w-[130px]"
              disabled={!selectedDeviceId || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Apply Settings'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
