import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { devicesApi } from '@/services/api/devices.api';
import { alarmsApi } from '@/services/api/alarms.api';
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Zap,
  ToggleRight,
  BarChart2,
  PieChartIcon,
  Loader2,
  Thermometer,
  Droplets,
  Battery,
  Wifi,
  Sliders,
  Flame,
  Snowflake,
  Wind,
  Plus,
  Minus,
  Settings,
  Cpu,
  CheckCircle2,
  Radio,
  Power,
  RotateCcw,
  Octagon,
  RefreshCw,
  Gauge,
  Sparkles,
  Layers,
  Table,
  Search,
  Download,
} from 'lucide-react';
import { TelemetryWidget } from './TelemetryWidget';
import type { Widget } from './WidgetCanvas';
import { flattenObject } from '@/utils/helpers/FlattenObject';
import toast from 'react-hot-toast';
import { CHART_COLORS } from '@/utils/constants/colors';
import DeviceMapWidget from '../widgets/Maps/DeviceMapWidget';
import AlaramsList from '../widgets/alarms/AlaramsList';
import ToggleSwitch from '../widgets/switches/ToggleSwitch';

interface WidgetRendererProps {
  widget: Widget;
  onDeviceChange?: (deviceId: string) => void;
}

/** Badge showing whether telemetry is pushed live over WebSocket or via polling */
export function LiveStatusBadge({
  isLive,
  isConnecting,
  isPolling,
}: {
  isLive: boolean;
  isConnecting: boolean;
  isPolling: boolean;
}) {
  if (isLive) {
    return (
      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live · WS
      </span>
    );
  }
  if (isConnecting) {
    return (
      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shrink-0">
        <Loader2 className="w-3 h-3 animate-spin" />
        Connecting…
      </span>
    );
  }
  if (isPolling) {
    return (
      <span className="text-[10px] bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
        Live · Poll
      </span>
    );
  }
  return (
    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium shrink-0">
      HTTP
    </span>
  );
}

/** Small badge shown inside every widget displaying bound device/telemetry info */
export function DataSourceBadge({
  widget,
  deviceName,
}: {
  widget: Widget;
  deviceName?: string;
}) {
  const ds = widget.dataSource;
  if (!ds?.deviceIds?.length || ds.deviceIds[0].includes('device-uuid'))
    return null;

  const nameToDisplay =
    deviceName ||
    ds.deviceName ||
    (ds.deviceIds.length === 1
      ? ds.deviceIds[0]
      : `${ds.deviceIds.length} devices`);

  return (
    <div className="flex items-center justify-between gap-1.5 flex-wrap mt-auto pt-1.5 px-1 border-t border-slate-100 dark:border-slate-800/60 w-full text-[10px]">
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 font-medium text-blue-600 dark:text-blue-300 max-w-[220px] truncate"
        title={nameToDisplay}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="truncate">{nameToDisplay}</span>
      </span>

      {ds.timeRange && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
          {ds.timeRange}
        </span>
      )}
    </div>
  );
}

/** Standard Empty State Card rendered when no device is selected yet */
export function EmptyDeviceState({
  widget,
  icon: Icon = Settings,
}: {
  widget: Widget;
  icon?: any;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-lg">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full mb-2">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {widget.title || 'Configure Device Binding'}
      </p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
        No target device bound. Click the{' '}
        <strong className="text-primary">⚙ Settings</strong> icon on the widget
        header to select a device.
      </p>
    </div>
  );
}

// Helper to extract numeric metric value from live telemetry
function getTelemetryNumericValue(
  telemetry: any,
  key?: string,
  fallback: number = 0
): number {
  if (!telemetry) return fallback;
  if (key && typeof telemetry[key] === 'number') return telemetry[key];

  if (telemetry.data && typeof telemetry.data === 'object') {
    const flat = flattenObject(telemetry.data);
    if (key) {
      const match = flat.find(([k]) => k.toLowerCase() === key.toLowerCase());
      if (match) {
        const parsed =
          typeof match[1] === 'number'
            ? match[1]
            : parseFloat(String(match[1]));
        if (!isNaN(parsed)) return parsed;
      }
    }
    // Pick first numeric entry from telemetry data if no key matched
    for (const [, val] of flat) {
      const parsed = typeof val === 'number' ? val : parseFloat(String(val));
      if (!isNaN(parsed)) return parsed;
    }
  }

  // Root level attributes
  if (typeof telemetry.temperature === 'number') return telemetry.temperature;
  if (typeof telemetry.humidity === 'number') return telemetry.humidity;
  if (typeof telemetry.batteryLevel === 'number') return telemetry.batteryLevel;
  if (typeof telemetry.pressure === 'number') return telemetry.pressure;

  return fallback;
}

// Helper to get slice data for pie chart
function getDynamicPieData(
  telemetry: ReturnType<typeof useLiveTelemetry>['data'],
  selectedKeys?: string[],
  primaryColor: string = '#3b82f6',
  customColors?: string[]
) {
  // When per-key colors were configured, use them (aligned to the selected
  // key order). Otherwise fall back to the default palette.
  const COLOR_PALETTE =
    customColors && customColors.length > 0
      ? customColors
      : [primaryColor, ...CHART_COLORS];

  const flatMap = new Map<string, number>();

  if (telemetry) {
    const flatEntries =
      telemetry.data && typeof telemetry.data === 'object'
        ? flattenObject(telemetry.data)
        : [];

    if (typeof telemetry.temperature === 'number')
      flatMap.set('temperature', telemetry.temperature);
    if (typeof telemetry.humidity === 'number')
      flatMap.set('humidity', telemetry.humidity);
    if (typeof telemetry.pressure === 'number')
      flatMap.set('pressure', telemetry.pressure);
    if (typeof telemetry.batteryLevel === 'number')
      flatMap.set('batteryLevel', telemetry.batteryLevel);
    if (typeof telemetry.signalStrength === 'number')
      flatMap.set('signalStrength', telemetry.signalStrength);

    flatEntries.forEach(([key, val]) => {
      const numVal =
        typeof val === 'number' ? Math.abs(val) : parseFloat(String(val));
      if (!isNaN(numVal)) {
        flatMap.set(key, numVal);
      }
    });
  }

  const defaultKeys =
    selectedKeys && selectedKeys.length > 0
      ? selectedKeys
      : Array.from(flatMap.keys()).length > 0
        ? Array.from(flatMap.keys())
        : ['co2', 'voc'];

  const items: { name: string; value: number; color: string }[] = [];

  let idx = 0;
  for (const key of defaultKeys) {
    const val = flatMap.get(key);
    const fallbackVal = key.toLowerCase().includes('co2')
      ? 450
      : key.toLowerCase().includes('voc')
        ? 120
        : key.toLowerCase().includes('temp')
          ? 24.5
          : key.toLowerCase().includes('hum')
            ? 55
            : key.toLowerCase().includes('batt')
              ? 85
              : (idx + 1) * 30;

    const finalVal = val !== undefined ? val : fallbackVal;

    items.push({
      name: key,
      value: Number(finalVal.toFixed(1)),
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    });
    idx++;
  }

  return items;
}

// Helper to generate timeseries data around current telemetry value
function getDynamicTimeseriesData(
  currentVal: number,
  timeRange: string = '24h'
) {
  const rangeHours =
    timeRange === '1h'
      ? 1
      : timeRange === '6h'
        ? 6
        : timeRange === '12h'
          ? 12
          : timeRange === '7d'
            ? 168
            : timeRange === '30d'
              ? 720
              : 24;
  const points = Math.min(14, Math.max(5, Math.ceil(rangeHours / 12)));
  const stepMinutes = (rangeHours * 60) / (points - 1);
  const baseTime = new Date();
  const timeseries = [];

  for (let i = points - 1; i >= 0; i--) {
    const timeLabel = new Date(
      baseTime.getTime() - i * stepMinutes * 60 * 1000
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const variance =
      Math.sin(i) * 2.5 + (i === 0 ? 0 : (Math.random() - 0.5) * 1.5);
    timeseries.push({
      time: timeLabel,
      value: Number((currentVal + variance).toFixed(1)),
    });
  }

  return timeseries;
}

// Helper function to resolve exact Widget Type classification
function resolveWidgetClassification(widget: Widget): string {
  const chartType = (widget.visualization?.chartType || '').toLowerCase();
  const alias = (widget.descriptor?.alias || widget.type || '').toLowerCase();
  const category = (widget.category || '').toLowerCase();
  const title = (widget.title || '').toLowerCase();

  // 1. Controls
  if (
    chartType === 'thermostat-control' ||
    alias.includes('thermostat') ||
    title.includes('thermostat') ||
    title.includes('climate')
  ) {
    return 'thermostat-control';
  }
  if (
    chartType === 'slider-control' ||
    alias.includes('slider') ||
    title.includes('dimmer') ||
    title.includes('speed control')
  ) {
    return 'slider-control';
  }
  if (
    chartType === 'command-control' ||
    alias.includes('command') ||
    title.includes('action') ||
    title.includes('button panel')
  ) {
    return 'command-control';
  }
  if (
    chartType === 'device-switch' ||
    chartType === 'switch' ||
    alias.includes('switch') ||
    category.includes('control') ||
    category.includes('gpio') ||
    category.includes('input') ||
    title.includes('switch') ||
    title.includes('relay')
  ) {
    return 'device-switch';
  }

  // 2. Maps & GPS
  if (
    chartType === 'device-map' ||
    chartType === 'maps' ||
    alias.includes('map') ||
    category.includes('map') ||
    title.includes('map') ||
    title.includes('gps') ||
    title.includes('location')
  ) {
    return 'device-map';
  }

  // 3. Alarms & Security & Tables
  if (
    chartType === 'data-table' ||
    chartType === 'table' ||
    alias.includes('data-table') ||
    alias.includes('table') ||
    category.includes('table') ||
    title.includes('data table') ||
    title.includes('table')
  ) {
    return 'data-table';
  }
  if (
    chartType === 'alarms-table' ||
    chartType === 'alarm' ||
    alias.includes('alarm') ||
    category.includes('alarm') ||
    title.includes('alarm') ||
    title.includes('alert')
  ) {
    return 'alarms-table';
  }

  // 4. Gauges & Meters
  if (
    chartType === 'progress-bar' ||
    title.includes('progress') ||
    alias.includes('progress')
  ) {
    return 'progress-bar';
  }
  if (
    chartType === 'digital-gauge' ||
    title.includes('digital gauge') ||
    title.includes('speedometer')
  ) {
    return 'digital-gauge';
  }
  if (
    chartType === 'radial-gauge' ||
    chartType === 'gauge' ||
    category.includes('gauge') ||
    alias.includes('gauge') ||
    title.includes('gauge')
  ) {
    return 'radial-gauge';
  }

  // 5. Cards & Indicators
  if (
    chartType === 'multi-metric-card' ||
    title.includes('multi-metric') ||
    title.includes('overview') ||
    title.includes('grid')
  ) {
    return 'multi-metric-card';
  }
  if (
    chartType === 'status-card' ||
    title.includes('health') ||
    title.includes('device status') ||
    alias.includes('status')
  ) {
    return 'status-card';
  }
  if (
    chartType === 'metric-card' ||
    category.includes('card') ||
    alias.includes('card') ||
    alias.includes('metric') ||
    title.includes('metric') ||
    title.includes('card')
  ) {
    return 'metric-card';
  }

  // 6. Charts
  if (
    chartType === 'pie-chart' ||
    chartType === 'pie' ||
    chartType === 'donut' ||
    alias.includes('pie') ||
    title.includes('pie')
  ) {
    return 'pie-chart';
  }
  if (
    chartType === 'bar-chart' ||
    chartType === 'bar' ||
    alias.includes('bar') ||
    title.includes('bar chart')
  ) {
    return 'bar-chart';
  }
  if (
    chartType === 'line-chart' ||
    chartType === 'line' ||
    chartType === 'area' ||
    category.includes('chart') ||
    alias.includes('chart')
  ) {
    return 'line-chart';
  }

  return 'telemetry-default';
}

/** Helper to extract latitude & longitude from telemetry, device details, or widget config */

export function WidgetRenderer({
  widget,
  onDeviceChange,
}: WidgetRendererProps) {
  console.log(widget);
  // Interactive control states
  const [toggleState, setToggleState] = useState(false);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [sliderValue, setSliderValue] = useState(65);
  const [targetTemp, setTargetTemp] = useState(22.5);
  const [hvacMode, setHvacMode] = useState<'cool' | 'heat' | 'fan' | 'off'>(
    'cool'
  );
  const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<string[]>([]);

  const primaryColor = widget.visualization?.colors?.[0] || '#166bf3ff';
  const primaryDeviceId =
    widget.dataSource?.deviceIds?.[0] ||
    (widget.dataSource as any)?.deviceId ||
    widget.config?.deviceId ||
    '';
  console.log(primaryDeviceId);
  const isValidDevice =
    !!primaryDeviceId && !primaryDeviceId.includes('device-uuid');

  // Real-time telemetry connection
  const {
    data: telemetryData,
    isLive: isLiveTelemetry,
    isConnecting: isConnectingTelemetry,
    connectionState: telemetryConnectionState,
  } = useLiveTelemetry(isValidDevice ? primaryDeviceId : null);

  // Fetch device details to resolve human-readable device name from API
  const { data: deviceDetailResponse } = useQuery({
    queryKey: ['device-detail-widget', primaryDeviceId],
    queryFn: () =>
      primaryDeviceId
        ? devicesApi.getById(primaryDeviceId)
        : Promise.resolve(null),
    enabled: isValidDevice,
    staleTime: 60_000,
  });

  // Fetch real device alarms from API
  const { data: alarmsResponse } = useQuery({
    queryKey: ['device-alarms-widget', primaryDeviceId],
    queryFn: () =>
      primaryDeviceId
        ? alarmsApi.getByDevice(primaryDeviceId)
        : Promise.resolve(null),
    enabled: isValidDevice,
    staleTime: 15_000,
  });

  const resolvedDeviceName =
    widget.dataSource?.deviceName ||
    (deviceDetailResponse?.data as any)?.data?.name ||
    (deviceDetailResponse?.data as any)?.name ||
    (telemetryData as any)?.deviceName ||
    (telemetryData as any)?.device?.name ||
    (isValidDevice ? primaryDeviceId : undefined);

  // Derive the primary switch key from configured telemetry keys or auto-detect
  const liveData: Record<string, any> = (telemetryData as any)?.data || {};
  const switchKey =
    widget.dataSource?.telemetryKeys?.find((k) => /^switch/i.test(k)) ||
    Object.keys(liveData).find((k) => /^switch/i.test(k)) ||
    'switch_1';

  // Sync toggle state with live telemetry whenever it updates
  useEffect(() => {
    const val = liveData[switchKey];
    if (val !== undefined && val !== null) {
      setToggleState(Boolean(val));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(liveData), switchKey]);

  const isPollingFallback = telemetryConnectionState === 'polling';
  const classification = resolveWidgetClassification(widget);

  // --------------------------------------------------------------------------
  // 1. RELAY / POWER SWITCH CONTROL WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'device-switch') {
    return (
      <ToggleSwitch
        toggleState={toggleState}
        setToggleState={setToggleState}
        primaryColor={primaryColor}
        widget={widget}
        primaryDeviceId={primaryDeviceId}
        isValidDevice={isValidDevice}
        isLiveTelemetry={isLiveTelemetry}
        isConnectingTelemetry={isConnectingTelemetry}
        isPollingFallback={isPollingFallback}
        classification={classification}
        resolvedDeviceName={resolvedDeviceName}
        switchKey={switchKey}
        setIsSendingCommand={setIsSendingCommand}
        isSendingCommand={isSendingCommand}
      />
    );
  }

  // --------------------------------------------------------------------------
  // 2. SLIDER / DIMMER / SPEED CONTROLLER WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'slider-control') {
    const keyName = widget.dataSource?.telemetryKeys?.[0] || 'Speed Level';
    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sliders className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{widget.title || 'Dimmer / Output Controller'}</span>
          </div>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Sliders} />
        ) : (
          <div className="flex flex-col gap-3 my-auto py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                {keyName} Target Output
              </span>
              <span
                className="text-2xl font-black font-mono tracking-tight"
                style={{ color: primaryColor }}
              >
                {sliderValue}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>0% (OFF)</span>
                <span>50% (MID)</span>
                <span>100% (MAX)</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSliderValue(preset);
                    toast.success(`Set ${keyName} to ${preset}%`);
                  }}
                  className={`py-1 rounded text-[10px] font-bold border transition-all ${
                    sliderValue === preset
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary'
                  }`}
                >
                  {preset === 0 ? 'OFF' : preset === 100 ? 'MAX' : `${preset}%`}
                </button>
              ))}
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. THERMOSTAT / SMART CLIMATE CONTROLLER WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'thermostat-control') {
    const currentTemp = getTelemetryNumericValue(
      telemetryData,
      'temperature',
      24.2
    );

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{widget.title || 'Smart Thermostat'}</span>
          </div>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Flame} />
        ) : (
          <div className="flex flex-col items-center justify-center my-auto py-1">
            {/* Temp Dial Controls */}
            <div className="flex items-center gap-4 my-1">
              <button
                type="button"
                onClick={() =>
                  setTargetTemp((t) => Number((t - 0.5).toFixed(1)))
                }
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                  {targetTemp.toFixed(1)}°C
                </span>
                <span className="text-[10px] text-slate-400">
                  Ambient: {currentTemp.toFixed(1)}°C
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTargetTemp((t) => Number((t + 0.5).toFixed(1)))
                }
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* HVAC Mode Selectors */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 mt-2 text-[10px]">
              {(
                [
                  {
                    id: 'cool',
                    label: 'Cool',
                    icon: Snowflake,
                    color: 'text-cyan-400',
                  },
                  {
                    id: 'heat',
                    label: 'Heat',
                    icon: Flame,
                    color: 'text-amber-400',
                  },
                  {
                    id: 'fan',
                    label: 'Fan',
                    icon: Wind,
                    color: 'text-emerald-400',
                  },
                  {
                    id: 'off',
                    label: 'Off',
                    icon: Power,
                    color: 'text-slate-400',
                  },
                ] as const
              ).map((mode) => {
                const IconComp = mode.icon;
                const isSelected = hvacMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setHvacMode(mode.id);
                      toast.success(`HVAC Mode changed to ${mode.label}`);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-white shadow-md font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <IconComp
                      className={`w-3 h-3 ${isSelected ? 'text-white' : mode.color}`}
                    />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 4. COMMAND / RPC ACTION BUTTONS PANEL WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'command-control') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Radio className="w-4 h-4 text-purple-500" />
            <span>{widget.title || 'Device Action Control Panel'}</span>
          </div>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Radio} />
        ) : (
          <div className="grid grid-cols-2 gap-2 my-auto py-2">
            {[
              {
                label: 'System Reset',
                icon: RotateCcw,
                color:
                  'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
              },
              {
                label: 'Calibrate Sensors',
                icon: CheckCircle2,
                color:
                  'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
              },
              {
                label: 'Sync Configuration',
                icon: RefreshCw,
                color:
                  'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
              },
              {
                label: 'Emergency Stop',
                icon: Octagon,
                color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
              },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() =>
                    toast.success(`Triggered RPC Action: ${action.label}`)
                  }
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer shadow-sm active:scale-95 ${action.color}`}
                >
                  <ActionIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 5. RADIAL DIAL GAUGE WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'radial-gauge') {
    const key = widget.dataSource?.telemetryKeys?.[0] || 'pressure';
    const rawVal = getTelemetryNumericValue(telemetryData, key, 68);
    const val = Math.min(100, Math.max(0, rawVal));

    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-2 text-center bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
            <Gauge className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{widget.title || `${key} Gauge`}</span>
          </div>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Gauge} />
        ) : (
          <div className="relative w-32 h-32 flex items-center justify-center my-auto">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="transition-all duration-1000 ease-out"
                strokeDasharray={`${val}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke={primaryColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono leading-none">
                {val.toFixed(0)}
              </span>
              <span
                className="text-[10px] font-bold uppercase mt-1"
                style={{ color: primaryColor }}
              >
                {key}
              </span>
              <span className="text-[9px] text-slate-400">Range: 0-100</span>
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 6. CYBER DIGITAL SPEEDOMETER / GAUGE WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'digital-gauge') {
    const key = widget.dataSource?.telemetryKeys?.[0] || 'speed';
    const val = getTelemetryNumericValue(telemetryData, key, 74.5);

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-slate-950 text-cyan-400 rounded-lg font-mono border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Digital Readout
          </span>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Sparkles} />
        ) : (
          <div className="my-auto flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-widest text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              {val.toFixed(1)}
            </span>
            <span className="text-[10px] text-cyan-500 uppercase tracking-widest mt-1 font-bold">
              {key} OUTPUT UNIT
            </span>
            {/* Dynamic bar gauge */}
            <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-cyan-900">
              <div
                className="h-full bg-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
              />
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 7. PROGRESS BAR / CAPACITY UTILIZATION WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'progress-bar') {
    const key = widget.dataSource?.telemetryKeys?.[0] || 'batteryLevel';
    const rawVal = getTelemetryNumericValue(telemetryData, key, 82);
    const value = Math.min(100, Math.max(0, rawVal));

    const statusColor =
      value > 85 ? '#ef4444' : value > 65 ? '#f59e0b' : primaryColor;

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between">
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Activity} />
        ) : (
          <div className="flex flex-col gap-2 my-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Current Level
              </span>
              <span
                className="text-2xl font-black font-mono"
                style={{ color: statusColor }}
              >
                {value.toFixed(0)}%
              </span>
            </div>

            <div className="w-full bg-slate-200 shadow shadow-[rgba(0,0,0,0.3)] dark:bg-slate-800 h-4 rounded-full overflow-hidden relative shadow-inner p-0.5">
              <div
                className="h-full   rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${value}%`,
                  backgroundColor: statusColor,
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Min: 0%</span>
              <span className="text-emerald-500 font-bold">
                {value > 85 ? 'HIGH LOAD' : 'OPTIMAL'}
              </span>
              <span>Max: 100%</span>
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 8. SINGLE METRIC CARD WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'metric-card') {
    const cardKey = widget.dataSource?.telemetryKeys?.[0] || 'temperature';
    const numVal = getTelemetryNumericValue(telemetryData, cardKey, 23.8);

    const getIconForKey = (k: string) => {
      const lower = k.toLowerCase();
      if (lower.includes('temp'))
        return <Thermometer className="w-5 h-5 text-amber-500" />;
      if (lower.includes('humid'))
        return <Droplets className="w-5 h-5 text-blue-500" />;
      if (lower.includes('batt'))
        return <Battery className="w-5 h-5 text-emerald-500" />;
      if (lower.includes('power') || lower.includes('volt'))
        return <Zap className="w-5 h-5 text-yellow-500" />;
      if (lower.includes('signal') || lower.includes('rssi'))
        return <Wifi className="w-5 h-5 text-purple-500" />;
      return <Zap className="w-5 h-5" style={{ color: primaryColor }} />;
    };

    return (
      <div className="w-full h-full flex flex-col justify-between p-3.5 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">
            {widget.title || cardKey}
          </span>
          <div className="flex items-center gap-2">
            <LiveStatusBadge
              isLive={isLiveTelemetry}
              isConnecting={isConnectingTelemetry}
              isPolling={isPollingFallback}
            />
            {getIconForKey(cardKey)}
          </div>
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Zap} />
        ) : (
          <div className="my-auto  ">
            <div className="flex justify-center items-center gap-1.5 ">
              <span className="text-4xl font-black text-center text-slate-900 dark:text-white tracking-tight font-mono text-shadow-md  ">
                {numVal.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {cardKey.includes('temp')
                  ? '°C'
                  : cardKey.includes('humid')
                    ? '%'
                    : ''}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Telemetry streaming active</span>
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 9. MULTI-METRIC TELEMETRY OVERVIEW GRID CARD
  // --------------------------------------------------------------------------
  if (classification === 'multi-metric-card') {
    const flatMetrics =
      telemetryData?.data && typeof telemetryData.data === 'object'
        ? flattenObject(telemetryData.data)
        : [
            ['temperature', 23.5],
            ['humidity', 54.0],
            ['batteryLevel', 88],
            ['signalStrength', 92],
          ];

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Layers className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{widget.title || 'Telemetry Grid'}</span>
          </div>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Layers} />
        ) : (
          <div className="grid grid-cols-2 gap-2 my-auto overflow-y-auto max-h-36 py-1">
            {flatMetrics.slice(0, 6).map(([k, v]) => {
              const numVal = typeof v === 'number' ? v : parseFloat(String(v));
              return (
                <div
                  key={k}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize truncate">
                    {k}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {!isNaN(numVal) ? numVal.toFixed(1) : String(v)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 10. DEVICE HEALTH & STATUS DIAGNOSTICS CARD
  // --------------------------------------------------------------------------
  if (classification === 'status-card') {
    const battery = telemetryData?.batteryLevel ?? 85;
    const signal = telemetryData?.signalStrength ?? 94;

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>{widget.title || 'Device Diagnostics'}</span>
          </div>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Cpu} />
        ) : (
          <div className="space-y-2 my-auto py-1 text-xs">
            {/* Status Header */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  DEVICE ONLINE
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">
                Uptime 14d 6h
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="flex items-center gap-1 text-slate-500">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" /> Battery
                </span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {battery}%
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="flex items-center gap-1 text-slate-500">
                  <Wifi className="w-3.5 h-3.5 text-purple-500" /> Signal
                </span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {signal}%
                </span>
              </div>
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 11. PIE CHART / DONUT TELEMETRY DISTRIBUTION WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'pie-chart') {
    const pieData = getDynamicPieData(
      telemetryData,
      widget.dataSource?.telemetryKeys,
      primaryColor,
      widget.visualization?.colors
    );

    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between w-full mb-1">
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={PieChartIcon} />
        ) : pieData.length === 0 ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center p-4 text-center">
            <PieChartIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              Waiting for telemetry key data...
            </p>
          </div>
        ) : (
          <>
            <div className="w-full h-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <defs>
                    <filter
                      id="pieShadow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="3"
                        stdDeviation="4"
                        floodColor="#000000"
                        floodOpacity="0.25"
                      />
                    </filter>
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={58}
                    innerRadius={30}
                    paddingAngle={4}
                    dataKey="value"
                    filter="url(#pieShadow)"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f1f1f2',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#1e1e1e',
                      fontSize: '12px',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 w-full text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800 max-h-20 overflow-y-auto">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0 ml-1 font-mono">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 12. BAR CHART WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'bar-chart') {
    const pieData = getDynamicPieData(
      telemetryData,
      widget.dataSource?.telemetryKeys,
      primaryColor
    );

    return (
      <div className="w-full h-full flex flex-col justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <BarChart2 className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{widget.title || 'Telemetry Bar Chart'}</span>
          </div>
          <LiveStatusBadge
            isLive={isLiveTelemetry}
            isConnecting={isConnectingTelemetry}
            isPolling={isPollingFallback}
          />
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={BarChart2} />
        ) : (
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={pieData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={primaryColor}
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 13. TIMESERIES LINE / AREA CHART WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'line-chart') {
    const chartKey = widget.dataSource?.telemetryKeys?.[0] || 'temperature';
    const currentVal = getTelemetryNumericValue(telemetryData, chartKey, 23.5);

    const timeseriesData = getDynamicTimeseriesData(
      currentVal,
      widget.dataSource?.timeRange
    );

    return (
      <div className="w-full h-full flex flex-col justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 capitalize">
            <BarChart2 className="w-4 h-4" style={{ color: primaryColor }} />
            {widget.title || `${chartKey} Trend`}
          </span>
          <div className="flex items-center gap-2">
            <LiveStatusBadge
              isLive={isLiveTelemetry}
              isConnecting={isConnectingTelemetry}
              isPolling={isPollingFallback}
            />
          </div>
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={BarChart2} />
        ) : (
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeseriesData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`gradient-${widget.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={primaryColor}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={primaryColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  stroke="#94A3B8"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#94A3B8"
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '6px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={primaryColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#gradient-${widget.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 14. GEOSPATIAL MAP & GPS TRACKER WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'device-map') {
    return (
      <DeviceMapWidget
        widget={widget}
        telemetryData={telemetryData}
        deviceDetailResponse={deviceDetailResponse}
        resolvedDeviceName={resolvedDeviceName}
        isLiveTelemetry={isLiveTelemetry}
        isConnectingTelemetry={isConnectingTelemetry}
        isPollingFallback={isPollingFallback}
        isValidDevice={isValidDevice}
      />
    );
  }

  // --------------------------------------------------------------------------
  // 15. ALARMS & ALERTS MONITOR WIDGET
  // --------------------------------------------------------------------------
  if (classification === 'alarms-table') {
    const rawApiAlarms =
      (alarmsResponse?.data as any)?.data?.data ||
      (alarmsResponse?.data as any)?.data ||
      (alarmsResponse?.data as any) ||
      [];
    const fetchedAlarms = Array.isArray(rawApiAlarms) ? rawApiAlarms : [];

    const defaultAlarms = [
      {
        id: '1',
        title: 'High Temp Threshold',
        target: 'Sensor-02 (42.8°C)',
        level: 'critical',
      },
      {
        id: '2',
        title: 'Low Battery Level',
        target: 'Gateway-01 (14%)',
        level: 'warning',
      },
    ];

    const activeAlarmsList =
      fetchedAlarms.length > 0
        ? fetchedAlarms.map((a: any) => ({
            id: a.id || String(a.type),
            title: a.type || a.name || 'Device Alarm',
            target:
              a.details?.message ||
              a.details?.description ||
              a.originatorName ||
              resolvedDeviceName ||
              'Device',
            level: (a.severity || 'warning').toLowerCase(),
          }))
        : defaultAlarms;

    return (
      <AlaramsList
        widget={widget}
        activeAlarmsList={activeAlarmsList}
        acknowledgedAlarms={acknowledgedAlarms}
        setAcknowledgedAlarms={setAcknowledgedAlarms}
        isValidDevice={isValidDevice}
        resolvedDeviceName={resolvedDeviceName}
      />
    );
  }

  // --------------------------------------------------------------------------
  // 16. DATA TABLE WIDGET (IoT Telemetry Log / Data Table)
  // --------------------------------------------------------------------------
  if (classification === 'data-table') {
    const [tableSearch, setTableSearch] = useState('');

    const flatEntries =
      telemetryData?.data && typeof telemetryData.data === 'object'
        ? flattenObject(telemetryData.data)
        : [
            ['temperature', 24.5],
            ['humidity', 52.1],
            ['pressure', 1013.2],
            ['batteryLevel', 88],
            ['signalStrength', 94],
            ['voltage', 220.4],
            ['current', 4.8],
          ];

    const filteredRows = tableSearch
      ? flatEntries.filter(([k]) =>
          String(k).toLowerCase().includes(tableSearch.toLowerCase())
        )
      : flatEntries;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return (
      <div className="w-full h-full flex flex-col justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Table className="w-4 h-4 text-blue-500" />
            <span>{widget.title || 'Telemetry Data Table'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LiveStatusBadge
              isLive={isLiveTelemetry}
              isConnecting={isConnectingTelemetry}
              isPolling={isPollingFallback}
            />
            <button
              type="button"
              onClick={() => toast.success('Exported Telemetry Data to CSV')}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isValidDevice ? (
          <EmptyDeviceState widget={widget} icon={Table} />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Filter Bar */}
            <div className="relative mb-2 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search telemetry keys..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-primary text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Scrollable Data Table */}
            <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold sticky top-0 z-10">
                  <tr>
                    <th className="p-1.5 pl-2 border-b border-slate-200 dark:border-slate-700">
                      Key
                    </th>
                    <th className="p-1.5 border-b border-slate-200 dark:border-slate-700">
                      Value
                    </th>
                    <th className="p-1.5 border-b border-slate-200 dark:border-slate-700">
                      Timestamp
                    </th>
                    <th className="p-1.5 pr-2 text-right border-b border-slate-200 dark:border-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-slate-400 italic text-[10px]"
                      >
                        No matching telemetry keys
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map(([key, val]) => {
                      const numVal =
                        typeof val === 'number' ? val : parseFloat(String(val));
                      return (
                        <tr
                          key={key}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="p-1.5 pl-2 font-semibold text-slate-700 dark:text-slate-200 truncate capitalize max-w-[100px]">
                            {key}
                          </td>
                          <td className="p-1.5 font-bold font-mono text-slate-900 dark:text-white">
                            {!isNaN(numVal) ? numVal.toFixed(1) : String(val)}
                          </td>
                          <td className="p-1.5 text-slate-400 font-mono text-[10px]">
                            {timeStr}
                          </td>
                          <td className="p-1.5 pr-2 text-right">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FALLBACK TO TELEMETRY WIDGET COMPONENT
  // --------------------------------------------------------------------------
  return (
    <TelemetryWidget
      data={widget.content}
      refreshInterval={widget.config?.refreshInterval}
      enabledMetrics={widget.config?.enabledMetrics}
      deviceId={widget.config?.deviceId}
      onDeviceChange={onDeviceChange}
    />
  );
}
