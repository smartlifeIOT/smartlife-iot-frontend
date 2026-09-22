import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dashboard, dashboardsApi } from '@/services/api';
import toast from 'react-hot-toast';

export const useDashboard = (params?: Dashboard) => {
  return useQuery({
    queryKey: ['dashboards', params],
    queryFn: () => dashboardsApi.getAll(params),
  });
};

export const useDashboardById = (id: string) => {
  return useQuery({
    queryKey: ['dashboards', id],
    queryFn: () => dashboardsApi.getById(id),
  });
};

export const useDashboardUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dashboard> }) =>
      dashboardsApi.update(id, data),
    onSuccess: (_, { id }) => {
      // queryClient.invalidateQueries(['dashboards']);
      // queryClient.invalidateQueries(['dashboards', id]);
      toast.success('Dashboard updated successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update dashboard';
      toast.error(errorMessage);
    },
  });
};
