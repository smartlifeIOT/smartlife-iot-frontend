import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDevices } from '@/features/devices/hooks/useDevices';
import { useDeviceLatestTelemetry } from '@/features/devices/hooks/useDeviceTelemetry';
import { flattenObject } from '@/utils/helpers/FlattenObject';
import { cn } from '@/lib/util';
import {
  Search,
  Loader2,
  Info,
  Activity,
  ToggleLeft,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';

export const TriggerStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const triggerErrors = errors.trigger as any;
  const { data: devicesData } = useDevices({ limit: 100 });
  const devices = devicesData?.data?.data?.data || [];
  const [searchTerm, setSearchTerm] = useState('');

  const triggerData = watch('trigger');

  const { data: telemetryData, isLoading: isLoadingTelemetry } =
    useDeviceLatestTelemetry(triggerData?.deviceId);

  const { availableTelemetryKeys, telemetryMap, rawTelemetry } = useMemo(() => {
    const rawData =
      telemetryData?.data?.data?.data ||
      telemetryData?.data?.data ||
      telemetryData?.data ||
      {};

    const map: Record<string, any> = {};
    const keysList: Array<{
      key: string;
      label: string;
      type: 'number' | 'string' | 'boolean';
      unit?: string;
      enum?: string[];
      value?: any;
    }> = [];

    const ignoredFields = new Set([
      'id',
      '_id',
      'deviceId',
      'deviceKey',
      'timestamp',
      'createdAt',
      'updatedAt',
      'metadata',
      '__v',
    ]);

    const entries: [string, any][] = [];

    if (
      rawData.data &&
      typeof rawData.data === 'object' &&
      !Array.isArray(rawData.data)
    ) {
      entries.push(...flattenObject(rawData.data));
    }

    Object.entries(rawData).forEach(([k, v]) => {
      if (!ignoredFields.has(k) && k !== 'data') {
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
          entries.push(...flattenObject(v, k));
        } else {
          entries.push([k, v]);
        }
      }
    });

    const seenKeys = new Set<string>();
    entries.forEach(([key, val]) => {
      if (!seenKeys.has(key) && !ignoredFields.has(key)) {
        seenKeys.add(key);
        map[key] = val;

        const valType = typeof val;
        let inferredType: 'number' | 'string' | 'boolean' = 'string';
        let enumVals: string[] | undefined = undefined;

        if (
          valType === 'number' ||
          (!isNaN(Number(val)) &&
            val !== '' &&
            val !== null &&
            valType !== 'boolean')
        ) {
          inferredType = 'number';
        } else if (
          valType === 'boolean' ||
          val === 'true' ||
          val === 'false' ||
          val === 'on' ||
          val === 'off'
        ) {
          inferredType = 'boolean';
          enumVals = ['true', 'false', 'on', 'off'];
        }

        const label = key
          .split('.')
          .map((part) =>
            part
              .replace(/([A-Z])/g, ' $1')
              .replace(/[_-]/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())
              .trim()
          )
          .join(' → ');

        let unit: string | undefined = undefined;
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('temp')) unit = '°C';
        else if (lowerKey.includes('humidity')) unit = '%';
        else if (lowerKey.includes('battery')) unit = '%';
        else if (lowerKey.includes('voltage') || lowerKey.includes('volt'))
          unit = 'V';
        else if (lowerKey.includes('current') || lowerKey.includes('amp'))
          unit = 'A';
        else if (lowerKey.includes('power') || lowerKey.includes('watt'))
          unit = 'W';
        else if (lowerKey.includes('pressure')) unit = 'hPa';
        else if (lowerKey.includes('rssi') || lowerKey.includes('signal'))
          unit = 'dBm';

        keysList.push({
          key,
          label: label || key,
          type: inferredType,
          unit,
          enum: enumVals,
          value: val,
        });
      }
    });

    return {
      availableTelemetryKeys: keysList,
      telemetryMap: map,
      rawTelemetry: rawData,
    };
  }, [telemetryData]);

  const triggerTypes = [
    { id: 'threshold', label: 'Device Data' },
    { id: 'schedule', label: 'Device Schedule Data' },
    { id: 'manual', label: 'Manual' },
    { id: 'event', label: 'API Event' },
  ];

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const filteredDevices = devices.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sync operator based on attribute type
  useEffect(() => {
    const selectedKey = availableTelemetryKeys.find(
      (k) => k.key === triggerData?.telemetryKey
    );
    if (
      selectedKey &&
      selectedKey.type !== 'number' &&
      triggerData?.operator !== 'eq'
    ) {
      setValue('trigger.operator', 'eq');
    }
  }, [
    triggerData?.telemetryKey,
    availableTelemetryKeys,
    triggerData?.operator,
    setValue,
  ]);

  return (
    <div className="py-2 border border-slate-200 rounded-lg p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Configure Trigger
      </h2>
      <div className="flex items-center gap-2 mb-6">
        {triggerTypes.map((type) => (
          <Button
            key={type.id}
            variant={triggerData?.type === type.id ? 'default' : 'primary'}
            className={cn(
              'px-4 text-xs rounded-md transition-all hover:bg-primary hover:text-white',
              triggerData?.type === type.id
                ? 'bg-primary text-white'
                : 'bg-slate-50 text-slate-800'
            )}
            onClick={() => setValue('trigger.type', type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Device *</Label>
            <div
              className={cn(
                'border border-slate-200 rounded-lg p-2 min-h-[150px] space-y-2',
                triggerErrors?.deviceId && 'border-destructive'
              )}
            >
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search and select device..."
                  className="pl-8 border focus-visible:ring-0 shadow-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {filteredDevices.map((device) => (
                  <div
                    key={device.id}
                    className={cn(
                      'flex items-center gap-2 p-2 border-b border-slate-200 cursor-pointer text-sm transition-colors',
                      triggerData?.deviceId === device.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent'
                    )}
                    onClick={() => {
                      if (triggerData?.deviceId !== device.id) {
                        setValue('trigger.deviceId', device.id, {
                          shouldValidate: true,
                        });
                        setValue('trigger.telemetryKey', '');
                        setValue('trigger.value', '');
                        console.log(device.id, 'Device ID');
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full bg-gray-400',
                        triggerData?.deviceId === device.id && 'bg-primary'
                      )}
                    />
                    {device.name}
                  </div>
                ))}
              </div>
            </div>
            {triggerErrors?.deviceId && (
              <p className="text-xs text-destructive mt-1">
                Device selection is required
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Attribute/Parameter *</Label>
            <Controller
              name="trigger.telemetryKey"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      'w-full bg-white',
                      triggerErrors?.telemetryKey && 'border-destructive'
                    )}
                    disabled={isLoadingTelemetry || !triggerData?.deviceId}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingTelemetry
                          ? 'Loading telemetry keys...'
                          : !triggerData?.deviceId
                            ? 'Select device first'
                            : 'Select attribute'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTelemetry ? (
                      <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching telemetry...
                      </div>
                    ) : availableTelemetryKeys.length > 0 ? (
                      availableTelemetryKeys.map((item) => (
                        <SelectItem
                          key={item.key}
                          value={item.key}
                          textValue={`${item.label}${item.unit ? ` (${item.unit})` : ''}`}
                        >
                          {item.label} {item.unit ? `(${item.unit})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-muted-foreground text-center">
                        {triggerData?.deviceId
                          ? 'No telemetry keys found'
                          : 'Please select a device'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {triggerErrors?.telemetryKey && (
              <p className="text-xs text-destructive mt-1">
                Attribute is required
              </p>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-6 shadow-sm">
            <h4 className="font-semibold mb-1 text-gray-700">
              Advanced Settings
            </h4>

            <div className="">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Controller
                    name="trigger.enableDebounce"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="debounce"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="debounce"
                    className="text-sm font-normal text-gray-500"
                  >
                    Enable debounce (prevent rapid triggering)
                  </Label>
                </div>
                {watch('trigger.enableDebounce') && (
                  <div className="flex items-center gap-2 ml-6 animate-in slide-in-from-left-2 duration-200">
                    <span className="text-xs text-gray-400">
                      Debounce time:
                    </span>
                    <Input
                      className="w-16 h-8 text-center text-xs"
                      type="number"
                      {...register('trigger.debounce', { valueAsNumber: true })}
                    />
                    <span className="text-xs text-gray-400">Seconds</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Controller
                    name="trigger.activeHoursEnabled"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="hours-enabled"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="hours-enabled"
                    className="text-sm font-normal text-gray-500"
                  >
                    Only trigger during specific hours
                  </Label>
                </div>
                {watch('trigger.activeHoursEnabled') && (
                  <div className="space-y-3 animate-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center gap-2 ml-6 text-xs text-gray-900">
                      <span>From:</span>
                      <Input
                        className="w-16 h-8 text-center"
                        {...register('trigger.activeHours.start')}
                      />
                      <span>To:</span>
                      <Input
                        className="w-16 h-8 text-center"
                        {...register('trigger.activeHours.end')}
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-6 pt-1">
                      <span className="text-xs text-gray-500 mr-1">Days:</span>
                      {days.map((day, i) => {
                        const dayValue = i + 1;
                        const isActive =
                          watch('trigger.activeDays')?.includes(dayValue);
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              const currentDays =
                                watch('trigger.activeDays') || [];
                              const newDays = isActive
                                ? currentDays.filter(
                                    (d: number) => d !== dayValue
                                  )
                                : [...currentDays, dayValue];
                              setValue('trigger.activeDays', newDays);
                            }}
                            className={cn(
                              'w-6 h-6 rounded flex items-center justify-center text-[10px] font-semibold border transition-colors cursor-pointer',
                              isActive
                                ? 'bg-primary/20 text-primary border-primary/30'
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                            )}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="my-6 relative">
        {(() => {
          if (!triggerData?.deviceId || !triggerData?.telemetryKey) {
            return (
              <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all hover:border-primary/30 group">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Target className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Awaiting Selection
                </p>
                <p className="text-[10px] text-slate-400 mt-2 max-w-[200px] text-center leading-relaxed">
                  Choose a device and attribute above to start configuring your
                  smart trigger
                </p>
              </div>
            );
          }

          if (isLoadingTelemetry) {
            return (
              <div className="flex flex-col items-center justify-center py-12 gap-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                  <Zap className="w-5 h-5 text-primary absolute inset-0 m-auto animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">
                  Syncing Telemetry Data...
                </span>
              </div>
            );
          }
          const selectedKey = availableTelemetryKeys.find(
            (k) => k.key === triggerData?.telemetryKey
          );
          const isNumeric = selectedKey?.type === 'number';
          const currentValue =
            telemetryMap[triggerData?.telemetryKey] ??
            (rawTelemetry as any)?.[triggerData?.telemetryKey];

          return (
            <div className="p-1   border border-slate-200 dark:border-slate-800 rounded-3xl shadow ">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8  relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl" />

                <div className="flex flex-col gap-8 relative z-10">
                  {/* Header: Label & Live Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {isNumeric ? (
                          <Activity className="w-5 h-5 text-primary" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-success" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-tight">
                          {selectedKey?.label || 'Condition'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Configure Automation Logic
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        Live Telemetry
                      </span>
                    </div>
                  </div>

                  {/* Main Interaction Flow */}
                  <div className="flex flex-col lg:flex-row items-center  gap-6 lg:gap-12">
                    {/* Part 1: Current State */}
                    <div className="flex flex-col items-center lg:items-start gap-2 min-w-[140px]">
                      <span className="font-semibold text-xs  uppercase tracking-[0.2em] text-slate-400">
                        Current State
                      </span>
                      <div className="flex items-baseline text-center justify-center gap-1 bg-slate-50/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 w-full group hover:border-primary/30 transition-colors">
                        <span
                          className={cn(
                            'text-3xl font-black tracking-tighter transition-all duration-500',
                            currentValue === 'on'
                              ? 'text-success'
                              : isNumeric
                                ? 'text-primary'
                                : 'text-slate-600'
                          )}
                        >
                          {currentValue ?? '---'}
                        </span>
                        {isNumeric && selectedKey?.unit && (
                          <span className="text-xs font-semibold text-slate-400">
                            {selectedKey.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Part 2: Operator (Conditional) */}
                    {isNumeric ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-semibold text-xs  uppercase tracking-[0.2em] text-slate-400">
                          Logic
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="hidden lg:block w-12 h-px bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
                          <Controller
                            name="trigger.operator"
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-[180px] h-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl shadow-sm focus:ring-primary transition-all">
                                  <SelectValue
                                    className="text-xs font-semibold uppercase"
                                    placeholder="Operator"
                                  />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 shadow-xl">
                                  <SelectItem className="text-xs " value="gt">
                                    Greater Than
                                  </SelectItem>
                                  <SelectItem className="text-xs " value="lt">
                                    Less Than
                                  </SelectItem>
                                  <SelectItem className="text-xs   " value="eq">
                                    Exactly Equals
                                  </SelectItem>
                                  <SelectItem
                                    className="text-xs   "
                                    value="gte"
                                  >
                                    Greater or Equal
                                  </SelectItem>
                                  <SelectItem
                                    className="text-xs   "
                                    value="lte"
                                  >
                                    Less or Equal
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <div className="hidden lg:block w-12 h-px bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    )}

                    {/* Part 3: Target Threshold */}
                    <div className="flex-1 w-full flex flex-col gap-2">
                      <span className="font-semibold text-xs  uppercase tracking-[0.2em] text-slate-400 lg:text-center ">
                        Target Threshold
                      </span>
                      {selectedKey?.enum && selectedKey.enum.length > 0 ? (
                        <Controller
                          name="trigger.value"
                          control={control}
                          render={({ field }) => (
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 shadow-inner h-12">
                              {selectedKey?.enum?.map((opt: string) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => field.onChange(opt)}
                                  className={cn(
                                    'flex-1 text-[10px] font-black uppercase rounded-xl transition-all duration-300',
                                    field.value === opt
                                      ? 'bg-primary text-white shadow-lg scale-[1.02] active:scale-95'
                                      : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-700'
                                  )}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      ) : (
                        <div className="relative group/input">
                          <Input
                            className="h-12 bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-lg font-black text-center focus:border-primary transition-all pr-12"
                            placeholder={isNumeric ? '0.00' : 'Target Value'}
                            type={isNumeric ? 'number' : 'text'}
                            {...register('trigger.value')}
                          />
                          {isNumeric && selectedKey?.unit && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase tracking-widest">
                              {selectedKey.unit}
                            </div>
                          )}
                        </div>
                      )}
                      {triggerErrors?.value && (
                        <p className="text-[10px] text-destructive font-semibold uppercase tracking-tight text-center lg:text-left mt-1">
                          {triggerErrors.value.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex items-center gap-4 mt-2 pt-4">
        <div className=" ">
          <Info className="h-6 w-6 text-secondary" />
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm border border-blue-100">
          Preview: When{' '}
          {devices.find((d) => d.id === triggerData?.deviceId)?.name ||
            'Device'}{' '}
          {triggerData?.telemetryKey?.split('.').pop() || 'Attribute'}{' '}
          {triggerData?.operator === 'gt'
            ? '>'
            : triggerData?.operator === 'lt'
              ? '<'
              : triggerData?.operator === 'eq'
                ? '=='
                : triggerData?.operator === 'gte'
                  ? '>='
                  : '<='}{' '}
          {triggerData?.value ?? '0'}{' '}
          {availableTelemetryKeys.find(
            (k) => k.key === triggerData?.telemetryKey
          )?.unit || ''}
        </div>
      </div>
    </div>
  );
};
