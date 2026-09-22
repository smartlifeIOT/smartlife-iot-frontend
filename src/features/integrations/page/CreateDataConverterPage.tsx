import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowUp, ArrowDown, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/util';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';

export default function CreateDataConverterPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'uplink' | 'downlink'>(
    'uplink'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <PageHeader
          title="Add Data Converter"
          description="Create A New Data Transformation Converter"
        />
      </div>

      {/* Select Converter Type Section */}
      <Card className="    shadow-sm rounded-xl">
        <CardContent className="p-4 flex items-center justify-between bg-slate-50 rounded-xl">
          <div>
            <h2 className=" font-semibold text-slate-700">
              Select Converter Type
            </h2>
            <p className="text-sm text-slate-500">
              Choose The Direction Of Data Transformation
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-slate-600" />
        </CardContent>
      </Card>

      {/* Type Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Uplink Option */}
        <button
          onClick={() => setSelectedType('uplink')}
          className={cn(
            'text-left p-6 rounded-2xl border transition-all relative overflow-hidden',
            selectedType === 'uplink'
              ? 'border-green-500 bg-white shadow-sm ring-1 ring-green-500'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#4b3c8f] p-2 rounded-lg text-white">
              <ArrowUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#4b3c8f]">Uplink</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Process Incoming Device Data Transform
            <br />
            To Smart Life IoT Platform
          </p>
          {selectedType === 'uplink' && (
            <div className="flex items-center text-green-500 text-sm font-semibold">
              <Check className="h-4 w-4 mr-1" /> Selected
            </div>
          )}
        </button>

        {/* Downlink Option */}
        <button
          onClick={() => setSelectedType('downlink')}
          className={cn(
            'text-left p-6 rounded-2xl border transition-all relative overflow-hidden',
            selectedType === 'downlink'
              ? 'border-green-500 bg-white shadow-sm ring-1 ring-green-500'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#c25e9d] p-2 rounded-lg text-white">
              <ArrowDown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#c25e9d]">Downlink</h3>
          </div>
          <p className="text-sm text-slate-500">
            Process Outgoing Commands Transform
            <br />
            To Device Format
          </p>
          {selectedType === 'downlink' && (
            <div className="flex items-center text-green-500 text-sm font-semibold mt-6">
              <Check className="h-4 w-4 mr-1" /> Selected
            </div>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Configuration Form */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-slate-50">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-700">
              {selectedType === 'uplink' ? 'Uplink' : 'Downlink'} Converter
              Configuration
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="converter-name"
                className="text-slate-600 font-medium"
              >
                Converter Name *
              </Label>
              <Input
                id="converter-name"
                placeholder="My Custom Uplink Converter"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-slate-600 font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Converts Sensor Data From Custom Protocol to Smart Life IoT Platform Telemetry Format"
                className="bg-white min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="test-payload"
                className="text-slate-600 font-medium"
              >
                Test Payload
              </Label>
              <Input
                id="test-payload"
                placeholder='{"Device_Id":"Sensor001","Temp": 23.5, "Hum": 65.2}'
                className="bg-white font-mono text-xs"
              />
            </div>

            <Button className="bg-[#4b3c8f] hover:bg-[#3c2f70] text-white px-8">
              Test Decoder
            </Button>
          </CardContent>
        </Card>

        {/* Code Editor Mockup */}
        <div className="rounded-xl overflow-hidden shadow-lg bg-[#2b3544] border border-[#1e2532]">
          {/* Editor Header (macOS style) */}
          <div className="bg-[#1e2532] px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2 w-16">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="flex-1 text-center text-[#8e98a8] text-xs font-medium font-mono">
              decoder.js
            </div>
            <div className="w-16"></div> {/* spacer for centering */}
          </div>

          {/* Editor Content */}
          <div className="p-6 font-mono text-sm overflow-x-auto leading-relaxed">
            <pre className="text-[#aeb9c4]">
              <span className="text-[#56b6c2]">function</span>{' '}
              <span className="text-[#e5c07b]">Decoder</span>{' '}
              <span className="text-[#e06c75]">(payload, metadata)</span>{' '}
              {'{\n'}
              <span className="text-[#7f848e]"> // Parse incoming payload</span>
              {'\n'}
              <span className="text-[#56b6c2]"> var</span>{' '}
              <span className="text-[#e06c75]">data</span> ={' '}
              <span className="text-[#e5c07b]">JSON</span>.
              <span className="text-[#61afef]">parse</span>(payload);{'\n'}
              {'\n'}
              <span className="text-[#56b6c2]"> var</span>{' '}
              <span className="text-[#e06c75]">result</span> = {'{\n'}
              <span className="text-[#e06c75]"> deviceName</span> :
              data.device_id,{'\n'}
              <span className="text-[#e06c75]"> deviceType</span> :{' '}
              <span className="text-[#98c379]">'sensor'</span>,{'\n'}
              <span className="text-[#e06c75]"> telemetry</span>: {'{\n'}
              <span className="text-[#e06c75]"> temperature</span> : data.temp,
              {'\n'}
              <span className="text-[#e06c75]"> humidity</span> : data.hum{'\n'}
              {'    }\n'}
              {'  };\n'}
              <span className="text-[#c678dd]"> return</span> result;{'\n'}
              {'}'}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t mt-12 border-slate-200">
        <Button className="bg-[#4b3c8f] hover:bg-[#3c2f70] text-white min-w-[120px]">
          Create
        </Button>
        <Button className="bg-[#c25e9d] hover:bg-[#a64e85] text-white min-w-[120px]">
          Save Draft
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/integrations/data-converters')}
          className="bg-[#333333] hover:bg-[#1a1a1a] text-white min-w-[120px]"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
