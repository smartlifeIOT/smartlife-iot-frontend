import apiClient from '@/lib/axios.ts';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  User,
} from '../types/auth.types.ts';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data.data;
  },
  async logout(refreshToken: string, accessToken: string): Promise<void> {
    await apiClient.post(
      '/auth/logout',
      { refreshToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data.data;
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data.data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.get('/auth/verify-email', {
      params: { token },
    });
    return response.data.data;
  },

  async verifyToken(): Promise<{ valid: boolean }> {
    const response = await apiClient.get('/auth/verify-token');
    return response.data.data;
  },

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', {
      credential,
    });
    return response.data.data;
  },

  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/exchange-code', {
      code,
    });
    return response.data.data;
  },
};