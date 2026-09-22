import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { deviceProfileMultiStepFormSchema } from '../types/device-profile-form.schema';
import type { DeviceProfileMultiStepFormData } from '../types/device-profile-form.types';
import { DEFAULT_MULTI_STEP_FORM_DATA } from '../types/device-profile-form.types';
import { useUpdateDeviceProfile } from '../hooks';
import { Step4DeviceProvisioning } from './steps/Step4DeviceProvisioning';
import toast from 'react-hot-toast';

interface DeviceProfileProvisioningTabProps {
  profileId: string;
  profileData?: {
    provisionConfiguration?: DeviceProfileMultiStepFormData['provisionConfiguration'];
  };
  onSuccess?: () => void;
}

const DeviceProfileProvisioningTab: React.FC<
  DeviceProfileProvisioningTabProps
> = ({ profileId, profileData, onSuccess }) => {
  const updateDeviceProfileMutation = useUpdateDeviceProfile();

  const form = useForm<DeviceProfileMultiStepFormData>({
    resolver: zodResolver(deviceProfileMultiStepFormSchema),
    defaultValues: DEFAULT_MULTI_STEP_FORM_DATA,
    mode: 'onChange',
  });

  // Initialize form with existing profile data
  useEffect(() => {
    if (profileData?.provisionConfiguration) {
      form.reset({
        ...DEFAULT_MULTI_STEP_FORM_DATA,
        provisionConfiguration: profileData.provisionConfiguration,
      });
    }
  }, [profileData, form]);

  const handleSubmit = async (data: DeviceProfileMultiStepFormData) => {
    try {
      await updateDeviceProfileMutation.mutateAsync({
        profileId,
        data,
      });
      toast.success('Provisioning configuration updated successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error updating provisioning configuration:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to update provisioning configuration. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profileData?.provisionConfiguration) {
      form.reset({
        ...DEFAULT_MULTI_STEP_FORM_DATA,
        provisionConfiguration: profileData.provisionConfiguration,
      });
    }
  };

  const isDirty = form.formState.isDirty;
  const isSubmitting = updateDeviceProfileMutation.isPending;

  return (
    <Card className="border-2 rounded-lg">
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Step4DeviceProvisioning form={form} />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!isDirty || isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeviceProfileProvisioningTab;
