import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeviceCapabilities,
  useDeviceLatestTelemetry,
} from '@/features/devices/hooks/useDeviceTelemetry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Eye, BarChart3, Settings2 } from 'lucide-react';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { devicesApi } from '@/services/api';
import toast from 'react-hot-toast';

export const DeviceControlTab: React.FC<{ deviceId: string }> = ({
  deviceId,
}) => {
  const { t } = useTranslation();
  const { data: capabilitiesData, isLoading: isLoadingCapabilities } =
    useDeviceCapabilities(deviceId);
  const { data: telemetryData, isLoading: isLoadingTelemetry } =
    useDeviceLatestTelemetry(deviceId);

  const capabilities = capabilitiesData?.data?.data?.data;
  const telemetry = telemetryData?.data?.data?.data || {};

  if (isLoadingCapabilities) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!capabilities || capabilities.uiComponents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Settings2 className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">
          No Controls Available
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-xs mt-2">
          This device doesn't have any dynamic UI components defined in its
          capabilities schema.
        </p>
      </div>
    );
  }

  const handleToggle = async (
    keys: string[],
    commandType: string,
    currentValue: any
  ) => {
    try {
      const newValue = currentValue === 'on' ? 'off' : 'on';
      const params: Record<string, any> = {};
      keys.forEach((key) => {
        params[key] = newValue;
      });

      await devicesApi.sendCommand(deviceId, commandType, params);
      toast.success(
        t('devices.details.control.commandSent', { command: commandType })
      );
    } catch (error) {
      toast.error(t('devices.details.control.commandFailed'));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {capabilities.uiComponents.map((comp, idx) => {
        const val = telemetry[comp.keys[0]];

        return (
          <div key={idx} className="h-full">
            {comp.type === 'gauge' ? (
              <GaugeChart
                value={Number(val) || 0}
                unit={comp.unit}
                title={comp.label}
                className="h-full border-slate-200 hover:shadow-md transition-shadow"
                size={180}
              />
            ) : (
              <Card className="h-full overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
                  <CardTitle className="text-sm font-medium">
                    {comp.label}
                  </CardTitle>
                  {comp.type === 'toggle' ? (
                    <Zap className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-blue-500" />
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  {comp.type === 'toggle' && (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            'text-2xl font-bold uppercase',
                            val === 'on' ? 'text-success' : 'text-slate-400'
                          )}
                        >
                          {val || '---'}
                        </span>
                        <span className="text-xs text-slate-500">
                          Current State
                        </span>
                      </div>
                      <Switch
                        checked={val === 'on'}
                        onCheckedChange={() =>
                          handleToggle(comp.keys, comp.command!, val)
                        }
                      />
                    </div>
                  )}

                  {comp.type === 'value' && (
                    <div className="flex flex-col">
                      <div className="text-3xl font-bold text-slate-900">
                        {val ?? '---'}
                        <span className="text-sm font-normal text-slate-500 ml-1">
                          {comp.unit}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {comp.keys.map((k) => (
                          <Badge
                            key={k}
                            variant="secondary"
                            className="text-[10px] font-mono py-0 px-1.5 h-4"
                          >
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper for classNames if not already imported
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
