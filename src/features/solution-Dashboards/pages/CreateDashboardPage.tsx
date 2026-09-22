import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/common/TagInput';
import { dashboardsApi } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';

// Zod validation schema
const createDashboardSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required').trim(),
  description: z.string().optional(),
  owner: z
    .array(z.string())
    .min(1, 'Owner is required')
    .max(1, 'Only one owner is allowed'),
  visibility: z.boolean().optional(),
});

type CreateDashboardFormData = z.infer<typeof createDashboardSchema>;

export default function CreateDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateDashboardFormData>({
    resolver: zodResolver(createDashboardSchema),
    defaultValues: {
      name: '',
      description: '',
      owner: ['admin'],
      visibility: false,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: CreateDashboardFormData) => {
    try {
      // Prepare dashboard data
      const dashboardData = {
        name: data.name,
        description: data.description || undefined,
        visibility: data.visibility ? 'private' : 'public',
      };

      // Create dashboard
      await dashboardsApi.create(dashboardData);

      toast.success(
        t('createDashboard.success') || 'Dashboard created successfully'
      );
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      navigate('/solution-dashboards');
    } catch (error: unknown) {
      toast.error('error');
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        t('createDashboard.error') ||
        'Failed to create dashboard';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/solution-dashboards');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold dark:text-white text-gray-900">
        {t('createDashboard.title') || 'Create New Dashboard'}
      </h1>

      <div className="grid   gap-6">
        {/* Form Card */}
        <Card className="shadow-lg rounded-xl border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dashboard Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium dark:text-white text-gray-700 mb-2"
                >
                  {t('createDashboard.dashboardTitle') || 'Dashboard Title'} *
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder={
                    t('createDashboard.dashboardTitlePlaceholder') ||
                    'Enter dashboard title'
                  }
                  className="w-full border rounded-md"
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
                  className="block text-sm font-medium dark:text-white text-gray-700 mb-2"
                >
                  {t('createDashboard.description') || 'Description'}
                </label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder={
                    t('createDashboard.descriptionPlaceholder') ||
                    'Enter dashboard description'
                  }
                  className="min-h-[100px] w-full"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Owner and Groups Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold dark:text-white text-gray-900">
                  {t('createDashboard.ownerAndGroups') || 'Owner and Groups'}
                </h2>

                {/* Owner Field */}
                <div>
                  <label className="block text-sm font-medium dark:text-white text-gray-700 mb-2">
                    {t('createDashboard.owner') || 'Owner'} *
                  </label>
                  <Controller
                    name="owner"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={
                          t('createDashboard.ownerPlaceholder') ||
                          'Type owner name and press Enter'
                        }
                        maxTags={1}
                      />
                    )}
                  />
                  {errors.owner && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.owner.message}
                    </p>
                  )}
                </div>

                {/* Groups Field done  */}
                <div>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="visibility"
                        name="visibility"
                        label="Make This Dashbaord Private ?"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.visibility && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.visibility.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="bg-white border-gray-300 dark:text-white text-gray-700 hover:bg-gray-50"
                >
                  {t('createDashboard.cancel') || 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-secondary hover:bg-secondary/90 dark:text-white text-white"
                  isLoading={isSubmitting}
                >
                  {t('createDashboard.save') || 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
