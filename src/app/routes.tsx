import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import {
  ProtectedRoute,
  protectedRoutes,
} from '@/routes/RouteGuards/ProtectedRoute';
import { PublicRoute, publicRoutes } from '@/routes/RouteGuards/PublicRoute';
import { Loadable } from '@/components/common/Loadable';
import { PaymentSuccess } from '@/components/common/PaymentSuccess';
import { SetPasswordPage } from '@/pages/SetPasswordPage';

// Lazy load error page component
const RouteErrorPage = Loadable(
  lazy(() =>
    import('@/pages/RouteErrorPage.tsx').then((module) => ({
      default: module.RouteErrorPage,
    }))
  )
);

export const router = createBrowserRouter([
  //  --------------------public routes--------------------
  {
    element: <PublicRoute />,
    errorElement: <RouteErrorPage />,
    children: publicRoutes,
  },
  //  --------------------protected routes--------------------
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: protectedRoutes,
  },
  {
    path: '/payment-status',
    element: <PaymentSuccess />,
  },
  {
    path: '/auth/accept-invitation',
    element: <SetPasswordPage />,
  },
]);
