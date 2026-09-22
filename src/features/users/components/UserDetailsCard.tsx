import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  Building,
  Clock,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { DeleteUserModal } from '@/components/models/DeleteUserModal';
import { useDeleteUser, useUpdateUser } from '@/features/users/hooks';
import { User, UserStatus } from '@/services/api/users.api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface UserDetailsCardProps {
  user: User | undefined;
}

export function UserDetailsCard({ user }: UserDetailsCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
      });
    }
  }, [user]);

  const handleDeleteConfirm = () => {
    if (user) {
      deleteUserMutation.mutate(user.id, {
        onSuccess: () => {
          toast.success(t('usersManagement.user_card.toasts.deleteSuccess', { name: user.name || user.email }));
          navigate('/users-management', { state: { tab: 'Users' } });
        },
        onError: (error: unknown) => {
          console.error('Failed to delete user:', error);
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || t('usersManagement.user_card.toasts.deleteError');
          toast.error(errorMessage);
        },
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Revert changes
      if (user) {
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          companyName: user.companyName || '',
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!user) return;

    updateUserMutation.mutate(
      { userId: user.id, data: formData },
      {
        onSuccess: () => {
          toast.success(t('usersManagement.user_card.toasts.updateSuccess'));
          setIsEditing(false);
        },
        onError: (error: unknown) => {
          console.error('Failed to update user:', error);
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || t('usersManagement.user_card.toasts.updateError');
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-900 dark:text-white h-10 w-64 bg-white dark:bg-gray-900"
                      placeholder={t('usersManagement.user_card.placeholders.enterName')}
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.name || 'Customer User Details'}
                    </h1>
                  )}
                  <Badge
                    variant={
                      user?.status === UserStatus.ACTIVE
                        ? 'success'
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {user?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">
                    {user?.roles?.[0]?.name?.replace('_', ' ') || t('usersManagement.user_card.labels.noRole')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end md:self-start">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    isLoading={updateUserMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('usersManagement.user_card.save')}
                  </Button>
                  <Button
                    onClick={handleEditToggle}
                    variant="outline"
                    className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                    disabled={updateUserMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('usersManagement.user_card.cancel')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEditToggle}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('usersManagement.user_card.editUser')}
                  </Button>
                  <Button
                    onClick={() => setDeleteModalOpen(true)}
                    variant="outline"
                    className="text-red-600 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('usersManagement.user_card.delete')}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-transparent dark:border-gray-700">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {t('usersManagement.user_card.labels.emailAddress')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-transparent dark:border-gray-700">
                <Phone className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {t('usersManagement.user_card.labels.phoneNumber')}
                  </p>
                  {isEditing ? (
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-8 mt-1 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      placeholder={t('usersManagement.user_card.placeholders.enterPhone')}
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.phone || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-transparent dark:border-gray-700">
                <Building className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {t('usersManagement.user_card.labels.company')}
                  </p>
                  {isEditing ? (
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="h-8 mt-1 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      placeholder={t('usersManagement.user_card.placeholders.enterCompany')}
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.companyName || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-transparent dark:border-gray-700">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {t('usersManagement.user_card.labels.lastLogin')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-transparent dark:border-gray-700">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {t('usersManagement.user_card.labels.createdAt')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-transparent dark:border-gray-700">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {t('usersManagement.user_card.labels.lastUpdated')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        user={user || null}
        onConfirm={handleDeleteConfirm}
        role={user?.role}
      />
    </>
  );
}
