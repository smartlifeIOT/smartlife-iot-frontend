import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cpu, Layout, Box, Map, Zap, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  useCreateCustomer,
  useUpdateCustomer,
} from '@/features/customer/hooks';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { useUsage } from '@/features/Subscription/hooks';
import { useTranslation } from 'react-i18next';

export default function CreateCustomerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const { data: usageData, isLoading } = useUsage();

  // Zod validation schema
  const createCustomerSchema = z.object({
    name: z.string().min(1, t('usersManagement.create_user.validation.name')).trim(),
    email: z
      .string()
      .email(t('usersManagement.create_user.validation.email'))
      .min(1, t('usersManagement.create_user.validation.email')),
    phone: z.string().min(1, t('usersManagement.create_user.validation.phone')).trim(),
    description: z.string().optional(),
    city: z.string().min(1, t('usersManagement.common.city')).trim(),
    address: z.string().min(1, t('usersManagement.common.address')).trim(),
    state: z.string().min(1, t('usersManagement.common.state')).trim(),
    zip: z.string().min(1, t('usersManagement.common.zip')).trim(),
    country: z.string().min(1, t('usersManagement.common.country')).trim(),

    allocatedLimits: z.object({
      devices: z.string(),
      dashboards: z.string(),
      assets: z.string(),
      floorPlans: z.string(),
      automations: z.string(),
      users: z.string().min(1, t('usersManagement.create_user.validation.users') || 'Users is required'),
    }),
  });

  type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      description: '',
      city: '',
      address: '',
      state: '',
      zip: '',
      country: '',

      allocatedLimits: {
        devices: '',
        dashboards: '',
        assets: '',
        floorPlans: '',
        automations: '',
        users: '',
      },
    },
    mode: 'onChange',
  });

  const usage: any = usageData;

  const onSubmit = async (data: CreateCustomerFormData) => {
    const customerData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      description: data.description || undefined,
      city: data.city || undefined,
      address: data.address || undefined,
      state: data.state || undefined,
      zip: data.zip || undefined,
      country: data.country,
      allocatedLimits: {
        devices: parseInt(data.allocatedLimits.devices) || 0,
        dashboards: parseInt(data.allocatedLimits.dashboards) || 0,
        assets: parseInt(data.allocatedLimits.assets) || 0,
        floorPlans: parseInt(data.allocatedLimits.floorPlans) || 0,
        automations: parseInt(data.allocatedLimits.automations) || 0,
        users: parseInt(data.allocatedLimits.users) || 0,
      },
    };

    createCustomerMutation.mutate(customerData);
  };

  const handleCancel = () => {
    navigate('/customer-management');
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('usersManagement.create_customer.title')}
        </h1>

        {/* Two Column Layout */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Information and Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information Card */}
              <Card className="shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('usersManagement.create_customer.info')}
                  </h2>
                  <div className="space-y-4">
                    {/* Customer Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('usersManagement.common.name')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder={t('usersManagement.create_customer.placeholders.name')}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Contact Email */}
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
                        placeholder={t('usersManagement.create_customer.placeholders.email')}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
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
                        placeholder={t('usersManagement.create_customer.placeholders.phone')}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone.message}
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
                      <Input
                        id="description"
                        {...register('description')}
                        placeholder={t('usersManagement.create_customer.placeholders.description')}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      />
                    </div>

                    {/* City and State/Province */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('usersManagement.common.city')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="city"
                          {...register('city')}
                          placeholder={t('usersManagement.create_customer.placeholders.city')}
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('usersManagement.common.state')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="state"
                          {...register('state')}
                          placeholder={t('usersManagement.create_customer.placeholders.state')}
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('usersManagement.common.address')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="address"
                        {...register('address')}
                        placeholder={t('usersManagement.create_customer.placeholders.address')}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    {/* Zip/Postal Code and Country */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="zip"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('usersManagement.common.zip')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="zip"
                          {...register('zip')}
                          placeholder={t('usersManagement.create_customer.placeholders.zip')}
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                        />
                        {errors.zip && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.zip.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('usersManagement.common.country')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="country"
                          {...register('country')}
                          placeholder={t('usersManagement.create_customer.placeholders.country')}
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                        />
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Settings Card */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      {/* Allocated Limits */}
                      <div className="">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {t('usersManagement.create_customer.limits')}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('usersManagement.create_customer.subscription.resources.users')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="number"
                              min={0}
                              {...register('allocatedLimits.users')}
                              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                            />
                            {errors.allocatedLimits?.users && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.allocatedLimits.users.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('usersManagement.create_customer.subscription.resources.devices')}
                            </label>
                            <Input
                              type="number"
                              min={0}
                              {...register('allocatedLimits.devices')}
                              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('usersManagement.create_customer.subscription.resources.dashboards')}
                            </label>
                            <Input
                              type="number"
                              min={0}
                              {...register('allocatedLimits.dashboards')}
                              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('usersManagement.create_customer.subscription.resources.assets')}
                            </label>
                            <Input
                              type="number"
                              min={0}
                              {...register('allocatedLimits.assets')}
                              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('usersManagement.create_customer.subscription.resources.floorPlans')}
                            </label>
                            <Input
                              type="number"
                              min={0}
                              {...register('allocatedLimits.floorPlans')}
                              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('usersManagement.create_customer.subscription.resources.automations')}
                            </label>
                            <Input
                              type="number"
                              min={0}
                              {...register('allocatedLimits.automations')}
                              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Required fields note */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      <span className="text-red-500">*</span> {t('usersManagement.common.requiredFields')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right Column - Actions and Help */}
            <div className="space-y-6">
              {/* Actions Card */}
              <Card className="shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('usersManagement.common.actions')}
                  </h2>
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full justify-start bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      disabled={
                        isSubmitting ||
                        createCustomerMutation.isPending ||
                        updateCustomerMutation.isPending
                      }
                      isLoading={
                        createCustomerMutation.isPending ||
                        updateCustomerMutation.isPending
                      }
                    >
                      {t('usersManagement.create_customer.saveAndAdd')}
                    </Button>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={handleCancel}
                      >
                        {t('usersManagement.common.cancel')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Current Subscription Card */}
              <Card className="shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden">
                <div className="bg-secondary p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">
                        {t('usersManagement.create_customer.subscription.title')}
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                      {usage?.plan || t('usersManagement.create_customer.subscription.plan')}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-5">
                    {/* Resource Items */}
                    {[
                      {
                        label: t('usersManagement.create_customer.subscription.resources.users'),
                        icon: Users,
                        usage: usage?.current?.users || 0,
                        limit: usage?.limits?.users || 0,
                        color: 'bg-blue-500',
                      },
                      {
                        label: t('usersManagement.create_customer.subscription.resources.devices'),
                        icon: Cpu,
                        usage: usage?.current?.devices || 0,
                        limit: usage?.limits?.devices || 0,
                        color: 'bg-indigo-500',
                      },
                      {
                        label: t('usersManagement.create_customer.subscription.resources.assets'),
                        icon: Box,
                        usage: usage?.current?.assets || 0,
                        limit: usage?.limits?.assets || 0,
                        color: 'bg-purple-500',
                      },
                      {
                        label: t('usersManagement.create_customer.subscription.resources.dashboards'),
                        icon: Layout,
                        usage: usage?.current?.dashboards || 0,
                        limit: usage?.limits?.dashboards || 0,
                        color: 'bg-pink-500',
                      },
                      {
                        label: t('usersManagement.create_customer.subscription.resources.floorPlans'),
                        icon: Map,
                        usage: usage?.current?.floorPlans || 0,
                        limit: usage?.limits?.floorPlans || 0,
                        color: 'bg-orange-500',
                      },
                      {
                        label: t('usersManagement.create_customer.subscription.resources.automations'),
                        icon: Zap,
                        usage: usage?.current?.automations || 0,
                        limit: usage?.limits?.automations || 0,
                        color: 'bg-yellow-500',
                      },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                            <item.icon className="h-4 w-4 text-gray-400" />
                            {item.label}
                          </div>
                          <div className="text-xs font-semibold tabular-nums">
                            <span className="text-gray-900 dark:text-white">{item.usage}</span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-gray-500 dark:text-gray-400">{item.limit}</span>
                          </div>
                        </div>
                        <Progress
                          value={item.usage}
                          max={item.limit || 1}
                          className="h-1.5 bg-gray-100 dark:bg-gray-900"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
