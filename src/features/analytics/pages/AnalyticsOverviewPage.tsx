import { useAnalyticsOverview } from '@/features/analytics/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Wifi,
  WifiOff,
  Cpu,
  AlertTriangle,
  MessageSquare,
  Layers,
  BarChart3,
  Clock,
  TrendingUp,
  Activity,
  Shield,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';

// ─────────────────────────────────────────────
// Colour tokens
// ─────────────────────────────────────────────
const SEVERITY_COLORS = {
  critical: '#ef4444',
  error: '#f97316',
  warning: '#eab308',
  info: '#3b82f6',
};

const DEVICE_COLORS = {
  online: '#10b981',
  offline: '#6b7280',
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Animated gradient KPI card */
function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <Card className={` p-6  ${accent} `}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider   dark:text-gray-500">
          {label}
        </span>
        <div className="p-2 rounded-xl">{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold   dark:text-white leading-none">
          {value}
        </span>
        {sub && (
          <span className="text-xs   dark:text-gray-500 mb-0.5">{sub}</span>
        )}
      </div>
    </Card>
  );
}

/** Circular donut gauge  */
function DonutGauge({
  value,
  total,
  color,
  label,
  size = 140,
}: {
  value: number;
  total: number;
  color: string;
  label: string;
  size?: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const data = [
    { value: pct, fill: color },
    { value: 100 - pct, fill: '#f1f5f9' },
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Centre text overlaid */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span className="text-xl font-bold leading-none" style={{ color }}>
            {pct}%
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
        {label}
      </span>
    </div>
  );
}

/** Horizontal progress bar */
function ProgressBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {label}
        </span>
        <span className="text-gray-500 dark:text-gray-500">
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Severity chip */
function SeverityChip({
  count,
  label,
  color,
  bg,
}: {
  count: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl p-3 gap-1 min-w-[70px]"
      style={{ backgroundColor: bg }}
    >
      <span className="text-xl font-bold leading-none" style={{ color }}>
        {count}
      </span>
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function AnalyticsOverviewPage() {
  const { data, isLoading, isError, refetch, isFetching } =
    useAnalyticsOverview();
  const qc = useQueryClient();

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ['analytics', 'overview'] });
    refetch();
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Failed to load analytics overview
        </p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const { devices, telemetry, alarms, assets, subscription } = data;

  const devicePieData = [
    { name: 'Online', value: devices.online, color: DEVICE_COLORS.online },
    { name: 'Offline', value: devices.offline, color: DEVICE_COLORS.offline },
  ];

  const subColor =
    subscription.usagePercentage >= 80
      ? '#ef4444'
      : subscription.usagePercentage >= 60
        ? '#f97316'
        : '#10b981';

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Analytics Overview"
          description="Real-time platform health, device status, and subscription usage"
        />
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Cpu className="h-5 w-5" style={{ color: 'white' }} />}
          label="Total Devices"
          value={devices.total}
          sub="registered"
          accent="bg-primary text-white"
        />
        <KpiCard
          icon={<Wifi className="h-5 w-5" style={{ color: 'white' }} />}
          label="Online Devices"
          value={devices.online}
          sub={`${devices.onlinePercentage}% uptime`}
          accent="bg-secondary text-white"
        />
        <KpiCard
          icon={
            <AlertTriangle className="h-5 w-5" style={{ color: 'white' }} />
          }
          label="Active Alarms"
          value={alarms.totalActive}
          sub={`${alarms.critical} critical`}
          accent="bg-success text-white"
        />
        <KpiCard
          icon={
            <MessageSquare className="h-5 w-5" style={{ color: 'black' }} />
          }
          label="Messages (Month)"
          value={telemetry.totalMessagesThisMonth.toLocaleString()}
          sub="this month"
          accent="#8b5cf6"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Device Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Device Status
            </h3>
            <Cpu className="h-6 w-6 text-gray-800" />
          </div>

          <div className="flex justify-center">
            <div style={{ width: 180, height: 180, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devicePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="78%"
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {devicePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, '']}
                    contentStyle={{
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {devices.total}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Online{' '}
                <span className="font-bold text-emerald-600">
                  {devices.online}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Offline{' '}
                <span className="font-bold text-gray-500">
                  {devices.offline}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Alarm Breakdown */}
        <Card className="p-4 ">
          <div className="flex mb-4 items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Alarm Breakdown
            </h3>
            <AlertTriangle className="h-6 w-6 text-gray-800" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SeverityChip
              count={alarms.critical}
              label="Critical"
              color={SEVERITY_COLORS.critical}
              bg="#fef2f2"
            />
            <SeverityChip
              count={alarms.error}
              label="Error"
              color={SEVERITY_COLORS.error}
              bg="#fff7ed"
            />
            <SeverityChip
              count={alarms.warning}
              label="Warning"
              color={SEVERITY_COLORS.warning}
              bg="#fefce8"
            />
            <SeverityChip
              count={alarms.info}
              label="Info"
              color={SEVERITY_COLORS.info}
              bg="#eff6ff"
            />
          </div>

          <div className="flex mt-4 items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Resolved today
              </span>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {alarms.resolvedToday}
            </span>
          </div>
        </Card>

        {/* Telemetry Stats */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Telemetry
            </h3>
            <Activity className="h-6 w-6 text-gray-800" />
          </div>

          <div className="space-y-3 flex-1">
            {[
              {
                label: 'Today',
                value: telemetry.totalMessagesToday.toLocaleString(),
                icon: <Zap className="h-4 w-4" style={{ color: '#8b5cf6' }} />,
                bg: '#f5f3ff',
              },
              {
                label: 'This Week',
                value: telemetry.totalMessagesThisWeek.toLocaleString(),
                icon: (
                  <BarChart3 className="h-4 w-4" style={{ color: '#3b82f6' }} />
                ),
                bg: '#eff6ff',
              },
              {
                label: 'This Month',
                value: telemetry.totalMessagesThisMonth.toLocaleString(),
                icon: (
                  <TrendingUp
                    className="h-4 w-4"
                    style={{ color: '#10b981' }}
                  />
                ),
                bg: '#ecfdf5',
              },
              {
                label: 'Avg / Hour',
                value: telemetry.avgMessagesPerHour.toLocaleString(),
                icon: (
                  <Clock className="h-4 w-4" style={{ color: '#f59e0b' }} />
                ),
                bg: '#fffbeb',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ backgroundColor: item.bg }}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-xs font-medium text-gray-600">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {item.value}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Peak Hour
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {telemetry.peakHour === 'N/A'
                  ? 'No data yet'
                  : `${telemetry.peakHour} — ${telemetry.peakHourMessages} msgs`}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row: Assets + Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets */}
        <Card className=" p-5  ">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Assets
            </h3>
            <Layers className="h-4 w-4 text-gray-400" />
          </div>

          <div className="flex items-stretch gap-4 flex-1">
            <div className="flex flex-col items-center justify-center">
              <DonutGauge
                value={assets.withDevices}
                total={assets.total}
                color="#2124d8ff"
                label="With Devices"
                size={130}
              />
            </div>
            <div className="flex flex-col justify-center gap-4 flex-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Total Assets
                  </span>
                </div>
                <span className="text-lg font-bold text-indigo-600">
                  {assets.total}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    With Devices
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {assets.withDevices}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription */}
        <Card className=" p-5  ">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Subscription
            </h3>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}
            >
              {subscription.plan}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <DonutGauge
              value={subscription.usagePercentage}
              total={100}
              color={subColor}
              label="Overall Usage"
              size={120}
            />
            <div className="flex-1 space-y-4">
              <ProgressBar
                label="Devices"
                value={subscription.devicesUsed}
                max={subscription.devicesLimit}
                color="#6366f1"
              />
              <ProgressBar
                label="Messages"
                value={subscription.messagesUsed}
                max={subscription.messagesLimit}
                color="#8b5cf6"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <TrendingUp className="h-3.5 w-3.5" />
            {subscription.usagePercentage < 80
              ? `You're within safe limits (${subscription.usagePercentage}% used)`
              : `High usage detected — ${subscription.usagePercentage}% of plan consumed`}
          </div>
        </Card>
      </div>
    </div>
  );
}
