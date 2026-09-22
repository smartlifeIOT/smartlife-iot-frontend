import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CreateConverterTemplatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    protocol: '',
    inputSchema: '{"Type": "Object", "Properties": {"Device Name": {"Type": "String"}, "Temperature": {"Type": "Number"}}}',
    outputMapping: '{"Device Name": "Device Name", "Telemetry": {"Temperature": "Temperature"}}',
    script: 'function Convert(input) {\n  // Your Conversion Logic Here\n  return {\n    DeviceName: input.DeviceName,\n    Telemetry: {\n      Temperature: input.Temperature\n    }\n  };\n}',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Converter Template Created:', formData);
    // TODO: API Call
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Create Converter Template</h1>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-600 font-medium">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter Converter Template Name"
                    className="h-11 bg-white border-slate-200"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-slate-600 font-medium">Converter Type *</Label>
                  <Select onValueChange={(val) => setFormData({ ...formData, type: val })}>
                    <SelectTrigger className="h-11 bg-white border-slate-200">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uplink">Uplink</SelectItem>
                      <SelectItem value="downlink">Downlink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-600 font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter Description.."
                    className="min-h-[100px] bg-white border-slate-200 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol" className="text-slate-600 font-medium">Protocol *</Label>
                  <Select onValueChange={(val) => setFormData({ ...formData, protocol: val })}>
                    <SelectTrigger className="h-11 bg-white border-slate-200">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mqtt">MQTT</SelectItem>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="coap">CoAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Input Schema</Label>
                  <Textarea
                    className="min-h-[120px] bg-slate-50/50 border-slate-200 font-mono text-xs p-4 leading-relaxed"
                    value={formData.inputSchema}
                    onChange={(e) => setFormData({ ...formData, inputSchema: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Output Mapping</Label>
                  <Textarea
                    className="min-h-[120px] bg-slate-50/50 border-slate-200 font-mono text-xs p-4 leading-relaxed"
                    value={formData.outputMapping}
                    onChange={(e) => setFormData({ ...formData, outputMapping: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Converter Script */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-slate-800">Converter Script</Label>
              <Textarea
                className="min-h-[150px] bg-slate-50/50 border-slate-200 font-mono text-xs p-6 leading-relaxed"
                value={formData.script}
                onChange={(e) => setFormData({ ...formData, script: e.target.value })}
              />
            </div>

            {/* Test Converter Action */}
            <Button 
              type="button"
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white h-12 text-lg font-semibold rounded-lg shadow-md transition-all active:scale-[0.98]"
            >
              Test Converter
            </Button>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 border-none px-8 h-10 font-medium"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-10 font-medium"
              >
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
