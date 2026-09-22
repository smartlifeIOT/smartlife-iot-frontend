import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GeneralSettings } from '../types/settings.types';

interface SettingsContext {
  settings: GeneralSettings | undefined;
  isLoading: boolean;
  handleSaveNotificationSettings: (settings: Partial<GeneralSettings>) => void;
  isSavingNotifications: boolean;
}
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function NotificationsTab(props: {
  handleSaveNotificationSettings?: (settings: Partial<GeneralSettings>) => void;
  settings?: GeneralSettings | undefined;
  isLoading?: boolean;
  isSaving?: boolean;
}) {
  const { t } = useTranslation();
  const context = useOutletContext<SettingsContext>();

  // Use props if provided, otherwise fallback to context
  const settings = props.settings ?? context?.settings;
  const isSaving = props.isSaving ?? context?.isSavingNotifications;
  const handleSaveNotificationSettings =
    props.handleSaveNotificationSettings ??
    context?.handleSaveNotificationSettings;
  // Local state for notification settings
  const [localSettings, setLocalSettings] = useState<Partial<GeneralSettings>>({
    emailNotifications: false,
    alarmNotifications: false,
    deviceStatusNotifications: false,
    weeklyReports: false,
    pushNotifications: false,
  });

  // Sync local state when settings prop changes
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        emailNotifications: settings.emailNotifications ?? true,
        alarmNotifications: settings.alarmNotifications ?? true,
        deviceStatusNotifications: settings.deviceStatusNotifications ?? true,
        weeklyReports: settings.weeklyReports ?? false,
        pushNotifications: settings.pushNotifications ?? true,
      });
    }
  }, [settings]);

  // Update local state when toggles change
  const handleToggle = (key: keyof GeneralSettings, value: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save to API only when save button is clicked
  const handleSave = () => {
    handleSaveNotificationSettings(localSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.notifications.preferences')}</CardTitle>
        <CardDescription>
          {t('settings.notifications.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-600 dark:text-white">
              {t('settings.notifications.email')}
            </Label>
            <p className="text-sm text-slate-500">
              {t('settings.notifications.emailDescription')}
            </p>
          </div>
          <Switch
            checked={localSettings.emailNotifications}
            onCheckedChange={(checked) =>
              handleToggle('emailNotifications', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-600 dark:text-white">
              {t('settings.notifications.alarms')}
            </Label>
            <p className="text-sm text-slate-500">
              {t('settings.notifications.alarmsDescription')}
            </p>
          </div>
          <Switch
            checked={localSettings.alarmNotifications}
            onCheckedChange={(checked) =>
              handleToggle('alarmNotifications', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-600 dark:text-white">
              {t('settings.notifications.deviceStatus')}
            </Label>
            <p className="text-sm text-slate-500">
              {t('settings.notifications.deviceStatusDescription')}
            </p>
          </div>
          <Switch
            checked={localSettings.deviceStatusNotifications}
            onCheckedChange={(checked) =>
              handleToggle('deviceStatusNotifications', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-600 dark:text-white">
              {t('settings.notifications.weeklyReports')}
            </Label>
            <p className="text-sm text-slate-500">
              {t('settings.notifications.weeklyReportsDescription')}
            </p>
          </div>
          <Switch
            checked={localSettings.weeklyReports}
            onCheckedChange={(checked) =>
              handleToggle('weeklyReports', checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-600 dark:text-white">
              {t('settings.notifications.push')}
            </Label>
            <p className="text-sm text-slate-500">
              {t('settings.notifications.pushDescription')}
            </p>
          </div>
          <Switch
            checked={localSettings.pushNotifications}
            onCheckedChange={(checked) =>
              handleToggle('pushNotifications', checked)
            }
          />
        </div>

        <Separator />

        <Button onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
          {t('settings.notifications.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
