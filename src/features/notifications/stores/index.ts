import { create } from 'zustand';
import type { NotificationFilters } from '../types';

interface NotificationStore {
  filters: NotificationFilters;
  showUnreadOnly: boolean;
  
  setFilters: (filters: NotificationFilters) => void;
  resetFilters: () => void;
  setShowUnreadOnly: (show: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  filters: {},
  showUnreadOnly: false,

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),
  setShowUnreadOnly: (show) => set({ showUnreadOnly: show }),
}));