import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Bell,
  ArrowLeft,
} from 'lucide-react';

// Mock data for the timeline chart
const timelineData = [
  { time: '00:00', online: 1, offline: 0 },
  { time: '04:00', online: 2, offline: 0 },
  { time: '08:00', online: 3, offline: 1 },
  { time: '12:00', online: 4, offline: 1 },
  { time: '16:00', online: 3, offline: 2 },
  { time: '20:00', online: 5, offline: 1 },
  { time: '24:00', online: 4, offline: 1 },
];

interface DeviceEvent {
  id: string;
  deviceId: string;
  event: string;
  time: string;
  location: string;
  color: string;
  dotColor: string;
}

// Helper function to get localized device events
const getDeviceEvents = (t: TFunction): DeviceEvent[] => [
  {
    id: '1',
    deviceId: 'GW-01',
    event: t('analytics.events.connected'),
    time: t('analytics.timeAgo.minutes', { count: 5 }),
    location: 'Room 101',
    color: 'bg-pink-100 dark:bg-pink-900',
    dotColor: 'bg-red-500',
  },
  {
    id: '2',
    deviceId: 'S-15',
    event: t('analytics.events.disconnected'),
    time: t('analytics.timeAgo.hours', { count: 1 }),
    location: 'Kitchen',
    color: 'bg-purple-100 dark:bg-purple-900',
    dotColor: 'bg-blue-500',
  },
  {
    id: '3',
    deviceId: 'S-08',
    event: t('analytics.events.lowBatteryWarning'),
    time: t('analytics.timeAgo.hoursPlural', { count: 2 }),
    location: 'Reception',
    color: 'bg-orange-100 dark:bg-orange-900',
    dotColor: 'bg-red-500',
  },
  {
    id: '4',
    deviceId: 'S-12',
    event: t('analytics.events.dataTransmissionSuccessful'),
    time: t('analytics.timeAgo.hoursPlural', { count: 3 }),
    location: 'Office 102',
    color: 'bg-blue-100 dark:bg-blue-900',
    dotColor: 'bg-blue-500',
  },
  {
    id: '5',
    deviceId: 'S-13',
    event: t('analytics.events.lowBatteryWarning'),
    time: t('analytics.timeAgo.hoursPlural', { count: 2 }),
    location: 'Reception',
    color: 'bg-orange-100 dark:bg-orange-900',
    dotColor: 'bg-red-500',
  },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('all-floors');

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log('Refreshing data...');
  };

  const handleExport3D = () => {
    // TODO: Implement export 3D functionality
    console.log('Exporting 3D...');
  };

  const handleSetAlerts = () => {
    // TODO: Navigate to alerts settings
  };

  return (
    <div className="space-y-6  ">
      <PageHeader
        title={t('analytics.title', { building: 'AGW-01' })}
        actions={[
          {
            label: t('analytics.reportTemplates'),
            onClick: () => navigate('/report-templates'),
          },
          {
            label: t('common.back'),
            onClick: () => navigate('/floor-plans'),
          },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('analytics.filters')}
        </span>
        <div className="flex gap-2">
          {[
            { id: 'all-floors', label: t('analytics.allFloors') },
            { id: 'all-rooms', label: t('analytics.allRooms') },
            { id: 'last-7-days', label: t('analytics.last7Days') },
          ].map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className={
                selectedFilter === filter.id
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500 border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('analytics.activeDevices')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              24
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>{t('analytics.trendUpFromLastWeek', { count: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('analytics.offlineDevices')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              3
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
              <TrendingDown className="h-4 w-4" />
              <span>{t('analytics.trendDownFromLastWeek', { count: 1 })}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('analytics.criticalAlerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              5
            </div>
            <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>{t('analytics.trendUpFromLastWeek', { count: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('analytics.dataPointsToday')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              1,247
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>
                {t('analytics.trendUpFromYesterday', { percent: 15 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Device Status Timeline */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">
              {t('analytics.deviceStatusTimeline')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="time"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                />
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="online"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name={t('analytics.online')}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="offline"
                  stroke="#ec4899"
                  strokeWidth={2}
                  name={t('analytics.offline')}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Device Events */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">
              {t('analytics.recentDeviceEvents')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {getDeviceEvents(t).map((event) => (
                <div
                  key={event.id}
                  className={`${event.color} rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`${event.dotColor} w-2 h-2 rounded-full mt-2 flex-shrink-0`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {event.deviceId}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {event.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {event.event}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">
            {t('analytics.performanceMetrics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('analytics.performanceMetrics')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                2.3ms
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('analytics.networkUptime')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                99.8%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('analytics.dataLossRate')}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                0.02%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('analytics.signalStrengthAvg')}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                -65 dBm
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('analytics.batteryHealthAverage')}
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                78%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/floor-plans')}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport3D}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            <Download className="mr-2 h-4 w-4" />
            {t('analytics.export3D')}
          </Button>
          <Button onClick={handleSetAlerts} className="bg-primary text-white">
            <Bell className="mr-2 h-4 w-4" />
            {t('analytics.setAlerts')}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="dark:border-gray-700 dark:text-gray-300"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('analytics.refresh')}
        </Button>
      </div>
    </div>
  );
}
