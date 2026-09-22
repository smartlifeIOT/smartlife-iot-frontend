import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '@/services/api';

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await permissionsApi.getAll();
      return response.data.data;
    },
    staleTime: Infinity,
  });
};

export const usePermission = (permissionId?: string) => {
  return useQuery({
    queryKey: ['permissions', permissionId],
    queryFn: async () => {
      if (!permissionId) {
        return undefined;
      }
      const response = await permissionsApi.getById(permissionId);
      return response.data.data;
    },
    enabled: !!permissionId,
  });
};

export const usePermissionsByResource = (resource?: string) => {
  return useQuery({
    queryKey: ['permissions', 'resource', resource],
    queryFn: async () => {
      if (!resource) {
        return [];
      }
      const response = await permissionsApi.getByResource(resource);
      return response.data.data;
    },
    enabled: !!resource,
  });
};
