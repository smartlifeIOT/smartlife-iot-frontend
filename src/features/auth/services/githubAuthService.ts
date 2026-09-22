/**
 * GitHub OAuth Service
 * Handles GitHub authentication flow
 */

export class GithubAuthService {
  /**
   * Redirect to backend GitHub OAuth endpoint
   * This is a simpler approach that handles OAuth on the backend
   */
  static redirectToGithubLogin(redirectUri?: string): void {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.125:5000';
    const callbackUri = redirectUri || `${window.location.origin}/auth/github/callback`;
    const githubAuthUrl = `${backendUrl}/auth/github?redirect_uri=${encodeURIComponent(callbackUri)}`;
    window.location.href = githubAuthUrl;
  }
}

