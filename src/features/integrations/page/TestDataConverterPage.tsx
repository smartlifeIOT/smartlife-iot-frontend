import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';

export const TestDataConverterPage = () => {
  const [selectedDay, setSelectedDay] = useState(7);

  return (
    <div className=" ">
      {/* Header section */}
      <div className="mb-6">
        <PageHeader
          title="Test Data Converter: JSON Parser"
          description="Test Your Decoder Function With Sample Payloads And Validate Output"
        />
      </div>
      {/* Time Range Bar (from design) */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-md bg-white border border-slate-200">
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
      {/* Test Controls */}
      <div className="bg-white   items-center border border-slate-200 rounded-lg p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 ">
          Test Controls
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Run Test</Button>
          <Button variant="outline">Clear All</Button>
          <Button variant="secondary">Load Sample</Button>
          <Button variant="success">Save Test Case</Button>
        </div>
      </div>
      {/* Input / Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Input</h2>
            <p className="text-xs text-slate-500 mt-1">Test Payload *</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 h-64 overflow-auto">
            <pre className="text-sm text-slate-600 font-mono whitespace-pre-wrap">
              {`{
  "DeviceId": "Sensor_001",
  "Timestamp": 1717235567000,
  "Data": {
    "Temperature": 25.6,
    "Humidity": 60.2,
    "Pressure": 1013.25
  }
}`}
              {/*  */}
            </pre>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center justify-between">
              Output
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span className="text-emerald-500 font-bold">✓</span> Success
              </span>
              <span className="text-xs text-slate-500">
                Execution Time: 12ms
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Parsed Telemetry</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 h-64 overflow-auto">
            <pre className="text-sm text-slate-600 font-mono whitespace-pre-wrap">
              {`[{
  "Ts": 1717235567000,
  "Values": {
    "Temperature": 25.6,
    "Humidity": 60.2
  }
}]`}
            </pre>
          </div>
        </div>
      </div>
      {/* Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Metadata (Optional)
            </h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 h-48 overflow-auto">
            <pre className="text-sm text-slate-600 font-mono whitespace-pre-wrap">
              {`{
  "DeviceType": "Weather_station",
  "CustomerName": "Dubai Mall"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDataConverterPage;
