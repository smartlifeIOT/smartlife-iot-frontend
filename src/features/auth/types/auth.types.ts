export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  companyName?:string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  mobile?: string;
}

export interface AuthResponse {
  requires2FA: boolean;
  data?: any;
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number | string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  token?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}