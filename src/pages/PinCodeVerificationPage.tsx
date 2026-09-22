import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../features/auth/components/AuthLayout.tsx';
import { PinCodeVerificationForm } from '../features/auth/components/PinCodeVerificationForm.tsx';

export const PinCodeVerificationPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t('auth.pinCodeVerification.title')}
      description={t('auth.pinCodeVerification.description')}
    >
      <PinCodeVerificationForm />
    </AuthLayout>
  );
};

