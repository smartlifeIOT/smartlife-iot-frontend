import React, { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { DASHBOARD_ROUTES } from '@/utils/constants/routes';
import { Loadable } from '@/components/common/Loadable';
import { PaymentSuccess } from '@/components/common/PaymentSuccess';

// Import public page components lazily
const LoginPage = Loadable(
  lazy(() =>
    import('@/pages/LoginPage.tsx').then((module) => ({
      default: module.LoginPage,
    }))
  )
);
const RegisterPage = Loadable(
  lazy(() =>
    import('@/pages/RegisterPage.tsx').then((module) => ({
      default: module.RegisterPage,
    }))
  )
);
const ForgotPasswordPage = Loadable(
  lazy(() =>
    import('@/pages/ForgotPasswordPage.tsx').then((module) => ({
      default: module.ForgotPasswordPage,
    }))
  )
);
const CheckEmailPage = Loadable(
  lazy(() =>
    import('@/pages/CheckEmailPage.tsx').then((module) => ({
      default: module.CheckEmailPage,
    }))
  )
);
const ResetPasswordPage = Loadable(
  lazy(() =>
    import('@/pages/ResetPasswordPage.tsx').then((module) => ({
      default: module.ResetPasswordPage,
    }))
  )
);
const SetPasswordPage = Loadable(
  lazy(() =>
    import('@/pages/SetPasswordPage.tsx').then((module) => ({
      default: module.SetPasswordPage,
    }))
  )
);
const AccountBlockedPage = Loadable(
  lazy(() =>
    import('@/pages/AccountBlockedPage.tsx').then((module) => ({
      default: module.AccountBlockedPage,
    }))
  )
);
const VerifyAccountPage = Loadable(
  lazy(() =>
    import('@/pages/VerifyAccountPage.tsx').then((module) => ({
      default: module.VerifyAccountPage,
    }))
  )
);
const PinCodeVerificationPage = Loadable(
  lazy(() =>
    import('@/pages/PinCodeVerificationPage.tsx').then((module) => ({
      default: module.PinCodeVerificationPage,
    }))
  )
);
const SelectRolePage = Loadable(
  lazy(() =>
    import('@/pages/SelectRolePage.tsx').then((module) => ({
      default: module.SelectRolePage,
    }))
  )
);
const OAuthCallbackPage = Loadable(
  lazy(() =>
    import('@/pages/OAuthCallbackPage.tsx').then((module) => ({
      default: module.OAuthCallbackPage,
    }))
  )
);
const PublicNotFoundPage = Loadable(
  lazy(() => import('@/pages/PublicNotFoundPage.tsx'))
);
const EmailVerification = Loadable(
  lazy(() => import('@/pages/EmailVerification.tsx'))
);

export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  CHECK_EMAIL: '/check-email',
  ACCOUNT_BLOCKED: '/account-blocked',
  VERIFY_ACCOUNT: '/verify-account',
  VERIFY_PIN: '/verify-pin',
  SELECT_ROLE: '/select-role',
  AUTH_CALLBACK: '/auth/callback',
} as const;

export const PublicRoute = () => {
  const { isAuthenticated } = useAppStore();

  if (isAuthenticated) {
    // Redirect to dashboard if already logged in
    return <Navigate to={DASHBOARD_ROUTES.OVERVIEW} replace />;
  }

  return <Outlet />;
};

// Define and export the list of public routes
export const publicRoutes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: PUBLIC_ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PUBLIC_ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: PUBLIC_ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: PUBLIC_ROUTES.CHECK_EMAIL,
    element: <CheckEmailPage />,
  },
  {
    path: PUBLIC_ROUTES.VERIFY_EMAIL,
    element: <EmailVerification />,
  },
  {
    path: PUBLIC_ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },

  {
    path: PUBLIC_ROUTES.ACCOUNT_BLOCKED,
    element: <AccountBlockedPage />,
  },
  {
    path: PUBLIC_ROUTES.VERIFY_ACCOUNT,
    element: <VerifyAccountPage />,
  },
  {
    path: PUBLIC_ROUTES.VERIFY_PIN,
    element: <PinCodeVerificationPage />,
  },
  {
    path: PUBLIC_ROUTES.SELECT_ROLE,
    element: <SelectRolePage />,
  },
  {
    path: PUBLIC_ROUTES.AUTH_CALLBACK,
    element: <OAuthCallbackPage />,
  },
  {
    path: '*',
    element: <PublicNotFoundPage />,
  },
];
