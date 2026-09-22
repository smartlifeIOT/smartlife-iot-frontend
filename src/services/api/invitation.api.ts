import { apiClient } from './apiClient';

export interface IntegrationQuery {
  search?: string;
  type?: string;
  status?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

interface CreatePasswordInvitation {
  token: string;
  password: string;
  confirmPassword: string;
}

export const AccceptInivation = {
  // Get all integrations
  createPasswordInvitation: (invite?: CreatePasswordInvitation) =>
    apiClient.post<ApiResponse<string>>('/auth/set-password', invite),
};
