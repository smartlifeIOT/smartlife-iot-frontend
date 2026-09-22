import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  Eye,
  Layers,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { useDashboardAnalytics, useEnergyDetails } from '../hooks';
import { DashboardAnalyticsItem } from '@/services/api/analytics.api';

export default function DashboardsAnalyticsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('views');

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useDashboardAnalytics(timeRange);
  const { data: energyData } = useEnergyDetails(timeRange);
  console.log('energyData', energyData);
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

  if (isError || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Failed to load dashboard analytics
        </h2>
        <p className="text-sm text-gray-500">
          The requested dashboard analytics data could not be retrieved.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const dashboards = dashboardData.dashboards || [];
  const summary = dashboardData.summary;
  const period = dashboardData.period;

  const totalDashboards = summary?.totalDashboards ?? dashboards.length;
  const totalViews = dashboards.reduce(
    (acc, d) => acc + (d.totalViewCount || 0),
    0
  );
  const totalWidgets = dashboards.reduce(
    (acc, d) => acc + (d.widgetCount || 0),
    0
  );

  const sharedCount = dashboards.filter(
    (d) => d.visibility === 'shared'
  ).length;
  const publicCount = dashboards.filter(
    (d) => d.visibility === 'public'
  ).length;
  const privateCount = dashboards.filter(
    (d) => d.visibility === 'private'
  ).length;

  const mostActiveDashboard = [...dashboards].sort(
    (a, b) => b.totalViewCount - a.totalViewCount
  )[0];

  // Filtering & Sorting dashboards
  const filteredDashboards = dashboards
    .filter((d) => {
      const matchesSearch = d.dashboardName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesVisibility =
        visibilityFilter === 'all' ||
        d.visibility.toLowerCase() === visibilityFilter.toLowerCase();
      return matchesSearch && matchesVisibility;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return b.totalViewCount - a.totalViewCount;
      if (sortBy === 'widgets') return b.widgetCount - a.widgetCount;
      if (sortBy === 'name')
        return a.dashboardName.localeCompare(b.dashboardName);
      return 0;
    });

  // Data for BarChart (Top Dashboards by Views)
  const topDashboardsChartData = [...dashboards]
    .sort((a, b) => b.totalViewCount - a.totalViewCount)
    .slice(0, 7)
    .map((d) => ({
      name: d.dashboardName,
      views: d.totalViewCount,
      widgets: d.widgetCount,
    }));

  const visibilityColors: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    shared: {
      bg: 'bg-purple-100 dark:bg-purple-950/50',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
    public: {
      bg: 'bg-green-100 dark:bg-green-950/50',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
    },
    private: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-400',
    },
  };

  return (
    <div className="flex flex-col space-y-6 pb-10">
      <PageHeader
        title={t('analytics.dashboard.title', {
          defaultValue: 'Dashboard Analytics',
        })}
        description="Monitor performance, view statistics, and usage of operational dashboards."
        actions={[
          {
            label: 'Export Data',
            onClick: () => {},
          },
        ]}
      />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search dashboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>

          {/* Visibility Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              Visibility:
            </span>
            <Select
              value={visibilityFilter}
              onValueChange={setVisibilityFilter}
            >
              <SelectTrigger className="w-32 h-10 text-xs bg-card">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Visibility
                </SelectItem>
                <SelectItem value="shared" className="text-xs">
                  Shared
                </SelectItem>
                <SelectItem value="public" className="text-xs">
                  Public
                </SelectItem>
                <SelectItem value="private" className="text-xs">
                  Private
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              Time Range:
            </span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 h-10 text-xs bg-card">
                <SelectValue placeholder="7 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h" className="text-xs">
                  Last 24 Hours
                </SelectItem>
                <SelectItem value="7d" className="text-xs">
                  Last 7 Days
                </SelectItem>
                <SelectItem value="30d" className="text-xs">
                  Last 30 Days
                </SelectItem>
                <SelectItem value="90d" className="text-xs">
                  Last 90 Days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              Sort By:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-10 text-xs bg-card">
                <SelectValue placeholder="Views" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views" className="text-xs">
                  Total Views
                </SelectItem>
                <SelectItem value="widgets" className="text-xs">
                  Widget Count
                </SelectItem>
                <SelectItem value="name" className="text-xs">
                  Name
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Dashboards */}
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase opacity-90">
                Total Dashboards
              </span>
              <LayoutDashboard className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold mt-2">{totalDashboards}</p>
            <p className="text-xs opacity-80 mt-1">
              Shared: {sharedCount} | Public: {publicCount} | Private:{' '}
              {privateCount}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Views */}
        <Card className="border-none shadow-sm bg-secondary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase opacity-90">
                Total Views
              </span>
              <Eye className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold mt-2">
              {totalViews.toLocaleString()}
            </p>
            <p className="text-xs opacity-80 mt-1">
              Across all configured dashboards ({period?.days ?? 1}d period)
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Widgets */}
        <Card className="border-none shadow-sm bg-success text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase opacity-90">
                Configured Widgets
              </span>
              <Layers className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold mt-2">{totalWidgets}</p>
            <p className="text-xs opacity-80 mt-1">
              Avg{' '}
              {dashboards.length
                ? (totalWidgets / dashboards.length).toFixed(1)
                : 0}{' '}
              widgets per dashboard
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Top Active Dashboard */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                Top Dashboard
              </span>
              <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2 truncate">
              {mostActiveDashboard?.dashboardName || 'N/A'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {mostActiveDashboard?.totalViewCount ?? 0} total views (
              {mostActiveDashboard?.visibility || 'N/A'})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboards Table Card */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            Configured Dashboards ({filteredDashboards.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-800">
                <TableHead className="font-semibold text-white dark:text-gray-300">
                  Dashboard Name
                </TableHead>
                <TableHead className="font-semibold text-white dark:text-gray-300">
                  Visibility
                </TableHead>
                <TableHead className="font-semibold text-white dark:text-gray-300">
                  Widgets
                </TableHead>
                <TableHead className="font-semibold text-white dark:text-gray-300">
                  Total Views
                </TableHead>
                <TableHead className="font-semibold text-white dark:text-gray-300">
                  Last Viewed At
                </TableHead>
                <TableHead className="font-semibold text-white dark:text-gray-300">
                  Last Updated
                </TableHead>
                <TableHead className="font-semibold text-white dark:text-gray-300 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDashboards.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    No dashboards found matching the selected filter
                  </TableCell>
                </TableRow>
              ) : (
                filteredDashboards.map((d: DashboardAnalyticsItem) => {
                  const visStyle =
                    visibilityColors[d.visibility.toLowerCase()] ||
                    visibilityColors.private;
                  const lastViewed = d.lastViewedAt
                    ? new Date(d.lastViewedAt).toLocaleString()
                    : 'N/A';
                  const lastUpdated = d.lastUpdated
                    ? new Date(d.lastUpdated).toLocaleString()
                    : 'N/A';

                  return (
                    <TableRow
                      key={d.dashboardId}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 h-16"
                    >
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {d.dashboardName}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400 truncate w-48">
                            ID: {d.dashboardId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${visStyle.bg} ${visStyle.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${visStyle.dot}`}
                          />
                          {d.visibility}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {d.widgetCount} widgets
                      </TableCell>
                      <TableCell className="text-sm font-bold text-gray-900 dark:text-white">
                        {d.totalViewCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                        {lastViewed}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                        {lastUpdated}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-8 text-[11px]"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Top Dashboards by View Count */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Top Dashboards by Views
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDashboardsChartData} margin={{ bottom: 40 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pData = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 text-xs">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">
                              {pData.name}
                            </span>
                            <div className="text-purple-600 font-bold">
                              Views: {pData.views.toLocaleString()}
                            </div>
                            <div className="text-gray-500">
                              Widgets: {pData.widgets}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                    {topDashboardsChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? '#c026d3'
                            : index % 2 === 0
                              ? '#4338ca'
                              : '#9333ea'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Widget Distribution Across Dashboards */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Widget Count Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDashboardsChartData} margin={{ bottom: 40 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pData = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 text-xs">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">
                              {pData.name}
                            </span>
                            <div className="text-indigo-600 font-bold">
                              Widgets: {pData.widgets}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="widgets" fill="#4338ca" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Metrics & Impact Summary Section */}
      {(() => {
        // ── Derive chart data from energyData ──────────────────────────
        const latest = energyData?.latest ?? {};
        const trend: any[] = energyData?.trend ?? [];
        const thresholds = energyData?.thresholds ?? {};
        const optimizationSuggestions: any[] =
          energyData?.optimizationSuggestions ?? [];

        const co2Latest = latest?.co2?.value ?? null;
        const tempLatest = latest?.temperature?.value ?? null;
        const humidityLatest = latest?.humidity?.value ?? null;

        const co2Threshold = thresholds?.co2 ?? 1000;
        const tempThreshold = thresholds?.temperature ?? 28;

        // Build chart data: use trend array if available, otherwise use a single "Now" point
        const chartData: {
          label: string;
          co2: number | null;
          temp: number | null;
          humidity: number | null;
        }[] =
          trend.length > 0
            ? trend.map((d: any) => ({
                label: d.bucket
                  ? new Date(d.bucket).toLocaleDateString('en', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : (d.label ?? ''),
                co2: d.co2 ?? d.co2Avg ?? null,
                temp: d.temperature ?? d.temperatureAvg ?? null,
                humidity: d.humidity ?? d.humidityAvg ?? null,
              }))
            : co2Latest !== null
              ? [
                  {
                    label: 'Now',
                    co2: co2Latest,
                    temp: tempLatest,
                    humidity: humidityLatest,
                  },
                ]
              : [];

        // Threshold percentage helpers
        const co2Pct =
          co2Latest != null
            ? Math.min(Math.round((co2Latest / co2Threshold) * 100), 100)
            : null;
        const tempPct =
          tempLatest != null
            ? Math.min(Math.round((tempLatest / tempThreshold) * 100), 100)
            : null;

        const severityColor = (s: string) =>
          s === 'critical'
            ? 'text-red-600'
            : s === 'error'
              ? 'text-orange-500'
              : s === 'warning'
                ? 'text-yellow-500'
                : 'text-blue-500';
        const severityBg = (s: string) =>
          s === 'critical'
            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            : s === 'error'
              ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
              : s === 'warning'
                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
        const priorityColor = (p: string) =>
          p === 'high'
            ? 'text-red-600'
            : p === 'medium'
              ? 'text-orange-500'
              : 'text-blue-500';

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Environmental Metrics Trends ── */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Environmental Metrics Trends
                </CardTitle>
                {energyData?.period && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(energyData.period.since).toLocaleDateString()} –{' '}
                    {new Date(energyData.period.until).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-6 pt-2">
                {/* Latest snapshot pills */}
                {co2Latest !== null && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-fuchsia-200 dark:bg-fuchsia-900/20 dark:border-fuchsia-800 dark:text-fuchsia-300">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                      CO₂: {co2Latest} ppm
                      {co2Latest > co2Threshold && (
                        <span className="ml-1 text-red-500 font-bold">
                          ⚠ above {co2Threshold}
                        </span>
                      )}
                    </span>
                    {tempLatest !== null && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300">
                        <span className="w-2 h-2 rounded-full bg-indigo-700 inline-block" />
                        Temp: {tempLatest}°C
                        {tempLatest > tempThreshold && (
                          <span className="ml-1 text-red-500 font-bold">
                            ⚠ above {tempThreshold}°C
                          </span>
                        )}
                      </span>
                    )}
                    {humidityLatest !== null && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        Humidity: {humidityLatest}%
                      </span>
                    )}
                  </div>
                )}

                {/* Chart */}
                {chartData.length > 0 ? (
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="0"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                                  <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">
                                    {label}
                                  </span>
                                  {payload.map((entry, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between gap-4"
                                    >
                                      <span style={{ color: entry.color }}>
                                        {entry.name}:
                                      </span>
                                      <span className="font-bold text-gray-700 dark:text-gray-300">
                                        {entry.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="co2"
                          name="CO₂ (ppm)"
                          stroke="#c026d3"
                          strokeWidth={2.5}
                          dot={
                            chartData.length === 1
                              ? { r: 5, fill: '#c026d3' }
                              : false
                          }
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          name="Temperature (°C)"
                          stroke="#312e81"
                          strokeWidth={2.5}
                          dot={
                            chartData.length === 1
                              ? { r: 5, fill: '#312e81' }
                              : false
                          }
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="humidity"
                          name="Humidity (%)"
                          stroke="#d97706"
                          strokeWidth={2.5}
                          dot={
                            chartData.length === 1
                              ? { r: 5, fill: '#d97706' }
                              : false
                          }
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                    No trend data available for this period
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-6 mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {[
                    { color: '#c026d3', label: 'CO₂ Emissions' },
                    { color: '#312e81', label: 'Temperature' },
                    { color: '#d97706', label: 'Humidity' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: item.color }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Environmental Impact Summary ── */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden flex flex-col">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Environmental Impact Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 flex-1 flex flex-col gap-5">
                {/* Metric cards row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* CO2 */}
                  <div className="rounded-xl   p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      CO₂ Level
                    </p>
                    <p
                      className={`text-2xl font-bold mt-1 ${co2Latest != null && co2Latest > co2Threshold ? 'text-red-600' : 'text-primary'}`}
                    >
                      {co2Latest != null ? `${co2Latest} ppm` : '—'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Threshold: {co2Threshold} ppm
                    </p>
                    {co2Pct !== null && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${co2Pct >= 100 ? 'bg-red-500' : co2Pct >= 80 ? 'bg-orange-400' : 'bg-primary'}`}
                          style={{ width: `${co2Pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Temperature */}
                  <div className="rounded-xl   p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Temperature
                    </p>
                    <p
                      className={`text-2xl font-bold mt-1 ${tempLatest != null && tempLatest > tempThreshold ? 'text-red-600' : 'text-primary'}`}
                    >
                      {tempLatest != null ? `${tempLatest}°C` : '—'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Threshold: {tempThreshold}°C
                    </p>
                    {tempPct !== null && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${tempPct >= 100 ? 'bg-red-500' : tempPct >= 90 ? 'bg-orange-400' : 'bg-primary'}`}
                          style={{ width: `${tempPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Humidity */}
                  <div className="rounded-xl  p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Humidity
                    </p>
                    <p className="text-2xl font-bold mt-1 text-amber-700 dark:text-amber-300">
                      {humidityLatest != null ? `${humidityLatest}%` : '—'}
                    </p>

                    {humidityLatest !== null && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all duration-700"
                          style={{ width: `${Math.min(humidityLatest, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Optimization suggestions (first one) */}
                  {optimizationSuggestions.length > 0 ? (
                    <div className="rounded-xl   p-4 flex flex-col justify-between">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Optimization
                      </p>
                      <p
                        className={`text-xs font-bold mt-1 uppercase ${priorityColor(optimizationSuggestions[0].priority)}`}
                      >
                        {optimizationSuggestions[0].priority} priority
                      </p>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1 leading-snug">
                        {optimizationSuggestions[0].suggestion}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                        {optimizationSuggestions[0].basis}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 flex items-center justify-center">
                      <p className="text-xs text-gray-400">No suggestions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
