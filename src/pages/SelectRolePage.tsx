import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../features/auth/components/AuthLayout.tsx';
import { SelectRoleForm } from '../features/auth/components/SelectRoleForm.tsx';

export const SelectRolePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t('auth.selectRole.title')}
      description={t('auth.selectRole.description')}
    >
      <SelectRoleForm />
    </AuthLayout>
  );
};

