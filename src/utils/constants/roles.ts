// User Roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
  OPERATOR = 'operator',
  MANAGER = 'manager',
}

// Role Permissions
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: {
    devices: ['create', 'read', 'update', 'delete', 'command'],
    users: ['create', 'read', 'update', 'delete'],
    dashboards: ['create', 'read', 'update', 'delete', 'share'],
    alarms: ['create', 'read', 'update', 'delete', 'acknowledge', 'clear'],
    rules: ['create', 'read', 'update', 'delete', 'toggle'],
    tenants: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
  },
  [UserRole.MANAGER]: {
    devices: ['create', 'read', 'update', 'command'],
    users: ['read', 'update'],
    dashboards: ['create', 'read', 'update', 'share'],
    alarms: ['read', 'update', 'acknowledge', 'clear'],
    rules: ['create', 'read', 'update', 'toggle'],
    tenants: ['read'],
    settings: ['read'],
  },
  [UserRole.OPERATOR]: {
    devices: ['read', 'update', 'command'],
    users: ['read'],
    dashboards: ['read', 'update'],
    alarms: ['read', 'acknowledge'],
    rules: ['read', 'toggle'],
    tenants: ['read'],
    settings: ['read'],
  },
  [UserRole.USER]: {
    devices: ['read', 'update'],
    users: ['read'],
    dashboards: ['read'],
    alarms: ['read'],
    rules: ['read'],
    tenants: ['read'],
    settings: ['read'],
  },
  [UserRole.VIEWER]: {
    devices: ['read'],
    users: ['read'],
    dashboards: ['read'],
    alarms: ['read'],
    rules: ['read'],
    tenants: ['read'],
    settings: ['read'],
  },
} as const;

// Role Labels
export const ROLE_LABELS = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.OPERATOR]: 'Operator',
  [UserRole.USER]: 'User',
  [UserRole.VIEWER]: 'Viewer',
} as const;

// Role Descriptions
export const ROLE_DESCRIPTIONS = {
  [UserRole.ADMIN]: 'Full system access with all permissions',
  [UserRole.MANAGER]: 'Manage devices, users, and dashboards',
  [UserRole.OPERATOR]: 'Operate devices and manage alarms',
  [UserRole.USER]: 'View and update own devices and dashboards',
  [UserRole.VIEWER]: 'Read-only access to the system',
} as const;

// Helper functions
export const hasPermission = (
  role: UserRole,
  resource: string,
  action: string
): boolean => {
  const permissions: any = ROLE_PERMISSIONS[role];
  return (
    permissions[resource as keyof typeof permissions]?.includes(action) ?? false
  );
};

export const isAdmin = (role: UserRole): boolean => role === UserRole.ADMIN;

export const isManager = (role: UserRole): boolean =>
  role === UserRole.ADMIN || role === UserRole.MANAGER;

export const canCreate = (role: UserRole, resource: string): boolean =>
  hasPermission(role, resource, 'create');

export const canUpdate = (role: UserRole, resource: string): boolean =>
  hasPermission(role, resource, 'update');

export const canDelete = (role: UserRole, resource: string): boolean =>
  hasPermission(role, resource, 'delete');

export const canRead = (role: UserRole, resource: string): boolean =>
  hasPermission(role, resource, 'read');
