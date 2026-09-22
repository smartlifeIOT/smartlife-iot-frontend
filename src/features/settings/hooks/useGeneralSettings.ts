import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { settingsService } from '../services/settingsService';
import type { GeneralSettings, NotificationSettings } from '../types/settings.types';
import { useThemeStore } from '@/stores/useThemeStore';

export const useGeneralSettings = () => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { setTheme, setLanguage, syncFromApi } = useThemeStore();
//  get settings from api
  const { data, isLoading, isError } = useQuery<GeneralSettings>({
    queryKey: ['generalSettings'],
    queryFn: settingsService.getGeneralSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
    
  // update settings in api
  const updateMutation = useMutation({
    mutationFn: settingsService.updateGeneralSettings,
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['generalSettings'], updatedData);
      // Sync updated settings to store
      if (updatedData.theme) {
        syncFromApi({ theme: updatedData.theme });
      }
      if (updatedData.language) {
        syncFromApi({ language: updatedData.language });
        i18n.changeLanguage(updatedData.language);
      }
      toast.success('General settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save general settings');
    },
  });

  // update notification settings in api
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: settingsService.updateNotificationSettings,
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['notificationSettings'], updatedData);
      toast.success('Notification settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save notification settings');
    },
  });
  // update the general settings in api
  const updateGeneralSettingsMutation = useMutation({
    mutationFn: settingsService.updateGeneralSettings,
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['generalSettings'], updatedData);
      toast.success('General settings saved successfully');
      // Sync updated settings to store after successful save
      if (updatedData.theme) {
        syncFromApi({ theme: updatedData.theme });
      }
      if (updatedData.language) {
        syncFromApi({ language: updatedData.language });
        i18n.changeLanguage(updatedData.language);
      }
    },
    onError: () => {
      toast.error('Failed to save general settings');
    },
  });
  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale);
    setLanguage(locale);
    updateMutation.mutate({ language: locale });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    setTheme(theme);
    updateMutation.mutate({ theme });
  };

  const handleAutoRefreshToggle = (enabled: boolean) => {
    updateMutation.mutate({ autoRefreshDashboard: enabled });
  };

  const handleCompactModeToggle = (enabled: boolean) => {
    updateMutation.mutate({ compactMode: enabled });
  };

  const handleSaveAll = (settings: Partial<GeneralSettings>) => {
    // Map legacy autoRefresh to autoRefreshDashboard if needed
    const updateData: Partial<GeneralSettings> = { ...settings };
    if ('autoRefresh' in updateData && !('autoRefreshDashboard' in updateData)) {
      updateData.autoRefreshDashboard = updateData.autoRefresh as boolean;
      delete updateData.autoRefresh;
    }
    updateMutation.mutate(updateData);
  };
 
  const handleToggle = (key: keyof GeneralSettings, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const handleSaveNotificationSettings = (settings: Partial<NotificationSettings>) => {
    updateNotificationSettingsMutation.mutate(settings);
  };
  const handleGeneralSettingsSave = (settings: Partial<GeneralSettings>) => {
    updateGeneralSettingsMutation.mutate(settings);
  };

  return {
    settings: data,
    isLoading,
    isError,
    handleLanguageChange,
    handleThemeChange,
    handleAutoRefreshToggle,
    handleCompactModeToggle,
    handleSaveAll,
    handleGeneralSettingsSave,
    updateNotificationSettingsMutation,
    isSaving: updateMutation.isPending,
    isSavingNotifications: updateNotificationSettingsMutation.isPending,
    handleToggle,
    handleSaveNotificationSettings
  };
};

