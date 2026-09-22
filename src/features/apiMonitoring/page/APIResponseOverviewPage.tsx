import { useState } from 'react';
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
  Activity,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useGetApiStats } from '../hooks';
import { TimeRange } from '../services/api-monitoring.api';

export default function APIResponseOverviewPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const {
    data: stats,
    isLoading: statsLoading,
    refetch,
  } = useGetApiStats(timeRange);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleExport = (format: string) => {
    if (format === 'json' && stats) {
      const blob = new Blob([JSON.stringify(stats, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-stats-${timeRange}.json`;
      a.click();
    } else {
      console.log(`Exporting format: ${format}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader
            title="API Response Overview"
            description="Monitor and analyze API consumption and stats across your platform"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange(val as TimeRange)}
          >
            <SelectTrigger className="w-[140px] h-10 border-slate-200 rounded-lg bg-white shadow-sm font-medium">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-[120px] h-10 border-slate-200 rounded-lg bg-white shadow-sm font-medium">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Export" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON Format</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            disabled={statsLoading}
            variant="outline"
            className="h-10 border-slate-200"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Avg Response Time */}
        <Card className="bg-primary text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">
                Avg Response Time
              </p>
              <Clock className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {statsLoading ? '...' : `${stats?.avgResponseTime ?? 0}ms`}
            </p>
            <div className="mt-3 text-xs text-white/80">
              P50: {stats?.p50ResponseTime ?? 0}ms | P99:{' '}
              {stats?.p99ResponseTime ?? 0}ms
            </div>
          </CardContent>
        </Card>

        {/* Total Requests / Throughput */}
        <Card className="bg-secondary text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">
                Total Requests
              </p>
              <Activity className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {statsLoading
                ? '...'
                : (stats?.totalRequests?.toLocaleString() ?? 0)}
            </p>
            <div className="mt-3 text-xs text-white/80">
              {stats?.requestsPerMinute ?? 0} req/min
            </div>
          </CardContent>
        </Card>

        {/* P95 Response Time */}
        <Card className="bg-emerald-600 text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">
                P95 Response Time
              </p>
              <Zap className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {statsLoading ? '...' : `${stats?.p95ResponseTime ?? 0}ms`}
            </p>
            <div className="mt-3 text-xs text-white/80">
              Successful: {stats?.successRequests?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card className="bg-rose-600 text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">Error Rate</p>
              <AlertTriangle className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {statsLoading ? '...' : `${stats?.errorRate ?? 0}%`}
            </p>
            <div className="mt-3 text-xs text-white/80">
              Total errors: {stats?.errorRequests ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints & Slowest Endpoints */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Endpoints Table */}
        <Card className="border border-slate-100 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Top Endpoints by Usage
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Most invoked API routes in selected timeframe ({timeRange})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Loading top endpoints...
              </div>
            ) : stats?.topEndpoints && stats.topEndpoints.length > 0 ? (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2.5">Endpoint</TableHead>
                      <TableHead className="py-2.5 text-right">Calls</TableHead>
                      <TableHead className="py-2.5 text-right">
                        Avg Time
                      </TableHead>
                      <TableHead className="py-2.5 text-right">
                        Error Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topEndpoints.map((ep, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-semibold text-slate-800">
                          {ep.endpoint}
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {ep.count}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {ep.avgTime}ms
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          <Badge
                            variant={
                              ep.errorRate > 0 ? 'destructive' : 'outline'
                            }
                            className={
                              ep.errorRate === 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ''
                            }
                          >
                            {ep.errorRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                No top endpoints found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slowest Endpoints Table */}
        <Card className="border border-slate-100 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Slowest Endpoints
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Highest latency endpoints requiring performance optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Loading slowest endpoints...
              </div>
            ) : stats?.slowestEndpoints && stats.slowestEndpoints.length > 0 ? (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2.5">Endpoint</TableHead>
                      <TableHead className="py-2.5 text-right">
                        Avg Time
                      </TableHead>
                      <TableHead className="py-2.5 text-right">
                        Max Time
                      </TableHead>
                      <TableHead className="py-2.5 text-right">Calls</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.slowestEndpoints.map((ep, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs font-semibold text-slate-800">
                          {ep.endpoint}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-amber-600 text-sm">
                          {ep.avgTime}ms
                        </TableCell>
                        <TableCell className="text-right font-medium text-rose-600 text-sm">
                          {ep.maxTime}ms
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {ep.count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                No slow requests recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Errors Section if present */}
      {stats?.topErrors && stats.topErrors.length > 0 && (
        <Card className="border border-rose-100 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Top API Errors</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Endpoints generating the highest error counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-2.5">Status Code</TableHead>
                    <TableHead className="py-2.5">Endpoint</TableHead>
                    <TableHead className="py-2.5 text-right">
                      Error Count
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topErrors.map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant="destructive">
                          HTTP {err.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-800">
                        {err.endpoint}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-rose-600 text-sm">
                        {err.count} errors
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
