import { create } from 'zustand';
import type { UserFilters } from '../types';

interface UserStore {
  selectedUsers: string[];
  filters: UserFilters;
  
  setSelectedUsers: (users: string[]) => void;
  toggleUserSelection: (userId: string) => void;
  clearSelection: () => void;
  setFilters: (filters: UserFilters) => void;
  resetFilters: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  selectedUsers: [],
  filters: {},

  setSelectedUsers: (users) => set({ selectedUsers: users }),
  toggleUserSelection: (userId) =>
    set((state) => ({
      selectedUsers: state.selectedUsers.includes(userId)
        ? state.selectedUsers.filter((id) => id !== userId)
        : [...state.selectedUsers, userId],
    })),
  clearSelection: () => set({ selectedUsers: [] }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),
}));