import { create } from 'zustand';

interface DashboardStore {
  currentDashboard?: string;
  editMode: boolean;
  
  setCurrentDashboard: (dashboardId: string) => void;
  setEditMode: (enabled: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  currentDashboard: undefined,
  editMode: false,

  setCurrentDashboard: (dashboardId) => set({ currentDashboard: dashboardId }),
  setEditMode: (enabled) => set({ editMode: enabled }),
}));