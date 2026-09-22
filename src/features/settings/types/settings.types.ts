export type TwoFactorMethod = 'email' | 'sms' | 'authenticator' | 'none';

export interface GeneralSettings {
  id?: string;
  userId?: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  autoRefreshDashboard: boolean;
  dashboardRefreshInterval?: number;
  compactMode: boolean;
  // Legacy support
  autoRefresh?: boolean;
  emailNotifications: boolean;
  alarmNotifications: boolean;
  deviceStatusNotifications: boolean;
  weeklyReports: boolean;
  pushNotifications: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  alarmNotifications: boolean;
  deviceStatusNotifications: boolean;
  weeklyReports: boolean;
  pushNotifications: boolean;
}

export interface SecuritySettings {
  isEnabled: boolean;
  method: TwoFactorMethod;
  phoneNumber: string | null;
  phoneVerified: boolean;
  hasBackupCodes: boolean;
  sessionTimeout?: string;
}

export interface AccountSettings {
  accountType: string;
  storageUsed: number;
  storageTotal: number;
}

