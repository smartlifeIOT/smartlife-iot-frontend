import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { UserRole } from '@/utils/constants/roles';
import { ROUTES } from '@/utils/constants/routes';

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user && !allowedRoles.includes(user.role as UserRole)) {
    // Redirect to dashboard if user doesn't have permission
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};