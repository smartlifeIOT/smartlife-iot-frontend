import { create } from 'zustand';
import type { Device } from '@/services/api/devices.api.ts';
import type { DeviceFilters } from '../types/index.ts';

interface DeviceStore {
  selectedDevices: string[];
  filters: DeviceFilters;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'type' | 'createdAt' | 'lastActivityTime';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setSelectedDevices: (devices: string[]) => void;
  toggleDeviceSelection: (deviceId: string) => void;
  clearSelection: () => void;
  setFilters: (filters: DeviceFilters) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSorting: (sortBy: DeviceStore['sortBy'], sortOrder: DeviceStore['sortOrder']) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  selectedDevices: [],
  filters: {},
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',

  setSelectedDevices: (devices) => set({ selectedDevices: devices }),
  
  toggleDeviceSelection: (deviceId) =>
    set((state) => ({
      selectedDevices: state.selectedDevices.includes(deviceId)
        ? state.selectedDevices.filter((id) => id !== deviceId)
        : [...state.selectedDevices, deviceId],
    })),

  clearSelection: () => set({ selectedDevices: [] }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: {} }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
}));