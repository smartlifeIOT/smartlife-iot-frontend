import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  Database,
  HardDrive,
  Activity,
  Zap,
  TrendingUp,
  Clock,
  Download,
  Search,
  Server,
  Layers,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { useDataConsumptionAnalytics } from '@/features/analytics/hooks';
import { format } from 'date-fns';

const formatBytes = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const TYPE_COLORS: Record<string, string> = {
  telemetry: '#6366f1',
  apiCalls: '#f59e0b',
  attributes: '#10b981',
  commands: '#ec4899',
};

export default function DataConsumptionAnalyticsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [trendMetric, setTrendMetric] = useState<'messages' | 'bytes'>(
    'messages'
  );

  const { data: analytics, isLoading } = useDataConsumptionAnalytics(timeRange);
  const summary = analytics?.summary;
  const trend = analytics?.trend ?? [];
  const byType = analytics?.byType;
  const topConsumers = analytics?.topConsumers ?? [];
  const hourlyDistribution = analytics?.hourlyDistribution ?? [];
  const period = analytics?.period;

  // Chart data: Data Consumption Analytics
  const trendChartData = useMemo(() => {
    return trend.map((item) => ({
      date: item.bucket ? format(new Date(item.bucket), 'MMM dd') : '',
      fullDate: item.bucket
        ? format(new Date(item.bucket), 'MMM dd, yyyy')
        : '',
      messages: item.messages ?? 0,
      estimatedBytes: item.estimatedBytes ?? 0,
      formattedBytes: formatBytes(item.estimatedBytes),
    }));
  }, [trend]);

  // Chart data: Distribution by Type
  const typeDistributionData = useMemo(() => {
    if (!byType) return [];
    const total =
      (byType.telemetry ?? 0) +
      (byType.apiCalls ?? 0) +
      (byType.attributes ?? 0) +
      (byType.commands ?? 0);

    return [
      {
        name: 'Telemetry',
        key: 'telemetry',
        value: byType.telemetry ?? 0,
        percentage:
          total > 0
            ? (((byType.telemetry ?? 0) / total) * 100).toFixed(1)
            : '0',
        color: TYPE_COLORS.telemetry,
      },
      {
        name: 'API Calls',
        key: 'apiCalls',
        value: byType.apiCalls ?? 0,
        percentage:
          total > 0 ? (((byType.apiCalls ?? 0) / total) * 100).toFixed(1) : '0',
        color: TYPE_COLORS.apiCalls,
      },
      {
        name: 'Attributes',
        key: 'attributes',
        value: byType.attributes ?? 0,
        percentage:
          total > 0
            ? (((byType.attributes ?? 0) / total) * 100).toFixed(1)
            : '0',
        color: TYPE_COLORS.attributes,
      },
      {
        name: 'Commands',
        key: 'commands',
        value: byType.commands ?? 0,
        percentage:
          total > 0 ? (((byType.commands ?? 0) / total) * 100).toFixed(1) : '0',
        color: TYPE_COLORS.commands,
      },
    ].filter((item) => item.value > 0);
  }, [byType]);

  // Chart data: Hourly Distribution
  const hourlyChartData = useMemo(() => {
    const hoursMap = new Map<number, number>();
    hourlyDistribution.forEach((item) => {
      hoursMap.set(item.hour, item.messages);
    });

    const data = [];
    for (let h = 0; h < 24; h++) {
      const messages = hoursMap.get(h) ?? 0;
      data.push({
        hour: `${String(h).padStart(2, '0')}:00`,
        messages,
        isPeak: summary?.peakHour === `${String(h).padStart(2, '0')}:00`,
      });
    }
    return data;
  }, [hourlyDistribution, summary?.peakHour]);

  // Filtered Top Consumers
  const filteredConsumers = useMemo(() => {
    if (!searchTerm.trim()) return topConsumers;
    const term = searchTerm.toLowerCase();
    return topConsumers.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.id?.toLowerCase().includes(term) ||
        c.type?.toLowerCase().includes(term)
    );
  }, [topConsumers, searchTerm]);

  // Export to CSV handler
  const handleExportCSV = () => {
    if (!topConsumers.length) return;
    const headers = [
      'Rank',
      'Type',
      'Name',
      'Device ID',
      'Messages',
      'Estimated Bytes',
      'Percentage',
    ];
    const rows = topConsumers.map((c, idx) => [
      idx + 1,
      c.type,
      `"${c.name}"`,
      c.id,
      c.messages,
      c.estimatedBytes,
      `${c.percentage}%`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `data-consumption-${timeRange}-${format(new Date(), 'yyyyMMdd')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeader
            title={t(
              'analytics.dataConsumption.title',
              'Data Consumption Analytics'
            )}
          />
          {period && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>
                {format(new Date(period.since), 'MMM dd, yyyy')} —{' '}
                {format(new Date(period.until), 'MMM dd, yyyy')} ({period.days}{' '}
                days window)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 h-10 rounded-md bg-white border-slate-200 shadow-sm">
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
            className="h-10 gap-2 border-slate-200 shadow-sm bg-white"
            onClick={handleExportCSV}
            disabled={!topConsumers.length}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Data Volume */}
            <Card className="bg-primary text-white shadow-sm rounded-xl overflow-hidden border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                    Total Ingested Data
                  </span>
                  <Database className="h-5 w-5 text-white/80" />
                </div>
                <div className="text-3xl font-bold tracking-tight mb-1">
                  {formatBytes(summary?.estimatedBytes)}
                </div>
                <div className="text-xs text-white/90 font-medium">
                  {summary?.totalMessages?.toLocaleString() ?? 0} messages
                </div>
                <div className="text-[11px] text-white/70 mt-2">
                  {summary?.vsLastPeriodPercent != null
                    ? `${summary.vsLastPeriodPercent > 0 ? '↑ +' : '↓ '}${summary.vsLastPeriodPercent}% vs last period`
                    : 'Active telemetry payload'}
                </div>
              </CardContent>
            </Card>

            {/* Daily Average */}
            <Card className="bg-secondary text-white shadow-sm rounded-xl overflow-hidden border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                    Daily Average
                  </span>
                  <Activity className="h-5 w-5 text-white/80" />
                </div>
                <div className="text-3xl font-bold tracking-tight mb-1">
                  {summary?.avgDailyMessages?.toLocaleString() ?? 0}
                  <span className="text-sm font-normal ml-1 text-white/80">
                    msgs/day
                  </span>
                </div>
                <div className="text-xs text-white/90 font-medium">
                  ~
                  {formatBytes(
                    (summary?.estimatedBytes ?? 0) /
                      Math.max(period?.days ?? 1, 1)
                  )}
                  /day avg data
                </div>
                <div className="text-[11px] text-white/70 mt-2">
                  Over {period?.days ?? 30} days sampled
                </div>
              </CardContent>
            </Card>

            {/* Peak Activity Window */}
            <Card className="bg-success text-white shadow-sm rounded-xl overflow-hidden border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                    Peak Hour
                  </span>
                  <Zap className="h-5 w-5 text-white/80" />
                </div>
                <div className="text-3xl font-bold tracking-tight mb-1">
                  {summary?.peakHour ?? 'N/A'}
                </div>
                <div className="text-xs text-white/90 font-medium">
                  {summary?.bytesPerRow
                    ? `${summary.bytesPerRow} B/row avg`
                    : 'Peak traffic time'}
                </div>
                <div className="text-[11px] text-white/70 mt-2">
                  Highest hourly throughput window
                </div>
              </CardContent>
            </Card>

            {/* Storage Efficiency */}
            <Card className="bg-white text-slate-800 shadow-sm rounded-xl border border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Storage Efficiency
                  </span>
                  <HardDrive className="h-5 w-5 text-success" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-800 mb-1">
                  {summary?.storageEfficiencyPercent ?? 0}%
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {summary?.bytesPerRowMeasured
                    ? 'Measured compression'
                    : 'Estimated compression'}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Optimized database storage footprint
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1: Trend + Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Data Consumption Trend (2 cols on lg) */}
            <Card className="lg:col-span-2 border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {t(
                      'analytics.dataConsumption.charts.consumptionTrend',
                      'Data Consumption Trend'
                    )}
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Historical volume breakdown over the selected period
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setTrendMetric('messages')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      trendMetric === 'messages'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => setTrendMetric('bytes')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      trendMetric === 'bytes'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Data Volume
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                {trendChartData.length > 0 ? (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendChartData}>
                        <defs>
                          <linearGradient
                            id="consumptionGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          dy={6}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          tickFormatter={(val) =>
                            trendMetric === 'bytes'
                              ? formatBytes(val)
                              : val.toLocaleString()
                          }
                          dx={-4}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-xs flex flex-col gap-1.5 min-w-[160px]">
                                  <span className="font-semibold text-slate-700">
                                    {data.fullDate}
                                  </span>
                                  <div className="flex items-center justify-between gap-4 text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-primary" />
                                      Messages:
                                    </span>
                                    <strong className="text-slate-900">
                                      {data.messages.toLocaleString()}
                                    </strong>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-secondary" />
                                      Data Size:
                                    </span>
                                    <strong className="text-slate-900">
                                      {data.formattedBytes}
                                    </strong>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={
                            trendMetric === 'bytes'
                              ? 'estimatedBytes'
                              : 'messages'
                          }
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#consumptionGradient)"
                          dot={{
                            r: 4,
                            fill: '#6366f1',
                            strokeWidth: 2,
                            stroke: '#fff',
                          }}
                          activeDot={{
                            r: 6,
                            fill: '#6366f1',
                            strokeWidth: 2,
                            stroke: '#fff',
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[280px] text-slate-400 gap-2">
                    <TrendingUp className="h-8 w-8 opacity-30" />
                    <p className="text-sm">
                      No trend data available for this range
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traffic by Message Type */}
            <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  {t(
                    'analytics.dataConsumption.charts.statusDistribution',
                    'Traffic by Message Type'
                  )}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown by ingestion channel
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {typeDistributionData.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="h-[180px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {typeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => [
                              value.toLocaleString(),
                              'Messages',
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {typeDistributionData.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-slate-600 truncate font-medium">
                              {item.name}
                            </span>
                            <span className="text-slate-400 font-semibold">
                              {item.value.toLocaleString()} ({item.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[240px] text-slate-400 gap-2">
                    <Layers className="h-8 w-8 opacity-30" />
                    <p className="text-xs">
                      No message type breakdown available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Hourly Traffic Distribution */}
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    24-Hour Traffic Profile
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hourly message volume across the day (Peak:{' '}
                    <strong className="text-slate-700">
                      {summary?.peakHour ?? 'N/A'}
                    </strong>
                    )
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Normal
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />{' '}
                  Peak
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-3">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      interval={2}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2.5 rounded-lg shadow-md border border-slate-100 text-xs">
                              <p className="font-semibold text-slate-800">
                                {data.hour}
                              </p>
                              <p className="text-primary font-medium">
                                {data.messages.toLocaleString()} messages
                              </p>
                              {data.isPeak && (
                                <Badge
                                  variant="default"
                                  className="mt-1 text-[10px] bg-emerald-500"
                                >
                                  Peak Window
                                </Badge>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="messages" radius={[4, 4, 0, 0]}>
                      {hourlyChartData.map((entry, index) => (
                        <Cell
                          key={`hourly-${index}`}
                          fill={entry.isPeak ? '#10b981' : '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Consumers Table */}
          <Card className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-5 pb-3 border-b border-slate-100  flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold  flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Top Data Consumers
                </CardTitle>
                <p className="text-xs   mt-0.5">
                  Devices and entities generating highest volume and storage
                  overhead
                </p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search consumer by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 rounded-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className=" text-white">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="font-semibold   text-xs h-11 w-16 text-center">
                      #
                    </TableHead>
                    <TableHead className="font-semibold   text-xs h-11">
                      {t('analytics.dataConsumption.table.type', 'TYPE')}
                    </TableHead>
                    <TableHead className="font-semibold   text-xs h-11">
                      {t(
                        'analytics.dataConsumption.table.name',
                        'CONSUMER / DEVICE'
                      )}
                    </TableHead>
                    <TableHead className="font-semibold   text-xs h-11">
                      {t(
                        'analytics.dataConsumption.table.messages',
                        'MESSAGES'
                      )}
                    </TableHead>
                    <TableHead className="font-semibold   text-xs h-11">
                      {t(
                        'analytics.dataConsumption.table.dataConsumed',
                        'ESTIMATED DATA'
                      )}
                    </TableHead>
                    <TableHead className="font-semibold   text-xs h-11 w-52">
                      {t(
                        'analytics.dataConsumption.table.percentOfTotal',
                        '% OF TOTAL'
                      )}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsumers.length > 0 ? (
                    filteredConsumers.map((row, index) => (
                      <TableRow
                        key={row.id || index}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/75 transition-colors h-14"
                      >
                        <TableCell className="text-xs font-semibold text-slate-400 text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="outline"
                            className="capitalize text-[11px] font-medium border-slate-200 bg-slate-50"
                          >
                            {row.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                              <Server className="h-3.5 w-3.5 text-slate-400" />
                              {row.name || 'Unnamed Entity'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {row.id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-700">
                          {row.messages?.toLocaleString()} msgs
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">
                          {formatBytes(row.estimatedBytes)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(row.percentage, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-12 text-right">
                              {row.percentage}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-slate-400 text-sm"
                      >
                        {searchTerm
                          ? 'No consumers match your search'
                          : 'No data consumers found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
