import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface Disable2FAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<void>;
  isVerifying?: boolean;
}

const CODE_LENGTH = 6;

export function Disable2FAModal({
  open,
  onOpenChange,
  onVerify,
  isVerifying = false,
}: Disable2FAModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset code when modal closes
  useEffect(() => {
    if (!open) {
      setCode('');
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to CODE_LENGTH
    if (/^\d*$/.test(value) && value.length <= CODE_LENGTH) {
      setCode(value);
      // Auto-submit when all digits are entered
      if (value.length === CODE_LENGTH) {
        handleSubmit(value);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      setCode(pastedData);
      setTimeout(() => {
        handleSubmit(pastedData);
      }, 100);
    } else {
      toast.error(t('settings.security.twoFactor.invalidCodeFormat'));
    }
  };

  const handleSubmit = async (verificationCode?: string) => {
    const finalCode = verificationCode || code;

    if (finalCode.length !== CODE_LENGTH) {
      toast.error(t('settings.security.twoFactor.enterCodeRequired'));
      return;
    }

    try {
      await onVerify(finalCode);
      // Success will be handled by parent component
      onOpenChange(false);
    } catch {
      // Error handling is done in the parent component
      // Just reset the code on error
      setCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg  rounded-lg overflow-hidden  ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('settings.security.twoFactor.disable.title')}
          </DialogTitle>
          <DialogDescription>
            {t('settings.security.twoFactor.disable.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">{t('settings.security.twoFactor.enterCode')}</Label>
            <Input
              ref={inputRef}
              id="verification-code"
              type="text"
              inputMode="numeric"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={handleChange}
              onPaste={handlePaste}
              placeholder={t('settings.security.twoFactor.enterCodePlaceholder')}
              className="h-14 text-center text-2xl font-semibold tracking-widest"
              disabled={isVerifying}
              aria-label="Enter verification code"
            />
            <p className="text-xs text-slate-500 text-center">
              {t('settings.security.twoFactor.enterCodeDescription')}
            </p>
          </div>
        </div>

        <DialogFooter className="p-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={code.length !== CODE_LENGTH || isVerifying}
            isLoading={isVerifying}
            variant="destructive"
          >
            {isVerifying ? t('settings.security.twoFactor.verifying') : t('settings.security.twoFactor.disable.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

