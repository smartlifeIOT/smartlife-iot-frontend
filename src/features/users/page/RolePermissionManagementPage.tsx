import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/common/PageHeader';
import { useRoleById } from '@/features/roles/hooks';
import type { Permission } from '@/services/api/users.api';
import { FileWarningIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RolePermissionManagementPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useRoleById(id);
  const [permissionCategory, setPermissionCategory] = useState('');
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const isSystemRole = data?.isSystem;
  const role = data as
    | { permissions?: RolePermission[]; name?: string; description?: string }
    | undefined;
  const allPermissions = useMemo(() => role?.permissions ?? [], [role]);

  const permissionRows = useMemo(
    () => toPermissionRows(allPermissions),
    [allPermissions]
  );

  const categories = useMemo(
    () => Array.from(new Set(permissionRows.map((row) => row.category))),
    [permissionRows]
  );

  useEffect(() => {
    setPermissions(permissionRows);
    if (!permissionCategory && categories.length > 0) {
      setPermissionCategory(categories[0]);
    }
  }, [permissionRows, categories, permissionCategory]);

  const handleCategoryChange = (category: string) => {
    setPermissionCategory(category);
  };

  const handleCancel = () => {
    navigate('/users-management', { state: { tab: 'Roles' } });
  };

  const handleEdit = () => {
    navigate(`/users-management/edit-role/${id}`);
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto space-y-6">
        <PageHeader
          title={t('usersManagement.role_permission_management.roleTitle', { name: role?.name || '' })}
          description={t('usersManagement.role_permission_management.descTitle', { desc: role?.description || '' })}
        />

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6 space-y-6">
            {/* Category Tabs */}
            <Tabs
              value={permissionCategory}
              onValueChange={handleCategoryChange}
              defaultValue={categories[0]}
            >
              <TabsList className="w-full justify-start rounded-none overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-transparent p-0 h-auto">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary dark:data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:text-primary dark:data-[state=active]:text-secondary text-gray-500 dark:text-gray-400 px-4 py-2"
                  >
                    {category.replace('_', ' ')}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Permissions Table */}
            <div className="shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary dark:bg-secondary/80 hover:bg-secondary/90">
                    <TableHead className="text-white font-semibold">
                      {t('usersManagement.role_permission_management.table.permission')}
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      {t('usersManagement.role_permission_management.table.description')}
                    </TableHead>
                    <TableHead className="text-white font-semibold text-center">
                      {t('usersManagement.role_permission_management.table.access')}
                    </TableHead>
                    <TableHead className="text-white font-semibold text-center">
                      {t('usersManagement.role_permission_management.table.create')}
                    </TableHead>
                    <TableHead className="text-white font-semibold text-center">
                      {t('usersManagement.role_permission_management.table.read')}
                    </TableHead>
                    <TableHead className="text-white font-semibold text-center">
                      {t('usersManagement.role_permission_management.table.update')}
                    </TableHead>
                    <TableHead className="text-white font-semibold text-center">
                      {t('usersManagement.role_permission_management.table.delete')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions
                    .filter((permission) =>
                      permissionCategory
                        ? permission.category === permissionCategory
                        : true
                    )
                    .map((permission) => (
                      <TableRow
                        key={permission.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
                      >
                        <TableCell className="font-medium dark:text-gray-200">
                          <div className="flex items-center gap-2">
                            {permission.permission}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {permission.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            disabled={true}
                            checked={isChecked(permission.access)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            disabled={true}
                            checked={isChecked(permission.create)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            disabled={true}
                            checked={isChecked(permission.read)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            disabled={true}
                            checked={isChecked(permission.update)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            disabled={true}
                            checked={isChecked(permission.delete)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {isSystemRole ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="flex w-full items-center justify-center">
                  <FileWarningIcon className="h-4 w-4 mr-2 text-red-500" />
                  {t('usersManagement.role_permission_management.warning')}
                </p>
              </div>
            ) : (
              <div className="flex items-start justify-between pt-4">
                <div className="flex justify-end w-full gap-3 items-end">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleEdit}
                      className="bg-secondary hover:bg-secondary/90 text-white"
                    >
                      {t('usersManagement.role_permission_management.editRoles') || 'Edit Roles'}
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                    >
                      {t('usersManagement.common.cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type PermissionStatus = 'allowed' | 'denied' | 'conditional';

interface PermissionRow {
  id: string;
  permission: string;
  description: string;
  access: PermissionStatus;
  create: PermissionStatus;
  read: PermissionStatus;
  update: PermissionStatus;
  delete: PermissionStatus;
  category: string;
}

const normalizeCategory = (resource: string) =>
  resource
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(part.startsWith(' ') ? 1 : 1))
    .join(' ');

type RolePermission = Permission & {
  action?: string;
};

const toPermissionRows = (permissions: RolePermission[]): PermissionRow[] => {
  const grouped: Record<string, PermissionRow> = {};

  permissions.forEach((permission) => {
    const resource = permission.resource || 'other';
    const category = normalizeCategory(resource);
    const key = resource;

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        permission: category,
        description: permission.description || '',
        access: 'denied',
        create: 'denied',
        read: 'denied',
        update: 'denied',
        delete: 'denied',
        category,
      };
    }

    const action = permission.action;
    if (action === 'access') {
      grouped[key].access = 'allowed';
    } else if (action === 'create') {
      grouped[key].create = 'allowed';
    } else if (action === 'read' || action === 'list') {
      grouped[key].read = 'allowed';
    } else if (action === 'update') {
      grouped[key].update = 'allowed';
    } else if (action === 'delete') {
      grouped[key].delete = 'allowed';
    }

    if (!grouped[key].description && permission.description) {
      grouped[key].description = permission.description;
    }
  });

  return Object.values(grouped);
};

const isChecked = (status: PermissionStatus) => status === 'allowed';
