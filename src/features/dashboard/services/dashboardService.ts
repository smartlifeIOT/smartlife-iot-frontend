import { dashboardsApi, analyticsApi, devicesApi, assetsApi, alarmsApi } from '@/services/api/index.ts';
import type { Dashboard } from '@/services/api/dashboards.api.ts';

/**
 * Dashboard Feature Service
 * Handles business logic for dashboard management and data aggregation
 */
export const dashboardService = {
  /**
   * Load dashboard with all widget data
   */
  async loadDashboard(dashboardId: string) {
    const dashboard = await dashboardsApi.getById(dashboardId);
    
    // Load data for each widget
    const widgetsWithData = await Promise.all(
      (dashboard.data.data.configuration?.widgets || []).map(async (widget) => {
        try {
          // Load widget data based on type
          const data = await this.loadWidgetData(widget);
          return { ...widget, data };
        } catch (error) {
          return { ...widget, data: null, error: 'Failed to load data' };
        }
      })
    );

    return {
      ...dashboard.data.data,
      configuration: {
        ...dashboard.data.data.configuration,
        widgets: widgetsWithData,
      },
    };
  },

  /**
   * Load data for a specific widget
   */
  async loadWidgetData(widget: any) {
    // This is a simplified example - actual implementation would depend on widget type
    const { widgetTypeId, config, dataKeys } = widget;

    // Different logic based on widget type
    if (config?.type === 'timeseries') {
      // Load time series data
      return this.loadTimeSeriesData(config);
    } else if (config?.type === 'latest') {
      // Load latest values
      return this.loadLatestData(config);
    }

    return null;
  },

  /**
   * Load time series data for widget
   */
  async loadTimeSeriesData(config: any) {
    const endTime = Date.now();
    const startTime = endTime - (config.timeWindow?.timewindowMs || 3600000);

    // This would call analytics API with proper parameters
    return analyticsApi.getTimeSeries({
      entityId: config.entityId,
      entityType: config.entityType,
      keys: config.dataKeys?.map((k: any) => k.name) || [],
      startTime,
      endTime,
    });
  },

  /**
   * Load latest data for widget
   */
  async loadLatestData(config: any) {
    // Load latest telemetry or attributes
    if (config.entityType === 'DEVICE') {
      return devicesApi.getTelemetry(config.entityId, config.dataKeys);
    }
    return null;
  },

  /**
   * Get system overview data
   */
  async getSystemOverview() {
    const [
      systemStats,
      devicesResponse,
      assetsResponse,
      alarmsResponse,
    ] = await Promise.all([
      analyticsApi.getSystemAnalytics(),
      devicesApi.getStatistics(),
      assetsApi.getStatistics(),
      alarmsApi.getActiveCount(),
    ]);

    return {
      devices: {
        // total: systemStats.data.data.totalDevices,
        active: systemStats.data.data.activeDevices,
        inactive: systemStats.data.data.inactiveDevices,
        ...devicesResponse.data.data,
      },
      assets: {
        total: systemStats.data.data.totalAssets,
        ...assetsResponse.data.data,
      },
      alarms: {
        active: alarmsResponse.data.data.count,
        total: systemStats.data.data.totalAlarms,
        bySeverity: systemStats.data.data.alarmsBySeverity,
      },
      activity: {
        totalMessages: systemStats.data.data.totalMessages,
        messagesPerHour: systemStats.data.data.messagesPerHour,
        topDevices: systemStats.data.data.topDevicesByActivity,
      },
    };
  },

  /**
   * Create dashboard from template
   */
  async createFromTemplate(templateId: string, title: string) {
    // Load template
    const template = await dashboardsApi.getById(templateId);
    
    // Create new dashboard with template configuration
    const newDashboard = await dashboardsApi.create({
      title,
      description: `Created from template: ${template.data.data.title}`,
      configuration: template.data.data.configuration,
      additionalInfo: {
        templateId,
        createdAt: new Date().toISOString(),
      },
    });

    return newDashboard.data.data;
  },

  /**
   * Duplicate dashboard
   */
  async duplicateDashboard(dashboardId: string, newTitle?: string) {
    const original = await dashboardsApi.getById(dashboardId);
    const title = newTitle || `${original.data.data.title} (Copy)`;

    return dashboardsApi.clone(dashboardId, title);
  },

  /**
   * Share dashboard with multiple customers
   */
  async shareDashboard(dashboardId: string, customerIds: string[]) {
    await dashboardsApi.share(dashboardId, customerIds);

    return {
      dashboardId,
      sharedWith: customerIds,
      sharedAt: new Date().toISOString(),
    };
  },

  /**
   * Export dashboard with data
   */
  async exportDashboardWithData(dashboardId: string) {
    const dashboard = await dashboardsApi.getById(dashboardId);
    const exportData = await dashboardsApi.export(dashboardId);

    return {
      dashboard: dashboard.data.data,
      export: exportData.data.data,
      exportedAt: new Date().toISOString(),
    };
  },

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(dashboardId: string, days: number = 7) {
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);

    // This would track dashboard views, widget interactions, etc.
    return {
      dashboardId,
      period: { startTime, endTime, days },
      views: 0, // Would come from analytics
      interactions: 0,
      lastViewed: null,
    };
  },

  /**
   * Validate dashboard configuration
   */
  validateConfiguration(config: Dashboard['configuration']) {
    const errors = [];

    if (!config) {
      errors.push('Configuration is required');
      return { valid: false, errors };
    }

    // Validate widgets
    if (config.widgets) {
      config.widgets.forEach((widget, index) => {
        if (!widget.widgetTypeId) {
          errors.push(`Widget ${index}: widgetTypeId is required`);
        }
        if (!widget.position) {
          errors.push(`Widget ${index}: position is required`);
        }
      });
    }

    // Validate grid settings
    if (config.gridSettings) {
      if (config.gridSettings.columns < 1) {
        errors.push('Grid columns must be at least 1');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Auto-layout dashboard widgets
   */
  autoLayoutWidgets(widgets: any[], columns: number = 12) {
    let currentRow = 0;
    let currentCol = 0;

    return widgets.map((widget) => {
      const width = widget.position?.w || 4;
      const height = widget.position?.h || 4;

      // Move to next row if widget doesn't fit
      if (currentCol + width > columns) {
        currentRow += height;
        currentCol = 0;
      }

      const position = {
        x: currentCol,
        y: currentRow,
        w: width,
        h: height,
      };

      currentCol += width;

      return {
        ...widget,
        position,
      };
    });
  },
};