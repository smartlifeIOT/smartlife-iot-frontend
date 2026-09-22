export interface FilterFormValues {
  search: string;
  type: string;
  status: string;
  drawingScale: string;
  drawingUnit: string;
  zoneName?: string;
  zoneType?: string;
  zoneDescription?: string;
  floorName?: string;
}

export interface AssetOption {
  active: boolean;
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  notes?: string[];
  description: string;
  latitude: string;
  longitude: string;
  isReady?: boolean;
  devicesAvailable?: number;
  hasExistingFloorMap?: boolean;
}

export interface Zone {
  id: string;
  name: string;
  type: string;
  area: number;
  capacity: number;
  status: string;
  floor: string;
  description: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isDefined: boolean;
  /** Polygon boundary points from parsedGeometry (in canvas-scaled pixels) */
  boundaries?: Array<{ x: number; y: number }>;
  /** Original room ID from parsedGeometry, if auto-detected */
  sourceRoomId?: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'idle' | 'error';
  assignedTo?: string; // Room/Zone ID
}

export interface Room {
  id: string;
  name: string;
  devices: Device[];
}

export interface UploadedFile {
  id: string;
  file: File;
  floor: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  previewUrl?: string;
  fileUrl?: string;
}
