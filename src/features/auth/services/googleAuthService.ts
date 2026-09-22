/**
 * Google OAuth Service
 * Handles Google authentication flow
 */

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

export class GoogleAuthService {
  /**
   * Redirect to backend Google OAuth endpoint
   * This is a simpler approach that handles OAuth on the backend
   */
  static redirectToGoogleLogin(redirectUri?: string): void {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const callbackUri = redirectUri || `${window.location.origin}/auth/google/callback`;
    const googleAuthUrl = `${backendUrl}/auth/google?redirect_uri=${encodeURIComponent(callbackUri)}`;
    window.location.href = googleAuthUrl;
  }
}
