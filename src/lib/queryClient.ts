import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/stores/useNotificationStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error: any) => {
        toast.error('Mutation Error', error.message);
      },
    },
  },
});