import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateAlarmRuleForm } from './CreateAlarmRuleForm';
import { BellPlus } from 'lucide-react';

export interface CreateAlarmRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  alarmId?: string;
}

export const CreateAlarmRuleDialog: React.FC<CreateAlarmRuleDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  alarmId,
}) => {
  const isEditing = Boolean(alarmId);
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 border-none">
        <DialogHeader className="p-5 bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/30 backdrop-blur-md text-white">
              <BellPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                {isEditing ? 'Edit Alert Rule' : 'Create New Alert Rule'}
              </DialogTitle>
              <DialogDescription className="text-slate-200 text-xs">
                {isEditing
                  ? 'Update rule conditions, trigger thresholds, and notification recipients.'
                  : 'Configure rule conditions, trigger thresholds, and notification recipients.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          <CreateAlarmRuleForm
            isModal={true}
            alarmId={alarmId}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
