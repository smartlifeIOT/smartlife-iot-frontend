import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Line,
  Circle as KonvaCircle,
  Shape,
  Image as KonvaImage,
} from 'react-konva';
import type { Zone } from '@/features/floorPlan/types';
import type { ParsedGeometry } from '@/features/floorPlan/services/floor-plans.api';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import { useState, useEffect, useMemo, useRef } from 'react';

// ─── raw geometry types ──────────────────────────────────────────────────────

export interface GeoPoint {
  x: number;
  y: number;
  z?: number;
}

export interface WallEntity {
  id: string;
  layer?: string;
  start?: GeoPoint;
  end?: GeoPoint;
  points?: GeoPoint[];
  vertices?: GeoPoint[];
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  thickness?: number;
  height?: number;
  material?: string;
}

export interface DoorSwing {
  center: GeoPoint;
  radius: number;
  startAngle: number;
  endAngle: number;
}

export interface DoorEntity {
  id: string;
  layer?: string;
  position?: GeoPoint;
  start?: GeoPoint;
  end?: GeoPoint;
  width?: number;
  height?: number;
  rotation?: number;
  swing?: DoorSwing;
}

export interface WindowEntity {
  id: string;
  layer?: string;
  start?: GeoPoint;
  end?: GeoPoint;
  position?: GeoPoint;
  width?: number;
  height?: number;
  rotation?: number;
  points?: GeoPoint[];
  vertices?: GeoPoint[];
}

export interface ArcEntity {
  id: string;
  layer?: string;
  center?: GeoPoint;
  position?: GeoPoint;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface CircleEntity {
  id: string;
  layer?: string;
  center?: GeoPoint;
  position?: GeoPoint;
  radius?: number;
}

export interface TextEntity {
  id: string;
  layer?: string;
  text: string;
  position: GeoPoint;
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width?: number;
  height?: number;
}

export interface FullParsedGeometry {
  rooms?: ParsedGeometry['rooms'];
  walls?: any[];
  doors?: any[];
  windows?: any[];
  arcs?: any[];
  circles?: any[];
  texts?: any[];
  lines?: any[];
  polylines?: any[];
  entities?: any[];
  boundingBox?: any;
  bounds?: any;
  units?: string;
  geometry?: any;
  data?: any;
}

// ─── Normalized internal structures ──────────────────────────────────────────

interface NormalizedWall {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  thickness?: number;
}

interface NormalizedWindow {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

interface NormalizedDoor {
  id: string;
  center: { x: number; y: number };
  radius: number;
  startAngle: number;
  endAngle: number;
  hasSwing: boolean;
}

interface NormalizedCircle {
  id: string;
  center: { x: number; y: number };
  radius: number;
}

interface NormalizedArc {
  id: string;
  center: { x: number; y: number };
  radius: number;
  startAngle: number;
  endAngle: number;
}

interface NormalizedRoom {
  id: string;
  name?: string;
  boundaries: Array<{ x: number; y: number }>;
}

// ─── Safe Extraction Utilities ───────────────────────────────────────────────

function safeNumber(n: any): number | null {
  if (typeof n === 'number' && !isNaN(n) && isFinite(n)) return n;
  if (typeof n === 'string') {
    const p = parseFloat(n);
    if (!isNaN(p) && isFinite(p)) return p;
  }
  return null;
}

function extractPoint(p: any): { x: number; y: number } | null {
  if (!p) return null;
  const x = safeNumber(p.x ?? p.X ?? (Array.isArray(p) ? p[0] : undefined));
  const y = safeNumber(p.y ?? p.Y ?? (Array.isArray(p) ? p[1] : undefined));
  if (x !== null && y !== null) {
    return { x, y };
  }
  return null;
}

function extractBounds(box: any): BBox | null {
  if (!box) return null;
  const minX = safeNumber(
    box.minX ??
      box.xMin ??
      box.min?.x ??
      (Array.isArray(box.min) ? box.min[0] : undefined) ??
      box.left
  );
  const minY = safeNumber(
    box.minY ??
      box.yMin ??
      box.min?.y ??
      (Array.isArray(box.min) ? box.min[1] : undefined) ??
      box.top
  );
  const maxX = safeNumber(
    box.maxX ??
      box.xMax ??
      box.max?.x ??
      (Array.isArray(box.max) ? box.max[0] : undefined) ??
      box.right
  );
  const maxY = safeNumber(
    box.maxY ??
      box.yMax ??
      box.max?.y ??
      (Array.isArray(box.max) ? box.max[1] : undefined) ??
      box.bottom
  );

  if (
    minX !== null &&
    maxX !== null &&
    minY !== null &&
    maxY !== null &&
    minX < maxX &&
    minY < maxY
  ) {
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }
  return null;
}

/** Filter extreme outliers (e.g. stray CAD points at origin or 10,000 meters away) */
function filterOutliers(
  pts: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> {
  if (pts.length < 8) return pts;
  const xs = pts.map((p) => p.x).sort((a, b) => a - b);
  const ys = pts.map((p) => p.y).sort((a, b) => a - b);

  const q1X = xs[Math.floor(xs.length * 0.05)];
  const q3X = xs[Math.floor(xs.length * 0.95)];
  const spanX = q3X - q1X;

  const q1Y = ys[Math.floor(ys.length * 0.05)];
  const q3Y = ys[Math.floor(ys.length * 0.95)];
  const spanY = q3Y - q1Y;

  if (spanX > 0.001 || spanY > 0.001) {
    const minXLimit = q1X - 2.5 * (spanX || 100);
    const maxXLimit = q3X + 2.5 * (spanX || 100);
    const minYLimit = q1Y - 2.5 * (spanY || 100);
    const maxYLimit = q3Y + 2.5 * (spanY || 100);

    const filtered = pts.filter(
      (p) =>
        p.x >= minXLimit &&
        p.x <= maxXLimit &&
        p.y >= minYLimit &&
        p.y <= maxYLimit
    );
    if (filtered.length >= 4) return filtered;
  }
  return pts;
}

export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
  worldH: number;
}

export function computeTransform(
  points: Array<{ x: number; y: number }>,
  boxFallback: BBox | null,
  stageWidth: number,
  stageHeight: number
): Transform {
  let box: BBox | null = null;

  if (points.length >= 2) {
    const cleanPts = filterOutliers(points);
    const xs = cleanPts.map((p) => p.x);
    const ys = cleanPts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
      box = { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }
  }

  if (!box && boxFallback) {
    box = boxFallback;
  }

  if (!box) {
    return { scale: 1, offsetX: 0, offsetY: 0, worldH: stageHeight };
  }

  const rawW = box.maxX - box.minX;
  const rawH = box.maxY - box.minY;
  const worldW = rawW > 0.0001 ? rawW : 10;
  const worldH = rawH > 0.0001 ? rawH : 10;

  const padding = 0.88; // 88% of canvas for comfortable margins
  const scaleX = (stageWidth * padding) / worldW;
  const scaleY = (stageHeight * padding) / worldH;
  let scale = Math.min(scaleX, scaleY);

  if (!isFinite(scale) || scale <= 0) scale = 1;

  const scaledW = worldW * scale;
  const scaledH = worldH * scale;
  let offsetX = (stageWidth - scaledW) / 2 - box.minX * scale;
  let offsetY = (stageHeight - scaledH) / 2;

  if (!isFinite(offsetX)) offsetX = 0;
  if (!isFinite(offsetY)) offsetY = 0;

  const worldHValue = box.minY + worldH;

  return { scale, offsetX, offsetY, worldH: worldHValue };
}

export function toCanvasPoint(
  pt: { x: number; y: number },
  transform: Transform
) {
  return {
    x: pt.x * transform.scale + transform.offsetX,
    y: (transform.worldH - pt.y) * transform.scale + transform.offsetY,
  };
}

export function isPointInPolygon(
  pt: { x: number; y: number },
  poly: Array<{ x: number; y: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const ZONE_COLORS: Record<string, string> = {
  Room: '#93C5FD',
  Office: '#FCD34D',
  Lobby: '#86EFAC',
  Corridor: '#C4B5FD',
  Storage: '#FCA5A5',
  Default: '#E5E7EB',
};

const TAILWIND_COLOR_MAP: Record<string, string> = {
  'bg-red-200': '#FECACA',
  'bg-red-500': '#EF4444',
  'bg-blue-200': '#BFDBFE',
  'bg-blue-500': '#3B82F6',
  'bg-green-200': '#BBF7D0',
  'bg-green-500': '#22C55E',
  'bg-yellow-200': '#FEF08A',
  'bg-yellow-500': '#EAB308',
  'bg-purple-200': '#E9D5FF',
  'bg-purple-500': '#A855F7',
  'bg-cyan-200': '#A5F3FC',
  'bg-cyan-500': '#06B6D4',
  'bg-pink-200': '#FBCFE8',
  'bg-pink-500': '#EC4899',
  'bg-lime-200': '#D9F99D',
  'bg-lime-500': '#84CC16',
};

function resolveZoneColor(color?: string, type?: string): string {
  if (color) {
    if (color.startsWith('#') || color.startsWith('rgb')) return color;
    if (TAILWIND_COLOR_MAP[color]) return TAILWIND_COLOR_MAP[color];
  }
  if (type && ZONE_COLORS[type]) return ZONE_COLORS[type];
  return '#6366F1';
}

// ─── Procedural Natural Oak Hardwood Floor Pattern ───────────────────────────

function createWoodFloorPattern(): HTMLImageElement | null {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const plankH = 32;
  const rows = size / plankH;
  const woodTones = [
    '#D7B48C',
    '#CFA980',
    '#DEBD97',
    '#C8A076',
    '#E2C4A0',
    '#CE9D70',
    '#D9B892',
    '#C4986C',
  ];

  for (let r = 0; r < rows; r++) {
    const y = r * plankH;
    const rowOffset = (r % 3) * 80;
    const plankW = 120;
    const cols = Math.ceil((size + rowOffset) / plankW) + 1;

    for (let c = 0; c < cols; c++) {
      const x = c * plankW - (rowOffset % plankW);
      const toneIdx = Math.abs(
        Math.floor(Math.sin(r * 13.7 + c * 31.9) * 43758.54)
      ) % woodTones.length;

      ctx.fillStyle = woodTones[toneIdx];
      ctx.fillRect(x, y, plankW, plankH);

      // Fine wood grain streaks
      for (let g = 0; g < 4; g++) {
        const gy = y + 4 + g * 6;
        ctx.strokeStyle = g % 2 === 0 ? 'rgba(100, 65, 30, 0.08)' : 'rgba(255, 245, 230, 0.12)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.bezierCurveTo(
          x + plankW * 0.3,
          gy + ((g % 2) - 0.5) * 2,
          x + plankW * 0.7,
          gy - ((g % 2) - 0.5) * 2,
          x + plankW,
          gy
        );
        ctx.stroke();
      }

      // Plank joint borders
      ctx.strokeStyle = 'rgba(75, 45, 20, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, plankW - 1, plankH - 1);
    }
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

let cachedWoodFloorImage: HTMLImageElement | null = null;
function getCachedWoodFloorImage(): HTMLImageElement | null {
  if (!cachedWoodFloorImage && typeof document !== 'undefined') {
    cachedWoodFloorImage = createWoodFloorPattern();
  }
  return cachedWoodFloorImage;
}

// ─── types ───────────────────────────────────────────────────────────────────

export interface FloorPlanCanvasProps {
  zones: Zone[];
  selectedZoneId: string | null;
  zoomLevel: number;
  dwgImageUrl?: string;
  parsedRooms?: ParsedGeometry['rooms'];
  showParsedRooms?: boolean;
  geometry?: FullParsedGeometry;
  onZoneClick: (zoneId: string) => void;
  onStageClick?: () => void;
  stageRef: React.RefObject<KonvaStage | null>;
  isDrawing?: boolean;
  selectionPoints?: Array<{ x: number; y: number }>;
  onDwgError?: (hasError: boolean) => void;
  assignedDevices?: Record<string, any[]>;
  children?: React.ReactNode;
  onZoomChange?: (newZoom: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  zones,
  selectedZoneId,
  zoomLevel,
  dwgImageUrl,
  parsedRooms,
  showParsedRooms = false,
  geometry,
  onZoneClick,
  onStageClick,
  stageRef,
  isDrawing = false,
  selectionPoints = [],
  children,
  onZoomChange,
}) => {
  const [dwgImage, setDwgImage] = useState<HTMLImageElement | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [floorTextureImage, setFloorTextureImage] = useState<HTMLImageElement | null>(() => getCachedWoodFloorImage());

  useEffect(() => {
    const img = getCachedWoodFloorImage();
    if (img) {
      if (img.complete) {
        setFloorTextureImage(img);
      } else {
        img.onload = () => setFloorTextureImage(img);
      }
    }
  }, []);

  // Detect theme reactively
  useEffect(() => {
    const checkDark = () => {
      const dark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(dark);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const stageWidth = 800;
  const stageHeight = 500;
  const userScale = Math.max(0.3, zoomLevel / 100);
  const scaledWidth = Math.round(stageWidth * userScale);
  const scaledHeight = Math.round(stageHeight * userScale);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing) return;
    if (e.button === 0 || e.button === 1) {
      if (viewportRef.current) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          scrollLeft: viewportRef.current.scrollLeft,
          scrollTop: viewportRef.current.scrollTop,
        };
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !viewportRef.current) return;
    e.preventDefault();
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    viewportRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    viewportRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (onZoomChange) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      const nextZoom = Math.max(40, Math.min(250, zoomLevel + delta));
      onZoomChange(nextZoom);
    }
  };

  useEffect(() => {
    if (!dwgImageUrl) {
      setDwgImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setDwgImage(img);
    img.onerror = () => setDwgImage(null);
    img.src = dwgImageUrl;
  }, [dwgImageUrl]);

  // ── Unwrap nested geometry payload ─────────────────────────────────────────
  const activeGeometry = useMemo(() => {
    if (!geometry) return undefined;
    return (
      (geometry as any).geometry ??
      (geometry as any).data ??
      (geometry as any).parsedGeometry ??
      geometry
    );
  }, [geometry]);

  // ── Normalize Walls ────────────────────────────────────────────────────────
  const normalizedWalls = useMemo<NormalizedWall[]>(() => {
    const result: NormalizedWall[] = [];
    const rawWalls = activeGeometry?.walls ?? [];

    rawWalls.forEach((w: any, idx: number) => {
      // Direct start / end
      const pStart = extractPoint(w.start);
      const pEnd = extractPoint(w.end);
      if (pStart && pEnd) {
        result.push({
          id: String(w.id ?? `wall-${idx}`),
          start: pStart,
          end: pEnd,
          thickness: safeNumber(w.thickness) ?? 0.1,
        });
        return;
      }

      // points array
      if (Array.isArray(w.points) && w.points.length >= 2) {
        for (let i = 0; i < w.points.length - 1; i++) {
          const p1 = extractPoint(w.points[i]);
          const p2 = extractPoint(w.points[i + 1]);
          if (p1 && p2) {
            result.push({
              id: `${w.id ?? idx}-seg-${i}`,
              start: p1,
              end: p2,
              thickness: safeNumber(w.thickness) ?? 0.1,
            });
          }
        }
        return;
      }

      // vertices array
      if (Array.isArray(w.vertices) && w.vertices.length >= 2) {
        for (let i = 0; i < w.vertices.length - 1; i++) {
          const p1 = extractPoint(w.vertices[i]);
          const p2 = extractPoint(w.vertices[i + 1]);
          if (p1 && p2) {
            result.push({
              id: `${w.id ?? idx}-vert-${i}`,
              start: p1,
              end: p2,
              thickness: safeNumber(w.thickness) ?? 0.1,
            });
          }
        }
        return;
      }

      // x1, y1, x2, y2 coordinates
      const p1 = extractPoint({ x: w.x1, y: w.y1 });
      const p2 = extractPoint({ x: w.x2, y: w.y2 });
      if (p1 && p2) {
        result.push({
          id: String(w.id ?? `wall-${idx}`),
          start: p1,
          end: p2,
          thickness: safeNumber(w.thickness) ?? 0.1,
        });
      }
    });

    // Fallback: If no walls found, check lines, polylines, or raw entities
    if (result.length === 0) {
      const rawLines = activeGeometry?.lines ?? [];
      rawLines.forEach((line: any, idx: number) => {
        const p1 = extractPoint(line.start ?? line.vertices?.[0]);
        const p2 = extractPoint(line.end ?? line.vertices?.[1]);
        if (p1 && p2) {
          result.push({
            id: String(line.id ?? `line-${idx}`),
            start: p1,
            end: p2,
            thickness: 0.15,
          });
        }
      });

      const rawPolylines = activeGeometry?.polylines ?? [];
      rawPolylines.forEach((poly: any, idx: number) => {
        const pts = (poly.points ?? poly.vertices ?? [])
          .map(extractPoint)
          .filter(Boolean);
        for (let i = 0; i < pts.length - 1; i++) {
          result.push({
            id: `poly-${idx}-${i}`,
            start: pts[i]!,
            end: pts[i + 1]!,
            thickness: 0.15,
          });
        }
      });

      const rawEntities = activeGeometry?.entities ?? [];
      rawEntities.forEach((entity: any, idx: number) => {
        if (entity.type === 'LINE' && entity.vertices?.length >= 2) {
          const p1 = extractPoint(entity.vertices[0]);
          const p2 = extractPoint(entity.vertices[1]);
          if (p1 && p2) {
            result.push({
              id: `entity-line-${idx}`,
              start: p1,
              end: p2,
              thickness: 0.2,
            });
          }
        } else if (
          (entity.type === 'POLYLINE' || entity.type === 'LWPOLYLINE') &&
          entity.vertices?.length >= 2
        ) {
          for (let i = 0; i < entity.vertices.length - 1; i++) {
            const p1 = extractPoint(entity.vertices[i]);
            const p2 = extractPoint(entity.vertices[i + 1]);
            if (p1 && p2) {
              result.push({
                id: `entity-poly-${idx}-${i}`,
                start: p1,
                end: p2,
                thickness: 0.2,
              });
            }
          }
        }
      });
    }

    return result;
  }, [activeGeometry]);

  // ── Normalize Windows ──────────────────────────────────────────────────────
  const normalizedWindows = useMemo<NormalizedWindow[]>(() => {
    const result: NormalizedWindow[] = [];
    const rawWindows = activeGeometry?.windows ?? [];

    rawWindows.forEach((win: any, idx: number) => {
      const pStart = extractPoint(win.start);
      const pEnd = extractPoint(win.end);
      if (pStart && pEnd) {
        result.push({
          id: String(win.id ?? `win-${idx}`),
          start: pStart,
          end: pEnd,
        });
        return;
      }

      const pos = extractPoint(win.position);
      if (pos) {
        const width = safeNumber(win.width) ?? 1.2;
        const rot = safeNumber(win.rotation) ?? 0;
        const halfW = width / 2;
        result.push({
          id: String(win.id ?? `win-${idx}`),
          start: {
            x: pos.x - halfW * Math.cos(rot),
            y: pos.y - halfW * Math.sin(rot),
          },
          end: {
            x: pos.x + halfW * Math.cos(rot),
            y: pos.y + halfW * Math.sin(rot),
          },
        });
        return;
      }

      if (Array.isArray(win.points) && win.points.length >= 2) {
        const p1 = extractPoint(win.points[0]);
        const p2 = extractPoint(win.points[1]);
        if (p1 && p2) {
          result.push({
            id: String(win.id ?? `win-${idx}`),
            start: p1,
            end: p2,
          });
        }
      }
    });

    return result;
  }, [activeGeometry]);

  // ── Normalize Doors ────────────────────────────────────────────────────────
  const normalizedDoors = useMemo<NormalizedDoor[]>(() => {
    const result: NormalizedDoor[] = [];
    const rawDoors = activeGeometry?.doors ?? [];

    rawDoors.forEach((door: any, idx: number) => {
      if (door.swing) {
        const center =
          extractPoint(door.swing.center) ?? extractPoint(door.position);
        if (center) {
          result.push({
            id: String(door.id ?? `door-${idx}`),
            center,
            radius:
              safeNumber(door.swing.radius) ?? safeNumber(door.width) ?? 0.9,
            startAngle: safeNumber(door.swing.startAngle) ?? 0,
            endAngle: safeNumber(door.swing.endAngle) ?? Math.PI / 2,
            hasSwing: true,
          });
          return;
        }
      }

      const pos = extractPoint(door.position);
      if (pos) {
        const rot = safeNumber(door.rotation) ?? 0;
        result.push({
          id: String(door.id ?? `door-${idx}`),
          center: pos,
          radius: safeNumber(door.width) ?? 0.9,
          startAngle: rot,
          endAngle: rot + Math.PI / 2,
          hasSwing: true,
        });
        return;
      }

      const pStart = extractPoint(door.start);
      const pEnd = extractPoint(door.end);
      if (pStart && pEnd) {
        const dx = pEnd.x - pStart.x;
        const dy = pEnd.y - pStart.y;
        result.push({
          id: String(door.id ?? `door-${idx}`),
          center: pStart,
          radius: Math.sqrt(dx * dx + dy * dy) || 0.9,
          startAngle: Math.atan2(dy, dx),
          endAngle: Math.atan2(dy, dx) + Math.PI / 2,
          hasSwing: false,
        });
      }
    });

    return result;
  }, [activeGeometry]);

  // ── Normalize Circles & Arcs ───────────────────────────────────────────────
  const normalizedCircles = useMemo<NormalizedCircle[]>(() => {
    const result: NormalizedCircle[] = [];
    const rawCircles = activeGeometry?.circles ?? [];

    rawCircles.forEach((c: any, idx: number) => {
      const center = extractPoint(c.center ?? c.position);
      const radius = safeNumber(c.radius);
      if (center && radius && radius > 0) {
        result.push({
          id: String(c.id ?? `circ-${idx}`),
          center,
          radius,
        });
      }
    });

    return result;
  }, [activeGeometry]);

  const normalizedArcs = useMemo<NormalizedArc[]>(() => {
    const result: NormalizedArc[] = [];
    const rawArcs = activeGeometry?.arcs ?? [];

    rawArcs.forEach((a: any, idx: number) => {
      const center = extractPoint(a.center ?? a.position);
      const radius = safeNumber(a.radius);
      if (center && radius && radius > 0) {
        result.push({
          id: String(a.id ?? `arc-${idx}`),
          center,
          radius,
          startAngle: safeNumber(a.startAngle) ?? 0,
          endAngle: safeNumber(a.endAngle) ?? Math.PI,
        });
      }
    });

    return result;
  }, [activeGeometry]);

  // ── Normalize Rooms ────────────────────────────────────────────────────────
  const validRooms = useMemo<NormalizedRoom[]>(() => {
    const candidates =
      parsedRooms && parsedRooms.length > 0
        ? parsedRooms
        : (activeGeometry?.rooms ?? []);

    return candidates
      .map((r: any, idx: number) => {
        const rawBounds = r.boundaries ?? r.points ?? r.polygon ?? [];
        const cleanBoundaries = Array.isArray(rawBounds)
          ? rawBounds
              .map(extractPoint)
              .filter((p): p is { x: number; y: number } => p !== null)
          : [];
        return {
          id: String(r.id ?? `room-${idx}`),
          name: r.name,
          boundaries: cleanBoundaries,
        };
      })
      .filter(
        (r: {
          id: string;
          name?: string;
          boundaries: Array<{ x: number; y: number }>;
        }) => r.boundaries.length >= 3
      );
  }, [parsedRooms, activeGeometry]);

  // ── Collect all coordinate points for BBox ─────────────────────────────────
  const allGeometryPoints = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];

    validRooms.forEach((r) => r.boundaries.forEach((p) => pts.push(p)));
    normalizedWalls.forEach((w) => {
      pts.push(w.start);
      pts.push(w.end);
    });
    normalizedWindows.forEach((win) => {
      pts.push(win.start);
      pts.push(win.end);
    });
    normalizedDoors.forEach((d) => {
      pts.push(d.center);
      pts.push({ x: d.center.x + d.radius, y: d.center.y });
      pts.push({ x: d.center.x - d.radius, y: d.center.y });
    });
    normalizedCircles.forEach((c) => {
      pts.push({ x: c.center.x - c.radius, y: c.center.y - c.radius });
      pts.push({ x: c.center.x + c.radius, y: c.center.y + c.radius });
    });
    normalizedArcs.forEach((a) => {
      pts.push({ x: a.center.x - a.radius, y: a.center.y - a.radius });
      pts.push({ x: a.center.x + a.radius, y: a.center.y + a.radius });
    });

    return pts;
  }, [
    validRooms,
    normalizedWalls,
    normalizedWindows,
    normalizedDoors,
    normalizedCircles,
    normalizedArcs,
  ]);

  const fallbackBox = useMemo(() => {
    return (
      extractBounds(activeGeometry?.boundingBox) ??
      extractBounds(activeGeometry?.bounds) ??
      null
    );
  }, [activeGeometry]);

  const { scale, offsetX, offsetY, worldH } = useMemo(
    () =>
      computeTransform(allGeometryPoints, fallbackBox, stageWidth, stageHeight),
    [allGeometryPoints, fallbackBox]
  );

  /** Convert a raw geometry point to canvas pixels safely */
  const toCanvas = (pt: { x: number; y: number } | null | undefined) => {
    if (!pt) return { x: 0, y: 0 };
    const px = safeNumber(pt.x);
    const py = safeNumber(pt.y);
    if (px === null || py === null) return { x: 0, y: 0 };
    return {
      x: px * scale + offsetX,
      y: (worldH - py) * scale + offsetY,
    };
  };

  const cadElementCount =
    normalizedWalls.length +
    normalizedWindows.length +
    normalizedDoors.length +
    normalizedCircles.length +
    normalizedArcs.length +
    validRooms.length;

  const hasAnyGeometry = cadElementCount > 0;

  /** Map CAD thickness to crisp, balanced screen line width */
  const getWallStrokeWidth = (thickness?: number): number => {
    const t = safeNumber(thickness) ?? 0.1;

    // Standard CAD lineweights / normalized values (e.g. 0.05, 0.1, 0.15, 0.2, 0.3)
    if (t < 1) {
      // 0.05 -> 0.4px (hairline)
      // 0.10 -> 0.55px (crisp CAD detail / hatch)
      // 0.15 -> 0.75px (standard interior)
      // 0.20 -> 0.95px (walls)
      // 0.30 -> 1.3px (bearing walls)
      return Math.max(0.4, Math.min(1.8, t * 5.5));
    }

    // Millimeter lineweights (e.g. 100mm, 200mm, 300mm)
    if (t >= 10) {
      const scaled = t * scale;
      return Math.max(0.5, Math.min(2.0, scaled));
    }

    return Math.max(0.4, Math.min(1.8, t));
  };

  // ── High-contrast theme-aware colors ───────────────────────────────────────
  const wallStroke = isDark ? '#F1F5F9' : '#0F172A';
  const windowStroke = isDark ? '#38BDF8' : '#0284C7';
  const doorStroke = isDark ? '#FBBF24' : '#D97706';
  const circleStroke = isDark ? '#CBD5E1' : '#475569';
  const arcStroke = isDark ? '#94A3B8' : '#64748B';
  const roomStroke = isDark ? '#60A5FA' : '#2563EB';
  const gridMajor = isDark ? '#334155' : 'rgba(255, 255, 255, 0.5)';
  const gridMinor = isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.25)';
  const canvasBg = isDark ? '#1E242B' : '#D2AB7E';

  return (
    <div
      ref={viewportRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full max-w-full min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 select-none shadow-sm transition-colors"
      style={{
        maxHeight: '580px',
        height: '550px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        cursor: isDrawing ? 'crosshair' : isPanning ? 'grabbing' : 'grab',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          flexShrink: 0,
        }}
      >
        <Stage
          ref={stageRef}
          width={scaledWidth}
          height={scaledHeight}
          scaleX={userScale}
          scaleY={userScale}
          pixelRatio={Math.max(window.devicePixelRatio || 1, 2)}
          onClick={onStageClick}
          style={{
            display: 'block',
          }}
        >
          <Layer>
            {/* ── Stage Background (Natural Oak Hardwood Floor Pattern) ────── */}
            <Rect
              x={0}
              y={0}
              width={stageWidth}
              height={stageHeight}
              fill={canvasBg}
              fillPatternImage={floorTextureImage || undefined}
              fillPatternRepeat="repeat"
              fillPatternScale={{ x: 0.65, y: 0.65 }}
              fillPatternOpacity={isDark ? 0.35 : 1}
              listening={false}
            />

            {/* ── Architectural Blueprint CAD Grid ────────────────────────── */}
            <Group opacity={isDark ? 0.35 : 0.6}>
              {Array.from({ length: Math.ceil(stageWidth / 25) + 1 }).map(
                (_, i) => (
                  <Line
                    key={`grid-v-${i}`}
                    points={[i * 25, 0, i * 25, stageHeight]}
                    stroke={i % 4 === 0 ? gridMajor : gridMinor}
                    strokeWidth={i % 4 === 0 ? 0.75 : 0.35}
                    listening={false}
                  />
                )
              )}
              {Array.from({ length: Math.ceil(stageHeight / 25) + 1 }).map(
                (_, i) => (
                  <Line
                    key={`grid-h-${i}`}
                    points={[0, i * 25, stageWidth, i * 25]}
                    stroke={i % 4 === 0 ? gridMajor : gridMinor}
                    strokeWidth={i % 4 === 0 ? 0.75 : 0.35}
                    listening={false}
                  />
                )
              )}
            </Group>

            {/* ── Background Image (from backend) ─────────────────────────── */}
            {dwgImage && (
              <KonvaImage
                image={dwgImage}
                x={0}
                y={0}
                width={stageWidth}
                height={stageHeight}
                opacity={0.35}
                listening={false}
              />
            )}

            {/* ── No geometry placeholder ─────────────────────────────────── */}
            {!dwgImage && !hasAnyGeometry && (
              <Group>
                <Rect
                  x={0}
                  y={0}
                  width={stageWidth}
                  height={stageHeight}
                  fill={isDark ? '#0F172A' : '#F9FAFB'}
                  stroke={isDark ? '#1E293B' : '#E5E7EB'}
                  strokeWidth={1.5}
                />
                <Text
                  x={stageWidth / 2}
                  y={stageHeight / 2}
                  text="Upload a DWG file to see the floor plan"
                  fontSize={14}
                  fill={isDark ? '#64748B' : '#9CA3AF'}
                  align="center"
                  verticalAlign="middle"
                  offsetX={150}
                  offsetY={7}
                />
              </Group>
            )}

            {/* ── Architectural Room Outlines (CAD reference polygons) ────── */}
            {showParsedRooms &&
              validRooms.map((room) => {
                const canvasPts = room.boundaries.map(toCanvas);
                const flatPoints = canvasPts.flatMap((p) => [p.x, p.y]);

                return (
                  <Group key={`arch-room-${room.id}`}>
                    <Line
                      points={flatPoints}
                      closed
                      stroke={roomStroke}
                      strokeWidth={1.5}
                      fill={
                        isDark
                          ? 'rgba(96, 165, 250, 0.08)'
                          : 'rgba(59, 130, 246, 0.05)'
                      }
                      listening={false}
                      perfectDrawEnabled={false}
                    />
                    {room.name && canvasPts.length > 0 && (
                      <Text
                        x={
                          canvasPts.reduce((acc, p) => acc + p.x, 0) /
                          canvasPts.length
                        }
                        y={
                          canvasPts.reduce((acc, p) => acc + p.y, 0) /
                          canvasPts.length
                        }
                        text={room.name}
                        fontSize={11}
                        fill={isDark ? '#94A3B8' : '#64748B'}
                        align="center"
                        offsetX={35}
                        offsetY={6}
                        width={70}
                        listening={false}
                      />
                    )}
                  </Group>
                );
              })}

            {/* ── Walls ───────────────────────────────────────────────────── */}
            {normalizedWalls.map((wall) => {
              const a = toCanvas(wall.start);
              const b = toCanvas(wall.end);
              const strokeWidth = getWallStrokeWidth(wall.thickness);
              return (
                <Line
                  key={wall.id}
                  points={[a.x, a.y, b.x, b.y]}
                  stroke={wallStroke}
                  strokeWidth={strokeWidth}
                  lineCap="butt"
                  lineJoin="miter"
                  listening={false}
                  perfectDrawEnabled={false}
                />
              );
            })}

            {/* ── Windows ─────────────────────────────────────────────────── */}
            {normalizedWindows.map((win) => {
              const a = toCanvas(win.start);
              const b = toCanvas(win.end);
              return (
                <Line
                  key={win.id}
                  points={[a.x, a.y, b.x, b.y]}
                  stroke={windowStroke}
                  strokeWidth={1.2}
                  lineCap="butt"
                  listening={false}
                  perfectDrawEnabled={false}
                />
              );
            })}

            {/* ── Doors (arc swing + leaf) ────────────────────────────────── */}
            {normalizedDoors.map((door) => {
              const center = toCanvas(door.center);
              const radius = Math.max(3, door.radius * scale);
              const startAngle = door.startAngle;
              const endAngle = door.endAngle;

              if (radius < 4 || !door.hasSwing) {
                return (
                  <KonvaCircle
                    key={door.id}
                    x={center.x}
                    y={center.y}
                    radius={Math.max(1.8, Math.min(3, radius))}
                    fill={doorStroke}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    listening={false}
                  />
                );
              }

              return (
                <Shape
                  key={door.id}
                  listening={false}
                  perfectDrawEnabled={false}
                  stroke={doorStroke}
                  strokeWidth={1.0}
                  sceneFunc={(context, shape) => {
                    context.beginPath();
                    context.arc(
                      center.x,
                      center.y,
                      radius,
                      -startAngle,
                      -endAngle,
                      false
                    );
                    const leafX = center.x + radius * Math.cos(-startAngle);
                    const leafY = center.y + radius * Math.sin(-startAngle);
                    context.moveTo(center.x, center.y);
                    context.lineTo(leafX, leafY);
                    context.fillStrokeShape(shape);
                  }}
                />
              );
            })}

            {/* ── Circles (Columns / Structural elements) ─────────────────── */}
            {normalizedCircles.map((circ) => {
              const c = toCanvas(circ.center);
              const radius = Math.max(circ.radius * scale, 1.8);
              return (
                <KonvaCircle
                  key={circ.id}
                  x={c.x}
                  y={c.y}
                  radius={radius}
                  stroke={circleStroke}
                  strokeWidth={0.75}
                  fill={
                    isDark
                      ? 'rgba(203, 213, 225, 0.15)'
                      : 'rgba(71, 85, 105, 0.1)'
                  }
                  listening={false}
                />
              );
            })}

            {/* ── Arcs ────────────────────────────────────────────────────── */}
            {normalizedArcs.map((arc) => {
              const c = toCanvas(arc.center);
              const radius = Math.max(arc.radius * scale, 1.5);
              return (
                <Shape
                  key={arc.id}
                  listening={false}
                  perfectDrawEnabled={false}
                  stroke={arcStroke}
                  strokeWidth={0.75}
                  sceneFunc={(context, shape) => {
                    context.beginPath();
                    context.arc(
                      c.x,
                      c.y,
                      radius,
                      -arc.startAngle,
                      -arc.endAngle,
                      false
                    );
                    context.fillStrokeShape(shape);
                  }}
                />
              );
            })}

            {/* ── User-Created & Backend Zones ────────────────────────────── */}
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              const zoneColor = resolveZoneColor(zone.color, zone.type);

              const boundsList =
                Array.isArray(zone.boundaries) && zone.boundaries.length >= 3
                  ? zone.boundaries
                  : null;
              const polyPoints = boundsList
                ? boundsList.flatMap((p) => [p.x, p.y])
                : null;

              // Determine center for title pill
              const pillX =
                zone.w > 0
                  ? zone.x + zone.w / 2
                  : boundsList
                  ? boundsList.reduce((acc, p) => acc + p.x, 0) / boundsList.length
                  : zone.x;
              const pillY =
                zone.h > 0
                  ? zone.y + zone.h / 2
                  : boundsList
                  ? boundsList.reduce((acc, p) => acc + p.y, 0) / boundsList.length
                  : zone.y;

              return (
                <Group
                  key={zone.id}
                  onClick={() => onZoneClick(zone.id)}
                  onTap={() => onZoneClick(zone.id)}
                >
                  {polyPoints ? (
                    <Line
                      points={polyPoints}
                      closed={true}
                      fill={zoneColor}
                      opacity={0.6}
                      stroke={isSelected ? '#3B82F6' : '#64748B'}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                  ) : (
                    <Rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.w || 40}
                      height={zone.h || 40}
                      fill={zoneColor}
                      opacity={0.6}
                      stroke={isSelected ? '#3B82F6' : '#64748B'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      cornerRadius={6}
                    />
                  )}

                  {/* Title pill */}
                  <Rect
                    x={pillX - 55}
                    y={pillY - 12}
                    width={110}
                    height={24}
                    fill={isDark ? '#1E293B' : '#FFFFFF'}
                    stroke={isSelected ? '#3B82F6' : '#CBD5E1'}
                    strokeWidth={1}
                    cornerRadius={4}
                    shadowBlur={4}
                    shadowColor="rgba(0,0,0,0.15)"
                  />
                  <Text
                    x={pillX}
                    y={pillY}
                    text={zone.name}
                    fontSize={11}
                    fontStyle="bold"
                    fill={isDark ? '#F8FAFC' : '#1E293B'}
                    align="center"
                    verticalAlign="middle"
                    offsetX={55}
                    offsetY={6}
                    width={110}
                  />
                  {isSelected && (
                    <Text
                      x={pillX}
                      y={pillY + 14}
                      text={zone.type || 'Zone'}
                      fontSize={9}
                      fill={isDark ? '#94A3B8' : '#64748B'}
                      align="center"
                      offsetX={50}
                      width={100}
                    />
                  )}
                </Group>
              );
            })}

            {/* ── Drawing Selection Preview ───────────────────────────────── */}
            {isDrawing && selectionPoints.length > 0 && (
              <Group>
                {selectionPoints.length > 1 && (
                  <Line
                    points={selectionPoints.flatMap((p) => [p.x, p.y])}
                    closed={false}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dash={[6, 4]}
                    fill="rgba(59,130,246,0.15)"
                  />
                )}
                {selectionPoints.map((point, idx) => (
                  <Group key={idx}>
                    <Rect
                      x={point.x - 5}
                      y={point.y - 5}
                      width={10}
                      height={10}
                      fill="#3B82F6"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      cornerRadius={5}
                    />
                  </Group>
                ))}
              </Group>
            )}
          </Layer>
        </Stage>
        {children && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${stageWidth}px`,
              height: `${stageHeight}px`,
              transform: `scale(${userScale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>{children}</div>
          </div>
        )}
      </div>

      {/* ── Bottom HUD Indicators ────────────────────────────────────────── */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm text-[11px] font-medium text-slate-600 dark:text-slate-300">
        <span>CAD Vector Engine</span>
        {hasAnyGeometry && (
          <>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-primary font-medium">
              {cadElementCount} Elements
            </span>
          </>
        )}
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span>{zoomLevel}%</span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="text-xs text-primary font-semibold">HD</span>
      </div>

      <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-[10px] text-slate-500 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
        Drag to pan • Mouse wheel to zoom
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
