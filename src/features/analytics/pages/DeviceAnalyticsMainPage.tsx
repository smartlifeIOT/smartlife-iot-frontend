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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts';
import { cn } from '@/lib/util';
import { useDevicesAnalytics } from '@/features/analytics/hooks';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { TimeRangeType } from '@/services/api/analytics.api';
import DashboardNavigation from '@/components/ui/DashboardNavigation';
import { Pagination } from '@/components/common/Pagination';
import { format } from 'date-fns';

import { exportDeviceAnalyticsPdf } from '@/features/analytics/utils/exportDeviceAnalyticsPdf';

export default function DeviceAnalyticsMainPage() {
  const { t } = useTranslation();
  const [deviceType, setDeviceType] = useState('');
  const [status, setStatus] = useState('');

  const [timeRange, setTimeRange] = useState<TimeRangeType>(
    TimeRangeType.last24h
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: devicesAnalytics, isLoading: isLoadingData } =
    useDevicesAnalytics({
      timeRange,
      type: deviceType || undefined,
      status: status || undefined,
      page: currentPage,
      limit: itemsPerPage,
    });
  const rawData = devicesAnalytics || {};
  const meta = rawData.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    limit: itemsPerPage,
  };

  const tableData = (rawData.devices || []).map((device) => ({
    id: device.id,
    name: device.name || 'Unknown',
    type: device.type || 'Unknown',
    status:
      device.status === 'active' || device.status === 'online'
        ? 'Online'
        : 'Offline',
    dataGenerated: `${device.dataGeneratedBytes || 0} MB`,
    lastActive: device.lastSeenAt || 'N/A',
    uptime: `${device.uptimePercentage || 0}%`,
    alerts: device.activeAlarms || 0,
    statusColor:
      device.status === 'active' || device.status === 'online'
        ? 'text-green-500'
        : 'text-gray-500',
    dotColor:
      device.status === 'active' || device.status === 'online'
        ? 'bg-green-500'
        : 'bg-gray-500',
    alertColor:
      (device.alarmCount || 0) > 0 ? 'text-red-500' : 'text-green-500',
  }));

  const topGeneratorsData = (rawData.topGenerators || []).map(
    (gen, index: number) => ({
      name: gen.name || 'Unknown',
      value: gen.dataGeneratedBytes || 0,
      color: ['#312e81', '#c026d3', '#4a4a4a'][index % 3] || '#4a4a4a',
    })
  );

  const dist = rawData.statusDistribution || {
    online: 10,
    offline: 10,
    maintenance: 10,
  };
  const statusDistributionData = [
    { name: 'Online', value: dist.online || 0, color: '#4338ca' },
    { name: 'Offline', value: dist.offline || 0, color: '#c026d3' },
    { name: 'Maintenance', value: dist.maintenance || 0, color: '#fca5a1' },
  ];
  const totalDevices = rawData.meta?.totalItems || 0;
  const navigate = useNavigate();
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={t('analytics.deviceMain.title')}
          description={t('analytics.deviceMain.subtitle')}
        />
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span>Device Type :</span>{' '}
          <Select
            value={deviceType}
            onValueChange={(val) => {
              setDeviceType(val);
              setCurrentPage(1);
            }}
            className="w-[180px]"
          >
            <SelectTrigger className="w-[180px] h-10 bg-gray-100 border-none rounded-md">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="sensor">Sensor</SelectItem>
              <SelectItem value="gateway">Gateway</SelectItem>
              <SelectItem value="actuator">Actuator</SelectItem>
              <SelectItem value="controller">Controller</SelectItem>
              <SelectItem value="camera">Camera</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span>Status :</span>{' '}
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setCurrentPage(1);
            }}
            className="w-32"
          >
            <SelectTrigger className="w-[280px] h-10 bg-gray-100 border-none rounded-md">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span>Time Range :</span>{' '}
          <Select
            value={timeRange}
            onValueChange={(value) => {
              setTimeRange(value as TimeRangeType);
              setCurrentPage(1);
            }}
            className="w-[180px]"
          >
            <SelectTrigger className="  h-10 bg-gray-100 border-none rounded-md">
              <SelectValue
                placeholder={t('analytics.deviceMain.filters.timeRange')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeRangeType.lastHour}>Last hour</SelectItem>
              <SelectItem value={TimeRangeType.last24h}>
                Last 24 hours
              </SelectItem>
              <SelectItem value={TimeRangeType.lastWeek}>Last week</SelectItem>
              <SelectItem value={TimeRangeType.last30d}>
                Last 30 days
              </SelectItem>
              <SelectItem value={TimeRangeType.last90d}>
                Last 90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className=" rounded-xl overflow-hidden">
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.deviceName')}
                </TableHead>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.type')}
                </TableHead>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.status')}
                </TableHead>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.dataGenerated')}
                </TableHead>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.lastActive')}
                </TableHead>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.uptime')}
                </TableHead>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.alerts')}
                </TableHead>
                <TableHead className="font-semibold  ">
                  {t('analytics.deviceMain.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawData.total == 0 ? (
                <TableRow className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 h-16">
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 text-sm"
                  >
                    {t('analytics.deviceMain.table.noData')}
                  </TableCell>
                </TableRow>
              ) : isLoadingData ? (
                <TableRow className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 h-16">
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 text-sm"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row, index: number) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 h-16"
                  >
                    <TableCell className="text-sm font-semibold capitalize text-gray-700">
                      {row.name}
                    </TableCell>
                    <TableCell className="text-sm capitalize text-gray-600">
                      {row.type}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div />
                        <span className="text-sm text-gray-600">
                          <Badge
                            className={cn(
                              'capitalize',
                              row.dotColor === 'bg-green-500'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            )}
                          >
                            {row.status}
                          </Badge>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {row.dataGenerated}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(row.lastActive, 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {row.uptime}
                    </TableCell>
                    <TableCell
                      className={cn('text-sm font-bold', row.alertColor)}
                    >
                      {row.alerts}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/analytics/devices/${row.id}`)}
                      >
                        {t('analytics.deviceMain.table.viewDetails')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {(meta?.totalPages ?? 0) > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Data Generators */}
        <Card className=" rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {t('analytics.deviceMain.charts.topGenerators')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topGeneratorsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-100 rounded-md shadow-lg">
                            <p className="text-sm font-semibold text-gray-800">{`${payload[0].value} MB`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    barSize={60}
                    label={{
                      position: 'top',
                      fill: '#64748b',
                      fontSize: 12,
                      // formatter: (val: number) => `${val}MB`,
                      offset: 10,
                    }}
                  >
                    {topGeneratorsData.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Status Distribution */}
        <Card className=" rounded-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {t('analytics.deviceMain.charts.statusDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="h-[300px] w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        const box = viewBox as
                          | { cx?: number; cy?: number }
                          | undefined;
                        const cx = box?.cx ?? 0;
                        const cy = box?.cy ?? 0;
                        return (
                          <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            <tspan
                              x={cx}
                              y={cy - 10}
                              className="text-xl font-semibold  "
                            >
                              {totalDevices}
                            </tspan>
                            <tspan
                              x={cx}
                              y={cy + 20}
                              className="text-xs fill-gray-500 font-medium"
                            >
                              {t('analytics.deviceMain.charts.totalDevices')}
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-4 min-w-[150px]">
              {statusDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation */}
      <div className="flex justify-center gap-3 pt-4">
        <DashboardNavigation
          previousRoute="/analytics/devices"
          nextRoute="/analytics/devices-2"
        />
      </div>
    </div>
  );
}
