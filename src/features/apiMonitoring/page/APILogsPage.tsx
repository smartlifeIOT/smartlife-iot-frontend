import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  Download,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  FileText,
  Eye,
  Copy,
  Check,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { useGetMyLogs, type ApiLog } from '../hooks';
import toast from 'react-hot-toast';

export default function APILogsPage() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Query API with pagination params
  const {
    data: rawResponse,
    isLoading,
    refetch,
  } = useGetMyLogs({
    page,
    limit,
    method: selectedMethod !== 'all' ? (selectedMethod as any) : undefined,
  });

  // Extract logs array & pagination metadata safely
  const { logsList, meta } = useMemo(() => {
    const raw: any = rawResponse;
    const list: ApiLog[] = Array.isArray(raw?.data?.data)
      ? raw.data.data
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : [];

    const pagination = raw?.data?.meta ||
      raw?.meta || {
        page: 1,
        limit: 10,
        totalItems: list.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

    return { logsList: list, meta: pagination };
  }, [rawResponse]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Logs updated successfully');
    } catch {
      toast.error('Failed to update logs');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Filter logs by search term and status code locally if needed
  const filteredLogs = useMemo(() => {
    return logsList.filter((log) => {
      // Search matching (endpoint, url, requestId, ip, or errorMessage)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesEndpoint = log.endpoint?.toLowerCase().includes(term);
        const matchesUrl = log.url?.toLowerCase().includes(term);
        const matchesRequestId = log.requestId?.toLowerCase().includes(term);
        const matchesIp = log.ip?.toLowerCase().includes(term);
        const matchesError = (log.errorMessage || log.error || '')
          .toLowerCase()
          .includes(term);
        if (
          !matchesEndpoint &&
          !matchesUrl &&
          !matchesRequestId &&
          !matchesIp &&
          !matchesError
        ) {
          return false;
        }
      }

      // Status code filtering
      if (selectedStatus !== 'all') {
        const code = log.statusCode;
        if (selectedStatus === '2xx' && (code < 200 || code >= 300))
          return false;
        if (selectedStatus === '3xx' && (code < 300 || code >= 400))
          return false;
        if (selectedStatus === '4xx' && (code < 400 || code >= 500))
          return false;
        if (selectedStatus === '5xx' && code < 500) return false;
      }

      return true;
    });
  }, [logsList, searchTerm, selectedStatus]);

  // Summary statistics for KPI cards
  const stats = useMemo(() => {
    const total = meta.totalItems || logsList.length;
    let errorCount = 0;
    let totalLatency = 0;
    let totalResponseSize = 0;

    logsList.forEach((log) => {
      if (log.isError || log.statusCode >= 400) {
        errorCount++;
      }
      totalLatency += log.responseTime || 0;
      totalResponseSize += log.responseSize || 0;
    });

    const avgLatency =
      logsList.length > 0 ? Math.round(totalLatency / logsList.length) : 0;
    const avgSize =
      logsList.length > 0 ? Math.round(totalResponseSize / logsList.length) : 0;
    const errorRate =
      logsList.length > 0
        ? Math.round((errorCount / logsList.length) * 100)
        : 0;

    return {
      total,
      errorCount,
      errorRate,
      avgLatency,
      avgSize,
    };
  }, [logsList, meta]);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Export logs to JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-page-${page}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON export downloaded');
  };

  // Export logs to CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs available to export');
      return;
    }
    const headers = [
      'Timestamp',
      'Method',
      'Endpoint',
      'Status',
      'Latency (ms)',
      'IP',
      'User Role',
      'Error Message',
    ];
    const rows = filteredLogs.map((log) => [
      `"${log.timestamp || log.createdAt}"`,
      `"${log.method}"`,
      `"${log.url || log.endpoint}"`,
      log.statusCode,
      log.responseTime,
      `"${log.ip || ''}"`,
      `"${log.userRole || ''}"`,
      `"${(log.errorMessage || log.error || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV export downloaded');
  };

  // Helper for HTTP method badge colors
  const getMethodBadge = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'bg-sky-500/10 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'POST':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // Helper for HTTP status badge colors
  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return {
        badge:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
      };
    }
    if (code >= 300 && code < 400) {
      return {
        badge:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500',
        icon: <Activity className="h-3 w-3 text-blue-600" />,
      };
    }
    if (code >= 400 && code < 500) {
      return {
        badge:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        icon: <AlertTriangle className="h-3 w-3 text-amber-600" />,
      };
    }
    return {
      badge:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
      icon: <XCircle className="h-3 w-3 text-rose-600" />,
    };
  };

  // Format bytes helper
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader
            title="API Request Logs"
            description="Explore, filter, and inspect detailed HTTP request logs, payload sizes, and execution traces"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-medium text-xs flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>CSV</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportJson}
            className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-medium text-xs flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>JSON</span>
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-10 bg-[#e53935] hover:bg-[#c62828] text-white font-semibold rounded-lg px-4 flex items-center gap-2 border-none shadow-sm cursor-pointer transition-colors duration-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Logs */}
        <Card className="bg-primary text-white shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide text-white/90">
                Total API Requests
              </p>
              <FileText className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {isLoading ? '...' : stats.total.toLocaleString()}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-white/80 text-xs font-medium">
              <span>{logsList.length} logs on current page</span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Latency */}
        <Card className="bg-secondary text-white shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-wide text-white/90">
                Avg Response Time
              </p>
              <Clock className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">
              {isLoading ? '...' : `${stats.avgLatency}ms`}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-white/80 text-xs font-medium">
              <span>Latency per request</span>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card
          className={`${
            stats.errorRate > 0 ? 'bg-amber-600' : 'bg-success'
          } text-white shadow-sm border-none`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide text-white/90">
                Error Rate (4xx / 5xx)
              </p>
              <AlertTriangle className="h-5 w-5 text-white/80" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {isLoading ? '...' : `${stats.errorRate}%`}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-white/80 text-xs font-medium">
              <span>{stats.errorCount} failed requests on page</span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Payload Size */}
        <Card className="bg-slate-900 text-white shadow-sm border-none dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide text-slate-300">
                Avg Response Size
              </p>
              <Zap className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {isLoading ? '...' : formatBytes(stats.avgSize)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-slate-300 text-xs font-medium">
              <span>Transferred payload buffer</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm rounded-xl dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by endpoint, URL, request ID, IP, or error message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs rounded-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Method Filter */}
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-full md:w-[140px] h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs rounded-lg">
                <SelectValue placeholder="HTTP Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Code Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[150px] h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs rounded-lg">
                <SelectValue placeholder="Status Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="2xx">2xx Success</SelectItem>
                <SelectItem value="3xx">3xx Redirect</SelectItem>
                <SelectItem value="4xx">4xx Client Error</SelectItem>
                <SelectItem value="5xx">5xx Server Error</SelectItem>
              </SelectContent>
            </Select>

            {/* Limit selector */}
            <Select
              value={String(limit)}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[120px] h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs rounded-lg">
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Logs Table */}
      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden dark:bg-slate-900">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#44489d]" />
                <span>Request Logs Stream</span>
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800"
                >
                  {filteredLogs.length} displayed
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Click any row or the inspect button to review complete payload
                and execution details
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-950/40">
              <TableRow>
                <TableHead className="py-3.5 pl-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Method
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Route / Endpoint
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Response Time
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Payload
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Client IP & Role
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Timestamp
                </TableHead>
                <TableHead className="py-3.5 pr-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-[#44489d]" />
                      <span>Loading API request logs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        No request logs found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try clearing or adjusting your search filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const statusInfo = getStatusBadge(log.statusCode);
                  return (
                    <TableRow
                      key={log.id}
                      onClick={() => {
                        setSelectedLog(log);
                        setIsDetailsOpen(true);
                      }}
                      className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Status */}
                      <TableCell className="pl-4">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs font-semibold flex items-center gap-1.5 w-fit ${statusInfo.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
                          />
                          {log.statusCode}
                        </Badge>
                      </TableCell>

                      {/* Method */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] font-bold tracking-wider ${getMethodBadge(
                            log.method
                          )}`}
                        >
                          {log.method}
                        </Badge>
                      </TableCell>

                      {/* Endpoint */}
                      <TableCell className="max-w-[280px]">
                        <div className="flex flex-col">
                          <span
                            className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100 truncate"
                            title={log.url || log.endpoint}
                          >
                            {log.url || log.endpoint}
                          </span>
                          {log.metadata?.route && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.metadata.route}
                            </span>
                          )}
                          {log.errorMessage && (
                            <span className="text-[11px] text-rose-500 truncate mt-0.5">
                              {log.errorMessage}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Latency */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              log.responseTime < 50
                                ? 'bg-emerald-500'
                                : log.responseTime < 200
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {log.responseTime}ms
                          </span>
                        </div>
                      </TableCell>

                      {/* Payload */}
                      <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        {formatBytes(log.responseSize)}
                      </TableCell>

                      {/* Client IP & Role */}
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {log.userRole || 'anonymous'}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {log.ip || '-'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(
                          log.timestamp || log.createdAt
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setIsDetailsOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing Page {meta.page} of {meta.totalPages} ({meta.totalItems}{' '}
                total logs)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage && page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs font-medium"
                >
                  Previous
                </Button>
                <span className="px-2 font-mono font-medium text-slate-800 dark:text-slate-200">
                  {page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage && page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs font-medium"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedLog && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs font-bold ${getMethodBadge(
                      selectedLog.method
                    )}`}
                  >
                    {selectedLog.method}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs font-semibold ${
                      getStatusBadge(selectedLog.statusCode).badge
                    }`}
                  >
                    HTTP {selectedLog.statusCode}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedLog.responseTime}ms
                  </span>
                </div>
                <DialogTitle className="text-base font-mono break-all mt-2">
                  {selectedLog.url || selectedLog.endpoint}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Request ID: {selectedLog.requestId || selectedLog.id}
                </DialogDescription>
              </DialogHeader>

              {/* Error Message Box if Error */}
              {(selectedLog.errorMessage || selectedLog.error) && (
                <div className="p-3.5 rounded-lg bg-rose-50/80 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>Error Reported</span>
                  </div>
                  <p className="font-mono text-[11px]">
                    {selectedLog.errorMessage || selectedLog.error}
                  </p>
                </div>
              )}

              {/* Key Metadata Table */}
              <div className="rounded-lg border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {new Date(
                      selectedLog.timestamp || selectedLog.createdAt
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Client IP</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedLog.ip || 'Unknown'}
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-slate-500">User Role / ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedLog.userRole || 'anonymous'} (
                    {selectedLog.userId || 'N/A'})
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Tenant ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                    {selectedLog.tenantId || 'Default'}
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Transferred Sizes</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    Req: {formatBytes(selectedLog.requestSize)} | Res:{' '}
                    {formatBytes(selectedLog.responseSize)}
                  </span>
                </div>
                {selectedLog.userAgent && (
                  <div className="p-2.5 flex flex-col gap-1">
                    <span className="text-slate-500">User Agent</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all bg-slate-50 dark:bg-slate-800/60 p-2 rounded">
                      {selectedLog.userAgent}
                    </span>
                  </div>
                )}
                {selectedLog.metadata && (
                  <div className="p-2.5 flex flex-col gap-1">
                    <span className="text-slate-500">Controller Metadata</span>
                    <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* cURL Equivalent Command Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-slate-500" />
                    cURL Command
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        `curl -X ${selectedLog.method} "${selectedLog.url || selectedLog.endpoint}"`,
                        'cURL'
                      )
                    }
                    className="h-6 text-[11px] gap-1"
                  >
                    {copiedField === 'cURL' ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>Copy</span>
                  </Button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {`curl -X ${selectedLog.method} "${selectedLog.url || selectedLog.endpoint}"`}
                </pre>
              </div>

              {/* Raw JSON Snapshot */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Raw Log Payload
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        JSON.stringify(selectedLog, null, 2),
                        'Raw JSON'
                      )
                    }
                    className="h-6 text-[11px] gap-1"
                  >
                    {copiedField === 'Raw JSON' ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>Copy JSON</span>
                  </Button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-[180px]">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
