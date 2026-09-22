import { create } from 'zustand';
import type { ProfileFilters, ProfileType } from '../types';

interface ProfileStore {
  filters: ProfileFilters;
  profileType: ProfileType;
  
  setFilters: (filters: ProfileFilters) => void;
  resetFilters: () => void;
  setProfileType: (type: ProfileType) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  filters: {},
  profileType: 'device',

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),
  setProfileType: (type) => set({ profileType: type }),
}));