import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Permission } from '@/services/api/users.api';
import { usePermissions } from '@/features/permissions/hooks';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import {
  useCreateRole,
  useRoleById,
  useUpdateRole,
} from '@/features/roles/hooks';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

export default function CreateRolePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { mutateAsync: createRole } = useCreateRole();
  const { mutateAsync: updateRole } = useUpdateRole();
  const { data: roleData, isLoading: isRoleLoading } = useRoleById(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );

  // Zod validation schema
  const createRoleSchema = z.object({
    name: z.string().min(1, t('usersManagement.create_role.validation.name')).trim(),
    description: z.string().optional(),
    permissionIds: z
      .array(z.string())
      .min(1, t('usersManagement.create_role.validation.permissions')),
  });

  type CreateRoleFormData = z.infer<typeof createRoleSchema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isEditMode && roleData) {
      reset({
        name: roleData.name || '',
        description: roleData.description || '',
        permissionIds: roleData.permissions?.map((p: any) => p.id) || [],
      });
    }
  }, [isEditMode, roleData, reset]);
  const { data: permissionsData, isLoading } = usePermissions();
  const permissions = useMemo(
    () => (permissionsData || []) as Permission[],
    [permissionsData]
  );
  const selectedPermissions = watch('permissionIds') || [];

  const permissionCategories = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach((permission) => {
      const key = permission.resource || 'other';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(permission);
    });

    return Object.entries(grouped).map(([resource, items]) => ({
      category: resource,
      permissions: items,
    }));
  }, [permissions]);

  const allPermissionIds = useMemo(
    () => permissions.map((permission) => permission.id),
    [permissions]
  );

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSelectAll = () => {
    setValue('permissionIds', allPermissionIds);
  };

  const handleClearAll = () => {
    setValue('permissionIds', []);
  };

  const handlePermissionToggle = (
    permissionId: string,
    currentPermissions: string[],
    onChange: (value: string[]) => void
  ) => {
    if (currentPermissions.includes(permissionId)) {
      onChange(currentPermissions.filter((id) => id !== permissionId));
    } else {
      onChange([...currentPermissions, permissionId]);
    }
  };

  const onSubmit = async (data: CreateRoleFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateRole({ roleId: id as string, data });
        navigate('/users-management', {
          state: { tab: 'Roles' },
        });
      } else {
        await createRole(data);
        navigate('/users-management', {
          state: { tab: 'Roles' },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users-management', {
      state: { tab: 'Roles' },
    });
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {isEditMode ? t('usersManagement.create_role.editTitle') : t('usersManagement.create_role.title')}
        </h1>

        {/* Two Column Layout */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Role Details */}
            <Card className="shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
              {isRoleLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : (
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('usersManagement.create_role.info')}
                  </h2>
                  <div className="space-y-4">
                    {/* Role Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('usersManagement.create_role.placeholders.name')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder={t('usersManagement.create_role.placeholders.name')}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('usersManagement.common.description')}
                      </label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder={t('usersManagement.create_role.placeholders.description')}
                        className="min-h-[100px] w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      />
                    </div>

                    {/* Required fields note */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      <span className="text-red-500">*</span> {t('usersManagement.common.requiredFields')}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Right Column - Permissions */}
            <Card className="shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('usersManagement.create_role.permissions')} <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <div className="flex mb-2 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSelectAll}
                      className="bg-secondary hover:bg-secondary/10 text-white text-xs px-3 py-1 h-8"
                    >
                      {t('usersManagement.create_role.selectAll')}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClearAll}
                      className="bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 h-8"
                    >
                      {t('usersManagement.create_role.clearAll')}
                    </Button>
                  </div>
                </div>
                {isLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Controller
                    name="permissionIds"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {permissionCategories.map((category) => {
                          const isOpen =
                            openCategories[category.category] ?? false;
                          return (
                            <div key={category.category} className="">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleCategory(category.category)
                                }
                                className="flex w-full items-center justify-between rounded p-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900"
                              >
                                <span className="first-letter:uppercase ">
                                  {category.category.replace('_', ' ')}
                                </span>
                                {isOpen ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              {isOpen && (
                                <div className="space-y-2 bg-gray-100 dark:bg-gray-800/50 p-2">
                                  {category.permissions.map((permission) => {
                                    const isChecked =
                                      selectedPermissions.includes(
                                        permission.id
                                      );
                                    const actionText = permission.action;

                                    return (
                                      <div
                                        key={permission.id}
                                        className="flex items-center gap-2"
                                      >
                                        <Checkbox
                                          checked={isChecked}
                                          onChange={() =>
                                            handlePermissionToggle(
                                              permission.id,
                                              selectedPermissions,
                                              field.onChange
                                            )
                                          }
                                          label={
                                            permission.description ||
                                            permission.name ||
                                            `${permission.resource}${actionText ? `: ${actionText}` : ''}`
                                          }
                                          className="dark:text-gray-300"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          {errors.permissionIds && (
            <p className="text-sm pt-3 text-red-600">
              {errors.permissionIds.message}
            </p>
          )}
          {/* Action Buttons */}
          <div className="flex justify-start gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white border-gray-300 dark:border-gray-700"
            >
              {t('usersManagement.common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('usersManagement.common.update') : t('usersManagement.common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
