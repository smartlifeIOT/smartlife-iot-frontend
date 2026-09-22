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
} from 'lucide-react';
import { useGetAPiperfomance } from '../hooks';

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

const responseTimeData = [
  { day: 'MONDAY', current: 120, previous: 200 },
  { day: 'TUESDAY', current: 150, previous: 180 },
  { day: 'WEDNESDAY', current: 300, previous: 200 },
  { day: 'THURSDAY', current: 280, previous: 170 },
  { day: 'FRIDAY', current: 240, previous: 300 },
  { day: 'SATURDAY', current: 150, previous: 400 },
  { day: 'SUNDAY', current: 360, previous: 250 },
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
  };

  const { data: apiPerfomance } = useGetAPiperfomance();
  console.log(apiPerfomance);
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
            <p className="mt-3 text-3xl font-semibold ">127ms</p>
            <div className="mt-3 flex items-center gap-1.5  ">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">12.5% vs last period</span>
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

        {/* Soft Yellow Card - P95 R esponse Time */}
        <Card className=" bg-success text-white ">
          <CardContent className="p-6">
            <p className="text-sm font-medium tracking-wide ">
              P95 Response Time
            </p>
            <p className="mt-3 text-3xl font-medium ">289ms</p>
            <div className="mt-3 flex items-center gap-1.5 ">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-xs font-medium">0.5% vs last period</span>
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
        <Card className="border border-slate-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Response Time Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={responseTimeData}
                  margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
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
                  <Line
                    type="monotone"
                    dataKey="current"
                    name="Current Period"
                    stroke="#44489d"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    name="Last Period"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
