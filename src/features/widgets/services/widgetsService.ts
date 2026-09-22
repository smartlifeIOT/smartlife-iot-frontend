import { widgetTypesApi, widgetBundlesApi } from '@/services/api/index.ts';
import type { WidgetType, WidgetBundle, WidgetTypeCategory } from '@/services/api/widgets.api.ts';

/**
 * Widgets Feature Service
 * Handles business logic for widget and bundle management
 */
export const widgetService = {
  /**
   * Create widget with validation
   */
  async createWidget(data: Partial<WidgetType>) {
    // Validate required fields
    if (!data.name || !data.category) {
      throw new Error('Widget name and category are required');
    }

    // Validate descriptor
    if (data.descriptor) {
      const validation = this.validateDescriptor(data.descriptor);
      if (!validation.valid) {
        throw new Error(`Invalid descriptor: ${validation.errors.join(', ')}`);
      }
    }

    return widgetTypesApi.create(data);
  },

  /**
   * Validate widget descriptor
   */
  validateDescriptor(descriptor: any) {
    const errors = [];

    if (!descriptor.type) {
      errors.push('Descriptor type is required');
    }

    if (!descriptor.sizeX || descriptor.sizeX < 1) {
      errors.push('sizeX must be at least 1');
    }

    if (!descriptor.sizeY || descriptor.sizeY < 1) {
      errors.push('sizeY must be at least 1');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Get widgets by category with bundle info
   */
  async getWidgetsByCategory(category: WidgetTypeCategory) {
    const widgets = await widgetTypesApi.getByCategory(category);
    
    // Enrich with bundle information
    const enriched = await Promise.all(
      widgets.data.data.map(async (widget) => {
        if (widget.bundleFqn) {
          try {
            // Get bundle info (simplified - would need bundle lookup)
            return { ...widget, bundleInfo: { name: widget.bundleFqn } };
          } catch {
            return widget;
          }
        }
        return widget;
      })
    );

    return {
      category,
      widgets: enriched,
      count: enriched.length,
    };
  },

  /**
   * Get widget library (all widgets grouped by category)
   */
  async getWidgetLibrary() {
    const allWidgets = await widgetTypesApi.getAll();
    
    // Group by category
    const library = allWidgets.data.data.reduce((acc, widget) => {
      const catKey = String(widget.category);
      if (!acc[catKey]) {
        acc[catKey] = [];
      }
      acc[catKey].push(widget);
      return acc;
    }, {} as Record<string, WidgetType[]>);

    return {
      library,
      totalWidgets: allWidgets.data.data.length,
      categories: Object.keys(library).length,
    };
  },

  /**
   * Clone widget with customization
   */
  async cloneWidget(widgetId: string, customization: {
    name: string;
    category?: WidgetTypeCategory;
    descriptor?: Partial<WidgetType['descriptor']>;
  }) {
    const original = await widgetTypesApi.getById(widgetId);
    const widget = original.data.data;

    const clonedData = {
      ...widget,
      id: undefined,
      name: customization.name,
      category: customization.category || widget.category,
      descriptor: {
        ...widget.descriptor,
        ...customization.descriptor,
      },
      system: false,
      additionalInfo: {
        clonedFrom: widgetId,
        clonedAt: new Date().toISOString(),
      },
    };

    return this.createWidget(clonedData as any);
  },

  /**
   * Export widget configuration
   */
  async exportWidget(widgetId: string) {
    const exported = await widgetTypesApi.export(widgetId);
    
    return {
      ...exported.data.data,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
  },

  /**
   * Import widget with validation
   */
  async importWidget(widgetData: any) {
    // Validate import data
    if (!widgetData.name || !widgetData.descriptor) {
      throw new Error('Invalid widget data: name and descriptor required');
    }

    // Remove system flag
    delete widgetData.system;
    delete widgetData.id;

    return widgetTypesApi.import(widgetData);
  },

  /**
   * Get widget preview data
   */
  async getWidgetPreview(widgetId: string, sampleData?: any) {
    const widget = await widgetTypesApi.getById(widgetId);
    
    return {
      widget: widget.data.data,
      sampleData: sampleData || this.generateSampleData(widget.data.data),
      preview: {
        width: (widget.data.data.descriptor?.sizeX || 4) * 100,
        height: (widget.data.data.descriptor?.sizeY || 4) * 100,
      },
    };
  },

  /**
   * Generate sample data for widget preview
   */
  generateSampleData(widget: WidgetType) {
    const type = widget.descriptor?.type || 'latest';

    switch (type) {
      case 'timeseries':
        return this.generateTimeSeriesData();
      case 'latest':
        return { temperature: 25, humidity: 60 };
      case 'rpc':
        return { status: 'success', value: 'OK' };
      default:
        return {};
    }
  },

  /**
   * Generate sample time series data
   */
  generateTimeSeriesData() {
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < 20; i++) {
      data.push({
        timestamp: now - (i * 60000),
        value: Math.random() * 100,
      });
    }

    return data.reverse();
  },
};

/**
 * Widget Bundles Feature Service
 */
export const bundleService = {
  /**
   * Create bundle with widgets
   */
  async createBundleWithWidgets(
    bundleData: Partial<WidgetBundle>,
    widgetIds: string[]
  ) {
    // Create bundle
    const bundle = await widgetBundlesApi.create(bundleData);

    // Add widgets to bundle
    if (widgetIds.length > 0) {
      await Promise.all(
        widgetIds.map(widgetId =>
          widgetBundlesApi.addWidget(bundle.data.data.id, widgetId)
        )
      );
    }

    return bundle.data.data;
  },

  /**
   * Get bundle with all widgets
   */
  async getBundleComplete(bundleId: string) {
    const [bundle, widgets] = await Promise.all([
      widgetBundlesApi.getById(bundleId),
      widgetBundlesApi.getWidgets(bundleId),
    ]);

    return {
      ...bundle.data.data,
      widgets: widgets.data.data,
      widgetCount: widgets.data.data.length,
    };
  },

  /**
   * Clone bundle with all widgets
   */
  async cloneBundle(bundleId: string, newTitle: string) {
    const original = await this.getBundleComplete(bundleId);

    // Create new bundle
    const newBundle = await widgetBundlesApi.create({
      title: newTitle,
      description: `Cloned from ${original.title}`,
      image: original.image,
    });

    // Clone all widgets to new bundle
    const widgetIds = original.widgets.map((w: any) => w.id);
    await Promise.all(
      widgetIds.map(widgetId =>
        widgetBundlesApi.addWidget(newBundle.data.data.id, widgetId)
      )
    );

    return newBundle.data.data;
  },

  /**
   * Organize widgets in bundle
   */
  async organizeWidgets(bundleId: string, widgetOrder: string[]) {
    // Remove all widgets
    const current = await widgetBundlesApi.getWidgets(bundleId);
    await Promise.all(
      current.data.data.map((w: any) =>
        widgetBundlesApi.removeWidget(bundleId, w.id)
      )
    );

    // Add widgets in new order
    for (const widgetId of widgetOrder) {
      await widgetBundlesApi.addWidget(bundleId, widgetId);
    }

    return this.getBundleComplete(bundleId);
  },

  /**
   * Get bundle statistics
   */
  async getBundleStats() {
    const [stats, allBundles] = await Promise.all([
      widgetBundlesApi.getStatistics(),
      widgetBundlesApi.getAll(),
    ]);

    const bundles = allBundles.data.data;

    // Calculate stats
    const systemBundles = bundles.filter(b => b.system).length;
    const customBundles = bundles.filter(b => !b.system).length;

    return {
      ...stats.data.data,
      totalBundles: bundles.length,
      systemBundles,
      customBundles,
    };
  },

  /**
   * Search bundles and widgets
   */
  async search(query: string) {
    const [bundles, widgets] = await Promise.all([
      widgetBundlesApi.getAll({ search: query }),
      widgetTypesApi.getAll({ search: query }),
    ]);

    return {
      query,
      bundles: bundles.data.data,
      widgets: widgets.data.data,
      totalResults: bundles.data.data.length + widgets.data.data.length,
    };
  },
};