import { rolesApi } from '@/services/api';
import type { Role, Permission } from '@/services/api/users.api';

/**
 * Roles Feature Service
 * Handles business logic for role management
 */
export const rolesService = {
  async getAll() {
    const response = await rolesApi.getAll();
    return response.data.data;
  },

  async getSystemRoles() {
    const response = await rolesApi.getSystemRoles();
    return response.data.data;
  },

  async getById(roleId: string) {
    const response = await rolesApi.getById(roleId);
    return response.data.data;
  },

  async getByTenant(tenantId: string) {
    const response = await rolesApi.assignToUser(tenantId);
    return response.data.data;
  },

  async createRole(data: Partial<Role>) {
    const response = await rolesApi.create(data);
    return response.data.data;
  },

  async updateRole(roleId: string, data: Partial<Role>) {
    const response = await rolesApi.update(roleId, data);
    return response.data.data;
  },

  async deleteRole(roleId: string) {
    await rolesApi.delete(roleId);
    return { success: true, roleId };
  },

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const response = await rolesApi.getRolePermissions(roleId);
    return response.data.data;
  },

  async assignPermissions(roleId: string, permissions: string[]) {
    const response = await rolesApi.assignPermissionsToRole(
      roleId,
      permissions
    );
    return response.data.data;
  },
};
