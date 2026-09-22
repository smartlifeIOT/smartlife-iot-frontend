import React, { useState, useMemo, useEffect } from 'react';
import { Control, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Power, Layers } from 'lucide-react';
import type { FilterFormValues, Zone } from '@/features/floorPlan/types';
import { useFloorMapStore } from '@/features/floorPlan/store';
import { useDevices } from '@/features/devices/hooks';
import type { Device as ApiDevice } from '@/services/api/devices.api';
import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { floorPlansApi } from '@/features/floorPlan/services/floor-plans.api';
import type {
  ApiResponse,
  FloorPlan,
} from '@/features/floorPlan/services/floor-plans.api';
import FloorPlan3DViewer from './FloorPlan3DViewer';

interface ReviewStepProps {
  register: UseFormRegister<FilterFormValues>;
  control: Control<FilterFormValues>;
  onPrevious: () => void;
  onSave: () => void;
}

// Parse backend zones into store Zone structure
const mapBackendZone = (bz: any, index: number): Zone => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const boundaries: Array<{ x: number; y: number }> = [];

  const rawBounds = bz.boundaries || bz.points || [];
  if (Array.isArray(rawBounds) && rawBounds.length > 0) {
    rawBounds.forEach((pt: any) => {
      let px = 0;
      let py = 0;
      if (typeof pt === 'string') {
        const parts = pt.split(',').map((p: string) => parseFloat(p.trim()));
        px = parts[0] || 0;
        py = parts[1] || 0;
      } else if (typeof pt === 'object' && pt !== null) {
        px = pt.x ?? pt.X ?? 0;
        py = pt.y ?? pt.Y ?? 0;
      }
      boundaries.push({ x: px, y: py });
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    });
  }

  const x = bz.x ?? (minX !== Infinity ? minX : 50 + (index % 5) * 60);
  const y =
    bz.y ?? (minY !== Infinity ? minY : 50 + Math.floor(index / 5) * 60);
  const w =
    bz.w ??
    bz.width ??
    (maxX !== -Infinity && minX !== Infinity ? Math.max(maxX - minX, 40) : 100);
  const h =
    bz.h ??
    bz.height ??
    (maxY !== -Infinity && minY !== Infinity ? Math.max(maxY - minY, 40) : 80);

  return {
    id: bz.id || `zone-${Date.now()}-${index}`,
    name: bz.name || `Zone ${index + 1}`,
    type: bz.type || 'Room',
    color: bz.color || 'bg-blue-200',
    floor: bz.floor || 'Ground',
    x,
    y,
    w,
    h,
    area: Math.round(w * h) || 0,
    capacity: bz.capacity || 0,
    status: 'Active',
    isDefined: true,
    description: bz.description || '',
    boundaries: boundaries.length > 0 ? boundaries : undefined,
  };
};

export const ReviewStep: React.FC<ReviewStepProps> = ({
  onPrevious,
  onSave,
}) => {
  const {
    zones,
    uploadedFiles,
    assignedDevices,
    devicePositions,
    floorPlanId,
    parsedGeometry: storedGeometry,
    setZones,
  } = useFloorMapStore();

  // Query backend for parsedGeometry and zones
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
  const parsedGeometry =
    storedGeometry || (floorPlan as any)?.geometry || floorPlan?.parsedGeometry;

  // Sync zones from backend if local store is empty
  useEffect(() => {
    if (!floorPlan) return;
    const backendZones = (floorPlan as any)?.zones;
    if (
      Array.isArray(backendZones) &&
      backendZones.length > 0 &&
      zones.length === 0
    ) {
      const mapped = backendZones.map((bz: any, idx: number) =>
        mapBackendZone(bz, idx)
      );
      setZones(mapped);
    }
  }, [floorPlan, zones.length, setZones]);

  // Devices from API
  const { data: devicesData } = useDevices();
  const apiDevices = useMemo(() => {
    const apiResponse = devicesData?.data as unknown as {
      data?: { data?: ApiDevice[] };
    };
    return apiResponse?.data?.data || [];
  }, [devicesData]);

  const availableDevices = useMemo(() => {
    return apiDevices.map((apiDevice) => ({
      id: apiDevice.id,
      name: apiDevice.name,
      type: String(apiDevice.type || 'sensor').toLowerCase(),
    }));
  }, [apiDevices]);

  // Available floors
  const availableFloors = useMemo(() => {
    const floors = uploadedFiles
      .map((f) => f.floor)
      .filter((floor, index, self) => self.indexOf(floor) === index)
      .sort((a, b) => {
        const floorOrder = ['Ground', '1st', '2nd', '3rd', '4th', '5th'];
        const indexA = floorOrder.indexOf(a);
        const indexB = floorOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    return floors.length > 0 ? floors : ['Ground'];
  }, [uploadedFiles]);

  const [selectedFloor, setSelectedFloor] = useState<string>(
    availableFloors[0] || 'Ground'
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Device ON/OFF interactive power state
  const [devicePowerState, setDevicePowerState] = useState<
    Record<string, boolean>
  >({});

  const toggleDeviceState = (deviceId: string) => {
    setDevicePowerState((prev) => ({
      ...prev,
      [deviceId]: prev[deviceId] !== undefined ? !prev[deviceId] : false,
    }));
  };

  const setAllDevicesPower = (powerOn: boolean) => {
    const newState: Record<string, boolean> = {};
    availableDevices.forEach((d) => {
      newState[d.id] = powerOn;
    });
    setDevicePowerState(newState);
  };

  // Devices placed on the selected floor
  const currentFloorDevices = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; type: string; x: number; y: number }
    >();

    // 1. From devicePositions
    Object.entries(devicePositions).forEach(([devId, pos]) => {
      if (!pos.floor || pos.floor === selectedFloor) {
        const d = availableDevices.find((dev) => dev.id === devId);
        if (d) {
          map.set(devId, {
            id: d.id,
            name: d.name,
            type: d.type,
            x: pos.x,
            y: pos.y,
          });
        }
      }
    });

    // 2. From assignedDevices if not already placed
    zones
      .filter((z) => !z.floor || z.floor === selectedFloor)
      .forEach((z) => {
        const assigned = assignedDevices[z.id] || [];
        assigned.forEach((d) => {
          if (!map.has(d.id)) {
            map.set(d.id, {
              id: d.id,
              name: d.name,
              type: d.type || 'sensor',
              x: z.x + z.w / 2,
              y: z.y + z.h / 2,
            });
          }
        });
      });

    return Array.from(map.values());
  }, [
    devicePositions,
    assignedDevices,
    zones,
    availableDevices,
    selectedFloor,
  ]);

  // Zones on current floor
  const currentFloorZones = useMemo(() => {
    return zones.filter((z) => !z.floor || z.floor === selectedFloor);
  }, [zones, selectedFloor]);

  const handleExport3D = () => {
    console.log('Export 3D model');
  };

  const handleShareLink = () => {
    console.log('Share link');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left: Professional 3D Digital Twin Viewer */}
        <div className="flex flex-col">
          <FloorPlan3DViewer
            planName="Digital Twin 3D View"
            zones={currentFloorZones}
            devices={currentFloorDevices}
            parsedGeometry={parsedGeometry}
            selectedZoneId={selectedZoneId}
            onZoneSelect={setSelectedZoneId}
            devicePowerState={devicePowerState}
            onToggleDevice={toggleDeviceState}
          />
        </div>

        {/* Right Panel - Interactive Controls & Settings */}
        <div className="space-y-4">
          {/* Interactive IoT Devices Controls */}
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Power className="h-4 w-4 text-emerald-600" />
                  <span>Interactive IoT Devices</span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-1.5 text-[11px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setAllDevicesPower(true)}
                  >
                    All ON
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-1.5 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => setAllDevicesPower(false)}
                  >
                    All OFF
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Click device in 3D or toggle switch
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 bg-slate-50"
                >
                  {
                    currentFloorDevices.filter(
                      (d) => devicePowerState[d.id] ?? true
                    ).length
                  }{' '}
                  / {currentFloorDevices.length} ON
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {currentFloorDevices.map((device) => {
                const isOn = devicePowerState[device.id] ?? true;
                const zone = zones.find((z) =>
                  assignedDevices[z.id]?.some((d) => d.id === device.id)
                );

                return (
                  <div
                    key={`toggle-${device.id}`}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isOn
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isOn
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-300'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {device.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {device.type} {zone ? `• ${zone.name}` : ''}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isOn}
                      onCheckedChange={() => toggleDeviceState(device.id)}
                    />
                  </div>
                );
              })}
              {currentFloorDevices.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg bg-slate-50">
                  No devices placed on {selectedFloor} floor yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Floor Selection */}
          {availableFloors.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Floor Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedFloor}
                  onValueChange={setSelectedFloor}
                >
                  {availableFloors.map((floor) => (
                    <div
                      key={floor}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <RadioGroupItem value={floor} id={floor} />
                      <Label
                        htmlFor={floor}
                        className={`cursor-pointer text-xs ${
                          selectedFloor === floor
                            ? 'font-semibold text-primary'
                            : ''
                        }`}
                      >
                        {floor} Floor
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Status and Overview */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active Zones</span>
                <span className="font-semibold text-gray-900">
                  {currentFloorZones.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Placed Devices</span>
                <span className="font-semibold text-gray-900">
                  {currentFloorDevices.length}
                </span>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs">
                <span className="text-gray-600">3D Model Status</span>
                <span className="font-semibold text-emerald-600">Ready</span>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button className="w-full" onClick={onSave}>
            Save Floor Plan
          </Button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex gap-3">
          <Button variant="outline" type="button" onClick={onPrevious}>
            Back
          </Button>
          <Button variant="outline" type="button" onClick={handleExport3D}>
            <Download className="mr-2 h-4 w-4" />
            Export 3D
          </Button>
          <Button variant="outline" type="button" onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>
      </div>
    </div>
  );
};
