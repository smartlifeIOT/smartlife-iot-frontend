import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Helper function to get localized widget performance data
const getWidgetPerformanceData = (t: TFunction) => [
  {
    name: t('productionOverview.widgetNames.temperatureChart'),
    loadTime: '1.2s',
    status: t('productionOverview.widgetStatus.good'),
    statusColor: 'text-green-600',
    statusDot: 'bg-green-500',
  },
  {
    name: t('productionOverview.widgetNames.pressureGauge'),
    loadTime: '0.8s',
    status: t('productionOverview.widgetStatus.good'),
    statusColor: 'text-green-600',
    statusDot: 'bg-green-500',
  },
  {
    name: t('productionOverview.widgetNames.motorStatus'),
    loadTime: '3.1s',
    status: t('productionOverview.widgetStatus.slow'),
    statusColor: 'text-orange-600',
    statusDot: 'bg-orange-500',
  },
  {
    name: t('productionOverview.widgetNames.flowRateGraph'),
    loadTime: '1.5s',
    status: t('productionOverview.widgetStatus.good'),
    statusColor: 'text-green-600',
    statusDot: 'bg-green-500',
  },
  {
    name: t('productionOverview.widgetNames.alarmPanel'),
    loadTime: '4.2s',
    status: t('productionOverview.widgetStatus.poor'),
    statusColor: 'text-red-600',
    statusDot: 'bg-red-500',
  },
];

// Helper function to get localized recent activity
const getRecentActivity = (t: TFunction) => [
  t('productionOverview.activityMessages.dashboardLoaded', {
    user: 'admin@company.com',
  }),
  t('productionOverview.activityMessages.widgetRefresh', {
    widgetName: t('productionOverview.widgetNames.temperatureChart'),
  }),
  t('productionOverview.activityMessages.newDeviceConnected', {
    deviceName: 'Sensor-012',
  }),
  t('productionOverview.activityMessages.alertResolved', {
    alertMessage: 'High pressure warning',
  }),
];

// Mock data for data consumption by device (device names don't need translation)
const deviceConsumptionData = [
  { device: 'Gateway-002', value: 180, percentage: 40, color: '#3B82F6' },
  { device: 'Sensor-001', value: 135, percentage: 30, color: '#EC4899' },
  { device: 'Sensor-004', value: 81, percentage: 18, color: '#F97316' },
  { device: 'Motor-003', value: 54, percentage: 12, color: '#000000' },
  { device: 'Valve-007', value: 27, percentage: 6, color: '#EF4444' },
];

export default function ProductionOverviewPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log('Refreshing dashboard analytics...');
  };

  return (
    <div className="space-y-6 p-2  ">
      {/* Header */} 
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('productionOverview.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('productionOverview.subtitle')}
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[220px] bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700">
            <SelectValue
              placeholder={t('productionOverview.timeRangeLast7Days')}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">
              {t('productionOverview.timeRangeLast24Hours')}
            </SelectItem>
            <SelectItem value="7d">
              {t('productionOverview.timeRangeLast7Days')}
            </SelectItem>
            <SelectItem value="30d">
              {t('productionOverview.timeRangeLast30Days')}
            </SelectItem>
            <SelectItem value="90d">
              {t('productionOverview.timeRangeLast90Days')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Devices */}
        <Card className="bg-green-50 border-green-200 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('productionOverview.totalDevices')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              247
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>
                {t('productionOverview.trendUpPercent', { percent: 12 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Data Generated */}
        <Card className="bg-purple-50 border-purple-200 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('productionOverview.dataGenerated')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              1.2TB
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>
                {t('productionOverview.trendUpPercent', { percent: 18 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="bg-orange-50 border-orange-200 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('productionOverview.activeAlerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              23
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>
                {t('productionOverview.trendUpPercent', { percent: 5 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card className="bg-purple-50 border-purple-200 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('productionOverview.uptime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              99.8%
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>
                {t('productionOverview.trendUpPercent', { percent: 0.2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Data Consumption by Device */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                {t('productionOverview.dataConsumptionByDevice')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceConsumptionData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {item.device}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.value} MB ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="h-4 rounded-full"
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

          {/* Recent Activity */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                {t('productionOverview.recentActivity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecentActivity(t).map((activity, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    {activity}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Widget Performance Table */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                {t('productionOverview.widgetPerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="font-semibold dark:text-gray-300">
                      {t('productionOverview.tableHeaders.widgetName')}
                    </TableHead>
                    <TableHead className="font-semibold dark:text-gray-300">
                      {t('productionOverview.tableHeaders.loadTime')}
                    </TableHead>
                    <TableHead className="font-semibold dark:text-gray-300">
                      {t('productionOverview.tableHeaders.status')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getWidgetPerformanceData(t).map((widget, index) => (
                    <TableRow key={index} className="dark:border-gray-700">
                      <TableCell className="font-medium dark:text-white">
                        {widget.name}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {widget.loadTime}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${widget.statusDot}`}
                          />
                          <span
                            className={`font-medium ${widget.statusColor} dark:text-white`}
                          >
                            {widget.status}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Widget Performance Status Summary */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                {t('productionOverview.widgetPerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('productionOverview.statusSummary.online', {
                      count: 10,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('productionOverview.statusSummary.warning', {
                      count: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('productionOverview.statusSummary.offline', {
                      count: 0,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('productionOverview.statusSummary.maintenance', {
                      count: 1,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('productionOverview.footer.lastUpdated', { time: 2 })} •{' '}
          {t('productionOverview.footer.autoRefresh', { interval: 30 })}
        </div>
        <Button
          onClick={handleRefresh}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('productionOverview.refresh')}
        </Button>
      </div>
    </div>
  );
}
