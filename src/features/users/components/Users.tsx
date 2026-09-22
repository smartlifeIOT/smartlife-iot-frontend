import { Trash2, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useDeleteUser,
  useUsers,
  useUpdateUserStatus,
} from '@/features/users/hooks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, UserRole, UserStatus } from '@/services/api/users.api';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { DeleteUserModal } from '@/components/models/DeleteUserModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { Pagination } from '@/components/common/Pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const Users = ({ searchQuery }: { searchQuery: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<
    'all' | 'customer_user' | 'customer'
  >('all');

  const itemsPerPage = 10;
  const roleParam = roleFilter === 'all' ? undefined : roleFilter;

  const { data: usersData, isLoading } = useUsers({
    page: currentPage,
    limit: itemsPerPage,
    role: roleParam,
    search: searchQuery,
  });
  const deleteUserMutation = useDeleteUser();
  const isTableLoading = isLoading;
  const users = useMemo(() => usersData?.data || [], [usersData]);
  const totalPages = usersData?.meta?.totalPages || 1;
  const totalItems = usersData?.meta?.total || users.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<
    Array<{ id: string; name: string; email: string; role: string }>
  >([]);

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [userToUpdateStatus, setUserToUpdateStatus] = useState<User | null>(
    null
  );
  const updateUserStatusMutation = useUpdateUserStatus();

  const handleManageUsersClick = (user: User) => {
    if (user.role === UserRole.CUSTOMER_USER) {
      navigate(`/users-management/customer-user/${user.id}`);
    } else {
      navigate(`/users-management/customer/${user.customerId}`);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          toast.success(
            t('usersManagement.users_tab.toasts.deleteSuccess', {
              name: selectedUser.name || selectedUser.email,
            })
          );
          setSelectedUser(null);
        },
        onError: (error: unknown) => {
          console.error('Failed to delete user:', error);
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
            t('usersManagement.user_card.toasts.deleteError');
          toast.error(errorMessage);
        },
      });
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((item) => item.id === user.id);
      if (exists) {
        return prev.filter((item) => item.id !== user.id);
      }
      return [
        ...prev,
        {
          id: user.id,
          name: user.name || '',
          email: user.email,
          role: user.role,
        },
      ];
    });
  };

  const handleBulkEdit = () => {
    navigate('/users-management/bulk-management', {
      state: { users: selectedUsers },
    });
  };

  const handleStatusToggle = (user: User) => {
    setUserToUpdateStatus(user);
    setStatusConfirmOpen(true);
  };

  const handleStatusConfirm = () => {
    if (userToUpdateStatus) {
      const newStatus =
        userToUpdateStatus.status === UserStatus.ACTIVE
          ? UserStatus.INACTIVE
          : UserStatus.ACTIVE;
      updateUserStatusMutation.mutate(
        { userId: userToUpdateStatus.id, status: newStatus },
        {
          onSuccess: () => {
            const statusLabel =
              newStatus === UserStatus.ACTIVE
                ? t('usersManagement.users_tab.statusConfirm.activate')
                : t('usersManagement.users_tab.statusConfirm.deactivate');

            toast.success(
              t('usersManagement.users_tab.toasts.statusUpdated', {
                status: statusLabel,
              })
            );
            setStatusConfirmOpen(false);
            setUserToUpdateStatus(null);
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message ||
                t('usersManagement.users_tab.toasts.statusUpdateError')
            );
          },
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('usersManagement.users_tab.title')}
        </h2>
        <Tabs
          defaultValue="all"
          value={roleFilter}
          onValueChange={(value) =>
            setRoleFilter(value as 'all' | 'customer_user' | 'customer')
          }
          className="w-auto"
        >
          <TabsList className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="all"
              className="dark:text-gray-400 dark:data-[state=active]:text-white"
            >
              {t('usersManagement.users_tab.tabs.all')}
            </TabsTrigger>
            <TabsTrigger
              value="customer_user"
              className="dark:text-gray-400 dark:data-[state=active]:text-white"
            >
              {t('usersManagement.users_tab.tabs.customer_user')}
            </TabsTrigger>
            <TabsTrigger
              value="customer"
              className="dark:text-gray-400 dark:data-[state=active]:text-white"
            >
              {t('usersManagement.users_tab.tabs.customer')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="bg-white  dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          {isTableLoading ? (
            <div className="p-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="flex justify-end   border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20  ">
                {selectedUsers.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={handleBulkEdit}
                    className="bg-primary hover:bg-primary/90 text-white shadow-md animate-in fade-in slide-in-from-right-2"
                  >
                    {t('usersManagement.users_tab.bulkEdit', {
                      count: selectedUsers.length,
                    })}
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="">
                      <TableHead className=" ">
                        {t('usersManagement.customer_users_list.table.user')}
                      </TableHead>
                      <TableHead className="  ">
                        {t('usersManagement.customer_users_list.table.email')}
                      </TableHead>
                      <TableHead className="   ">
                        {t('usersManagement.customer_users_list.table.role')}
                      </TableHead>
                      <TableHead className="   ">
                        {t('usersManagement.customer_users_list.table.status')}
                      </TableHead>
                      <TableHead className="   ">
                        {t('usersManagement.customer_users_list.table.created')}
                      </TableHead>
                      <TableHead className="text-center    ">
                        {t('usersManagement.common.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-gray-500 dark:text-gray-400"
                        >
                          {t('usersManagement.users_tab.noUsers')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user: User) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/50 border-gray-100 dark:border-gray-700"
                        >
                          <TableCell className="ps-4">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary cursor-pointer"
                                checked={selectedUsers.some(
                                  (item) => item.id === user.id
                                )}
                                onChange={() => toggleUserSelection(user)}
                              />
                              <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                                <AvatarFallback className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase">
                                  {user.name?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                  {user.name}
                                </p>
                                <p className="  text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {user.role.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.status === UserStatus.ACTIVE}
                              onCheckedChange={() => handleStatusToggle(user)}
                              disabled={
                                updateUserStatusMutation.isPending &&
                                userToUpdateStatus?.id === user.id
                              }
                            />
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleDeleteClick(user)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t(
                                    'usersManagement.users_tab.tooltips.delete'
                                  )}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-primary hover:bg-primary/10"
                                    onClick={() => handleManageUsersClick(user)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t('usersManagement.users_tab.tooltips.view')}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete User Modal */}
      <DeleteUserModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        user={selectedUser}
        onConfirm={handleDeleteConfirm}
        role={selectedUser?.role}
      />

      {/* Status Confirmation Modal */}
      <ConfirmDialog
        open={statusConfirmOpen}
        onOpenChange={setStatusConfirmOpen}
        title={t('usersManagement.users_tab.statusConfirm.title')}
        description={t('usersManagement.users_tab.statusConfirm.description', {
          action:
            userToUpdateStatus?.status === UserStatus.ACTIVE
              ? t('usersManagement.users_tab.statusConfirm.deactivate')
              : t('usersManagement.users_tab.statusConfirm.activate'),
          name: userToUpdateStatus?.name || userToUpdateStatus?.email,
        })}
        onConfirm={handleStatusConfirm}
      />
    </div>
  );
};

export default Users;
