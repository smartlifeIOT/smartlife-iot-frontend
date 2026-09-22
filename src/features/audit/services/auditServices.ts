import { auditApi } from '@/services/api/index.ts';
import {
  AuditAction,
  AuditEntityType,
  AuditLog,
} from '@/services/api/audit.api.ts';

/**
 * Audit Feature Service
 * Handles business logic for audit logs and compliance
 */
export const auditService = {
  /**
   * Get audit trail for an entity
   */

  /**
   * Get user activity report
   */
  async getUserActivityReport(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const activity = await auditApi.getUserActivity(
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    );

    const logs = activity.data.data;

    // Calculate statistics
    const stats = {
      totalActions: logs.length,
      successfulActions: logs.filter((l) => l.success).length,
      failedActions: logs.filter((l) => !l.success).length,
      byAction: this.groupByAction(logs),
      byEntityType: this.groupByEntityType(logs),
      mostActiveDay: this.findMostActiveDay(logs),
    };

    return {
      userId,
      period: { start: startDate, end: endDate, days },
      logs,
      stats,
    };
  },

  /**
   * Get security audit report
   */
  async getSecurityAuditReport(startDate?: string, endDate?: string) {
    const [failedActions, loginAttempts, actionCount] = await Promise.all([
      auditApi.getFailedActions(startDate, endDate),
      auditApi.getAll({
        action: AuditAction.LOGIN,
        startDate,
        endDate,
      }),
      auditApi.getActionCount(startDate, endDate),
    ]);

    const failed = failedActions.data.data;
    const logins = loginAttempts.data.data;

    return {
      period: { startDate, endDate },
      failedActions: {
        total: failed.length,
        byUser: this.groupByUser(failed),
        byAction: this.groupByAction(failed),
      },
      loginActivity: {
        total: logins.length,
        successful: logins.filter((l) => l.success).length,
        failed: logins.filter((l) => !l.success).length,
        uniqueUsers: new Set(logins.map((l) => l.userId)).size,
      },
      actionDistribution: actionCount.data.data,
    };
  },

  /**
   * Export audit logs
   */
  async exportAuditLogs(
    filters: {
      action?: AuditAction;
      entityType?: AuditEntityType;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
    format: 'CSV' | 'JSON' | 'EXCEL' = 'CSV'
  ) {
    return auditApi.export(filters, format);
  },

  /**
   * Get compliance report
   */

  /**
   * Flag suspicious activities
   */
  flagSuspiciousActivities(logs: AuditLog[]) {
    const suspicious: Array<{
      type: string;
      userId?: string;
      count: number;
      severity: string;
    }> = [];

    // Multiple failed login attempts from same user
    const failedLogins = logs.filter((l) => l.action === 'LOGIN' && !l.success);
    const loginsByUser = this.groupByUser(failedLogins);

    Object.entries(loginsByUser).forEach(([userId, userLogs]) => {
      const logsArray = userLogs as AuditLog[];
      if (logsArray.length >= 5) {
        suspicious.push({
          type: 'MULTIPLE_FAILED_LOGINS',
          userId,
          count: logsArray.length,
          severity: 'HIGH',
        });
      }
    });

    // Unusual delete operations
    const deletes = logs.filter((l) => l.action === 'DELETE');
    if (deletes.length > 10) {
      suspicious.push({
        type: 'EXCESSIVE_DELETES',
        count: deletes.length,
        severity: 'MEDIUM',
      });
    }

    return suspicious;
  },

  /**
   * Group logs by action
   */
  groupByAction(logs: AuditLog[]) {
    return logs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  },

  /**
   * Group logs by entity type
   */
  groupByEntityType(logs: AuditLog[]) {
    return logs.reduce(
      (acc, log) => {
        acc[log.entityType] = (acc[log.entityType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  },

  /**
   * Group logs by user
   */
  groupByUser(logs: AuditLog[]) {
    return logs.reduce(
      (acc, log) => {
        if (!log.userId) return acc;
        if (!acc[log.userId]) acc[log.userId] = [];
        acc[log.userId].push(log);
        return acc;
      },
      {} as Record<string, AuditLog[]>
    );
  },

  /**
   * Find most active day
   */
  findMostActiveDay(logs: AuditLog[]) {
    const byDay = logs.reduce(
      (acc, log) => {
        const day = new Date(log.createdAt).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const entries = Object.entries(byDay);
    if (entries.length === 0) return null;

    return entries.reduce((max, entry) => (entry[1] > max[1] ? entry : max));
  },

  /**
   * Get access timeline for entity
   */
  async getAccessTimeline(entityType: AuditEntityType, entityId: string) {
    const logs = await auditApi.getEntityAccessLogs(entityType, entityId);

    // Group by date
    const timeline = logs.data.data.reduce(
      (acc, log) => {
        const date = new Date(log.createdAt).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, accesses: [], count: 0 };
        }
        acc[date].accesses.push(log);
        acc[date].count++;
        return acc;
      },
      {} as Record<
        string,
        { date: string; accesses: AuditLog[]; count: number }
      >
    );

    return Object.values(timeline).sort((a, b) => b.date.localeCompare(a.date));
  },
};
