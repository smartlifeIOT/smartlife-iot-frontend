import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Settings as SettingsIcon, MoreVertical } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

type TabType = 'data' | 'settings' | 'layout' | 'advanced';

interface KeyProperty {
  id: string;
  parameter: string;
  label: string;
  color: string;
}

// Temperature Trend Chart Data
const temperatureChartData = [
  { date: '20/8', value: 25 },
  { date: '21/8', value: 28 },
  { date: '22/8', value: 24 },
  { date: '23/8', value: 27 },
  { date: '24/8', value: 26 },
  { date: '25/8', value: 30 },
  { date: '26/8', value: 29 },
];

const COLORS = {
  primary: '#44489D',
  secondary: '#C36BA9',
  green: '#22C55E',
  blue: '#3B82F6',
  gray: '#E5E7EB',
};

export default function WidgetConfigurationPage() {
  const { t } = useTranslation();
  const { widgetId, widgetName } = useParams<{
    widgetId?: string;
    widgetName?: string;
  }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('data');

  // Form state
  const [dataSource, setDataSource] = useState('temperatureSensor');
  const [entity, setEntity] = useState('thermostat001');
  const [timeWindow, setTimeWindow] = useState('last24Hours');

  // Key Properties state
  const [keyProperties] = useState<KeyProperty[]>([
    {
      id: '1',
      parameter: 'Temperature',
      label: 'Temperature (°C)',
      color: COLORS.green,
    },
    {
      id: '2',
      parameter: 'Humidity',
      label: 'Humidity (%)',
      color: COLORS.blue,
    },
  ]);

  const handleCancel = () => {
    navigate('/widgets');
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving widget configuration...');
    navigate('/widgets');
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'data', label: t('widgetConfiguration.tabs.data') },
    { key: 'settings', label: t('widgetConfiguration.tabs.settings') },
    { key: 'layout', label: t('widgetConfiguration.tabs.layout') },
    { key: 'advanced', label: t('widgetConfiguration.tabs.advanced') },
  ];

  // Get widget display name from URL params or default
  const widgetDisplayName = widgetName
    ? decodeURIComponent(widgetName)
    : 'Temperature Trend';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('widgetConfiguration.title')}
        </h1>
      </div>

      {/* Subtitle Bar */}
      <div className=" bg-neutral-700 px-6 py-3 rounded-lg">
        <p className="text-white text-sm font-medium">
          {t('widgetConfiguration.subtitle', { widgetName: widgetDisplayName })}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2   border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'bg-secondary rounded-lg text-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {activeTab === 'data' && (
            <>
              {/* Data Source Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('widgetConfiguration.dataSource.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('widgetConfiguration.dataSource.dataSource')}
                    </label>
                    <Select value={dataSource} onValueChange={setDataSource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperatureSensor">
                          {t(
                            'widgetConfiguration.dataSource.options.temperatureSensor'
                          )}
                        </SelectItem>
                        <SelectItem value="humiditySensor">
                          {t(
                            'widgetConfiguration.dataSource.options.humiditySensor'
                          )}
                        </SelectItem>
                        <SelectItem value="pressureSensor">
                          {t(
                            'widgetConfiguration.dataSource.options.pressureSensor'
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('widgetConfiguration.dataSource.entity')}
                    </label>
                    <Select value={entity} onValueChange={setEntity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermostat001">
                          {t(
                            'widgetConfiguration.dataSource.options.thermostat001'
                          )}
                        </SelectItem>
                        <SelectItem value="thermostat002">
                          {t(
                            'widgetConfiguration.dataSource.options.thermostat002'
                          )}
                        </SelectItem>
                        <SelectItem value="thermostat003">
                          {t(
                            'widgetConfiguration.dataSource.options.thermostat003'
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('widgetConfiguration.dataSource.timeWindow')}
                    </label>
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last1Hour">
                          {t(
                            'widgetConfiguration.dataSource.timeWindows.last1Hour'
                          )}
                        </SelectItem>
                        <SelectItem value="last6Hours">
                          {t(
                            'widgetConfiguration.dataSource.timeWindows.last6Hours'
                          )}
                        </SelectItem>
                        <SelectItem value="last24Hours">
                          {t(
                            'widgetConfiguration.dataSource.timeWindows.last24Hours'
                          )}
                        </SelectItem>
                        <SelectItem value="last7Days">
                          {t(
                            'widgetConfiguration.dataSource.timeWindows.last7Days'
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Key Properties Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('widgetConfiguration.keyProperties.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">
                            {t('widgetConfiguration.keyProperties.parameter')}
                          </th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">
                            {t('widgetConfiguration.keyProperties.label')}
                          </th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {keyProperties.map((property) => (
                          <tr
                            key={property.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {property.parameter}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: property.color }}
                                ></span>
                                <span className="text-sm text-gray-900">
                                  {property.label}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                className="p-1 text-gray-400 hover:text-gray-600"
                                aria-label="More options"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {t('widgetConfiguration.settings.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('widgetConfiguration.settings.comingSoon')}
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'layout' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {t('widgetConfiguration.layout.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('widgetConfiguration.layout.comingSoon')}
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {t('widgetConfiguration.advanced.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('widgetConfiguration.advanced.comingSoon')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {t('widgetConfiguration.preview.title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Preview Card */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-900">
                      {widgetDisplayName}
                    </CardTitle>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      aria-label="Settings"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={temperatureChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
                      />
                      <ReferenceLine
                        x="25/8"
                        stroke="#9CA3AF"
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS.green}
                        strokeWidth={3}
                        dot={{ fill: COLORS.green, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>
                      {t('widgetConfiguration.preview.tooltip.total')}: 2000
                      kW/h
                    </span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="bg-primary hover:bg-primary/90 text-white border-primary"
        >
          {t('widgetConfiguration.actions.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {t('widgetConfiguration.actions.save')}
        </Button>
      </div>
    </div>
  );
}
