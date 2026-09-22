import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUp,
  Share2,
  Trash2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

type TabType = 'dashboard' | 'edit' | 'settings' | 'api';

// Temperature Trend Data
const temperatureData = [
  { date: '20/8', value: 25 },
  { date: '21/8', value: 28 },
  { date: '22/8', value: 24 },
  { date: '23/8', value: 27 },
  { date: '24/8', value: 26 },
  { date: '25/8', value: 30 },
  { date: '26/8', value: 29 },
];

// Energy Consumption Data
const energyData = [
  { date: '20/8', value: 1800 },
  { date: '21/8', value: 1950 },
  { date: '22/8', value: 1850 },
  { date: '23/8', value: 2100 },
  { date: '24/8', value: 2000 },
  { date: '25/8', value: 2200 },
  { date: '26/8', value: 2050 },
];

// Humidity Level Data
const humidityData = [
  { name: 'Used', value: 50 },
  { name: 'Remaining', value: 50 },
];

// Alerts Data
interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'error';
}

const alerts: Alert[] = [
  {
    id: '1',
    message: 'Temperature spike detected',
    type: 'warning',
  },
  {
    id: '2',
    message: 'Humidity outside range',
    type: 'info',
  },
  {
    id: '3',
    message: 'Device offline: ID-2234',
    type: 'error',
  },
];

const COLORS = {
  primary: '#44489D',
  secondary: '#C36BA9',
  gray: '#E5E7EB',
  green: '#22C55E',
  blue: '#3B82F6',
  yellow: '#FCD34D',
  lightBlue: '#93C5FD',
  lightRed: '#FCA5A5',
};

const ALERT_COLORS = {
  warning: 'bg-yellow-200',
  info: 'bg-blue-200',
  error: 'bg-red-200',
};

export default function MainControlPanelPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isOnline, setIsOnline] = useState(true);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'dashboard', label: t('mainControlPanel.tabs.dashboard') },
    { key: 'edit', label: t('mainControlPanel.tabs.edit') },
    { key: 'settings', label: t('mainControlPanel.tabs.settings') },
    { key: 'api', label: t('mainControlPanel.tabs.api') },
  ];

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  const handleDelete = () => {
    console.log('Delete clicked');
  };

  const handleSetting = () => {
    console.log('Settings clicked');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('mainControlPanel.title')}
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-secondary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            {t('mainControlPanel.actions.export')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t('mainControlPanel.actions.share')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white"
          >
            <Trash2 className="h-4 w-4" />
            {t('mainControlPanel.actions.delete')}
          </Button>
        </div>
      </div>

      {/* Main Content - Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Row - Left: Temperature Trend */}
        <Card className="lg:col-span-2 shadow-md rounded-xl border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t('mainControlPanel.widgets.temperatureTrend')}
              </CardTitle>
              <button
                onClick={handleSetting}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Settings"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={temperatureData}>
                <defs>
                  <linearGradient
                    id="temperatureGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.green}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.green}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: 'white', fontWeight: 'bold' }}
                  formatter={(value: number) => [
                    `${value}°C`,
                    t('mainControlPanel.tooltip.total'),
                  ]}
                />
                <ReferenceLine
                  x="25/8"
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.secondary}
                  strokeWidth={3}
                  fill="url(#temperatureGradient)"
                  dot={{ fill: COLORS.secondary, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>{t('mainControlPanel.tooltip.total')}:</span>
              <span className="font-semibold">2000 kW/h</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Row - Middle: Humidity Level */}
        <Card className="shadow-md rounded-xl border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t('mainControlPanel.widgets.humidityLevel')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative flex items-center justify-center h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={humidityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {humidityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? COLORS.secondary : COLORS.gray}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="text-4xl font-bold text-gray-900">50%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Row - Right: Device Status */}
        <Card className="shadow-md rounded-xl border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t('mainControlPanel.widgets.deviceStatus')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {t('mainControlPanel.status.online')}
              </span>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isOnline ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-label="Toggle device status"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isOnline ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                {t('mainControlPanel.status.uptime')}:{' '}
                <span className="font-semibold text-gray-900">99.8%</span>
              </div>
              <div>
                {t('mainControlPanel.status.lastPing')}:{' '}
                <span className="font-semibold text-gray-900">2s ago</span>
              </div>
              <div>
                {t('mainControlPanel.status.status')}:{' '}
                <span className="font-semibold text-green-600">
                  {t('mainControlPanel.status.normal')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row - Left: Energy Consumption Timeline */}
        <Card className="lg:col-span-2 shadow-md rounded-xl border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t('mainControlPanel.widgets.energyConsumption')}
              </CardTitle>
              <button
                onClick={handleSetting}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Settings"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient
                    id="energyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.blue}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.blue}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    padding: '8px 12px',
                  }}
                  labelStyle={{ color: 'white', fontWeight: 'bold' }}
                  formatter={(value: number) => [
                    `${value} kW/h`,
                    t('mainControlPanel.tooltip.total'),
                  ]}
                />
                <ReferenceLine
                  x="24/8"
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.blue}
                  strokeWidth={3}
                  fill="url(#energyGradient)"
                  dot={{ fill: COLORS.blue, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>{t('mainControlPanel.tooltip.total')}:</span>
              <span className="font-semibold">2000 kW/h</span>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row - Right: Alerts */}
        <Card className="shadow-md rounded-xl border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t('mainControlPanel.widgets.alerts')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg ${ALERT_COLORS[alert.type]}`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
