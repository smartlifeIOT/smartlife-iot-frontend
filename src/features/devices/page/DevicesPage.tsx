import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeviceDialog } from '@/features/devices/components/DeviceDialog';
import { DeviceCredentialsDialog } from '@/features/devices/components/DeviceCredentialsDialog';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  useDevices,
  useCreateDevice,
  useUpdateDevice,
  useDeleteDevice,
  useActivateDevice,
  useDeactivateDevice,
} from '@/features/devices/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getErrorMessage } from '@/utils/helpers/apiErrorHandler';
import type { DeviceFormData } from '@/features/devices/types';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from '@/components/ui/tooltip';
import { useDebouncedValue } from '@/utils/helpers/Debounce';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';

export default function DevicesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearch = useDebouncedValue(inputValue, 500);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [newDeviceCredentials, setNewDeviceCredentials] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedDevice, setSelectedDevice] = useState<{
    id: string;
    name: string;
    type: string;
    connectionType: string;
    description: string;
    manufacturer: string;
    model: string;
    gatewayId: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDeleteId, setDeviceToDeleteId] = useState<string | null>(null);

  const { data: devicesData } = useDevices({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  });
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const deleteDevice = useDeleteDevice();
  const activateDevice = useActivateDevice();
  const deactivateDevice = useDeactivateDevice();

  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [deviceToToggle, setDeviceToToggle] = useState<any>(null);

  // Handle delete device
  const handleDeleteConfirm = useCallback(async () => {
    if (!deviceToDeleteId) return;
    try {
      const response = await deleteDevice.mutateAsync(deviceToDeleteId);
      const successMessage =
        (response as { data?: { message?: string } })?.data?.message ||
        (response as { message?: string })?.message ||
        t('devices.messages.deleteSuccess');
      toast.success(successMessage);
      setDeviceToDeleteId(null);
    } catch (error) {
      const errorMessage =
        getErrorMessage(error) || t('devices.messages.deleteError');
      toast.error(errorMessage);
    }
  }, [deleteDevice, deviceToDeleteId, t]);

  // Handle status toggle
  const handleStatusToggleRequest = (e: React.MouseEvent, device: any) => {
    e.stopPropagation();
    setDeviceToToggle(device);
    setIsStatusConfirmOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!deviceToToggle) return;
    const isActivating = deviceToToggle.status !== 'active';
    try {
      if (isActivating) {
        await activateDevice.mutateAsync(deviceToToggle.id);
        toast.success(t('devices.messages.activateSuccess'));
      } else {
        await deactivateDevice.mutateAsync(deviceToToggle.id);
        toast.success(t('devices.messages.deactivateSuccess'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsStatusConfirmOpen(false);
      setDeviceToToggle(null);
    }
  };

  // Extract devices and pagination info from API response
  const { devices, meta } = useMemo(() => {
    const responseData = devicesData?.data.data;
    const deviceList = responseData?.data || [];
    const paginationMeta = responseData?.meta || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      totalItems: 0,
    };
    return {
      devices: deviceList,
      meta: paginationMeta,
    };
  }, [devicesData]);

  // Handle opening edit dialog
  const handleOpenEditDialog = useCallback((device: any) => {
    setSelectedDevice({
      id: device.id,
      name: device.name,
      type: device.type || '',
      connectionType: device.connectionType || '',
      description: device.description || '',
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      gatewayId: device.gatewayId || '',
    });
    setIsEditDialogOpen(true);
  }, []);

  // Handle form submissions
  const handleCreate = async (data: DeviceFormData) => {
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, v]) => v !== '' && v !== null && v !== undefined
        )
      );

      const resp = await createDevice.mutateAsync(
        cleanedData as DeviceFormData
      );
      const successMessage = t('devices.messages.createSuccess');
      toast.success(successMessage);

      const credentials =
        (resp as any)?.data?.data?.credentials ||
        (resp as any)?.data?.credentials;
      if (credentials) {
        setNewDeviceCredentials(credentials);
        setIsCredentialsDialogOpen(true);
      }
      setIsCreateDialogOpen(false);
    } catch (error) {
      const errorMessage =
        getErrorMessage(error) || t('devices.messages.createError');
      toast.error(errorMessage);
    }
  };

  const handleEdit = async (data: DeviceFormData) => {
    if (!selectedDevice) return;
    try {
      // Clean up the data: remove empty strings, but keep valid zeros or booleans
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, v]) => v !== '' && v !== null && v !== undefined
        )
      );

      const response = await updateDevice.mutateAsync({
        id: selectedDevice.id,
        data: cleanedData as DeviceFormData,
      });
      const successMessage =
        (response as { data?: { message?: string } })?.data?.message ||
        (response as { message?: string })?.message ||
        t('devices.messages.updateSuccess');
      toast.success(successMessage);
      setIsEditDialogOpen(false);
      setSelectedDevice(null);
    } catch (error) {
      const errorMessage =
        getErrorMessage(error) || t('devices.messages.updateError');
      toast.error(errorMessage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title={t('devices.title')}
          description={t('devices.subtitle')}
        />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('devices.addDevice')}
        </Button>
      </div>
      {/* Search and Filter Section */}
      <div className="flex items-center gap-3">
        <div className="relative  ">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('devices.searchPlaceholder')}
            value={inputValue}
            onChange={handleSearchChange}
            className="w-96 pr-10"
          />
        </div>
      </div>
      {/* Devices Table */}
      <Card className="pt-6">
        <CardContent className="relative min-h-[400px]">
          <div className="">
            <Table>
              <TableHeader className="bg-primary  text-white">
                <TableRow className="hover:bg-primary ">
                  <TableHead className="text-white font-semibold">
                    {t('devices.table.name')}
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    {t('common.type')}
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    {t('common.status')}
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    {t('devices.connectionType')}
                  </TableHead>

                  <TableHead className="text-white font-semibold">
                    {t('devices.table.createdTime')}
                  </TableHead>
                  <TableHead className="text-right text-white font-semibold">
                    {t('devices.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meta.totalItems === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center bg-gray-50 text-muted-foreground"
                    >
                      {t('devices.noDevices')}
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device: any) => (
                    <TableRow
                      key={device.id}
                      onClick={() => navigate(`/devices/${device.id}`)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="capitalize">{device.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-normal capitalize">{device.type}</p>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={device.status === 'active'}
                            onCheckedChange={() => {}}
                            onClick={(e) =>
                              handleStatusToggleRequest(e, device)
                            }
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="   ">
                        <p className="capitalize">
                          {device.connectionType || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {device.createdAt
                          ? format(new Date(device.createdAt), 'yyyy-MM-dd')
                          : 'N/A'}
                      </TableCell>
                      <TableCell
                        className="text-right flex gap-1 items-end justify-end relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white"
                              onClick={() => navigate(`/devices/${device.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bottom-[70%] max-w-36">
                            {t('devices.tooltips.view')}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white"
                              onClick={() => handleOpenEditDialog(device)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bottom-[70%] max-w-36">
                            {t('devices.tooltips.edit')}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white"
                              onClick={() => {
                                setDeviceToDeleteId(device.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bottom-[70%] max-w-36">
                            {t('devices.tooltips.delete')}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {meta.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Device Dialog */}
      <DeviceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        onSubmit={handleCreate}
        isLoading={createDevice.isPending}
      />

      {/* Edit Device Dialog */}
      <DeviceDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedDevice(null);
          }
        }}
        mode="edit"
        initialData={
          isEditDialogOpen && selectedDevice
            ? {
                name: selectedDevice.name,
                type: selectedDevice.type,
                connectionType: selectedDevice.connectionType,
                description: selectedDevice.description,
                manufacturer: (selectedDevice as any).manufacturer,
                model: (selectedDevice as any).model,
                gatewayId: (selectedDevice as any).gatewayId,
              }
            : undefined
        }
        onSubmit={handleEdit}
        isLoading={updateDevice.isPending}
      />

      {/* Credentials Dialog */}
      <DeviceCredentialsDialog
        open={isCredentialsDialogOpen}
        onOpenChange={setIsCredentialsDialogOpen}
        credentials={newDeviceCredentials}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('devices.tooltips.delete')}
        itemName={
          devices.find((d: any) => d.id === deviceToDeleteId)?.name ||
          t('common.name')
        }
        isLoading={deleteDevice.isPending}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={isStatusConfirmOpen}
        onOpenChange={setIsStatusConfirmOpen}
        title={
          deviceToToggle?.status === 'active'
            ? t('devices.status.deactivateTitle', 'Deactivate Device')
            : t('devices.status.activateTitle', 'Activate Device')
        }
        description={
          deviceToToggle?.status === 'active'
            ? t(
                'devices.status.deactivateDescription',
                'Are you sure you want to deactivate this device? It will stop sending data.'
              )
            : t(
                'devices.status.activateDescription',
                'Are you sure you want to activate this device?'
              )
        }
        confirmLabel={
          deviceToToggle?.status === 'active'
            ? t('common.deactivate', 'Deactivate')
            : t('common.activate', 'Activate')
        }
        onConfirm={handleStatusConfirm}
        variant={
          deviceToToggle?.status === 'active' ? 'destructive' : 'default'
        }
      />
    </div>
  );
}
