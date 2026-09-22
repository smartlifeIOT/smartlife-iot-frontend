import { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Thermometer,
  Droplets,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart } from '@/components/charts/BarChart';

export interface DeviceTelemetry {
  deviceId: string;
  deviceName: string;
  status: 'online' | 'offline';
  lastUpdate: Date;
  metrics: {
    temperature?: number;
    humidity?: number;
    battery?: number;
    power?: number;
    signal?: number;
  };
}

// Mock/temporary data generator for single device
const generateMockDeviceTelemetry = (deviceId?: string): DeviceTelemetry => {
  const devices = [
    { id: 'dev-001', name: 'Temperature Sensor 01' },
    { id: 'dev-002', name: 'Humidity Monitor 02' },
    { id: 'dev-003', name: 'Smart Thermostat 03' },
    { id: 'dev-004', name: 'Power Meter 04' },
    { id: 'dev-005', name: 'Air Quality Sensor 05' },
  ];

  const device = devices.find((d) => d.id === deviceId) || devices[0];

  return {
    deviceId: device.id,
    deviceName: device.name,
    status: Math.random() > 0.2 ? 'online' : 'offline',
    lastUpdate: new Date(),
    metrics: {
      temperature:
        device.name.includes('Temperature') ||
        device.name.includes('Thermostat')
          ? Math.round((Math.random() * 30 + 15) * 10) / 10
          : Math.round((Math.random() * 30 + 15) * 10) / 10,
      humidity:
        device.name.includes('Humidity') || device.name.includes('Air')
          ? Math.round((Math.random() * 40 + 30) * 10) / 10
          : Math.round((Math.random() * 40 + 30) * 10) / 10,
      battery: Math.round((Math.random() * 30 + 70) * 10) / 10,
      power: device.name.includes('Power')
        ? Math.round((Math.random() * 500 + 100) * 10) / 10
        : Math.round((Math.random() * 500 + 100) * 10) / 10,
      signal: Math.round((Math.random() * 30 + 70) * 10) / 10,
    },
  };
};

// Generate list of available devices for selection
export const availableDevices = [
  { id: 'dev-001', name: 'Temperature Sensor 01' },
  { id: 'dev-002', name: 'Humidity Monitor 02' },
  { id: 'dev-003', name: 'Smart Thermostat 03' },
  { id: 'dev-004', name: 'Power Meter 04' },
  { id: 'dev-005', name: 'Air Quality Sensor 05' },
];

export type MetricType =
  | 'temperature'
  | 'humidity'
  | 'battery'
  | 'power'
  | 'signal';

export interface TelemetryWidgetConfig {
  enabledMetrics?: MetricType[];
  refreshInterval?: number;
  deviceId?: string;
}

interface TelemetryWidgetProps {
  data?: DeviceTelemetry[];
  refreshInterval?: number;
  enabledMetrics?: MetricType[];
  deviceId?: string;
  onDeviceChange?: (deviceId: string) => void;
}

export function TelemetryWidget({
  data,
  refreshInterval = 5000,
  enabledMetrics = ['temperature', 'humidity', 'battery', 'power', 'signal'],
  deviceId: propDeviceId,
  onDeviceChange,
}: TelemetryWidgetProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    propDeviceId || availableDevices[0].id
  );
  const [deviceTelemetry, setDeviceTelemetry] = useState<DeviceTelemetry>(
    data?.[0] || generateMockDeviceTelemetry(selectedDeviceId)
  );

  useEffect(() => {
    if (propDeviceId && propDeviceId !== selectedDeviceId) {
      setSelectedDeviceId(propDeviceId);
    }
  }, [propDeviceId]);

  useEffect(() => {
    if (!data) {
      // Auto-refresh mock data for selected device
      const interval = setInterval(() => {
        setDeviceTelemetry(generateMockDeviceTelemetry(selectedDeviceId));
      }, refreshInterval);

      return () => clearInterval(interval);
    } else if (data.length > 0) {
      setDeviceTelemetry(data[0]);
    }
  }, [data, refreshInterval, selectedDeviceId]);

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    if (onDeviceChange) {
      onDeviceChange(newDeviceId);
    }
    if (!data) {
      setDeviceTelemetry(generateMockDeviceTelemetry(newDeviceId));
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusColor = (status: 'online' | 'offline') => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'temperature':
        return <Thermometer className="h-5 w-5 text-orange-500" />;
      case 'humidity':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'battery':
        return <Battery className="h-5 w-5 text-green-500" />;
      case 'power':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'signal':
        return <Wifi className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMetricColor = (metricName: string) => {
    switch (metricName) {
      case 'temperature':
        return 'bg-orange-500';
      case 'humidity':
        return 'bg-blue-500';
      case 'battery':
        return 'bg-green-500';
      case 'power':
        return 'bg-yellow-500';
      case 'signal':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMetricValue = (metricName: MetricType) => {
    const value = deviceTelemetry.metrics[metricName];
    if (value === undefined) return 0;
    return value;
  };

  const getMetricUnit = (metricName: MetricType) => {
    switch (metricName) {
      case 'temperature':
        return '°C';
      case 'humidity':
      case 'battery':
      case 'signal':
        return '%';
      case 'power':
        return 'W';
      default:
        return '';
    }
  };

  const getMetricMax = (metricName: MetricType) => {
    switch (metricName) {
      case 'temperature':
        return 50;
      case 'humidity':
        return 100;
      case 'battery':
        return 100;
      case 'power':
        return 1000;
      case 'signal':
        return 100;
      default:
        return 100;
    }
  };

  // Prepare data for bar chart
  const chartData = enabledMetrics.map((metric) => ({
    metric: metric.charAt(0).toUpperCase() + metric.slice(1),
    value: getMetricValue(metric),
    max: getMetricMax(metric),
  }));

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      {/* Device Selection & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(deviceTelemetry.status)} animate-pulse`}
          />
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            {deviceTelemetry.deviceName}
          </span>
          <Badge
            variant={
              deviceTelemetry.status === 'online' ? 'default' : 'destructive'
            }
            className="text-xs"
          >
            {deviceTelemetry.status === 'online' ? (
              <Wifi className="h-3 w-3 mr-1" />
            ) : (
              <WifiOff className="h-3 w-3 mr-1" />
            )}
            {deviceTelemetry.status}
          </Badge>
        </div>
        <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder="Select device" />
          </SelectTrigger>
          <SelectContent>
            {availableDevices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                {device.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bar Chart */}
      {enabledMetrics.length > 0 && (
        <div className="flex-1 min-h-0">
          <BarChart
            data={chartData}
            bars={[
              {
                dataKey: 'value',
                name: 'Current Value',
                fill: '#8b5cf6',
              },
            ]}
            xAxisKey="metric"
            height={200}
            showGrid={true}
            showLegend={false}
            showTooltip={true}
            className="border-0 shadow-none"
          />
        </div>
      )}

      {/* Metric Cards with Progress Bars */}
      <div className="grid grid-cols-2 gap-3">
        {enabledMetrics.map((metric) => {
          const value = getMetricValue(metric);
          const max = getMetricMax(metric);
          const percentage = (value / max) * 100;

          return (
            <div
              key={metric}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric)}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {metric}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {value.toFixed(1)}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                    {getMetricUnit(metric)}
                  </span>
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getMetricColor(metric)} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {percentage.toFixed(0)}% of {max}
                {getMetricUnit(metric)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Update */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Last update: {formatTime(deviceTelemetry.lastUpdate)}
        </div>
      </div>
    </div>
  );
}
