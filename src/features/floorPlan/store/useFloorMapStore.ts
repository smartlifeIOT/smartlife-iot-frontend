import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  FilterFormValues,
  AssetOption,
  Zone,
  Device,
  Room,
  UploadedFile,
} from '@/features/floorPlan/types';
import type { ParsedGeometry } from '@/features/floorPlan/services/floor-plans.api';

export type StepId = 1 | 2 | 3 | 4 | 5;

interface FloorMapStore {
  // Step management
  currentStep: StepId;
  setCurrentStep: (step: StepId) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Asset selection
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  filteredAssets: AssetOption[];
  setFilteredAssets: (assets: AssetOption[]) => void;

  // Floor plan ID (created after asset selection)
  floorPlanId: string | null;
  setFloorPlanId: (id: string | null) => void;

  // Form values
  formValues: FilterFormValues;
  setFormValues: (values: Partial<FilterFormValues>) => void;
  resetFormValues: () => void;

  // DWG Import step
  selectedFloor: string;
  setSelectedFloor: (floor: string) => void;

  // Parsed geometry received from backend after DWG upload
  parsedGeometry: ParsedGeometry | null;
  setParsedGeometry: (geometry: ParsedGeometry | null) => void;

  // Zone Setup step
  zones: Zone[];
  setZones: (zones: Zone[]) => void;
  addZone: (zone: Zone) => void;
  updateZone: (zoneId: string, updates: Partial<Zone>) => void;
  removeZone: (zoneId: string) => void;
  selectedZoneId: string | null;
  setSelectedZoneId: (zoneId: string | null) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  // Device Link step
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;
  assignedDevices: Record<string, Device[]>; // roomId -> devices
  assignDeviceToRoom: (device: Device, roomId: string) => void;
  unassignDeviceFromRoom: (deviceId: string, roomId: string) => void;
  devicePositions: Record<
    string,
    { x: number; y: number; zoneId: string | null; floor: string }
  >;
  setDevicePosition: (
    deviceId: string,
    position: { x: number; y: number; zoneId: string | null; floor: string }
  ) => void;
  removeDevicePosition: (deviceId: string) => void;
  clearDevicePositions: () => void;

  // Reset all data
  reset: () => void;

  // Uploaded files
  uploadedFiles: UploadedFile[];
}

const defaultFormValues: FilterFormValues = {
  search: '',
  type: 'all',
  status: 'all',
  drawingScale: ' ',
  drawingUnit: 'meters',
  zoneName: undefined,
  zoneType: undefined,
  zoneDescription: undefined,
  floorName: undefined,
};

const defaultState = {
  currentStep: 1 as StepId,
  selectedAssetId: null as string | null,
  filteredAssets: [] as AssetOption[],
  floorPlanId: null as string | null,
  uploadedFiles: [] as UploadedFile[],
  formValues: defaultFormValues,
  selectedFloor: 'Ground',
  parsedGeometry: null as ParsedGeometry | null,
  zones: [] as Zone[],
  selectedZoneId: null as string | null,
  zoomLevel: 100,
  rooms: [] as Room[],
  assignedDevices: {} as Record<string, Device[]>,
  devicePositions: {} as Record<
    string,
    { x: number; y: number; zoneId: string | null; floor: string }
  >,
};

export const useFloorMapStore = create<FloorMapStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,
        // Step management
        setCurrentStep: (step: StepId) => {
          set({ currentStep: step });
        },

        nextStep: () => {
          const { currentStep } = get();
          if (currentStep < 5) {
            set({ currentStep: (currentStep + 1) as StepId });
          }
        },

        previousStep: () => {
          const { currentStep } = get();
          if (currentStep > 1) {
            set({ currentStep: (currentStep - 1) as StepId });
          }
        },

        // Asset selection
        setSelectedAssetId: (id: string | null) => {
          set({ selectedAssetId: id });
        },

        setFilteredAssets: (assets: AssetOption[]) => {
          set({ filteredAssets: assets });
        },

        // Floor plan ID
        setFloorPlanId: (id: string | null) => {
          set({ floorPlanId: id });
        },

        // Form values
        setFormValues: (values: Partial<FilterFormValues>) => {
          set((state) => ({
            formValues: { ...state.formValues, ...values },
          }));
        },

        resetFormValues: () => {
          set({ formValues: defaultFormValues });
        },

        // DWG Import step
        setSelectedFloor: (floor: string) => {
          set({ selectedFloor: floor });
        },

        // Parsed geometry
        setParsedGeometry: (geometry: ParsedGeometry | null) => {
          set({ parsedGeometry: geometry });
        },

        // Zone Setup step
        setZones: (zones: Zone[]) => {
          set({ zones });
        },

        addZone: (zone: Zone) => {
          set((state) => ({
            zones: [...state.zones, zone],
            selectedZoneId: zone.id,
          }));
        },

        updateZone: (zoneId: string, updates: Partial<Zone>) => {
          set((state) => ({
            zones: state.zones.map((zone) =>
              zone.id === zoneId ? { ...zone, ...updates } : zone
            ),
          }));
        },

        removeZone: (zoneId: string) => {
          set((state) => ({
            zones: state.zones.filter((zone) => zone.id !== zoneId),
            selectedZoneId:
              state.selectedZoneId === zoneId ? null : state.selectedZoneId,
          }));
        },

        setSelectedZoneId: (zoneId: string | null) => {
          set({ selectedZoneId: zoneId });
        },

        setZoomLevel: (level: number) => {
          set({ zoomLevel: Math.max(50, Math.min(200, level)) });
        },

        // Device Link step
        setRooms: (rooms: Room[]) => {
          set({ rooms });
        },

        addRoom: (room: Room) => {
          set((state) => ({
            rooms: [...state.rooms, room],
          }));
        },

        updateRoom: (roomId: string, updates: Partial<Room>) => {
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? { ...room, ...updates } : room
            ),
          }));
        },

        removeRoom: (roomId: string) => {
          set((state) => {
            const newAssignedDevices = { ...state.assignedDevices };
            delete newAssignedDevices[roomId];
            return {
              rooms: state.rooms.filter((room) => room.id !== roomId),
              assignedDevices: newAssignedDevices,
            };
          });
        },

        assignDeviceToRoom: (device: Device, roomId: string) => {
          set((state) => {
            const newAssignedDevices = { ...state.assignedDevices };
            const roomDevices = newAssignedDevices[roomId] || [];

            // Check if device is already assigned to this room
            if (!roomDevices.some((d) => d.id === device.id)) {
              // Remove device from other rooms first
              Object.keys(newAssignedDevices).forEach((id) => {
                if (id !== roomId) {
                  newAssignedDevices[id] = newAssignedDevices[id].filter(
                    (d) => d.id !== device.id
                  );
                }
              });

              // Add the full device object to the room
              newAssignedDevices[roomId] = [...roomDevices, device];
            }

            return { assignedDevices: newAssignedDevices };
          });
        },

        unassignDeviceFromRoom: (deviceId: string, roomId: string) => {
          set((state) => {
            const newAssignedDevices = { ...state.assignedDevices };
            const roomDevices = newAssignedDevices[roomId] || [];
            newAssignedDevices[roomId] = roomDevices.filter(
              (d) => d.id !== deviceId
            );
            return { assignedDevices: newAssignedDevices };
          });
        },

        // Device Positions management
        setDevicePosition: (
          deviceId: string,
          position: {
            x: number;
            y: number;
            zoneId: string | null;
            floor: string;
          }
        ) => {
          set((state) => ({
            devicePositions: {
              ...state.devicePositions,
              [deviceId]: position,
            },
          }));
        },

        removeDevicePosition: (deviceId: string) => {
          set((state) => {
            const newPositions = { ...state.devicePositions };
            delete newPositions[deviceId];
            return { devicePositions: newPositions };
          });
        },

        clearDevicePositions: () => {
          set({ devicePositions: {} });
        },

        // Reset all data
        reset: () => {
          set({ ...defaultState });
        },
      }),
      {
        name: 'floor-map-storage',
        // Exclude large geometry/coordinate data that can exceed localStorage quota (~5 MB).
        // parsedGeometry is re-fetched from the API on mount; zones derived from it are
        // re-computed in ZoneSetupStep, so neither needs to survive a page reload.
        partialize: (state) => ({
          currentStep: state.currentStep,
          selectedAssetId: state.selectedAssetId,
          floorPlanId: state.floorPlanId,
          formValues: state.formValues,
          selectedFloor: state.selectedFloor,
          // parsedGeometry intentionally excluded — large DWG coordinate payload
          // zones intentionally excluded — re-derived from parsedGeometry on mount
          selectedZoneId: state.selectedZoneId,
          zoomLevel: state.zoomLevel,
          rooms: state.rooms,
          // Note: filteredAssets are not persisted as they may contain non-serializable data
          assignedDevices: state.assignedDevices,
          devicePositions: state.devicePositions,
        }),
        // Fail gracefully if localStorage is still full (e.g. other apps, large devicePositions)
        storage: {
          getItem: (name) => {
            try {
              const value = localStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            } catch {
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (e) {
              console.warn(
                '[floor-map-storage] localStorage quota exceeded — state not persisted.',
                e
              );
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name);
            } catch {
              // ignore
            }
          },
        },
      }
    ),
    { name: 'FloorMapStore' }
  )
);
