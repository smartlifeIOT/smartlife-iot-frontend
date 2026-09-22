import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService.ts';
import { toast } from 'react-hot-toast';

export const CheckEmailForm: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const { mutate: resendEmail, isPending: isResending } = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success(t('auth.checkEmail.resendSuccess'));
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
          : t('auth.checkEmail.resendError');
      toast.error(errorMessage);
    },
  });

  const handleResend = () => {
    if (email) {
      resendEmail({ email });
    }
  };

  return (
    <div className="w-full max-w-lg animate-fadeIn">
      {/* Main Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('auth.checkEmail.title')}
        </h2>
        {/* Instructional Text */}
        <p className="text-base text-gray-600 mb-6">
          {t('auth.checkEmail.instruction', { email })}
        </p>
        {/* Resend Section */}
        <div className="mb-6">
          <span className="text-sm text-gray-500">
            {t('auth.checkEmail.dontReceiveEmail')}{' '}
          </span>
          <button
            onClick={handleResend}
            disabled={isResending || !email}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? t('auth.checkEmail.resending')
              : t('auth.checkEmail.clickToResend')}
          </button>
        </div>
        {/* Back to Login Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.checkEmail.backToLogin')}
        </Link>
      </div>
    </div>
  );
};
