import React from 'react';
import { AuthLayout } from '../features/auth/components/AuthLayout.tsx';
import { RegisterForm } from '../features/auth/components/RegisterForm.tsx';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout title="Create an account">
      <RegisterForm />
    </AuthLayout>
  );
};