import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { settingsService } from '../services/settingsService';
import type { NotificationSettings } from '../types/settings.types';

export const useNotificationSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: settingsService.getNotificationSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateNotificationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['notificationSettings'], data);
      toast.success('Notification preferences saved successfully');
    },
    onError: () => {
      toast.error('Failed to save notification preferences');
    },
  });

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const handleSaveAll = (settings: Partial<NotificationSettings>) => {
    updateMutation.mutate(settings);
  };

  return {
    settings: data,
    isLoading,
    handleToggle,
    handleSaveAll,
    isSaving: updateMutation.isPending,
  };
};

