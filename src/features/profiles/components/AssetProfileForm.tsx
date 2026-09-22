import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AssetProfileFormData } from '../types/asset-profile-form.types';
import { DEFAULT_ASSET_PROFILE_FORM_DATA } from '../types/asset-profile-form.types';
import { assetProfileFormSchema } from '../types/asset-profile-form.schema';
import {
  useEdgeRuleChain,
  useQueues,
  useRuleChains,
} from '@/features/rules/hooks';

interface AssetProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AssetProfileFormData) => void;
  isLoading?: boolean;
}

export const AssetProfileForm: React.FC<AssetProfileFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation();
  const form = useForm<AssetProfileFormData>({
    resolver: zodResolver(assetProfileFormSchema),
    defaultValues: DEFAULT_ASSET_PROFILE_FORM_DATA,
    mode: 'onChange',
  });

  const handleClose = () => {
    form.reset(DEFAULT_ASSET_PROFILE_FORM_DATA);
    onOpenChange(false);
  };

  const handleSubmit = async (data: AssetProfileFormData) => {
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] rounded-3xl pb-10  overflow-hidden dark:bg-gray-950 dark:border-gray-700 ">
        <DialogHeader className="dark:text-white dark:bg-gray-950 dark:border-gray-700 dark:border-b">
          <DialogTitle>{t('assetProfiles.form.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('assetProfiles.form.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 h-[70vh] px-4 overflow-y-auto"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('assetProfiles.form.name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('assetProfiles.form.namePlaceholder')}
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
                    <FormLabel>{t('assetProfiles.form.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'assetProfiles.form.descriptionPlaceholder'
                        )}
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
                    <FormLabel>
                      {t('assetProfiles.form.defaultRuleChain')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'assetProfiles.form.ruleChainPlaceholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Root Rule Chain">
                          {t('assetProfiles.form.ruleChains.root')}
                        </SelectItem>
                        <SelectItem value="Industrial Processing">
                          {t('assetProfiles.form.ruleChains.industrial')}
                        </SelectItem>
                        <SelectItem value="Building Management">
                          {t('assetProfiles.form.ruleChains.building')}
                        </SelectItem>
                        <SelectItem value="Residential Processing">
                          {t('assetProfiles.form.ruleChains.residential')}
                        </SelectItem>
                        <SelectItem value="Warehouse Processing">
                          {t('assetProfiles.form.ruleChains.warehouse')}
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
                    <FormLabel>{t('assetProfiles.form.queue')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'assetProfiles.form.queuePlaceholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Root Rule Chain">
                          {t('assetProfiles.form.queues.root')}
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
                    <FormLabel>
                      {t('assetProfiles.form.defaultEdgeRuleChain')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'assetProfiles.form.edgeRuleChainPlaceholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Root Rule Chain">
                          {t('assetProfiles.form.ruleChains.root')}
                        </SelectItem>
                        <SelectItem value="Edge Processing">
                          {t('assetProfiles.form.ruleChains.edge')}
                        </SelectItem>
                        <SelectItem value="Gateway Processing">
                          {t('assetProfiles.form.ruleChains.gateway')}
                        </SelectItem>
                        <SelectItem value="Industrial Processing">
                          {t('assetProfiles.form.ruleChains.industrial')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs text-gray-600">
                      {t('assetProfiles.form.edgeRuleChainDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="p-4 absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 ">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('assetProfiles.form.cancel')}
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isLoading
                  ? t('assetProfiles.form.creating')
                  : t('assetProfiles.form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
