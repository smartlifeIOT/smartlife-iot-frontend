import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoles } from '@/features/users/hooks';
import type { Role, UserRole } from '@/services/api/users.api';
import type { Customer } from '@/features/customer/types';
import { toast } from 'react-hot-toast';
import { useCreateCustomerUser } from '@/features/customerUser/hooks';
import { useCustomersByTenantId } from '@/features/customer/hooks/useCustomers';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from 'react-i18next';

export default function CreateUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createUserMutation = useCreateCustomerUser();
  const { data: rolesData } = useRoles();
  const { data: customersData } = useCustomersByTenantId();
  const { user } = useAppStore();
  const isCustomerAdmin = user?.role === 'customer';
  const roles: Role[] = rolesData?.data || [];

  const createUserSchema = z.object({
    name: z.string().min(1, t('usersManagement.create_user.validation.name')),
    email: z.string().email(t('usersManagement.create_user.validation.email')).min(1, t('usersManagement.create_user.validation.email')),
    roleId: z.string().min(1, t('usersManagement.create_user.validation.role')),
    phone: z.string().min(8, t('usersManagement.create_user.validation.phone')),
    customerId: z.string().min(1, t('usersManagement.create_user.validation.customer')),
  });

  type CreateUserFormData = z.infer<typeof createUserSchema>;

  const customersList: Customer[] = customersData?.data || [];
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: '',
      phone: '',
      customerId: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: CreateUserFormData) => {
    const userData = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      roleId: data.roleId as UserRole,
      customerId: data.customerId || undefined,
    };

    createUserMutation.mutate({ userData });
  };

  const handleCancel = () => {
    navigate('/users-management');
  };

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('usersManagement.create_user.title')}
        </h1>

        <Card className="shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('usersManagement.create_user.userDetails')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('usersManagement.common.name')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      type="text"
                      {...register('name')}
                      placeholder={t('usersManagement.create_user.placeholders.name')}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('usersManagement.common.phone')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder={t('usersManagement.create_user.placeholders.phone')}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('usersManagement.common.email')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder={t('usersManagement.create_user.placeholders.email')}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="roleId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('usersManagement.common.role')}
                    </label>
                    <Controller
                      name="roleId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="roleId"
                            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                          >
                            <SelectValue placeholder={t('usersManagement.create_user.placeholders.role')} />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                            {roles.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id}
                                textValue={role.name}
                                className="dark:text-white dark:focus:bg-gray-800"
                              >
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.roleId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.roleId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right column */}
                <div className="">
                  {!isCustomerAdmin && (
                    <div>
                      <label
                        htmlFor="customerId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('usersAndRoles.customer')} <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="customerId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id="customerId"
                              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                            >
                              <SelectValue placeholder={t('usersManagement.create_user.placeholders.customer')} />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                              {customersList.map((customer) => (
                                <SelectItem
                                  key={customer.id}
                                  value={customer.id}
                                  textValue={customer.name}
                                  className="dark:text-white dark:focus:bg-gray-800"
                                >
                                  <div className="flex flex-col">
                                    {customer.name}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {customer.email}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}
                  {errors.customerId && (
                    <p className=" text-sm text-red-600">
                      {errors.customerId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting || createUserMutation.isPending}
                  className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                >
                  {t('usersManagement.common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || createUserMutation.isPending}
                  isLoading={createUserMutation.isPending}
                  variant="secondary"
                >
                  {t('usersManagement.common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          <span className="text-red-500">*</span> {t('usersManagement.common.requiredFields')}
        </p>
      </div>
    </div>
  );
}
