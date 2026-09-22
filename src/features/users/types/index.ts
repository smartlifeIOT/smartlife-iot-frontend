import type { User, UserRole, UserStatus } from '@/services/api/users.api';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export type UserAction = 'edit' | 'delete' | 'activate' | 'deactivate' | 'reset-password';