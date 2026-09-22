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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeviceProfileMultiStepFormData } from '../../types/device-profile-form.types';

interface Step2TransportConfigurationProps {
  form: UseFormReturn<DeviceProfileMultiStepFormData>;
}

export const Step2TransportConfiguration: React.FC<
  Step2TransportConfigurationProps
> = ({ form }) => {
  const { t } = useTranslation();
  const transportType = form.watch('transportType');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold  text-primary  mb-1">
          {t('deviceProfiles.form.steps.transport.title')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('deviceProfiles.form.steps.transport.description')}{' '}
          {t('deviceProfiles.form.steps.transport.optional')}
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="transportType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('deviceProfiles.form.fields.transportType')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'deviceProfiles.form.fields.transportPlaceholder'
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mqtt">
                    {t('deviceProfiles.form.options.mqtt')}
                  </SelectItem>
                  <SelectItem value="http">
                    {t('deviceProfiles.form.options.http')}
                  </SelectItem>
                  <SelectItem value="coap">
                    {t('deviceProfiles.form.options.coap')}
                  </SelectItem>
                  <SelectItem value="lwm2m">
                    {t('deviceProfiles.form.options.lwm2m')}
                  </SelectItem>
                  <SelectItem value="snmp">
                    {t('deviceProfiles.form.options.snmp')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {transportType === 'mqtt' && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <FormField
              control={form.control}
              name="transportConfiguration.mqttConfig.deviceTelemetryTopic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('deviceProfiles.form.fields.telemetryTopic')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'deviceProfiles.form.fields.telemetryPlaceholder'
                      )}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('deviceProfiles.form.fields.telemetryDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportConfiguration.mqttConfig.deviceAttributesTopic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('deviceProfiles.form.fields.attributesTopic')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'deviceProfiles.form.fields.attributesPlaceholder'
                      )}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {transportType === 'http' && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <FormField
              control={form.control}
              name="transportConfiguration.httpConfig.baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('deviceProfiles.form.fields.baseUrl')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('deviceProfiles.form.fields.baseUrlPlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportConfiguration.httpConfig.timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('deviceProfiles.form.fields.timeout')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {transportType === 'coap' && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <FormField
              control={form.control}
              name="transportConfiguration.coapConfig.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('deviceProfiles.form.fields.port')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5683"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {transportType === 'modbus' && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <FormField
              control={form.control}
              name="transportConfiguration.modbusConfig.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('deviceProfiles.form.fields.port')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="502"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportConfiguration.modbusConfig.baudRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('deviceProfiles.form.fields.baudRate')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="9600"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {transportType === 'loraWan' && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <FormField
              control={form.control}
              name="transportConfiguration.loraWanConfig.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('deviceProfiles.form.fields.region')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('deviceProfiles.form.fields.regionPlaceholder')}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportConfiguration.loraWanConfig.appEui"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('deviceProfiles.form.fields.appEui')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 0000000000000000"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
