import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Permission {
  id: string;
  label: string;
  category: string;
}

interface AssignedPermission {
  id: string;
  label: string;
  category: string;
}

const availablePermissions: Permission[] = [
  // Device Management
  {
    id: 'create-devices',
    label: 'Create Devices',
    category: 'Device Management',
  },
  {
    id: 'delete-devices',
    label: 'Delete Devices',
    category: 'Device Management',
  },
  {
    id: 'edit-device-attributes',
    label: 'Edit Device Attributes',
    category: 'Device Management',
  },
  // Dashboard Management
  {
    id: 'create-dashboards',
    label: 'Create Dashboards',
    category: 'Dashboard Management',
  },
  {
    id: 'share-dashboards',
    label: 'Share Dashboards',
    category: 'Dashboard Management',
  },
  // User Management
  {
    id: 'create-users',
    label: 'Create Users',
    category: 'User Management',
  },
  {
    id: 'edit-users',
    label: 'Edit Users',
    category: 'User Management',
  },
  // Data Access
  {
    id: 'view-telemetry',
    label: 'View Telemetry',
    category: 'Data Access',
  },
  {
    id: 'export-data',
    label: 'Export Data',
    category: 'Data Access',
  },
];

const assignedPermissions: AssignedPermission[] = [
  {
    id: 'view-devices-1',
    label: 'View Devices',
    category: 'Device Management',
  },
  {
    id: 'view-devices-2',
    label: 'View Devices',
    category: 'Device Management',
  },
  {
    id: 'view-devices-3',
    label: 'View Devices',
    category: 'Device Management',
  },
];

export default function AssignPermissionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [availableSearch, setAvailableSearch] = useState('');
  const [assignedSearch, setAssignedSearch] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<string>('');
  const [assigned, setAssigned] =
    useState<AssignedPermission[]>(assignedPermissions);

  // Group available permissions by category
  const permissionsByCategory = availablePermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  // Filter available permissions by search
  const filteredAvailablePermissions = availablePermissions.filter((perm) =>
    perm.label.toLowerCase().includes(availableSearch.toLowerCase())
  );

  // Filter assigned permissions by search
  const filteredAssignedPermissions = assigned.filter((perm) =>
    perm.label.toLowerCase().includes(assignedSearch.toLowerCase())
  );

  const handleAdd = () => {
    if (!selectedPermission) {
      toast.error(t('usersManagement.assign_permissions.toasts.selectFirst'));
      return;
    }

    const permission = availablePermissions.find(
      (p) => p.id === selectedPermission
    );
    if (permission) {
      // Check if already assigned
      if (assigned.some((p) => p.id === permission.id)) {
        toast.error(t('usersManagement.assign_permissions.toasts.alreadyAssigned'));
        return;
      }

      setAssigned([...assigned, permission]);
      setSelectedPermission('');
      toast.success(t('usersManagement.assign_permissions.toasts.added', { label: permission.label }));
    }
  };

  const handleRemove = (permissionId: string) => {
    const permission = assigned.find((p) => p.id === permissionId);
    if (permission) {
      setAssigned(assigned.filter((p) => p.id !== permissionId));
      toast.success(t('usersManagement.assign_permissions.toasts.removed', { label: permission.label }));
    }
  };

  const handleSave = () => {
    toast.success(t('usersManagement.assign_permissions.toasts.saved'));
    navigate('/users-management', { state: { tab: 'Users' } });
  };

  const handleCancel = () => {
    navigate('/users-management', { state: { tab: 'Users' } });
  };

  // Calculate permission level based on count
  const getPermissionLevel = (count: number) => {
    if (count >= 15) return { label: t('usersManagement.assign_permissions.levels.high'), color: 'bg-green-500' };
    if (count >= 8) return { label: t('usersManagement.assign_permissions.levels.moderate'), color: 'bg-orange-500' };
    return { label: t('usersManagement.assign_permissions.levels.low'), color: 'bg-yellow-500' };
  };

  const permissionLevel = getPermissionLevel(assigned.length);

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('usersManagement.assign_permissions.title')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('usersManagement.assign_permissions.userLabel', { email: 'john.doe@company.com' })}
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAdd} className="bg-secondary hover:bg-secondary/90 text-white">
                  {t('usersManagement.common.add') || 'Add'}
                </Button>
                <Button
                  onClick={() => {
                    if (selectedPermission) {
                      const perm = assigned.find(
                        (p) => p.id === selectedPermission
                      );
                      if (perm) handleRemove(perm.id);
                    }
                  }}
                  variant="ghost"
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  {t('usersManagement.bulk_management.modals.role.removeTitle') || 'Remove'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Three Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Permissions Panel */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('usersManagement.assign_permissions.panels.available')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Input
                type="text"
                placeholder={t('usersManagement.assign_permissions.search.available')}
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                iconPosition="right"
                className="w-full"
              />

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(permissionsByCategory).map(
                  ([category, permissions]) => {
                    const categoryPermissions = permissions.filter((perm) =>
                      filteredAvailablePermissions.some((p) => p.id === perm.id)
                    );

                    if (categoryPermissions.length === 0) return null;

                    return (
                      <div key={category} className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-l-4 border-secondary pl-2">
                          {category}
                        </h3>
                        <RadioGroup
                          value={selectedPermission}
                          onValueChange={setSelectedPermission}
                        >
                          {categoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 px-2 rounded-md"
                            >
                              <RadioGroupItem
                                value={permission.id}
                                id={permission.id}
                                className="border-gray-300 dark:border-gray-600"
                              />
                              <Label
                                htmlFor={permission.id}
                                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                              >
                                {permission.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Permissions Panel */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('usersManagement.assign_permissions.panels.assigned')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('usersManagement.assign_permissions.search.assigned')}
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                  iconPosition="right"
                  className="w-full"
                />
                {assignedSearch && (
                  <button
                    onClick={() => setAssignedSearch('')}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredAssignedPermissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-3">
                      <X className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('usersManagement.assign_permissions.summary.noAssigned')}
                    </p>
                  </div>
                ) : (
                  filteredAssignedPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:border-secondary/30 border border-transparent transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-secondary">•</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {permission.label}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase">
                            {permission.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(permission.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permission Summary Panel */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('usersManagement.assign_permissions.panels.summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('usersManagement.assign_permissions.summary.currentRole')}
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Customer User
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('usersManagement.assign_permissions.summary.totalPermissions')}
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {t('usersManagement.assign_permissions.summary.assignedCount', { count: assigned.length })}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('usersManagement.assign_permissions.summary.level')}
                  </p>
                  <Badge
                    className={`${permissionLevel.color} text-white px-3 py-1 w-fit`}
                  >
                    {permissionLevel.label}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('usersManagement.assign_permissions.summary.lastModified')}
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    2024-03-15 14:30
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
                >
                  {t('usersManagement.common.save')}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                >
                  {t('usersManagement.common.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
