import localStorageService from '@/services/storage/localStorage';
import { AppState } from '@/types/authentication';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // User State
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        logout: () => {
          localStorageService.removeToken();
          set({
            user: null,
            isAuthenticated: false,
            features: null,
          });
        },
        // Features
        features: null,
        setFeatures: (features) => set({ features }),
        // UI State
        sidebarOpen: true,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        // Loading
        isLoading: false,
        setLoading: (loading) => set({ isLoading: loading }),
        // Modal
        activeModal: null,
        setActiveModal: (modal) => set({ activeModal: modal }),
        // Search
        searchQuery: '',
        setSearchQuery: (query) => set({ searchQuery: query }),
      }),
      {
        name: 'app-storage',
        // Only persist user authentication state, not UI preferences
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          features: state.features,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);
