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
import DashboardNavigation from '@/components/ui/DashboardNavigation';

export default function DevicesAnalyticsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');

  const handleRefresh = () => {
    console.log('Refreshing dashboard analytics...');
  };

  const widgetPerformanceData = [
    {
      name: 'Temperature Chart',
      loadTime: '1.2s',
      status: 'Good',
      dotColor: 'bg-green-500',
    },
    {
      name: 'Temperature Chart',
      loadTime: '1.2s',
      status: 'Good',
      dotColor: 'bg-green-500',
    },
    {
      name: 'Temperature Chart',
      loadTime: '1.2s',
      status: 'Good',
      dotColor: 'bg-green-500',
    },
    {
      name: 'Pressure Gauge',
      loadTime: '0.8s',
      status: 'Good',
      dotColor: 'bg-green-500',
    },
    {
      name: 'Motor Status',
      loadTime: '3.1s',
      status: 'Slow',
      dotColor: 'bg-orange-300',
    },
    {
      name: 'Flow Rate Graph',
      loadTime: '1.5s',
      status: 'Good',
      dotColor: 'bg-green-500',
    },
    {
      name: 'Alarm Panel',
      loadTime: '4.2s',
      status: 'Poor',
      dotColor: 'bg-red-500',
    },
  ];

  const recentActivity = [
    'Dashboard loaded by admin@company.com',
    'Widget refresh: Temperature Chart',
    'New device connected: Sensor-012',
    'Alert resolved: High pressure warning',
  ];

  const deviceConsumptionData = [
    {
      device: 'Gateway-002',
      value: '180 MB (40%)',
      percentage: 40,
      color: 'bg-blue-600',
    },
    {
      device: 'Sensor-001',
      value: '135 MB (30%)',
      percentage: 30,
      color: 'bg-pink-400',
    },
    {
      device: 'Sensor-004',
      value: '81 MB (18%)',
      percentage: 18,
      color: 'bg-orange-300',
    },
    {
      device: 'Motor-003',
      value: '54 MB (12%)',
      percentage: 12,
      color: 'bg-gray-800',
    },
    {
      device: 'Valve-007',
      value: '27 MB (6%)',
      percentage: 6,
      color: 'bg-red-600',
    },
  ];
  const days = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];

  return (
    <div className="flex flex-col min-h-screen   dark:bg-gray-950">
      <div className="flex-1 space-y-8">
        <div className="flex justify-between">
          <PageHeader
            title="Dashboard Analytics - Production Overview"
            description="Detailed analytics for Production Overview dashboard"
          ></PageHeader>
          {/* Header */}
          <div className="flex items-center justify-between space-y-2">
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
              className="w-[200px]"
            >
              <SelectTrigger className="  h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-md shadow-sm">
                <SelectValue placeholder="Time Range: Last 7 days" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem value={day.value} className="text-xs">
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary text-white ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold  text-white dark:text-green-400">
                Total Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-white  dark:text-white">
                247
              </div>
              <p className="text-xs  dark:text-green-500 mt-1">
                ↑ 12% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary text-white ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white">
                Data Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold   dark:text-white">
                1.2TB
              </div>
              <p className="text-xs   mt-1">↑ 8% from last week</p>
            </CardContent>
          </Card>
          <Card className="bg-success text-white ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white">
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold   dark:text-white">23</div>
              <p className="text-xs  mt-1">↓ 5% from last week</p>
            </CardContent>
          </Card>
          <Card className=" bg-white text-gray-800 dark:bg-gray-900 dark:text-white ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold ">Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold   dark:text-white">
                99.8%
              </div>
              <p className="text-xs   mt-1">↑ 0.2% from last week</p>
            </CardContent>
          </Card>
        </div>
        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Data Consumption by Device */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                Data Consumption by Device
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {deviceConsumptionData.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-28 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.device}
                  </div>
                  <div className="flex-1">
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-28 text-xs text-gray-500 dark:text-gray-500 text-right">
                    {item.value}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Widget Performance Table */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                Widget Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                <Table className="relative">
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
                    <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                      <TableHead className="font-semibold text-black dark:text-gray-300 py-4 px-6 uppercase text-xs bg-white dark:bg-gray-900">
                        Widget Name
                      </TableHead>
                      <TableHead className="font-semibold text-black dark:text-gray-300 py-4 px-6 uppercase text-xs bg-white dark:bg-gray-900">
                        Load Time
                      </TableHead>
                      <TableHead className="font-semibold text-black dark:text-gray-300 py-4 px-6 uppercase text-xs bg-white dark:bg-gray-900">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {widgetPerformanceData.map((widget, index) => (
                      <TableRow
                        key={index}
                        className="border-b w-full   border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
                      >
                        <TableCell className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                          {widget.name}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                          {widget.loadTime}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${widget.dotColor}`}
                            />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {widget.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {activity}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Widget Performance (Status Summary) */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                Widget Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Online: 10 devices
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-orange-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Warning: 2 devices
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Offline: 0 devices
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Maintenance: 1 device
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 p-4 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Last Updated: 2 Minutes Ago Auto-Refresh: Enabled (30s Interval)
        </div>
        <Button onClick={handleRefresh} variant="primary">
          Refresh
        </Button>
      </div>
      <div className="flex justify-center gap-3 pt-4">
        <DashboardNavigation
          previousRoute="/analytics/dashboard-analytics/:id"
          nextRoute="/analytics/dashboard-analytics-/:id"
        />
      </div>
    </div>
  );
}
