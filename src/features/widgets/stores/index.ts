import { create } from 'zustand';
import type { WidgetFilters } from '../types';

interface WidgetStore {
  filters: WidgetFilters;
  selectedCategory?: string;
  
  setFilters: (filters: WidgetFilters) => void;
  resetFilters: () => void;
  setSelectedCategory: (category?: string) => void;
}

export const useWidgetStore = create<WidgetStore>((set) => ({
  filters: {},
  selectedCategory: undefined,

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));