import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { DeviceProfileMultiStepFormData } from '../../types/device-profile-form.types';

interface Step3AlarmRulesProps {
  form: UseFormReturn<DeviceProfileMultiStepFormData>;
}

export const Step3AlarmRules: React.FC<Step3AlarmRulesProps> = ({ form }) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'alarmRules',
  });

  const addAlarmRule = () => {
    append({
      name: '',
      condition: '',
      severity: 'WARNING',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold  text-primary  mb-1">
          {t('deviceProfiles.form.steps.alarms.title')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('deviceProfiles.form.steps.alarms.description')}{' '}
          {t('deviceProfiles.form.steps.transport.optional')}
        </p>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">
              {t('deviceProfiles.form.messages.noAlarms')}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={addAlarmRule}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('deviceProfiles.form.buttons.addAlarm')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">
                    {t('deviceProfiles.form.messages.alarmRule')} {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`alarmRules.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('deviceProfiles.form.fields.ruleName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'deviceProfiles.form.fields.ruleNamePlaceholder'
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`alarmRules.${index}.severity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('deviceProfiles.form.fields.severity')}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CRITICAL">
                              {t('deviceProfiles.form.options.critical')}
                            </SelectItem>
                            <SelectItem value="MAJOR">
                              {t('deviceProfiles.form.options.major')}
                            </SelectItem>
                            <SelectItem value="MINOR">
                              {t('deviceProfiles.form.options.minor')}
                            </SelectItem>
                            <SelectItem value="WARNING">
                              {t('deviceProfiles.form.options.warning')}
                            </SelectItem>
                            <SelectItem value="INDETERMINATE">
                              {t('deviceProfiles.form.options.indeterminate')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`alarmRules.${index}.condition`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('deviceProfiles.form.fields.condition')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'deviceProfiles.form.fields.conditionPlaceholder'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addAlarmRule}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('deviceProfiles.form.buttons.addAnotherAlarm')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
