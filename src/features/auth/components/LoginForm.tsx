import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useLogin } from '../hooks/useLogin.ts';
import { Link } from 'react-router-dom';

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('auth.login.emailRequired'))
      .email(t('auth.login.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.login.passwordRequired'))
      .min(6, t('auth.login.passwordMinLength')),
  });

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error } = useLogin();

  const loginSchema = createLoginSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="  w-full animate-fadeIn">
      {error ? (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            {t('auth.login.loginError')}
          </p>
        </div>
      ) : null}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <Input
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          {...register('email')}
          error={errors.email?.message}
        />

        {/* Password Input */}
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.login.passwordPlaceholder')}
          {...register('password')}
          error={errors.password?.message}
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />
        {/* Login Button */}
        <div className="flex justify-between items-center">
          <Button
            type="submit"
            size="lg"
            className="px-12"
            isLoading={isPending}
          >
            {isPending
              ? t('auth.login.loggingIn')
              : t('auth.login.loginButton')}
          </Button>

          <div className="flex justify-start">
            <Link
              to="/forgot-password"
              className="text-sm text-[#545454] dark:text-white underline hover:text-[#1976D2] transition-colors"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
