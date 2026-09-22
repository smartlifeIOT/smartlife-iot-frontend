// import { create } from 'zustand';
// import type { AuditFilters } from '../types';

// interface AuditStore {
//   filters: AuditFilters;
  
//   setFilters: (filters: AuditFilters) => void;
//   resetFilters: () => void;
// }

// export const useAuditStore = create<AuditStore>((set) => ({
//   filters: {},

//   setFilters: (filters) =>
//     set((state) => ({ filters: { ...state.filters, ...filters } })),
//   resetFilters: () => set({ filters: {} }),
// }));