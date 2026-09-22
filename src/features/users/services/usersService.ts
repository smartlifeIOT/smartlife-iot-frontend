import { usersApi, rolesApi } from '@/services/api/index.ts';
import type { User, Role, Permission } from '@/services/api/users.api.ts';

/**
 * Users Feature Service
 * Handles business logic for user management, roles, and permissions
 */
export const userService = {
  /**
   * Create user with role assignment
   */
  async createUserWithRole(userData: Partial<User>, roleId: string) {
    // Validate email format
    if (!this.validateEmail(userData.email!)) {
      throw new Error('Invalid email format');
    }

    // Create user
    const user = await usersApi.create(userData);

    // Assign role
    await rolesApi.assignToUser(user.data.data.id);

    return user.data.data;
  },

  /**
   * Update user profile with validation
   */
  async updateUserProfile(userId: string, updates: Partial<User>) {
    // Validate email if being updated
    if (updates.email && !this.validateEmail(updates.email)) {
      throw new Error('Invalid email format');
    }

    return usersApi.update(userId, updates);
  },

  /**
   * Change user password with validation
   */
  async changePassword(oldPassword: string, newPassword: string) {
    // Validate new password
    if (!this.validatePassword(newPassword)) {
      throw new Error('New password does not meet requirements');
    }

    // Ensure passwords are different
    if (oldPassword === newPassword) {
      throw new Error('New password must be different from old password');
    }

    return usersApi.changePassword(oldPassword, newPassword);
  },

  /**
   * Activate user and send welcome email
   */

  /**
   * Deactivate user with reason
   */

  /**
   * Get user with roles and permissions
   */
  async getUserComplete(userId: string) {
    const [user, permissions] = await Promise.all([
      usersApi.getById(userId),
      usersApi.getPermissions(userId),
    ]);

    return {
      ...user.data.data,
      permissions: permissions.data.data,
    };
  },

  /**
   * Get user statistics
   */
  // async getUserStats() {
  //   const stats = await usersApi.getStatistics();
  //   return {
  //     total: stats.data.data.total,
  //     active: stats.data.data.active,
  //     inactive: stats.data.data.inactive,
  //     suspended: stats.data.data.suspended,
  //     byRole: stats.data.data.byRole,
  //     recentLogins: stats.data.data.recentLogins,
  //   };
  // },

  /**
   * Bulk user operations
   */
  async bulkUpdateUsers(userIds: string[], updates: Partial<User>) {
    return usersApi.bulkUpdate(userIds, updates);
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return hasLength && hasUpper && hasLower && hasNumber;
  },

  /**
   * Get password requirements
   */
  getPasswordRequirements() {
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: false,
    };
  },

  /**
   * Enable 2FA for user
   */
  // async enable2FA(userId: string) {
  //   const result = await usersApi.enable2FA(userId);
  //   return {
  //     userId,
  //     enabled: true,
  //     qrCode: result.data.data.qrCode,
  //     secret: result.data.data.secret,
  //   };
  // },

  /**
   * Check user permissions
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await usersApi.getPermissions(userId);
    return permissions.data.data.includes(permission);
  },

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string) {
    return rolesApi.getUsers(roleId);
  },

  /**
   * Transfer user ownership
   */
  async transferOwnership(fromUserId: string, toUserId: string) {
    // This would transfer ownership of resources
    // Implementation depends on your business logic

    return {
      from: fromUserId,
      to: toUserId,
      transferredAt: new Date().toISOString(),
    };
  },

  /**
   * Get user activity summary
   */
  async getUserActivity(userId: string) {
    const user = await usersApi.getById(userId);

    return {
      userId,
      lastLogin: user.data.data.data.lastLogin,
      status: user.data.data.data.status,
      // Would include more activity data from audit logs
    };
  },

  /**
   * Reset user password (admin)
   */
};

/**
 * Roles Feature Service
 */
export const roleService = {
  /**
   * Create role with permissions
   */
  async createRoleWithPermissions(
    name: string,
    description: string,
    permissionIds: Permission[]
  ) {
    const role = await rolesApi.create({
      name,
      description,
      permissions: permissionIds,
    });

    return role.data.data;
  },

  /**
   * Clone role
   */
  async cloneRole(roleId: string, newName: string) {
    const original = await rolesApi.getById(roleId);

    return rolesApi.create({
      name: newName,
      description: `Cloned from ${original.data.data.name}`,
      permissions: original.data.data.permissions,
    });
  },
};
