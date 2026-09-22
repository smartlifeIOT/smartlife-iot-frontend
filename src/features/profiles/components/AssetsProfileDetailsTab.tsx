import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { assetProfileFormSchema } from '../types/asset-profile-form.schema';
import type { AssetProfileFormData } from '../types/asset-profile-form.types';
import { DEFAULT_ASSET_PROFILE_FORM_DATA } from '../types/asset-profile-form.types';
import { useUpdateAssetProfile } from '../hooks';
import { useNavigate } from 'react-router-dom';

interface AssetsProfileDetailsTabProps {
  profileId: string;
  profileData?: {
    defaultQueueName?: string;
    name?: string;
    description?: string;
    defaultRuleChain?: string;
    mobileDashboard?: string;
    queue?: string;
    defaultEdgeRuleChain?: string;
  };
  onSuccess?: () => void;
}

const AssetsProfileDetailsTab: React.FC<AssetsProfileDetailsTabProps> = ({
  profileId,
  profileData
}) => {
  const updateAssetProfileMutation = useUpdateAssetProfile();
  const navigate = useNavigate();
  const form = useForm<AssetProfileFormData>({
    resolver: zodResolver(assetProfileFormSchema),
    defaultValues: DEFAULT_ASSET_PROFILE_FORM_DATA,
    mode: 'onChange',
  });

  // Initialize form with existing profile data
  useEffect(() => {
    if (profileData) {
      form.reset({
        name: profileData.name || '',
        description: profileData.description || '',
        defaultRuleChain: profileData.defaultRuleChain || '',
        defaultQueueName: profileData.defaultQueueName || '',
        defaultEdgeRuleChain: profileData.defaultEdgeRuleChain || '',
        assetProfileImage: undefined,
      });
    }
  }, [profileData, form]);

  const handleSubmit = async (data: AssetProfileFormData) => {
    try {
      await updateAssetProfileMutation.mutateAsync({
        profileId,
        data,
      });
      toast.success('Asset profile updated successfully');
      navigate(`/asset-profiles`);
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to update asset profile. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profileData) {
      form.reset({
        name: profileData.name || '',
        description: profileData.description || '',
        defaultRuleChain: profileData.defaultRuleChain || '',
        defaultQueueName: profileData.defaultQueueName || '',
        defaultEdgeRuleChain: profileData.defaultEdgeRuleChain || '',
        assetProfileImage: undefined,
      });
    }
  };

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter asset profile name"
                          {...field}
                          className="border-2 rounded-md"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter asset profile description"
                          {...field}
                          className="border-2 rounded-md min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultRuleChain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Rule Chain</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select default rule chain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Root Rule Chain">
                            Root Rule Chain
                          </SelectItem>
                          <SelectItem value="Industrial Processing">
                            Industrial Processing
                          </SelectItem>
                          <SelectItem value="Building Management">
                            Building Management
                          </SelectItem>
                          <SelectItem value="Residential Processing">
                            Residential Processing
                          </SelectItem>
                          <SelectItem value="Warehouse Processing">
                            Warehouse Processing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultQueueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queue</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select queue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Root Rule Chain">
                            Root queue Chain
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultEdgeRuleChain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Edge Rule Chain</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select default edge rule chain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Root Rule Chain">
                            Root Rule Chain
                          </SelectItem>
                          <SelectItem value="Edge Processing">
                            Edge Processing
                          </SelectItem>
                          <SelectItem value="Gateway Processing">
                            Gateway Processing
                          </SelectItem>
                          <SelectItem value="Industrial Processing">
                            Industrial Processing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-gray-600">
                        Used on edge as rule chain to process incoming data for
                        assets of this asset profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateAssetProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateAssetProfileMutation.isPending}
                >
                  {updateAssetProfileMutation.isPending
                    ? 'Saving...'
                    : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsProfileDetailsTab;
