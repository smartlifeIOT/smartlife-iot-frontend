import { useTranslation } from 'react-i18next';
import { Settings, Bell, Shield, User } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGeneralSettings } from '@/features/settings/hooks';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { PageHeader } from '@/components/common/PageHeader';

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    settings,
    isLoading,
    isSaving,
    handleGeneralSettingsSave,
    handleSaveNotificationSettings,
    isSavingNotifications,
    isError,
  } = useGeneralSettings();

  // Get current tab from URL (e.g., /settings/general -> general)
  const currentTab = location.pathname.split('/').pop() || 'general';

  const handleTabChange = (value: string) => {
    navigate(`/settings/${value}`);
  };

  if (isError) {
    return (
      <ErrorMessage
        title={t('common.failedToLoadSettings')}
        onRetry={() => window.location.reload()}
      />
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        defaultValue="general"
        className="space-y-4"
      >
        <TabsList className="dark:bg-gray-800 dark:text-white">
          <TabsTrigger value="general" className="dark:text-white">
            <Settings className="h-4 w-4 mr-2" />
            {t('settings.tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="dark:text-white">
            <Bell className="h-4 w-4 mr-2" />
            {t('settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="dark:text-white">
            <Shield className="h-4 w-4 mr-2" />
            {t('settings.tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="account" className="dark:text-white">
            <User className="h-4 w-4 mr-2" />
            {t('settings.tabs.account')}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Outlet
            context={{
              settings,
              isLoading,
              isSaving,
              handleGeneralSettingsSave,
              handleSaveNotificationSettings,
              isSavingNotifications,
            }}
          />
        </div>
      </Tabs>
    </div>
  );
}
