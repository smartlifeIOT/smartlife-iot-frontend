import { useAppStore } from '@/stores/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService.ts';
import { useEffect } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout } = useAppStore();

  // Only fetch current user if authenticated but no user data
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated && !user, // Only fetch if authenticated but no user data
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (currentUser && !user) {
      // Transform API User to store User format
      // const nameParts = currentUser.name?.split(' ') || [];
      const firstName = currentUser.firstName || '';
      const lastName = currentUser.lastName || '';

      setUser({
        id: currentUser.id || '',
        email: currentUser.email || '',
        firstName,
        lastName,
        role: currentUser.role || '',
      });
    }
  }, [currentUser, user, setUser]);

  return {
    user: user || currentUser,
    isAuthenticated,
    isLoading,
    logout,
  };
};
