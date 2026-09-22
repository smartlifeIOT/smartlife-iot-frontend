import { z } from 'zod';
 
export const createChangePasswordSchema = (t: (key: string) => string) => z.object({
    currentPassword: z.string().min(1, t('settings.changePassword.passwordRequired')),
    newPassword: z.string().min(8, t('settings.changePassword.passwordMinLength')),
    confirmPassword: z.string().min(1, t('settings.changePassword.confirmPasswordRequired')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('settings.changePassword.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  }).refine((data) => data.currentPassword !== data.newPassword, {
    message: t('settings.changePassword.newPasswordSameAsOld'),
    path: ['newPassword'],
  });