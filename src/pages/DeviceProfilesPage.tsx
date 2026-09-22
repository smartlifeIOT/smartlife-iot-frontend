import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cpu,
  Plus,
  Activity,
  Settings,
  Trash2,
  Edit,
  MoreVertical,
} from 'lucide-react';
import type { DeviceProfile } from '@/features/device-profiles/types';
import { DeviceProfileMultiStepForm } from '@/features/profiles/components';
import type { DeviceProfileMultiStepFormData } from '@/features/profiles/types';
import {
  useDeviceProfiles,
  useCreateDeviceProfile,
} from '@/features/profiles/hooks';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination';

export default function DeviceProfiles() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data: deviceProfiles, isLoading: DeviceLoading } = useDeviceProfiles({
    page: currentPage,
    limit: itemsPerPage,
  });

  const createDeviceProfileMutation = useCreateDeviceProfile();
  const { t } = useTranslation();

  // Transform API response to table format

  const ApiResponse = deviceProfiles?.data.data.data || [];
  const { totalItems, limit, totalPages } =
    deviceProfiles?.data?.data?.meta || {};

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateProfile = async (data: DeviceProfileMultiStepFormData) => {
    console.log(data);
    try {
      await createDeviceProfileMutation.mutateAsync(data);
      toast.success('Device profile created successfully');
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating device profile:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'Failed to create device profile. Please try again.';
      toast.error(errorMessage);
    }
  };
  const tableHeaders = useMemo(
    () => [
      t('deviceProfiles.table.name'),
      t('deviceProfiles.table.type'),
      t('deviceProfiles.table.transport'),
      t('deviceProfiles.table.devices'),
      t('deviceProfiles.table.created'),
      t('deviceProfiles.table.actions'),
    ],
    [t]
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (DeviceLoading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('deviceProfiles.title')}
        description={t('deviceProfiles.subtitle')}
        actions={[
          {
            label: t('deviceProfiles.createProfile'),
            onClick: () => setIsCreateOpen(true),
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-white font-medium">
              {t('deviceProfiles.totalProfiles')}
            </CardTitle>
            <Settings className="h-4 w-4 text-white text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-white">
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {t('deviceProfiles.deviceConfigurations')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('deviceProfiles.totalDevices')}
            </CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {t('deviceProfiles.usingTheseProfiles')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('deviceProfiles.defaultProfiles')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {t('deviceProfiles.gatewayProfiles')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="">
        <CardContent className="p-6">
          <div className="overflow-visible">
            <Table>
              <TableHeader className="bg-primary     text-white">
                <TableRow className="bg-primary hover:bg-primary">
                  {tableHeaders.map((val, i) => {
                    const isLast = i === tableHeaders.length - 1;
                    return (
                      <TableHead
                        key={val}
                        className={isLast ? 'text-right' : undefined}
                      >
                        {val}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalItems && totalItems > 0 ? (
                  ApiResponse.map((deviceProfile: any) => (
                    <TableRow key={deviceProfile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <p className="font-medium  capitalize">
                            {deviceProfile.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="capitalize">
                          {deviceProfile.type ? (
                            <Badge>Default</Badge>
                          ) : (
                            <Badge variant="secondary">-</Badge>
                          )}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <p className="font-medium capitalize">
                            {deviceProfile.transportType}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-start ps-4">
                          {deviceProfile.devices || 0}
                        </p>
                      </TableCell>

                      <TableCell>
                        {new Date(deviceProfile.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right flex items-center  relative justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              // onClick={() => handleDeleteClick(deviceProfile)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t('devices.noDevices') || 'No devices found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 0}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Multi-Step Form Dialog */}
      <DeviceProfileMultiStepForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProfile}
      />
    </div>
  );
}
