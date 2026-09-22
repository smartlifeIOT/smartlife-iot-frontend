import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { Trash2, Zap, Mail, Pencil, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDeviceCapabilities } from '@/features/devices/hooks/useDeviceTelemetry';
import { Device } from '@/services/api/devices.api';
import { cn } from '@/lib/util';

interface ActionFormItemProps {
  index: number;
  devices: Device[];
  onRemove: () => void;
  errors?: any;
}

export const ActionFormItem: React.FC<ActionFormItemProps> = ({
  index,
  devices,
  onRemove,
  errors,
}) => {
  const { t } = useTranslation();
  const { control, watch, setValue, register } = useFormContext();

  const actionType = watch(`actions.${index}.type`);
  const deviceId = watch(`actions.${index}.deviceId`);
  const selectedCommandType = watch(`actions.${index}.command`);

  const { data: capabilitiesData, isLoading: isLoadingCapabilities } =
    useDeviceCapabilities(deviceId);
  const capabilities = capabilitiesData?.data?.data?.data;

  const availableCommands = capabilities?.commands || [];
  const selectedCommand = availableCommands.find(
    (c: any) => c.type === selectedCommandType
  );

  // Reset params when command changes
  useEffect(() => {
    if (selectedCommandType && actionType === 'control') {
      // We don't necessarily want to clear all params if they match,
      // but usually a command change means new params.
      // For now, let's keep it simple.
    }
  }, [selectedCommandType, actionType]);

  const renderParamInput = (param: any) => {
    const fieldName = `actions.${index}.params.${param.key}`;

    switch (param.type) {
      case 'select':
        return (
          <div key={param.key} className="space-y-1">
            <Label className="text-[10px] text-gray-400 uppercase">
              {param.label}
            </Label>
            <Controller
              name={fieldName}
              control={control}
              defaultValue={param.default}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder={`Select ${param.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options?.map((opt: any) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        textValue={opt.label}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        );
      case 'number':
        return (
          <div key={param.key} className="space-y-1">
            <Label className="text-[10px] text-gray-400 uppercase">
              {param.label}
            </Label>
            <Input
              type="number"
              className="h-8 text-xs bg-white"
              min={param.min}
              max={param.max}
              {...register(fieldName, { valueAsNumber: true })}
            />
          </div>
        );
      case 'switch':
      case 'boolean':
        return (
          <div
            key={param.key}
            className="flex items-center justify-between py-2"
          >
            <Label className="text-xs text-gray-500">{param.label}</Label>
            <Controller
              name={fieldName}
              control={control}
              defaultValue={param.default || false}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        );
      default:
        return (
          <div key={param.key} className="space-y-1">
            <Label className="text-[10px] text-gray-400 uppercase">
              {param.label}
            </Label>
            <Input className="h-8 text-xs bg-white" {...register(fieldName)} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
          Action {index + 1}:{' '}
          {actionType === 'control'
            ? 'Device Control'
            : actionType === 'notification'
              ? 'Send Notification'
              : actionType === 'setValue'
                ? 'Set Value'
                : 'Webhook'}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Action Type Selector */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-500">
            Action Type:
          </span>
          <div className="flex bg-slate-100 p-1.5 rounded-lg gap-1 w-fit">
            {[
              { value: 'control', label: 'Device Control', icon: Zap },
              { value: 'notification', label: 'Notification', icon: Mail },
              { value: 'setValue', label: 'Set Value', icon: Pencil },
              { value: 'webhook', label: 'Webhook', icon: Globe },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue(`actions.${index}.type`, type.value)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  actionType === type.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <type.icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {actionType === 'control' && (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">
                  Target Device
                </Label>
                <Controller
                  name={`actions.${index}.deviceId`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={cn(
                          'w-full bg-slate-50 border-slate-200',
                          errors?.deviceId && 'border-red-500'
                        )}
                      >
                        <SelectValue placeholder="Select Device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors?.deviceId && (
                  <p className="text-[10px] text-red-500">Device is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">
                  Command
                </Label>
                <Controller
                  name={`actions.${index}.command`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!deviceId || isLoadingCapabilities}
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                        <SelectValue
                          placeholder={
                            isLoadingCapabilities
                              ? 'Loading...'
                              : !deviceId
                                ? 'Select device first'
                                : 'Select Command'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCommands.map((c) => (
                          <SelectItem key={c.type} value={c.type}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {selectedCommand && selectedCommand.params.length > 0 && (
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Command Parameters
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedCommand.params.map((param) =>
                    renderParamInput(param)
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">
                  Delay
                </Label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    className="w-20 rounded-r-none bg-slate-50 border-slate-200"
                    {...register(`actions.${index}.delay`, {
                      valueAsNumber: true,
                    })}
                  />
                  <div className="px-3 py-2 bg-slate-100 text-slate-500 text-xs border border-l-0 border-slate-200 rounded-r-md">
                    Seconds
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">
                  Priority
                </Label>
                <Controller
                  name={`actions.${index}.priority`}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {actionType === 'notification' && (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">
                  Message
                </Label>
                <Input
                  className="bg-slate-50 border-slate-200"
                  placeholder="Notification message..."
                  {...register(`actions.${index}.message`)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Recipients
                  </Label>
                  <Input
                    className="bg-slate-50 border-slate-200"
                    placeholder="email@example.com or user-uuid"
                    {...register(`actions.${index}.recipients.0`)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Channel
                  </Label>
                  <Controller
                    name={`actions.${index}.channel`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select Channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="Push">
                            Push Notification
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {actionType === 'webhook' && (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">
                  Webhook URL
                </Label>
                <Input
                  className="bg-slate-50 border-slate-200"
                  placeholder="https://api.example.com/webhook"
                  {...register(`actions.${index}.webhookUrl`)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">
                  HTTP Method
                </Label>
                <Controller
                  name={`actions.${index}.webhookMethod`}
                  control={control}
                  defaultValue="POST"
                  render={({ field }) => (
                    <Select
                      value={field.value || 'POST'}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">
                Webhook Payload / Message
              </Label>
              <Input
                className="bg-slate-50 border-slate-200 font-mono text-xs"
                placeholder='{"alert": "high_temperature", "value": "{{temperature}}"}'
                {...register(`actions.${index}.message`)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
