import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/features/Subscription/services/subscriptions.api';
import { useAppStore } from '@/stores/useAppStore';
import { SubscriptionFeatures } from '@/types/authentication';

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  billingPeriod: string;
  price: string;
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  limits: {
    users: number;
    assets: number;
    devices: number;
    customers: number;
    storageGB: number;
    dashboards: number;
    floorPlans: number;
    automations: number;
    apiCallsPerMonth: number;
    smsNotificationsPerMonth: number;
  };
  usage: {
    users: number;
    assets: number;
    devices: number;
    apiCalls: number;
    customers: number;
    storageGB: number;
    dashboards: number;
    floorPlans: number;
    automations: number;
    smsNotifications: number;
  };
  features: SubscriptionFeatures;
  trialEndsAt: string | null;
  cancelledAt: string | null;
}

export const useCurrentSubscription = () => {
  const setFeatures = useAppStore((state) => state.setFeatures);

  const query = useQuery({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      const response = await subscriptionsApi.getCurrent();
      const apiResponse = response.data as unknown as
        | { data?: Subscription }
        | undefined;
      return apiResponse?.data;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  // Sync features with useAppStore whenever data is fetched successfully
  useEffect(() => {
    if (query.data?.features) {
      setFeatures(query.data.features);
    }
  }, [query.data?.features, setFeatures]);

  return query;
};
