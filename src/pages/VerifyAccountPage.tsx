import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../features/auth/components/AuthLayout.tsx';
import { VerifyAccountForm } from '../features/auth/components/VerifyAccountForm.tsx';

export const VerifyAccountPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t('auth.verifyAccount.title')}
      description={t('auth.verifyAccount.description')}
    >
      <VerifyAccountForm />
    </AuthLayout>
  );
};

