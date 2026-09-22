import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Edit, MoreVertical, ShieldCheck, Trash2 } from 'lucide-react';
import { DeleteRoleModal } from '@/components/models/DeleteRoleModal';
import { useDeleteRole, useRoles } from '../hooks';
import { Role } from '@/services/api/users.api';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const Roles = ({ searchQuery }: { searchQuery: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const { data: roles, isLoading } = useRoles({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
  });
  const deleteRoleMutation = useDeleteRole();

  const handleDelete = (roleId: string) => {
    const role = roles?.data?.find((r: Role) => r.id === roleId);
    if (role) {
      setSelectedRole(role);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole.id, {
        onSuccess: () => {
          toast.success(t('usersManagement.roles_tab.toasts.deleteSuccess'));
          setSelectedRole(null);
          setDeleteModalOpen(false);
        },
        onError: () => {
          toast.error(t('usersManagement.roles_tab.toasts.deleteError'));
        },
      });
    }
  };

  const roleItems = roles?.data || [];
  const totalPages = roles?.meta?.totalPages || 1;
  const totalItems = roles?.meta?.total || roleItems.length;
  const customRoles = roles?.meta?.customRoles || 0;
  const systemRoles = roles?.meta?.systemRoles || 0;
  const totalRoles = roles?.meta?.total || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedRoles = roleItems;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('usersManagement.roles_tab.title')}
        </h2>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className=" uppercase">
                    <TableHead className=" ">
                      {t('usersManagement.common.role')}
                    </TableHead>
                    <TableHead className=" ">
                      {t('usersManagement.common.description')}
                    </TableHead>
                    <TableHead className=" ">
                      {t('usersManagement.common.type')}
                    </TableHead>
                    <TableHead className="text-right pe-4  ">
                      {t('usersManagement.common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20">
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRoles?.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-20 text-gray-500 dark:text-gray-400"
                        >
                          {t('usersManagement.roles_tab.noRoles')}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                  {paginatedRoles.map((role: Role) => (
                    <TableRow
                      key={role.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 border-gray-100 dark:border-gray-700"
                    >
                      <TableCell className="ps-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        <div className="flex items-center gap-2">
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[600px]">
                        {role.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={role.isSystem ? 'default' : 'success'}
                          className="px-2 py-0.5 text-[10px] font-bold"
                        >
                          {role.isSystem
                            ? t('usersManagement.roles_tab.type.system')
                            : t('usersManagement.roles_tab.type.custom')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pe-4">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-primary hover:bg-primary/10"
                                onClick={() =>
                                  navigate(
                                    `/users-management/role-permission-management/${role.id}`
                                  )
                                }
                              >
                                <ShieldCheck className="h-4 w-4 " />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t('usersManagement.roles_tab.tooltips.manage')}
                            </TooltipContent>
                          </Tooltip>
                          {!role.isSystem && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-gray-500 dark:text-gray-400"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="dark:bg-gray-800 dark:border-gray-700"
                              >
                                <DropdownMenuItem
                                  className="dark:text-gray-200 dark:focus:bg-gray-700"
                                  onClick={() =>
                                    navigate(
                                      `/users-management/edit-role/${role.id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t('usersManagement.common.edit') || 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400 dark:focus:bg-red-900/20"
                                  onClick={() => handleDelete(role.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('usersManagement.common.delete') ||
                                    'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 dark:bg-primary/10 border border-primary/20 shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="  font-semibold text-primary uppercase  ">
                {t('usersManagement.roles_tab.summary.total')}
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {totalRoles}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 dark:bg-success/10 border border-success/20 shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="  font-semibold text-success uppercase  ">
                {t('usersManagement.roles_tab.summary.system')}
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {systemRoles}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="  font-semibold text-yellow-600 dark:text-yellow-500 uppercase  ">
                {t('usersManagement.roles_tab.summary.custom')}
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {customRoles}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Role Modal */}
      <DeleteRoleModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        role={selectedRole || null}
        onConfirm={handleDeleteConfirm}
        loading={deleteRoleMutation.isPending}
      />
    </div>
  );
};

export default Roles;
