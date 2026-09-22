import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { telemetryApi, type TelemetryData } from '@/services/api/telemetry.api';
import { format } from 'date-fns';
import { flattenObject } from '@/utils/helpers/FlattenObject';

interface TelemetryDetailsProps {
  deviceId: string;
}

export const TelemetryDetails: React.FC<TelemetryDetailsProps> = ({
  deviceId,
}) => {
  const { t } = useTranslation();
  const {
    data: response,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['device-latest-telemetry', deviceId],
    queryFn: () => telemetryApi.getLatest(deviceId),
    enabled: !!deviceId,
    refetchInterval: 30000,
  });

  const telemetry: TelemetryData | undefined = response?.data?.data;

  // Process data to be a flat list of entries
  const flatDataEntries = React.useMemo(() => {
    if (!telemetry?.data) return [];
    return flattenObject(telemetry.data);
  }, [telemetry?.data]);

  const formatDisplayValue = (val: any) => {
    if (val === null || val === undefined) return '—';
    if (Array.isArray(val)) return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('devices.details.telemetry.details.latestTitle')}
          </h3>
          {dataUpdatedAt > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {t('devices.details.telemetry.details.lastUpdated')}{' '}
              {format(new Date(dataUpdatedAt), 'HH:mm:ss')}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-8 shadow-sm"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin text-success' : ''}`}
          />
          {t('devices.details.telemetry.details.refresh')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {isError && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
            {t('devices.details.telemetry.messages.error')}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && !telemetry && (
        <Card>
          <CardContent className="p-12 text-center text-gray-400 text-sm">
            {t('devices.details.telemetry.details.noTelemetry')}
          </CardContent>
        </Card>
      )}

      {telemetry && (
        <>
          <div className="grid grid-cols-1 gap-6">
            {/* Payload data section */}
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="pb-3 border-b border-gray-50 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-900/10">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Tag className="h-4 w-4 text-primary" />
                  {t('devices.details.telemetry.details.payloadData')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-auto max-h-[600px]">
                {flatDataEntries.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-gray-900">
                    {flatDataEntries.map(([key, val]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors gap-1 sm:gap-4"
                      >
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-mono uppercase tracking-tight shrink-0">
                          {key}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-mono break-all sm:text-right font-medium">
                          {formatDisplayValue(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 text-sm italic">
                    {t('devices.details.telemetry.table.noData')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-2 gap-2 text-gray-400">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <Clock className="h-3 w-3" />
              <span>
                {t('devices.details.telemetry.details.reportedAt')}{' '}
                {format(new Date(telemetry.timestamp), 'yyyy-MM-dd HH:mm:ss')}
              </span>
            </div>
            {telemetry.deviceKey && (
              <div className="text-[10px] font-mono select-all hidden sm:block">
                KEY: {telemetry.deviceKey}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
