import { UserRole, hasPermission as checkPermission } from '../constants/roles';

export const checkResourcePermission = (
  userRole: UserRole,
  resource: string,
  action: string
): boolean => {
  return checkPermission(userRole, resource, action);
};

export const canAccessDashboard = (userRole: UserRole): boolean => {
  return checkPermission(userRole, 'dashboards', 'read');
};

export const canManageDevices = (userRole: UserRole): boolean => {
  return checkPermission(userRole, 'devices', 'create');
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return checkPermission(userRole, 'users', 'create');
};

export const canManageAlarms = (userRole: UserRole): boolean => {
  return checkPermission(userRole, 'alarms', 'create');
};

export const canViewSettings = (userRole: UserRole): boolean => {
  return checkPermission(userRole, 'settings', 'read');
};

export const canEditSettings = (userRole: UserRole): boolean => {
  return checkPermission(userRole, 'settings', 'update');
};

export const requiresPermission = (
  userRole: UserRole,
  resource: string,
  action: string
): void => {
  if (!checkPermission(userRole, resource, action)) {
    throw new Error(`Permission denied: ${action} on ${resource}`);
  }
};