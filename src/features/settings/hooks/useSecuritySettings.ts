import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { settingsService } from '../services/settingsService';
import type { TwoFactorMethod } from '../types/settings.types';

export const useSecuritySettings = () => {
  const queryClient = useQueryClient();
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [manualEntryKey, setManualEntryKey] = useState<string>('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [enableMethod, setEnableMethod] = useState<TwoFactorMethod>('none');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedMethodLocal, setSelectedMethodLocal] =
    useState<TwoFactorMethod>('none');

  const { data, isLoading } = useQuery({
    queryKey: ['securitySettings'],
    queryFn: settingsService.getSecuritySettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateSecuritySettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['securitySettings'], data);
      toast.success('Security settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save security settings');
    },
  });

  // Generate Authenticator QR Code
  const generateQRMutation = useMutation({
    mutationFn: settingsService.generateAuthenticatorQR,
    onSuccess: (data) => {
      setQrCodeData(data.qrCode);
      setManualEntryKey(data.manualEntryKey);
      setShowQRCode(true);
    },
    onError: () => {
      toast.error('Failed to generate QR code', { id: 'generate-qr-error' });
    },
  });

  // Enable Authenticator
  const enableAuthenticatorMutation = useMutation({
    mutationFn: settingsService.enableAuthenticator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      setShowEnableModal(false);
      setShowQRCode(false);
      setSelectedMethodLocal('none');
      toast.success('Authenticator 2FA enabled successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'Failed to enable authenticator 2FA';
      toast.error(
        errorMessage || 'Invalid verification code. Please try again.'
      );
    },
  });

  // Setup SMS
  const setupSMSMutation = useMutation({
    mutationFn: settingsService.setupSMS,
    onSuccess: () => {
      setShowEnableModal(true);
      toast.success('Verification code sent to your phone');
    },
    onError: () => {
      toast.error('Failed to send SMS verification code');
    },
  });

  // Resend SMS Code
  const resendSMSMutation = useMutation({
    mutationFn: settingsService.resendSMSCode,
    onSuccess: () => {
      toast.success('Verification code resent to your phone');
    },
    onError: () => {
      toast.error('Failed to resend SMS code');
    },
  });

  // Enable SMS
  const enableSMSMutation = useMutation({
    mutationFn: settingsService.enableSMS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      setShowEnableModal(false);
      setPhoneNumber('');
      setSelectedMethodLocal('none');
      toast.success('SMS 2FA enabled successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'Failed to enable SMS 2FA';
      toast.error(
        errorMessage || 'Invalid verification code. Please try again.'
      );
    },
  });

  // Send Email Code
  const sendEmailCodeMutation = useMutation({
    mutationFn: settingsService.sendEmailCode,
    onSuccess: () => {
      setShowEnableModal(true);
      toast.success('Verification code sent to your email');
    },
    onError: () => {
      toast.error('Failed to send email verification code');
    },
  });

  // Enable Email
  const enableEmailMutation = useMutation({
    mutationFn: settingsService.enableEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      setShowEnableModal(false);
      setSelectedMethodLocal('none');
      toast.success('Email 2FA enabled successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'Failed to enable email 2FA';
      toast.error(
        errorMessage || 'Invalid verification code. Please try again.'
      );
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: (code: string) => settingsService.disable2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      setShowQRCode(false);
      setQrCodeData('');
      setManualEntryKey('');
      setShowDisableModal(false);
      toast.success('Two-factor authentication disabled');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'Failed to disable two-factor authentication';
      toast.error(
        errorMessage || 'Invalid verification code. Please try again.'
      );
    },
  });

  const handleGenerateQR = () => {
    setSelectedMethodLocal('authenticator');
    generateQRMutation.mutate();
  };

  const handleSetupSMS = (phone: string) => {
    setPhoneNumber(phone);
    setEnableMethod('sms');
    setSelectedMethodLocal('sms');
    setupSMSMutation.mutate(phone);
  };

  const handleResendSMS = () => {
    resendSMSMutation.mutate();
  };

  const handleSetupEmail = () => {
    setEnableMethod('email');
    setSelectedMethodLocal('email');
    sendEmailCodeMutation.mutate();
  };

  const handleEnableAuthenticator = async (code: string) => {
    await enableAuthenticatorMutation.mutateAsync(code);
  };

  const handleEnable2FA = async (code: string) => {
    if (enableMethod === 'authenticator') {
      await enableAuthenticatorMutation.mutateAsync(code);
    } else if (enableMethod === 'sms') {
      await enableSMSMutation.mutateAsync(code);
    } else if (enableMethod === 'email') {
      await enableEmailMutation.mutateAsync(code);
    }
  };

  const handleDisable2FA = () => {
    setShowDisableModal(true);
    sendEmailCodeMutation.mutate();
  };

  const handleVerifyDisable = async (code: string) => {
    await disable2FAMutation.mutateAsync(code);
  };

  const handleMethodChange = (method: TwoFactorMethod) => {
    // Only update local state - don't call API until user clicks "Setup"
    setSelectedMethodLocal(method);
    setShowQRCode(false);
  };

  // Use local selected method if 2FA is not enabled, otherwise use the method from settings
  const selectedMethod = data?.isEnabled
    ? (data?.method as TwoFactorMethod)
    : selectedMethodLocal;

  return {
    settings: data,
    isLoading,
    showQRCode,
    qrCodeData,
    manualEntryKey,
    showDisableModal,
    setShowDisableModal,
    showEnableModal,
    setShowEnableModal,
    enableMethod,
    phoneNumber,
    selectedMethod,
    handleGenerateQR,
    handleSetupSMS,
    handleResendSMS,
    handleSetupEmail,
    handleEnableAuthenticator,
    handleEnable2FA,
    handleDisable2FA,
    handleVerifyDisable,
    handleMethodChange,
    isSaving: updateMutation.isPending,
    isGeneratingQR: generateQRMutation.isPending,
    isEnablingAuthenticator: enableAuthenticatorMutation.isPending,
    isSettingUpSMS: setupSMSMutation.isPending,
    isResendingSMS: resendSMSMutation.isPending,
    isEnablingSMS: enableSMSMutation.isPending,
    isSendingEmailCode: sendEmailCodeMutation.isPending,
    isEnablingEmail: enableEmailMutation.isPending,
    isDisabling2FA: disable2FAMutation.isPending,
  };
};
