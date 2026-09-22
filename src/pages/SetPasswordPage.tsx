import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '@/features/auth/components/AuthLayout.tsx';
import { authService } from '@/features/auth/services/authService.ts';
import { useMutation } from '@tanstack/react-query';
import { AccceptInivation } from '@/services/api/invitation.api';

const createSetPasswordSchema = () =>
  z
    .object({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

type SetPasswordFormData = z.infer<ReturnType<typeof createSetPasswordSchema>>;

export const SetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // redirect if no token in params
  if (!token) {
    navigate('/login');
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(createSetPasswordSchema()),
  });

  const { mutate: setPassword, isPending } = useMutation({
    // Replace this with the actual setPassword service call if it's different from resetPassword
    mutationFn: (data: any) => AccceptInivation.createPasswordInvitation(data),
    onSuccess: () => {
      toast.success('Password set successfully');
      navigate('/login');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to set password';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: SetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid or missing token.');
      return;
    }

    setPassword({
      password: data.password,
      token: token,
    });
  };

  return (
    <AuthLayout
      title="Set Password"
      description="Enter your new password below"
    >
      <div className="md:w-3/4 w-full animate-fadeIn">
        <div className="bg-white rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Input */}
            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                {...register('password')}
                error={errors.password?.message}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700"
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
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                }
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white px-8 py-3"
                isLoading={isPending}
              >
                {isPending ? 'Setting Password...' : 'Set Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};
