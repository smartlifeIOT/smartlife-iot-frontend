import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Thermometer, Droplets, Battery, Zap, Wifi } from 'lucide-react';
import type { MetricType, TelemetryWidgetConfig } from './TelemetryWidget';
import { availableDevices } from './TelemetryWidget';

interface TelemetryWidgetSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: TelemetryWidgetConfig;
  onSave: (config: TelemetryWidgetConfig) => void;
}

const metricOptions: {
  value: MetricType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'temperature',
    label: 'Temperature',
    icon: <Thermometer className="h-4 w-4 text-orange-500" />,
  },
  {
    value: 'humidity',
    label: 'Humidity',
    icon: <Droplets className="h-4 w-4 text-blue-500" />,
  },
  {
    value: 'battery',
    label: 'Battery',
    icon: <Battery className="h-4 w-4 text-green-500" />,
  },
  {
    value: 'power',
    label: 'Power',
    icon: <Zap className="h-4 w-4 text-yellow-500" />,
  },
  {
    value: 'signal',
    label: 'Signal',
    icon: <Wifi className="h-4 w-4 text-purple-500" />,
  },
];

export function TelemetryWidgetSettings({
  open,
  onOpenChange,
  config,
  onSave,
}: TelemetryWidgetSettingsProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(
    config.enabledMetrics || [
      'temperature',
      'humidity',
      'battery',
      'power',
      'signal',
    ]
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    config.deviceId || availableDevices[0].id
  );

  useEffect(() => {
    if (open) {
      setSelectedMetrics(
        config.enabledMetrics || [
          'temperature',
          'humidity',
          'battery',
          'power',
          'signal',
        ]
      );
      setSelectedDeviceId(config.deviceId || availableDevices[0].id);
    }
  }, [open, config.enabledMetrics, config.deviceId]);

  const handleMetricToggle = (metric: MetricType) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const handleSave = () => {
    onSave({
      ...config,
      enabledMetrics: selectedMetrics,
      deviceId: selectedDeviceId,
    });
    onOpenChange(false);
  };

  const handleSelectAll = () => {
    setSelectedMetrics(metricOptions.map((m) => m.value));
  };

  const handleDeselectAll = () => {
    setSelectedMetrics([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Telemetry Widget Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Device Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Device</Label>
            <Select
              value={selectedDeviceId}
              onValueChange={setSelectedDeviceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {availableDevices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metrics Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">
                Select Metrics to Display
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-xs"
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {metricOptions.map((metric) => (
                <div
                  key={metric.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Checkbox
                    id={metric.value}
                    checked={selectedMetrics.includes(metric.value)}
                    onChange={() => handleMetricToggle(metric.value)}
                  />
                  <Label
                    htmlFor={metric.value}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.label}</span>
                  </Label>
                </div>
              ))}
            </div>

            {selectedMetrics.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                ⚠️ At least one metric should be selected
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={selectedMetrics.length === 0}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
