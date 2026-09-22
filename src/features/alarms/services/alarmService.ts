import { alarmsApi } from '@/services/api/index.ts';
import {
  Alarm,
  AlarmSeverity,
  AlarmStatus,
} from '@/services/api/alarms.api.ts';

/**
 * Alarms Feature Service
 * Handles business logic for alarm management and notifications
 */
export const alarmService = {
  /**
   * Acknowledge alarm with comment
   */
  async acknowledgeAlarm(alarmId: string, comment?: string) {
    await alarmsApi.acknowledge(alarmId);

    // If comment provided, update alarm details
    if (comment) {
      await alarmsApi.update(alarmId, {
        details: {
          acknowledgedAt: new Date().toISOString(),
        },
      });
    }

    return alarmsApi.getById(alarmId);
  },

  /**
   * Bulk acknowledge alarms with reason
   */
  async bulkAcknowledgeWithReason(alarmIds: string[], reason: string) {
    await alarmsApi.bulkAcknowledge(alarmIds);

    // Update each alarm with reason
    const updates = alarmIds.map((id) =>
      alarmsApi.update(id, {
        details: {
          bulkAckReason: reason,
          bulkAckAt: new Date().toISOString(),
        },
      })
    );

    await Promise.all(updates);

    return {
      acknowledged: alarmIds.length,
      reason,
    };
  },

  /**
   * Clear alarm with resolution details
   */
  async clearAlarm(alarmId: string, resolution?: string) {
    await alarmsApi.clear(alarmId);

    if (resolution) {
      await alarmsApi.update(alarmId, {
        details: {
          resolution,
          clearedAt: new Date().toISOString(),
        },
      });
    }

    return alarmsApi.getById(alarmId);
  },

  /**
   * Get alarm summary statistics
   */
  // async getAlarmSummary() {
  //   const [stats, activeCount] = await Promise.all([
  //     alarmsApi.getStatistics(),
  //     alarmsApi.getActiveCount(),
  //   ]);

  //   return {
  //     total: stats.data.data.total,
  //     active: activeCount.data.data.count,
  //     bySeverity: stats.data.data.bySeverity,
  //     byType: stats.data.data.byType,
  //   };
  // },

  /**
   * Get alarms by priority (severity-based)
   */
  async getAlarmsByPriority() {
    const severities: AlarmSeverity[] = [
      AlarmSeverity.CRITICAL,
      AlarmSeverity.MAJOR,
      AlarmSeverity.MINOR,
      AlarmSeverity.WARNING,
      AlarmSeverity.INDETERMINATE,
    ];

    const alarmsBySeverity = await Promise.all(
      severities.map(async (severity) => {
        const alarms = await alarmsApi.getBySeverity(severity);
        return {
          severity,
          alarms: alarms.data.data,
          count: alarms.data.data.length,
        };
      })
    );

    return alarmsBySeverity;
  },

  /**
   * Get device alarm history with timeline
   */
  async getDeviceAlarmTimeline(deviceId: string) {
    const alarms = await alarmsApi.getByDevice(deviceId);

    // Sort by start time
    const sorted = alarms.data.data.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Group by date
    const timeline = sorted.reduce(
      (acc, alarm) => {
        const date = new Date(alarm.startTime).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(alarm);
        return acc;
      },
      {} as Record<string, Alarm[]>
    );

    return {
      deviceId,
      totalAlarms: sorted.length,
      timeline,
    };
  },

  /**
   * Calculate alarm metrics
   */
  // async calculateAlarmMetrics(startDate?: string, endDate?: string) {
  //   const alarms = await alarmsApi.getAll({
  //     startTime: startDate,
  //     endTime: endDate,
  //   });

  //   const data = alarms.data.data;

  //   // Calculate MTTA (Mean Time To Acknowledge)
  //   const acknowledgedAlarms = data.filter((a) => a.ackTime);
  //   const mtta =
  //     acknowledgedAlarms.length > 0
  //       ? acknowledgedAlarms.reduce((sum, alarm) => {
  //           const ackTime = new Date(alarm.ackTime!).getTime();
  //           const startTime = new Date(alarm.startTime).getTime();
  //           return sum + (ackTime - startTime);
  //         }, 0) /
  //         acknowledgedAlarms.length /
  //         60000 // Convert to minutes
  //       : 0;

  //   // Calculate MTTC (Mean Time To Clear)
  //   const clearedAlarms = data.filter((a) => a.clearTime);
  //   const mttc =
  //     clearedAlarms.length > 0
  //       ? clearedAlarms.reduce((sum, alarm) => {
  //           const clearTime = new Date(alarm.clearTime!).getTime();
  //           const startTime = new Date(alarm.startTime).getTime();
  //           return sum + (clearTime - startTime);
  //         }, 0) /
  //         clearedAlarms.length /
  //         60000
  //       : 0;

  //   return {
  //     totalAlarms: data.length,
  //     acknowledged: acknowledgedAlarms.length,
  //     cleared: clearedAlarms.length,
  //     mtta: Math.round(mtta),
  //     mttc: Math.round(mttc),
  //     bySeverity: this.groupBySeverity(data),
  //     byStatus: this.groupByStatus(data),
  //   };
  // },

  /**
   * Group alarms by severity
   */
  groupBySeverity(alarms: Alarm[]) {
    return alarms.reduce(
      (acc, alarm) => {
        acc[alarm.severity] = (acc[alarm.severity] || 0) + 1;
        return acc;
      },
      {} as Record<AlarmSeverity, number>
    );
  },

  /**
   * Group alarms by status
   */
  groupByStatus(alarms: Alarm[]) {
    return alarms.reduce(
      (acc, alarm) => {
        acc[alarm.status] = (acc[alarm.status] || 0) + 1;
        return acc;
      },
      {} as Record<AlarmStatus, number>
    );
  },

  /**
   * Get active critical alarms
   */
  async getCriticalAlarms() {
    const [criticalAlarms, activeAlarms] = await Promise.all([
      alarmsApi.getBySeverity(AlarmSeverity.CRITICAL),
      alarmsApi.getAll({ status: AlarmStatus.ACTIVE }),
    ]);

    // Filter for active critical alarms
    const activeCritical = criticalAlarms.data.data.filter(
      (alarm) => alarm.status === AlarmStatus.ACTIVE
    );

    return {
      critical: activeCritical,
      count: activeCritical.length,
      requiresImmediate: activeCritical.filter((a) => !a.ackTime),
    };
  },

  /**
   * Create alarm rule
   */
  async createAlarmRule(rule: {
    name: string;
    severity: AlarmSeverity;
    condition: string;
    entityType: 'DEVICE' | 'ASSET';
    entityId?: string;
  }) {
    // This would integrate with rules engine
    return alarmsApi.create({
      type: rule.name,
      severity: rule.severity,
      originatorType: rule.entityType,
      originatorId: rule.entityId || '',
      status: AlarmStatus.ACTIVE,
      startTime: new Date().toISOString(),
      details: {
        rule: rule.condition,
        createdAt: new Date().toISOString(),
      },
    });
  },

  /**
   * Escalate alarm severity
   */
  async escalateAlarm(alarmId: string) {
    const alarm = await alarmsApi.getById(alarmId);
    const current = alarm.data.data.severity;

    const escalationMap: Record<AlarmSeverity, AlarmSeverity> = {
      [AlarmSeverity.INDETERMINATE]: AlarmSeverity.WARNING,
      [AlarmSeverity.WARNING]: AlarmSeverity.MINOR,
      [AlarmSeverity.MINOR]: AlarmSeverity.MAJOR,
      [AlarmSeverity.MAJOR]: AlarmSeverity.CRITICAL,
      [AlarmSeverity.CRITICAL]: AlarmSeverity.CRITICAL,
    };

    const newSeverity = escalationMap[current];

    return alarmsApi.update(alarmId, {
      severity: newSeverity,
      details: {
        escalated: true,
        escalatedFrom: current,
        escalatedAt: new Date().toISOString(),
      },
    });
  },

  /**
   * Get alarm trends
   */
  // async getAlarmTrends(days: number = 7) {
  //   const endTime = new Date();
  //   const startTime = new Date(endTime);
  //   startTime.setDate(startTime.getDate() - days);

  //   const alarms = await alarmsApi.getAll({
  //     startTime: startTime.toISOString(),
  //     endTime: endTime.toISOString(),
  //   });

  //   // Group by day
  //   const trendsByDay = alarms.data.data.reduce(
  //     (acc, alarm) => {
  //       const day = new Date(alarm.startTime).toISOString().split('T')[0];
  //       if (!acc[day]) {
  //         acc[day] = { date: day, count: 0, bySeverity: {} };
  //       }
  //       acc[day].count++;
  //       acc[day].bySeverity[alarm.severity] =
  //         (acc[day].bySeverity[alarm.severity] || 0) + 1;
  //       return acc;
  //     },
  //     {} as Record<string, any>
  //   );

  //   return Object.values(trendsByDay).sort((a, b) =>
  //     a.date.localeCompare(b.date)
  //   );
  // },
};
