import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { useLogin } from '../hooks/useLogin';

const CODE_LENGTH = 6;

export const PinCodeVerificationForm: React.FC = () => {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin();
  const inputRef = useRef<HTMLInputElement>(null);
  const { state } = useLocation();
  const email = state?.email;
  const password = state?.password;

  const [code, setCode] = useState<string>('');

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow digits
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    // Limit to CODE_LENGTH digits
    if (value.length <= CODE_LENGTH) {
      setCode(value);

      // Auto-submit when all digits are filled
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
      // Auto-submit after paste
      setTimeout(() => {
        handleSubmit(pastedData);
      }, 100);
    }
  };

  const handleSubmit = (pinCode?: string) => {
    const finalCode = pinCode || code;
    
    if (finalCode.length !== CODE_LENGTH) {
      toast.error(t('auth.pinCodeVerification.invalidCode'));
      return;
    }

    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    // Login with email, password, and pin code
    login({
      email,
      password,
      twoFactorCode: finalCode,
    } as { email: string; password: string; pinCode: string , twoFactorCode: string });
  };

   

  const handleResend = () => {
    // TODO: Implement resend code functionality
    toast.success(t('auth.pinCodeVerification.codeResentSuccessfully'));
  };

  return (
    <div className="w-full max-w-lg animate-fadeIn">
      {/* PIN Code Input */}
      <div className="flex justify-center mb-8">
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={CODE_LENGTH}
          value={code}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder="Enter 6-digit code"
          className="w-full max-w-lg h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          aria-label={t('auth.pinCodeVerification.digitInput') || 'Enter PIN code'}
        />
      </div>

      {/* Verify Code Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => handleSubmit()}
          size="lg"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 shadow-xl"
          isLoading={isPending}
          disabled={code.length !== CODE_LENGTH}
        >
          {isPending ? t('auth.pinCodeVerification.verifying') : t('auth.pinCodeVerification.verifyCode')}
        </Button>
      </div>

      {/* Resend Code Link */}
      <div className="flex  mb-6">
        <button
          onClick={handleResend}
          className="text-sm text-gray-900 hover:text-gray-700 transition-colors"
        >
          {t('auth.pinCodeVerification.dontReceiveCode')}{' '}
          <span className="text-blue-600 hover:text-blue-700 font-medium">
            {t('auth.pinCodeVerification.clickToResend')}
          </span>
        </button>
      </div>

      {/* Back to Login Link */}
      <div className="flex justify-start">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.pinCodeVerification.backToLogin')}
        </Link>
      </div>
    </div>
  );
};

