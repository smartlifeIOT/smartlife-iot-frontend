import { useQuery } from '@tanstack/react-query';
import {
  subscriptionsApi,
  Usage,
} from '@/features/Subscription/services/subscriptions.api';

export const useUsage = () => {
  return useQuery({
    queryKey: ['subscription-usage'],
    queryFn: async () => {
      const response = await subscriptionsApi.getUsage();
      return response.data.data;
    },
  });
};
