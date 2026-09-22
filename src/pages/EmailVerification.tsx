import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { authService } from '../features/auth/services/authService.ts';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => authService.verifyEmail(token),
    enabled: !!token,
    retry: 0,
    staleTime: Infinity,
  });

  const isSuccess = !!data && !isError;

  return (
    <div className="w-full flex justify-center items-center h-screen bg-[url('@assets/images/bg-auth-2.png')] bg-cover bg-center">
      <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-lg text-center animate-fadeIn">
        <div className="flex justify-center mb-4">
          {isLoading ? (
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          ) : (
            <span className="text-3xl">!</span>
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isLoading
            ? 'Verifying your email...'
            : isSuccess
            ? 'Email verified'
            : 'Verification failed'}
        </h2>
        <p className="text-base text-gray-600 mb-6">
          {isLoading &&
            'Please wait while we verify your email using the link you clicked.'}
          {!isLoading && isSuccess && (
            <>
              Your email has been successfully verified. You can now log in to
              your account.
            </>
          )}
          {!isLoading && !isSuccess && (
            <>
              The verification link is invalid or has expired. Please request a
              new verification email from the login or registration page.
            </>
          )}
        </p>

        {isSuccess && (
          <Link to="/login" className="block">
            <Button className="w-full">Go to login</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
