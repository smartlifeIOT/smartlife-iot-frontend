import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';

const errorAnalysisData = [
  { name: 'MONDAY', val1: 1.2, val2: 2.0 },
  { name: 'TUESDAY', val1: 1.5, val2: 1.8 },
  { name: 'WEDNESDAY', val1: 3.0, val2: 2.2 },
  { name: 'THURSDAY', val1: 2.1, val2: 1.8 },
  { name: 'FRIDAY', val1: 2.5, val2: 3.0 },
  { name: 'SATURDAY', val1: 1.3, val2: 4.0 },
  { name: 'SUNDAY', val1: 3.5, val2: 2.5 },
];

const recentEvents = [
  {
    id: 1,
    timestamp: '2025-05-29 14:45:23',
    endpoint: '/api/v1/auth',
    status: '429',
    message: 'Rate limit exceeded',
    apiKey: 'key_***abc123',
    count: 247,
    action: 'Details',
  },
  {
    id: 2,
    timestamp: '2025-05-29 14:45:23',
    endpoint: '/api/v1/auth',
    status: '401',
    message: 'Invalid token',
    apiKey: 'key_***def456',
    count: 89,
    action: 'Details',
  },
  {
    id: 3,
    timestamp: '2025-05-29 14:45:23',
    endpoint: '/api/v1/auth',
    status: '429',
    message: 'Database connection failed',
    apiKey: 'key_***ghi789',
    count: 34,
    action: 'Details',
  },
  {
    id: 4,
    timestamp: '2025-05-29 14:45:23',
    endpoint: '/api/v1/auth',
    status: '429',
    message: 'Resource not found',
    apiKey: 'key_***jkl012',
    count: 12,
    action: 'Optimize',
  },
];

export default function RateLimitingDashboardPage() {
  return (
    <div className="space-y-6 ">
      <PageHeader
        title="Rate Limiting Dashboard"
        description="Monitor API rate limits, throttling events, and quota management"
      />

      {/* Alert Banner */}
      <div className="bg-[#fce4ec] text-slate-800 px-4 py-3 rounded-lg border border-[#f8bbd0] text-sm">
        Alert: Error rate spike detected in /api/v1/auth endpoint (3.2% above
        threshold)
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Errors */}
        <Card className="bg-primary text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-white mb-2">
              Total Errors (24h)
            </p>
            <p className="text-3xl font-semibold text-white">1,247</p>
            <div className="mt-3 text-xs text-white">
              Total Errors (24h)19,847! 23.4% vs yesterday
            </div>
          </CardContent>
        </Card>

        {/* Most Common Error */}
        <Card className="bg-secondary text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-white mb-2">
              Most Common Error
            </p>
            <p className="text-3xl font-semibold text-white">87%</p>
            <div className="mt-3 text-xs text-white">
              <span className="block text-white">Rate Limit Exceeded</span>
              <span>8,923 occurrences</span>
            </div>
          </CardContent>
        </Card>

        {/* Affected Endpoints */}
        <Card className="bg-success text-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-white mb-2">
              Affected Endpoints
            </p>
            <p className="text-3xl font-semibold text-white">6</p>
            <div className="mt-3 text-xs ">
              <span className="block">out of 47 totalTop:</span>
              <span className="text-white">/api/v1/auth</span>
            </div>
          </CardContent>
        </Card>

        {/* MTTR */}
        <Card className="border border-slate-200 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">MTTR</p>
            <p className="text-3xl font-semibold text-slate-900">68%</p>
            <div className="mt-3 text-xs">
              <span className="text-emerald-500 block flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-1" /> 1.3min improvemen
              </span>
              <span className="text-slate-500">Mean Time to Recovery</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Error Analysis & Rate Limit Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Error Analysis */}
        <Card className="border border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Error Analysis
              <span className="block text-xs font-normal text-slate-500 mt-1">
                Rate Limiting Events
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={errorAnalysisData}
                  margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(val) => `${val}M$`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val1"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#3b82f6' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="val2"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#22c55e' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* API Rate Limit Status */}
        <Card className="border border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800">
              API Rate Limit Status
              <span className="block text-xs font-normal text-slate-500 mt-1">
                Current utilization by endpoint
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  429 - Rate Limited
                </span>
              </div>
              <div className="relative h-6 w-full bg-slate-100 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-red-600"
                  style={{ width: '45%' }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-2">
                  <span className="text-xs font-medium pl-[46%] text-slate-700">
                    8,923 (45%)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  401 - Unauthorized
                </span>
              </div>
              <div className="relative h-6 w-full bg-slate-100 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-indigo-700"
                  style={{ width: '30%' }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-2">
                  <span className="text-xs font-medium pl-[31%] text-slate-700">
                    5,954 (30%)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  500 - Server Error
                </span>
              </div>
              <div className="relative h-6 w-full bg-slate-100 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500"
                  style={{ width: '20%' }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-2">
                  <span className="text-xs font-medium pl-[21%] text-slate-700">
                    3,970 (20%)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  404 - Not Found
                </span>
              </div>
              <div className="relative h-6 w-full bg-slate-100 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-orange-500"
                  style={{ width: '15%' }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-2">
                  <span className="text-xs font-medium pl-[16%] text-slate-700">
                    1,000 (5%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Error Events */}
      <Card className="border border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Recent Error Events
          </CardTitle>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="text-slate-600 border-slate-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#483d8b]">
              <TableRow className="hover:bg-[#483d8b]">
                <TableHead className="text-white font-medium py-3 px-6 rounded-tl-lg">
                  Timestamp
                </TableHead>
                <TableHead className="text-white font-medium py-3 px-6">
                  Endpoint
                </TableHead>
                <TableHead className="text-white font-medium py-3 px-6">
                  Status
                </TableHead>
                <TableHead className="text-white font-medium py-3 px-6">
                  Error Message
                </TableHead>
                <TableHead className="text-white font-medium py-3 px-6">
                  API Key
                </TableHead>
                <TableHead className="text-white font-medium py-3 px-6">
                  Count
                </TableHead>
                <TableHead className="text-white font-medium py-3 px-6 rounded-tr-lg">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.map((event) => (
                <TableRow key={event.id} className="border-b border-slate-100">
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {event.timestamp}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {event.endpoint}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {event.status}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {event.message}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {event.apiKey}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {event.count}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {event.action}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
