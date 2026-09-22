import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService.ts';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

const createForgotPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t('auth.forgotPassword.emailInvalid')),
});

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const forgotPasswordSchema = createForgotPasswordSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate: forgotPassword, isPending } = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (_, variables) => {
      toast.success(t('auth.forgotPassword.passwordResetLinkSent'));
      navigate(`/check-email?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: unknown) => {
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data &&
         typeof error.response.data.message === 'string')
          ? error.response.data.message
          : t('auth.forgotPassword.failedToSendResetLink');
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data);
  };

  return (
    <div className="max-w-md">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        {/* Email Input */}
        <div>
          <Input
            type="email"
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            {...register('email')}
            className="w-full"
            error={errors.email?.message}
          />
        </div>
        {/* Reset Password Button */}
        <Button size={'lg'} className="w-full" type="submit" isLoading={isPending}>
          {isPending ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.resetPassword')}
        </Button>
      </form>
      <Link
          to="/login"
          className="inline-flex  mt-4 md:mt-6  items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.forgotPassword.backToSignIn')}
        </Link>
    </div>
  );
};
