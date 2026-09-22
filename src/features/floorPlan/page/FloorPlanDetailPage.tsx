import React, { useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFloorPlan } from '@/features/floorPlan/hooks';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Cpu,
  MapPin,
  Building2,
  Info,
  Edit,
  Box,
  LayoutGrid,
  Columns,
  Power,
  Activity,
} from 'lucide-react';
import FloorPlanCanvas from '@/features/floorPlan/components/FloorPlanCanvas';
import FloorPlan3DViewer from '@/features/floorPlan/components/FloorPlan3DViewer';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import type { Zone } from '@/features/floorPlan/types';
import type { ParsedGeometry } from '@/features/floorPlan/services/floor-plans.api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500 hover:bg-green-600',
  draft: 'bg-amber-500 hover:bg-amber-600',
  archived: 'bg-slate-400 hover:bg-slate-500',
  failed: 'bg-red-500 hover:bg-red-600',
  warning: 'bg-orange-500 hover:bg-orange-600',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Small helper component ───────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right truncate max-w-[170px] capitalize">
        {String(value)}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloorPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stageRef = useRef<KonvaStage>(null);

  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'split'>('3d');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [devicePowerState, setDevicePowerState] = useState<
    Record<string, boolean>
  >({});

  const { data, isLoading, isError, refetch } = useFloorPlan(id);

  const plan = data?.data;

  // Map API zones → local Zone shape so FloorPlanCanvas and 3D viewer can render them
  const zones: Zone[] = useMemo(() => {
    if (!plan?.zones) return [];
    return plan.zones.map((z: any, i: number) => {
      const xs = z.boundaries?.map((b: any) => b.x) ?? [];
      const ys = z.boundaries?.map((b: any) => b.y) ?? [];
      const minX = xs.length ? Math.min(...xs) : 40 + i * 20;
      const maxX = xs.length ? Math.max(...xs) : minX + 120;
      const minY = ys.length ? Math.min(...ys) : 40 + i * 20;
      const maxY = ys.length ? Math.max(...ys) : minY + 80;

      return {
        id: z.id,
        name: z.name,
        type: 'Zone',
        area: 0,
        capacity: 0,
        status: 'active',
        floor: plan.floor ?? 'Ground',
        description: '',
        color: z.color ?? 'bg-blue-200',
        x: minX,
        y: minY,
        w: Math.max(maxX - minX, 80),
        h: Math.max(maxY - minY, 60),
        isDefined: true,
        boundaries: z.boundaries,
      };
    });
  }, [plan]);

  // Normalized devices for 3D visualization and control
  const devices3D = useMemo(() => {
    if (!plan) return [];
    const list: Array<{
      id: string;
      name: string;
      type: string;
      x: number;
      y: number;
    }> = [];

    if (plan.devices && Array.isArray(plan.devices)) {
      plan.devices.forEach((d: any, idx: number) => {
        const pos = d.position || d;
        list.push({
          id: d.deviceId || `dev-${idx}`,
          name: d.name || `Device ${idx + 1}`,
          type: d.type || 'sensor',
          x: Number(pos?.x ?? 120 + (idx % 6) * 110),
          y: Number(pos?.y ?? 100 + Math.floor(idx / 6) * 90),
        });
      });
    } else if (plan.deviceMarkers && Array.isArray(plan.deviceMarkers)) {
      plan.deviceMarkers.forEach((d: any, idx: number) => {
        const pos = d.position || d;
        list.push({
          id: d.deviceId || `dev-${idx}`,
          name: d.name || `Device ${idx + 1}`,
          type: d.type || 'sensor',
          x: Number(pos?.x ?? d.x ?? 120 + (idx % 6) * 110),
          y: Number(pos?.y ?? d.y ?? 100 + Math.floor(idx / 6) * 90),
        });
      });
    }

    return list;
  }, [plan]);

  const toggleDevicePower = (deviceId: string) => {
    setDevicePowerState((prev) => ({
      ...prev,
      [deviceId]: !(prev[deviceId] ?? true),
    }));
  };

  const setAllDevicesPower = (state: boolean) => {
    const next: Record<string, boolean> = {};
    devices3D.forEach((d) => {
      next[d.id] = state;
    });
    setDevicePowerState(next);
  };

  if (isLoading) return <LoadingOverlay />;
  if (isError || !plan)
    return (
      <ErrorMessage
        title="Failed to load floor plan"
        onRetry={() => refetch()}
      />
    );

  const parsedGeometry = plan.parsedGeometry as ParsedGeometry | undefined;
  const statusColor =
    STATUS_COLORS[(plan.status ?? 'draft') as string] ?? STATUS_COLORS.draft;

  const onlineCount = devices3D.filter(
    (d) => devicePowerState[d.id] ?? true
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/floor-plans')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold capitalize">{plan.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              {plan.building && (
                <>
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{plan.building}</span>
                  {plan.floor && <span>&nbsp;· {plan.floor} floor</span>}
                </>
              )}
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('2d')}
              className={`h-8 px-3 text-xs font-medium gap-1.5 transition-all ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              2D Plan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('3d')}
              className={`h-8 px-3 text-xs font-medium gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-cyan-600 dark:text-cyan-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Box className="h-3.5 w-3.5 text-cyan-500" />
              3D Model
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('split')}
              className={`h-8 px-3 text-xs font-medium gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              Split
            </Button>
          </div>

          <Badge className={`${statusColor} text-white capitalize`}>
            {plan.status ?? 'draft'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/floor-plans/create`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Left: Viewers (2D / 3D / Split) ─────────────────────────────── */}
        <div className="space-y-4 min-w-0">
          {/* 2D Canvas View */}
          {(viewMode === '2d' || viewMode === 'split') && (
            <div className="space-y-2">
              {viewMode === 'split' && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    2D Architectural Blueprint
                  </span>
                </div>
              )}
              {/* 2D Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Zoom: {zoomLevel}%
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-white dark:hover:bg-slate-700"
                    onClick={() => setZoomLevel((z) => Math.min(z + 15, 250))}
                    title="Zoom In (+15%)"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-white dark:hover:bg-slate-700"
                    onClick={() => setZoomLevel((z) => Math.max(z - 15, 40))}
                    title="Zoom Out (-15%)"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs font-medium hover:bg-white dark:hover:bg-slate-700"
                    onClick={() => setZoomLevel(100)}
                    title="Fit to 100%"
                  >
                    <Maximize2 className="h-3 w-3 mr-1" />
                    100%
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {[50, 100, 150, 200].map((preset) => (
                    <Button
                      key={preset}
                      variant={zoomLevel === preset ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`h-7 px-2 text-[11px] rounded ${
                        zoomLevel === preset
                          ? 'bg-slate-200 dark:bg-slate-700 font-semibold'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setZoomLevel(preset)}
                    >
                      {preset}%
                    </Button>
                  ))}
                </div>

                {selectedZoneId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs ml-auto"
                    onClick={() => setSelectedZoneId(null)}
                  >
                    Clear selection
                  </Button>
                )}
              </div>

              {/* 2D Konva Stage with High-DPI Vector Canvas */}
              <FloorPlanCanvas
                zones={zones}
                selectedZoneId={selectedZoneId}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                dwgImageUrl={plan.imageUrl}
                parsedRooms={parsedGeometry?.rooms}
                geometry={parsedGeometry as any}
                onZoneClick={(zoneId: string) =>
                  setSelectedZoneId((prev) => (prev === zoneId ? null : zoneId))
                }
                onStageClick={() => {}}
                stageRef={stageRef as React.RefObject<KonvaStage>}
              />

              {!parsedGeometry && !plan.imageUrl && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  No floor plan drawing is attached. Edit this floor plan and
                  upload a DWG/DXF file to see the architectural CAD layout.
                </div>
              )}
            </div>
          )}

          {/* 3D Model View */}
          {(viewMode === '3d' || viewMode === 'split') && (
            <div className="space-y-2">
              {viewMode === 'split' && (
                <div className="flex items-center justify-between px-1 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Box className="h-3.5 w-3.5 text-cyan-500" />
                    3D Digital Twin Simulation
                  </span>
                </div>
              )}
              <FloorPlan3DViewer
                planName={plan.name}
                zones={zones}
                devices={devices3D}
                parsedGeometry={parsedGeometry}
                dimensions={plan.dimensions}
                selectedZoneId={selectedZoneId}
                onZoneSelect={setSelectedZoneId}
                devicePowerState={devicePowerState}
                onToggleDevice={toggleDevicePower}
              />
            </div>
          )}
        </div>

        {/* ── Right: Info sidebar ────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Interactive IoT Devices Controls card */}
          <Card className="border-cyan-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                  <Cpu className="h-4 w-4 text-cyan-600" />
                  <span>IoT Devices Control</span>
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  {onlineCount} / {devices3D.length} Online
                </Badge>
              </div>
              {devices3D.length > 0 && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Click device or toggle power
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px] text-emerald-600 hover:bg-emerald-50"
                      onClick={() => setAllDevicesPower(true)}
                    >
                      All ON
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px] text-rose-600 hover:bg-rose-50"
                      onClick={() => setAllDevicesPower(false)}
                    >
                      All OFF
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {devices3D.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No devices attached to this floor plan.
                </p>
              ) : (
                <ul className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {devices3D.map((device) => {
                    const isOn = devicePowerState[device.id] ?? true;
                    return (
                      <li
                        key={device.id}
                        className={`flex items-center justify-between gap-2 rounded-lg p-2 text-xs border transition-all ${
                          isOn
                            ? 'bg-emerald-50/50 border-emerald-200/80 dark:bg-emerald-950/20'
                            : 'bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              isOn
                                ? 'bg-emerald-500 shadow-sm shadow-emerald-400'
                                : 'bg-slate-400'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate text-foreground">
                              {device.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground capitalize">
                              {device.type}
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleDevicePower(device.id)}
                          className={`h-7 px-2 text-[11px] gap-1 font-medium ${
                            isOn
                              ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50'
                              : 'text-slate-600 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800'
                          }`}
                          title={`Toggle ${device.name}`}
                        >
                          <Power className="h-3 w-3" />
                          {isOn ? 'ON' : 'OFF'}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Zones card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Zones
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {zones.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {zones.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No zones defined yet.
                </p>
              ) : (
                <ul className="space-y-1 max-h-[220px] overflow-y-auto">
                  {zones.map((zone) => (
                    <li key={zone.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedZoneId((prev) =>
                            prev === zone.id ? null : zone.id
                          )
                        }
                        className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent ${
                          selectedZoneId === zone.id
                            ? 'bg-accent font-semibold'
                            : ''
                        }`}
                      >
                        <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="flex-1 truncate">{zone.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Details card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Name" value={plan.name} />
              {plan.building && <Row label="Building" value={plan.building} />}
              {plan.floor && <Row label="Floor" value={plan.floor} />}
              {plan.category && <Row label="Category" value={plan.category} />}
              <Row label="Scale" value={plan.scale ?? '1:100'} />
              {plan.dimensions && (
                <Row
                  label="Dimensions"
                  value={`${plan.dimensions.width} × ${plan.dimensions.height}`}
                />
              )}
              <Row label="Created" value={fmtDate(plan.createdAt)} />
              <Row label="Last updated" value={fmtDate(plan.updatedAt)} />
              {plan.description && (
                <div className="pt-1 border-t text-xs text-muted-foreground">
                  {plan.description}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => navigate('/floor-plans/create')}
            >
              <Layers className="h-4 w-4 mr-2" />
              Create New Floor Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/floor-plans')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Floor Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
