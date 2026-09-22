import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/stores/useAppStore.ts';
import { authService } from '@/features/auth/services/authService.ts';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '@/features/auth/components/AuthLayout.tsx';
import localStorageService from '@/services/storage/localStorage.ts';
import { useThemeStore } from '@/stores/useThemeStore';
import { useTranslation } from 'react-i18next';
import { settingsService } from '@/features/settings/services/settingsService';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAppStore((state) => state.setUser);
  const { syncFromApi } = useThemeStore();
  const { i18n } = useTranslation();

  const code = searchParams.get('code');
  console.log(code, 'code');
  const {
    mutate: handleCallback,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (code: string) => authService.handleOAuthCallback(code),
    onSuccess: async (data) => {
      console.log('=== OAUTH CALLBACK SUCCESS ===');
      console.log(data, 'data');
      console.log('1. Data received:', {
        hasUser: !!data.data?.user || !!data.user,
        hasAccessToken: !!data.data?.accessToken || !!data.accessToken,
        hasRefreshToken: !!data.data?.refreshToken || !!data.refreshToken,
      });

      // Handle different response structures
      const accessToken = data.data?.accessToken || data.accessToken;
      const refreshToken = data.data?.refreshToken || data.refreshToken;
      const expiresIn = data.data?.expiresIn || data.expiresIn;
      const userData = data.data?.user || data.user;

      // Store tokens FIRST
      console.log('2. Storing tokens in localStorage...');
      if (accessToken) {
        localStorageService.setToken(accessToken);
      }
      if (refreshToken) {
        localStorageService.setRefreshToken(refreshToken);
      }
      if (expiresIn) {
        localStorageService.setExpiresIn(expiresIn);
      }

      console.log('3. Tokens stored:', {
        accessToken: localStorageService.getToken()?.substring(0, 20) + '...',
        refreshToken:
          localStorageService.getRefreshToken()?.substring(0, 20) + '...',
        expiresAt: localStorageService.getExpiresAt(),
      });
      console.log(userData, 'userData');

      // Update store SECOND
      if (userData) {
        // Transform user data to match useAppStore User interface
        const nameParts = userData.name?.split(' ') || [];
        const firstName = userData.firstName || nameParts[0] || '';
        const lastName =
          userData.lastName || nameParts.slice(1).join(' ') || '';

        const storeUser = {
          id: userData.id || '',
          email: userData.email || '',
          firstName,
          lastName,
          role: userData.role || '',
        };
        setAuth(storeUser);
      }

      console.log('4. Store updated:', {
        isAuthenticated: useAppStore.getState().isAuthenticated,
        hasUser: !!useAppStore.getState().user,
      });

      // Fetch and apply settings from API before navigating
      try {
        const settings = await settingsService.getGeneralSettings();

        // Sync theme from API (map 'system' to 'auto')
        if (settings.theme) {
          syncFromApi({ theme: settings.theme });
        }

        // Sync language from API
        if (settings.language) {
          syncFromApi({ language: settings.language });
          // Update i18n language immediately
          i18n.changeLanguage(settings.language);
        }

        console.log('6. Settings synced from API:', {
          theme: settings.theme,
          language: settings.language,
        });
      } catch (error) {
        console.warn(
          'Failed to fetch settings from API, using defaults:',
          error
        );
        // Continue with navigation even if settings fetch fails
      }

      console.log('7. Showing success toast');
      toast.success('Login successful!');

      console.log('8. Navigating to /dashboard');
      navigate('/dashboard', { replace: true });

      console.log('=== OAUTH CALLBACK FLOW COMPLETE ===');
    },
    onError: (error: unknown) => {
      console.error('OAuth callback error:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Authentication failed. Please try again.';
      toast.error(message);
      // Redirect to login on error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    },
  });

  useEffect(() => {
    if (code) {
      handleCallback(code);
    } else {
      console.error('No authorization code found in callback URL');
      toast.error('Authorization code not found. Please try again.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  }, [code, handleCallback, navigate]);

  return (
    <AuthLayout title="Completing sign in...">
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        {isPending && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2] mb-4"></div>
            <p className="text-sm text-[#545454]">
              Completing authentication...
            </p>
          </>
        )}
        {isError && (
          <>
            <div className="text-red-500 mb-4">✕</div>
            <p className="text-sm text-red-600">
              Authentication failed. Redirecting to login...
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
