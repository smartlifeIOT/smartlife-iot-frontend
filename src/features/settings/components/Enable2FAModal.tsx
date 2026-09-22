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
import { Mail, Smartphone, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { TwoFactorMethod } from '../types/settings.types';

interface Enable2FAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<void>;
  method: Exclude<TwoFactorMethod, 'none'>;
  isVerifying?: boolean;
  onResend?: () => void;
  isResending?: boolean;
}

const CODE_LENGTH = 6;

const methodIcons = {
  email: Mail,
  sms: Smartphone,
  authenticator: Key,
};

const methodLabels = {
  email: 'email',
  sms: 'sms',
  authenticator: 'authenticator',
};

export function Enable2FAModal({
  open,
  onOpenChange,
  onVerify,
  method,
  isVerifying = false,
  onResend,
  isResending = false,
}: Enable2FAModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = methodIcons[method];

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
      <DialogContent className="sm:max-w-lg rounded-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-purple-600" />
            {t('settings.security.twoFactor.enable.title', {
              method: t(`settings.security.twoFactor.methods.${methodLabels[method]}`),
            })}
          </DialogTitle>
          <DialogDescription>
            {t('settings.security.twoFactor.enable.description', {
              target:
                method === 'authenticator'
                  ? t('settings.security.twoFactor.enable.authenticatorTarget')
                  : t(`settings.security.twoFactor.methods.${methodLabels[method]}`),
            })}
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
              aria-label={t('settings.security.twoFactor.enterCode')}
            />
            <p className="text-xs text-slate-500 text-center">
              {t('settings.security.twoFactor.enterCodeDescription')}
            </p>
          </div>

          {onResend && method !== 'authenticator' && (
            <div className="text-center">
              <button
                onClick={onResend}
                disabled={isResending}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isResending ? t('settings.security.twoFactor.resending') : t('settings.security.twoFactor.resendCode')}
              </button>
            </div>
          )}
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
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isVerifying ? t('settings.security.twoFactor.verifying') : t('settings.security.twoFactor.enableAuthenticator')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

