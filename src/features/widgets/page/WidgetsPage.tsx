import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'recharts';

// Sample data for charts
const simpleLineData = [
  { value: 30 },
  { value: 45 },
  { value: 35 },
  { value: 55 },
  { value: 50 },
  { value: 65 },
  { value: 60 },
  { value: 70 },
  { value: 55 },
];

const detailedLineData = [
  { value: 50 },
  { value: 65 },
  { value: 70 },
  { value: 85 },
  { value: 90 },
  { value: 95 },
  { value: 100 },
  { value: 90 },
  { value: 85 },
  { value: 80 },
];


const COLORS = {
  primary: '#44489D',
  secondary: '#C36BA9',
  gray: '#E5E7EB',
};

export default function Widgets() {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { key: 'all', label: t('widgets.filters.all') },
    { key: 'lineChart', label: t('widgets.filters.lineChart') },
    { key: 'timeSeries', label: t('widgets.filters.timeSeries') },
    { key: 'controls', label: t('widgets.filters.controls') },
  ];

  const progressData = [
    { name: t('widgets.chartLabels.used'), value: 75 },
    { name: t('widgets.chartLabels.remaining'), value: 25 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Section - Add Widget */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('widgets.addWidget')}
        </h2>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-900">
              {t('widgets.lineChartWidget')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple Line Chart Preview */}
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={simpleLineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.secondary}
                  strokeWidth={3}
                  dot={{ fill: '#000000', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Right Section - Widget Library */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('widgets.widgetLibrary')}
        </h2>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === filter.key
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Widget Cards */}
        <div className="space-y-4">
          {/* Card 1: Line Chart Widget */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-900">
                {t('widgets.lineChartWidget')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={detailedLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 125]}
                    ticks={[0, 50, 75, 100, 125]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Card 2: Resources > Widgets Library */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-900">
                {t('widgets.resourcesWidgetsLibrary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1"></div>
                <div className="relative flex items-center justify-center">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie
                        data={progressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        {progressData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? COLORS.secondary : COLORS.gray}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="absolute text-xl font-semibold text-gray-900">
                    75%
                  </span>
                </div>
                <div className="flex-1"></div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Map */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">
                {t('widgets.map')}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {t('widgets.geographicMapWidget')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                {/* World Map Silhouette */}
                <svg
                  viewBox="0 0 800 400"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Simplified world map silhouette */}
                  {/* North America */}
                  <path
                    d="M150 80 L180 60 L220 70 L240 100 L230 140 L200 150 L160 140 L140 110 Z"
                    fill="#6B7280"
                  />
                  {/* South America */}
                  <path
                    d="M200 180 L220 170 L240 200 L235 260 L210 270 L190 250 L185 210 Z"
                    fill="#6B7280"
                  />
                  {/* Europe */}
                  <path
                    d="M350 50 L420 45 L440 80 L430 120 L400 130 L360 115 L340 80 Z"
                    fill="#6B7280"
                  />
                  {/* Africa */}
                  <path
                    d="M380 140 L440 135 L460 200 L455 280 L420 290 L390 270 L370 200 Z"
                    fill="#6B7280"
                  />
                  {/* Asia */}
                  <path
                    d="M460 40 L600 50 L620 100 L610 180 L580 200 L520 190 L480 150 L470 90 Z"
                    fill="#6B7280"
                  />
                  {/* Australia */}
                  <path
                    d="M550 240 L620 235 L630 270 L610 285 L570 280 L550 260 Z"
                    fill="#6B7280"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
