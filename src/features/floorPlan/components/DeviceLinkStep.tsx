import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Control, Controller, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  Radio,
  Wifi,
  Cpu,
  Plus,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import type {
  FilterFormValues,
  Device,
  Zone,
} from '@/features/floorPlan/types';
import { useFloorMapStore } from '@/features/floorPlan/store';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useDevices } from '@/features/devices/hooks';
import type { Device as ApiDevice } from '@/services/api/devices.api';
import { floorPlansApi } from '@/features/floorPlan/services/floor-plans.api';
import type {
  ApiResponse,
  FloorPlan,
  ParsedGeometry,
} from '@/features/floorPlan/services/floor-plans.api';
import DragableDevies from './DragableDevies';
import FloorPlanCanvas, { isPointInPolygon } from './FloorPlanCanvas';

interface DeviceLinkStepProps {
  register: UseFormRegister<FilterFormValues>;
  control: Control<FilterFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

// Transform API Device to floorPlan Device format
const transformDevice = (apiDevice: ApiDevice): Device => {
  const mapStatus = (
    status: string | number
  ): 'online' | 'offline' | 'idle' | 'error' => {
    const statusStr = String(status).toLowerCase();
    if (statusStr === 'online' || statusStr === 'active') return 'online';
    if (statusStr === 'offline' || statusStr === 'inactive') return 'offline';
    if (statusStr === 'idle' || statusStr === 'standby') return 'idle';
    if (
      statusStr === 'error' ||
      statusStr === 'maintenance' ||
      statusStr === 'warning'
    )
      return 'error';
    return 'offline';
  };

  const mapType = (type: string | number): string => {
    const typeStr = String(type).toLowerCase();
    return typeStr || 'sensor';
  };

  return {
    id: apiDevice.id,
    name: apiDevice.name,
    type: mapType(apiDevice.type),
    status: mapStatus(apiDevice.status),
    assignedTo: undefined,
  };
};

// Helper function to get zone color
const getZoneColor = (type: string): string => {
  const colors: Record<string, string> = {
    Room: '#3B82F6',
    Office: '#10B981',
    Lobby: '#F59E0B',
    Corridor: '#8B5CF6',
    Storage: '#EF4444',
  };
  return colors[type] || '#E5E7EB';
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'bg-emerald-500';
    case 'offline':
      return 'bg-rose-500';
    case 'idle':
      return 'bg-amber-500';
    default:
      return 'bg-slate-400';
  }
};

const getDeviceIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('gateway')) return <Wifi className="h-3.5 w-3.5" />;
  if (t.includes('controller') || t.includes('switch'))
    return <Cpu className="h-3.5 w-3.5" />;
  return <Radio className="h-3.5 w-3.5" />;
};

export const DeviceLinkStep: React.FC<DeviceLinkStepProps> = ({
  control,
  onPrevious,
  onNext,
}) => {
  // Zustand store
  const {
    zones,
    setZones,
    uploadedFiles,
    selectedFloor,
    floorPlanId,
    parsedGeometry: storedGeometry,
    setParsedGeometry,
    assignedDevices,
    assignDeviceToRoom,
    unassignDeviceFromRoom,
    devicePositions,
    setDevicePosition,
    removeDevicePosition,
  } = useFloorMapStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [activeFloorTab, setActiveFloorTab] = useState(selectedFloor);
  const [zoomLevel, setZoomLevel] = useState(100);
  const stageRef = useRef<KonvaStage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch floor plan data from backend
  const { data: floorPlanResponse } = useQuery<
    AxiosResponse<ApiResponse<FloorPlan>>
  >({
    queryKey: ['floor-plan-data', floorPlanId],
    queryFn: async () => {
      if (!floorPlanId) throw new Error('Floor plan ID is missing');
      return floorPlansApi.getParsedDataByID(floorPlanId);
    },
    enabled: !!floorPlanId,
    staleTime: 5000,
  });

  const floorPlan = floorPlanResponse?.data?.data;

  // Sync geometry and backend zones into store if not present
  useEffect(() => {
    if (!floorPlan) return;

    const geo =
      (floorPlan as any)?.geometry ||
      floorPlan?.parsedGeometry;
    if (geo && !storedGeometry) setParsedGeometry(geo);

    if (zones.length === 0 && Array.isArray(floorPlan.zones) && floorPlan.zones.length > 0) {
      const mappedZones: Zone[] = floorPlan.zones.map((bz: any) => {
        const rawBoundaries = bz.boundaries;
        const boundaries: Array<{ x: number; y: number }> = [];

        if (Array.isArray(rawBoundaries)) {
          rawBoundaries.forEach((b: any) => {
            if (typeof b === 'string') {
              const parts = b.split(',');
              const x = parseFloat(parts[0]);
              const y = parseFloat(parts[1]);
              if (!isNaN(x) && !isNaN(y)) boundaries.push({ x, y });
            } else if (b && typeof b.x === 'number' && typeof b.y === 'number') {
              boundaries.push({ x: b.x, y: b.y });
            }
          });
        }

        let minX = 0, minY = 0, maxX = 0, maxY = 0;
        if (boundaries.length > 0) {
          minX = Math.min(...boundaries.map((p) => p.x));
          minY = Math.min(...boundaries.map((p) => p.y));
          maxX = Math.max(...boundaries.map((p) => p.x));
          maxY = Math.max(...boundaries.map((p) => p.y));
        }

        const w = maxX > minX ? maxX - minX : (bz.w || 0);
        const h = maxY > minY ? maxY - minY : (bz.h || 0);

        return {
          id: bz.id,
          name: bz.name || 'Zone',
          type: bz.type || 'Room',
          color: bz.color || 'bg-red-200',
          floor: bz.floor || selectedFloor,
          boundaries,
          x: boundaries.length > 0 ? minX : (bz.x || 0),
          y: boundaries.length > 0 ? minY : (bz.y || 0),
          w,
          h,
          area: Math.round(w * h) || 0,
          capacity: bz.capacity || 0,
          status: 'Active',
          isDefined: true,
          description: bz.description || '',
        };
      });

      setZones(mappedZones);
    }
  }, [floorPlan, zones.length]);

  const parsedGeometry: ParsedGeometry | null =
    storedGeometry ??
    floorPlan?.parsedGeometry ??
    (floorPlan as any)?.geometry ??
    null;

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 50));
  const handleResetZoom = () => setZoomLevel(100);

  // Floors
  const availableFloors = useMemo(() => {
    const floorsFromFiles = uploadedFiles.map((f) => f.floor).filter(Boolean);
    const floorsFromZones = zones.map((z) => z.floor).filter(Boolean);
    const combined = [...new Set([...floorsFromFiles, ...floorsFromZones])];
    const floorOrder = ['Ground', '1st', '2nd', '3rd', '4th', '5th'];
    combined.sort((a, b) => {
      const ia = floorOrder.indexOf(a);
      const ib = floorOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return combined.length > 0 ? combined : [selectedFloor];
  }, [uploadedFiles, zones, selectedFloor]);

  // Current floor DWG
  const currentDwgFile = useMemo(() => {
    return uploadedFiles.find(
      (f) => f.floor === activeFloorTab && f.status === 'completed'
    );
  }, [uploadedFiles, activeFloorTab]);

  const dwgImageUrl = currentDwgFile?.previewUrl || floorPlan?.imageUrl;

  // Current floor zones
  const currentFloorZones = useMemo(() => {
    return zones.filter((z) => (z.floor || selectedFloor) === activeFloorTab);
  }, [zones, activeFloorTab, selectedFloor]);

  // Current floor parsed rooms
  const currentFloorParsedRooms = useMemo(() => {
    const allRooms = parsedGeometry?.rooms ?? [];
    if (allRooms.length === 0) return undefined;
    const matched = allRooms.filter(
      (r) =>
        !r.floor ||
        r.floor.toLowerCase() === activeFloorTab.toLowerCase() ||
        (r.floor || selectedFloor) === activeFloorTab
    );
    return matched.length > 0 ? matched : allRooms;
  }, [parsedGeometry, activeFloorTab, selectedFloor]);

  // Devices API
  const { data: devicesData, isLoading, isError } = useDevices();
  const apiDevices = useMemo(() => {
    const apiResponse = devicesData?.data as unknown as {
      data?: { data?: ApiDevice[] };
    };
    return apiResponse?.data?.data || [];
  }, [devicesData]);

  const availableDevices = useMemo(() => {
    const transformed = apiDevices.map(transformDevice);
    return transformed.map((device) => {
      const assignedZoneId = Object.keys(assignedDevices).find((zoneId) =>
        assignedDevices[zoneId]?.some((d) => d.id === device.id)
      );
      return {
        ...device,
        assignedTo: assignedZoneId || device.assignedTo,
      };
    });
  }, [apiDevices, assignedDevices]);

  // Filtered devices for sidebar
  const filteredDevices = useMemo(() => {
    return availableDevices.filter((device) => {
      const matchesSearch =
        !searchQuery ||
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === 'all' ||
        device.type.toLowerCase().includes(filterType.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [availableDevices, searchQuery, filterType]);

  // Current floor device positions
  const currentFloorDevicePositions = useMemo(() => {
    const filtered: Record<
      string,
      { x: number; y: number; zoneId: string | null; floor: string }
    > = {};
    Object.entries(devicePositions).forEach(([deviceId, position]) => {
      if (position.floor === activeFloorTab) {
        filtered[deviceId] = position;
      }
    });
    return filtered;
  }, [devicePositions, activeFloorTab]);

  const selectedZone = currentFloorZones.find((z) => z.id === selectedZoneId);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, device: Device) => {
    e.dataTransfer.effectAllowed = 'move';
    const deviceJson = JSON.stringify(device);
    e.dataTransfer.setData('application/json', deviceJson);
    e.dataTransfer.setData('text/plain', deviceJson);
  };

  const handleRepositionDragStart = (e: React.DragEvent, deviceId: string) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    const data = JSON.stringify({ type: 'reposition', deviceId });
    e.dataTransfer.setData('application/json', data);
    e.dataTransfer.setData('text/plain', data);
  };

  // Drop onto canvas
  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let deviceData = e.dataTransfer.getData('application/json');
    if (!deviceData || deviceData === '[object Object]') {
      deviceData = e.dataTransfer.getData('text/plain');
    }
    if (!deviceData) return;

    try {
      const parsed = JSON.parse(deviceData);
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scale = zoomLevel / 100;
      const dropX = Math.round((e.clientX - rect.left) / scale);
      const dropY = Math.round((e.clientY - rect.top) / scale);

      const clampedX = Math.max(20, Math.min(780, dropX));
      const clampedY = Math.max(20, Math.min(480, dropY));

      // Match zone
      let matchedZone: Zone | null = null;
      for (const zone of currentFloorZones) {
        if (zone.boundaries && zone.boundaries.length >= 3) {
          if (isPointInPolygon({ x: clampedX, y: clampedY }, zone.boundaries)) {
            matchedZone = zone;
            break;
          }
        }
        if (
          clampedX >= zone.x &&
          clampedX <= zone.x + zone.w &&
          clampedY >= zone.y &&
          clampedY <= zone.y + zone.h
        ) {
          matchedZone = zone;
          break;
        }
      }

      const targetZoneId = matchedZone?.id || selectedZoneId || null;

      if (parsed.type === 'reposition' && parsed.deviceId) {
        const device = availableDevices.find((d) => d.id === parsed.deviceId);
        if (device) {
          const currentPos = devicePositions[parsed.deviceId];
          if (currentPos?.zoneId && currentPos.zoneId !== targetZoneId) {
            unassignDeviceFromRoom(parsed.deviceId, currentPos.zoneId);
          }
          if (targetZoneId && targetZoneId !== currentPos?.zoneId) {
            assignDeviceToRoom(device, targetZoneId);
          }
          setDevicePosition(parsed.deviceId, {
            x: clampedX,
            y: clampedY,
            zoneId: targetZoneId,
            floor: activeFloorTab,
          });
        }
      } else {
        const device = parsed as Device;
        if (
          device.assignedTo &&
          targetZoneId &&
          device.assignedTo !== targetZoneId
        ) {
          unassignDeviceFromRoom(device.id, device.assignedTo);
        }
        if (targetZoneId) {
          assignDeviceToRoom(device, targetZoneId);
        }
        setDevicePosition(device.id, {
          x: clampedX,
          y: clampedY,
          zoneId: targetZoneId,
          floor: activeFloorTab,
        });
      }
    } catch (err) {
      console.error('Drop handling error:', err);
    }
  };

  // Direct assign to selected zone
  const handleAssignToSelectedZone = (device: Device) => {
    if (!selectedZone) return;
    if (device.assignedTo && device.assignedTo !== selectedZone.id) {
      unassignDeviceFromRoom(device.id, device.assignedTo);
    }
    assignDeviceToRoom(device, selectedZone.id);

    const existingCount = assignedDevices[selectedZone.id]?.length || 0;
    const offsetX = ((existingCount % 3) - 1) * 28;
    const offsetY = Math.floor(existingCount / 3) * 24;
    const cx = Math.max(
      30,
      Math.min(770, selectedZone.x + selectedZone.w / 2 + offsetX)
    );
    const cy = Math.max(
      30,
      Math.min(470, selectedZone.y + selectedZone.h / 2 + offsetY)
    );

    setDevicePosition(device.id, {
      x: Math.round(cx),
      y: Math.round(cy),
      zoneId: selectedZone.id,
      floor: activeFloorTab,
    });
  };

  const handleRemoveDevice = (deviceId: string, zoneId?: string | null) => {
    if (zoneId) {
      unassignDeviceFromRoom(deviceId, zoneId);
    } else {
      Object.keys(assignedDevices).forEach((zid) => {
        if (assignedDevices[zid]?.some((d) => d.id === deviceId)) {
          unassignDeviceFromRoom(deviceId, zid);
        }
      });
    }
    removeDevicePosition(deviceId);
  };

  if (isLoading) return <LoadingOverlay />;
  if (isError) {
    return (
      <ErrorMessage
        title="Error loading devices"
        error={new Error('Failed to load devices')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const assignedCount = availableDevices.filter((d) => d.assignedTo).length;
  const totalCount = availableDevices.length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            Link Devices to Zones
          </h2>
          <p className="text-sm text-muted-foreground">
            Drag devices onto zones on the floor plan or click a zone to attach
            devices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-3 py-1 bg-white shadow-sm text-xs"
          >
            Assigned:{' '}
            <span className="font-semibold text-emerald-600 ml-1">
              {assignedCount} / {totalCount}
            </span>
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            Floor: <span className="font-semibold ml-1">{activeFloorTab}</span>
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_1fr]">
        {/* Left Column - Floor Plan Canvas */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Interactive Floor Plan View
            </h3>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-mono"
                onClick={handleResetZoom}
                title="Reset Zoom"
              >
                {zoomLevel}%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Floor Selection Tabs */}
          {availableFloors.length > 1 && (
            <Tabs
              defaultValue={activeFloorTab}
              value={activeFloorTab}
              onValueChange={setActiveFloorTab}
              className="w-full"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${availableFloors.length}, 1fr)`,
                  width: '100%',
                }}
              >
                <TabsList className="w-full">
                  {availableFloors.map((floor) => (
                    <TabsTrigger
                      key={floor}
                      value={floor}
                      className="flex items-center gap-2"
                    >
                      <Layers className="h-3 w-3" />
                      {floor} Floor
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          )}

          {/* Canvas Viewport Container */}
          <div
            ref={containerRef}
            className="relative rounded-lg shadow-md border border-gray-200 bg-gray-50 overflow-hidden"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={handleDropOnCanvas}
          >
            <FloorPlanCanvas
              zones={currentFloorZones}
              selectedZoneId={selectedZoneId}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              dwgImageUrl={dwgImageUrl}
              parsedRooms={currentFloorParsedRooms}
              showParsedRooms={false}
              geometry={(parsedGeometry as any) ?? undefined}
              onZoneClick={(zid) => setSelectedZoneId(zid)}
              stageRef={stageRef}
            >
              {/* Placed Device Pins Overlay - rendered inside the CSS-scaled container */}
              {Object.entries(currentFloorDevicePositions).map(
                ([deviceId, pos]) => {
                  const device = availableDevices.find(
                    (d) => d.id === deviceId
                  );
                  if (!device) return null;

                  const zone = pos.zoneId
                    ? currentFloorZones.find((z) => z.id === pos.zoneId)
                    : null;

                  const statusBg =
                    device.status === 'online'
                      ? 'bg-emerald-500'
                      : device.status === 'offline'
                        ? 'bg-rose-500'
                        : 'bg-amber-500';

                  return (
                    <div
                      key={`placed-${deviceId}`}
                      draggable={true}
                      onDragStart={(e) =>
                        handleRepositionDragStart(e, deviceId)
                      }
                      style={{
                        position: 'absolute',
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 35,
                      }}
                      className="group cursor-grab active:cursor-grabbing select-none"
                    >
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/95 text-slate-900 border border-slate-300 shadow-md transition-all hover:scale-105 hover:border-blue-500">
                        {/* Device icon + status pulse */}
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`w-2 h-2 rounded-full ${statusBg}`}
                          />
                          {device.status === 'online' && (
                            <span
                              className={`absolute w-3.5 h-3.5 rounded-full ${statusBg} opacity-75 animate-ping`}
                            />
                          )}
                        </div>

                        <span className="text-slate-600">
                          {getDeviceIcon(device.type)}
                        </span>

                        <span className="text-xs font-semibold max-w-[90px] truncate">
                          {device.name}
                        </span>

                        {zone && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-medium max-w-[60px] truncate">
                            {zone.name}
                          </span>
                        )}

                        {/* Unassign button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDevice(deviceId, pos.zoneId);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-rose-100 text-rose-600"
                          title="Remove from floor plan"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </FloorPlanCanvas>
          </div>

          {/* Selected Zone Card */}
          {selectedZone ? (
            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getZoneColor(selectedZone.type),
                      }}
                    />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Zone: {selectedZone.name}
                    </h4>
                    <Badge variant="outline" className="text-xs bg-white">
                      {selectedZone.type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => setSelectedZoneId(null)}
                  >
                    Clear selection
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Devices assigned to this zone (
                  {assignedDevices[selectedZone.id]?.length || 0}):
                </p>

                {assignedDevices[selectedZone.id]?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assignedDevices[selectedZone.id].map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between text-xs bg-white rounded-md p-2 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              device.status
                            )}`}
                          />
                          <span className="font-medium">{device.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() =>
                            handleRemoveDevice(device.id, selectedZone.id)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic py-2">
                    No devices attached yet. Drag a device from the right
                    sidebar onto this zone or click "+ Assign" below.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 p-2 bg-slate-50 rounded border border-slate-200">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Tip: Click any zone on the floor plan to select it and quickly
                manage its devices.
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Available Devices */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">
                Available Devices
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredDevices.length} devices
              </span>
            </div>

            {/* Search and Type Filter */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={filterType}
                    onValueChange={(value) => {
                      setFilterType(value);
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="w-28 text-xs h-9">
                      <Filter className="h-3 w-3 mr-1" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="gateway">Gateway</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="controller">Controller</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Device List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredDevices.map((device) => {
                const isAssigned = !!device.assignedTo;
                const assignedZoneName = isAssigned
                  ? zones.find((z) => z.id === device.assignedTo)?.name ||
                    'Zone'
                  : null;

                return (
                  <div key={device.id} className="relative group">
                    <DragableDevies
                      device={device}
                      handleDragStart={handleDragStart}
                      getStatusColor={getStatusColor}
                    />

                    {/* Direct Assign action when a zone is selected */}
                    {selectedZone && !isAssigned && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAssignToSelectedZone(device)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 px-2 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 opacity-90 group-hover:opacity-100"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    )}

                    {isAssigned && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {assignedZoneName}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() =>
                            handleRemoveDevice(device.id, device.assignedTo)
                          }
                          title="Unassign device"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredDevices.length === 0 && (
                <div className="text-center py-12 text-sm text-gray-500 border border-dashed rounded-lg bg-gray-50">
                  No devices match your filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" type="button" onClick={onPrevious}>
          Previous
        </Button>
        <div className="flex gap-3">
          <Button type="button" onClick={onNext} className="min-w-24">
            Next: 3D View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeviceLinkStep;
