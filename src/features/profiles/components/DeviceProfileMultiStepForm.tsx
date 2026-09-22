import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Stepper, type Step } from './Stepper';
import { Step1DeviceProfileDetails } from './steps/Step1DeviceProfileDetails';
import { Step2TransportConfiguration } from './steps/Step2TransportConfiguration';
import { Step3AlarmRules } from './steps/Step3AlarmRules';
import { Step4DeviceProvisioning } from './steps/Step4DeviceProvisioning';
import type { DeviceProfileMultiStepFormData } from '../types/device-profile-form.types';
import { DEFAULT_MULTI_STEP_FORM_DATA } from '../types/device-profile-form.types';
import { deviceProfileMultiStepFormSchema } from '../types/device-profile-form.schema';

interface DeviceProfileMultiStepFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DeviceProfileMultiStepFormData) => void;
}

export const DeviceProfileMultiStepForm: React.FC<
  DeviceProfileMultiStepFormProps
> = ({ open, onOpenChange, onSubmit }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const STEPS: Step[] = useMemo(
    () => [
      {
        id: 1,
        title: t('deviceProfiles.form.steps.details.title'),
        description: t('deviceProfiles.form.steps.details.description'),
      },
      {
        id: 2,
        title: t('deviceProfiles.form.steps.transport.title'),
        description: t('deviceProfiles.form.steps.transport.description'),
        optional: true,
      },
      {
        id: 3,
        title: t('deviceProfiles.form.steps.alarms.title'),
        description: t('deviceProfiles.form.steps.alarms.description'),
        optional: true,
      },
      {
        id: 4,
        title: t('deviceProfiles.form.steps.provisioning.title'),
        description: t('deviceProfiles.form.steps.provisioning.description'),
        optional: true,
      },
    ],
    [t]
  );

  const form = useForm<DeviceProfileMultiStepFormData>({
    resolver: zodResolver(deviceProfileMultiStepFormSchema),
    defaultValues: DEFAULT_MULTI_STEP_FORM_DATA,
    mode: 'onChange',
  });
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof DeviceProfileMultiStepFormData)[] = [];

    switch (currentStep) {
      case 1: {
        // Step 1 is required - validate all fields
        fieldsToValidate = [
          'name',
          'description',
          'type',
          'defaultRuleChainId',
          'defaultQueueName',
          // 'defaultEdgeRuleChain',
        ];
        break;
      }
      case 2: {
        // Step 2 is optional - only validate if transportConfig exists
        const transportType = form.getValues('transportType');
        if (transportType) {
          fieldsToValidate = ['transportType', 'transportConfiguration'];
        } else {
          // Optional step, allow proceeding
          return true;
        }
        break;
      }
      case 3: {
        // Step 3 is optional - validate alarm rules only if they exist and are complete
        try {
          const alarmRules = form.getValues('alarmRules');
          if (alarmRules && alarmRules.length > 0) {
            // Filter out incomplete alarm rules (empty name or condition)
            const completeAlarmRules = alarmRules.filter(
              (rule) =>
                rule.name &&
                rule.name.trim() !== '' &&
                rule.condition &&
                rule.condition.trim() !== ''
            );

            // If there are incomplete rules, remove them and update the form
            if (completeAlarmRules.length !== alarmRules.length) {
              form.setValue(
                'alarmRules',
                completeAlarmRules.length > 0 ? completeAlarmRules : [],
                {
                  shouldValidate: false,
                  shouldDirty: false,
                }
              );
            }

            // Only validate if there are complete alarm rules
            if (completeAlarmRules.length > 0) {
              fieldsToValidate = ['alarmRules'];
            } else {
              // All rules were incomplete and removed - optional step, allow proceeding
              return true;
            }
          } else {
            // No alarm rules or empty array - optional step, allow proceeding
            return true;
          }
        } catch (error) {
          // If there's any error, allow proceeding since step is optional
          console.error('Error validating alarm rules:', error);
          return true;
        }
        break;
      }
      case 4: {
        // Step 4 is optional - only validate if provisioningConfig exists
        const provisionType = form.getValues('provisionType');
        if (provisionType) {
          fieldsToValidate = ['provisionType', 'provisionConfiguration'];
        } else {
          // Optional step, allow proceeding
          return true;
        }
        break;
      }
      default:
        return true;
    }

    // Trigger React Hook Form validation (which uses Zod via resolver)
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async (e?: React.MouseEvent) => {
    // Prevent form submission
    e?.preventDefault();
    e?.stopPropagation();

    try {
      const isValid = await validateCurrentStep();
      if (isValid) {
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        if (currentStep < STEPS.length) {
          setCurrentStep(currentStep + 1);
        }
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      // Even if validation fails, allow navigation for optional steps (2, 3, 4)
      if (currentStep >= 2 && currentStep <= 4) {
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        if (currentStep < STEPS.length) {
          setCurrentStep(currentStep + 1);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onSubmit(form.getValues());
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    form.reset(DEFAULT_MULTI_STEP_FORM_DATA);
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1DeviceProfileDetails form={form} />;
      case 2:
        return <Step2TransportConfiguration form={form} />;
      case 3:
        return <Step3AlarmRules form={form} />;
      case 4:
        return <Step4DeviceProvisioning form={form} />;
      default:
        return null;
    }
  };

  const updateAlarmRulesCount = () => {
    const alarmRules = form.watch('alarmRules') || [];
    return alarmRules.length;
  };

  const stepsWithCount = STEPS.map((step) => {
    if (step.id === 3) {
      return { ...step, count: updateAlarmRulesCount() };
    }
    return step;
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] rounded-3xl  overflow-hidden dark:bg-gray-950 dark:border-gray-700 ">
        <DialogHeader className="dark:text-white dark:bg-gray-950 dark:border-gray-700 dark:border-b">
          <DialogTitle>{t('deviceProfiles.form.createTitle')}</DialogTitle>
          <DialogDescription className="dark:text-white">
            {t('deviceProfiles.form.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 overflow-y-auto max-h-[80vh] ">
          <Stepper
            steps={stepsWithCount}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(handleSubmit)(e);
              }}
              className="space-y-6"
            >
              <div className="min-h-[400px] shadow  border border-gray-200 rounded-lg  mt-4 mb-32 p-4 dark:border-gray-700">
                {renderStepContent()}
              </div>

              <DialogFooter className="flex p-4 justify-between absolute bottom-0 inset-x-0 bg-white border-t border-gray-200 dark:bg-gray-950 dark:border-gray-700">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                    >
                      {t('deviceProfiles.form.buttons.previous')}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t('deviceProfiles.form.buttons.cancel')}
                  </Button>
                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNext(e);
                      }}
                    >
                      {t('deviceProfiles.form.buttons.next')}
                    </Button>
                  ) : (
                    <Button type="submit">
                      {t('deviceProfiles.form.messages.create')}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
