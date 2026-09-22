import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Map,
  Layers,
  MapPin,
  Thermometer,
  Droplets,
  Zap,
  Wind,
  CheckCircle2,
  Edit,
  Trash2,
  Download,
  Eye,
  Maximize2,
  Grid3x3,
  PlusSquare,
  Plug,
  BarChart3,
} from 'lucide-react';
import {
  useDeleteFloorPlan,
  useFloorPlans,
  useFloorPlanStatistics,
} from '@/features/floorPlan/hooks';
import type { FloorPlan as ApiFloorPlan } from '@/features/floorPlan/services/floor-plans.api';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useTranslation } from 'react-i18next';
import UploadFlorPLanModel from '../components/UploadFlorPLanModel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import { Device, Zone } from '../types';

interface FloorPlan {
  id: string;
  name: string;
  building: string;
  floor: string;
  imageUrl: string;
  devices: Device[];
  assets: number;
  zones?: Zone[];
  dimensions: {
    width: number;
    height: number;
  };
  scale: string;
  createdAt: Date;
  lastModified: Date;
  category: string;
  status: 'active' | 'draft' | 'archived' | 'failed' | 'warning';
}
// Transform API FloorPlan to local FloorPlan format
const transformFloorPlan = (apiPlan: ApiFloorPlan): FloorPlan => {
  return {
    id: apiPlan.id,
    name: apiPlan.name,
    building: apiPlan.building || '',
    floor: apiPlan.floor || '',
    imageUrl: apiPlan.imageUrl || '',
    devices: (apiPlan.devices || []).map((device) => ({
      id: device.deviceId,
      name: device.name,
      type: device.type,
      status: 'online', // API doesn't provide device status, defaulting to 'online'
    })),
    assets: 0, // API doesn't provide assets count, defaulting to 0
    zones: (apiPlan.zones || []).map((zone) => ({
      id: zone.id,
      name: zone.name,
      type: 'zone',
      area: 0,
      capacity: 0,
      status: 'active',
      floor: apiPlan.floor || '',
      description: '',
      color: zone.color ?? '',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      isDefined: true,
      boundaries: Array.isArray(zone.boundaries)
        ? (zone.boundaries as any[]).map((b: any) => {
            if (typeof b === 'string') {
              const [px, py] = b.split(',').map(Number);
              return { x: px || 0, y: py || 0 };
            }
            return { x: b?.x ?? 0, y: b?.y ?? 0 };
          })
        : [],
    })),
    dimensions: apiPlan.dimensions,
    scale: apiPlan.scale || '1:100',
    createdAt: new Date(apiPlan.createdAt),
    lastModified: new Date(apiPlan.updatedAt),
    category: apiPlan.category || 'Other',
    status: apiPlan.status || 'draft',
  };
};

interface DeviceMarker {
  id: string;
  name: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  status: 'online' | 'offline' | 'warning';
  value?: string;
  icon: React.ReactNode;
}

const deviceMarkers: DeviceMarker[] = [
  {
    id: 'd1',
    name: 'Temperature Sensor #1',
    type: 'Sensor',
    position: { x: 20, y: 30 },
    status: 'online',
    value: '23.5°C',
    icon: <Thermometer className="h-4 w-4" />,
  },
  {
    id: 'd2',
    name: 'Humidity Sensor #2',
    type: 'Sensor',
    position: { x: 45, y: 35 },
    status: 'online',
    value: '55%',
    icon: <Droplets className="h-4 w-4" />,
  },
  {
    id: 'd3',
    name: 'Energy Meter #1',
    type: 'Meter',
    position: { x: 70, y: 25 },
    status: 'warning',
    value: '4.2 kW',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: 'd4',
    name: 'HVAC Unit #3',
    type: 'Actuator',
    position: { x: 35, y: 65 },
    status: 'online',
    value: 'ON',
    icon: <Wind className="h-4 w-4" />,
  },
  {
    id: 'd5',
    name: 'Air Quality Monitor',
    type: 'Sensor',
    position: { x: 60, y: 70 },
    status: 'offline',
    value: '-',
    icon: <Wind className="h-4 w-4" />,
  },
];

export default function FloorPlans() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedPlan] = useState<FloorPlan | null>(null);
  const [showDevices, setShowDevices] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [FloorpLanID, setFloorPlanID] = useState<string>();
  const itemsPerPage = 10;
  const { data: floorPlansData, isLoading, isError } = useFloorPlans();
  const apiFloorPlans = floorPlansData?.data;
  const total =
    (floorPlansData as any)?.meta?.totalItems ??
    (floorPlansData as any)?.total ??
    0;
  const totalPages =
    (floorPlansData as any)?.meta?.totalPages ??
    (floorPlansData as any)?.totalPages ??
    0;
  const DeleteFloorPlan = useDeleteFloorPlan();

  // Transform API data to local FloorPlan format
  const floorPlans: FloorPlan[] | undefined =
    apiFloorPlans?.map(transformFloorPlan);
  // Handle delete device
  const handleDeleteConfirm = useCallback(async () => {
    if (!FloorpLanID) return;
    DeleteFloorPlan.mutate(FloorpLanID);
  }, [FloorpLanID, DeleteFloorPlan]);
  const { data: statistics } = useFloorPlanStatistics();
  if (isLoading) return <LoadingOverlay />;
  if (isError)
    return (
      <ErrorMessage
        title="Error loading floor plans"
        // error={errorFloorPlans}
        onRetry={() => window.location.reload()}
      />
    );

  const quickActions = [
    {
      label: t('floorplans.createNew'),
      title: t('floorplans.floorMap'),
      description: 'Start with asset selection',
      icon: <PlusSquare className="h-5 w-5 text-primary" />,
      onClick: () => navigate('/floor-plans/create'),
    },
    {
      label: t('floorplans.device'),
      title: t('floorplans.deviceManagement'),
      description: t('floorplans.manageDeviceAssociations'),
      icon: <Plug className="h-5 w-5 text-primary" />,
      onClick: () => navigate('/devices'),
    },
    {
      label: t('dashboard.assets'),
      title: t('floorplans.dashboard'),
      description: t('floorplans.viewFloorMapInsights'),
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      onClick: () => navigate('/assets'),
    },
  ];

  const handleDelete = (id: string) => {
    setFloorPlanID(id);
    setIsDeleteDialogOpen(true);
  };
  const filteredPlans = floorPlans?.filter(
    (plan) =>
      plan?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.building?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalFloors = statistics?.total;
  const totalActiveFloorPlans = statistics?.active;
  const totalInActiveFloorPlans = statistics?.totalDevices;
  const totalZones = statistics?.totalZones;
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('floorplans.title')}
        description={t('floorplans.subtitle')}
      />

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium   text-white">
              {t('floorplans.totalFloorPlans')}
            </CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFloors}</div>
            <p className="text-xs text-muted-foreground">
              {t('floorplans.facilityLayouts')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary text-white">
          <CardHeader className="flex flex-row  items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium   text-white">
              {t('floorplans.activeFloorPlans')}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4  " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold  ">{totalActiveFloorPlans}</div>
            <p className="text-xs text-muted-foreground">
              {t('floorplans.inUse')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-success text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {t('floorplans.totalDevices')}
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInActiveFloorPlans}</div>
            <p className="text-xs text-muted-foreground">
              {t('floorplans.mappedDevices')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('floorplans.totalZones')}
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalZones}</div>
            <p className="text-xs text-muted-foreground">
              {t('floorplans.definedAreas')}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* table of florplan  */}
      <Card className="pt-6">
        <CardContent className="relative min-h-[200px]">
          <div className="">
            <Table>
              <TableHeader className="bg-primary  text-white">
                <TableRow className="hover:bg-primary ">
                  <TableHead className="text-white font-semibold">
                    {t('devices.table.name')}
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    {t('floorplans.category')}
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    {t('floorplans.devices')}
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    {t('floorplans.zones')}
                  </TableHead>

                  <TableHead className="text-white font-semibold">
                    {t('common.status')}
                  </TableHead>
                  <TableHead className="text-right text-white font-semibold">
                    {t('devices.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {total === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center bg-gray-50 text-muted-foreground"
                    >
                      {t('floorplans.nofloorPlan')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans?.map((plan: FloorPlan) => (
                    <TableRow
                      key={plan.id}
                      onClick={() => navigate(`/floor-plans/${plan.id}`)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="capitalize">{plan.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-normal capitalize">
                          {plan.category}
                        </p>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className=" text">{plan.devices?.length || 0}</div>
                      </TableCell>

                      <TableCell className="text-slate-500 text-sm">
                        <p className="font-normal capitalize">
                          {plan?.zones?.length || 0}
                        </p>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        <Badge
                          className={`${
                            plan.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600'
                              : plan.status === 'warning'
                                ? 'bg-amber-500 hover:bg-amber-600'
                                : 'bg-red-500 hover:bg-red-600'
                          } text-white`}
                        >
                          {plan.status === 'active'
                            ? t('assets.status.active') || 'Active'
                            : plan.status === 'warning'
                              ? t('common.warning') || 'Warning'
                              : t('assets.status.error') || 'Error'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right flex gap-1 items-end justify-end relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="hover:bg-secondary hover:text-white"
                          onClick={() => navigate(`/floor-plans/${plan.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="hover:bg-secondary hover:text-white"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">
          {t('floorplans.quickActions')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="group text-left  shadow rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 text-primary font-semibold">
                {action.icon}
                <span>{action.label}</span>
              </div>
              <div className="mt-2 text-sm text-gray-900 font-medium">
                {action.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Create/Upload Dialog */}
      <UploadFlorPLanModel
        open={isCreateOpen}
        onOpenChange={() => setIsCreateOpen(!isCreateOpen)}
      />
      {/* Floor Plan Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedPlan?.name}</DialogTitle>
                <DialogDescription>
                  {selectedPlan?.building} - {selectedPlan?.floor}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedPlan?.devices?.length || 0} {t('floorplans.devices')}{' '}
                  - {selectedPlan?.zones?.length || 0} {t('floorplans.zones')}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-devices"
                    checked={showDevices}
                    onCheckedChange={setShowDevices}
                  />
                  <Label htmlFor="show-devices" className="cursor-pointer">
                    {t('floorplans.showDevices')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-zones"
                    checked={showZones}
                    onCheckedChange={setShowZones}
                  />
                  <Label htmlFor="show-zones" className="cursor-pointer">
                    {t('floorplans.showZones')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-heatmap"
                    checked={showHeatmap}
                    onCheckedChange={setShowHeatmap}
                  />
                  <Label htmlFor="show-heatmap" className="cursor-pointer">
                    {t('floorplans.heatMap')}
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  {t('floorplans.grid')}
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  {t('floorplans.fullscreen')}
                </Button>
              </div>
            </div>

            {/* Floor Plan Canvas */}
            <div
              className="relative border rounded-lg overflow-hidden bg-muted/20"
              style={{ height: '500px' }}
            >
              {/* Background Grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Floor Plan Image Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Map className="h-32 w-32 text-muted-foreground opacity-50" />
              </div>

              {/* Device Markers */}
              {showDevices &&
                deviceMarkers?.map((device) => (
                  <div
                    key={device.id}
                    className="absolute group cursor-pointer"
                    style={{
                      left: `${device.position.x}%`,
                      top: `${device.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Device Pin */}
                    <div
                      className={`
                    p-2 rounded-full shadow-lg transition-all
                    ${device.status === 'online' ? 'bg-green-500' : ''}
                    ${device.status === 'offline' ? 'bg-gray-500' : ''}
                    ${device.status === 'warning' ? 'bg-yellow-500' : ''}
                    text-white hover:scale-110
                  `}
                    >
                      {device.icon}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 whitespace-nowrap">
                        <p className="font-semibold text-sm">{device.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {device.type}
                        </p>
                        {device.value && (
                          <p className="text-sm font-medium mt-1">
                            {device.value}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Zones */}
              {showZones && (
                <>
                  <div
                    className="absolute border-2 border-blue-500 border-dashed bg-blue-500/10 rounded-lg"
                    style={{
                      left: '10%',
                      top: '15%',
                      width: '35%',
                      height: '40%',
                    }}
                  >
                    <div className="absolute -top-6 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {t('floorplans.zoneA')} - {t('floorplans.production')}
                    </div>
                  </div>
                  <div
                    className="absolute border-2 border-purple-500 border-dashed bg-purple-500/10 rounded-lg"
                    style={{
                      left: '55%',
                      top: '20%',
                      width: '30%',
                      height: '35%',
                    }}
                  >
                    <div className="absolute -top-6 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                      {t('floorplans.zoneB')} - {t('floorplans.storage')}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Device Legend */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">{t('floorplans.online')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm">{t('floorplans.warning')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                <span className="text-sm">{t('floorplans.offline')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                <span className="text-sm">{t('floorplans.sensor')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">{t('floorplans.meter')}</span>
              </div>
            </div>

            {/* Plan Info */}
            <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('floorplans.dimensions')}
                </p>
                <p className="font-semibold">
                  {selectedPlan?.dimensions.width}m ×{' '}
                  {selectedPlan?.dimensions.height}m
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('floorplans.scale')}
                </p>
                <p className="font-semibold">{selectedPlan?.scale}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('floorplans.lastModified')}
                </p>
                <p className="font-semibold">
                  {selectedPlan?.lastModified.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewerOpen(false)}>
              {t('floorplans.close')}
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('floorplans.export')}
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {t('floorplans.editPlan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete flood plan model  */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('devices.tooltips.delete')}
        itemName={
          floorPlans?.find((d: FloorPlan) => d.id === FloorpLanID)?.name ||
          t('common.name')
        }
        isLoading={DeleteFloorPlan.isPending}
      />
    </div>
  );
}
