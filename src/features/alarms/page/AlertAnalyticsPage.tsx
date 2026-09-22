import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Activity,
  Server,
  TrendingUp,
} from 'lucide-react';
import { useGetAlarmAnalytics } from '@/features/alarms/hooks';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function AlertAnalyticsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<string>('24h');
  const { data: analytics, isLoading } = useGetAlarmAnalytics(timeRange);

  const summary = analytics?.summary;
  const responseTime = analytics?.responseTime;
  const topSources = analytics?.topSources ?? [];
  const byDevice = analytics?.byDevice ?? [];
  const trends = analytics?.trends ?? [];
  const period = analytics?.period;

  const statCards = [
    {
      label: 'Critical Alerts',
      value: summary?.critical ?? 0,
      vsYesterday: summary?.vsYesterday?.critical ?? 0,
      todayNew: summary?.todayTriggered?.critical ?? 0,
      icon: AlertTriangle,
      colorClass: 'bg-primary text-white',
      iconColor: 'text-white/80',
    },
    {
      label: 'Warning Alerts',
      value: summary?.warning ?? 0,
      vsYesterday: summary?.vsYesterday?.warning ?? 0,
      todayNew: summary?.todayTriggered?.warning ?? 0,
      icon: AlertCircle,
      colorClass: 'bg-secondary text-white',
      iconColor: 'text-white/80',
    },
    {
      label: 'Info Alerts',
      value: summary?.info ?? 0,
      vsYesterday: summary?.vsYesterday?.info ?? 0,
      todayNew: summary?.todayTriggered?.info ?? 0,
      icon: Info,
      colorClass: 'bg-success text-white',
      iconColor: 'text-white/80',
    },
    {
      label: 'Resolved Today',
      value: summary?.resolvedToday ?? 0,
      vsYesterday: summary?.vsYesterday?.resolved ?? 0,
      todayNew: null,
      icon: CheckCircle2,
      colorClass: 'bg-white text-slate-800 border border-slate-200',
      iconColor: 'text-success',
    },
  ];

  const trendChartData = trends.map((item: any) => ({
    name: item.date ? format(new Date(item.date), 'MMM dd') : (item.name ?? ''),
    critical: item.critical ?? 0,
    warning: item.warning ?? 0,
    info: item.info ?? 0,
    resolved: item.resolved ?? 0,
  }));

  const deviceChartData = byDevice.slice(0, 8).map((d: any) => ({
    name: d.deviceName ?? d.deviceId ?? 'Unknown',
    count: d.count ?? 0,
  }));

  const DEVICE_COLORS = [
    '#6366f1',
    '#f59e0b',
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#a855f7',
    '#14b8a6',
    '#f97316',
  ];

  const formatMinutes = (min: number | null | undefined) => {
    if (min === null || min === undefined) return '—';
    if (min < 60) return `${Math.round(min)}m`;
    return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {t('alertAnalytics.title')}
          </h1>
          {period && (
            <p className="text-xs text-slate-400 mt-0.5">
              {format(new Date(period.since), 'MMM dd, yyyy HH:mm')} →{' '}
              {format(new Date(period.until), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { label: '1h', value: '1h' },
              { label: '24h', value: '24h' },
              { label: '7d', value: '7d' },
              { label: '30d', value: '30d' },
              { label: '90d', value: '90d' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  timeRange === opt.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Active count badge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 rounded-lg px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span>
              <strong className="text-slate-700">
                {summary?.totalActive ?? 0}
              </strong>{' '}
              active alarms right now
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const vsYesterday = card.vsYesterday;
          return (
            <Card key={card.label} className={`shadow-sm ${card.colorClass}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  {card.todayNew !== null && (
                    <span className="text-[10px] font-semibold bg-white/20 rounded-full px-2 py-0.5">
                      +{card.todayNew} today
                    </span>
                  )}
                </div>
                <div className="text-4xl font-bold mb-1">{card.value}</div>
                <div className="font-medium text-sm mb-1">{card.label}</div>
                <div className="text-xs opacity-75">
                  {vsYesterday === 0
                    ? 'Same as yesterday'
                    : vsYesterday > 0
                      ? `+${vsYesterday} vs yesterday`
                      : `${vsYesterday} vs yesterday`}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trends Chart */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold text-slate-800">
              {t('alertAnalytics.trendsTitle')} ( {timeRange} )
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {trendChartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dx={-8}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                  />
                  <Line
                    type="monotone"
                    dataKey="critical"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#ef4444' }}
                    activeDot={{ r: 6 }}
                    name="Critical"
                  />
                  <Line
                    type="monotone"
                    dataKey="warning"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                    name="Warning"
                  />
                  <Line
                    type="monotone"
                    dataKey="info"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6 }}
                    name="Info"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#22c55e' }}
                    activeDot={{ r: 6 }}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-400 gap-2">
              <TrendingUp className="h-8 w-8 opacity-30" />
              <p className="text-sm">No trend data available for this period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Sources */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold text-slate-800">
                {t('alertAnalytics.topSources')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topSources.length > 0 ? (
              <div className="space-y-3">
                {topSources.map((source: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="truncate text-slate-700 font-medium">
                        {source.name || source.source || 'Unknown'}
                      </span>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                      {source.count ?? source.total ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                <AlertTriangle className="h-6 w-6 opacity-30" />
                <p className="text-xs">No top sources data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Times */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold text-slate-800">
                {t('alertAnalytics.responseTime')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: 'Avg Acknowledge Time',
                  value: formatMinutes(responseTime?.avgMinutes),
                  sub: `${responseTime?.acknowledgedSampleSize ?? 0} alarms sampled`,
                  color: 'text-blue-600',
                },
                {
                  label: 'Critical Avg Ack Time',
                  value: formatMinutes(responseTime?.criticalAvgMinutes),
                  sub: 'critical alarms only',
                  color: 'text-rose-500',
                },
                {
                  label: 'Avg Resolution Time',
                  value: formatMinutes(responseTime?.avgResolutionMinutes),
                  sub: `${responseTime?.resolvedSampleSize ?? 0} resolved sampled`,
                  color: 'text-green-600',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
                  <span className={`text-xl font-bold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alarms by Device */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold text-slate-800">
                Alarms by Device
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {deviceChartData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deviceChartData}
                    layout="vertical"
                    margin={{ left: 0, right: 8 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {deviceChartData.map((_: any, idx: number) => (
                        <Cell
                          key={idx}
                          fill={DEVICE_COLORS[idx % DEVICE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                <Server className="h-6 w-6 opacity-30" />
                <p className="text-xs">No device data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
