import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeviceProfileMultiStepFormData } from '../../types/device-profile-form.types';

interface Step4DeviceProvisioningProps {
  form: UseFormReturn<DeviceProfileMultiStepFormData>;
}

export const Step4DeviceProvisioning: React.FC<
  Step4DeviceProvisioningProps
> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold  text-primary  mb-1">
          {t('deviceProfiles.form.steps.provisioning.title')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('deviceProfiles.form.steps.provisioning.description')}{' '}
          {t('deviceProfiles.form.steps.transport.optional')}
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="provisionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('deviceProfiles.form.fields.provisionStrategy')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'deviceProfiles.form.fields.provisionPlaceholder'
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="allow_create_new">
                    {t('deviceProfiles.form.options.allowCreateNew')}
                  </SelectItem>
                  <SelectItem value="check_pre_provisioned">
                    {t('deviceProfiles.form.options.checkPreProvisioned')}
                  </SelectItem>
                  <SelectItem value="disabled">
                    {t('deviceProfiles.form.options.disabled')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('deviceProfiles.form.fields.provisionDescription')}
              </FormDescription>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('deviceProfiles.form.fields.ruleChainPlaceholder')}
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
              <FormDescription>
                {t('deviceProfiles.form.fields.ruleChainDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
