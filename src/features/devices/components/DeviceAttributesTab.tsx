import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  RefreshCw,
  Shield,
  Info,
  Calendar,
  HardDrive,
  Cpu,
  Terminal,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/util';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { telemetryApi } from '@/services/api/telemetry.api';
import { format } from 'date-fns';

interface DeviceAttributesTabProps {
  deviceId: string;
}

export const DeviceAttributesTab: React.FC<DeviceAttributesTabProps> = ({
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
    queryKey: ['device-attributes', deviceId],
    queryFn: () => telemetryApi.getLatest(deviceId),
    enabled: !!deviceId,
  });

  const telemetry = response?.data?.data;
  const metadata = telemetry?.metadata || {};

  const getIconForKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('version') || k.includes('firmware'))
      return <Terminal className="h-4 w-4 text-blue-500" />;
    if (k.includes('manufacturer') || k.includes('model'))
      return <Cpu className="h-4 w-4 text-purple-500" />;
    if (k.includes('ip') || k.includes('host') || k.includes('addr'))
      return <Shield className="h-4 w-4 text-green-500" />;
    if (k.includes('time') || k.includes('date'))
      return <Calendar className="h-4 w-4 text-orange-500" />;
    if (k.includes('storage') || k.includes('memory') || k.includes('disk'))
      return <HardDrive className="h-4 w-4 text-yellow-500" />;
    return <Info className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            {t('devices.details.attributes.title')}
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary border-none"
            >
              {Object.keys(metadata).length}{' '}
              {t('devices.details.attributes.countSuffix')}
            </Badge>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('devices.details.attributes.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-9"
        >
          <RefreshCw
            className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')}
          />
          {t('devices.details.attributes.refresh')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : isError ? (
        <Card className="border-red-100 bg-red-50/50">
          <CardContent className="p-8 text-center text-red-600">
            {t('devices.details.attributes.error')}
          </CardContent>
        </Card>
      ) : Object.keys(metadata).length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-16 text-center text-slate-400">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>{t('devices.details.attributes.noData')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metadata).map(([key, value]) => (
            <Card
              key={key}
              className="overflow-hidden hover:shadow-md transition-shadow border-slate-200/60 shadow-sm"
            >
              <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                <div className="p-2 bg-slate-50 rounded-lg">
                  {getIconForKey(key)}
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-slate-100"
                >
                  {t('devices.details.attributes.systemBadge')}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm font-bold text-slate-900 break-all">
                    {String(value)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {telemetry?.timestamp && (
            <Card className="md:col-span-2 lg:col-span-3 bg-slate-50/50 border-dashed border-slate-200">
              <CardContent className="p-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {t('devices.details.attributes.lastHeartbeat')}{' '}
                    {format(new Date(telemetry.timestamp), 'PPP p')}
                  </span>
                </div>
                {telemetry.deviceKey && (
                  <div className="font-mono bg-white px-2 py-1 rounded border border-slate-100">
                    {t('devices.details.attributes.id')} {telemetry.deviceKey}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
