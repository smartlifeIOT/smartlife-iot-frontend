import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/util';
import { Progress } from '@/components/ui/progress';
import DashboardNavigation from '@/components/ui/DashboardNavigation';

const trendData = [
  { time: '00:00', co2: 1.5, energy: 2.2, temp: 2.7 },
  { time: '04:00', co2: 2.2, energy: 2.5, temp: 2.9 },
  { time: '08:00', co2: 2.8, energy: 2.8, temp: 3.2 },
  { time: '12:00', co2: 3.5, energy: 3.1, temp: 3.5 },
  { time: '16:00', co2: 4.1, energy: 3.5, temp: 4.0 },
  { time: '20:00', co2: 3.5, energy: 3.2, temp: 3.8 },
  { time: '23:59', co2: 2.8, energy: 2.8, temp: 3.3 },
];

const devicesStatus = [
  {
    name: 'HVAC Controller #1',
    status: 'Online',
    lastSignal: '2 min ago',
    dotColor: 'bg-green-500',
  },
  {
    name: 'CO2 Sensor Array',
    status: 'Alert',
    lastSignal: '1 min ago',
    dotColor: 'bg-red-500',
  },
  {
    name: 'Energy Meter #2',
    status: 'Online',
    lastSignal: '30 sec ago',
    dotColor: 'bg-green-500',
  },
  {
    name: 'Temperature Sensors',
    status: 'Online',
    lastSignal: '45 sec ago',
    dotColor: 'bg-green-500',
  },
  {
    name: 'Ventilation System',
    status: 'Warning',
    lastSignal: '5 min ago',
    dotColor: 'bg-yellow-500',
  },
  {
    name: 'Lighting Controller',
    status: 'Online',
    lastSignal: '1 min ago',
    dotColor: 'bg-green-500',
  },
];

const alerts = [
  {
    id: 1,
    type: 'error',
    text: '14:23 - CO2 levels exceeded threshold (3.1 kg > 2.5 kg)',
    bgColor: 'bg-red-50 text-red-600',
  },
  {
    id: 2,
    type: 'warning',
    text: '13:45 - Energy consumption 18% above daily budget',
    bgColor: 'bg-orange-50 text-orange-600',
  },
  {
    id: 3,
    type: 'warning',
    text: '12:15 - Ventilation system performance degraded',
    bgColor: 'bg-orange-50 text-orange-600',
  },
];

const actions = [
  {
    id: 1,
    text: 'Increase ventilation rate by 15%',
    action: 'Apply',
    color: 'text-green-600 bg-green-50',
  },
  {
    id: 2,
    text: 'Optimize HVAC scheduling',
    action: 'Apply',
    color: 'text-green-600 bg-green-50',
  },
  {
    id: 3,
    text: 'Schedule maintenance check',
    action: 'Schedule',
    color: 'text-orange-600 bg-orange-50',
  },
];

export default function AnalyticsDashboardDetailsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeader
            title="Energy Management Dashboard"
            description="Building A - Production Floor | Last Updated: 1 hour ago"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary">
            <Download className="h-4 w-4" /> Download Report
          </Button>
          <Button variant="secondary">Configure</Button>
          <Button variant="success">Optimize</Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CO2 Emissions */}
        <Card className="   bg-primary text-white">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium ">Current CO2 Emissions</h3>
            <div className="flex flex-col items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold  ">3.1 kg</span>
              <p className="text-xs font-bold   flex items-center">
                <ArrowUpRight className="h-3 w-3" /> 24% from yesterday
              </p>
            </div>
            <p className="text-xs   mt-1">Threshold: 2.5 kg</p>
            <div className="mt-4">
              <Progress
                value={85}
                className="h-1.5 bg-gray-100 [&>div]:bg-rose-600"
              />
            </div>
            <p className="text-[10px]   mt-3">Peak: 3.4 kg at 13:45</p>
          </CardContent>
        </Card>
        {/* Energy Consumption */}
        <Card className=" bg-secondary text-white">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium ">Energy Consumption</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold  ">189 kWh</span>
              <span className="text-xs font-bold   flex items-center">
                <ArrowUpRight className="h-3 w-3" /> 18% from yesterday
              </span>
            </div>
            <p className="text-xs font-bold   flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 24% from yesterday
            </p>
            <p className="text-xs   mt-1">Budget: 160 kWh/day</p>
            <div className="mt-4">
              <Progress
                value={75}
                className="h-1.5 bg-gray-100 [&>div]:bg-rose-600"
              />
            </div>
            <p className="text-[10px]   mt-3">Projected: 196 kWh</p>
          </CardContent>
        </Card>
        {/* Temperature */}
        <Card className=" bg-success text-white">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium text-white">Temperature</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold ">22.8°C</span>
              <span className="text-xs font-bold   flex items-center">
                <ArrowDownRight className="h-3 w-3" /> 2% from yesterday
              </span>
            </div>
            <p className="text-xs font-bold   flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 24% from yesterday
            </p>
            <p className="text-xs   mt-1">Optimal: 20-24°C</p>
            <div className="mt-4">
              <Progress
                value={60}
                className="h-1.5 bg-gray-100 [&>div]:bg-rose-600"
              />
            </div>
            <p className="text-[10px]   mt-3">Variance: ±1.2°C</p>
          </CardContent>
        </Card>
        {/* System Efficiency */}
        <Card className="  overflow-hidden">
          <CardContent className="p-5 text-black">
            <h3 className="text-sm font-medium ">System Efficiency</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold  ">74%</span>
              <span className="text-xs font-bold   flex items-center">
                <ArrowDownRight className="h-3 w-3" /> 8% from yesterday
              </span>
            </div>
            <p className="text-xs font-bold   flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 24% from yesterday
            </p>
            <p className="text-xs   mt-1">Target: 85%</p>
            <div className="mt-4">
              <Progress
                value={74}
                className="h-1.5 bg-gray-100 [&>div]:bg-rose-600"
              />
            </div>
            <p className="text-[10px]   mt-3 font-medium">
              Optimization needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Trend Analysis */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-gray-800">
              24-Hour Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="left"
                    height={36}
                    iconType="plainline"
                    iconSize={12}
                  />
                  <ReferenceLine
                    y={2.5}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    label={{
                      position: 'right',
                      value: 'CO2 Threshold',
                      fill: '#ef4444',
                      fontSize: 10,
                    }}
                  />
                  <Line
                    name="CO2 Emissions (kg)"
                    type="monotone"
                    dataKey="co2"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    name="Energy (kWh)"
                    type="monotone"
                    dataKey="energy"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    name="Temperature (°C)"
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Connected Devices Status */}
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Connected Devices Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="w-full">
              <div className="grid grid-cols-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-100">
                <span>Device Name</span>
                <span>Status</span>
                <span className="text-right">Last Signal</span>
              </div>
              <div className="space-y-4 mt-4">
                {devicesStatus.map((device, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 items-center text-sm"
                  >
                    <span className="text-gray-700 font-medium">
                      {device.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          device.dotColor
                        )}
                      />
                      <span className="text-gray-600">{device.status}</span>
                    </div>
                    <span className="text-right text-gray-400 text-xs">
                      {device.lastSignal}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="link"
                className="text-secondary p-0 h-auto text-xs mt-6 font-medium flex items-center gap-1"
              >
                Configure Device Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts Notifications */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Recent Alerts Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-md',
                  alert.bgColor
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">{alert.text}</span>
                </div>
                <Button
                  variant="link"
                  className="text-blue-500 text-[10px] p-0 h-auto font-bold"
                >
                  View Details
                </Button>
              </div>
            ))}
            <Button
              variant="link"
              className="text-secondary p-0 h-auto text-xs mt-4 font-medium"
            >
              View All Alerts History
            </Button>
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-md',
                  action.color
                )}
              >
                <span className="text-xs font-medium">
                  {action.id}. {action.text}
                </span>
                <Button variant="secondary" size="sm">
                  {action.action}
                </Button>
              </div>
            ))}
            <Button
              variant="link"
              className="text-secondary p-0 h-auto text-xs mt-4 font-medium"
            >
              View Optimization Report
            </Button>
          </CardContent>
        </Card>
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
