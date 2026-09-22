import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CheckCircle2, AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { cn } from '@/lib/util';
import { useDeviceDetails } from '@/features/analytics/hooks';
import { exportDeviceDetailsPdf } from '../utils/exportDeviceDetailsPdf';
export default function DeviceanalyticsDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [timeRange, setTimeRange] = useState<string>('24h');
  const {
    data: deviceAnalytics,
    isLoading,
    isError,
    refetch,
  } = useDeviceDetails(id!, timeRange);
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6 animate-pulse p-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl"
            />
          ))}
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (isError || !deviceAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Failed to load device analytics
        </h2>
        <p className="text-sm text-gray-500">
          The requested device details could not be retrieved.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const device = deviceAnalytics.device;
  const stats = deviceAnalytics.stats;
  const period = deviceAnalytics.period;
  const telemetryTrend = deviceAnalytics.telemetryTrend || [];
  const telemetrySummary = deviceAnalytics.telemetrySummary || [];
  const alarmHistory = deviceAnalytics.alarmHistory || [];

  // Available summary keys
  const availableMetrics = telemetrySummary.map((s) => s.key);
  const activeMetricKey = availableMetrics.includes(selectedMetric)
    ? selectedMetric
    : availableMetrics[0] || 'temperature';

  // Pivot telemetryTrend array by timestamp
  const pivotMap = new Map<string, Record<string, any>>();
  telemetryTrend.forEach((item) => {
    const ts = item.timestamp || item.bucket;
    if (!ts) return;
    if (!pivotMap.has(ts)) {
      const d = new Date(ts);
      const label = isNaN(d.getTime())
        ? ts
        : `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      pivotMap.set(ts, { timestamp: ts, label });
    }
    const row = pivotMap.get(ts)!;
    if (item.key && item.value !== undefined) {
      const numVal = Number(item.value);
      row[item.key] = !isNaN(numVal) ? Number(numVal.toFixed(2)) : item.value;
    }
  });

  const chartData = Array.from(pivotMap.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Active summary details
  const activeSummary =
    telemetrySummary.find((s) => s.key === activeMetricKey) ||
    telemetrySummary[0];
  const unitMap: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    co2: ' ppm',
    batteryLevel: '%',
    pressure: ' hPa',
    signalStrength: ' dBm',
    voc: ' ppb',
    vibration: '',
  };
  const unit = activeSummary?.unit || unitMap[activeMetricKey] || '';

  // Gauge percentage calculation
  let gaugeValue = 80;
  if (activeSummary) {
    const latestNum = Number(activeSummary.latest);
    if (
      !isNaN(latestNum) &&
      activeSummary.max != null &&
      activeSummary.min != null &&
      activeSummary.max > activeSummary.min
    ) {
      gaugeValue = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((latestNum - activeSummary.min) /
              (activeSummary.max - activeSummary.min)) *
              100
          )
        )
      );
    } else if (!isNaN(latestNum) && activeMetricKey === 'batteryLevel') {
      gaugeValue = Math.min(100, Math.max(0, Math.round(latestNum)));
    }
  }

  const gaugeData = [
    { name: 'Active', value: gaugeValue, color: '#c026d3' },
    {
      name: 'Remaining',
      value: Math.max(0, 100 - gaugeValue),
      color: '#f1f5f9',
    },
  ];

  const isOnline = device?.status?.toLowerCase() === 'online';
  const handleExportPdf = () => {
    exportDeviceDetailsPdf({
      device,
      stats,
      telemetrySummary: deviceAnalytics.telemetrySummary || [],
      telemetryTrend: deviceAnalytics.telemetryTrend || [],
      alarmHistory: deviceAnalytics.alarmHistory || [],

      hourlyActivity: deviceAnalytics.hourlyActivity || [],
      period,
    });
  };
  return (
    <div className="flex flex-col space-y-6   pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={device?.name || 'Device Details'}
          description={`Type: ${device?.type || 'N/A'} | Location: ${device?.location || 'Unassigned'}`}
        />
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h" className="text-xs">
                1 Hour
              </SelectItem>
              <SelectItem value="24h" className="text-xs">
                24 Hours
              </SelectItem>
              <SelectItem value="7d" className="text-xs">
                7 Days
              </SelectItem>
              <SelectItem value="30d" className="text-xs">
                30 Days
              </SelectItem>
              <SelectItem value="90d" className="text-xs">
                90 Days
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="primary" onClick={handleExportPdf}>
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Status */}
        <Card
          className={`border-none shadow-sm ${isOnline ? 'bg-success text-white' : 'bg-primary text-white'}`}
        >
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold uppercase opacity-90">
              {t('analytics.deviceDetails.stats.currentStatus', {
                defaultValue: 'Current Status',
              })}
            </h3>
            <p className="text-xl font-bold mt-1">
              {device?.status ? device.status.toUpperCase() : 'UNKNOWN'}
            </p>
            <p className="text-xs opacity-80 mt-1">
              Last seen: {stats?.lastSeenAgo || 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Data Rate */}
        <Card className="border-none shadow-sm bg-secondary text-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold uppercase opacity-90">
              {t('analytics.deviceDetails.stats.dataRate', {
                defaultValue: 'Data Rate',
              })}
            </h3>
            <p className="text-xl font-bold mt-1">
              {stats?.dataRate || '0.000 MB/day'}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {stats?.messagesInWindow?.toLocaleString() ?? 0} msgs in window
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Uptime */}
        <Card className="border-none shadow-sm bg-success text-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold uppercase opacity-90">
              {t('analytics.deviceDetails.stats.uptime', {
                defaultValue: 'Uptime',
              })}
            </h3>
            <p className="text-xl font-bold mt-1">
              {stats?.uptimePercentage ?? 0}%
            </p>
            <p className="text-xs opacity-80 mt-1">
              Period: {period?.days ?? 1} day(s)
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Active Alarms / Errors */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              {t('analytics.deviceDetails.stats.activeAlerts', {
                defaultValue: 'Active Alarms & Errors',
              })}
            </h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.activeAlarms ?? 0} Active Alarms
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Errors: {stats?.errorCount ?? 0} | Total msgs:{' '}
              {(stats?.totalMessages ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Telemetry Summary Metrics Grid */}
      {telemetrySummary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {telemetrySummary.map((summaryItem) => {
            const isSelected = summaryItem.key === activeMetricKey;
            const itemUnit = summaryItem.unit || unitMap[summaryItem.key] || '';
            return (
              <div
                key={summaryItem.key}
                onClick={() => setSelectedMetric(summaryItem.key)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-card'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 block truncate">
                  {summaryItem.key}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 block truncate">
                  {summaryItem.latest != null
                    ? `${summaryItem.latest}${itemUnit}`
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 block truncate">
                  Avg:{' '}
                  {summaryItem.avg != null
                    ? Number(summaryItem.avg).toFixed(1)
                    : 'N/A'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry Trend Chart */}
        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
                Telemetry Trend: {activeMetricKey}
              </CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {chartData.length} data points recorded in current period
              </p>
            </div>
            {availableMetrics.length > 0 && (
              <Select value={activeMetricKey} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40 h-9 text-xs">
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((mKey) => (
                    <SelectItem
                      key={mKey}
                      value={mKey}
                      className="capitalize text-xs"
                    >
                      {mKey}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[350px] w-full mt-4">
              {chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 gap-2">
                  <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  <span>No telemetry data available for {activeMetricKey}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      unit={unit}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pData = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-200 block mb-1">
                                {pData.label}
                              </span>
                              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold capitalize">
                                <span>{activeMetricKey}:</span>
                                <span>
                                  {pData[activeMetricKey] ?? 'N/A'}
                                  {unit}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={activeMetricKey}
                      name={activeMetricKey}
                      stroke="#c026d3"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#c026d3' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Metric Gauge & Details */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
              Metric: {activeMetricKey}
            </CardTitle>
            {activeSummary ? (
              <p className="text-xs text-gray-400">
                Min: {activeSummary.min ?? 'N/A'}
                {unit} | Max: {activeSummary.max ?? 'N/A'}
                {unit} | Avg:{' '}
                {activeSummary.avg != null
                  ? Number(activeSummary.avg).toFixed(2)
                  : 'N/A'}
                {unit}
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Operational gauge indicator
              </p>
            )}
          </CardHeader>
          <CardContent className="p-6 pt-4 flex flex-col items-center">
            <div className="h-[220px] w-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    startAngle={225}
                    endAngle={-45}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">
                  {activeSummary?.latest != null
                    ? `${activeSummary.latest}${unit}`
                    : `${gaugeValue}%`}
                </span>
                <span className="text-[10px] text-gray-400 font-medium text-center px-6 mt-1 capitalize">
                  Latest {activeMetricKey}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Latest Value:</span>
                <span className="font-semibold">
                  {activeSummary?.latest != null
                    ? `${activeSummary.latest}${unit}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average:</span>
                <span className="font-semibold">
                  {activeSummary?.avg != null
                    ? `${Number(activeSummary.avg).toFixed(2)}${unit}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Samples Count:</span>
                <span className="font-semibold">
                  {activeSummary?.samples ?? chartData.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert History */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.deviceDetails.alertHistory.title', {
                defaultValue: 'Alarm & Alert History',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {alarmHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-xs gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <span>No active or historical alarms for this device</span>
              </div>
            ) : (
              alarmHistory.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2.5 h-2.5 rounded-full',
                        alert.color ||
                          (alert.severity === 'CRITICAL'
                            ? 'bg-red-500'
                            : 'bg-indigo-600')
                      )}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {alert.message || alert.type || 'Alert trigger'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {alert.time ||
                      (alert.timestamp
                        ? new Date(alert.timestamp).toLocaleTimeString()
                        : '')}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.deviceDetails.info.title', {
                defaultValue: 'Device Information',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Device ID:
                </span>
                <span className="font-mono text-xs font-medium text-gray-800 dark:text-gray-200">
                  {device?.id}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Device Key:
                </span>
                <span className="font-mono text-xs font-medium text-gray-800 dark:text-gray-200">
                  {device?.deviceKey || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Device Type / Profile:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                  {device?.type}{' '}
                  {device?.deviceProfileName
                    ? `(${device.deviceProfileName})`
                    : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Location:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {device?.location || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Firmware Version:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {device?.firmwareVersion || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Last Seen At:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {device?.lastSeenAt
                    ? new Date(device.lastSeenAt).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  GPS Coordinates:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {device?.latitude != null && device?.longitude != null
                    ? `${device.latitude}, ${device.longitude}`
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button variant="primary">Configure</Button>
              <Button variant="secondary">Export Data</Button>
              <Button variant="outline">Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
