import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Circle, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useAssetDetails, useDeleteAsset } from '@/features/assets/hooks';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import toast from 'react-hot-toast';

type AttributeRow = { id: string; key: string; value: string; scope: string };
type TelemetryRow = { id: string; key: string; value: string; ts: string };
type AuditLogRow = { id: string; action: string; actor: string; ts: string };

interface AttributeFormValues {
  key: string;
  value: string;
  scope: string;
}

export default function AssetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [attributes, setAttributes] = useState<AttributeRow[]>([
    { id: '1', key: 'location', value: 'Warehouse A', scope: 'server' },
    { id: '2', key: 'temperatureThreshold', value: '35°C', scope: 'client' },
  ]);
  const [telemetryData] = useState<TelemetryRow[]>([
    { id: 't1', key: 'temp', value: '28.5 °C', ts: '2025-12-16 10:20' },
    { id: 't2', key: 'humidity', value: '41 %', ts: '2025-12-16 10:18' },
  ]);
  const [auditLogs] = useState<AuditLogRow[]>([
    {
      id: 'a1',
      action: 'Attribute updated',
      actor: 'Admin',
      ts: '2025-12-16 09:55',
    },
    {
      id: 'a2',
      action: 'Asset moved',
      actor: 'Operator',
      ts: '2025-12-15 17:10',
    },
  ]);
  const { mutateAsync: deleteAsset, isPending: isDeleting } = useDeleteAsset();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<AttributeFormValues>({
    defaultValues: { key: '', value: '', scope: 'server' },
  });

  // Fetch asset details using custom hook
  const { assetDetails, isLoading, isError, error } = useAssetDetails(id);
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400">
          {t('common.loading')}...
        </p>
      </div>
    );
  }

  // Show error state
  if (isError || !assetDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">
            {t('common.error')}:{' '}
            {error?.message || t('assets.details.notFound')}
          </p>
          <Button variant="outline" onClick={() => navigate('/assets')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  // Destructure asset details
  const {
    id: assetId,
    name,
    type,
    customer,
    status,
    createdAt,
    lastActivity,
    connectedDevices,
    recentActivity,
    assetHierarchy,
    activeDevicesCount,
    offlineDevicesCount,
    warningDevicesCount,
  } = assetDetails;
  console.log(recentActivity);
  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAsset(assetId);
      toast.success(
        t('assets.details.deleteSuccess') || 'Asset deleted successfully'
      );
      setDeleteDialogOpen(false);
      navigate('/assets');
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error(
        t('assets.details.deleteError') ||
          'Failed to delete asset. Please try again.'
      );
    }
  };
  const tabs: { id: string; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'relations', label: 'Relations' },
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'auditLogs', label: 'Audit Logs' },
  ];
  const onTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  const onAddAttribute = handleSubmit((data) => {
    const newAttribute: AttributeRow = {
      id: String(Date.now()),
      key: data.key,
      value: data.value,
      scope: data.scope,
    };
    setAttributes((prev) => [...prev, newAttribute]);
    reset({ key: '', value: '', scope: 'server' });
    setAttributeModalOpen(false);
  });

  const renderTable = {
    attributes: (
      <div className="space-y-4 pt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Attribute</h3>
          <Button onClick={() => setAttributeModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Attribute
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 text-left font-medium  ">Key</th>
                <th className="px-4 py-3 text-left font-medium  ">Value</th>
                <th className="px-4 py-3 text-left font-medium  ">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attributes.map((attr) => (
                <tr key={attr.id}>
                  <td className="px-4 py-3 text-gray-900">{attr.key}</td>
                  <td className="px-4 py-3 text-gray-700">{attr.value}</td>
                  <td className="px-4 py-3 text-gray-700 capitalize">
                    {attr.scope}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    telemetry: (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium  ">Key</th>
              <th className="px-4 py-3 text-left font-medium  ">Value</th>
              <th className="px-4 py-3 text-left font-medium  ">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {telemetryData.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2 text-gray-900">{row.key}</td>
                <td className="px-4 py-2 text-gray-700">{row.value}</td>
                <td className="px-4 py-2 text-gray-700">{row.ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    auditLogs: (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium  ">Action</th>
              <th className="px-4 py-3 text-left font-medium  ">Actor</th>
              <th className="px-4 py-3 text-left font-medium  ">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditLogs.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 text-gray-900">{row.action}</td>
                <td className="px-4 py-3 text-gray-700">{row.actor}</td>
                <td className="px-4 py-3 text-gray-700">{row.ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  };

  return (
    <div className=" space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {name}
            </h1>
            <Badge
              variant={
                status === 'active'
                  ? 'success'
                  : status === 'warning'
                  ? 'secondary'
                  : 'destructive'
              }
              className="gap-1.5"
            >
              <Circle className="w-2 h-2 fill-current" />
              {status === 'active'
                ? t('assets.details.active')
                : status === 'warning'
                ? t('assets.details.warning')
                : t('assets.details.offline')}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {type} | {customer}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Action Buttons */}
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            className="gap-2"
            disabled={isDeleting}
            isLoading={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}

      {tabs && tabs.length > 0 && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent   hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content - Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assets.details.assetInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('common.name')}: {name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('common.type')}: {type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('assets.details.customer')}: {customer}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('assets.details.created')}: {createdAt}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('assets.details.lastActivity')}: {lastActivity}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Connected Devices Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assets.details.connectedDevices')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex   gap-8 items-center  ">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-2">
                  {connectedDevices.length}
                </div>
                <div className="">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {activeDevicesCount} {t('assets.details.activeDevices')}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {offlineDevicesCount} {t('assets.details.offline')},{' '}
                    {warningDevicesCount} {t('assets.details.warning')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assets.details.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${getActivityIconColor(
                      activity.type
                    )}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs   dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Asset Hierarchy Card - Full Width */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t('assets.details.assetHierarchy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {assetHierarchy.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                    >
                      {item.name}
                    </Button>
                    {item.devices && item.devices.length > 0 && (
                      <div className="flex flex-col gap-1 ml-2">
                        {item.devices.map((device) => (
                          <div
                            key={device.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Circle
                              className={`w-2 h-2 fill-current ${
                                device.status === 'active'
                                  ? 'text-green-500'
                                  : 'text-gray-400'
                              }`}
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {device.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attributes Tab */}
      {activeTab === 'attributes' && (
        <>
          <Card>
            <CardContent>{renderTable.attributes}</CardContent>
          </Card>
          <Dialog
            open={attributeModalOpen}
            onOpenChange={setAttributeModalOpen}
          >
            <DialogContent className=" overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add Attribute</DialogTitle>
              </DialogHeader>
              <form onSubmit={onAddAttribute} className="space-y-4 p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Key
                  </label>
                  <Input
                    {...register('key', { required: 'Key is required' })}
                    placeholder="Enter key"
                  />
                  {formErrors.key && (
                    <p className="text-xs text-red-500">
                      {formErrors.key.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Value
                  </label>
                  <Input
                    {...register('value', { required: 'Value is required' })}
                    placeholder="Enter value"
                  />
                  {formErrors.value && (
                    <p className="text-xs text-red-500">
                      {formErrors.value.message}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset({ key: '', value: '', scope: 'server' });
                      setAttributeModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Attribute</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Relations Tab */}
      {activeTab === 'relations' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('assets.details.relations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('assets.details.relationsComingSoon')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Telemetry Tab */}
      {activeTab === 'telemetry' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('assets.details.telemetry')}</CardTitle>
          </CardHeader>
          <CardContent>{renderTable.telemetry}</CardContent>
        </Card>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'auditLogs' && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>{renderTable.auditLogs}</CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t('assets.details.deleteTitle') || 'Delete Asset'}
        itemName={name}
        description={`Are you sure you want to delete ${name} asset? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
