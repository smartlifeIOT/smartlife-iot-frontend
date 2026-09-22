import { PUBLIC_ROUTES } from '@/routes/RouteGuards/PublicRoute';

// Dashboard Routes
export const DASHBOARD_ROUTES = {
  OVERVIEW: '/dashboard',
  DEVICES: '/dashboard/devices',
  DEVICE_DETAIL: '/dashboard/devices/:id',
  ASSETS: '/dashboard/assets',
  ASSET_DETAIL: '/dashboard/assets/:id',
  DASHBOARDS: '/dashboard/dashboards',
  DASHBOARD_DETAIL: '/dashboard/dashboards/:id',
  ALARMS: '/dashboard/alarms',
  ALARM_DETAIL: '/dashboard/alarms/:id',
  RULES: '/dashboard/rules',
  RULE_DETAIL: '/dashboard/rules/:id',
  ANALYTICS: '/dashboard/analytics',
  FLOOR_PLANS: '/dashboard/floor-plans',
  FLOOR_PLAN_DETAIL: '/dashboard/floor-plans/:id',
} as const;

// Settings Routes
export const SETTINGS_ROUTES = {
  PROFILE: '/settings/profile',
  ACCOUNT: '/settings/account',
  SECURITY: '/settings/security',
  NOTIFICATIONS: '/settings/notifications',
  PREFERENCES: '/settings/preferences',
  INTEGRATIONS: '/settings/integrations',
  API_KEYS: '/settings/api-keys',
} as const;

// Admin Routes
export const ADMIN_ROUTES = {
  USERS: '/admin/users',
  USER_DETAIL: '/admin/users/:id',
  TENANTS: '/admin/tenants',
  TENANT_DETAIL: '/admin/tenants/:id',
  SUBSCRIPTIONS: '/admin/subscriptions',
  AUDIT_LOGS: '/admin/audit-logs',
  API_MONITORING: '/admin/api-monitoring',
  SYSTEM_SETTINGS: '/admin/system-settings',
} as const;

// All Routes Combined
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...DASHBOARD_ROUTES,
  ...SETTINGS_ROUTES,
  ...ADMIN_ROUTES,
} as const;

// Route Builder Helpers
export const buildRoute = (
  route: string,
  params: Record<string, string>
): string => {
  let builtRoute = route;
  Object.entries(params).forEach(([key, value]) => {
    builtRoute = builtRoute.replace(`:${key}`, value);
  });
  return builtRoute;
};

export const getDeviceRoute = (id: string): string =>
  buildRoute(DASHBOARD_ROUTES.DEVICE_DETAIL, { id });

export const getAssetRoute = (id: string): string =>
  buildRoute(DASHBOARD_ROUTES.ASSET_DETAIL, { id });

export const getDashboardRoute = (id: string): string =>
  buildRoute(DASHBOARD_ROUTES.DASHBOARD_DETAIL, { id });

export const getAlarmRoute = (id: string): string =>
  buildRoute(DASHBOARD_ROUTES.ALARM_DETAIL, { id });

export const getRuleRoute = (id: string): string =>
  buildRoute(DASHBOARD_ROUTES.RULE_DETAIL, { id });

export const getUserRoute = (id: string): string =>
  buildRoute(ADMIN_ROUTES.USER_DETAIL, { id });

export const getTenantRoute = (id: string): string =>
  buildRoute(ADMIN_ROUTES.TENANT_DETAIL, { id });

export default ROUTES;
