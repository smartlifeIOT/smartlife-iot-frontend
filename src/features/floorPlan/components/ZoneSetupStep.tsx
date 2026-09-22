import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Control, UseFormRegister } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Plus,
  Layers,
  Eye,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import type { AxiosResponse } from 'axios';
import type { FilterFormValues, Zone } from '@/features/floorPlan/types';
import type {
  ParsedGeometry,
  ApiResponse,
  FloorPlan,
} from '@/features/floorPlan/services/floor-plans.api';

import type { Stage as KonvaStage } from 'konva/lib/Stage';
import { useFloorMapStore } from '@/features/floorPlan/store';
import { floorPlansApi } from '@/features/floorPlan/services/floor-plans.api';
import { floorPlanService } from '@/features/floorPlan/services/floorPlanService';
import FloorPlanCanvas, {
  computeTransform,
  toCanvasPoint,
} from './FloorPlanCanvas';

// ─── Zone type options ────────────────────────────────────────────────────────

const ZONE_TYPES = [
  'Room',
  'Office',
  'Lobby',
  'Corridor',
  'Storage',
  'Conference',
  'Restroom',
  'Utility',
];

// ─── Colour palette for auto-detected rooms ───────────────────────────────────

const ROOM_COLOR_PALETTE = [
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-red-200',
  'bg-cyan-200',
  'bg-pink-200',
  'bg-lime-200',
];

const DOT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-lime-500',
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ZoneSetupStepProps {
  register: UseFormRegister<FilterFormValues>;
  control: Control<FilterFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ZoneSetupStep: React.FC<ZoneSetupStepProps> = ({
  register,
  control,
  onPrevious,
  onNext,
}) => {
  const {
    zones,
    addZone,
    updateZone,
    removeZone,
    setZones,
    selectedZoneId,
    setSelectedZoneId,
    zoomLevel,
    setZoomLevel,
    selectedFloor,
    floorPlanId,
    parsedGeometry: storedGeometry,
    setParsedGeometry,
  } = useFloorMapStore();

  // ── Fetch floor plan data (geometry + zones) from backend ─────────────────────
  const {
    data: floorPlanResponse,
    isLoading: isLoadingFloorPlan,
    refetch,
  } = useQuery<AxiosResponse<ApiResponse<FloorPlan>>>({
    queryKey: ['floor-plan-data', floorPlanId],
    queryFn: async () => {
      if (!floorPlanId) throw new Error('Floor plan ID is missing');
      return floorPlansApi.getParsedDataByID(floorPlanId);
    },
    enabled: !!floorPlanId,
    staleTime: 5000,
  });

  const floorPlan = floorPlanResponse?.data?.data;

  // Track which local zone IDs have been saved to the API
  const savedZoneIdsRef = useRef<Set<string>>(new Set());

  // Sync fetched geometry and zones from backend into the store
  useEffect(() => {
    if (!floorPlan) return;

    // Sync geometry if not already stored
    const geo = (floorPlan as any)?.geometry || floorPlan?.parsedGeometry;
    if (geo && !storedGeometry) {
      setParsedGeometry(geo);
    }

    // Sync zones from backend (floorPlan.zones)
    if (Array.isArray(floorPlan.zones)) {
      const backendZones: Zone[] = floorPlan.zones.map((bz: any) => {
        const rawBoundaries = bz.boundaries;
        const boundaries: Array<{ x: number; y: number }> = [];

        if (Array.isArray(rawBoundaries)) {
          rawBoundaries.forEach((b: any) => {
            if (typeof b === 'string') {
              const parts = b.split(',');
              const x = parseFloat(parts[0]);
              const y = parseFloat(parts[1]);
              if (!isNaN(x) && !isNaN(y)) boundaries.push({ x, y });
            } else if (
              b &&
              typeof b.x === 'number' &&
              typeof b.y === 'number'
            ) {
              boundaries.push({ x: b.x, y: b.y });
            }
          });
        }

        let minX = 0,
          minY = 0,
          maxX = 0,
          maxY = 0;
        if (boundaries.length > 0) {
          minX = Math.min(...boundaries.map((p) => p.x));
          minY = Math.min(...boundaries.map((p) => p.y));
          maxX = Math.max(...boundaries.map((p) => p.x));
          maxY = Math.max(...boundaries.map((p) => p.y));
        }

        const w = maxX > minX ? maxX - minX : bz.w || 0;
        const h = maxY > minY ? maxY - minY : bz.h || 0;

        savedZoneIdsRef.current.add(bz.id);

        return {
          id: bz.id,
          name: bz.name || 'Zone',
          type: bz.type || 'Room',
          color: bz.color || 'bg-red-200',
          floor: bz.floor || selectedFloor,
          boundaries,
          x: boundaries.length > 0 ? minX : bz.x || 0,
          y: boundaries.length > 0 ? minY : bz.y || 0,
          w,
          h,
          area: Math.round(w * h) || 0,
          capacity: bz.capacity || 0,
          status: 'Active',
          isDefined: true,
          description: bz.description || '',
        };
      });

      // Keep user's unsaved local zones not yet on server
      const unsavedLocalZones = zones.filter(
        (lz) =>
          !savedZoneIdsRef.current.has(lz.id) &&
          !backendZones.some((bz) => bz.id === lz.id)
      );

      setZones([...backendZones, ...unsavedLocalZones]);
    }
  }, [floorPlan]);

  // Prefer store geometry (from upload), fall back to fetched geometry
  const parsedGeometry: ParsedGeometry | null =
    storedGeometry ??
    floorPlan?.parsedGeometry ??
    (floorPlan as any)?.geometry ??
    null;

  // ── Local state ────────────────────────────────────────────────────────────
  const [isAddZoneMode, setIsAddZoneMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState('Room');
  const [selectionPoints, setSelectionPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingZonePosition, setPendingZonePosition] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [activeFloorTab, setActiveFloorTab] = useState(selectedFloor);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const stageRef = useRef<KonvaStage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean up any previously auto-generated room zones so only user-created zones exist
  useEffect(() => {
    const hasAutoRooms = zones.some(
      (z) => z.sourceRoomId || z.id.startsWith('room-')
    );
    if (hasAutoRooms) {
      setZones(
        zones.filter((z) => !z.sourceRoomId && !z.id.startsWith('room-'))
      );
    }
  }, []);

  // ── Floor tabs from parsedGeometry ────────────────────────────────────────
  const availableFloors = useMemo<string[]>(() => {
    if (parsedGeometry?.rooms && parsedGeometry.rooms.length > 0) {
      const floorOrder = [
        'ground',
        'Ground',
        '1st',
        '2nd',
        '3rd',
        '4th',
        '5th',
      ];
      return [
        ...new Set(
          parsedGeometry.rooms
            .map((r) => r.floor)
            .filter((f): f is string => typeof f === 'string' && f.length > 0)
        ),
      ].sort((a, b) => {
        const ia = floorOrder.indexOf(a);
        const ib = floorOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    return [selectedFloor];
  }, [parsedGeometry, selectedFloor]);

  useEffect(() => {
    if (
      availableFloors.length > 0 &&
      !availableFloors.includes(activeFloorTab)
    ) {
      setActiveFloorTab(availableFloors[0]);
    }
  }, [availableFloors, activeFloorTab]);

  // ── Derived data for current floor ───────────────────────────────────────
  const currentFloorZones = useMemo(
    () =>
      zones.filter(
        (z) =>
          (z.floor || selectedFloor) === activeFloorTab &&
          !z.sourceRoomId &&
          !z.id.startsWith('room-')
      ),
    [zones, activeFloorTab, selectedFloor]
  );

  // Rooms from parsedGeometry for the active floor (passed to canvas for CAD reference outlines)
  const currentFloorParsedRooms = useMemo(() => {
    const allRooms = parsedGeometry?.rooms ?? [];
    if (allRooms.length === 0) return [];
    const matched = allRooms.filter(
      (r) =>
        !r.floor ||
        r.floor.toLowerCase() === activeFloorTab.toLowerCase() ||
        (r.floor || selectedFloor) === activeFloorTab
    );
    return matched.length > 0 ? matched : allRooms;
  }, [parsedGeometry, activeFloorTab, selectedFloor]);

  const selectedZone =
    currentFloorZones.find((z) => z.id === selectedZoneId) || null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleZoneClick = useCallback(
    (zoneId: string) => setSelectedZoneId(zoneId),
    [setSelectedZoneId]
  );

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 200));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));
  const handleFitToView = () => setZoomLevel(100);

  const handleAddZone = () => {
    setIsAddZoneMode(true);
    setIsDrawing(true);
    setSelectionPoints([]);
  };

  const handleStageClick = () => {
    if (!isAddZoneMode || !isDrawing || !stageRef.current) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    if (!point) return;
    const scale = stage.scaleX() || 1;
    setSelectionPoints((prev) => [
      ...prev,
      { x: point.x / scale, y: point.y / scale },
    ]);
  };

  const handleFinishSelection = () => {
    if (selectionPoints.length < 2) return;
    const minX = Math.min(...selectionPoints.map((p) => p.x));
    const minY = Math.min(...selectionPoints.map((p) => p.y));
    const maxX = Math.max(...selectionPoints.map((p) => p.x));
    const maxY = Math.max(...selectionPoints.map((p) => p.y));
    setPendingZonePosition({
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
    });
    setIsDialogOpen(true);
    setIsDrawing(false);
    setIsAddZoneMode(false);
  };

  const handleCancelSelection = () => {
    setSelectionPoints([]);
    setIsDrawing(false);
    setIsAddZoneMode(false);
  };

  // ── Helper: build CreateZonePayload from a zone + its selection points ──────
  const buildZonePayload = (
    zone: Zone,
    points: Array<{ x: number; y: number }>
  ) => {
    // boundaries: array of "x,y" strings (use selection points if available,
    // otherwise derive the 4 corners of the bounding rect)
    const boundaryPoints =
      points.length >= 2
        ? points
        : [
            { x: zone.x, y: zone.y },
            { x: zone.x + zone.w, y: zone.y },
            { x: zone.x + zone.w, y: zone.y + zone.h },
            { x: zone.x, y: zone.y + zone.h },
          ];
    return {
      name: zone.name,
      color: zone.color,
      boundaries: boundaryPoints.map((p) => `${p.x},${p.y}`),
      floor: zone.floor,
    };
  };

  const handleCreateZone = async () => {
    if (!pendingZonePosition || !newZoneName.trim()) return;

    const boundaryPoints =
      selectionPoints.length >= 2
        ? selectionPoints
        : [
            { x: pendingZonePosition.x, y: pendingZonePosition.y },
            {
              x: pendingZonePosition.x + pendingZonePosition.w,
              y: pendingZonePosition.y,
            },
            {
              x: pendingZonePosition.x + pendingZonePosition.w,
              y: pendingZonePosition.y + pendingZonePosition.h,
            },
            {
              x: pendingZonePosition.x,
              y: pendingZonePosition.y + pendingZonePosition.h,
            },
          ];

    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      type: newZoneType,
      area: Math.round(pendingZonePosition.w * pendingZonePosition.h),
      capacity: 0,
      status: 'Active',
      floor: activeFloorTab,
      description: '',
      color: 'bg-red-200',
      boundaries: boundaryPoints,
      x: pendingZonePosition.x,
      y: pendingZonePosition.y,
      w: pendingZonePosition.w,
      h: pendingZonePosition.h,
      isDefined: true,
    };

    // Add to local store immediately for instant UI feedback
    addZone(newZone);
    setSelectedZoneId(newZone.id);
    setNewZoneName('');
    setNewZoneType('Room');
    setPendingZonePosition(null);
    setSelectionPoints([]);
    setIsDialogOpen(false);

    // Save to API in the background
    if (floorPlanId) {
      setIsSaving(true);
      setSaveError(null);
      try {
        const payload = buildZonePayload(newZone, boundaryPoints);
        await floorPlanService.addZone(floorPlanId, payload);
        savedZoneIdsRef.current.add(newZone.id);
        await refetch();
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to save zone to server';
        setSaveError(message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (floorPlanId && savedZoneIdsRef.current.has(zoneId)) {
      try {
        await floorPlanService.removeZone(floorPlanId, zoneId);
        savedZoneIdsRef.current.delete(zoneId);
      } catch (err: any) {
        console.error('Failed to delete zone from server:', err);
      }
    }
    removeZone(zoneId);
    if (selectedZoneId === zoneId) setSelectedZoneId(null);
  };

  const handleClearAllZones = async () => {
    if (zones.length === 0) return;
    if (
      !window.confirm(
        'Are you sure you want to clear all zones? This will also remove them from the server.'
      )
    ) {
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      if (floorPlanId) {
        for (const zone of zones) {
          if (savedZoneIdsRef.current.has(zone.id)) {
            try {
              await floorPlanService.removeZone(floorPlanId, zone.id);
              savedZoneIdsRef.current.delete(zone.id);
            } catch (e) {
              console.warn(`Could not delete zone ${zone.id} on backend:`, e);
            }
          }
        }
      }
      setZones([]);
      setSelectedZoneId(null);
      await refetch();
    } catch (err: any) {
      setSaveError('Failed to clear some zones from the server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAddZone = () => {
    setIsAddZoneMode(false);
    setIsDialogOpen(false);
    setPendingZonePosition(null);
    setSelectionPoints([]);
    setIsDrawing(false);
    setNewZoneName('');
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalZones = currentFloorZones.length;
  // (no auto-detected stats — all zones are user-created)

  // ── Guards ────────────────────────────────────────────────────────────────

  if (isLoadingFloorPlan) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Loading floor plan data...
        </span>
      </div>
    );
  }

  if (!floorPlanId) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="text-sm text-amber-700 font-medium">
          Floor plan ID is missing. Please go back and create a floor plan
          first.
        </p>
        <Button variant="outline" onClick={onPrevious}>
          Go Back
        </Button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── No geometry info note ──────────────────────────────────────────── */}
      {!parsedGeometry && !isLoadingFloorPlan && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <Eye className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              No floor plan drawing loaded
            </p>
            <p className="text-xs text-amber-600">
              Go back and upload a DWG/DXF file. The architectural drawing will
              appear as a reference — then draw your zones on top of it.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-amber-700 hover:bg-amber-100"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_1fr]">
        {/* ── Left Panel – Floor Plan Editor ──────────────────────────────── */}
        <div className="space-y-4 min-w-0">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Floor Plan Editor</h3>
              {floorPlan && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {floorPlan.name}
                  {parsedGeometry ? ' · Drawing loaded' : ' · No drawing'}
                </span>
              )}
            </div>

            {/* Floor Tabs */}
            {/* {availableFloors.length > 1 && (
              <Tabs
                value={activeFloorTab}
                onValueChange={setActiveFloorTab}
                className="mb-4"
              >
                <TabsList className="w-full">
                  {availableFloors.map((floor) => {
                    const roomsOnFloor = (parsedGeometry?.rooms ?? []).filter(
                      (r) => r.floor === floor
                    );
                    return (
                      <TabsTrigger
                        key={floor}
                        value={floor}
                        className="flex items-center gap-2 flex-1"
                      >
                        <Layers className="h-3 w-3" />
                        {floor}
                        {roomsOnFloor.length > 0 && (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            )} */}

            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Zoom: {zoomLevel}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFitToView}
                className="h-8"
              >
                <Maximize2 className="mr-1 h-3 w-3" />
                Fit
              </Button>
              <Button
                variant={isAddZoneMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleAddZone}
                className={`h-8 ${isAddZoneMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Zone
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllZones}
                className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                disabled={zones.length === 0 || isSaving}
                title="Clear all zones on this floor plan"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Clear Zones
              </Button>
            </div>

            {/* Drawing instructions */}
            {isAddZoneMode && (
              <div className="mb-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 space-y-2">
                <p className="text-sm text-blue-700 font-medium">
                  {isDrawing
                    ? `Click points on the floor plan (${selectionPoints.length} point${selectionPoints.length !== 1 ? 's' : ''} selected). Click "Finish" when done.`
                    : 'Click "Add Zone" to start drawing.'}
                </p>
                {isDrawing && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleFinishSelection}
                      disabled={selectionPoints.length < 2}
                      className="h-8"
                    >
                      Finish Selection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelSelection}
                      className="h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Canvas */}
            <div
              ref={containerRef}
              className="relative rounded-lg shadow-md border border-gray-200 bg-gray-50 overflow-hidden"
            >
              <FloorPlanCanvas
                zones={currentFloorZones}
                selectedZoneId={selectedZoneId}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                dwgImageUrl={floorPlan?.imageUrl}
                parsedRooms={currentFloorParsedRooms}
                showParsedRooms={false}
                geometry={(parsedGeometry as any) ?? undefined}
                onZoneClick={handleZoneClick}
                onStageClick={handleStageClick}
                stageRef={stageRef as React.RefObject<KonvaStage>}
                isDrawing={isDrawing}
                selectionPoints={selectionPoints}
              />
            </div>
          </div>
        </div>

        {/* ── Right Panel – Zone Properties ───────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Zone Properties</h3>

          {/* Selected zone editor */}
          {selectedZone ? (
            <>
              {/* Info card */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      ROOM_COLOR_PALETTE[
                        currentFloorZones.indexOf(selectedZone) %
                          ROOM_COLOR_PALETTE.length
                      ]
                    } border border-gray-300`}
                  />
                  Selected Zone
                </h4>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Name: </span>
                    {selectedZone.name}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Type: </span>
                    {selectedZone.type}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Area: </span>
                    {selectedZone.area.toFixed(1)} m²
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Floor: </span>
                    {selectedZone.floor}
                  </div>
                </div>
              </div>

              {/* Edit card */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
                <h4 className="text-sm font-semibold">Edit Zone</h4>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Zone Name
                  </label>
                  <Input
                    value={selectedZone.name}
                    onChange={(e) =>
                      updateZone(selectedZone.id, { name: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Zone Type
                  </label>
                  <Select
                    value={selectedZone.type}
                    onValueChange={(value) =>
                      updateZone(selectedZone.id, { type: value })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONE_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    value={selectedZone.description}
                    className="min-h-[70px] text-xs"
                    placeholder="Enter zone description…"
                    onChange={(e) =>
                      updateZone(selectedZone.id, {
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteZone(selectedZone.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Zone
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No zone selected.</p>
              <p className="text-xs text-muted-foreground">
                Click <strong>+ Add Zone</strong> to draw a zone on the floor
                plan, then select it here to edit its name and type.
              </p>
            </div>
          )}

          {/* Zone list */}
          {currentFloorZones.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-muted text-xs font-semibold text-muted-foreground border-b">
                Zones on this floor ({currentFloorZones.length})
              </div>
              <div className="divide-y max-h-[260px] overflow-y-auto">
                {currentFloorZones.map((zone, idx) => (
                  <div
                    key={zone.id}
                    className={`group w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent transition-colors ${
                      zone.id === selectedZoneId ? 'bg-accent' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="flex-1 flex items-center gap-2 min-w-0 text-left"
                    >
                      <span
                        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          DOT_COLORS[idx % DOT_COLORS.length]
                        }`}
                      />
                      <span className="flex-1 truncate font-medium">
                        {zone.name}
                      </span>
                      <span className="text-muted-foreground pr-1">
                        {zone.type}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(zone.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete zone"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-1 text-xs text-muted-foreground">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Floor Statistics
            </h4>
            <div>
              Zones on{' '}
              <span className="font-medium text-foreground">
                {activeFloorTab}
              </span>{' '}
              floor:{' '}
              <span className="font-medium text-foreground">{totalZones}</span>
            </div>
            {totalZones === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Use <strong>+ Add Zone</strong> to draw your first zone.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer Actions ────────────────────────────────────────────────── */}
      {saveError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{saveError}</span>
          <button
            type="button"
            className="ml-auto text-red-400 hover:text-red-600"
            onClick={() => setSaveError(null)}
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center gap-3 border-t pt-4">
        <Button variant="outline" type="button" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          type="button"
          onClick={async () => {
            // Save any zones not yet synced to the API
            if (floorPlanId) {
              const unsaved = currentFloorZones.filter(
                (z) => !savedZoneIdsRef.current.has(z.id)
              );
              if (unsaved.length > 0) {
                setIsSaving(true);
                setSaveError(null);
                try {
                  await Promise.all(
                    unsaved.map((zone) =>
                      floorPlanService
                        .addZone(floorPlanId, buildZonePayload(zone, []))
                        .then(() => savedZoneIdsRef.current.add(zone.id))
                    )
                  );
                } catch (err: any) {
                  const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to save zones';
                  setSaveError(message);
                  setIsSaving(false);
                  return; // Don't navigate if save failed
                } finally {
                  setIsSaving(false);
                }
              }
            }
            onNext();
          }}
          disabled={currentFloorZones.length === 0 || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Next'
          )}
        </Button>
        {currentFloorZones.length === 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            At least one zone is required to continue.
          </p>
        )}
      </div>

      {/* ── Add Zone Dialog ───────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md ">
          <DialogHeader>
            <DialogTitle>Add New Zone</DialogTitle>
            <DialogDescription>
              Name and classify the area you selected on the floor plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="new-zone-name">Zone Name *</Label>
              <Input
                id="new-zone-name"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="e.g. Server Room"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newZoneName.trim())
                    handleCreateZone();
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-zone-type">Zone Type *</Label>
              <Select value={newZoneType} onValueChange={setNewZoneType}>
                <SelectTrigger id="new-zone-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAddZone}>
              Cancel
            </Button>
            <Button onClick={handleCreateZone} disabled={!newZoneName.trim()}>
              Create Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
