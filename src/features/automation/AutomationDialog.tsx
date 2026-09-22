import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Automation } from './types';
import { Stepper } from '@/features/profiles/components/Stepper';
import { BasicInfoStep } from './components/BasicInfoStep';
import { TriggerStep } from './components/TriggerStep';
import { ActionStep } from './components/ActionStep';
import { ReviewStep } from './components/ReviewStep';
import { automationSchema } from './Schema';
import toast from 'react-hot-toast';

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Automation>) => void;
  mode?: 'create' | 'edit';
  initialData?: Automation | null;
}

type AutomationFormValues = z.infer<typeof automationSchema>;

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Device Trigger' },
  { id: 3, title: 'Device Actions' },
  { id: 4, title: 'Review' },
];

export const AutomationDialog: React.FC<AutomationDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm<AutomationFormValues>({
    resolver: zodResolver(automationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        deviceId: '',
        telemetryKey: '',
        operator: 'gte',
        value: '',
        debounce: 60,
        enableDebounce: false,
        activeHoursEnabled: false,
        activeDays: [1, 2, 3, 4, 5],
        activeHours: {
          start: '08:00',
          end: '18:00',
        },
      },
      actions: [],
      execution: {
        sequence: true,
        parallel: false,
        stopOnError: false,
        retryCount: 3,
      },
      settings: {
        cooldown: 300,
        maxExecutionsPerDay: 10,
        activeHours: {
          start: '08:00',
          end: '18:00',
        },
        activeDays: [1, 2, 3, 4, 5],
        retryOnFailure: true,
        maxRetries: 3,
      },
      tags: [],
    },
  });

  const { reset, trigger, handleSubmit, watch } = methods;
  const formData = watch();

  useEffect(() => {
    if (open) {
      if (initialData) {
        const actionItem: AutomationFormValues['actions'] =
          initialData.actions && initialData.actions.length > 0
            ? initialData.actions
            : initialData.action
              ? [
                  {
                    id: '1',
                    type: initialData.action.type || 'control',
                    deviceId: initialData.action.deviceId || '',
                    command: initialData.action.command || 'setPower',
                    value: initialData.action.value ?? true,
                    message: initialData.action.message || '',
                    recipients: initialData.action.recipients || [],
                    webhookUrl: initialData.action.webhookUrl || '',
                    webhookMethod: initialData.action.webhookMethod || 'POST',
                    webhookHeaders: initialData.action.webhookHeaders,
                    webhookBody: initialData.action.webhookBody,
                    priority: initialData.action.priority || 'high',
                    delay: initialData.action.delay || 0,
                  },
                ]
              : [
                  {
                    id: '1',
                    type: 'control',
                    deviceId: '',
                    command: 'setPower',
                    value: true,
                    priority: 'high',
                    delay: 0,
                  },
                ];

        reset({
          name: initialData.name || '',
          description: initialData.description || '',
          enabled: initialData.enabled ?? true,
          status: initialData.status || 'active',
          trigger: {
            type: initialData.trigger?.type || '',
            deviceId:
              initialData.trigger?.deviceId ||
              initialData.trigger?.device ||
              '',
            telemetryKey: initialData.trigger?.telemetryKey || '',
            attributeKey: initialData.trigger?.attributeKey || '',
            operator: initialData.trigger?.operator || 'gte',
            value: initialData.trigger?.value ?? '',
            value2: initialData.trigger?.value2 ?? '',
            schedule: initialData.trigger?.schedule || '',
            debounce: initialData.trigger?.debounce ?? 60,
            enableDebounce: !!initialData.trigger?.debounce,
            activeHoursEnabled: !!(
              initialData.settings?.activeHours ||
              (initialData.trigger as any)?.activeHours
            ),
            activeHours: initialData.settings?.activeHours ||
              (initialData.trigger as any)?.activeHours || {
                start: '08:00',
                end: '18:00',
              },
            activeDays: initialData.settings?.activeDays ||
              (initialData.trigger as any)?.activeDays || [1, 2, 3, 4, 5],
          },
          actions: actionItem,
          execution: initialData.execution || {
            sequence: true,
            parallel: false,
            stopOnError: false,
            retryCount: 3,
          },
          settings: {
            cooldown: initialData.settings?.cooldown ?? 300,
            maxExecutionsPerDay:
              initialData.settings?.maxExecutionsPerDay ?? 10,
            activeHours: initialData.settings?.activeHours || {
              start: '08:00',
              end: '18:00',
            },
            activeDays: initialData.settings?.activeDays || [1, 2, 3, 4, 5],
            retryOnFailure: initialData.settings?.retryOnFailure ?? true,
            maxRetries: initialData.settings?.maxRetries ?? 3,
            notifyEmail: false,
            notifyPush: false,
            logHistory: true,
          },
          tags: initialData.tags,
        });
      } else {
        reset({
          name: '',
          description: '',
          enabled: true,
          status: 'active',
          trigger: {
            type: 'threshold',
            deviceId: '',
            telemetryKey: '',
            operator: 'gte',
            value: '',
            debounce: 60,
            enableDebounce: false,
            activeHoursEnabled: false,
            activeDays: [1, 2, 3, 4, 5],
            activeHours: {
              start: '08:00',
              end: '18:00',
            },
          },
          actions: [
            {
              id: '1',
              type: 'control',
              deviceId: '',
              command: 'setPower',
              value: true,
              priority: 'high',
              delay: 0,
            },
          ],
          execution: {
            sequence: true,
            parallel: false,
            stopOnError: false,
            retryCount: 3,
          },
          settings: {
            cooldown: 300,
            maxExecutionsPerDay: 10,
            activeHours: {
              start: '08:00',
              end: '18:00',
            },
            activeDays: [1, 2, 3, 4, 5],
            retryOnFailure: true,
            maxRetries: 3,
          },
          tags: [],
        });
      }
      setCurrentStep(1);
    }
  }, [initialData, open, reset]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['name'];
    if (currentStep === 2)
      fieldsToValidate = ['trigger.deviceId', 'trigger.telemetryKey'];
    if (currentStep === 3) fieldsToValidate = ['actions'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < STEPS.length) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Final Step: Submit
        handleSubmit(
          (data) => {
            const firstAction = data.actions?.[0] || {};

            // Action payload
            let actionValue = firstAction.value;
            if (firstAction.type === 'control') {
              if (
                firstAction.params &&
                typeof firstAction.params === 'object' &&
                Object.keys(firstAction.params).length > 0
              ) {
                actionValue = firstAction.params;
              } else if (firstAction.value !== undefined) {
                actionValue = firstAction.value;
              } else {
                actionValue = true;
              }
            }

            const actionPayload: any = {
              type: firstAction.type || 'control',
            };

            if (firstAction.type === 'control') {
              if (firstAction.deviceId)
                actionPayload.deviceId = firstAction.deviceId;
              actionPayload.command = firstAction.command || 'setPower';
              actionPayload.value = actionValue;
            } else if (firstAction.type === 'notification') {
              actionPayload.message = firstAction.message || '';
              actionPayload.recipients = Array.isArray(firstAction.recipients)
                ? firstAction.recipients.filter(Boolean)
                : firstAction.recipients
                  ? [firstAction.recipients]
                  : [];
            } else if (firstAction.type === 'webhook') {
              actionPayload.webhookUrl =
                firstAction.webhookUrl || 'https://api.example.com/webhook';
              actionPayload.webhookMethod = firstAction.webhookMethod || 'POST';
              actionPayload.webhookHeaders = firstAction.webhookHeaders || {
                'Content-Type': 'application/json',
              };
              actionPayload.webhookBody = firstAction.webhookBody || {
                alert: 'high_temperature',
                value: '{{temperature}}',
              };
            } else {
              if (firstAction.deviceId)
                actionPayload.deviceId = firstAction.deviceId;
              if (firstAction.command)
                actionPayload.command = firstAction.command;
              if (actionValue !== undefined) actionPayload.value = actionValue;
              if (firstAction.message)
                actionPayload.message = firstAction.message;
              if (firstAction.recipients)
                actionPayload.recipients = firstAction.recipients;
              if (firstAction.webhookUrl)
                actionPayload.webhookUrl = firstAction.webhookUrl;
            }

            // Trigger payload
            const triggerPayload: any = {
              type: data.trigger?.type || 'threshold',
            };

            if (data.trigger?.deviceId) {
              triggerPayload.deviceId = data.trigger.deviceId;
            }
            if (data.trigger?.telemetryKey) {
              triggerPayload.telemetryKey = data.trigger.telemetryKey;
            }
            if (data.trigger?.attributeKey) {
              triggerPayload.attributeKey = data.trigger.attributeKey;
            }
            if (data.trigger?.operator) {
              triggerPayload.operator = data.trigger.operator;
            }
            if (
              data.trigger?.value !== undefined &&
              data.trigger?.value !== ''
            ) {
              const num = Number(data.trigger.value);
              triggerPayload.value = isNaN(num) ? data.trigger.value : num;
            }
            if (
              data.trigger?.value2 !== undefined &&
              data.trigger?.value2 !== ''
            ) {
              const num2 = Number(data.trigger.value2);
              triggerPayload.value2 = isNaN(num2) ? data.trigger.value2 : num2;
            }
            if (data.trigger?.schedule) {
              triggerPayload.schedule = data.trigger.schedule;
            }
            if (data.trigger?.enableDebounce && data.trigger?.debounce) {
              triggerPayload.debounce = Number(data.trigger.debounce);
            } else if (data.trigger?.debounce) {
              triggerPayload.debounce = Number(data.trigger.debounce);
            }

            // Settings payload
            const activeHours =
              data.trigger?.activeHoursEnabled && data.trigger?.activeHours
                ? data.trigger.activeHours
                : data.settings?.activeHours || {
                    start: '08:00',
                    end: '18:00',
                  };

            const activeDays =
              data.trigger?.activeHoursEnabled && data.trigger?.activeDays
                ? data.trigger.activeDays
                : data.settings?.activeDays || [1, 2, 3, 4, 5];

            const settingsPayload = {
              cooldown: Number(data.settings?.cooldown ?? 300),
              maxExecutionsPerDay: Number(
                data.settings?.maxExecutionsPerDay ?? 10
              ),
              activeHours,
              activeDays,
              retryOnFailure: data.settings?.retryOnFailure ?? true,
              maxRetries: Number(data.settings?.maxRetries ?? 3),
            };

            const payload: Partial<Automation> = {
              name: data.name,
              description:
                data.description ||
                `Turn ON ${firstAction.command || 'action'} when ${data.trigger?.telemetryKey || 'metric'} ${data.trigger?.operator || '>='} ${data.trigger?.value || 'threshold'}`,
              enabled: data.enabled ?? true,
              trigger: triggerPayload,
              action: actionPayload,
              settings: settingsPayload,
              tags:
                data.tags && data.tags.length > 0
                  ? data.tags
                  : ['hvac', 'cooling', 'critical'],
            };

            console.log('Submitting Automation Payload:', payload);
            onSubmit(payload);
            onOpenChange(false);
          },
          (errors) => {
            console.error('Form Validation Errors:', errors);
            toast.error('Form validation failed. Please check your inputs.');
          }
        )();
      }
    } else {
      console.log('Step validation failed for:', fieldsToValidate);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <TriggerStep />;
      case 3:
        return <ActionStep onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold">
            {mode === 'create'
              ? t('automation.dialog.createTitle', 'Create New Automation Rule')
              : t('automation.dialog.editTitle', 'Edit Automation Rule')}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="px-6 py-1">
            <Stepper
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={Array.from(
                { length: currentStep - 1 },
                (_, i) => i + 1
              )}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6">{renderStep()}</div>

          <div className="flex justify-between items-center border-gray-200 px-6 py-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() =>
                currentStep === 1 ? onOpenChange(false) : handleBack()
              }
              className="px-8"
            >
              {currentStep === 1
                ? t('automation.buttons.cancel', 'Cancel')
                : t('automation.buttons.back', 'Back')}
            </Button>
            <Button
              onClick={handleNext}
              className="px-8 bg-slate-900 hover:bg-slate-800 text-white"
            >
              {currentStep === STEPS.length
                ? mode === 'create'
                  ? t('automation.buttons.create', 'Create Rule')
                  : t('automation.buttons.save', 'Save Changes')
                : t('automation.buttons.next', 'Next')}
            </Button>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
