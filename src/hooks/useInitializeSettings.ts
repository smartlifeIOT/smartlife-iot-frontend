import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/stores/useAppStore';
import { settingsService } from '@/features/settings/services/settingsService';
import { useThemeStore } from '@/stores/useThemeStore';
import { useTranslation } from 'react-i18next';
import type { GeneralSettings } from '@/features/settings/types/settings.types';

// Global flag to ensure initialization only happens once across all instances
let hasInitialized = false;

/**
 * Hook to initialize user settings from API after login
 * Fetches settings and syncs theme and language to theme store before UI renders
 * Only runs once on first render when authenticated
 */
export const useInitializeSettings = () => {
  const { isAuthenticated } = useAppStore();
  const { syncFromApi } = useThemeStore();
  const { i18n } = useTranslation();
  const hasRunRef = useRef(false);

  const { data: settings, isLoading } = useQuery<GeneralSettings>({
    queryKey: ['generalSettings', 'initialize'],
    queryFn: settingsService.getGeneralSettings,
    enabled: isAuthenticated && !hasInitialized, // Only fetch if user is authenticated and not yet initialized
    staleTime: Infinity,  
    retry: 1,
  });

  useEffect(() => {
    // Only run once on first render when authenticated and settings are loaded
    if (settings && isAuthenticated && !hasInitialized && !hasRunRef.current) {
      hasInitialized = true;
      hasRunRef.current = true;
      
      // Sync theme from API
      if (settings.theme) {
        const themeForStore = settings.theme;
        syncFromApi({ theme: themeForStore });
      }

      // Sync language from API
      if (settings.language) {
        syncFromApi({ language: settings.language });
        // Update i18n language immediately
        i18n.changeLanguage(settings.language);
      }
    }
  }, [settings, isAuthenticated, syncFromApi, i18n]);

  return { isLoading };
};
