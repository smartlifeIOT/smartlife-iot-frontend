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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  RefreshCw,
  Clock,
  Server,
  Activity,
} from 'lucide-react';
import { useGetAPIerrors } from '../hooks';
import { ApiLog } from '../services/api-monitoring.api';

export default function ErrorAnalysisPage() {
  const [page, setPage] = useState(1);
  const {
    data: errorData,
    isLoading: errorLoading,
    refetch,
  } = useGetAPIerrors({ page, limit: 10 });

  // Extract logs list and pagination meta from nested response structure
  const rawData: any = errorData;
  const logsList: ApiLog[] = Array.isArray(rawData?.data?.data)
    ? rawData.data.data
    : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData)
        ? rawData
        : [];

  const meta = rawData?.data?.meta || rawData?.meta;
  const totalErrors = meta?.totalItems ?? meta?.total ?? logsList.length;

  // Calculate dynamic stats from error logs
  const statusCounts: Record<number, number> = {};
  let totalResponseTime = 0;
  const uniqueEndpoints = new Set<string>();

  logsList.forEach((log) => {
    const code = log.statusCode || 500;
    statusCounts[code] = (statusCounts[code] || 0) + 1;
    totalResponseTime += log.responseTime || 0;
    if (log.endpoint) uniqueEndpoints.add(log.endpoint);
  });

  const avgLatency =
    logsList.length > 0 ? Math.round(totalResponseTime / logsList.length) : 0;

  // Find most common status code
  let mostCommonCode = 'None';
  let maxCount = 0;
  Object.entries(statusCounts).forEach(([code, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonCode = code;
    }
  });

  // Calculate distribution breakdown
  const totalInList = logsList.length || 1;
  const distribution = Object.entries(statusCounts).map(([codeStr, count]) => {
    const code = parseInt(codeStr, 10);
    const percentage = Math.round((count / totalInList) * 100);
    const getStatusColor = (c: number) => {
      if (c === 429) return '#ef4444';
      if (c === 401 || c === 403) return '#3b82f6';
      if (c === 404) return '#f59e0b';
      if (c >= 500) return '#dc2626';
      return '#8b5cf6';
    };
    const getLabel = (c: number) => {
      if (c === 404) return 'Not Found';
      if (c === 429) return 'Rate Limited';
      if (c === 401) return 'Unauthorized';
      if (c === 403) return 'Forbidden';
      if (c >= 500) return 'Server Error';
      return 'Client Error';
    };
    return {
      code: codeStr,
      label: getLabel(code),
      count,
      percentage,
      color: getStatusColor(code),
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Error Analysis"
          description="Monitor API errors, failure patterns, and troubleshooting logs"
        />
        <Button
          onClick={() => refetch()}
          disabled={errorLoading}
          variant="outline"
          className="h-10 border-slate-200"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${errorLoading ? 'animate-spin' : ''}`}
          />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {/* Alert Banner */}
      {logsList.length > 0 && (
        <div
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30"
          role="alert"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Recorded {totalErrors} total error event(s) across{' '}
            {uniqueEndpoints.size} unique endpoint(s).
          </span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-rose-600 text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">
                Total Error Events
              </p>
              <AlertTriangle className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {errorLoading ? '...' : totalErrors.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-white/80">
              {logsList.length} logs fetched on this page
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-600 text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">
                Most Common Error
              </p>
              <Activity className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {errorLoading ? '...' : `HTTP ${mostCommonCode}`}
            </p>
            <p className="mt-2 text-xs text-white/80">
              {maxCount} occurrences (
              {Math.round((maxCount / totalInList) * 100)}% of page)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">
                Affected Endpoints
              </p>
              <Server className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {errorLoading ? '...' : uniqueEndpoints.size}
            </p>
            <p className="mt-2 text-xs text-white/80">Unique endpoint routes</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide">
                Avg Error Response Time
              </p>
              <Clock className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {errorLoading ? '...' : `${avgLatency}ms`}
            </p>
            <p className="mt-2 text-xs text-white/80">
              Average latency during error
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Distribution Breakdown */}
      {distribution.length > 0 && (
        <Card className="border border-slate-100 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Status Code Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Breakdown of error response codes on current page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              {distribution.map((item) => (
                <div
                  key={item.code}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">
                      HTTP {item.code} - {item.label}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Error Events Table */}
      <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Recent Error Logs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Detailed API failure logs with request IDs, endpoints, and error
                messages
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden p-4">
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 pl-4">Timestamp</TableHead>
                  <TableHead className="py-3">Method</TableHead>
                  <TableHead className="py-3">Endpoint</TableHead>
                  <TableHead className="py-3">Status</TableHead>
                  <TableHead className="py-3">Error Message</TableHead>
                  <TableHead className="py-3">Latency</TableHead>
                  <TableHead className="py-3 pr-4 text-right">
                    User / IP
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      Loading error logs...
                    </TableCell>
                  </TableRow>
                ) : logsList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No error logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logsList.map((log) => {
                    const methodColor =
                      log.method === 'GET'
                        ? 'bg-sky-500'
                        : log.method === 'POST'
                          ? 'bg-emerald-500'
                          : log.method === 'PUT'
                            ? 'bg-amber-500'
                            : 'bg-rose-500';

                    return (
                      <TableRow
                        key={log.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="pl-4 text-xs text-slate-600 whitespace-nowrap">
                          {log.timestamp || log.createdAt
                            ? new Date(
                                log.timestamp || log.createdAt
                              ).toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${methodColor} text-white font-mono text-[10px]`}
                          >
                            {log.method}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="font-mono text-xs font-semibold text-slate-800 max-w-[220px] truncate"
                          title={log.url || log.endpoint}
                        >
                          {log.endpoint || log.url}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="destructive"
                            className="font-semibold text-xs"
                          >
                            HTTP {log.statusCode}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-xs text-slate-700 max-w-[280px] truncate"
                          title={log.errorMessage || log.error || ''}
                        >
                          {log.errorMessage ||
                            log.error ||
                            'No message provided'}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600">
                          {log.responseTime}ms
                        </TableCell>
                        <TableCell className="pr-4 text-right text-xs text-slate-500">
                          {log.userRole ? (
                            <span className="font-medium text-slate-700">
                              {log.userRole}
                            </span>
                          ) : null}
                          {log.ip ? (
                            <span className="block text-[11px] font-mono text-slate-400">
                              {log.ip}
                            </span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between px-2 text-xs text-slate-500">
              <div>
                Page {meta.page} of {meta.totalPages} ({meta.totalItems} total
                errors)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage && meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage && meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
