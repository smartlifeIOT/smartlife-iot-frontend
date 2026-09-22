import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptions.api';
export interface ApiPlan {
  plan: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  trialPeriodDays: number;
  limits: {
    devices: number;
    users: number;
    customers: number;
    apiCallsPerMonth: number;
    dataRetentionDays: number;
    storageGB: number;
    dashboardTemplates: number;
    customDashboards: number;
    customIntegrations: number;
    webhooks: number;
    apiRateLimitPerMin: number;
    concurrentConnections: number;
    smsNotificationsPerMonth: number;
    historicalDataQueryDays: number;
    trainingSessions: number;
  };
  features: {
    realtimeAnalytics: boolean;
    advancedAutomation: boolean;
    ruleEngine: string;
    restApiAccess: boolean;
    mqttAccess: boolean;
    customIntegrations: boolean;
    whiteLabelBranding: boolean;
    brandingLevel: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    mobileAppAccess: boolean;
    widgetLibrary: string;
    alarmManagement: string;
    advancedAlarms: boolean;
    dataExport: string;
    scheduledReports: string;
    supportLevel: string;
    slaGuarantee: boolean;
    slaPercentage: number;
    onboardingSupport: string;
    floorMapping: number;
    customDevelopment: boolean;
    multiTenancy: boolean;
    customerManagement: boolean;
    roleBasedAccess: boolean;
    auditLogs: boolean;
    backupRecovery: boolean;
    otaUpdates: string;
    deviceGroups: boolean;
    assetManagement: string;
    geofencing: boolean;
    customAttributes: boolean;
    rpcCommands: boolean;
    dataAggregation: boolean;
  };
}

export const getSubscriptionPlans = () =>
  useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await subscriptionsApi.getPlans();
      // Handle API response structure: { data: { json: [...] } }
      const apiResponse = response.data as unknown as
        | { data?: { json?: ApiPlan[] } }
        | { json?: ApiPlan[] }
        | undefined;
      // Try different response structures
      if (
        apiResponse &&
        'json' in apiResponse &&
        Array.isArray(apiResponse.json)
      ) {
        return apiResponse.json;
      }
      if (
        apiResponse &&
        'data' in apiResponse &&
        apiResponse.data &&
        'json' in apiResponse.data &&
        Array.isArray(apiResponse.data.json)
      ) {
        return apiResponse.data.json;
      }
      if (
        apiResponse &&
        'data' in apiResponse &&
        Array.isArray(apiResponse.data)
      ) {
        return apiResponse.data;
      }
      return [];
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
