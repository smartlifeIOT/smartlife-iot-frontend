import { analyticsApi } from '@/services/api/index.ts';

/**
 * Analytics Feature Service
 * Handles business logic for analytics and reporting
 */
export const analyticsService = {
  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics() {
    const [system, realtime] = await Promise.all([
      analyticsApi.getSystemAnalytics(),
      analyticsApi.getRealTimeStats(),
    ]);

    return {
      system: system.data.data,
      realtime: realtime.data.data,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get time range analytics with comparison
   */
  async getTimeRangeWithComparison(
    entityId: string,
    keys: string[],
    currentStart: number,
    currentEnd: number
  ) {
    const duration = currentEnd - currentStart;
    const previousStart = currentStart - duration;
    const previousEnd = currentStart;

    const [current, previous] = await Promise.all([
      analyticsApi.getTimeSeries({
        entityId,
        entityType: 'DEVICE',
        keys,
        startTime: currentStart,
        endTime: currentEnd,
      }),
      analyticsApi.getTimeSeries({
        entityId,
        entityType: 'DEVICE',
        keys,
        startTime: previousStart,
        endTime: previousEnd,
      }),
    ]);

    return {
      current: current.data.data,
      previous: previous.data.data,
      comparison: this.calculateComparison(
        current.data.data,
        previous.data.data
      ),
    };
  },

  /**
   * Calculate percentage change
   */
  calculateComparison(
    current: Record<string, any[]>,
    previous: Record<string, any[]>
  ) {
    const comparison: Record<string, number> = {};

    Object.keys(current).forEach((key) => {
      const currentAvg = this.calculateAverage(current[key]);
      const previousAvg = this.calculateAverage(previous[key]);

      if (previousAvg !== 0) {
        comparison[key] = ((currentAvg - previousAvg) / previousAvg) * 100;
      } else {
        comparison[key] = 0;
      }
    });

    return comparison;
  },

  /**
   * Calculate average from time series data
   */
  calculateAverage(data: Array<{ value: any }>): number {
    if (!data || data.length === 0) return 0;

    const numericValues = data
      .map((d) => Number(d.value))
      .filter((v) => !isNaN(v));

    if (numericValues.length === 0) return 0;

    return (
      numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
    );
  },

  /**
   * Generate custom report
   */
  async generateCustomReport(config: {
    name: string;
    entityIds: string[];
    metrics: string[];
    startTime: number;
    endTime: number;
    aggregation?: 'AVG' | 'SUM' | 'MIN' | 'MAX';
  }) {
    const data = await Promise.all(
      config.entityIds.map(async (entityId) => {
        const timeSeries = await analyticsApi.getTimeSeries({
          entityId,
          entityType: 'DEVICE',
          keys: config.metrics,
          startTime: config.startTime,
          endTime: config.endTime,
          aggregation: config.aggregation,
        });

        return {
          entityId,
          data: timeSeries.data.data,
        };
      })
    );

    return {
      reportName: config.name,
      generatedAt: new Date().toISOString(),
      period: {
        start: new Date(config.startTime).toISOString(),
        end: new Date(config.endTime).toISOString(),
      },
      data,
      summary: this.generateSummary(data, config.metrics),
    };
  },

  /**
   * Generate report summary
   */
  generateSummary(
    data: Array<{ entityId: string; data: Record<string, any[]> }>,
    metrics: string[]
  ) {
    const summary: Record<string, any> = {};

    metrics.forEach((metric) => {
      const allValues: number[] = [];

      data.forEach((entity) => {
        const values = entity.data[metric] || [];
        values.forEach((v: any) => {
          const num = Number(v.value);
          if (!isNaN(num)) allValues.push(num);
        });
      });

      if (allValues.length > 0) {
        summary[metric] = {
          min: Math.min(...allValues),
          max: Math.max(...allValues),
          avg: allValues.reduce((sum, v) => sum + v, 0) / allValues.length,
          count: allValues.length,
        };
      }
    });

    return summary;
  },

  /**
   * Export analytics data
   */
  async exportData(
    entityId: string,
    keys: string[],
    startTime: number,
    endTime: number,
    format: 'CSV' | 'JSON' | 'EXCEL' = 'CSV'
  ) {
    const query = {
      entityId,
      entityType: 'DEVICE' as const,
      keys,
      startTime,
      endTime,
    };

    return analyticsApi.exportData(query, format);
  },

  /**
   * Get top performing devices
   */
  async getTopPerformers(metric: string, limit: number = 10) {
    const system = await analyticsApi.getSystemAnalytics();
    const topDevices = system.data.data.topDevicesByActivity || [];

    return topDevices.slice(0, limit);
  },

  /**
   * Calculate device uptime
   */
  async calculateUptime(deviceId: string, days: number = 7) {
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;

    const analytics = await analyticsApi.getDeviceAnalytics(deviceId);

    const data = analytics.data.data;
    const totalTime = endTime - startTime;
    const activeTime = data.activeTime || 0;

    return {
      deviceId,
      period: { startTime, endTime, days },
      activeTime,
      uptime: (activeTime / totalTime) * 100,
      downtime: ((totalTime - activeTime) / totalTime) * 100,
    };
  },

  /**
   * Get aggregated metrics
   */
  async getAggregatedMetrics(
    entityId: string,
    keys: string[],
    startTime: number,
    endTime: number,
    intervalMinutes: number = 60
  ) {
    const results = await Promise.all([
      analyticsApi.getAggregatedData(
        entityId,
        keys,
        startTime,
        endTime,
        'AVG',
        intervalMinutes * 60 * 1000
      ),
      analyticsApi.getAggregatedData(
        entityId,
        keys,
        startTime,
        endTime,
        'MIN',
        intervalMinutes * 60 * 1000
      ),
      analyticsApi.getAggregatedData(
        entityId,
        keys,
        startTime,
        endTime,
        'MAX',
        intervalMinutes * 60 * 1000
      ),
    ]);

    return {
      avg: results[0].data.data,
      min: results[1].data.data,
      max: results[2].data.data,
    };
  },

  /**
   * Predict future trends (simple linear regression)
   */
  predictTrend(
    historicalData: Array<{ timestamp: number; value: number }>,
    periodsAhead: number = 5
  ) {
    if (historicalData.length < 2) {
      return [];
    }

    // Simple linear regression
    const n = historicalData.length;
    const sumX = historicalData.reduce((sum, d, i) => sum + i, 0);
    const sumY = historicalData.reduce((sum, d) => sum + d.value, 0);
    const sumXY = historicalData.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumX2 = historicalData.reduce((sum, d, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict future values
    const predictions = [];
    const lastTimestamp = historicalData[historicalData.length - 1].timestamp;
    const interval = historicalData[1].timestamp - historicalData[0].timestamp;

    for (let i = 1; i <= periodsAhead; i++) {
      predictions.push({
        timestamp: lastTimestamp + i * interval,
        value: intercept + slope * (n + i - 1),
        predicted: true,
      });
    }

    return predictions;
  },
};
