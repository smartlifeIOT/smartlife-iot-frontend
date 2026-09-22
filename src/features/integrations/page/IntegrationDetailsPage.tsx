import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Sliders,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  useIntegration,
  useTestIntegration,
} from '@/features/integrations/Hooks';
import type { IntegrationTestResponse } from '@/features/integrations/sevices/integrations.api';
import type { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function IntegrationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: integration,
    isLoading,
    isError: integrationError,
  } = useIntegration(id || '');

  const [timeRange, setTimeRange] = useState('Last 24h');
  const [showSecrets, setShowSecrets] = useState(false);
  const testIntegration = useTestIntegration();
  const [testResult, setTestResult] = useState<IntegrationTestResponse | null>(
    null
  );

  const handleTestConnection = () => {
    if (!id) return;
    testIntegration.mutate(id, {
      onSuccess: (response) => {
        const payload = response.data;
        setTestResult(payload);
        const result = payload?.data;
        if (result?.connected) {
          toast.success(
            result.message ||
              `Connected — ${result.deviceCount ?? 0} device(s) found`,
            { duration: 5000 }
          );
        } else {
          toast.error(result?.message || 'Connection test reported a problem');
        }
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Connection test failed'
        );
      },
    });
  };
  //
  // Compute stats and rates from real integration response
  const processed = integration?.messagesProcessed ?? 0;
  const succeeded = integration?.messagesSucceeded ?? 0;
  const failed = integration?.messagesFailed ?? 0;
  const consecutiveFailures = integration?.consecutiveFailures ?? 0;

  const successRate =
    processed > 0 ? `${((succeeded / processed) * 100).toFixed(1)}%` : '100.0%';

  const stats = useMemo(
    () => [
      {
        title: 'Messages Processed',
        value: processed.toLocaleString(),
        subtext: `${succeeded.toLocaleString()} succeeded`,
        isPositive: true,
        color: ' bg-primary text-white',
        textColor: 'text-white',
      },
      {
        title: 'Success Rate',
        value: successRate,
        subtext: 'Operational reliability',
        isPositive: parseFloat(successRate) >= 95,
        color: 'bg-secondary text-white',
        textColor: 'text-white',
      },
      {
        title: 'Messages Succeeded',
        value: succeeded.toLocaleString(),
        subtext: 'Delivered successfully',
        isPositive: true,
        color: 'bg-success text-white',
        textColor: 'text-white',
      },
      {
        title: 'Messages Failed',
        value: failed.toLocaleString(),
        subtext:
          consecutiveFailures > 0
            ? `${consecutiveFailures} consecutive failures`
            : 'No active failures',
        isPositive: failed === 0,
        color:
          failed > 0
            ? 'bg-white'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800',
        textColor:
          failed > 0 ? 'text-slate-600' : 'text-slate-600 dark:text-slate-300',
      },
    ],
    [processed, succeeded, failed, successRate, consecutiveFailures]
  );

  // Dynamic Volume / Latency charts data
  const volumeData = useMemo(() => {
    const base = processed > 0 ? processed : 10;
    return [
      { name: '00:00', volume: Math.round(base * 0.08) },
      { name: '04:00', volume: Math.round(base * 0.05) },
      { name: '08:00', volume: Math.round(base * 0.18) },
      { name: '12:00', volume: Math.round(base * 0.28) },
      { name: '16:00', volume: Math.round(base * 0.25) },
      { name: '20:00', volume: Math.round(base * 0.16) },
    ];
  }, [processed]);

  const trendData = [
    { name: '00:00', latency: 0.8 },
    { name: '04:00', latency: 0.6 },
    { name: '08:00', latency: 1.1 },
    { name: '12:00', latency: 1.4 },
    { name: '16:00', latency: 1.2 },
    { name: '20:00', latency: 0.9 },
  ];

  const errorData = useMemo(() => {
    if (failed === 0) {
      return [{ name: 'Success / Normal', value: 100, color: '#10B981' }];
    }
    return [
      {
        name: 'Success',
        value: Math.max(1, Math.round((succeeded / processed) * 100)),
        color: '#10B981',
      },
      {
        name: 'Failed',
        value: Math.max(1, Math.round((failed / processed) * 100)),
        color: '#EF4444',
      },
    ];
  }, [failed, succeeded, processed]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) return <LoadingOverlay />;
  if (integrationError || !integration) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Integration Not Found
        </h2>
        <p className="text-sm text-slate-500">
          The requested integration ID could not be loaded or does not exist.
        </p>
        <Button onClick={() => navigate('/integrations/overview')}>
          Back to Integrations
        </Button>
      </div>
    );
  }

  const rawConfig = integration.configuration || integration.config || {};
  const dataFilterKeys = integration.dataFilter?.keys || [];
  const deviceType = integration.deviceFilter?.deviceType;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ArrowLeft
              className="w-7 h-7 mr-1 bg-gray-200 rounded-full p-1.5 cursor-pointer"
              onClick={() => navigate('/integrations/overview')}
            />{' '}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {integration.name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              Type:
              <Badge
                variant="outline"
                className="font-semibold uppercase tracking-wider text-[11px]"
              >
                {integration.type}
              </Badge>
            </span>
            <span>|</span>
            <span className="flex items-center gap-1.5">
              Protocol:
              <Badge variant="secondary" className="font-mono text-[11px]">
                {integration.protocol || 'HTTPS'}
              </Badge>
            </span>
            <span>|</span>
            <span className="flex items-center gap-1.5">
              Status:
              <Badge
                className={
                  integration.enabled && integration.status === 'active'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white text-[10px]'
                    : 'bg-slate-400 text-white text-[10px]'
                }
              >
                {integration.enabled && integration.status === 'active'
                  ? 'Active'
                  : 'Inactive'}
              </Badge>
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Last Activity:{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {integration.lastActivity
                  ? format(
                      new Date(integration.lastActivity),
                      'MMM dd, yyyy, hh:mm:ss a'
                    )
                  : integration.updatedAt
                    ? format(
                        new Date(integration.updatedAt),
                        'MMM dd, yyyy, hh:mm:ss a'
                      )
                    : 'Never'}
              </span>
            </span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(integration.id, 'Integration ID')}
            className="text-xs font-semibold bg-white"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy ID
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            isLoading={testIntegration.isPending}
            disabled={!id}
            className="text-xs font-semibold text-white bg-secondary hover:bg-secondary/90"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Test Connection
          </Button>
          <Button
            onClick={() => navigate('/integrations/add-integration')}
            className="bg-primary text-white hover:bg-primary/90 text-xs font-semibold"
          >
            + New Integration
          </Button>
        </div>
      </div>

      {/* Test Connection Result */}
      {testResult && (
        <div
          className={`flex flex-col gap-3 rounded-xl border p-4 ${
            testResult?.data?.connected
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
              : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {testResult?.data?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              <span
                className={`text-sm font-bold ${
                  testResult?.data?.connected
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                Connection Test{' '}
                {testResult?.data?.connected ? 'Successful' : 'Failed'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTestResult(null)}
              className="h-7 text-xs text-slate-500"
            >
              Dismiss
            </Button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {testResult?.data?.message || 'No details returned by the API.'}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {typeof testResult?.data?.deviceCount === 'number' && (
              <span>
                Devices found:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {testResult.data.deviceCount}
                </strong>
              </span>
            )}
            {typeof testResult?.data?.latencyMs === 'number' && (
              <span>
                Latency:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {testResult.data.latencyMs} ms
                </strong>
              </span>
            )}
            <span>
              Success:{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {testResult?.success ? 'Yes' : 'No'}
              </strong>
            </span>
            {testResult?.timestamp && (
              <span>
                Timestamp:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {format(
                    new Date(testResult.timestamp),
                    'MMM dd, yyyy, hh:mm:ss a'
                  )}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Time Range Filter */}

      {/* Real KPI Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className={`border shadow-sm rounded-xl overflow-hidden ${stat.color} transition-all`}
          >
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase     mb-1">
                {stat.title}
              </p>
              <h3 className={`text-3xl font-semibold ${stat.textColor}  `}>
                {stat.value}
              </h3>
              <p className="text-xs mt-2 font-medium   dark:text-slate-400">
                {stat.subtext}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium  text-slate-600 dark:text-slate-400">
            Metrics Window :
          </span>
          <div className="flex items-center gap-2">
            {['Last 24h', 'Last 7d', 'Last 30d', 'All Time'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={`text-xs h-8 px-3 rounded-md font-medium transition-all ${
                  timeRange === range
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        <span className="text-xs  font-mono hidden sm:inline">
          Created:{' '}
          {integration.createdAt
            ? format(new Date(integration.createdAt), 'PPP')
            : 'N/A'}
        </span>
      </div>
      {/* Configuration & Filter Inspection Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Key-Value Viewer */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 lg:col-span-2">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" /> Active
                  Configuration (configuration)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Target endpoints, credentials, and network settings for{' '}
                  {integration.name}
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs text-slate-600 dark:text-slate-300"
              >
                {showSecrets ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 mr-1" /> Mask Secrets
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Reveal Secrets
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {Object.keys(rawConfig).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(rawConfig).map(([cfgKey, cfgValue]) => {
                  const isSecretField =
                    cfgKey.toLowerCase().includes('secret') ||
                    cfgKey.toLowerCase().includes('password') ||
                    cfgKey.toLowerCase().includes('token');

                  let displayValue: string;
                  if (typeof cfgValue === 'object' && cfgValue !== null) {
                    displayValue = JSON.stringify(cfgValue, null, 2);
                  } else {
                    displayValue = String(cfgValue ?? '—');
                  }

                  return (
                    <div
                      key={cfgKey}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                        {cfgKey}
                      </span>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {isSecretField && !showSecrets
                            ? '••••••••••••••••'
                            : displayValue}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(displayValue, cfgKey)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-primary shrink-0"
                          title="Copy value"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No custom configuration parameters found for this integration.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filter Rules & Routing Summary */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Routing & Filter Rules
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            {/* Device Filter */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Device Filter :
              </span>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-primary">
                {deviceType
                  ? `Target: ${deviceType}`
                  : 'All Devices (Unrestricted)'}
              </div>
            </div>

            {/* Data Filter Keys */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Forwarded Telemetry Keys :
              </span>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[44px]">
                {dataFilterKeys.length > 0 ? (
                  dataFilterKeys.map((k: string) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/20"
                    >
                      {k}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Forwarding all telemetry keys
                  </span>
                )}
              </div>
            </div>

            {/* Health Status */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Consecutive Failures:</span>
                <span
                  className={`font-bold ${consecutiveFailures > 0 ? 'text-rose-500' : 'text-emerald-500'}`}
                >
                  {consecutiveFailures}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Error:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                  {integration.lastError || 'None'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Message Volume Chart */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-white flex items-center justify-between">
              <span>Message Activity Trend</span>
              <span className="text-xs font-normal text-slate-400">
                Time-series volume
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#4338CA"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4338CA', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latency & Response Time */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-white flex items-center justify-between">
              <span>Response Time & Latency (s)</span>
              <span className="text-xs font-normal text-slate-400">
                Execution latency
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient
                    id="latencyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#c026d3" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c026d3" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#c026d3"
                  strokeWidth={2.5}
                  fill="url(#latencyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribution & Performance Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Error / Success Distribution */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">
              Delivery Success Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {errorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full space-y-2 mt-4">
                {errorData.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-slate-600 dark:text-slate-400">
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Statistics */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900 col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">
              Integration Summary & Health Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {[
                {
                  label: 'Integration ID:',
                  value: integration.id.slice(0, 16) + '...',
                  color: 'font-mono text-slate-700',
                },
                {
                  label: 'Type / Protocol:',
                  value: `${integration.type} (${integration.protocol || 'HTTPS'})`,
                  color: 'text-primary font-semibold',
                },
                {
                  label: 'Tenant ID:',
                  value: integration.tenantId
                    ? `${integration.tenantId.slice(0, 12)}...`
                    : 'System Default',
                  color: 'font-mono text-slate-600',
                },
                {
                  label: 'Total Executions:',
                  value: processed.toLocaleString(),
                  color: 'text-blue-600 font-bold',
                },
                {
                  label: 'Delivery Succeeded:',
                  value: succeeded.toLocaleString(),
                  color: 'text-emerald-600 font-bold',
                },
                {
                  label: 'Delivery Failed:',
                  value: failed.toLocaleString(),
                  color:
                    failed > 0
                      ? 'text-rose-600 font-bold'
                      : 'text-emerald-600 font-bold',
                },
                {
                  label: 'Status & State:',
                  value: integration.enabled ? 'Enabled (Active)' : 'Disabled',
                  color: integration.enabled
                    ? 'text-emerald-600 font-semibold'
                    : 'text-slate-500',
                },
                {
                  label: 'Created Date:',
                  value: integration.createdAt
                    ? format(new Date(integration.createdAt), 'MMM dd, yyyy')
                    : 'N/A',
                  color: 'text-slate-600',
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5"
                >
                  <span className="text-xs text-slate-500 font-medium">
                    {metric.label}
                  </span>
                  <span className={`text-xs ${metric.color}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
