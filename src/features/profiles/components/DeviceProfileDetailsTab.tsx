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
import { Step1DeviceProfileDetails } from './steps/Step1DeviceProfileDetails';
import toast from 'react-hot-toast';

interface DeviceProfileDetailsTabProps {
  profileId: string;
  profileData?: {
    name?: string;
    description?: string;
    type?: string;
    defaultRuleChain?: string;
    queue?: string;
    defaultEdgeRuleChain?: string;
  };
  onSuccess?: () => void;
}

const DeviceProfileDetailsTab: React.FC<DeviceProfileDetailsTabProps> = ({
  profileId,
  profileData,
  onSuccess,
}) => {
  const updateDeviceProfileMutation = useUpdateDeviceProfile();

  const form = useForm<DeviceProfileMultiStepFormData>({
    resolver: zodResolver(deviceProfileMultiStepFormSchema),
    defaultValues: DEFAULT_MULTI_STEP_FORM_DATA,
    mode: 'onChange',
  });

  // Initialize form with existing profile data
  useEffect(() => {
    if (profileData) {
      form.reset({
        name: profileData.name || '',
        description: profileData.description || '',
        type: (profileData.type as any) || 'Sensor',
        // defaultRuleChain: profileData.defaultRuleChain || '',
        // queue: profileData.queue || '',
        // defaultEdgeRuleChain: profileData.defaultEdgeRuleChain || '',
        // transportConfig: DEFAULT_MULTI_STEP_FORM_DATA.transportConfig,
        // alarmRules: [],
        // provisioningConfig: DEFAULT_MULTI_STEP_FORM_DATA.provisioningConfig,
      });
    }
  }, [profileData, form]);

  const handleSubmit = async (data: DeviceProfileMultiStepFormData) => {
    try {
      await updateDeviceProfileMutation.mutateAsync({
        profileId,
        data,
      });
      toast.success('Device profile updated successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error updating device profile:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to update device profile. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profileData) {
      form.reset({
        name: profileData.name || '',
        description: profileData.description || '',
        type: (profileData.type as any) || 'Sensor',
        // defaultRuleChain: profileData.defaultRuleChain || '',
        // queue: profileData.queue || '',
        // defaultEdgeRuleChain: profileData.defaultEdgeRuleChain || '',
        // transportConfig: DEFAULT_MULTI_STEP_FORM_DATA.transportConfig,
        // alarmRules: [],
        // provisioningConfig: DEFAULT_MULTI_STEP_FORM_DATA.provisioningConfig,
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
            <Step1DeviceProfileDetails form={form} />

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

export default DeviceProfileDetailsTab;
