import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeviceProfileMultiStepFormData } from '../../types/device-profile-form.types';

interface Step1DeviceProfileDetailsProps {
  form: UseFormReturn<DeviceProfileMultiStepFormData>;
}

export const Step1DeviceProfileDetails: React.FC<
  Step1DeviceProfileDetailsProps
> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg text-primary font-semibold mb-1 dark:text-white">
          {t('deviceProfiles.form.steps.details.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-white">
          {t('deviceProfiles.form.steps.details.description')}
        </p>
      </div>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('deviceProfiles.form.fields.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('deviceProfiles.form.fields.namePlaceholder')}
                  {...field}
                  className="border-2 rounded-md"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('deviceProfiles.form.fields.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    'deviceProfiles.form.fields.descriptionPlaceholder'
                  )}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('deviceProfiles.form.fields.type')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('deviceProfiles.form.fields.typePlaceholder')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sensor">
                    {t('deviceProfiles.form.options.sensor')}
                  </SelectItem>
                  <SelectItem value="Gateway">
                    {t('deviceProfiles.form.options.gateway')}
                  </SelectItem>
                  <SelectItem value="Meter">
                    {t('deviceProfiles.form.options.meter')}
                  </SelectItem>
                  <SelectItem value="Actuator">
                    {t('deviceProfiles.form.options.actuator')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultRuleChainId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('deviceProfiles.form.fields.defaultRuleChain')}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'deviceProfiles.form.fields.ruleChainPlaceholder'
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Root Rule Chain">
                    Root Rule Chain
                  </SelectItem>
                  <SelectItem value="Gateway Processing">
                    Gateway Processing
                  </SelectItem>
                  <SelectItem value="Energy Processing">
                    Energy Processing
                  </SelectItem>
                  <SelectItem value="Air Quality Processing">
                    Air Quality Processing
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultQueueName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('deviceProfiles.form.fields.queue')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('deviceProfiles.form.fields.queuePlaceholder')}
                  {...field}
                  className="border-2 rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
