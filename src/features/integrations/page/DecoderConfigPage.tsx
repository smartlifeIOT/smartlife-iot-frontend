import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';

export const DecoderConfigPage = () => {
  const [selectedDay, setSelectedDay] = useState(7);

  return (
    <div className=" ">
      {/* Header section */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <PageHeader
          title="Data Converter: JSON Parser"
          description="Type: Uplink | Last Modified: 2024-05-30 10:45 AM | Status: Active"
        />

        <div className="flex mt-3 md:mt-0 gap-2">
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Test</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>

      {/* Time Range Bar (from design) */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-md bg-white border border-slate-200 shadow-sm">
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
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Last {day === 1 ? '24h' : day + 'd'}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                defaultValue="JSON Parser"
                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Type *
              </label>
              <select className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:ring-primary focus:border-primary bg-white">
                <option>Uplink</option>
                <option>Downlink</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              defaultValue="Converts JSON payload to telemetry data"
              className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:ring-primary focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Decoder Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Decoder Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            JavaScript Decoder Function *
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-slate-300">
            <span className="text-amber-400">function</span>{' '}
            <span className="text-blue-400">Decoder</span>(payload, metadata){' '}
            {'{\n'}
            <span className="text-slate-500">
              {' '}
              // Parse incoming JSON payload
            </span>
            {'\n'}
            <span className="text-amber-400"> var</span> data ={' '}
            <span className="text-blue-300">JSON</span>.
            <span className="text-blue-400">parse</span>(payload);{'\n'}
            <span className="text-slate-500"> // Extract telemetry values</span>
            {'\n'}
            <span className="text-amber-400"> var</span> telemetry = [];{'\n'}
            <span className="text-amber-400"> if</span> (data.temperature !=={' '}
            <span className="text-amber-400">undefined</span>) {'{\n'}
            {'    '}telemetry.<span className="text-blue-400">push</span>(
            {'{\n'}
            {'      '}
            <span className="text-green-400">'ts'</span>:{' '}
            <span className="text-amber-400">new</span>{' '}
            <span className="text-blue-300">Date</span>().
            <span className="text-blue-400">getTime</span>(),{'\n'}
            {'      '}
            <span className="text-green-400">'values'</span>: {'{\n'}
            {'        '}
            <span className="text-green-400">'temperature'</span>:
            data.temperature{'\n'}
            {'      }\n'}
            {'    })\n'}
            {'  }\n'}
            <span className="text-amber-400"> return</span> telemetry;{'\n'}
            {'}'}
          </pre>
        </div>
      </div>

      {/* Bottom Section: Test Decoder & Expected Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Test Decoder */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Test Decoder
            </h2>
          </div>
          <div className="mb-4">
            <textarea
              rows={4}
              defaultValue={
                '{"temperature": 25.6, "humidity": 60.2, "pressure": 1013.25, "DeviceId": "Sensor_001"}'
              }
              className="w-full text-xs font-mono py-3 px-3 border border-slate-200 rounded-md focus:ring-primary focus:border-primary resize-none text-slate-600"
            />
          </div>
          <Button
            variant="outline"
            className="bg-slate-800 text-white hover:bg-slate-900 border-transparent px-8"
          >
            Test
          </Button>
        </div>

        {/* Expected Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800 ">
              Expected Output
            </h2>
          </div>
          <div>
            <textarea
              rows={4}
              readOnly
              defaultValue={
                '[{"ts": 1717235567000, "values": {"temperature": 25.6}} ]'
              }
              className="w-full text-xs font-mono py-3 px-3 border border-slate-200 rounded-md focus:ring-primary focus:border-primary resize-none text-emerald-500 bg-emerald-50/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecoderConfigPage;
