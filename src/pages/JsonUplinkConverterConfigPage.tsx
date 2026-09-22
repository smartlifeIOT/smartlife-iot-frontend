import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

const converterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  protocol: z.string().min(1, 'Protocol is required'),
  enableValidation: z.boolean(),
  skipInvalid: z.boolean(),
  enableDebug: z.boolean(),
  inputFormat1: z.string().min(1, 'Input format is required'),
  inputFormat2: z.string().min(1, 'Output mapping is required'),
});

type ConverterFormValues = z.infer<typeof converterSchema>;

export default function JsonUplinkConverterConfigPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ConverterFormValues>({
    resolver: zodResolver(converterSchema),
    defaultValues: {
      name: 'JSON Uplink Converter',
      type: 'uplink',
      protocol: 'lorawan',
      enableValidation: true,
      skipInvalid: false,
      enableDebug: false,
      inputFormat1:
        '{"type": "object", "properties": {"device Name": {"type": "string", "description": "Device identifier"}, "temperature": {"type": "number"}, "humidity": {"type": "number"}}',
      inputFormat2:
        '{"deviceName": "$device.name", "deviceType": "LoRaWAN_Sensor", "telemetry": {"temperature": "$temperature", "humidity": "$humidity", "timestamp": "$timestamp || Date.now()"}, "attributes": {"lastSeen": "Date.now()"}}',
    },
  });

  const onSave: SubmitHandler<ConverterFormValues> = (data) => {
    console.log('Converter Config Saved:', data);
    // TODO: API Integration
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">
            JSON Uplink Converter - Configuration
          </h1>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="w-full justify-start h-12 rounded-none px-0">
            <TabsTrigger
              value="overview"
              className="rounded-none h-full px-10 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none font-semibold text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="configuration"
              className="rounded-none h-full px-10 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none font-semibold text-sm"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="rounded-none h-full px-10   data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none font-semibold text-sm"
            >
              Test
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none h-full px-10   data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none font-semibold text-sm"
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="configuration"
            className="mt-8 space-y-8 animate-in fade-in duration-500 outline-none"
          >
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800">
                Basic Settings
              </h3>
              <Card className="border-slate-200 shadow-none">
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Column - Inputs */}
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-8">
                          <Label className="font-semibold w-24">Name:</Label>
                          <Input
                            {...register('name')}
                            className={`flex-1 border rounded-md ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-xs text-red-500 ml-32">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-8">
                        <Label className="font-semibold w-24">Type:</Label>
                        <Controller
                          name="type"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              className="w-full"
                            >
                              <SelectTrigger className="flex-1 bg-slate-50 border-slate-200 h-11 font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="uplink">Uplink</SelectItem>
                                <SelectItem value="downlink">
                                  Downlink
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-8">
                        <Label className="font-semibold w-24">Protocol:</Label>
                        <Controller
                          name="protocol"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              className="w-full "
                            >
                              <SelectTrigger className="flex-1 bg-slate-50 border-slate-200 h-11 font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lorawan">LoRaWAN</SelectItem>
                                <SelectItem value="mqtt">MQTT</SelectItem>
                                <SelectItem value="http">HTTP</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Right Column - Toggles */}
                    <div className="space-y-8 pt-2">
                      <Controller
                        name="enableValidation"
                        control={control}
                        render={({ field }) => (
                          <div
                            className="flex items-center gap-4 group cursor-pointer"
                            onClick={() => field.onChange(!field.value)}
                          >
                            <div
                              className={`h-6 w-6 rounded flex items-center justify-center transition-all ${field.value ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-200'}`}
                            >
                              {field.value && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <Label
                              className={`text-slate-700 font-semibold cursor-pointer transition-colors ${field.value ? 'text-slate-900' : 'text-slate-400'}`}
                            >
                              Enable Input Validation
                            </Label>
                          </div>
                        )}
                      />

                      <Controller
                        name="skipInvalid"
                        control={control}
                        render={({ field }) => (
                          <div
                            className="flex items-center gap-4 group cursor-pointer"
                            onClick={() => field.onChange(!field.value)}
                          >
                            <div
                              className={`h-6 w-6 rounded flex items-center justify-center transition-all ${field.value ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-200'}`}
                            >
                              {field.value && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <Label
                              className={`text-slate-700 font-semibold cursor-pointer transition-colors ${field.value ? 'text-slate-900' : 'text-slate-400'}`}
                            >
                              Skip Invalid Messages
                            </Label>
                          </div>
                        )}
                      />

                      <Controller
                        name="enableDebug"
                        control={control}
                        render={({ field }) => (
                          <div
                            className="flex items-center gap-4 group cursor-pointer"
                            onClick={() => field.onChange(!field.value)}
                          >
                            <div
                              className={`h-6 w-6 rounded flex items-center justify-center transition-all ${field.value ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-200'}`}
                            >
                              {field.value && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <Label
                              className={`text-slate-700 font-semibold cursor-pointer transition-colors ${field.value ? 'text-slate-900' : 'text-slate-400'}`}
                            >
                              Enable Debug Logging
                            </Label>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Input Format Blocks */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  Input Format:
                </h3>
                <Card className="border-slate-200 shadow-none">
                  <CardContent className="p-8">
                    <textarea
                      {...register('inputFormat1')}
                      className="w-full min-h-[100px] bg-white border-none focus:ring-0 text-slate-500 font-mono text-sm leading-relaxed resize-none outline-none"
                    />
                  </CardContent>
                </Card>
                {errors.inputFormat1 && (
                  <p className="text-xs text-red-500">
                    {errors.inputFormat1.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  Input Format:
                </h3>
                <Card className="border-slate-200 shadow-none">
                  <CardContent className="p-8">
                    <textarea
                      {...register('inputFormat2')}
                      className="w-full min-h-[140px] bg-white border-none focus:ring-0 text-slate-500 font-mono text-sm leading-relaxed resize-none outline-none"
                    />
                  </CardContent>
                </Card>
                {errors.inputFormat2 && (
                  <p className="text-xs text-red-500">
                    {errors.inputFormat2.message}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
