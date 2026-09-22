import { toast } from 'react-hot-toast';

/**
 * GitHub Login Hook
 * Handles GitHub OAuth authentication via redirect to backend
 */
export const useGithubLogin = () => {
  const handleGithubLogin = () => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.125:5000/api';
      const redirectUri = `${window.location.origin}/auth/callback`;
      const githubAuthUrl = `${backendUrl}/auth/github?redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;

      // Redirect to backend GitHub OAuth endpoint
      window.location.href = githubAuthUrl;
    } catch (error) {
      console.error('Failed to initiate GitHub login:', error);
      toast.error('Failed to initiate GitHub login. Please try again.');
    }
  };

  return {
    handleGithubLogin,
    isLoading: false, // Always false for redirect approach
  };
};

