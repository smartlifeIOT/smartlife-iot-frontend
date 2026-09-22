// Export all API services
export * from './analytics.api';
export * from './devices.api';
export * from './assets.api';
export * from './profiles.api';
export * from './widgets.api';
export * from './dashboards.api';
export * from './notifications.api';
export * from './audit.api';
export * from './users.api';
export * from './alarms.api';
export * from '../../features/apiMonitoring/services/api-monitoring.api.ts';
export * from './attributes.api';
export * from './automation.api';
export * from '../../features/floorPlan/services/floor-plans.api.ts';
export * from './images.api';
export * from '../../features/integrations/sevices/integrations.api.ts';
export * from './nodes.api';
export * from './schedules.api';
export * from './scripts.api';
export * from './sharing.api';
export * from '../../features/solution-templates/services/solution-templates.api';
export * from '../../features/Subscription/services/subscriptions.api.ts';
export * from './tenants.api';
export * from './queues.api';
export * from './rules-chain.api';
export * from './default-rule-chains.api';
export * from './customers.api';
export * from './telemetry.api';

import { alarmsApi } from './alarms.api';
import { analyticsApi } from './analytics.api';
import { apiMonitoringApi } from '../../features/apiMonitoring/services/api-monitoring.api.ts';
import { assetsApi } from './assets.api';
import { attributesApi } from './attributes.api';
import { auditApi } from './audit.api';
import { automationApi } from './automation.api';
import { dashboardsApi } from './dashboards.api';
import { devicesApi } from './devices.api';
import { floorPlansApi } from '../../features/floorPlan/services/floor-plans.api.ts';
import { imagesApi } from './images.api';
import { integrationsApi } from '../../features/integrations/sevices/integrations.api.ts';
import { nodesApi } from './nodes.api';
import { notificationsApi } from './notifications.api';
import { profilesApi } from './profiles.api';
import { schedulesApi } from './schedules.api';
import { scriptsApi } from './scripts.api';
import { sharingApi } from './sharing.api';
import { solutionTemplatesApi } from '../../features/solution-templates/services/solution-templates.api.ts';
import { subscriptionsApi } from '../../features/Subscription/services/subscriptions.api.ts';
import { tenantsApi } from './tenants.api';
import { usersApi } from './users.api';
import { widgetsApi } from './widgets.api';
import { queuesApi } from './queues.api';
import { rulesChainApi } from './rules-chain.api';
import { defaultRuleChainsApi } from './default-rule-chains.api';
import { customersApi } from './customers.api';
import { telemetryApi } from './telemetry.api';

export const api = {
  alarms: alarmsApi,
  analytics: analyticsApi,
  apiMonitoring: apiMonitoringApi,
  assets: assetsApi,
  attributes: attributesApi,
  audit: auditApi,
  automation: automationApi,
  dashboards: dashboardsApi,
  devices: devicesApi,
  floorPlans: floorPlansApi,
  images: imagesApi,
  integrations: integrationsApi,
  nodes: nodesApi,
  notifications: notificationsApi,
  profiles: profilesApi,
  queues: queuesApi,
  rulesChain: rulesChainApi,
  defaultRuleChains: defaultRuleChainsApi,
  schedules: schedulesApi,
  scripts: scriptsApi,
  sharing: sharingApi,
  solutionTemplates: solutionTemplatesApi,
  subscriptions: subscriptionsApi,
  tenants: tenantsApi,
  users: usersApi,
  widgets: widgetsApi,
  customers: customersApi,
  telemetry: telemetryApi,
};

export default api;

// Re-export commonly used types
export type { PaginatedResponse, ApiResponse } from './devices.api';
