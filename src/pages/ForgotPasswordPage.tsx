import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../features/auth/components/AuthLayout.tsx';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm.tsx';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t('auth.forgotPassword.title')}
      description={t('auth.forgotPassword.description')}
    >
      <ForgotPasswordForm />
      {/* Back to Sign In*/}
    </AuthLayout>
  );
};
