import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '../services/rolesService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getAll,
  });
};

export const useSystemRoles = () => {
  return useQuery({
    queryKey: ['roles', 'system'],
    queryFn: rolesService.getSystemRoles,
  });
};

export const useRoleById = (roleId?: string) => {
  return useQuery({
    queryKey: ['roles', 'roleById', roleId],
    queryFn: () => rolesService.getById(roleId as string),
    enabled: !!roleId,
  });
};

export const useTenantRoles = (tenantId?: string) => {
  return useQuery({
    queryKey: ['roles', 'tenant', tenantId],
    queryFn: () => rolesService.getByTenant(tenantId as string),
    enabled: !!tenantId,
  });
};

export const useCreateRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rolesService.createRole,
    onSuccess: () => {
      toast.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/users-management', { state: { tab: 'Roles' } });
    },
  });
};

export const useUpdateRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: any }) =>
      rolesService.updateRole(roleId, data),
    onSuccess: () => {
      toast.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/users-management', { state: { tab: 'roles' } });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesService.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useRolePermissions = (roleId?: string) => {
  return useQuery({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: () => rolesService.getRolePermissions(roleId as string),
    enabled: !!roleId,
  });
};

export const useAssignRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: string[];
    }) => rolesService.assignPermissions(roleId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roles', variables.roleId, 'permissions'],
      });
    },
  });
};
