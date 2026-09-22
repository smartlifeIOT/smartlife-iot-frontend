import { create } from 'zustand';
import type { AssetFilters } from '../types';

interface AssetStore {
  selectedAssets: string[];
  expandedNodes: string[];
  filters: AssetFilters;
  viewMode: 'tree' | 'list';
  
  setSelectedAssets: (assets: string[]) => void;
  toggleAssetSelection: (assetId: string) => void;
  clearSelection: () => void;
  setExpandedNodes: (nodes: string[]) => void;
  toggleNodeExpansion: (nodeId: string) => void;
  setFilters: (filters: AssetFilters) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'tree' | 'list') => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  selectedAssets: [],
  expandedNodes: [],
  filters: {},
  viewMode: 'tree',

  setSelectedAssets: (assets) => set({ selectedAssets: assets }),

  toggleAssetSelection: (assetId) =>
    set((state) => ({
      selectedAssets: state.selectedAssets.includes(assetId)
        ? state.selectedAssets.filter((id) => id !== assetId)
        : [...state.selectedAssets, assetId],
    })),

  clearSelection: () => set({ selectedAssets: [] }),

  setExpandedNodes: (nodes) => set({ expandedNodes: nodes }),

  toggleNodeExpansion: (nodeId) =>
    set((state) => ({
      expandedNodes: state.expandedNodes.includes(nodeId)
        ? state.expandedNodes.filter((id) => id !== nodeId)
        : [...state.expandedNodes, nodeId],
    })),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: {} }),

  setViewMode: (mode) => set({ viewMode: mode }),
}));