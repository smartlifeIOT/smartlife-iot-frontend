import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import { usersApi } from '@/services/api';

export const useAccountSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['accountSettings'],
    queryFn: settingsService.getAccountSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    settings: data,
    isLoading,
  };
};
export const useGetCurrentUser = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await usersApi.getCurrentUser();
      return res.data.data;
    },
  });
  return {
    data,
    isLoading,
  };
};
