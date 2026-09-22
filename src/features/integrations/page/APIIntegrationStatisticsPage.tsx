import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useState } from 'react';

const volumeData = [
  { name: 'Apr', value: 65 },
  { name: 'May', value: 80 },
  { name: 'Jun', value: 78 },
  { name: 'Jul', value: 102 },
  { name: 'Aug', value: 90 },
  { name: 'Sep', value: 100 },
  { name: 'Oct', value: 120 },
  { name: 'Nov', value: 115 },
  { name: 'Dec', value: 82 },
];

const responseTimeData = [
  { name: '20/6', value: 20 },
  { name: '21/6', value: 50 },
  { name: '21/6', value: 40 },
  { name: '22/6', value: 60 },
  { name: '22/6', value: 55 },
  { name: '23/6', value: 80 },
  { name: '23/6', value: 75 },
  { name: '24/6', value: 85 },
  { name: '24/6', value: 70 },
  { name: '25/6', value: 95 },
  { name: '25/6', value: 65 },
  { name: '26/6', value: 110 },
];

export const APIIntegrationStatisticsPage = () => {
  const [selectedDay, setSelectedDay] = useState(7);
  return (
    <div className=" ">
      {/* Header section */}
      <div className="mb-6">
        <PageHeader
          title="Integration Statistics: Weather API"
          description="Type: HTTP | Status: Active | Last Activity: 2 Minutes Ago"
        />

        <div className="flex mt-3 gap-2">
          <Button variant="primary">Configuration</Button>
          <Button variant="secondary">Edit</Button>
          <Button variant="outline">Clone</Button>
        </div>
      </div>
      {/* Time Range Bar */}
      <div className="flex items-center gap-4 mb-6 p-4  rounded-md  bg-white shadow-sm">
        <span className="text-sm font-semibold text-slate-700">
          Time Range:
        </span>
        <div className="flex gap-2">
          {[1, 7, 30].map((day: number) => (
            <button
              onClick={() => setSelectedDay(day)}
              key={day}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedDay === day
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Last {day} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Messages */}
        <div className="bg-primary text-white  rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold   mb-1">Total Messages</h3>
          <div className="text-2xl font-bold   mb-2">8,456</div>
          <p className="text-xs  ">↑ 12% vs last week</p>
        </div>

        {/* Success Rate */}
        <div className="bg-secondary text-white  rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold   mb-1">Success Rate</h3>
          <div className="text-2xl font-bold   mb-2">98.7%</div>
          <p className="text-xs  ">↑ 0.3% vs last week</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-success text-white  rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold   mb-1">Avg Response Time</h3>
          <div className="text-2xl font-bold   mb-2">1.2s</div>
          <p className="text-xs  ">↑ 0.2s vs last week</p>
        </div>

        {/* Error Rate */}
        <div className="  bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold   mb-1">Error Rate</h3>
          <div className="text-2xl font-bold   mb-2">1.3%</div>
          <p className="text-xs  ">↓ 0.3% vs last week</p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-6">
        {/* Message Volume Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
          <h2 className="text-sm font-semibold text-slate-700 mb-6">
            Message Volume (Last 7 Days)
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={volumeData}
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
                  dy={15}
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
                  dot={{ r: 3, fill: '#0f172a', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-6">
            Response Time Trend
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={responseTimeData}
                margin={{ top: 10, right: 0, left: -20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={true}
                  horizontal={false}
                  stroke="#e2e8f0"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  dy={15}
                  interval="preserveStartEnd"
                />
                <YAxis hide={true} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
                {/* Active point indicator */}
                <circle
                  cx="85%"
                  cy="60%"
                  r="4"
                  fill="#4f46e5"
                  stroke="#fff"
                  strokeWidth={2}
                />
                <line
                  x1="85%"
                  y1="60%"
                  x2="85%"
                  y2="100%"
                  stroke="#4f46e5"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Information */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 mb-6">
        {/* Error Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">
            Error Distribution
          </h2>
          <ul className="space-y-4 text-xs font-medium text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Timeout Errors (45%)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              Rate Limit (28%)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Server Errors (18%)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Other (9%)
            </li>
          </ul>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">
                Peak Messages/Hour:
              </span>
              <span className="text-sky-600 font-semibold">1,247</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">
                Min Response Time:
              </span>
              <span className="text-emerald-500 font-semibold">0.2s</span>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">
                Average Messages/Hour:
              </span>
              <span className="text-sky-600 font-semibold">892</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">
                Max Response Time:
              </span>
              <span className="text-rose-500 font-semibold">8.7s</span>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">
                Data Transferred:
              </span>
              <span className="text-slate-700 font-semibold">245.8 MB</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">
                P95 Response Time:
              </span>
              <span className="text-emerald-500 font-semibold">2.1s</span>
            </div>

            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">Uptime:</span>
              <span className="text-emerald-500 font-semibold">99.8%</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center">
              <span className="text-slate-500 font-medium">
                Total Requests:
              </span>
              <span className="text-sky-600 font-semibold">12,847</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default APIIntegrationStatisticsPage;
