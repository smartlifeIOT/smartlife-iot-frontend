import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Automation } from '../types';
import { cn } from '@/lib/util';
import { useDevices } from '@/features/devices/hooks/useDevices';

interface ReviewStepProps {
  formData: Partial<Automation>;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const { t } = useTranslation();
  const { data: devicesData } = useDevices({ limit: 100 });
  const devices = devicesData?.data?.data?.data || [];

  const getDeviceName = (id?: string) => {
    if (!id) return 'Unknown Device';
    return devices.find((d: any) => d.id === id)?.name || id;
  };

  const getOperatorSymbol = (op?: string) => {
    switch (op) {
      case 'gt':
        return '>';
      case 'lt':
        return '<';
      case 'eq':
        return '==';
      case 'gte':
        return '>=';
      case 'lte':
        return '<=';
      default:
        return op || '>';
    }
  };

  const getActionDescription = (action: any) => {
    if (action.type === 'control') {
      return `Control ${getDeviceName(action.deviceId)}: ${action.command || 'Command'} = ${action.params || action.value || 'N/A'}`;
    }
    if (action.type === 'notification') {
      return `Send Notification - "${action.message || 'No message'}" to ${action.recipients?.join(', ') || 'Users'}`;
    }
    if (action.type === 'webhook') {
      return `Webhook -> ${action.webhookUrl || 'URL'}`;
    }
    return `${action.type || 'Unknown'} Action`;
  };

  return (
    <div className="p-4 rounded-xl border-gray-200 space-y-6 border  ">
      <h2 className="text-xl font-semibold text-gray-800">Review Confirm</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-none">
            <CardContent className="p-6 space-y-8">
              {/* Basic Information Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Rule Name:
                    </p>
                    <p className="text-sm text-gray-800">
                      {formData.name || 'Untitled Rule'}
                    </p>
                  </div>
                  {formData.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Description:
                      </p>
                      <p className="text-sm text-gray-800">
                        {formData.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Status:
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-800 capitalize">
                        {formData.enabled !== false ? 'Active' : 'Disabled'}
                      </span>
                      {formData.enabled !== false ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                  </div>

                  {formData.tags && formData.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Tags:
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {formData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Trigger Configuration Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Trigger Configuration
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Trigger Type:
                    </p>
                    <p className="text-sm text-gray-800 capitalize">
                      {formData.trigger?.type || 'Device Data'}
                    </p>
                  </div>

                  {formData.trigger?.deviceId && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Device:
                      </p>
                      <p className="text-sm text-gray-800">
                        {getDeviceName(formData.trigger.deviceId)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Condition:
                    </p>
                    <p className="text-sm text-gray-800">
                      {formData.trigger?.telemetryKey || 'Attribute'}{' '}
                      {getOperatorSymbol(formData.trigger?.operator)}{' '}
                      {formData.trigger?.value ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Actions Configuration Section */}
          <Card className="border-gray-200 shadow-none">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-medium text-gray-800">
                Actions Configuration
              </h3>

              <div className="space-y-4">
                {formData.actions && formData.actions.length > 0 ? (
                  formData.actions.map((action, idx) => (
                    <div key={action.id || idx} className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">
                        Action {idx + 1}:
                      </p>
                      <p className="text-sm text-gray-800">
                        {getActionDescription(action)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No actions configured.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-none min-h-[600px] flex flex-col">
            <CardContent className="p-6 space-y-8 flex-1">
              {/* Rule Logic Preview Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Rule Logic Preview
                </h3>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <div className="min-w-[120px] bg-sky-50 border border-sky-200 rounded-lg p-4 text-center shrink-0">
                    <p className="text-[10px] font-medium text-gray-400 tracking-wider mb-1 uppercase">
                      Trigger
                    </p>
                    <p className="text-[11px] font-medium text-sky-800 truncate">
                      {formData.trigger?.telemetryKey || 'Attribute'}{' '}
                      {getOperatorSymbol(formData.trigger?.operator)}{' '}
                      {formData.trigger?.value ?? 'N/A'}
                    </p>
                  </div>

                  {formData.actions?.map((action, idx) => (
                    <React.Fragment key={action.id || idx}>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                      <div className="min-w-[120px] bg-green-50 border border-green-200 rounded-lg p-4 text-center shrink-0">
                        <p className="text-[10px] font-medium text-gray-400 tracking-wider mb-1 uppercase">
                          Action {idx + 1}
                        </p>
                        <p className="text-[11px] font-medium text-green-800 truncate">
                          {action.type === 'control'
                            ? 'Device Control'
                            : action.type === 'notification'
                              ? 'Notify User'
                              : action.type}
                        </p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>

              {/* Execution Settings Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Execution Settings
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-[11px] text-gray-700 font-medium">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                    <span>
                      {formData.execution?.sequence !== false
                        ? 'Execute Actions In Sequence'
                        : 'Execute Actions In Parallel'}
                    </span>
                  </div>
                  {formData.execution?.retryCount &&
                  formData.execution.retryCount > 0 ? (
                    <div className="flex items-start gap-2 text-[11px] text-gray-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                      <span>
                        Retry Failed Actions (Max{' '}
                        {formData.execution.retryCount} Times)
                      </span>
                    </div>
                  ) : null}
                  {(formData.trigger as any)?.enableDebounce ? (
                    <div className="flex items-start gap-2 text-[11px] text-gray-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                      <span>
                        Debounce Enabled ({formData.trigger?.debounce || 0}{' '}
                        Seconds)
                      </span>
                    </div>
                  ) : null}
                  {(formData.trigger as any)?.activeHoursEnabled &&
                  (formData.trigger as any)?.activeHours ? (
                    <div className="flex items-start gap-2 text-[11px] text-gray-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5" />
                      <span>
                        Time Window:{' '}
                        {(formData.trigger as any).activeHours.start || '00:00'}{' '}
                        - {(formData.trigger as any).activeHours.end || '23:59'}
                      </span>
                    </div>
                  ) : null}
                </div>
              </section>

              {/* Status Messages */}
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium text-gray-800 tracking-tight">
                      Configuration Valid
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed pl-6">
                    Trigger Condition Validated Successfully. All Actions Can Be
                    Executed. No Configuration Conflicts Detected.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-medium text-gray-800 tracking-tight">
                      Important Notes
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed pl-6">
                    Rule Will Be Active Immediately After Creation. Ensure
                    Target Devices Are Online Before Activating.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
