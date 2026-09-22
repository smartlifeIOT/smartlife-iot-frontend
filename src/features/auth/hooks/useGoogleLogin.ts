import { toast } from 'react-hot-toast';

/**
 * Google Login Hook
 * Handles Google OAuth authentication via redirect to backend
 */
export const useGoogleLogin = () => {
  const handleGoogleLogin = () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.125:5000/api';
      const redirectUri = `${window.location.origin}/auth/callback`;
      const googleAuthUrl = `${backendUrl}/auth/google?redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;

      // Redirect to backend Google OAuth endpoint
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Failed to initiate Google login:', error);
      toast.error('Failed to initiate Google login. Please try again.');
    }
  };

  return {
    handleGoogleLogin,
    isLoading: false, // Always false for redirect approach
  };
};
