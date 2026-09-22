import { useTranslation } from 'react-i18next';
import { Settings, Edit, Share2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
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
import { useMainDashboard } from '@/features/dashboard/hooks/useMainDashboard';

export default function MainDashboardPage() {
  const { t } = useTranslation();
  const {
    isOnline,
    temperatureData,
    humidityData,
    powerConsumption,
    temperatureTotal,
    humidityPercentage,
    colors: COLORS,
    handleSetting,
    toggleSystemStatus,
  } = useMainDashboard();

  console.log(temperatureTotal, 'temperatureTotal');

  const handleEdit = () => {
    console.log('Edit clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('mainDashboard.title')}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSetting}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {t('mainDashboard.actions.setting')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('mainDashboard.actions.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t('mainDashboard.actions.share')}
          </Button>
        </div>
      </div>

      {/* Main Dashboard Card - 2x2 Grid */}
      <Card className="shadow-lg rounded-xl border-gray-200 p-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top-Left: Temperature Trend */}
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('mainDashboard.sections.temperatureTrend')}
                  </CardTitle>
                  <button
                    onClick={handleSetting}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Settings"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={temperatureData}>
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
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px 12px',
                      }}
                      labelStyle={{ color: 'white', fontWeight: 'bold' }}
                      formatter={(value: number) => [
                        `${value}°C`,
                        t('mainDashboard.tooltip.total'),
                      ]}
                    />
                    <ReferenceLine
                      x="25/8"
                      stroke="#9CA3AF"
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 text-xs text-gray-500">
                  {t('mainDashboard.tooltip.total')}: {temperatureTotal.value}{' '}
                  {temperatureTotal.unit}
                </div>
              </CardContent>
            </Card>

            {/* Top-Right: Humidity Level */}
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('mainDashboard.sections.humidityLevel')}
                  </CardTitle>
                  <button
                    onClick={handleSetting}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Settings"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative flex items-center justify-center h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={humidityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        {humidityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? COLORS.primary : COLORS.gray}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {humidityPercentage}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom-Left: Power Consumption */}
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('mainDashboard.sections.powerConsumption')}
                  </CardTitle>
                  <button
                    onClick={handleSetting}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Settings"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-5xl font-bold text-orange-500">
                    {powerConsumption.value} {powerConsumption.unit}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom-Right: System Status */}
            <Card className="border border-gray-200 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('mainDashboard.sections.systemStatus')}
                  </CardTitle>
                  <button
                    onClick={handleSetting}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Settings"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 h-[200px]">
                  <span className="text-lg font-medium text-gray-900">
                    {t('mainDashboard.status.online')}
                  </span>
                  <button
                    onClick={toggleSystemStatus}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle system status"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isOnline ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
