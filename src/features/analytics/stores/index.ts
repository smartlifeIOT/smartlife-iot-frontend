import { create } from 'zustand';

interface AnalyticsStore {
  selectedMetrics: string[];
  timeRange: { start: number; end: number };
  
  setSelectedMetrics: (metrics: string[]) => void;
  setTimeRange: (range: { start: number; end: number }) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  selectedMetrics: [],
  timeRange: {
    start: Date.now() - 86400000,
    end: Date.now(),
  },

  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
  setTimeRange: (range) => set({ timeRange: range }),
}));