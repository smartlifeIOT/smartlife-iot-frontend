import { create } from 'zustand';
import type { AlarmFilters } from '../types';

interface AlarmStore {
  selectedAlarms: string[];
  filters: AlarmFilters;
  autoRefresh: boolean;
  
  setSelectedAlarms: (alarms: string[]) => void;
  toggleAlarmSelection: (alarmId: string) => void;
  clearSelection: () => void;
  setFilters: (filters: AlarmFilters) => void;
  resetFilters: () => void;
  setAutoRefresh: (enabled: boolean) => void;
}

export const useAlarmStore = create<AlarmStore>((set) => ({
  selectedAlarms: [],
  filters: {},
  autoRefresh: true,

  setSelectedAlarms: (alarms) => set({ selectedAlarms: alarms }),
  toggleAlarmSelection: (alarmId) =>
    set((state) => ({
      selectedAlarms: state.selectedAlarms.includes(alarmId)
        ? state.selectedAlarms.filter((id) => id !== alarmId)
        : [...state.selectedAlarms, alarmId],
    })),
  clearSelection: () => set({ selectedAlarms: [] }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),
  setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
}));