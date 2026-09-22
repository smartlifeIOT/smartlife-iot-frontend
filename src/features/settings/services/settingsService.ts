import apiClient from '@/lib/axios';
import type {
  GeneralSettings,
  SecuritySettings,
  AccountSettings,
  NotificationSettings,
} from '../types/settings.types';

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const settingsService = {
  // Get general settings
  async getGeneralSettings(): Promise<GeneralSettings> {
    const response =
      await apiClient.get<ApiResponse<GeneralSettings>>('/settings');
    return response.data.data;
  },

  // Update general settings
  async updateGeneralSettings(
    settings: Partial<GeneralSettings>
  ): Promise<GeneralSettings> {
    const response = await apiClient.put<ApiResponse<GeneralSettings>>(
      '/settings/general',
      settings
    );
    return response.data.data;
  },

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get<ApiResponse<NotificationSettings>>(
      '/settings/notifications'
    );
    return response.data.data;
  },

  // Update notification settings
  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const response = await apiClient.put<ApiResponse<NotificationSettings>>(
      '/settings/notifications',
      settings
    );
    return response.data.data;
  },

  // Get security settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    const response =
      await apiClient.get<ApiResponse<SecuritySettings>>('/2fa/Settings');
    return response.data.data;
  },

  // Update security settings
  async updateSecuritySettings(
    settings: Partial<SecuritySettings>
  ): Promise<SecuritySettings> {
    const response = await apiClient.patch<ApiResponse<SecuritySettings>>(
      '/2fa/settings',
      settings
    );
    return response.data.data;
  },

  // Authenticator 2FA
  async generateAuthenticatorQR(): Promise<{
    qrCode: string;
    secret: string;
    manualEntryKey: string;
  }> {
    interface AuthenticatorGenerateResponse {
      success: boolean;
      data: {
        secret: string;
        qrCode: string;
        manualEntryKey: string;
      };
      timestamp: string;
    }

    const response = await apiClient.post<AuthenticatorGenerateResponse>(
      '/2fa/authenticator/generate'
    );
    return {
      qrCode: response.data.data.qrCode,
      secret: response.data.data.secret,
      manualEntryKey: response.data.data.manualEntryKey,
    };
  },

  async enableAuthenticator(verificationCode: string): Promise<void> {
    await apiClient.post('/2fa/authenticator/enable', {
      code: verificationCode,
    });
  },

  // SMS 2FA
  async setupSMS(phoneNumber: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/2fa/sms/setup',
      { phoneNumber }
    );
    return response.data.data;
  },

  async resendSMSCode(): Promise<{ message: string }> {
    const response =
      await apiClient.post<ApiResponse<{ message: string }>>('/2fa/sms/resend');
    return response.data.data;
  },

  async enableSMS(verificationCode: string): Promise<void> {
    await apiClient.post('/2fa/sms/enable', {
      code: verificationCode,
    });
  },

  // Email 2FA
  async sendEmailCode(): Promise<{ message: string }> {
    const response =
      await apiClient.post<ApiResponse<{ message: string }>>('/2fa/email/send');
    return response.data.data;
  },

  async enableEmail(verificationCode: string): Promise<void> {
    await apiClient.post('/2fa/email/enable', {
      code: verificationCode,
    });
  },

  // Backup codes
  async regenerateBackupCodes(): Promise<{ codes: string[] }> {
    const response = await apiClient.post<ApiResponse<{ codes: string[] }>>(
      '/2fa/backup-codes/regenerate'
    );
    return response.data.data;
  },

  // Disable 2FA
  async disable2FA(verificationCode: string): Promise<void> {
    await apiClient.post('/2fa/disable', {
      code: verificationCode,
    });
  },

  // Get account settings
  async getAccountSettings(): Promise<AccountSettings> {
    const response =
      await apiClient.get<ApiResponse<AccountSettings>>('/settings/account');
    return response.data.data;
  },
};
