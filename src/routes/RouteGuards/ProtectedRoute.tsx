import React, { lazy } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { ROUTES } from '@/utils/constants/routes';
import { Loadable } from '@/components/common/Loadable';
// Lazy load layout component
const AppLayout = Loadable(
  lazy(() =>
    import('@/components/layout/AppLayout').then((module) => ({
      default: module.AppLayout,
    }))
  )
);
import { mainDashboardRoutes } from '@/routes/MainDashboardRoutes.tsx';
import { inventoryRoutes } from '@/routes/InventoryRoutes.tsx';
import { solutionRoutes } from '@/routes/SolutionRoutes.tsx';
import { managementRoutes } from '@/routes/ManagementRoutes.tsx';
import { connectivityRoutes } from '@/routes/ConnectivityRoutes.tsx';
import { resourceRoutes } from '@/routes/ResourceRoutes.tsx';
import { utilityRoutes } from '@/routes/UtilityRoutes.tsx';
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};
export const protectedRoutes = [
  ...mainDashboardRoutes,
  ...inventoryRoutes,
  ...solutionRoutes,
  ...managementRoutes,
  ...connectivityRoutes,
  ...resourceRoutes,
  ...utilityRoutes,
];
