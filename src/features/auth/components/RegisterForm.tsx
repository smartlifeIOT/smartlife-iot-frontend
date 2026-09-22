import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { PhoneInput } from '@/components/ui/phone-input.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { useRegister } from '../hooks/useRegister.ts';
import GoogleIcon from '@assets/icons/google.webp';
import AppleIcon from '@assets/icons/apple.svg';
import GithubIcon from '@assets/icons/github.svg';

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

const createRegisterSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(2, t('auth.register.firstNameMinLength')),
    lastName: z.string().min(2, t('auth.register.lastNameMinLength')),
    email: z.string().email(t('auth.register.emailInvalid')),
    phone: z
      .string()
      .min(1, t('auth.register.mobileRequired'))
      .refine(
        (val) => {
          // Validate international phone number format
          if (!val || val.trim() === '') {
            return false;
          }
          return isValidPhoneNumber(val);
        },
        {
          message: t('auth.register.mobileInvalid'),
        }
      ),
    companyName: z.string(),
    password: z
      .string()
      .min(1, t('auth.register.passwordRequired'))
      .min(8, t('auth.register.passwordMinLength'))
      .refine((val) => /[a-z]/.test(val), {
        message: t('auth.register.passwordRequiresLowercase'),
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: t('auth.register.passwordRequiresUppercase'),
      })
      .refine((val) => /\d/.test(val), {
        message: t('auth.register.passwordRequiresNumber'),
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>[\]\\/_+\-=~`]/.test(val), {
        message: t('auth.register.passwordRequiresSpecialChar'),
      }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t('auth.register.acceptTermsError'),
    }),
  });

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const registerSchema = createRegisterSchema(t);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { firstName, lastName, acceptTerms, ...rest } = data;

    register({
      name: `${firstName} ${lastName}`,
      ...rest,
    });
  };

  return (
    <div className="w-full animate-fadeIn">
      {/* Social Signup Buttons */}
      <div className="flex  flex-col md:flex-row gap-3 mb-8">
        <Button
          variant="social"
          className="flex-1 h-12 rounded-full text-xs"
          type="button"
        >
          <img src={GoogleIcon} alt="Google" className="w-4 h-4 mr-2" />
          {t('auth.register.signUpWithGoogle')}
        </Button>
        {/* <Button
          variant="social"
          className="flex-1 h-12 rounded-full text-xs"
          type="button"
        >
          <img src={AppleIcon} alt="Apple" className="w-4 h-4 mr-2" />
          {t('auth.register.signUpWithApple')}
        </Button> */}
        <Button
          variant="social"
          className="flex-1 h-12 rounded-full text-xs"
          type="button"
        >
          <img src={GithubIcon} alt="GitHub" className="w-5 h-5 mr-2" />
          {t('auth.register.signUpWithGithub')}
        </Button>
      </div>

      {/* Error Message */}
      {/* {error && (
        <div className="mb-6 p-4 bg-[#DB42900D] rounded-[40px] border border-[#DB4290]">
          <p className="text-[20px] text-[#DB4290] text-center">
            {error.message}
          </p>
        </div>
      )} */}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* First Name */}
        <div>
          <Input
            type="text"
            placeholder={t('auth.register.firstNamePlaceholder')}
            {...formRegister('firstName')}
            error={errors.firstName?.message}
          />
        </div>

        {/* Last Name */}
        <div>
          <Input
            type="text"
            placeholder={t('auth.register.lastNamePlaceholder')}
            {...formRegister('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        {/* Email */}
        <div>
          <Input
            type="email"
            placeholder={t('auth.register.emailPlaceholder')}
            {...formRegister('email')}
            error={errors.email?.message}
          />
        </div>

        {/* Phone Number */}
        <div>
          <PhoneInput
            placeholder={t('auth.register.mobilePlaceholder')}
            value={watch('phone') || ''}
            onChange={(value: string | undefined) => {
              const phoneValue = value ?? '';
              setValue('phone', phoneValue, { shouldValidate: true });
            }}
            error={errors.phone?.message}
            defaultCountry="SA"
          />
        </div>
        <div>
          <Input
            type="text"
            placeholder={t('auth.register.companyName')}
            {...formRegister('companyName')}
            error={errors.companyName?.message}
          />
        </div>

        {/* Password */}
        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.register.passwordPlaceholder')}
            {...formRegister('password')}
            error={errors.password?.message}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#949CA9]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </div>
        <div className="flex justify-between">
          {/* Terms & Conditions */}
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              {...formRegister('acceptTerms')}
              label={t('auth.register.acceptTerms')}
            />
            {errors.acceptTerms && (
              <p className="text-xs text-red-500  ">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Register Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              className="px-12"
              isLoading={isPending}
            >
              {isPending
                ? t('auth.register.registering')
                : t('auth.register.registerButton')}
            </Button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-[#545454]">
            {t('auth.register.alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="text-[#1976D2] font-semibold hover:underline"
            >
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
