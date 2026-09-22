import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getSystemTheme } from '@/utils/helpers/SystemHelpers';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeStore {
  theme: Theme;
  effectiveTheme: 'light' | 'dark' | 'auto';
  language: string;
  features: string[];
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setFeatures: (features: string[]) => void;
  syncFromApi: (settings: {
    theme?: Theme;
    language?: string;
    features?: string[];
  }) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
    (set, get) => ({
      theme: 'auto',
      language: 'en',
      features: [],
      effectiveTheme: getSystemTheme(),
      setTheme: (theme: Theme) => {
        const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
        // Update document class
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
          document.documentElement.setAttribute('data-theme', effectiveTheme);
        }

        set({ theme, effectiveTheme });
      },

      setLanguage: (language: string) => {
        set({ language });
      },

      setFeatures: (features: string[]) => {
        set({ features });
      },

      syncFromApi: (settings: {
        theme?: Theme;
        language?: string;
        features?: string[];
      }) => {
        const currentState = get();

        if (settings.theme !== undefined) {
          // Map 'system' from API to 'auto' for theme store
          const themeForStore: Theme = settings.theme;
          if (themeForStore !== currentState.theme) {
            get().setTheme(themeForStore);
          }
        }

        if (
          settings.language !== undefined &&
          settings.language !== currentState.language
        ) {
          set({ language: settings.language });
        }

        if (settings.features !== undefined) {
          set({ features: settings.features });
        }
      },

      toggleTheme: () => {
        const { effectiveTheme } = get();
        const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Calculate the effective theme based on current system preference
          const effectiveTheme =
            state.theme === 'auto' ? getSystemTheme() : state.theme;
          // Apply theme to document
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
          document.documentElement.setAttribute('data-theme', effectiveTheme);
          // Update the store state with the correct effectiveTheme
          // This ensures components using effectiveTheme get the right value
          useThemeStore.setState({ effectiveTheme });
        }
      },
    }
  ),
  { name: 'ThemeStore' }
)
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      const store = useThemeStore.getState();
      if (store.theme === 'auto') {
        // Update effectiveTheme when system theme changes
        const newEffectiveTheme = e.matches ? 'dark' : 'light';
        store.setTheme('auto');
        // Ensure the effectiveTheme is updated
        useThemeStore.setState({ effectiveTheme: newEffectiveTheme });
      }
    });
}
