import React, { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Layers,
  Cpu,
  Sun,
  Moon,
  Armchair,
  Home,
  Eye,
  Compass,
  Palette,
} from 'lucide-react';
import type { ParsedGeometry } from '@/features/floorPlan/services/floor-plans.api';
import { computeTransform, toCanvasPoint } from './FloorPlanCanvas';

// ─── Shared Static Three.js Materials (Fast GPU Draw Calls / Minimalist Dollhouse Palette) ─

const MAT_WHITE_TABLE = new THREE.MeshStandardMaterial({
  color: '#FFFFFF',
  roughness: 0.25,
  metalness: 0.05,
});
const MAT_DARK_METAL = new THREE.MeshStandardMaterial({
  color: '#1E293B',
  roughness: 0.45,
});
const MAT_CHAIR_FABRIC = new THREE.MeshStandardMaterial({
  color: '#334155',
  roughness: 0.75,
});
const MAT_CHAIR_STEM = new THREE.MeshStandardMaterial({
  color: '#64748B',
  roughness: 0.35,
});
const MAT_WOOD_OAK = new THREE.MeshStandardMaterial({
  color: '#DEB887', // Scandinavian blonde oak
  roughness: 0.45,
  metalness: 0.02,
});
const MAT_WOOD_DARK = new THREE.MeshStandardMaterial({
  color: '#8A5A36',
  roughness: 0.55,
});
const MAT_MONITOR_FACE = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
const MAT_BOUCLE_OAT = new THREE.MeshStandardMaterial({
  color: '#EBE6DF', // Warm oat bouclé sofa fabric
  roughness: 0.95,
});
const MAT_LOUNGE_CAMEL = new THREE.MeshStandardMaterial({
  color: '#C49E74',
  roughness: 0.85,
});
const MAT_COFFEE_TABLE = new THREE.MeshStandardMaterial({
  color: '#CFA980',
  roughness: 0.45,
});
const MAT_MARBLE_WHITE = new THREE.MeshStandardMaterial({
  color: '#F8FAFC',
  roughness: 0.18,
  metalness: 0.05,
});
const MAT_CERAMIC_WHITE = new THREE.MeshStandardMaterial({
  color: '#FAFAFA',
  roughness: 0.25,
});
const MAT_SOIL = new THREE.MeshStandardMaterial({
  color: '#3E2723',
  roughness: 0.92,
});
const MAT_LEAF_PRIMARY = new THREE.MeshStandardMaterial({
  color: '#2A5426', // Rich botanical ficus green
  roughness: 0.55,
});
const MAT_LEAF_SECONDARY = new THREE.MeshStandardMaterial({
  color: '#457B36',
  roughness: 0.55,
});
const MAT_BRASS_ACCENT = new THREE.MeshStandardMaterial({
  color: '#D4AF37', // Satin brushed champagne brass
  roughness: 0.28,
  metalness: 0.75,
});
const MAT_RUG_CREAM = new THREE.MeshStandardMaterial({
  color: '#F5F2EC',
  roughness: 0.98,
});
const MAT_GLASS_WINDOW = new THREE.MeshStandardMaterial({
  color: '#D6EAFF',
  roughness: 0.08,
  metalness: 0.1,
  transparent: true,
  opacity: 0.38,
});
const MAT_WALL_DARK = new THREE.MeshStandardMaterial({
  color: '#1E293B',
  roughness: 0.3,
  metalness: 0.15,
});
const MAT_WALL_CAP_DARK = new THREE.MeshStandardMaterial({
  color: '#38BDF8',
  roughness: 0.2,
  metalness: 0.5,
});

// ─── Dynamic Wall Materials Map ────────────────────────────────────────────────

export type WallColorTheme =
  | 'lightGray'
  | 'pearl'
  | 'pure'
  | 'linen'
  | 'slate'
  | 'charcoal';

const WALL_THEMES: Record<
  WallColorTheme,
  {
    name: string;
    wallColor: string;
    capColor: string;
    roughness: number;
    metalness: number;
    useTexture?: boolean;
  }
> = {
  lightGray: {
    name: '8K Light Gray',
    wallColor: '#D8DDE3', // Modern architectural 8K tactile light gray
    capColor: '#64748B', // Slate architectural cap trim
    roughness: 0.36,
    metalness: 0.05,
    useTexture: true,
  },
  pearl: {
    name: 'Pearl White',
    wallColor: '#E8ECF0', // Crisp pearl plaster
    capColor: '#94A3B8',
    roughness: 0.45,
    metalness: 0.04,
    useTexture: true,
  },
  pure: {
    name: 'Pure White',
    wallColor: '#FFFFFF', // Gallery clean white
    capColor: '#CBD5E1',
    roughness: 0.4,
    metalness: 0.02,
    useTexture: true,
  },
  linen: {
    name: 'Architectural Linen',
    wallColor: '#EFECE6', // Warm architectural stone/linen
    capColor: '#A8A29E',
    roughness: 0.6,
    metalness: 0.02,
    useTexture: true,
  },
  slate: {
    name: 'Modern Slate',
    wallColor: '#94A3B8', // Contemporary architectural cool slate
    capColor: '#475569',
    roughness: 0.42,
    metalness: 0.08,
    useTexture: true,
  },
  charcoal: {
    name: 'Dark Studio',
    wallColor: '#334155', // Sleek high-contrast dark architecture
    capColor: '#0F172A',
    roughness: 0.35,
    metalness: 0.12,
    useTexture: false,
  },
};

// ─── Procedural 8K HD Architectural Wall Texture (Micro-Cement / Venetian Plaster) ──

function createWallHDPlasterTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Multi-frequency micro-grain & subtle troweled plaster variations
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      const n1 = Math.sin(x * 0.18) * Math.cos(y * 0.18) * 0.4;
      const n2 = Math.sin(x * 0.05 + y * 0.04) * 0.35;
      const n3 = (Math.random() - 0.5) * 0.16; // Micro-stipple 8K grain
      const n4 = Math.sin((x + y) * 0.02) * 0.12;

      const factor = 1.0 + (n1 * 0.03 + n2 * 0.04 + n3 + n4 * 0.04);

      // Light gray neutral luminance
      const val = Math.min(255, Math.max(0, Math.round(238 * factor)));

      data[idx] = val;
      data[idx + 1] = Math.min(255, Math.max(0, Math.round(val * 1.01))); // Very subtle crisp cool tint
      data[idx + 2] = Math.min(255, Math.max(0, Math.round(val * 1.03)));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Soft architectural directional wash overlay
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  grad.addColorStop(0.5, 'rgba(220, 225, 235, 0.02)');
  grad.addColorStop(1, 'rgba(200, 208, 220, 0.06)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = 16;
  return texture;
}

let cachedWallHDPlasterTexture: THREE.CanvasTexture | null = null;
function getWallHDPlasterTexture(): THREE.CanvasTexture {
  if (!cachedWallHDPlasterTexture && typeof document !== 'undefined') {
    cachedWallHDPlasterTexture = createWallHDPlasterTexture();
  }
  return cachedWallHDPlasterTexture!;
}

// ─── Procedural Natural Oak Hardwood Floor Texture ─────────────────────────────

function createWoodFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const plankH = 42; // Height of each plank
  const rows = Math.ceil(size / plankH);

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
    const rowOffset = (r % 3) * 110;
    const plankW = 170;
    const cols = Math.ceil((size + rowOffset) / plankW) + 1;

    for (let c = 0; c < cols; c++) {
      const x = c * plankW - (rowOffset % plankW);
      const toneIdx =
        Math.abs(Math.floor(Math.sin(r * 13.7 + c * 31.9) * 43758.54)) %
        woodTones.length;

      ctx.fillStyle = woodTones[toneIdx];
      ctx.fillRect(x, y, plankW, plankH);

      // Fine wood fiber grain streaks
      for (let g = 0; g < 5; g++) {
        const gy = y + 4 + g * 7;
        ctx.strokeStyle =
          g % 2 === 0 ? 'rgba(100, 65, 30, 0.07)' : 'rgba(255, 245, 230, 0.09)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.bezierCurveTo(
          x + plankW * 0.3,
          gy + ((g % 2) - 0.5) * 3,
          x + plankW * 0.7,
          gy - ((g % 2) - 0.5) * 2,
          x + plankW,
          gy
        );
        ctx.stroke();
      }

      // Plank joint borders (darker wood seam)
      ctx.strokeStyle = 'rgba(75, 45, 20, 0.32)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, plankW - 1, plankH - 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.anisotropy = 8;
  return texture;
}

let cachedWoodFloorTexture: THREE.CanvasTexture | null = null;
function getWoodFloorTexture(): THREE.CanvasTexture {
  if (!cachedWoodFloorTexture && typeof document !== 'undefined') {
    cachedWoodFloorTexture = createWoodFloorTexture();
  }
  return cachedWoodFloorTexture!;
}

// ─── Shared Static Geometries ──────────────────────────────────────────────────

const GEO_CHAIR_SEAT = new THREE.BoxGeometry(0.34, 0.04, 0.34);
const GEO_CHAIR_BACK = new THREE.BoxGeometry(0.34, 0.32, 0.03);
const GEO_CHAIR_STEM = new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6);
const GEO_TABLE_LEG = new THREE.CylinderGeometry(0.025, 0.025, 0.58, 6);
const GEO_MONITOR_BASE = new THREE.BoxGeometry(0.18, 0.01, 0.14);
const GEO_MONITOR_STEM = new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6);
const GEO_MONITOR_BODY = new THREE.BoxGeometry(0.48, 0.28, 0.018);
const GEO_MONITOR_SCREEN = new THREE.PlaneGeometry(0.45, 0.25);
const GEO_POT = new THREE.CylinderGeometry(0.2, 0.15, 0.44, 12);
const GEO_SOIL = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 12);
const GEO_LEAF_1 = new THREE.SphereGeometry(0.24, 6, 6);
const GEO_LEAF_2 = new THREE.SphereGeometry(0.18, 6, 6);
const GEO_DOOR_SLAB = new THREE.BoxGeometry(0.85, 1.34, 0.04);
const GEO_DOOR_HANDLE = new THREE.BoxGeometry(0.09, 0.02, 0.03);

// ─── Color & Style Helpers ─────────────────────────────────────────────────────

const getDeviceColor = (type: string): string => {
  const t = (type || '').toLowerCase();
  if (t.includes('gateway')) return '#F59E0B';
  if (t.includes('sensor')) return '#10B981';
  if (t.includes('controller')) return '#3B82F6';
  if (t.includes('actuator')) return '#EF4444';
  return '#8B5CF6';
};

const getZoneFloorStyle = (type?: string, isStudio = true) => {
  const t = (type || '').toLowerCase();
  if (
    t.includes('restroom') ||
    t.includes('bath') ||
    t.includes('toilet') ||
    t.includes('utility')
  ) {
    return {
      color: isStudio ? '#E2E8F0' : '#334155',
      roughness: 0.35,
      metalness: 0.1,
      type: 'tile',
    };
  }
  return {
    color: isStudio ? '#D2AB7E' : '#785A3A',
    roughness: 0.45,
    metalness: 0.04,
    type: 'wood',
  };
};

// ─── Smooth Camera Controller ──────────────────────────────────────────────────

export interface CameraTarget {
  pos: [number, number, number];
  target: [number, number, number];
}

const SmoothCameraRig: React.FC<{
  targetCamera: CameraTarget | null;
  onTargetReached: () => void;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.MutableRefObject<any>;
}> = ({ targetCamera, onTargetReached, cameraRef, controlsRef }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (cameraRef && camera) {
      cameraRef.current = camera as THREE.PerspectiveCamera;
    }
  }, [camera, cameraRef]);

  useFrame((_, delta) => {
    if (!targetCamera) return;

    const step = Math.min(delta * 7, 0.35);
    camera.position.lerp(new THREE.Vector3(...targetCamera.pos), step);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(
        new THREE.Vector3(...targetCamera.target),
        step
      );
      controlsRef.current.update();
    }

    if (
      camera.position.distanceTo(new THREE.Vector3(...targetCamera.pos)) < 0.08
    ) {
      camera.position.set(...targetCamera.pos);
      if (controlsRef.current) {
        controlsRef.current.target.set(...targetCamera.target);
        controlsRef.current.update();
      }
      onTargetReached();
    }
  });

  return null;
};

// ─── Minimalist Japandi / Scandinavian Dollhouse Furniture Components ─────────

const ConferenceTable3D: React.FC<{
  x: number;
  z: number;
  width: number;
  depth: number;
}> = ({ x, z, width, depth }) => {
  const tableW = Math.min(Math.max(width * 0.55, 1.8), 3.2);
  const tableD = Math.min(Math.max(depth * 0.45, 0.9), 1.4);
  const tableH = 0.58;
  const chairCount = Math.max(2, Math.floor(tableW / 0.8));

  return (
    <group position={[x, 0, z]}>
      {/* Soft Area Rug Under Table */}
      <mesh position={[0, 0.015, 0]} material={MAT_RUG_CREAM}>
        <boxGeometry args={[tableW + 1.1, 0.01, tableD + 1.1]} />
      </mesh>

      {/* Blonde Oak Table Top */}
      <mesh position={[0, tableH, 0]} material={MAT_WOOD_OAK}>
        <boxGeometry args={[tableW, 0.045, tableD]} />
      </mesh>

      {/* 4 Angled Minimalist Legs */}
      <mesh
        position={[-tableW * 0.42, tableH / 2, -tableD * 0.38]}
        geometry={GEO_TABLE_LEG}
        material={MAT_DARK_METAL}
      />
      <mesh
        position={[tableW * 0.42, tableH / 2, -tableD * 0.38]}
        geometry={GEO_TABLE_LEG}
        material={MAT_DARK_METAL}
      />
      <mesh
        position={[-tableW * 0.42, tableH / 2, tableD * 0.38]}
        geometry={GEO_TABLE_LEG}
        material={MAT_DARK_METAL}
      />
      <mesh
        position={[tableW * 0.42, tableH / 2, tableD * 0.38]}
        geometry={GEO_TABLE_LEG}
        material={MAT_DARK_METAL}
      />

      {/* Centerpiece Minimalist Ceramic Succulent */}
      <mesh position={[0, tableH + 0.04, 0]} material={MAT_CERAMIC_WHITE}>
        <cylinderGeometry args={[0.07, 0.05, 0.08, 12]} />
      </mesh>
      <mesh position={[0, tableH + 0.1, 0]} material={MAT_LEAF_PRIMARY}>
        <sphereGeometry args={[0.06, 6, 6]} />
      </mesh>

      {/* Floating Overhead Ring Pendant Fixture */}
      <mesh position={[0, 1.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.018, 8, 24]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Scandinavian Shell Chairs */}
      {Array.from({ length: chairCount }).map((_, i) => {
        const offset = (i - (chairCount - 1) / 2) * 0.75;
        return (
          <React.Fragment key={`conf-chair-${i}`}>
            <group position={[offset, 0, -tableD * 0.5 - 0.22]}>
              <mesh
                position={[0, 0.34, 0]}
                geometry={GEO_CHAIR_SEAT}
                material={MAT_CHAIR_FABRIC}
              />
              <mesh
                position={[0, 0.52, -0.15]}
                geometry={GEO_CHAIR_BACK}
                material={MAT_CHAIR_FABRIC}
              />
              <mesh
                position={[0, 0.17, 0]}
                geometry={GEO_CHAIR_STEM}
                material={MAT_CHAIR_STEM}
              />
            </group>
            <group position={[offset, 0, tableD * 0.5 + 0.22]}>
              <mesh
                position={[0, 0.34, 0]}
                geometry={GEO_CHAIR_SEAT}
                material={MAT_CHAIR_FABRIC}
              />
              <mesh
                position={[0, 0.52, 0.15]}
                geometry={GEO_CHAIR_BACK}
                material={MAT_CHAIR_FABRIC}
              />
              <mesh
                position={[0, 0.17, 0]}
                geometry={GEO_CHAIR_STEM}
                material={MAT_CHAIR_STEM}
              />
            </group>
          </React.Fragment>
        );
      })}
    </group>
  );
};

const OfficeDesk3D: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const deskW = 1.25;
  const deskD = 0.65;
  const deskH = 0.58;

  return (
    <group position={[x, 0, z]}>
      {/* Desk Floor Mat */}
      <mesh position={[0, 0.015, 0.15]} material={MAT_RUG_CREAM}>
        <boxGeometry args={[deskW + 0.3, 0.01, deskD + 0.6]} />
      </mesh>

      {/* Blonde Oak Desktop */}
      <mesh position={[0, deskH, 0]} material={MAT_WOOD_OAK}>
        <boxGeometry args={[deskW, 0.038, deskD]} />
      </mesh>

      {/* Minimalist Black Steel Sled Frame */}
      <mesh position={[-deskW * 0.44, deskH / 2, 0]} material={MAT_DARK_METAL}>
        <boxGeometry args={[0.035, deskH, deskD * 0.88]} />
      </mesh>
      <mesh position={[deskW * 0.44, deskH / 2, 0]} material={MAT_DARK_METAL}>
        <boxGeometry args={[0.035, deskH, deskD * 0.88]} />
      </mesh>

      {/* Frameless OLED Monitor with Glowing Screen */}
      <group position={[0, deskH + 0.02, -deskD * 0.26]}>
        <mesh
          position={[0, 0.01, 0]}
          geometry={GEO_MONITOR_BASE}
          material={MAT_DARK_METAL}
        />
        <mesh
          position={[0, 0.12, 0]}
          geometry={GEO_MONITOR_STEM}
          material={MAT_CHAIR_STEM}
        />
        <mesh
          position={[0, 0.22, 0]}
          geometry={GEO_MONITOR_BODY}
          material={MAT_DARK_METAL}
        />
        <mesh
          position={[0, 0.22, 0.01]}
          geometry={GEO_MONITOR_SCREEN}
          material={MAT_MONITOR_FACE}
        />
      </group>

      {/* Mini Keyboard & Mouse */}
      <mesh position={[0, deskH + 0.025, 0.05]} material={MAT_DARK_METAL}>
        <boxGeometry args={[0.26, 0.008, 0.09]} />
      </mesh>
      <mesh position={[0.2, deskH + 0.025, 0.05]} material={MAT_DARK_METAL}>
        <boxGeometry args={[0.04, 0.008, 0.07]} />
      </mesh>

      {/* Ergonomic Swivel Chair */}
      <group position={[0, 0, deskD * 0.5 + 0.28]}>
        <mesh
          position={[0, 0.35, 0]}
          geometry={GEO_CHAIR_SEAT}
          material={MAT_CHAIR_FABRIC}
        />
        <mesh
          position={[0, 0.56, 0.16]}
          geometry={GEO_CHAIR_BACK}
          material={MAT_CHAIR_FABRIC}
        />
        <mesh
          position={[0, 0.18, 0]}
          geometry={GEO_CHAIR_STEM}
          material={MAT_CHAIR_STEM}
        />
      </group>
    </group>
  );
};

const LoungeArea3D: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  return (
    <group position={[x, 0, z]}>
      {/* Circular Area Rug */}
      <mesh position={[0, 0.015, 0]} material={MAT_RUG_CREAM}>
        <cylinderGeometry args={[1.3, 1.3, 0.01, 24]} />
      </mesh>

      {/* Low 3-Seater Sofa in Oat Bouclé */}
      <group position={[0, 0, -0.45]}>
        {/* Seat Cushion */}
        <mesh position={[0, 0.24, 0]} material={MAT_BOUCLE_OAT}>
          <boxGeometry args={[1.5, 0.2, 0.65]} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.44, -0.25]} material={MAT_BOUCLE_OAT}>
          <boxGeometry args={[1.5, 0.36, 0.18]} />
        </mesh>
        {/* Armrests */}
        <mesh position={[-0.78, 0.35, -0.05]} material={MAT_BOUCLE_OAT}>
          <boxGeometry args={[0.16, 0.28, 0.62]} />
        </mesh>
        <mesh position={[0.78, 0.35, -0.05]} material={MAT_BOUCLE_OAT}>
          <boxGeometry args={[0.16, 0.28, 0.62]} />
        </mesh>
      </group>

      {/* Double Nesting Coffee Tables (Blonde Oak + White Marble) */}
      <mesh position={[-0.18, 0.2, 0.18]} material={MAT_COFFEE_TABLE}>
        <cylinderGeometry args={[0.32, 0.32, 0.025, 20]} />
      </mesh>
      <mesh position={[-0.18, 0.1, 0.18]} material={MAT_DARK_METAL}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
      </mesh>

      <mesh position={[0.22, 0.25, 0.3]} material={MAT_MARBLE_WHITE}>
        <cylinderGeometry args={[0.24, 0.24, 0.025, 20]} />
      </mesh>
      <mesh position={[0.22, 0.125, 0.3]} material={MAT_BRASS_ACCENT}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
      </mesh>

      {/* Scandinavian Accent Armchair */}
      <group position={[0.85, 0, 0.25]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh position={[0, 0.25, 0]} material={MAT_LOUNGE_CAMEL}>
          <boxGeometry args={[0.55, 0.18, 0.55]} />
        </mesh>
        <mesh position={[0, 0.46, -0.22]} material={MAT_LOUNGE_CAMEL}>
          <boxGeometry args={[0.55, 0.34, 0.14]} />
        </mesh>
        <mesh
          position={[-0.24, 0.12, -0.2]}
          geometry={GEO_TABLE_LEG}
          material={MAT_DARK_METAL}
        />
        <mesh
          position={[0.24, 0.12, -0.2]}
          geometry={GEO_TABLE_LEG}
          material={MAT_DARK_METAL}
        />
      </group>
    </group>
  );
};

const Restroom3D: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  return (
    <group position={[x, 0, z]}>
      {/* Floating Quartz Vanity */}
      <mesh position={[0, 0.44, -0.3]} material={MAT_MARBLE_WHITE}>
        <boxGeometry args={[0.85, 0.12, 0.4]} />
      </mesh>
      {/* Chrome Faucet */}
      <mesh position={[0, 0.54, -0.42]} material={MAT_BRASS_ACCENT}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
      </mesh>
      {/* Backlit Circular Mirror */}
      <mesh position={[0, 0.88, -0.48]}>
        <cylinderGeometry args={[0.26, 0.26, 0.015, 24]} />
        <meshStandardMaterial
          color="#E2E8F0"
          roughness={0.05}
          metalness={0.9}
        />
      </mesh>
      {/* Wall-Hung Toilet Fixture */}
      <group position={[0, 0.28, 0.35]}>
        <mesh material={MAT_CERAMIC_WHITE}>
          <boxGeometry args={[0.36, 0.32, 0.48]} />
        </mesh>
      </group>
    </group>
  );
};

const KitchenettePantry3D: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  return (
    <group position={[x, 0, z]}>
      {/* Blonde Oak Waterfall Bar Counter */}
      <mesh position={[0, 0.52, 0]} material={MAT_WOOD_OAK}>
        <boxGeometry args={[1.4, 0.05, 0.55]} />
      </mesh>
      <mesh position={[-0.67, 0.26, 0]} material={MAT_WOOD_OAK}>
        <boxGeometry args={[0.05, 0.52, 0.55]} />
      </mesh>
      <mesh position={[0.67, 0.26, 0]} material={MAT_WOOD_OAK}>
        <boxGeometry args={[0.05, 0.52, 0.55]} />
      </mesh>

      {/* Mini Espresso Machine */}
      <mesh position={[-0.35, 0.64, -0.05]} material={MAT_DARK_METAL}>
        <boxGeometry args={[0.2, 0.18, 0.22]} />
      </mesh>

      {/* 2 Modern Barstools */}
      <group position={[-0.28, 0, 0.45]}>
        <mesh position={[0, 0.42, 0]} material={MAT_WOOD_OAK}>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
        </mesh>
        <mesh position={[0, 0.21, 0]} material={MAT_DARK_METAL}>
          <cylinderGeometry args={[0.018, 0.018, 0.42, 6]} />
        </mesh>
      </group>
      <group position={[0.28, 0, 0.45]}>
        <mesh position={[0, 0.42, 0]} material={MAT_WOOD_OAK}>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
        </mesh>
        <mesh position={[0, 0.21, 0]} material={MAT_DARK_METAL}>
          <cylinderGeometry args={[0.018, 0.018, 0.42, 6]} />
        </mesh>
      </group>
    </group>
  );
};

const PottedPlant3D: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  return (
    <group position={[x, 0, z]}>
      {/* Matte Fluted Ceramic Planter */}
      <mesh
        position={[0, 0.22, 0]}
        geometry={GEO_POT}
        material={MAT_CERAMIC_WHITE}
      />
      <mesh position={[0, 0.43, 0]} geometry={GEO_SOIL} material={MAT_SOIL} />
      {/* Sculptural Botanical Leaf Cluster */}
      <group position={[0, 0.56, 0]}>
        <mesh
          position={[0, 0.09, 0]}
          geometry={GEO_LEAF_1}
          material={MAT_LEAF_PRIMARY}
        />
        <mesh
          position={[0.12, 0.18, 0.08]}
          geometry={GEO_LEAF_2}
          material={MAT_LEAF_SECONDARY}
        />
        <mesh
          position={[-0.1, 0.15, -0.06]}
          geometry={GEO_LEAF_2}
          material={MAT_LEAF_PRIMARY}
        />
      </group>
    </group>
  );
};

const WoodenDoor3D: React.FC<{ x: number; z: number; angle?: number }> = ({
  x,
  z,
  angle = 0,
}) => {
  return (
    <group position={[x, 0, z]} rotation={[0, angle + Math.PI / 5, 0]}>
      <mesh
        position={[0.4, 0.67, 0]}
        geometry={GEO_DOOR_SLAB}
        material={MAT_WOOD_DARK}
      />
      <mesh
        position={[0.75, 0.65, 0.03]}
        geometry={GEO_DOOR_HANDLE}
        material={MAT_BRASS_ACCENT}
      />
    </group>
  );
};

const ArchitecturalWindow3D: React.FC<{
  x: number;
  z: number;
  length: number;
  angle: number;
}> = ({ x, z, length, angle }) => {
  return (
    <group position={[x, 0.68, z]} rotation={[0, angle, 0]}>
      {/* Tinted Architectural Glass Pane */}
      <mesh material={MAT_GLASS_WINDOW}>
        <boxGeometry args={[0.02, 1.15, length]} />
      </mesh>
      {/* Slim Frame Sill */}
      <mesh position={[0, -0.58, 0]} material={MAT_DARK_METAL}>
        <boxGeometry args={[0.045, 0.03, length]} />
      </mesh>
      <mesh position={[0, 0.58, 0]} material={MAT_DARK_METAL}>
        <boxGeometry args={[0.045, 0.03, length]} />
      </mesh>
    </group>
  );
};

// ─── 3D Device Beacon Component ────────────────────────────────────────────────

interface Device3DProps {
  device: { id: string; name: string; type: string; x: number; y: number };
  isOn: boolean;
  onToggle: () => void;
  scaleX: number;
  scaleZ: number;
}

const Device3D: React.FC<Device3DProps> = ({
  device,
  isOn,
  onToggle,
  scaleX,
  scaleZ,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const x = (device.x - 400) * scaleX;
  const z = (device.y - 250) * scaleZ;
  const baseHeight = 0.45;

  const deviceColor = getDeviceColor(device.type);
  const statusColor = isOn ? deviceColor : '#64748B';
  const isGateway = device.type.toLowerCase().includes('gateway');

  useFrame(({ clock }) => {
    if (!isOn) return;
    const t = clock.getElapsedTime() + (device.id.charCodeAt(0) || 0) * 0.1;
    if (groupRef.current) {
      groupRef.current.position.y = baseHeight + Math.sin(t * 2.5) * 0.03;
    }
    if (ringRef.current) {
      const cycle = (t * 1.3) % 1;
      const s = 1 + cycle * 1.6;
      ringRef.current.scale.set(s, s, 1);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = Math.max(0, (1 - cycle) * 0.55);
    }
  });

  return (
    <group position={[x, baseHeight, z]}>
      {isOn && (
        <mesh
          ref={ringRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.36, 0]}
        >
          <ringGeometry args={[0.3, 0.55, 24]} />
          <meshBasicMaterial
            color={statusColor}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <mesh>
          {isGateway ? (
            <cylinderGeometry args={[0.24, 0.26, 0.14, 6]} />
          ) : (
            <cylinderGeometry args={[0.2, 0.2, 0.12, 16]} />
          )}
          <meshStandardMaterial
            color={statusColor}
            emissive={isOn ? statusColor : '#000000'}
            emissiveIntensity={isOn ? 0.35 : 0}
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>

        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color={isOn ? '#FFFFFF' : '#94A3B8'}
            emissive={isOn ? statusColor : '#000000'}
            emissiveIntensity={isOn ? 0.7 : 0}
          />
        </mesh>

        {(hovered || isOn) && (
          <Text
            position={[0, 0.42, 0]}
            fontSize={0.22}
            color={isOn ? '#0F172A' : '#64748B'}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.03}
            outlineColor="#FFFFFF"
          >
            {device.name}
          </Text>
        )}
      </group>
    </group>
  );
};

// ─── 3D Zone Component ─────────────────────────────────────────────────────────

interface Zone3DProps {
  zone: {
    id: string;
    name: string;
    type?: string;
    color?: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  scaleX: number;
  scaleZ: number;
  isSelected: boolean;
  onSelect: () => void;
  isStudio: boolean;
  showFurniture: boolean;
}

const Zone3D: React.FC<Zone3DProps> = ({
  zone,
  scaleX,
  scaleZ,
  isSelected,
  onSelect,
  isStudio,
  showFurniture,
}) => {
  const x = (zone.x + zone.w / 2 - 400) * scaleX;
  const z = (zone.y + zone.h / 2 - 250) * scaleZ;
  const width = Math.max(zone.w * scaleX, 1.2);
  const depth = Math.max(zone.h * scaleZ, 1.2);

  const floorStyle = getZoneFloorStyle(zone.type || zone.name, isStudio);
  const zoneTypeLower = (zone.type || zone.name || '').toLowerCase();

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Zone Floor Plate with Natural Wood Hardwood Texture */}
      <mesh position={[x, 0.02, z]}>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial
          color={isSelected ? '#38BDF8' : floorStyle.color}
          map={
            isStudio && floorStyle.type === 'wood'
              ? getWoodFloorTexture()
              : undefined
          }
          roughness={floorStyle.roughness}
          metalness={floorStyle.metalness}
        />
      </mesh>

      {/* Selected Perimeter Highlight */}
      {isSelected && (
        <mesh position={[x, 0.05, z]}>
          <boxGeometry args={[width + 0.04, 0.02, depth + 0.04]} />
          <meshBasicMaterial color="#0284C7" wireframe />
        </mesh>
      )}

      {/* Procedural Minimalist Dollhouse Furniture Sets */}
      {showFurniture && (
        <group>
          {(zoneTypeLower.includes('conference') ||
            zoneTypeLower.includes('meeting') ||
            zoneTypeLower.includes('board')) && (
            <ConferenceTable3D x={x} z={z} width={width} depth={depth} />
          )}

          {(zoneTypeLower.includes('office') ||
            zoneTypeLower.includes('manager') ||
            zoneTypeLower.includes('cabin')) && (
            <>
              <OfficeDesk3D x={x} z={z} />
              <PottedPlant3D x={x + width * 0.38} z={z - depth * 0.36} />
            </>
          )}

          {(zoneTypeLower.includes('lounge') ||
            zoneTypeLower.includes('reception') ||
            zoneTypeLower.includes('lobby') ||
            zoneTypeLower.includes('breakout')) && (
            <>
              <LoungeArea3D x={x} z={z} />
              <PottedPlant3D x={x - width * 0.36} z={z + depth * 0.36} />
            </>
          )}

          {(zoneTypeLower.includes('restroom') ||
            zoneTypeLower.includes('bath') ||
            zoneTypeLower.includes('toilet')) && <Restroom3D x={x} z={z} />}

          {(zoneTypeLower.includes('kitchen') ||
            zoneTypeLower.includes('pantry') ||
            zoneTypeLower.includes('cafeteria')) && (
            <KitchenettePantry3D x={x} z={z} />
          )}
        </group>
      )}

      {/* Floating 3D Zone Label Badge */}
      <Text
        position={[x, 1.65, z]}
        fontSize={0.24}
        color={isSelected ? '#0284C7' : isStudio ? '#334155' : '#F8FAFC'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor={isStudio ? '#FFFFFF' : '#0F172A'}
      >
        {zone.name}
      </Text>
    </group>
  );
};

// ─── 3D Scene Component ────────────────────────────────────────────────────────

interface SceneProps {
  zones: Array<{
    id: string;
    name: string;
    type?: string;
    color?: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  devices: Array<{
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
  }>;
  parsedGeometry?: ParsedGeometry;
  selectedZoneId?: string | null;
  onZoneSelect: (zoneId: string | null) => void;
  showZones: boolean;
  showDevices: boolean;
  showConnections: boolean;
  showGrid: boolean;
  showFurniture: boolean;
  themeMode: 'studio' | 'dark';
  wallColorTheme: WallColorTheme;
  devicePowerState: Record<string, boolean>;
  onToggleDevice: (deviceId: string) => void;
  wallThickness?: number;
  targetCamera: CameraTarget | null;
  onTargetReached: () => void;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.MutableRefObject<any>;
}

const Scene3D: React.FC<SceneProps> = ({
  zones,
  devices,
  parsedGeometry,
  selectedZoneId,
  onZoneSelect,
  showZones,
  showDevices,
  showConnections,
  showGrid,
  showFurniture,
  themeMode,
  wallColorTheme,
  devicePowerState,
  onToggleDevice,
  wallThickness = 0.055,
  targetCamera,
  onTargetReached,
  cameraRef,
  controlsRef,
}) => {
  const isStudio = themeMode === 'studio';
  const scaleX = 22 / 800;
  const scaleZ = 16 / 500;
  const wallH = 1.35; // Dollhouse Cutaway Wall Height

  const currentTheme = WALL_THEMES[wallColorTheme] || WALL_THEMES.lightGray;

  // Dynamic 8K HD tactile wall material with modern architectural finish
  const wallMaterial = useMemo(() => {
    if (!isStudio) return MAT_WALL_DARK;
    const hdMap =
      currentTheme.useTexture !== false ? getWallHDPlasterTexture() : undefined;
    return new THREE.MeshStandardMaterial({
      color: currentTheme.wallColor,
      map: hdMap,
      roughness: currentTheme.roughness,
      metalness: currentTheme.metalness,
    });
  }, [isStudio, currentTheme]);

  const wallCapMaterial = useMemo(() => {
    if (!isStudio) return MAT_WALL_CAP_DARK;
    return new THREE.MeshStandardMaterial({
      color: currentTheme.capColor,
      roughness: Math.min(1, currentTheme.roughness + 0.12),
      metalness: currentTheme.metalness + 0.05,
    });
  }, [isStudio, currentTheme]);

  // Real extruded CAD walls from parsedGeometry
  const walls3D = useMemo(() => {
    if (!parsedGeometry) return [];
    const allPoints: Array<{ x: number; y: number }> = [];
    const rawWalls = parsedGeometry.walls || [];
    rawWalls.forEach((w: any) => {
      const p1 = w.start ||
        (w.points && w.points[0]) || { x: w.x1 ?? 0, y: w.y1 ?? 0 };
      const p2 = w.end ||
        (w.points && w.points[1]) || { x: w.x2 ?? 0, y: w.y2 ?? 0 };
      if (typeof p1.x === 'number') allPoints.push(p1);
      if (typeof p2.x === 'number') allPoints.push(p2);
    });
    const fallbackBox =
      (parsedGeometry as any)?.bounds ||
      (parsedGeometry as any)?.boundingBox ||
      null;
    const transform = computeTransform(allPoints, fallbackBox, 800, 500);
    const result: Array<{
      id: string;
      midX: number;
      midZ: number;
      length: number;
      angle: number;
      thickness: number;
    }> = [];

    rawWalls.forEach((w: any, idx: number) => {
      const startPt = w.start ||
        (w.points && w.points[0]) || { x: w.x1 ?? 0, y: w.y1 ?? 0 };
      const endPt = w.end ||
        (w.points && w.points[1]) || { x: w.x2 ?? 0, y: w.y2 ?? 0 };
      const p1 = toCanvasPoint(startPt, transform);
      const p2 = toCanvasPoint(endPt, transform);

      const x1 = (p1.x - 400) * scaleX;
      const z1 = (p1.y - 250) * scaleZ;
      const x2 = (p2.x - 400) * scaleX;
      const z2 = (p2.y - 250) * scaleZ;

      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      if (length < 0.08) return;
      const angle = Math.atan2(dx, dz);

      let t = wallThickness;
      if (typeof w.thickness === 'number' && w.thickness > 0) {
        t = Math.min(Math.max(w.thickness * scaleX, 0.035), 0.08);
      }

      result.push({
        id: `cad-wall-${w.id || idx}`,
        midX: (x1 + x2) / 2,
        midZ: (z1 + z2) / 2,
        length,
        angle,
        thickness: t,
      });
    });

    return result;
  }, [parsedGeometry, scaleX, scaleZ, wallThickness]);

  // Doors from parsedGeometry
  const doors3D = useMemo(() => {
    if (!parsedGeometry || !showFurniture) return [];
    const rawDoors = (parsedGeometry as any).doors || [];
    const allPoints: Array<{ x: number; y: number }> = [];
    (parsedGeometry.walls || []).forEach((w: any) => {
      const p1 = w.start ||
        (w.points && w.points[0]) || { x: w.x1 ?? 0, y: w.y1 ?? 0 };
      const p2 = w.end ||
        (w.points && w.points[1]) || { x: w.x2 ?? 0, y: w.y2 ?? 0 };
      if (typeof p1.x === 'number') allPoints.push(p1);
      if (typeof p2.x === 'number') allPoints.push(p2);
    });
    const fallbackBox =
      (parsedGeometry as any)?.bounds ||
      (parsedGeometry as any)?.boundingBox ||
      null;
    const transform = computeTransform(allPoints, fallbackBox, 800, 500);

    return rawDoors
      .map((d: any, idx: number) => {
        const pt =
          d.swing?.center || d.position || d.start || (d.points && d.points[0]);
        if (!pt) return null;
        const cp = toCanvasPoint(pt, transform);
        const x = (cp.x - 400) * scaleX;
        const z = (cp.y - 250) * scaleZ;
        return {
          id: `door-${idx}`,
          x,
          z,
          angle: d.rotation || 0,
        };
      })
      .filter(Boolean);
  }, [parsedGeometry, scaleX, scaleZ, showFurniture]);

  // Windows from parsedGeometry
  const windows3D = useMemo(() => {
    if (!parsedGeometry) return [];
    const rawWindows = (parsedGeometry as any).windows || [];
    const allPoints: Array<{ x: number; y: number }> = [];
    (parsedGeometry.walls || []).forEach((w: any) => {
      const p1 = w.start ||
        (w.points && w.points[0]) || { x: w.x1 ?? 0, y: w.y1 ?? 0 };
      const p2 = w.end ||
        (w.points && w.points[1]) || { x: w.x2 ?? 0, y: w.y2 ?? 0 };
      if (typeof p1.x === 'number') allPoints.push(p1);
      if (typeof p2.x === 'number') allPoints.push(p2);
    });
    const fallbackBox =
      (parsedGeometry as any)?.bounds ||
      (parsedGeometry as any)?.boundingBox ||
      null;
    const transform = computeTransform(allPoints, fallbackBox, 800, 500);

    return rawWindows
      .map((win: any, idx: number) => {
        const startPt = win.start ||
          (win.points && win.points[0]) || { x: win.x1 ?? 0, y: win.y1 ?? 0 };
        const endPt = win.end ||
          (win.points && win.points[1]) || { x: win.x2 ?? 0, y: win.y2 ?? 0 };
        const p1 = toCanvasPoint(startPt, transform);
        const p2 = toCanvasPoint(endPt, transform);
        const x1 = (p1.x - 400) * scaleX;
        const z1 = (p1.y - 250) * scaleZ;
        const x2 = (p2.x - 400) * scaleX;
        const z2 = (p2.y - 250) * scaleZ;
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);
        if (length < 0.05) return null;
        const angle = Math.atan2(dx, dz);
        return {
          id: `win-${idx}`,
          midX: (x1 + x2) / 2,
          midZ: (z1 + z2) / 2,
          length,
          angle,
        };
      })
      .filter(Boolean);
  }, [parsedGeometry, scaleX, scaleZ]);

  // Overall building interior footprint for display plinth
  const buildingBounds = useMemo(() => {
    if (walls3D.length === 0) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    walls3D.forEach((w) => {
      minX = Math.min(minX, w.midX - w.length / 2);
      maxX = Math.max(maxX, w.midX + w.length / 2);
      minZ = Math.min(minZ, w.midZ - w.length / 2);
      maxZ = Math.max(maxZ, w.midZ + w.length / 2);
    });
    if (minX === Infinity) return null;
    return {
      midX: (minX + maxX) / 2,
      midZ: (minZ + maxZ) / 2,
      width: Math.max(maxX - minX + 0.4, 12),
      depth: Math.max(maxZ - minZ + 0.4, 10),
    };
  }, [walls3D]);

  return (
    <>
      {/* ── Studio Lighting (Rich Depth & Form Definition) ── */}
      {isStudio ? (
        <>
          <ambientLight intensity={0.65} color="#F8FAFC" />
          <directionalLight
            position={[-20, 28, 18]}
            intensity={1.4}
            color="#FFFDF5"
          />
          <directionalLight
            position={[18, 16, -14]}
            intensity={0.6}
            color="#E2E8F0"
          />
          <directionalLight
            position={[0, 22, 0]}
            intensity={0.3}
            color="#FFFFFF"
          />
        </>
      ) : (
        <>
          <ambientLight intensity={0.7} />
          <directionalLight position={[18, 24, 14]} intensity={1.1} />
          <directionalLight position={[-14, 16, -10]} intensity={0.5} />
        </>
      )}

      {/* Camera Rig & OrbitControls with Smooth Damping */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[20, 18, 20]}
        fov={28}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        enableDamping={true}
        dampingFactor={0.06}
        minDistance={4}
        maxDistance={65}
      />
      <SmoothCameraRig
        targetCamera={targetCamera}
        onTargetReached={onTargetReached}
        cameraRef={cameraRef}
        controlsRef={controlsRef}
      />

      {/* ── Multi-tiered Architectural Display Plinth (Minimalist Dollhouse Base) ── */}
      {buildingBounds && isStudio ? (
        <group position={[buildingBounds.midX, 0, buildingBounds.midZ]}>
          {/* Top Floor Plate (Natural Oak Hardwood) */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry
              args={[buildingBounds.width, 0.02, buildingBounds.depth]}
            />
            <meshStandardMaterial
              map={getWoodFloorTexture()}
              roughness={0.45}
              metalness={0.03}
            />
          </mesh>

          {/* Architectural Cutaway Plaster / Concrete Sub-Slab */}
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry
              args={[
                buildingBounds.width + 0.25,
                0.12,
                buildingBounds.depth + 0.25,
              ]}
            />
            <meshStandardMaterial color="#EAE6DF" roughness={0.88} />
          </mesh>

          {/* Floating Studio Halo Pedestal Disc */}
          <mesh position={[0, -0.13, 0]}>
            <boxGeometry
              args={[
                buildingBounds.width + 0.7,
                0.02,
                buildingBounds.depth + 0.7,
              ]}
            />
            <meshStandardMaterial color="#DDD8CF" roughness={0.95} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, -0.04, 0]} onClick={() => onZoneSelect(null)}>
          <boxGeometry args={[44, 0.08, 36]} />
          <meshStandardMaterial
            color={isStudio ? '#F1F5F9' : '#0F172A'}
            roughness={0.9}
          />
        </mesh>
      )}

      {showGrid && !isStudio && (
        <gridHelper
          args={[30, 30, '#334155', '#1E293B']}
          position={[0, 0.01, 0]}
        />
      )}

      {/* ── Extruded Modern Architectural Dollhouse Walls (Clean & Flush) ── */}
      {walls3D.map((wall) => {
        return (
          <group
            key={wall.id}
            position={[wall.midX, 0, wall.midZ]}
            rotation={[0, wall.angle, 0]}
          >
            {/* Main Architectural Wall Body */}
            <mesh position={[0, wallH / 2, 0]} material={wallMaterial}>
              <boxGeometry args={[wall.thickness, wallH, wall.length]} />
            </mesh>

            {/* Flush Architectural Top Trim */}
            <mesh position={[0, wallH + 0.006, 0]} material={wallCapMaterial}>
              <boxGeometry args={[wall.thickness, 0.012, wall.length]} />
            </mesh>
          </group>
        );
      })}

      {/* Framed Windows */}
      {windows3D.map((win: any) => (
        <ArchitecturalWindow3D
          key={win.id}
          x={win.midX}
          z={win.midZ}
          length={win.length}
          angle={win.angle}
        />
      ))}

      {/* Wooden Doors */}
      {doors3D.map((door: any) => (
        <WoodenDoor3D key={door.id} x={door.x} z={door.z} angle={door.angle} />
      ))}

      {/* Render Zones & Realistic Furniture */}
      {showZones &&
        zones.map((zone) => (
          <Zone3D
            key={zone.id}
            zone={zone}
            scaleX={scaleX}
            scaleZ={scaleZ}
            isSelected={selectedZoneId === zone.id}
            onSelect={() => onZoneSelect(zone.id)}
            isStudio={isStudio}
            showFurniture={showFurniture}
          />
        ))}

      {/* Render IoT Devices */}
      {showDevices &&
        devices.map((device) => {
          const isOn = devicePowerState[device.id] ?? true;
          return (
            <Device3D
              key={device.id}
              device={device}
              isOn={isOn}
              onToggle={() => onToggleDevice(device.id)}
              scaleX={scaleX}
              scaleZ={scaleZ}
            />
          );
        })}

      {/* Topology Connections */}
      {showConnections &&
        devices.length > 1 &&
        devices.map((device, idx) => {
          if (idx === 0) return null;
          const prev = devices[idx - 1];
          const isPrevOn = devicePowerState[prev.id] ?? true;
          const isCurrOn = devicePowerState[device.id] ?? true;
          const isLinkActive = isPrevOn && isCurrOn;

          const x1 = (prev.x - 400) * scaleX;
          const z1 = (prev.y - 250) * scaleZ;
          const x2 = (device.x - 400) * scaleX;
          const z2 = (device.y - 250) * scaleZ;

          return (
            <Line
              key={`conn-${prev.id}-${device.id}`}
              points={[
                [x1, 0.45, z1],
                [x2, 0.45, z2],
              ]}
              color={
                isLinkActive ? '#10B981' : isStudio ? '#94A3B8' : '#475569'
              }
              lineWidth={isLinkActive ? 2.5 : 1}
              dashed={isLinkActive}
            />
          );
        })}
    </>
  );
};

// ─── Main FloorPlan3DViewer Component ──────────────────────────────────────────

export interface FloorPlan3DViewerProps {
  planName?: string;
  zones: Array<{
    id: string;
    name: string;
    type?: string;
    color?: string;
    x: number;
    y: number;
    w: number;
    h: number;
    boundaries?: Array<{ x: number; y: number }>;
  }>;
  devices: Array<{
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
  }>;
  parsedGeometry?: ParsedGeometry;
  dimensions?: { width: number; height: number };
  selectedZoneId?: string | null;
  onZoneSelect?: (zoneId: string | null) => void;
  devicePowerState: Record<string, boolean>;
  onToggleDevice: (deviceId: string) => void;
  wallThickness?: number;
  className?: string;
}

export default function FloorPlan3DViewer({
  planName,
  zones,
  devices,
  parsedGeometry,
  dimensions,
  selectedZoneId,
  onZoneSelect = () => {},
  devicePowerState,
  onToggleDevice,
  wallThickness,
  className = '',
}: FloorPlan3DViewerProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);

  const [themeMode, setThemeMode] = useState<'studio' | 'dark'>('studio');
  const [wallColorTheme, setWallColorTheme] =
    useState<WallColorTheme>('lightGray');
  const [currentWallThickness, setCurrentWallThickness] = useState<number>(
    wallThickness ?? 0.055
  );

  const [showZones, setShowZones] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [showConnections, setShowConnections] = useState(false);
  const [showFurniture, setShowFurniture] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const [targetCamera, setTargetCamera] = useState<CameraTarget | null>(null);

  // Smooth camera view presets (Isometric dollhouse, Top blueprint, Elevations)
  const handleIsometricView = () => {
    setTargetCamera({
      pos: [20, 18, 20],
      target: [0, 0, 0],
    });
  };

  const handleTopView = () => {
    setTargetCamera({
      pos: [0, 28, 0.01],
      target: [0, 0, 0],
    });
  };

  const handleFrontView = () => {
    setTargetCamera({
      pos: [0, 12, 26],
      target: [0, 0, 0],
    });
  };

  const handleSideView = () => {
    setTargetCamera({
      pos: [26, 12, 0],
      target: [0, 0, 0],
    });
  };

  const handleZoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const target = controls.target || new THREE.Vector3();
      const currentDist = camera.position.distanceTo(target);
      const newDist = Math.max(5, currentDist * 0.78);
      const newPos = new THREE.Vector3()
        .copy(target)
        .sub(direction.multiplyScalar(newDist));
      setTargetCamera({
        pos: [newPos.x, newPos.y, newPos.z],
        target: [target.x, target.y, target.z],
      });
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const target = controls.target || new THREE.Vector3();
      const currentDist = camera.position.distanceTo(target);
      const newDist = Math.min(55, currentDist * 1.25);
      const newPos = new THREE.Vector3()
        .copy(target)
        .sub(direction.multiplyScalar(newDist));
      setTargetCamera({
        pos: [newPos.x, newPos.y, newPos.z],
        target: [target.x, target.y, target.z],
      });
    }
  };

  const activeDeviceCount = useMemo(() => {
    return devices.filter((d) => devicePowerState[d.id] ?? true).length;
  }, [devices, devicePowerState]);

  const isStudio = themeMode === 'studio';

  return (
    <div
      className={`relative w-full h-[600px] lg:h-[720px] rounded-xl overflow-hidden border shadow-xl transition-colors duration-500 ${
        isStudio
          ? 'bg-slate-100 border-slate-300'
          : 'bg-slate-950 border-slate-800'
      } ${className}`}
    >
      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              isStudio ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 mx-auto" />
              <p className="text-sm font-medium">
                Rendering Dollhouse 3D Model...
              </p>
            </div>
          </div>
        }
      >
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
          camera={{ position: [20, 18, 20], fov: 28 }}
        >
          <Scene3D
            zones={zones}
            devices={devices}
            parsedGeometry={parsedGeometry}
            selectedZoneId={selectedZoneId}
            onZoneSelect={onZoneSelect}
            showZones={showZones}
            showDevices={showDevices}
            showConnections={showConnections}
            showGrid={showGrid}
            showFurniture={showFurniture}
            themeMode={themeMode}
            wallColorTheme={wallColorTheme}
            devicePowerState={devicePowerState}
            onToggleDevice={onToggleDevice}
            wallThickness={currentWallThickness}
            targetCamera={targetCamera}
            onTargetReached={() => setTargetCamera(null)}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
          />
        </Canvas>
      </Suspense>

      {/* Top Left: Title, Theme & Status Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div
          className={`backdrop-blur-md px-3 py-1.5 rounded-lg border shadow-sm flex items-center gap-2 text-xs font-semibold ${
            isStudio
              ? 'bg-white/95 border-slate-200 text-slate-800'
              : 'bg-slate-900/90 border-slate-700 text-white'
          }`}
        >
          <Home
            className={`h-4 w-4 ${
              isStudio ? 'text-amber-600' : 'text-cyan-400'
            }`}
          />
          <span className="tracking-wide">ISOMETRIC DOLLHOUSE 3D</span>
        </div>

        {devices.length > 0 && (
          <Badge
            variant="outline"
            className={`backdrop-blur-md text-xs px-2 py-1 ${
              isStudio
                ? 'bg-white/95 border-emerald-500 text-emerald-700'
                : 'bg-slate-900/90 border-emerald-500/50 text-emerald-400'
            }`}
          >
            {activeDeviceCount} / {devices.length} Online
          </Badge>
        )}
      </div>

      {/* Top Right: Style, Details, Wall Theme & Thickness Switchers */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-2">
        {/* Style Mode: Studio vs Dark */}
        <div
          className={`backdrop-blur-md p-1 rounded-lg border shadow-sm flex items-center gap-1 ${
            isStudio
              ? 'bg-white/95 border-slate-200'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${
              isStudio
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setThemeMode('studio')}
            title="Studio Dollhouse Day Mode"
          >
            <Sun className="h-3.5 w-3.5 mr-1 text-amber-500" />
            Studio
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${
              !isStudio
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setThemeMode('dark')}
            title="Dark Blueprint Mode"
          >
            <Moon className="h-3.5 w-3.5 mr-1 text-blue-400" />
            Dark
          </Button>
        </div>

        {/* Wall Color Preset Switcher */}
        {isStudio && (
          <div className="backdrop-blur-md p-1 rounded-lg border shadow-sm flex items-center gap-1 bg-white/95 border-slate-200">
            <Palette className="h-3.5 w-3.5 ml-1 text-slate-500" />
            <span className="text-[10px] px-1 font-medium text-slate-500 hidden sm:inline">
              Wall:
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-1.5 text-xs ${
                wallColorTheme === 'lightGray'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setWallColorTheme('lightGray')}
              title="8K HD Light Gray Architectural Finish"
            >
              Light Gray
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-1.5 text-xs ${
                wallColorTheme === 'pearl'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setWallColorTheme('pearl')}
              title="Modern Pearl White"
            >
              Pearl
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-1.5 text-xs ${
                wallColorTheme === 'pure'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setWallColorTheme('pure')}
              title="Pure Studio White"
            >
              Pure
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-1.5 text-xs ${
                wallColorTheme === 'linen'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setWallColorTheme('linen')}
              title="Architectural Linen"
            >
              Linen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-1.5 text-xs ${
                wallColorTheme === 'slate'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setWallColorTheme('slate')}
              title="Modern Slate Gray"
            >
              Slate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-1.5 text-xs ${
                wallColorTheme === 'charcoal'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setWallColorTheme('charcoal')}
              title="Modern Dark Charcoal"
            >
              Charcoal
            </Button>
          </div>
        )}

        {/* Interior Furniture Detailing Toggle */}
        <div
          className={`backdrop-blur-md p-1 rounded-lg border shadow-sm flex items-center gap-1 ${
            isStudio
              ? 'bg-white/95 border-slate-200'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${
              showFurniture
                ? isStudio
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'bg-blue-500/20 text-blue-300 font-semibold'
                : isStudio
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setShowFurniture((f) => !f)}
            title="Toggle Interior Furniture Detailing"
          >
            <Armchair className="h-3.5 w-3.5 mr-1" />
            Furniture
          </Button>
        </div>

        {/* Wall Thickness Switcher */}
        <div
          className={`backdrop-blur-md p-1 rounded-lg border shadow-sm flex items-center gap-1 ${
            isStudio
              ? 'bg-white/95 border-slate-200'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <span
            className={`text-[10px] px-1 font-medium hidden sm:inline ${
              isStudio ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Thickness:
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-1.5 text-xs ${
              currentWallThickness === 0.035
                ? isStudio
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : isStudio
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setCurrentWallThickness(0.035)}
            title="Slim Walls"
          >
            Slim
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-1.5 text-xs ${
              currentWallThickness === 0.055
                ? isStudio
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : isStudio
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setCurrentWallThickness(0.055)}
            title="Standard Walls"
          >
            Standard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-1.5 text-xs ${
              currentWallThickness === 0.08
                ? isStudio
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : isStudio
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setCurrentWallThickness(0.08)}
            title="Solid Walls"
          >
            Solid
          </Button>
        </div>

        {/* Layer Buttons */}
        <div
          className={`backdrop-blur-md p-1 rounded-lg border shadow-sm flex items-center gap-1 ${
            isStudio
              ? 'bg-white/95 border-slate-200'
              : 'bg-slate-900/90 border-slate-700'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${
              showZones
                ? isStudio
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'bg-cyan-500/20 text-cyan-300'
                : isStudio
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setShowZones((s) => !s)}
            title="Toggle Zones"
          >
            <Layers className="h-3.5 w-3.5 mr-1" />
            Zones
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${
              showDevices
                ? isStudio
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'bg-emerald-500/20 text-emerald-300'
                : isStudio
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setShowDevices((s) => !s)}
            title="Toggle Devices"
          >
            <Cpu className="h-3.5 w-3.5 mr-1" />
            Devices
          </Button>
        </div>
      </div>

      {/* Bottom Right: Smooth Isometric & Elevation View Presets */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <div
          className={`backdrop-blur-md p-1 rounded-lg border shadow-sm flex items-center gap-1 ${
            isStudio
              ? 'bg-white/95 border-slate-200 text-slate-800'
              : 'bg-slate-900/90 border-slate-700 text-white'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium"
            onClick={handleIsometricView}
            title="Isometric Dollhouse 3D View"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-amber-600" />
            Isometric
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium"
            onClick={handleTopView}
            title="Top-Down Plan View"
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1 text-blue-500" />
            Top
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium"
            onClick={handleFrontView}
            title="Front Elevation"
          >
            <Eye className="h-3.5 w-3.5 mr-1 text-emerald-500" />
            Front
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium"
            onClick={handleSideView}
            title="Side Elevation"
          >
            <Compass className="h-3.5 w-3.5 mr-1 text-purple-500" />
            Side
          </Button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
