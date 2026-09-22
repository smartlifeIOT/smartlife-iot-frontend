import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService.ts';
import { toast } from 'react-hot-toast';

type ResetPasswordFormData = z.infer<ReturnType<typeof createResetPasswordSchema>>;

const createResetPasswordSchema = (t: (key: string) => string) => z.object({
  password: z.string().min(8, t('auth.resetPassword.passwordMinLength')),
  confirmPassword: z.string().min(1, t('auth.resetPassword.confirmPasswordRequired')),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.resetPassword.passwordsDoNotMatch'),
  path: ['confirmPassword'],
});

export const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordSchema = createResetPasswordSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success(t('auth.resetPassword.passwordUpdatedSuccessfully'));
      navigate('/login');
    },
    onError: (error: unknown) => {
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data &&
         typeof error.response.data.message === 'string')
          ? error.response.data.message
          : t('auth.resetPassword.failedToUpdatePassword');
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword({
      password: data.password,
      confirmPassword: data.confirmPassword,
      token: token || undefined,
    });
  };

  return (
    <div className="md:w-3/4 w-full    animate-fadeIn">
      {/* Main Card */}
      <div className="bg-white rounded-2xl   ">
        

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Password Input */}
          <div>
             
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.resetPassword.passwordPlaceholder')}
              {...register('password')}
              error={errors.password?.message}
              icon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />
          </div>

          {/* Confirm Password Input */}
          <div>
             
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              icon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />
          </div>

          {/* Update Password Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white px-8 py-3  "
              isLoading={isPending}
            >
              {isPending ? t('auth.resetPassword.updating') : t('auth.resetPassword.updatePassword')}
            </Button>
          </div>

          {/* Back to Sign up Link */}
          <div className="flex justify-start mt-6">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.resetPassword.backToSignUp')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

