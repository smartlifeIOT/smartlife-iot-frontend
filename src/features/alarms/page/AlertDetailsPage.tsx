import { PageHeader } from '@/components/common/PageHeader';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clock1, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  useAcknowledgeAlarm,
  useAlarm,
  useAlarmEscalationHistory,
  useResolveAlarm,
} from '../hooks';
import { format } from 'date-fns';
import { AlarmRuleBadge } from '@/components/ui/AlarmRuleBadge';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { AlarmSeverity } from '@/services/api/alarms.api';

const getSeverityVariant = (severity?: AlarmSeverity): BadgeVariant => {
  switch (severity) {
    case AlarmSeverity.CRITICAL:
      return 'destructive';
    case AlarmSeverity.MAJOR:
      return 'warning';
    case AlarmSeverity.MINOR:
      return 'info';
    case AlarmSeverity.WARNING:
      return 'secondary';
    default:
      return 'default';
  }
};

export const AlertDetailsPage = () => {
  const { id } = useParams();
  const { data: alarm, isLoading } = useAlarm(id || '');
  const { data: escalationHistory, isLoading: escalationHistoryLoading } =
    useAlarmEscalationHistory(id || '');
  const acknowledge = useAcknowledgeAlarm();
  const resolve = useResolveAlarm();
  if (isLoading || escalationHistoryLoading) return <LoadingOverlay />;
  return (
    <div className="mx-auto max-w-[1260px]  ">
      <PageHeader title={alarm?.name || ''} className="mb-4" />

      <div className="space-y-4">
        <Card className="overflow-hidden space-y-4">
          <div className="flex bg-white flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="uppercase text-sm">
                  {alarm?.status ?? '—'}
                </Badge>
                <Badge
                  className="uppercase text-sm"
                  variant={getSeverityVariant(alarm?.severity)}
                >
                  {alarm?.severity ?? '—'}
                </Badge>
              </div>
              <div className="mb-  text-sm text-slate-500">
                {alarm?.createdAt && (
                  <p className="  ">
                    <Clock className=" inline h-4 w-4 text-primary" /> Created:{' '}
                    {format(new Date(alarm.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                )}
              </div>
              <p className="text-sm text-slate-600">{alarm?.description}</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => acknowledge.mutate({ alarmId: id || '' })}
              >
                Acknowledge
              </Button>
              <Button
                variant="success"
                onClick={() => resolve.mutate({ alarmId: id || '', note: '' })}
                disabled={resolve.isPending}
              >
                Resolve
              </Button>
            </div>
          </div>

          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Alert Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Details for the selected alert and the asset involved.
                </p>
              </div>

              <div className="grid    ">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="space-y-5 text-sm text-slate-600">
                    <div className="grid  grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                      <span className="font-medium text-slate-800">Device</span>
                      <span className="  text-slate-500">
                        {alarm?.device?.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                      <span className="font-medium text-slate-800">Rule</span>
                      <span className="  text-slate-500">
                        {alarm?.rule ? (
                          <AlarmRuleBadge rule={alarm.rule} />
                        ) : (
                          '—'
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                      <span className="font-medium text-slate-800">
                        Current Value
                      </span>
                      <span className="  text-rose-600 font-semibold">
                        {alarm?.currentValue}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                      <span className="font-medium text-slate-800">
                        Description
                      </span>
                      <span className="  text-slate-500">
                        {alarm?.description}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <span className="font-medium text-slate-800">
                        Last Updated
                      </span>
                      <span className="  text-slate-500">
                        {alarm?.updatedAt
                          ? format(
                              new Date(alarm.updatedAt),
                              'yyyy-MM-dd HH:mm:ss'
                            )
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Recent changes and actions recorded for this alert.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <Clock1 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">Alert generated</p>
                  <p className="text-sm text-slate-500">
                    2024-05-22 14:30:25 — Sensor reading triggered the rule.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              No additional timeline entries are available yet.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertDetailsPage;
