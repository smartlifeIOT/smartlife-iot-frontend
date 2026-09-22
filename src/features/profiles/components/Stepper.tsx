import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/util';
import { useTranslation } from 'react-i18next';

export interface Step {
  id: number;
  title: string;
  description?: string;
  optional?: boolean;
  count?: number;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
}) => {
  const { t } = useTranslation();
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => stepId === currentStep;
  const isStepAccessible = (stepId: number) =>
    stepId <= currentStep || isStepCompleted(stepId);

  return (
    <div className="w-full dark:text-white">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step.id);
          const isActive = isStepActive(step.id);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const isAccessible = isStepAccessible(step.id);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                        isCompleted
                          ? 'bg-primary text-white'
                          : isActive
                            ? 'bg-primary text-white'
                            : 'bg-gray-300 text-white'
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                    </div>
                    {/* Step Info */}
                    <div
                      className={cn(
                        'mt-2 text-center',
                        isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                      )}
                    >
                      <div className="text-sm">{step.title}</div>
                      {step.count !== undefined && (
                        <div className="text-xs text-gray-400">
                          ({step.count})
                        </div>
                      )}
                      {step.optional && (
                        <div className="text-xs text-gray-400">
                          {t('deviceProfiles.form.messages.optional')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mt-[-20px]',
                    isCompleted || index < currentStep - 1
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
