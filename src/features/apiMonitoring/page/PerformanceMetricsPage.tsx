import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useGetApiPerformance, type ResponseTimeByMinute } from '../hooks';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: {
    time: string;
    timeLabel: string;
    fullTime: string;
    avgResponseTime: number;
    maxResponseTime: number;
    requests: number;
    errors: number;
  };
}

const CustomResponseTimeTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-2 min-w-[200px]">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {data.fullTime || data.timeLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {data.timeLabel}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[#44489d]" />
              Avg Response:
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-50">
              {data.avgResponseTime}ms
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
              Max Response:
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {data.maxResponseTime}ms
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-slate-500 dark:text-slate-400">
            <span>Requests:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {data.requests}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-slate-400">
            <span>Errors:</span>
            <span
              className={`font-semibold ${
                data.errors > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {data.errors}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface EndpointMetric {
  id: string;
  endpoint: string;
  avgTime: string;
  p95: string;
  minTime: string;
  maxTime: string;
  throughput: string;
  status: 'Good' | 'Fair' | 'Poor';
  sla: string;
}

const endpointMetrics: EndpointMetric[] = [
  {
    id: '1',
    endpoint: '/api/v1/device',
    avgTime: '89ms',
    p95: '156ms',
    minTime: '23ms',
    maxTime: '890ms',
    throughput: '142 req/s',
    status: 'Good',
    sla: '98.7%',
  },
  {
    id: '2',
    endpoint: '/api/v1/device',
    avgTime: '67ms',
    p95: '156ms',
    minTime: '12ms',
    maxTime: '890ms',
    throughput: '89 req/s',
    status: 'Good',
    sla: '99.1%',
  },
  {
    id: '3',
    endpoint: '/api/v1/device',
    avgTime: '134ms',
    p95: '156ms',
    minTime: '45ms',
    maxTime: '890ms',
    throughput: '67 req/s',
    status: 'Fair',
    sla: '99.1%',
  },
  {
    id: '4',
    endpoint: '/api/v1/device',
    avgTime: '89ms',
    p95: '156ms',
    minTime: '78ms',
    maxTime: '890ms',
    throughput: '34 req/s',
    status: 'Poor',
    sla: '99.1%',
  },
];

const throughputData = [
  { time: 'M', value: 100 },
  { time: 'T', value: 240 },
  { time: 'W', value: 160 },
  { time: 'T_2', value: 270 },
  { time: 'F', value: 340 },
  { time: 'S', value: 220 },
  { time: 'S_2', value: 320 },
  { time: 'M_2', value: 200 },
  { time: 'T_3', value: 310 },
  { time: 'W_3', value: 260 },
  { time: 'T_4', value: 380 },
  { time: 'F_3', value: 460 },
  { time: 'S_3', value: 410 },
  { time: 'S_4', value: 480 },
  { time: 'M_3', value: 430 },
];

export default function PerformanceMetricsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: apiPerfomance,
    isLoading: isLoadingPerformance,
    isError: isErrorPerformance,
    refetch: refetchPerformance,
  } = useGetApiPerformance();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchPerformance();
    } catch (err) {
      console.error('Failed to refresh performance data:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
  };

  // Safely extract responseTimesByMinute array
  const responseTimesData: ResponseTimeByMinute[] = React.useMemo(() => {
    if (!apiPerfomance) return [];
    if (Array.isArray(apiPerfomance.responseTimesByMinute)) {
      return apiPerfomance.responseTimesByMinute;
    }
    if (Array.isArray((apiPerfomance as any)?.data?.responseTimesByMinute)) {
      return (apiPerfomance as any).data.responseTimesByMinute;
    }
    if (Array.isArray(apiPerfomance)) {
      return apiPerfomance as any;
    }
    return [];
  }, [apiPerfomance]);

  // Transform data for recharts
  const formattedChartData = React.useMemo(() => {
    if (!responseTimesData || responseTimesData.length === 0) {
      return [];
    }

    return responseTimesData.map((item) => {
      const date = new Date(item.time);
      const isValid = !isNaN(date.getTime());

      // Label for X-axis (e.g., 09:54)
      const timeLabel = isValid
        ? date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : item.time;

      // Detailed timestamp for tooltip (e.g., Sep 27, 09:54:00)
      const fullTime = isValid
        ? date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
        : item.time;

      return {
        ...item,
        timeLabel,
        fullTime,
      };
    });
  }, [responseTimesData]);

  // Calculate statistics from real API response
  const performanceStats = React.useMemo(() => {
    if (!responseTimesData || responseTimesData.length === 0) {
      return {
        avgResponseTime: null,
        maxResponseTime: null,
        totalRequests: 0,
        totalErrors: 0,
      };
    }

    const totalRequests = responseTimesData.reduce(
      (sum, item) => sum + (item.requests || 0),
      0
    );
    const totalErrors = responseTimesData.reduce(
      (sum, item) => sum + (item.errors || 0),
      0
    );
    const totalWeightedTime = responseTimesData.reduce(
      (sum, item) => sum + item.avgResponseTime * (item.requests || 1),
      0
    );
    const totalWeight = responseTimesData.reduce(
      (sum, item) => sum + (item.requests || 1),
      0
    );
    const avgResponseTime = Math.round(totalWeightedTime / (totalWeight || 1));
    const maxResponseTime = Math.max(
      ...responseTimesData.map((item) => item.maxResponseTime || 0)
    );

    return {
      avgResponseTime,
      maxResponseTime,
      totalRequests,
      totalErrors,
    };
  }, [responseTimesData]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader
            title="Performance Metrics"
            description="Monitor API response times, throughput, and system performance"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-10 border-slate-200 rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-medium">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-[120px] h-10 border-slate-200 rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-medium">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Export" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV Format</SelectItem>
              <SelectItem value="json">JSON Format</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 bg-[#e53935] hover:bg-[#c62828] text-white font-semibold rounded-lg px-4 flex items-center gap-2 border-none shadow-sm cursor-pointer transition-colors duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Pastel Metrics Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Sky Blue Card - Avg Response Time */}
        <Card className=" bg-primary text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium tracking-wide ">
              Avg Response Time
            </p>
            <p className="mt-3 text-3xl font-semibold ">
              {performanceStats.avgResponseTime !== null
                ? `${performanceStats.avgResponseTime}ms`
                : '127ms'}
            </p>
            <div className="mt-3 flex items-center gap-1.5  ">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">
                {responseTimesData.length > 0
                  ? `Across ${responseTimesData.length} min samples`
                  : '12.5% vs last period'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Soft Green Card - Throughput */}
        <Card className=" bg-secondary text-white">
          <CardContent className="p-6">
            <p className="text-sm font-semibold tracking-wide ">Throughput</p>
            <p className="mt-3 text-3xl font-medium ">342</p>
            <div className="mt-3 flex items-center gap-1.5 ">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-xs font-medium">8.2% vs last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Soft Yellow Card - Peak / P95 Response Time */}
        <Card className=" bg-success text-white ">
          <CardContent className="p-6">
            <p className="text-sm font-medium tracking-wide ">
              Peak Response Time
            </p>
            <p className="mt-3 text-3xl font-medium ">
              {performanceStats.maxResponseTime !== null
                ? `${performanceStats.maxResponseTime}ms`
                : '289ms'}
            </p>
            <div className="mt-3 flex items-center gap-1.5 ">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-xs font-medium">
                {responseTimesData.length > 0
                  ? `Max in window (${performanceStats.totalRequests} reqs)`
                  : '0.5% vs last period'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Soft Rose Card - Apdex Score */}
        <Card className="bg-[#fce4ec] border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold tracking-wide text-slate-700">
              Apdex Score
            </p>
            <p className="mt-3 text-3xl font-medium text-slate-900">0.94</p>
            <div className="mt-3 flex items-center gap-1.5 text-slate-600">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">↑ 0.02 excellent</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Trends & Throughput Side-by-Side Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Response Time Trends Card */}
        <Card className="border border-slate-100 shadow-sm rounded-xl dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Response Time Trends</span>
                  {responseTimesData.length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[11px] font-medium bg-indigo-50/80 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                    >
                      Per-Minute
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Average vs. peak response time per minute
                </CardDescription>
              </div>

              {responseTimesData.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]"></span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Peak:
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {performanceStats.maxResponseTime}ms
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <span>•</span>
                    <span>{performanceStats.totalRequests} reqs</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPerformance ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin text-[#44489d]" />
                <span className="text-xs font-medium">
                  Loading response time trends...
                </span>
              </div>
            ) : isErrorPerformance ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm font-medium text-rose-500">
                  Failed to load performance metrics
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchPerformance()}
                  className="h-8 text-xs gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </Button>
              </div>
            ) : formattedChartData.length === 0 ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No response time data available
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Response time trends will appear here when requests are
                  recorded.
                </p>
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formattedChartData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      className="dark:stroke-slate-800"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timeLabel"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dx={-5}
                      tickFormatter={(value) => `${value}ms`}
                    />
                    <Tooltip content={<CustomResponseTimeTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="avgResponseTime"
                      name="Avg Latency"
                      stroke="#44489d"
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        strokeWidth: 1.5,
                        fill: '#fff',
                        stroke: '#44489d',
                      }}
                      activeDot={{
                        r: 5,
                        fill: '#44489d',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="maxResponseTime"
                      name="Max Latency"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{
                        r: 3,
                        strokeWidth: 1.5,
                        fill: '#fff',
                        stroke: '#f59e0b',
                      }}
                      activeDot={{
                        r: 5,
                        fill: '#f59e0b',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Throughput Analysis Card */}
        <Card className="border border-slate-100 shadow-sm rounded-xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Throughput Analysis
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Requests per second over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={throughputData}
                  margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorThroughput"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#44489d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#44489d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dx={-5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: '#1e293b',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Requests/sec"
                    stroke="#44489d"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorThroughput)"
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Performance Breakdown Table */}
      <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Endpoint Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <Table className="  ">
              <TableHeader className="p-4">
                <TableRow className=" ">
                  <TableHead className="text-white font-semibold py-3">
                    Endpoint
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    Endpoint Avg Time
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    P95 Time
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    Min Time
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    Max Time
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    Throughput
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    Status
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3">
                    SLA
                  </TableHead>
                  <TableHead className="text-white font-semibold py-3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endpointMetrics.map((row) => {
                  const statusColors = {
                    Good: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900',
                    Fair: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900',
                    Poor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900',
                  };
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {row.endpoint}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {row.avgTime}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 dark:text-slate-300">
                        {row.p95}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {row.minTime}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {row.maxTime}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {row.throughput}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 rounded-full font-medium ${statusColors[row.status]}`}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-slate-500" />
                          <span>{row.sla}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs rounded-lg ${
                            row.status === 'Poor'
                              ? 'text-[#2563eb] hover:text-[#1d4ed8]'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                          }`}
                        >
                          {row.status === 'Poor' ? 'Optimize' : 'Details'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
