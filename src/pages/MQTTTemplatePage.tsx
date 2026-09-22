import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CheckCircle2 } from 'lucide-react';

export default function MQTTTemplatePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-slate-800">
            MQTT Integration Template
          </h1>
          <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Active
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit</Button>
          <Button variant="secondary">Deploy</Button>
          <Button variant="primary">Edit</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="w-full justify-start h-12 rounded-none px-0">
          <TabsTrigger
            value="configuration"
            className="rounded-none h-full px-8 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none"
          >
            Configuration
          </TabsTrigger>
          <TabsTrigger
            value="converters"
            className="rounded-none h-full px-8 text-indigo-200 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none"
          >
            Converters
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="rounded-none h-full px-8 text-indigo-200 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none"
          >
            Events
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="rounded-none h-full px-8 text-indigo-200 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white border-b-2 border-transparent transition-none"
          >
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
              <section className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-800">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Name</p>
                    <p className="text-slate-800 font-medium">
                      MQTT Integration Template
                    </p>
                  </div>
                  <div className="space-y-1 flex items-center gap-2 justify-end">
                    <p className="text-slate-500 font-medium text-right">
                      Status:
                    </p>
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-1 rounded-full text-[10px] font-medium">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Type:</p>
                    <p className="text-slate-800 font-medium">MQTT</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium text-right">
                      Created:
                    </p>
                    <p className="text-slate-800 font-medium text-right">
                      2024-01-10 09:15:00
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Edge Key:</p>
                    <p className="text-slate-800 font-medium">
                      Edge_prod_001_xyz789
                    </p>
                  </div>
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">
                  Connection Configuration
                </h3>
                <div className="grid grid-cols-2 gap-y-6 text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Broker Host:</p>
                    <p className="text-slate-800 font-medium">
                      Mqtt.Example.Com
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium text-right">
                      Port:
                    </p>
                    <p className="text-slate-800 font-medium text-right">
                      1883
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Client ID:</p>
                    <p className="text-slate-800 font-medium">
                      Edge_client_$EdgeId
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-medium text-right">
                      Keep Alive:
                    </p>
                    <p className="text-slate-800 font-medium text-right">
                      60 Seconds
                    </p>
                  </div>
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">
                  Topic Configuration
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-medium">
                      Subscribe Topics
                    </Label>
                    <div className="space-y-2">
                      <Input
                        value="Sensors/+/Telemetry"
                        className="bg-white border-slate-200 h-10 text-slate-500"
                        readOnly
                      />
                      <Input
                        value="Devices/+/Attributes"
                        className="bg-white border-slate-200 h-10 text-slate-500"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-medium">
                      Publish Topic:
                    </Label>
                    <Input
                      value="Devices/+/Attributes/common/set/${DeviceId}/Rpcutes"
                      className="bg-white border-slate-200 h-10 text-slate-500"
                      readOnly
                    />
                  </div>
                </div>
              </section>
            </div>
            {/* Right Column */}
            <div className="space-y-8 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">
                  Advanced Configuration
                </h3>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-slate-700">
                      Security
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-emerald-500 rounded flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                        <Label className="text-slate-600 font-medium cursor-pointer">
                          Enable SSL/TLS
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-slate-200 rounded" />
                        <Label className="text-slate-400 font-medium cursor-pointer">
                          Client Certificate Auth
                        </Label>
                      </div>
                    </div>

                    <div className="grid gap-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-medium">
                          Username
                        </Label>
                        <Input
                          value="Mqtt_user"
                          className="bg-slate-50 border-none h-10 text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-medium">
                          Password:
                        </Label>
                        <Input
                          value="********"
                          type="password"
                          className="bg-slate-50 border-none h-10 text-slate-500 "
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-slate-700">
                      Quality Of Service
                    </h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-medium">
                          Subscribe QoS:
                        </Label>
                        <Input
                          value="1 - At Least Once"
                          className="bg-slate-50 border-none h-10 text-slate-500"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-medium">
                          Publish QoS:
                        </Label>
                        <Input
                          value="0 - At Most Once"
                          className="bg-slate-50 border-none h-10 text-slate-500"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-slate-700">
                      Retry Configuration
                    </h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-medium">
                          Max Retry Attempts:
                        </Label>
                        <Input
                          value="3"
                          className="bg-slate-50 border-none h-10 text-slate-500"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 font-medium">
                          Retry Interval (Ms):
                        </Label>
                        <Input
                          value="5000"
                          className="bg-slate-50 border-none h-10 text-slate-500"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <Button variant="primary">Test Connection</Button>
                </div>
              </section>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
