import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, rolesApi, devicesApi } from '@/services/api';
import { userService } from '../services/usersService';
import type { User, UserQuery } from '@/services/api/users.api';

type RoleQuery = {
  page?: number;
  limit?: number;
  search?: string;
  tenantId?: string;
};

export const useUsers = (params?: UserQuery) => {
  // only allow the params with value to be passed
  const filteredParams = Object.fromEntries(
    Object.entries(params || {}).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  );
  return useQuery({
    queryKey: ['users', filteredParams],
    queryFn: async () => {
      const response = await usersApi.getAll(filteredParams);
      return response.data.data;
    },
  });
};
//search users
export const useSearchUsers = (
  query: string,
  page?: number,
  limit?: number,
  role?: string
) => {
  return useQuery({
    queryKey: ['users', 'search', query, page, limit, role],
    queryFn: async () => {
      const response = await usersApi.search(query, page, limit, role);
      return response.data.data;
    },
  });
};
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getCurrentUser(),
  });
};

export const useRoles = (params?: RoleQuery) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: async () => {
      const response = await rolesApi.getAll(params);
      return response.data.data;
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesApi.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userData,
      roleId,
    }: {
      userData: Partial<User>;
      roleId: string;
    }) => userService.createUserWithRole(userData, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userIds, status }: { userIds: string[]; status: string }) =>
      usersApi.bulkUpdateStatus(userIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => usersApi.bulkDelete(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, userIds }: { roleId: string; userIds: string[] }) =>
      usersApi.bulkAssignRole(roleId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkRemoveRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, userIds }: { roleId: string; userIds: string[] }) =>
      usersApi.bulkRemoveRole(roleId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkSendEmail = () => {
  return useMutation({
    mutationFn: (data: {
      userIds: string[];
      subject: string;
      message: string;
      htmlContent?: string;
    }) => usersApi.bulkSendEmail(data),
  });
};

export const useBulkSendNotification = () => {
  return useMutation({
    mutationFn: (data: {
      userIds: string[];
      title: string;
      message: string;
      type: string;
      priority: string;
    }) => usersApi.bulkSendNotification(data),
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userIds,
      data,
    }: {
      userIds: string[];
      data: Partial<User>;
    }) => usersApi.bulkUpdate(userIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      usersApi.updateStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
// Update user by ID
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      usersApi.update(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });
};

// Update user permissions
export const useUpdateUserPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: string[];
    }) => usersApi.updatePermissions(userId, permissions),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });
};

//get devices by customer id
export const useDevicesByCustomerId = (customerId: string) => {
  return useQuery({
    queryKey: ['devices', 'customer', customerId],
    queryFn: async () => {
      const response = await devicesApi.getByCustomerId(customerId);
      return response.data.data;
    },
  });
};

export const useExportUsers = () => {
  return useMutation({
    mutationFn: (format: 'csv' | 'json' | 'xlsx') => usersApi.export(format),
  });
};

export const useImportUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => usersApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
