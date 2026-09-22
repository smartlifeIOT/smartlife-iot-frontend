import React from 'react';
import { ResetPasswordForm } from '../features/auth/components/ResetPasswordForm.tsx';
import { AuthLayout } from '@/features/auth/components/AuthLayout.tsx';

export const ResetPasswordPage: React.FC = () => {
  return (
     <AuthLayout title='Reset Password' description='Enter your new password below'>
      <ResetPasswordForm />
      </AuthLayout>
  );
};

