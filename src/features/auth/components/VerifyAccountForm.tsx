import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

type VerifyAccountFormData = z.infer<
  ReturnType<typeof createVerifyAccountSchema>
>;

const createVerifyAccountSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('auth.verifyAccount.emailRequired'))
      .email(t('auth.verifyAccount.emailInvalid')),
    phoneCode: z.string().min(1, t('auth.verifyAccount.phoneCodeRequired')),
  });

// Mask email for display (e.g., ***********john@gmail.com)
const maskEmailDisplay = (email: string) => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  // Show last few characters of local part, mask the rest
  const visibleChars = Math.min(4, localPart.length);
  const masked = '*'.repeat(Math.max(11, localPart.length - visibleChars));
  return masked + localPart.slice(-visibleChars) + '@' + domain;
};

// Mask phone code for display (e.g., ***********172)
const maskPhoneCodeDisplay = (code: string) => {
  if (!code) return '';
  const visibleChars = Math.min(3, code.length);
  const masked = '*'.repeat(Math.max(11, code.length - visibleChars));
  return masked + code.slice(-visibleChars);
};

export const VerifyAccountForm: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Get email and phone from query params if available (for display only)
  const prefillEmail = searchParams.get('email') || '';
  const prefillPhone = searchParams.get('phone') || '';

  const verifyAccountSchema = createVerifyAccountSchema(t);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyAccountFormData>({
    resolver: zodResolver(verifyAccountSchema),
    defaultValues: {
      email: prefillEmail,
      phoneCode: prefillPhone,
    },
  });

  const emailValue = watch('email');
  const phoneCodeValue = watch('phoneCode');

  // TODO: Create verifyAccount service method if it doesn't exist
  const { mutate: sendVerificationCode, isPending } = useMutation({
    mutationFn: async (data: { email: string; phoneCode: string }) => {
      // Placeholder: Replace with actual API call when service method is available
      // return authService.verifyAccount(data);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ message: 'Verification code sent successfully' });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast.success(t('auth.verifyAccount.codeSentSuccessfully'));
      // Navigate to code verification page or show next step
      // navigate('/verify-code');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : t('auth.verifyAccount.failedToSendCode');
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: VerifyAccountFormData) => {
    sendVerificationCode({
      email: data.email,
      phoneCode: data.phoneCode,
    });
  };

  return (
    <div className="w-full max-w-lg animate-fadeIn">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <div className="relative">
          <Input
            type="email"
            placeholder={
              emailValue && emailValue.includes('@')
                ? maskEmailDisplay(emailValue)
                : t('auth.verifyAccount.emailPlaceholder')
            }
            {...register('email')}
            error={errors.email?.message}
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            iconPosition="left"
            className={emailValue && emailValue.includes('@') ? 'pr-12' : ''}
          />
          {emailValue && emailValue.includes('@') && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center z-10"
              aria-label="Information"
            >
              <Info className="h-3 w-3 text-white" />
            </button>
          )}
        </div>

        {/* Phone Code Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder={
              phoneCodeValue
                ? maskPhoneCodeDisplay(phoneCodeValue)
                : t('auth.verifyAccount.phoneCodePlaceholder')
            }
            {...register('phoneCode')}
            error={errors.phoneCode?.message}
            icon={<Phone className="h-5 w-5 text-gray-400" />}
            iconPosition="left"
            className={phoneCodeValue ? 'pr-12' : ''}
          />
          {phoneCodeValue && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center z-10"
              aria-label="Information"
            >
              <Info className="h-3 w-3 text-white" />
            </button>
          )}
        </div>

        {/* Send Code Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white px-8 py-3   shadow-md"
            isLoading={isPending}
          >
            {isPending
              ? t('auth.verifyAccount.sending')
              : t('auth.verifyAccount.sendCode')}
          </Button>
        </div>

        {/* Back to Login Link */}
        <div className="flex justify-start mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.verifyAccount.backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  );
};
