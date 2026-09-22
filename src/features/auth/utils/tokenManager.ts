import axios from 'axios';
import { env } from '@/config/env.ts';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

class TokenManager {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.clearTokens();
      throw new Error('No refresh token available');
    }

    try {
      // Use direct axios to avoid interceptor loop
      const response = await axios.post(
        `${env.apiUrl}/auth/refresh`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const { accessToken } = response.data;
      
      if (accessToken) {
        this.setAccessToken(accessToken);
        return accessToken;
      }
      
      throw new Error('No access token in response');
    } catch (error: any) {
      console.error('Token refresh failed:', error.response?.data?.message || error.message);
      this.clearTokens();
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const tokenManager = new TokenManager();