import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  useBulkUpdateUsers,
  useBulkUpdateUserStatus,
  useRoles,
  useBulkDeleteUsers,
  useBulkAssignRole,
  useBulkRemoveRole,
  useBulkSendEmail,
  useExportUsers,
  useImportUsers,
  useBulkSendNotification,
} from '@/features/users/hooks';
import { UserStatus } from '@/services/api/users.api';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SelectedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

import { useTranslation } from 'react-i18next';

export default function BulkUserManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedActions, setSelectedActions] = useState<Set<string>>(
    new Set()
  );
  const { mutate: bulkUpdateUserStatus } = useBulkUpdateUserStatus();
  const { mutate: bulkUpdateUsers } = useBulkUpdateUsers();
  const { mutate: bulkDeleteUsers } = useBulkDeleteUsers();
  const { mutate: bulkAssignRole } = useBulkAssignRole();
  const { mutate: bulkRemoveRole } = useBulkRemoveRole();
  const { mutate: bulkSendEmail, isPending: isSendingEmail } =
    useBulkSendEmail();
  const { mutate: exportUsers, isPending: isExporting } = useExportUsers();
  const { mutate: importUsers, isPending: isImporting } = useImportUsers();
  const { mutate: bulkSendNotification, isPending: isSendingNotification } =
    useBulkSendNotification();
  const { data: rolesData, isLoading: isRolesLoading } = useRoles();
  const selectedUsers: SelectedUser[] = location.state?.users || [];

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<UserStatus | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [communicationModalOpen, setCommunicationModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    'assign-role' | 'remove-role' | 'send-email' | 'send-notification' | ''
  >('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>(
    'csv'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notificationTitle, setNotificationTitle] = useState<string>('');
  const [notificationType, setNotificationType] = useState<string>('system');
  const [notificationPriority, setNotificationPriority] =
    useState<string>('normal');

  const selectedCount = selectedUsers.length;

  const handleActionClick = (action: UserStatus) => {
    setPendingAction(action);
    setStatusConfirmOpen(true);
  };

  const handleStatusConfirm = () => {
    if (pendingAction) {
      bulkUpdateUserStatus(
        {
          userIds: selectedUsers.map((user) => user.id),
          status: pendingAction,
        },
        {
          onSuccess: () => {
            toast.success(t('usersManagement.bulk_management.toasts.statusSuccess'));
            setStatusConfirmOpen(false);
            setPendingAction(null);
          },
          onError: (error: unknown) => {
            console.error('Failed to update users status:', error);
            const errorMessage =
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || t('usersManagement.bulk_management.toasts.statusError');
            toast.error(errorMessage);
          },
        }
      );
    }
  };

  const handleRoleAction = (action: 'assign-role' | 'remove-role') => {
    setCurrentAction(action);
    setRoleModalOpen(true);
  };

  const handleCommunicationAction = (
    action: 'send-email' | 'send-notification'
  ) => {
    setCurrentAction(action);
    setCommunicationModalOpen(true);
  };

  const onRoleConfirm = () => {
    if (!selectedRoleId) {
      toast.error(t('usersManagement.bulk_management.validation.selectRole'));
      return;
    }

    const roleMutation =
      currentAction === 'assign-role' ? bulkAssignRole : bulkRemoveRole;

    roleMutation(
      {
        roleId: selectedRoleId,
        userIds: selectedUsers.map((u) => u.id),
      },
      {
        onSuccess: () => {
          toast.success(
            t('usersManagement.bulk_management.toasts.roleSuccess', { 
              action: currentAction === 'assign-role' ? t('usersManagement.bulk_management.actions.assignRole').toLowerCase() : t('usersManagement.bulk_management.actions.removeRole').toLowerCase() 
            })
          );
          setRoleModalOpen(false);
          setSelectedRoleId('');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || t('usersManagement.bulk_management.toasts.roleError')
          );
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    bulkDeleteUsers(
      selectedUsers.map((u) => u.id),
      {
        onSuccess: () => {
          toast.success(t('usersManagement.bulk_management.toasts.deleteSuccess'));
          setDeleteConfirmOpen(false);
          navigate('/users-management');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || t('usersManagement.bulk_management.toasts.deleteError')
          );
        },
      }
    );
  };

  const onCommunicationConfirm = () => {
    if (!messageText.trim()) {
      toast.error(t('usersManagement.bulk_management.validation.enterMessage'));
      return;
    }

    if (currentAction === 'send-email') {
      if (!emailSubject.trim()) {
        toast.error(t('usersManagement.bulk_management.validation.enterSubject'));
        return;
      }

      bulkSendEmail(
        {
          userIds: selectedUsers.map((u) => u.id),
          subject: emailSubject,
          message: messageText,
        },
        {
          onSuccess: () => {
            toast.success(t('usersManagement.bulk_management.toasts.emailSuccess'));
            setCommunicationModalOpen(false);
            setMessageText('');
            setEmailSubject('');
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || t('usersManagement.bulk_management.toasts.emailError')
            );
          },
        }
      );
    } else if (currentAction === 'send-notification') {
      if (!notificationTitle.trim()) {
        toast.error(t('usersManagement.bulk_management.validation.enterTitle'));
        return;
      }

      bulkSendNotification(
        {
          userIds: selectedUsers.map((u) => u.id),
          title: notificationTitle,
          message: messageText,
          type: notificationType,
          priority: notificationPriority,
        },
        {
          onSuccess: () => {
            toast.success(t('usersManagement.bulk_management.toasts.notifSuccess'));
            setCommunicationModalOpen(false);
            setMessageText('');
            setNotificationTitle('');
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || t('usersManagement.bulk_management.toasts.notifError')
            );
          },
        }
      );
    } else {
      // Logic for other actions if any
    }
  };

  const handleExportConfirm = () => {
    exportUsers(exportFormat, {
      onSuccess: (response: any) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `users_export_${Date.now()}.${exportFormat}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        setExportModalOpen(false);
        toast.success(t('usersManagement.bulk_management.toasts.exportSuccess'));
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('usersManagement.bulk_management.toasts.exportError'));
      },
    });
  };

  const handleImportConfirm = () => {
    if (!selectedFile) {
      toast.error(t('usersManagement.bulk_management.validation.selectFile'));
      return;
    }

    importUsers(selectedFile, {
      onSuccess: (response: any) => {
        toast.success(
          t('usersManagement.bulk_management.toasts.importSuccess', { 
            imported: response.data.data.imported, 
            failed: response.data.data.failed 
          })
        );
        setImportModalOpen(false);
        setSelectedFile(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t('usersManagement.bulk_management.toasts.importError'));
      },
    });
  };

  const handleExecute = () => {
    if (selectedActions.size === 0) {
      toast.error(t('usersManagement.bulk_management.validation.selectAction'));
      return;
    }
    toast.success(
      t('usersManagement.bulk_management.feedback.executing', { 
        actionCount: selectedActions.size, 
        userCount: selectedCount 
      })
    );
    // TODO: Implement actual bulk operation
  };

  const handlePreview = () => {
    toast.success(t('usersManagement.bulk_management.feedback.comingSoon'));
  };

  const handleCancel = () => {
    navigate('/users-management');
  };

  const ActionButton = ({
    id,
    label,
    variant = 'outline',
    className = '',
    onClick,
  }: {
    id: string;
    label: string;
    variant?: 'outline' | 'destructive';
    className?: string;
    onClick?: () => void;
  }) => {
    const isSelected = selectedActions.has(id);
    return (
      <Button
        type="button"
        variant={isSelected ? 'default' : variant}
        onClick={onClick}
        className={`w-full ${
          isSelected
            ? 'bg-[#43489C] text-white hover:bg-[#43489C]/90'
            : className
        }`}
      >
        {label}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={t('usersManagement.bulk_management.title')}
          description={t('usersManagement.bulk_management.description')}
        />
        {/* Selected Users Banner */}
        <div className="bg-secondary text-white rounded-lg p-4">
          <p className="font-semibold text-lg mb-1">
            {t('usersManagement.bulk_management.selectedBanner', { count: selectedCount })}
          </p>
          <div className="flex items-center pt-6 justify-between max-h-96 overflow-y-auto custom-scrollbar">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800"
                  >
                    <CardContent className="p-4 space-y-1 flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        <div className="">
                          <p className="text-xs capitalize text-gray-600 dark:text-gray-400">
                            {t('usersManagement.common.role')}: {user.role.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Available Actions */}
        <Card className="shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('usersManagement.bulk_management.availableActions')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Status Card */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    {t('usersManagement.bulk_management.sections.userStatus')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton
                      id="activate"
                      label={t('usersManagement.bulk_management.actions.activate')}
                      className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-900/50"
                      onClick={() => handleActionClick(UserStatus.ACTIVE)}
                    />
                    <ActionButton
                      id="deactivate"
                      label={t('usersManagement.bulk_management.actions.deactivate')}
                      className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-900/50"
                      onClick={() => handleActionClick(UserStatus.INACTIVE)}
                    />
                    <ActionButton
                      id="suspend"
                      label={t('usersManagement.bulk_management.actions.suspend')}
                      className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-900/50"
                      onClick={() => handleActionClick(UserStatus.SUSPENDED)}
                    />
                    <ActionButton
                      id="delete-users"
                      label={t('usersManagement.bulk_management.actions.delete')}
                      variant="destructive"
                      className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-900/50"
                      onClick={() => setDeleteConfirmOpen(true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Role Management Card */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    {t('usersManagement.bulk_management.sections.roleManagement')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton
                      id="assign-role"
                      label={t('usersManagement.bulk_management.actions.assignRole')}
                      className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-900/50"
                      onClick={() => handleRoleAction('assign-role')}
                    />
                    <ActionButton
                      id="remove-role"
                      label={t('usersManagement.bulk_management.actions.removeRole')}
                      className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-900/50"
                      onClick={() => handleRoleAction('remove-role')}
                    />
                    <ActionButton
                      id="update-permissions"
                      label={t('usersManagement.bulk_management.actions.updatePermissions')}
                      className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-900/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Communication Card */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    {t('usersManagement.bulk_management.sections.communication')}
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <ActionButton
                        id="send-email"
                        label={t('usersManagement.bulk_management.actions.sendEmail')}
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-900/50"
                        onClick={() => handleCommunicationAction('send-email')}
                      />
                      <ActionButton
                        id="send-notification"
                        label={t('usersManagement.bulk_management.actions.sendNotification')}
                        className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-900/50"
                        onClick={() =>
                          handleCommunicationAction('send-notification')
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management Card */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm md:col-span-2 lg:col-span-1 bg-gray-50 dark:bg-gray-900">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    {t('usersManagement.bulk_management.sections.dataManagement')}
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <ActionButton
                        id="export-data"
                        label={t('usersManagement.bulk_management.actions.exportData')}
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-900/50"
                        onClick={() => setExportModalOpen(true)}
                      />
                      <ActionButton
                        id="bulk-import"
                        label={t('usersManagement.bulk_management.actions.bulkImport')}
                        className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-900/50"
                        onClick={() => setImportModalOpen(true)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Footer Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
            >
              {t('usersManagement.common.cancel')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExecute}
              disabled={selectedActions.size === 0}
              className="bg-[#A53887] hover:bg-[#A53887]/90 text-white"
            >
              {t('usersManagement.bulk_management.actions.readyToExecute', { count: selectedCount })}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={statusConfirmOpen}
        onOpenChange={setStatusConfirmOpen}
        title={t('usersManagement.bulk_management.modals.status.title')}
        description={t('usersManagement.bulk_management.modals.status.description', { count: selectedCount, status: pendingAction })}
        onConfirm={handleStatusConfirm}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('usersManagement.bulk_management.modals.delete.title')}
        description={t('usersManagement.bulk_management.modals.delete.description', { count: selectedCount })}
        onConfirm={handleDeleteConfirm}
        confirmLabel={t('usersManagement.bulk_management.actions.delete')}
        variant="destructive"
      />

      {/* Role Management Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {currentAction === 'assign-role' ? t('usersManagement.bulk_management.modals.role.assignTitle') : t('usersManagement.bulk_management.modals.role.removeTitle')}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {t('usersManagement.bulk_management.modals.role.description', {
                action: currentAction === 'assign-role' ? t('usersManagement.bulk_management.modals.role.assignTitle').toLowerCase() : t('usersManagement.bulk_management.modals.role.removeTitle').toLowerCase(),
                count: selectedCount
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {isRolesLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-secondary" />
              </div>
            ) : (
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder={t('usersManagement.bulk_management.modals.role.placeholder')} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  {rolesData?.data.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="dark:text-white dark:focus:bg-gray-800">
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalOpen(false)} className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">
              {t('usersManagement.common.cancel')}
            </Button>
            <Button
              className="bg-secondary text-white hover:bg-secondary/90"
              onClick={onRoleConfirm}
              disabled={!selectedRoleId}
            >
              {t('usersManagement.common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Communication Modal */}
      <Dialog
        open={communicationModalOpen}
        onOpenChange={setCommunicationModalOpen}
      >
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {currentAction === 'send-email'
                ? t('usersManagement.bulk_management.modals.communication.emailTitle')
                : t('usersManagement.bulk_management.modals.communication.notifTitle')}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {t('usersManagement.bulk_management.modals.communication.description', { count: selectedCount })}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {currentAction === 'send-email' && (
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">{t('usersManagement.bulk_management.modals.communication.subject')}</label>
                <Input
                  placeholder={t('usersManagement.bulk_management.modals.communication.subject')}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            )}
            {currentAction === 'send-notification' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300">{t('usersManagement.bulk_management.modals.communication.notifTitleLabel')}</label>
                  <Input
                    placeholder={t('usersManagement.bulk_management.modals.communication.notifTitleLabel')}
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-gray-300">{t('usersManagement.bulk_management.modals.communication.type')}</label>
                    <Select
                      value={notificationType}
                      onValueChange={setNotificationType}
                    >
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <SelectValue placeholder={t('usersManagement.bulk_management.modals.communication.type')} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="system" className="dark:text-white dark:focus:bg-gray-800">System</SelectItem>
                        <SelectItem value="user" className="dark:text-white dark:focus:bg-gray-800">User</SelectItem>
                        <SelectItem value="device" className="dark:text-white dark:focus:bg-gray-800">Device</SelectItem>
                        <SelectItem value="alarm" className="dark:text-white dark:focus:bg-gray-800">Alarm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-gray-300">{t('usersManagement.bulk_management.modals.communication.priority')}</label>
                    <Select
                      value={notificationPriority}
                      onValueChange={setNotificationPriority}
                    >
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <SelectValue placeholder={t('usersManagement.bulk_management.modals.communication.priority')} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="low" className="dark:text-white dark:focus:bg-gray-800">Low</SelectItem>
                        <SelectItem value="normal" className="dark:text-white dark:focus:bg-gray-800">Normal</SelectItem>
                        <SelectItem value="high" className="dark:text-white dark:focus:bg-gray-800">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">{t('usersManagement.bulk_management.modals.communication.message')}</label>
              <Textarea
                placeholder={t('usersManagement.bulk_management.modals.communication.message')}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCommunicationModalOpen(false)}
              disabled={isSendingEmail}
              className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              {t('usersManagement.common.cancel')}
            </Button>
            <Button
              className="bg-secondary text-white hover:bg-secondary/90"
              onClick={onCommunicationConfirm}
              disabled={
                !messageText.trim() ||
                (currentAction === 'send-email' && !emailSubject.trim()) ||
                (currentAction === 'send-notification' &&
                  !notificationTitle.trim()) ||
                isSendingEmail ||
                isSendingNotification
              }
            >
              {isSendingEmail || isSendingNotification ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('usersManagement.bulk_management.modals.communication.sending')}
                </>
              ) : (
                t('usersManagement.bulk_management.modals.communication.send', { type: currentAction === 'send-email' ? 'Email' : 'Notification' })
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t('usersManagement.bulk_management.modals.export.title')}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {t('usersManagement.bulk_management.modals.export.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">{t('usersManagement.bulk_management.modals.export.format')}</label>
              <Select
                value={exportFormat}
                onValueChange={(val: any) => setExportFormat(val)}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder={t('usersManagement.bulk_management.modals.export.format')} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="csv" className="dark:text-white dark:focus:bg-gray-800">CSV</SelectItem>
                  <SelectItem value="json" className="dark:text-white dark:focus:bg-gray-800">JSON</SelectItem>
                  <SelectItem value="xlsx" className="dark:text-white dark:focus:bg-gray-800">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(false)}
              disabled={isExporting}
              className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              {t('usersManagement.common.cancel')}
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleExportConfirm}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('usersManagement.bulk_management.modals.export.exporting')}
                </>
              ) : (
                t('usersManagement.bulk_management.modals.export.exportNow')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t('usersManagement.bulk_management.modals.import.title')}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {t('usersManagement.bulk_management.modals.import.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">{t('usersManagement.bulk_management.modals.import.selectFile')}</label>
              <input
                type="file"
                accept=".csv,.json,.xlsx"
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-400 hover:file:bg-purple-100 dark:hover:file:bg-purple-900/50"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </div>
            {selectedFile && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('usersManagement.bulk_management.modals.import.selected', { name: selectedFile.name, size: (selectedFile.size / 1024).toFixed(2) })}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportModalOpen(false);
                setSelectedFile(null);
              }}
              disabled={isImporting}
              className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              {t('usersManagement.common.cancel')}
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleImportConfirm}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('usersManagement.bulk_management.modals.import.importing')}
                </>
              ) : (
                t('usersManagement.bulk_management.modals.import.importNow')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
