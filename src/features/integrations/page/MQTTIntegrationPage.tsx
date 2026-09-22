import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';

const data = [
  { name: 'Apr', value: 20 },
  { name: 'May', value: 75 },
  { name: 'Jun', value: 140 },
  { name: 'Jul', value: 75 },
  { name: 'Aug', value: 150 },
  { name: 'Sep', value: 67 },
  { name: 'Oct', value: 102 },
  { name: 'Nov', value: 120 },
  { name: 'Dec', value: 25 },
];

export const MQTTIntegrationPage = () => {
  return (
    <div>
      {/* Header section */}
      <div className="flex flex-col  md:flex-row justify-between   mb-6">
        <PageHeader
          title="MQTT Integration"
          description="Production Sensor Data Collection Via MQTT"
        />
        <div className="flex gap-3">
          <Button variant="primary" className="px-6 py-2 text-sm font-medium">
            Stop
          </Button>
          <Button variant="secondary" className="px-6 py-2 text-sm font-medium">
            Edit
          </Button>
          <Button variant="success" className="px-6 py-2 text-sm font-medium">
            Clone
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button className="px-4 py-1.5 bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm">
          Overview
        </button>
        <button className="px-4 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium rounded-md transition-colors">
          Configuration
        </button>
        <button className="px-4 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium rounded-md transition-colors">
          Logs
        </button>
        <button className="px-4 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium rounded-md transition-colors">
          Statistics
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Connection Status */}
        <div className="bg-white border-[1.5px] border-emerald-400 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-emerald-500 mb-2 uppercase tracking-wide">
            Connection Status
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span className="text-lg font-bold text-emerald-500">
              Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-1">
            Broker: mqtt.example.com:1883
          </p>
          <p className="text-xs text-slate-500">Uptime: 2d 14h 32m</p>
        </div>

        {/* Messages Today */}
        <div className="bg-white border-[1.5px] border-indigo-300 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wide">
            Messages Today
          </h3>
          <div className="text-2xl font-bold text-indigo-700 mb-2">2,847</div>
          <p className="text-xs text-slate-500 mb-1">
            Broker: mqtt.example.com:1883
          </p>
          <p className="text-xs text-slate-500">Uptime: 2d 14h 32m</p>
        </div>

        {/* Active Devices */}
        <div className="bg-white border-[1.5px] border-amber-300 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wide">
            Active Devices
          </h3>
          <div className="text-2xl font-bold text-amber-500 mb-2">47</div>
          <p className="text-xs text-slate-500 mb-1">
            Last seen: Temperature_Sensor_12
          </p>
          <p className="text-xs text-slate-500">2 devices offline</p>
        </div>

        {/* Data Rate */}
        <div className="bg-white border-[1.5px] border-indigo-300 rounded-lg p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wide">
            Data Rate
          </h3>
          <div className="text-2xl font-bold text-indigo-700 mb-2">
            84.2MB/h
          </div>
          <p className="text-xs text-slate-500 mb-1">Avg: 76.8 MB/h</p>
          <p className="text-xs text-slate-500">Processing lag: 0.2s</p>
        </div>
      </div>

      {/* Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Messages */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Recent Messages
          </h2>
          <ul className="space-y-3 text-xs text-slate-600 font-mono">
            <li className="flex gap-2">
              <span className="text-slate-400">&bull;</span>
              15:42:18 - temp_sensor_01: {'{'} "temperature": 23.4, "humidity":
              65.2 {'}'}
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400">&bull;</span>
              15:42:15 - pressure_01: {'{'} "pressure": 1013.25, "altitude":
              150.2 {'}'}
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400">&bull;</span>
              15:42:12 - motion_detector_03: {'{'} "motion": true, "timestamp":
              1234567890 {'}'}
            </li>
          </ul>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Configuration Summary
          </h2>
          <div className="grid grid-cols-[100px_1fr] gap-y-3 text-xs text-slate-600">
            <div className="font-medium">Host:</div>
            <div>mqtt.production.example.com</div>
            <div className="font-medium">Port:</div>
            <div>1883 (TCP), 8883 (SSL)</div>
            <div className="font-medium">Topics:</div>
            <div>sensors/+/telemetry, sensors/+/attributes</div>
            <div className="font-medium">QoS Level:</div>
            <div>1 (At least once delivery)</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 relative">
        <h2 className="text-base font-semibold text-slate-700 mb-6">
          Message Rate (Last 24 Hours)
        </h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                ticks={[0, 25, 50, 75, 100, 125, 150]}
              />
              <Line
                type="linear"
                dataKey="value"
                stroke="#c026d3"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0f172a', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute bottom-10 left-6">
          <ChevronLeft className="w-5 h-5 text-slate-900" />
        </div>
        <div className="absolute bottom-10 right-6">
          <ChevronRight className="w-5 h-5 text-slate-900" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-slate-500 pt-2 pb-8">
        <div>Integration running normally</div>
        <div>Last updated: 15:42:20</div>
      </div>
    </div>
  );
};

export default MQTTIntegrationPage;
