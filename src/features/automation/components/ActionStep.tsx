import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevices } from '@/features/devices/hooks/useDevices';
import { cn } from '@/lib/util';
import { ActionFormItem } from './ActionFormItem';

interface ActionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const ActionStep: React.FC<ActionStepProps> = ({ onNext, onBack }) => {
  const { data: devicesData } = useDevices({ limit: 100 });
  const devices = devicesData?.data?.data?.data || [];
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });
  const actionErrors = errors.actions as any;

  const execution = watch('execution') || {
    sequence: true,
    parallel: false,
    stopOnError: false,
    retryOnFailure: true,
    retryCount: 3,
  };

  const addAction = () => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      type: 'control',
      deviceId: '',
      command: 'Turn On',
      params: '',
      delay: 0,
      priority: 'medium',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">Configure Actions</h2>
        <Button
          type="button"
          onClick={addAction}
          variant="primary"
          className="  text-white rounded-lg flex items-center gap-2 px-4 py-2"
        >
          <Plus className="w-4 h-4" /> Add Action
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {fields.map((field, index) => (
            <ActionFormItem
              key={field.id}
              index={index}
              devices={devices}
              onRemove={() => remove(index)}
              errors={actionErrors?.[index]}
            />
          ))}

          {/* Quick Templates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Quick Templates
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Climate Control', icon: Shield, active: true },
                { label: 'Security Alert', icon: Shield },
                { label: 'Energy Saving', icon: Zap },
                { label: 'Maintenance', icon: Settings },
              ].map((template) => (
                <button
                  key={template.label}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border',
                    template.active
                      ? 'bg-indigo-700 border-indigo-700 text-white shadow-lg shadow-indigo-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-8 py-2 font-medium"
            >
              Previous
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Execution Options */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Execution Options
            </h3>
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => {
                  setValue('execution.sequence', true);
                  setValue('execution.parallel', false);
                }}
              >
                <div
                  className={cn(
                    'w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all',
                    execution.sequence
                      ? 'bg-slate-800 border-slate-800'
                      : 'border-slate-300'
                  )}
                >
                  {execution.sequence && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Execute actions in sequence
                </span>
              </div>

              <div
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => {
                  setValue('execution.sequence', false);
                  setValue('execution.parallel', true);
                }}
              >
                <div
                  className={cn(
                    'w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all',
                    execution.parallel
                      ? 'bg-slate-800 border-slate-800'
                      : 'border-slate-300'
                  )}
                >
                  {execution.parallel && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Execute actions in parallel
                </span>
              </div>

              <div
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() =>
                  setValue('execution.stopOnError', !execution.stopOnError)
                }
              >
                <div
                  className={cn(
                    'w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all',
                    execution.stopOnError
                      ? 'bg-slate-800 border-slate-800'
                      : 'border-slate-300'
                  )}
                >
                  {execution.stopOnError && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Stop execution on first error
                </span>
              </div>

              <div
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() =>
                  setValue(
                    'execution.retryOnFailure',
                    !execution.retryOnFailure
                  )
                }
              >
                <div
                  className={cn(
                    'w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all',
                    execution.retryOnFailure
                      ? 'bg-slate-800 border-slate-800'
                      : 'border-slate-300'
                  )}
                >
                  {execution.retryOnFailure && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-600">
                  Retry failed actions (max 3 times)
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px]">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Summary</h3>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <span className="text-sm">
                  {fields.length} actions configured
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <span className="text-sm">
                  {execution.sequence ? 'Sequential' : 'Parallel'} execution
                  enabled
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <span className="text-sm">
                  Retry on failure: {execution.retryCount} attempts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Select a template to quickly add common action configurations
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-pink-100 border-pink-100 text-pink-600 hover:bg-pink-200 rounded-xl py-6 font-bold"
              >
                Save Draft
              </Button>
              <Button
                onClick={onNext}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6 font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
