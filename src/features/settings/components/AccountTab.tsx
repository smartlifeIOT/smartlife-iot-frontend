import { useEffect, useState } from 'react';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Eye, EyeOff, Trash2, Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAccountSettings } from '../hooks';
import { userService } from '@/features/users/services/usersService';
import { usersApi } from '@/services/api';
import { useGetCurrentUser } from '../hooks/useAccountSettings';
import { createChangePasswordSchema, createProfileSchema } from '../Schema';
import alt_image from '@/assets/images/user_alt.png';
type ChangePasswordFormData = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
type ProfileFormData = z.input<ReturnType<typeof createProfileSchema>>;

export function AccountTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isLoading } = useAccountSettings();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const changePasswordSchema = createChangePasswordSchema(t);
  const profileSchema = createProfileSchema(t);

  //  change password  api call
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUser();
  // update profile
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(
      profileSchema
    ) as unknown as Resolver<ProfileFormData>,
    defaultValues: {
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      companyName: currentUser?.companyName ?? '',
    },
  });

  useEffect(() => {
    if (!currentUser) return;
    resetProfile({
      name: currentUser.name ?? '',
      email: currentUser.email ?? '',
      phone: currentUser.phone ?? '',
      companyName: currentUser.companyName ?? '',
    });
  }, [currentUser, resetProfile]);

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data: {
      name: string;
      phone?: string;
      companyName?: string;
      avatarFile?: File;
      avatar?: string;
    }) => usersApi.updateProfile(data),
    onSuccess: () => {
      toast.success(t('common.saved') || 'Saved');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setAvatarFile(null);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : t('common.somethingWentWrong') || 'Something went wrong';
      toast.error(errorMessage);
    },
  });

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => userService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success(t('settings.changePassword.passwordUpdatedSuccessfully'));
      resetPassword();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : error &&
              typeof error === 'object' &&
              'response' in error &&
              error.response &&
              typeof error.response === 'object' &&
              'data' in error.response &&
              error.response.data &&
              typeof error.response.data === 'object' &&
              'message' in error.response.data &&
              typeof error.response.data.message === 'string'
            ? error.response.data.message
            : t('settings.changePassword.failedToUpdatePassword');

      // Check for specific error messages
      if (
        errorMessage.toLowerCase().includes('incorrect') ||
        errorMessage.toLowerCase().includes('wrong')
      ) {
        toast.error(t('settings.changePassword.oldPasswordIncorrect'));
      } else if (
        errorMessage.toLowerCase().includes('different') ||
        errorMessage.toLowerCase().includes('same')
      ) {
        toast.error(t('settings.changePassword.newPasswordSameAsOld'));
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfile({
      name: data.name.trim(),
      phone: data.phone ? data.phone.trim() : undefined,
      companyName: data.companyName ? data.companyName.trim() : undefined,
      avatarFile: avatarFile || undefined,
      avatar: avatarPreview === '' ? '' : undefined,
    });
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(
        t('settings.profile.invalidFileType') || 'Please select an image file'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t('settings.profile.fileTooLarge') ||
          'File size should be less than 5MB'
      );
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(''); // Empty string indicates removal
  };

  if (isLoading || isLoadingUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('common.profile')}</CardTitle>
          <CardDescription>{t('common.updateYourProfile')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="m-6 flex  items-center     gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-gray-100 dark:border-gray-800">
                <AvatarImage
                  src={avatarPreview ? avatarPreview : alt_image}
                  alt={currentUser?.name || ''}
                />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {currentUser?.name?.[0]?.toUpperCase() || ''}
                </AvatarFallback>
              </Avatar>
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors shadow-primary/20"
              >
                <Camera size={16} />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('settings.profile.photo')}
              </h3>
              <p className="text-xs text-gray-500 max-w-[440px]">
                {t('settings.profile.photoDescription')}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium"
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                  disabled={isUploadingAvatar}
                >
                  <Upload size={14} className="mr-1.5" />
                  {t('settings.profile.changePhoto')}
                </Button>
                {avatarPreview !== '' &&
                  (avatarPreview || currentUser?.avatar) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                    >
                      <Trash2 size={14} className="mr-1.5" />
                      {t('settings.profile.removePhoto')}
                    </Button>
                  )}
              </div>
            </div>
          </div>
          <Separator className="mb-6" />
          <form
            onSubmit={handleSubmitProfile(
              onSubmitProfile as unknown as SubmitHandler<ProfileFormData>
            )}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profileName">{t('common.name')}</Label>
                <Input
                  id="profileName"
                  placeholder={t('common.name')}
                  {...registerProfile('name')}
                  error={profileErrors.name?.message}
                  className="border rounded-md"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="profileEmail">{t('common.email')}</Label>
                <Input
                  id="profileEmail"
                  placeholder={t('common.email')}
                  {...registerProfile('email')}
                  disabled
                  className="border rounded-md opacity-80 disabled:opacity-100  disabled:cursor-not-allowed disabled:text-gray-500 disabled:bg-gray-100"
                />
                <div
                  className="absolute bottom-full left-1/2 mb-2 w-max
           -translate-x-1/2 scale-0
           rounded bg-gray-900 px-2 py-1 text-xs text-white
           transition-all group-hover:scale-100"
                >
                  Tooltip text
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">{t('common.companyName')}</Label>
              <Input
                type="tel"
                id="companyName"
                placeholder={t('common.companyName')}
                {...registerProfile('companyName')}
                error={profileErrors.companyName?.message}
                className="border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePhone">{t('common.phoneNumber')}</Label>
              <Input
                type="tel"
                id="profilePhone"
                placeholder={t('common.phoneNumber')}
                {...registerProfile('phone')}
                error={profileErrors.phone?.message}
                className="border rounded-md"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                disabled={
                  isUpdatingProfile ||
                  (!isProfileDirty && !avatarFile && avatarPreview === null)
                }
              >
                {isUpdatingProfile ? t('common.saving') : t('common.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!currentUser) return;
                  resetProfile({
                    name: currentUser.name ?? '',
                    email: currentUser.email ?? '',
                    phone: currentUser.phone ?? '',
                    companyName: currentUser.companyName ?? '',
                  });
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                disabled={
                  isUpdatingProfile ||
                  (!isProfileDirty && !avatarFile && avatarPreview === null)
                }
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card className="mt-4 p-4">
        <CardContent>
          <div className="space-y-1">
            <div className="mb-4">
              <Label className="text-lg font-semibold  text-black dark:text-gray-200">
                {t('settings.changePassword.title')}
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('settings.account.passwordDescription')}
              </p>
            </div>

            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="space-y-4"
            >
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  {t('settings.changePassword.currentPassword')}
                </Label>
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder={t(
                    'settings.changePassword.currentPasswordPlaceholder'
                  )}
                  {...registerPassword('currentPassword')}
                  error={passwordErrors.currentPassword?.message}
                  className="border rounded-md"
                  icon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label={
                        showCurrentPassword
                          ? t('settings.changePassword.hidePassword')
                          : t('settings.changePassword.showPassword')
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  }
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {t('settings.changePassword.newPassword')}
                </Label>
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t(
                    'settings.changePassword.newPasswordPlaceholder'
                  )}
                  {...registerPassword('newPassword')}
                  className="border rounded-md"
                  error={passwordErrors.newPassword?.message}
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label={
                        showNewPassword
                          ? t('settings.changePassword.hidePassword')
                          : t('settings.changePassword.showPassword')
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('settings.changePassword.confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t(
                    'settings.changePassword.confirmPasswordPlaceholder'
                  )}
                  {...registerPassword('confirmPassword')}
                  error={passwordErrors.confirmPassword?.message}
                  className="border rounded-md"
                  icon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label={
                        showConfirmPassword
                          ? t('settings.changePassword.hidePassword')
                          : t('settings.changePassword.showPassword')
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Submit Button */}
              <div className=" ">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isPending}
                >
                  {isPending
                    ? t('settings.changePassword.updating')
                    : t('settings.changePassword.updatePassword')}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
