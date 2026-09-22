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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { createSortableColumn } from '@/components/common/DataTable/columns';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RequestEndpoint {
  id: string;
  endpoint: string;
  requests: number;
  percentage: number;
  avgResponseTime: number;
  successRate: number;
  trend: 'up' | 'down';
}

const requestEndpoints: RequestEndpoint[] = [
  {
    id: '1',
    endpoint: '/api/v1/devices',
    requests: 186432,
    percentage: 33.6,
    avgResponseTime: 127,
    successRate: 99.7,
    trend: 'up',
  },
  {
    id: '2',
    endpoint: '/api/v1/telemetry',
    requests: 284759,
    percentage: 22.0,
    avgResponseTime: 89,
    successRate: 99.2,
    trend: 'down',
  },
  {
    id: '3',
    endpoint: '/api/v1/attributes',
    requests: 284769,
    percentage: 17.4,
    avgResponseTime: 156,
    successRate: 98.8,
    trend: 'up',
  },
  {
    id: '4',
    endpoint: '/api/v1/dashboard',
    requests: 284769,
    percentage: 11.6,
    avgResponseTime: 203,
    successRate: 97.3,
    trend: 'down',
  },
  {
    id: '5',
    endpoint: '/api/v1/search',
    requests: 284769,
    percentage: 8.0,
    avgResponseTime: 305,
    successRate: 87.3,
    trend: 'up',
  },
];

const volumeData = [
  { month: 'Jan', requests: 4000, errors: 240 },
  { month: 'Feb', requests: 3000, errors: 221 },
  { month: 'Mar', requests: 2000, errors: 229 },
  { month: 'Apr', requests: 2780, errors: 200 },
  { month: 'May', requests: 1890, errors: 229 },
  { month: 'Jun', requests: 2390, errors: 200 },
  { month: 'Jul', requests: 3490, errors: 300 },
  { month: 'Aug', requests: 2000, errors: 180 },
  { month: 'Sep', requests: 2780, errors: 200 },
  { month: 'Oct', requests: 1890, errors: 229 },
  { month: 'Nov', requests: 2390, errors: 200 },
  { month: 'Dec', requests: 3490, errors: 300 },
];

const methodData = [
  { name: 'GET', value: 67.2, color: '#3b82f6' },
  { name: 'POST', value: 18.5, color: '#10b981' },
  { name: 'PUT', value: 10.8, color: '#f59e0b' },
  { name: 'DELETE', value: 3.5, color: '#ef4444' },
];

const metricCards = [
  {
    title: 'Total Requests',
    value: '847,592',
    change: '+15.3% from yesterday',
    bgColor: 'bg-primary text-white',
  },
  {
    title: 'Requests/Minute',
    value: '23.4',
    change: '+8.7% avg',
    bgColor: 'bg-secondary text-white',
  },
  {
    title: 'Peak Hour',
    value: '14:00',
    change: '158 req/min',
    bgColor: 'bg-success text-white',
  },
  {
    title: 'Unique Sources',
    value: '47',
    change: 'API keys active',
    bgColor: 'bg-white',
  },
];

export default function RequestAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [endpoint, setEndpoint] = useState('all');
  const [method, setMethod] = useState('all');
  const [apiKey, setApiKey] = useState('all');

  const columns = [
    createSortableColumn('endpoint', 'Endpoint'),
    {
      accessorKey: 'requests',
      header: 'Requests',
      cell: ({ row }: any) => (
        <span className="font-semibold">
          {row.getValue('requests').toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'percentage',
      header: 'Percentage',
      cell: ({ row }: any) => <span>{row.getValue('percentage')}%</span>,
    },
    {
      accessorKey: 'avgResponseTime',
      header: 'Avg Response Time',
      cell: ({ row }: any) => <span>{row.getValue('avgResponseTime')}ms</span>,
    },
    {
      accessorKey: 'successRate',
      header: 'Success Rate',
      cell: ({ row }: any) => (
        <span className="text-green-600">{row.getValue('successRate')}%</span>
      ),
    },
    {
      accessorKey: 'trend',
      header: 'Trend',
      cell: ({ row }: any) => {
        const trend = row.getValue('trend') as 'up' | 'down';
        return (
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={trend === 'up' ? 'text-green-600' : 'text-red-600'}
            >
              {trend === 'up' ? '↑' : '↓'}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request Analytics"
        description="Detailed analysis of API request patterns and volumes"
      />

      {/* Filters Section */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px] h-10 bg-gray-100 border-none rounded-md">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={endpoint} onValueChange={setEndpoint}>
          <SelectTrigger className="w-[150px] h-10 bg-gray-100 border-none rounded-md">
            <SelectValue placeholder="Endpoint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Endpoints</SelectItem>
            <SelectItem value="/api/v1/devices">/api/v1/devices</SelectItem>
            <SelectItem value="/api/v1/telemetry">/api/v1/telemetry</SelectItem>
            <SelectItem value="/api/v1/attributes">
              /api/v1/attributes
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-[150px] h-10 bg-gray-100 border-none rounded-md">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>

        <Select value={apiKey} onValueChange={setApiKey}>
          <SelectTrigger className="w-[150px] h-10 bg-gray-100 border-none rounded-md">
            <SelectValue placeholder="API Key" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Keys</SelectItem>
            <SelectItem value="key1">key_***abc123</SelectItem>
            <SelectItem value="key2">key_***def456</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="primary" className="h-10">
          Apply
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 lg:grid-cols-4">
        {metricCards.map((card) => (
          <Card
            key={card.title}
            className={`border-none shadow-sm ${card.bgColor}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium  ">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold  ">{card.value}</p>
                  <p className="mt-2 text-xs  ">{card.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Request Volume Over Time</CardTitle>
            <CardDescription>Requests per hour (last 24 hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#red', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="requests"
                    fill="#4338ca"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="errors" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Request Methods</CardTitle>
            <CardDescription>Distribution by HTTP method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints Table */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Top Endpoints by Request Volume</CardTitle>
          <CardDescription>
            Performance metrics for each endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <DataTable
            columns={columns}
            data={requestEndpoints}
            searchKey="endpoint"
          />
        </CardContent>
      </Card>
    </div>
  );
}
