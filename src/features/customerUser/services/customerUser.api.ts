import apiClient from '@/lib/axios.ts';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'tenant_admin',
  USER = 'user',
  CUSTOMER_USER = 'customer_user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  companyName: string;
  tenantId?: string;
  customerId?: string;
  phone?: string;
  avatar?: string;
  permissions?: string[];
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  additionalInfo?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuery {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  tenantId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  default?: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface UsersResponse {
  message: string;
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export const customerUsersApi = {
  // Get user by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/customer-users/${id}`),

  // Create user
  create: (data: Partial<User>) =>
    apiClient.post<ApiResponse<User>>('/customer-users', data),
  //search users
  search: (query: string, page?: number, limit?: number) =>
    apiClient.get<ApiResponse<ApiResponse<User[]>>>('/users/search', {
      params: { q: query, limit },
    }),
  // Update user
  update: (id: string, data: Partial<User>) =>
    apiClient.patch<ApiResponse<User>>(`/customer-users/${id}`, data),
  // Delete user
  delete: (id: string) =>
    apiClient.delete<ApiResponse<User>>(`/customer-users/${id}`),
  asignUserToCustomer: (userId: string, customerId: string) =>
    apiClient.post<ApiResponse<User>>(`/customer-users/assign`, {
      userId,
      customerId,
    }),
};
