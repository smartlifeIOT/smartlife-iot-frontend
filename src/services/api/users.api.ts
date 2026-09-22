import apiClient from '@/lib/axios.ts';

export enum UserRole {
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
  role: string;
  roles: Role[];
  status: string;
  companyName: string;
  tenantId?: string;
  customerId?: string;
  phone?: string;
  avatar?: string;
  permissions?: (string | Permission)[];
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  additionalInfo?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserQuery {
  search?: string;
  role?: string;
  status?: string;
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
  isSystem: any;
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
    customRoles: number;
    systemRoles: number;
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

export const usersApi = {
  // Get all users
  getAll: (params?: UserQuery) =>
    apiClient.get<ApiResponse<UsersResponse>>('/users', { params }),

  // Get user by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<ApiResponse<User>>>(`/users/${id}`),

  // Create user
  create: (data: Partial<User>) =>
    apiClient.post<ApiResponse<User>>('/users', data),
  //search users
  search: (query: string, page?: number, limit?: number, role?: string) =>
    apiClient.get<ApiResponse<ApiResponse<User[]>>>('/users/search', {
      params: { q: query, limit, role },
    }),
  // Update user
  update: (id: string, data: Partial<User>) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}`, data),

  // Delete user
  delete: (id: string) => apiClient.delete(`/users/${id}`),

  // Get current user
  getCurrentUser: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  // Update current user profile
  updateProfile: (data: Partial<User> & { avatarFile?: File }) => {
    if (data.avatarFile) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.phone) formData.append('phone', data.phone);
      if (data.companyName) formData.append('companyName', data.companyName);
      formData.append('avatar', data.avatarFile);

      return apiClient.patch<ApiResponse<User>>('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.patch<ApiResponse<User>>('/auth/profile', data);
  },

  // Change password
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse<unknown>>('/auth/change-password', {
      oldPassword,
      newPassword,
    }),

  // Reset password
  resetPassword: (userId: string) =>
    apiClient.post<ApiResponse<unknown>>(`/users/${userId}/reset-password`),

  // Activate user
  updateStatus: (id: string, status: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, { status }),

  // Deactivate user
  deactivate: (id: string, status: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/deactivate`, { status }),

  // Suspend user
  suspend: (id: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/suspend`),

  // Get user permissions
  getPermissions: (id: string) =>
    apiClient.get<ApiResponse<string[]>>(`/users/${id}/permissions`),

  // Update user permissions
  updatePermissions: (id: string, permissions: string[]) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/permissions`, {
      permissions,
    }),

  // Get user statistics
  getStatistics: () => apiClient.get<ApiResponse<unknown>>('/users/statistics'),

  // Enable 2FA
  enable2FA: (id: string) =>
    apiClient.post<ApiResponse<unknown>>(`/users/${id}/2fa/enable`),

  // Disable 2FA
  disable2FA: (id: string) =>
    apiClient.post<ApiResponse<unknown>>(`/users/${id}/2fa/disable`),

  // Bulk delete users
  bulkDelete: (userIds: string[]) =>
    apiClient.delete<ApiResponse<unknown>>('/users/bulk', {
      data: { userIds },
    }),

  // Bulk assign role
  bulkAssignRole: (roleId: string, userIds: string[]) =>
    apiClient.patch<ApiResponse<unknown>>('/users/bulk/assign-role', {
      roleId,
      userIds,
    }),

  // Bulk remove role
  bulkRemoveRole: (roleId: string, userIds: string[]) =>
    apiClient.patch<ApiResponse<unknown>>('/users/bulk/remove-role', {
      roleId,
      userIds,
    }),

  // Bulk update users
  bulkUpdate: (userIds: string[], data: Partial<User>) =>
    apiClient.patch<ApiResponse<unknown>>('/users/bulk/update', {
      userIds,
      data,
    }),

  // Bulk update user status
  bulkUpdateStatus: (userIds: string[], status: string) =>
    apiClient.patch<ApiResponse<unknown>>('/users/bulk/status', {
      userIds,
      status,
    }),

  // Bulk send email to users
  bulkSendEmail: (data: {
    userIds: string[];
    subject: string;
    message: string;
    htmlContent?: string;
  }) => apiClient.post<ApiResponse<unknown>>('/users/bulk/send-email', data),

  // Export users
  export: (format: 'csv' | 'json' | 'xlsx') =>
    apiClient.get(`/users/export`, {
      params: { format },
      responseType: 'blob',
    }),

  // Import users
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<{ imported: number; failed: number }>>(
      '/users/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  // Bulk send notification to users
  bulkSendNotification: (data: {
    userIds: string[];
    title: string;
    message: string;
    type: string;
    priority: string;
  }) =>
    apiClient.post<ApiResponse<unknown>>('/users/bulk/send-notification', data),
};

// Permissions API
export const permissionsApi = {
  // Get all permissions
  getAll: () => apiClient.get<ApiResponse<Permission[]>>('/permissions'),

  // Get permission by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Permission>>(`/permissions/${id}`),

  // Get permissions by resource
  getByResource: (resource: string) =>
    apiClient.get<ApiResponse<Permission[]>>(
      `/permissions/resource/${resource}`
    ),
};

// Roles API
export const rolesApi = {
  // Get all roles
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<PaginatedResponse<Role>>>('/roles', { params }),
  // Get system roles
  getSystemRoles: () => apiClient.get<ApiResponse<Role[]>>('/roles/system'),
  // Get role by ID
  getById: (id: string) => apiClient.get<ApiResponse<Role>>(`/roles/${id}`),
  // Create role
  create: (data: Partial<Role>) =>
    apiClient.post<ApiResponse<Role>>('/roles', data),
  // Update role
  update: (id: string, data: Partial<Role>) =>
    apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, data),
  // Delete role
  delete: (id: string) => apiClient.delete(`/roles/${id}`),
  // Assign role to user
  assignToUser: (tenantId: string) =>
    apiClient.post<ApiResponse<Role[]>>(`/roles/tenant/${tenantId}`),
  // Remove role from user
  removeFromUser: (roleId: string, userId: string) =>
    apiClient.delete(`/roles/${roleId}/users/${userId}`),
  // Get users with role
  getUsers: (roleId: string) =>
    apiClient.get<ApiResponse<User[]>>(`/roles/${roleId}/users`),
  //get role permissions
  getRolePermissions: (roleId: string) =>
    apiClient.get<ApiResponse<Permission[]>>(`/roles/${roleId}/permissions`),
  //assign permissions to role by role id
  assignPermissionsToRole: (roleId: string, permissions: string[]) =>
    apiClient.post<ApiResponse<Role[]>>(`/roles/${roleId}/permissions`, {
      permissions,
    }),
};
