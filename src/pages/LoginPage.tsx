import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../features/auth/components/AuthLayout.tsx';
import { LoginForm } from '../features/auth/components/LoginForm.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router-dom';
import { useGoogleLogin } from '../features/auth/hooks/useGoogleLogin.ts';
import { useGithubLogin } from '../features/auth/hooks/useGithubLogin.ts';
import GoogleIcon from '../assets/icons/google.webp';
import AppleIcon from '../assets/icons/apple.svg';
import GithubIcon from '../assets/icons/github.svg';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { handleGoogleLogin } = useGoogleLogin();
  const { handleGithubLogin } = useGithubLogin();

  return (
    <AuthLayout title="Login">
      {/* Social Login Buttons */}
      <div className="flex  flex-col md:flex-row gap-3 mb-8">
        <Button
          variant="social"
          className="flex-1 h-12 rounded-full text-xs dark:bg-gray-800  dark:text-white dark:hover:bg-gray-700"
          type="button"
          onClick={handleGoogleLogin}
        >
          <img src={GoogleIcon} alt="Google" className="w-4 h-4 mr-2" />
          {t('auth.login.loginWithGoogle')}
        </Button>
        <Button
          variant="social"
          className="flex-1 h-12 rounded-full text-xs dark:bg-gray-800  dark:text-white dark:hover:bg-gray-700"
          type="button"
        >
          <img src={AppleIcon} alt="Apple" className="w-4 h-4 mr-2" />
          Sign up with Apple
        </Button>
        <Button
          variant="social"
          className="flex-1 h-12 rounded-full text-xs dark:bg-gray-800  dark:text-white dark:hover:bg-gray-700"
          type="button"
          onClick={handleGithubLogin}
        >
          <img src={GithubIcon} alt="GitHub" className="w-5 h-5 mr-2" />
          {t('auth.login.loginWithGithub')}
        </Button>
      </div>

      <LoginForm />
      {/* Forgot Password Link */}

      {/* Register Link */}
      <div className="text-center mt-20">
        <p className="text-sm text-[#545454]">
          {t('auth.login.donthaveaccount')}
          <Link
            to="/register"
            className="text-[#1976D2]   font-semibold hover:underline"
          >
            {t('common.signup')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
