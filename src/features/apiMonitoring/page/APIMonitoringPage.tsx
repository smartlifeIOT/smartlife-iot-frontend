import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, Clock, XCircle, Server } from 'lucide-react';
import { useGetApiDashboard, useGetTopEndpoints } from '../hooks';

export default function APIMonitoring() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: dashboardData, isLoading: dashboardLoading } =
    useGetApiDashboard();

  const { data: endpoints, isLoading: endpointsLoading } = useGetTopEndpoints();

  const statsCards = [
    {
      title: 'Today API Calls',
      value: dashboardLoading
        ? '...'
        : (dashboardData?.today?.requests?.toLocaleString() ?? '0'),
      change: `${dashboardData?.thisMonth?.requests?.toLocaleString() ?? 0} total this month`,
      icon: <Activity className="h-5 w-5 text-white" />,
      className: 'bg-primary text-white',
      changeClass: 'text-white/80',
    },
    {
      title: 'Avg Response Time',
      value: dashboardLoading
        ? '...'
        : `${dashboardData?.today?.avgResponseTime ?? 0}ms`,
      change: "Today's average latency",
      icon: <Clock className="h-5 w-5 text-white" />,
      className: 'bg-secondary text-white',
      changeClass: 'text-white/80',
    },
    {
      title: 'Today Errors',
      value: dashboardLoading ? '...' : (dashboardData?.today?.errors ?? '0'),
      change: `${dashboardData?.thisMonth?.errors ?? 0} errors this month`,
      icon: <XCircle className="h-5 w-5 text-white" />,
      className: 'bg-red-600 text-white',
      changeClass: 'text-white/80',
    },
    {
      title: 'Monthly Usage',
      value: dashboardLoading
        ? '...'
        : dashboardData?.subscription
          ? `${dashboardData.subscription.used?.toLocaleString()} / ${
              dashboardData.subscription.unlimited
                ? '∞'
                : dashboardData.subscription.limit?.toLocaleString()
            }`
          : '0 / 0',
      change: `Plan: ${dashboardData?.subscription?.plan?.toUpperCase() ?? 'N/A'}`,
      icon: <Server className="h-5 w-5 text-slate-700" />,
      className: 'bg-white border border-slate-200 text-slate-900',
      changeClass: 'text-slate-500',
    },
  ];

  const hourlyChartData =
    dashboardData?.hourlyTrend?.map((item) => ({
      period: item.hour,
      requests: item.requests,
      errors: item.errors,
      avgTime: item.avgTime,
    })) || [];

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'bg-emerald-500';
    if (code >= 300 && code < 400) return 'bg-blue-500';
    if (code >= 400 && code < 500) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="API Monitoring"
          description="Monitor API performance, usage, and health metrics"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title} className={`pt-6 shadow-sm ${card.className}`}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="mt-3 text-xl font-semibold">{card.value}</p>
                </div>
                <div className="rounded-2xl p-2 shadow-sm bg-black/10">
                  {card.icon}
                </div>
              </div>
              <p className={`text-xs ${card.changeClass}`}>{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Hourly Traffic Trend</CardTitle>
              <CardDescription>
                Request and error volume across your platform by hour
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="flex h-[350px] items-center justify-center text-sm text-slate-500">
                Loading chart...
              </div>
            ) : hourlyChartData.length > 0 ? (
              <LineChart
                data={hourlyChartData}
                lines={[
                  { dataKey: 'requests', name: 'API Calls', color: '#db2777' },
                  { dataKey: 'errors', name: 'Errors', color: '#ef4444' },
                ]}
                xAxisKey="period"
                title=""
                showLegend={true}
                height={350}
              />
            ) : (
              <div className="flex h-[350px] items-center justify-center text-sm text-slate-500">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Top API Endpoints</CardTitle>
            <CardDescription>Most frequently called endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {endpointsLoading ? (
              <div className="py-6 text-center text-sm text-slate-500">
                Loading endpoints...
              </div>
            ) : endpoints && endpoints.length > 0 ? (
              endpoints.slice(0, 6).map((endpoint) => (
                <div key={endpoint.endpoint} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-700">
                      {endpoint.endpoint}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-blue-700">
                      {endpoint.count} calls
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Avg response time: {endpoint.avgResponseTime}ms
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-slate-500">
                No endpoint data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {dashboardData?.statusCodeDistribution && (
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Status Code Distribution</CardTitle>
            <CardDescription>
              All-time breakdown of response HTTP status codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardData.statusCodeDistribution.map((status) => (
                <div
                  key={status.statusCode}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Status {status.statusCode}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {status.count.toLocaleString()} calls ({status.percentage}
                      %)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getStatusColor(status.statusCode)}`}
                      style={{ width: `${Math.min(100, status.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
