import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { useSystemAnalytics } from '../hooks';

export default function SystemPerformanceAnalyticsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('24h');
  const { data, isLoading, isError, refetch } = useSystemAnalytics(timeRange);

  // Format trend data for response time chart
  const trendData = (data?.apiResponseTrend || []).map((item) => {
    const d = new Date(item.bucket);
    const timeLabel = isNaN(d.getTime())
      ? item.bucket
      : `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`;
    return {
      bucket: timeLabel,
      avgResponseTime: item.avgResponseTime,
      calls: item.calls,
      errorRate: item.errorRate,
    };
  });

  // Format error breakdown data
  const errorData = (data?.errorBreakdown || []).map((err, idx) => ({
    name: err.type,
    count: err.count,
    percentage: err.percentage,
    color: ['#4338ca', '#c026d3', '#f97316', '#ef4444', '#3b82f6'][idx % 5],
  }));

  // Format top endpoints data
  const endpointsData = (data?.topEndpoints || []).map((ep) => ({
    name: ep.endpoint,
    calls: ep.calls,
    avgResponseTime: Math.round(ep.avgResponseTime),
    errorRate: ep.errorRate,
  }));

  // Format health items
  const healthItems = [
    {
      name: t('analytics.system.status.db', {
        defaultValue: 'Database Connection',
      }),
      status: data?.systemHealth?.database || 'healthy',
    },
    {
      name: t('analytics.system.status.cache', {
        defaultValue: 'Cache Service',
      }),
      status: data?.systemHealth?.cache || 'healthy',
    },
    {
      name: t('analytics.system.status.mq', { defaultValue: 'Message Queue' }),
      status: data?.systemHealth?.messageQueue || 'healthy',
    },
    {
      name: t('analytics.system.status.storage', {
        defaultValue: 'File Storage',
      }),
      status: data?.systemHealth?.fileStorage || 'healthy',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
        return 'bg-green-500';
      case 'degraded':
      case 'warning':
        return 'bg-amber-500';
      case 'unhealthy':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formattedCheckedAt = data?.systemHealth?.checkedAt
    ? new Date(data.systemHealth.checkedAt).toLocaleTimeString()
    : null;

  return (
    <div className="flex flex-col space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={t('analytics.system.title', {
            defaultValue: 'System Performance Analytics',
          })}
          description={t('analytics.system.subtitle', {
            defaultValue:
              'Monitor system health, response times, and API performance',
          })}
        />
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 h-10 border-none rounded-md bg-card">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button variant="primary">
            <span>Export Data</span>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load system analytics. Please try again.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: t('analytics.system.stats.totalApiCalls', {
              defaultValue: 'Total API Calls',
            }),
            value:
              data?.summary?.totalApiCalls != null
                ? data.summary.totalApiCalls.toLocaleString()
                : '0',
            trend: data?.summary?.avgResponseTime
              ? `Avg ${data.summary.avgResponseTime.toFixed(1)} ms response`
              : 'No data',
            color: 'bg-primary text-white',
          },
          {
            title: t('analytics.system.stats.avgResponseTime', {
              defaultValue: 'Avg Response Time',
            }),
            value:
              data?.summary?.avgResponseTime != null
                ? `${data.summary.avgResponseTime.toFixed(1)} ms`
                : '0 ms',
            trend: `p95: ${data?.summary?.p95ResponseTime ?? 0} ms | Max: ${data?.summary?.maxResponseTime ?? 0} ms`,
            color: 'bg-secondary text-white',
          },
          {
            title: t('analytics.system.stats.peakHour', {
              defaultValue: 'Peak Usage Hour',
            }),
            value: data?.summary?.peakUsageHour || 'N/A',
            trend: 'Peak traffic period',
            color: 'bg-success text-white',
          },
          {
            title: t('analytics.system.stats.errorRate', {
              defaultValue: 'Error Rate',
            }),
            value:
              data?.summary?.errorRate != null
                ? `${data.summary.errorRate}%`
                : '0%',
            trend: `${data?.summary?.totalErrors ?? 0} total errors`,
            color: '',
          },
        ].map((kpi, idx) => (
          <Card
            key={idx}
            className={`${idx !== 3 ? kpi.color : 'text-black dark:text-white'} shadow-none rounded-lg`}
          >
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold opacity-90 dark:text-gray-300">
                {kpi.title}
              </h3>
              <p className="text-2xl font-semibold mt-1">
                {isLoading ? '...' : kpi.value}
              </p>
              <p className="text-xs mt-1 opacity-80">{kpi.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trends */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.system.charts.responseTime', {
                defaultValue: 'Response Time Trends',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px] w-full">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No response trend data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#c026d3"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#c026d3"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={true}
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="bucket"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      unit=" ms"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pData = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-1 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {pData.bucket}
                              </span>
                              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                <span>Avg Response Time:</span>
                                <span className="font-bold">
                                  {pData.avgResponseTime} ms
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span>API Calls:</span>
                                <span className="font-bold">{pData.calls}</span>
                              </div>
                              <div className="flex items-center gap-2 text-red-500">
                                <span>Error Rate:</span>
                                <span className="font-bold">
                                  {pData.errorRate}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgResponseTime"
                      stroke="#c026d3"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      dot={{
                        r: 4,
                        fill: '#c026d3',
                        strokeWidth: 2,
                        stroke: '#fff',
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#c026d3',
                        strokeWidth: 2,
                        stroke: '#fff',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Endpoints */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Top Endpoints Traffic
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px] w-full">
              {endpointsData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No endpoint performance data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={endpointsData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pData = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-1 text-xs">
                              <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {pData.name}
                              </span>
                              <div>
                                Total Calls:{' '}
                                <span className="font-bold">{pData.calls}</span>
                              </div>
                              <div>
                                Avg Response Time:{' '}
                                <span className="font-bold">
                                  {pData.avgResponseTime} ms
                                </span>
                              </div>
                              <div>
                                Error Rate:{' '}
                                <span className="font-bold">
                                  {pData.errorRate}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="calls"
                      fill="#4338ca"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Error Analysis */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.system.charts.errorAnalysis', {
                defaultValue: 'Error Analysis',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[250px] w-full">
              {errorData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 gap-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <span>No errors recorded in this period</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pData = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 text-xs">
                              <span className="font-semibold">
                                {pData.name}
                              </span>
                              <div>
                                Count:{' '}
                                <span className="font-bold">{pData.count}</span>
                              </div>
                              <div>
                                Percentage:{' '}
                                <span className="font-bold">
                                  {pData.percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={45}>
                      {errorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health Status */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                {t('analytics.system.status.title', {
                  defaultValue: 'System Health Status',
                })}
              </CardTitle>
              {formattedCheckedAt && (
                <span className="text-xs text-gray-400">
                  Checked: {formattedCheckedAt}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-3">
            {healthItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs capitalize text-gray-500">
                    {item.status}
                  </span>
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('analytics.system.alerts.title', {
                defaultValue: 'Recent Alerts',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {!data?.recentAlerts || data.recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-xs gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <span>No active system alerts</span>
              </div>
            ) : (
              data.recentAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-md bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${alert.dot || 'bg-red-500'}`}
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {alert.title || alert.message || 'Alert'}
                    </span>
                  </div>
                  {alert.time && (
                    <span className="text-gray-400 text-[10px]">
                      {alert.time}
                    </span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
