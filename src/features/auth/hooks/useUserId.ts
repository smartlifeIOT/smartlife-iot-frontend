import { useAppStore } from '@/stores/useAppStore';

interface PersistedAppState {
  state?: {
    user?: {
      id?: string;
    } | null;
  };
}

const getUserIdFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('app-storage');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedAppState;
    return parsed.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

export const useUserId = (): string | null => {
  const userId = useAppStore((state) => state.user?.id ?? null);

  if (userId) return userId;
  return getUserIdFromStorage();
};
