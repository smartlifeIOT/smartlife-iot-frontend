import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, ScrollText, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import {
  useDeleteCustomer,
  useUpdateCustomer,
} from '@/features/customer/hooks';
import type { Customer } from '@/features/customer/types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface CustomerDetailsCardProps {
  customer: Customer | undefined;
  id: string | undefined;
}

export function CustomerDetailsCard({
  customer,
  id,
}: CustomerDetailsCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCustomerMutation = useDeleteCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (customer && !isEditing) {
      setFormData({
        name: customer.name || '',
        status: customer.status || '',
        email: customer.email || '',
        phone: customer.phone || '',
        state: customer.state || '',
        city: customer.city || '',
        country: customer.country || '',
        address: customer.address || '',
        zip: customer.zip || '',
        createdAt: customer.createdAt || '',
        customerType: customer.additionalInfo?.customerType || '',
        allocatedUsers: customer.allocatedLimits?.users ?? 0,
        allocatedAssets: customer.allocatedLimits?.assets ?? 0,
        allocatedDevices: customer.allocatedLimits?.devices ?? 0,
        allocatedFloorPlans: customer.allocatedLimits?.floorPlans ?? 0,
        allocatedDashboards: customer.allocatedLimits?.dashboards ?? 0,
        allocatedAutomations: customer.allocatedLimits?.automations ?? 0,
      });
    }
  }, [customer, isEditing]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateCustomerMutation.mutateAsync({
        customerId: id,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          address: formData.address,
          zip: formData.zip,
          allocatedLimits: {
            dashboards: Number(formData.allocatedDashboards),
            floorPlans: Number(formData.allocatedFloorPlans),
            automations: Number(formData.allocatedAutomations),
            users: Number(formData.allocatedUsers),
            assets: Number(formData.allocatedAssets),
            devices: Number(formData.allocatedDevices),
          },
        },
      });
      toast.success(t('usersManagement.customer_card.toasts.updateSuccess'));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t('usersManagement.customer_card.toasts.updateError');
      toast.error(errorMessage);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await deleteCustomerMutation.mutateAsync(id);
      toast.success(t('usersManagement.customer_card.toasts.deleteSuccess'));
      navigate('/users-management', { state: { tab: 'Customers' } });
    } catch (error) {
      console.error('Failed to delete customer:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t('usersManagement.customer_card.toasts.deleteError');
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-6">
              <div className="">
                <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                  {/* <AvatarImage src={customer?.logo} /> */}
                  <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                    {customer?.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  {customer?.name || 'N/A'}
                  <Badge
                    variant={
                      customer?.status === 'active' ? 'success' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {customer?.status || 'Unknown'}
                  </Badge>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                  <ScrollText className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {customer?.description || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700' : 'bg-primary hover:bg-primary/90 text-white'}
                variant={isEditing ? 'outline' : 'default'}
              >
                {isEditing ? (
                  <X className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                ) : (
                  <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                )}
                {isEditing ? t('usersManagement.customer_card.cancelEdit') : t('usersManagement.customer_card.editCustomer')}
              </Button>
              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={updateCustomerMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {updateCustomerMutation.isPending
                    ? t('usersManagement.customer_card.saving')
                    : t('usersManagement.customer_card.saveChanges')}
                </Button>
              )}
              <Button
                onClick={() => setDeleteDialogOpen(true)}
                variant="outline"
                className="text-red-600 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('usersManagement.customer_card.delete')}
              </Button>
            </div>
          </div>

          {/* INLINE EDIT FORM GRID */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full border border-gray-100 dark:border-gray-700">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.name')}
              </p>
              <Input
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
                className="font-semibold bg-white dark:bg-gray-800 h-9"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.status')}
              </p>
              <Input
                value={formData.status || ''}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="font-semibold capitalize bg-gray-100 dark:bg-gray-800/50 h-9"
                disabled
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.email')}
              </p>
              <Input
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
                className="font-semibold bg-white dark:bg-gray-800 h-9"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.phone')}
              </p>
              <Input
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!isEditing}
                className="font-semibold bg-white dark:bg-gray-800 h-9"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.tenantId')}
              </p>
              <Input
                value={customer?.tenantId || customer?.tenant?.name || ''}
                disabled={true}
                placeholder="System Managed"
                className="font-semibold bg-gray-100 dark:bg-gray-800/50 h-9"
              />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.city')}
              </p>
              <Input
                value={formData.city || ''}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                disabled={!isEditing}
                className="font-semibold bg-white dark:bg-gray-800 h-9"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.state')}
              </p>
              <Input
                value={formData.state || ''}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="font-semibold bg-white dark:bg-gray-800 h-9"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.country')}
              </p>
              <Input
                value={formData.country || ''}
                className="font-semibold bg-white dark:bg-gray-800 h-9"
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.address')}
              </p>
              <Input
                value={formData.address || ''}
                className="font-semibold bg-white dark:bg-gray-800 h-9"
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.zipCode')}
              </p>
              <Input
                value={formData.zip || ''}
                className="font-semibold bg-white dark:bg-gray-800 h-9"
                onChange={(e) =>
                  setFormData({ ...formData, zip: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.createdAt')}
              </p>
              <Input
                value={formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : ''}
                className="font-semibold bg-gray-100 dark:bg-gray-800/50 h-9"
                disabled
              />
            </div>
          </div>

          {/* Allocation Limits */}
          <div className="flex items-center gap-2 mt-8 mb-4">
            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 px-3 py-1">
              {t('usersManagement.customer_card.labels.allocationLimits')}
            </Badge>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full border border-gray-100 dark:border-gray-700">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.allocUsers')}
              </p>
              <Input
                type="number"
                value={formData.allocatedUsers || 0}
                className="font-semibold bg-white dark:bg-gray-800 h-9 transition-all focus:ring-2 focus:ring-primary/20"
                onChange={(e) =>
                  setFormData({ ...formData, allocatedUsers: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.allocAssets')}
              </p>
              <Input
                type="number"
                value={formData.allocatedAssets || 0}
                className="font-semibold bg-white dark:bg-gray-800 h-9 transition-all focus:ring-2 focus:ring-primary/20"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allocatedAssets: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.allocDevices')}
              </p>
              <Input
                type="number"
                value={formData.allocatedDevices || 0}
                className="font-semibold bg-white dark:bg-gray-800 h-9 transition-all focus:ring-2 focus:ring-primary/20"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allocatedDevices: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.allocDashboards')}
              </p>
              <Input
                type="number"
                value={formData.allocatedDashboards || 0}
                className="font-semibold bg-white dark:bg-gray-800 h-9 transition-all focus:ring-2 focus:ring-primary/20"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allocatedDashboards: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.allocFloorPlans')}
              </p>
              <Input
                type="number"
                value={formData.allocatedFloorPlans || 0}
                className="font-semibold bg-white dark:bg-gray-800 h-9 transition-all focus:ring-2 focus:ring-primary/20"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allocatedFloorPlans: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.customer_card.labels.allocAutomations')}
              </p>
              <Input
                type="number"
                value={formData.allocatedAutomations || 0}
                className="font-semibold bg-white dark:bg-gray-800 h-9 transition-all focus:ring-2 focus:ring-primary/20"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allocatedAutomations: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-8 mb-4">
            <Badge variant="outline" className="rounded-full bg-secondary/5 text-secondary border-secondary/20 px-3 py-1">
              {t('usersManagement.customer_card.labels.usageCounters')}
              <span className="ml-1 text-[10px] opacity-70">{t('usersManagement.customer_card.labels.readOnly')}</span>
            </Badge>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full border border-gray-100 dark:border-gray-700">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.create_customer.subscription.resources.users')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {customer?.usageCounters?.users ?? 0}
                </span>
                <span className="text-xs text-gray-400">/ {formData.allocatedUsers}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.create_customer.subscription.resources.assets')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {customer?.usageCounters?.assets ?? 0}
                </span>
                <span className="text-xs text-gray-400">/ {formData.allocatedAssets}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.create_customer.subscription.resources.devices')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {customer?.usageCounters?.devices ?? 0}
                </span>
                <span className="text-xs text-gray-400">/ {formData.allocatedDevices}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.create_customer.subscription.resources.dashboards')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {customer?.usageCounters?.dashboards ?? 0}
                </span>
                <span className="text-xs text-gray-400">/ {formData.allocatedDashboards}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.create_customer.subscription.resources.floorPlans')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {customer?.usageCounters?.floorPlans ?? 0}
                </span>
                <span className="text-xs text-gray-400">/ {formData.allocatedFloorPlans}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {t('usersManagement.create_customer.subscription.resources.automations')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {customer?.usageCounters?.automations ?? 0}
                </span>
                <span className="text-xs text-gray-400">/ {formData.allocatedAutomations}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('usersManagement.customer_card.modals.deleteTitle')}
        itemName={customer?.name}
        isLoading={deleteCustomerMutation.isPending}
      />
    </>
  );
}
