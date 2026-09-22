import { assetsApi } from '@/services/api/index.ts';
import type { Asset } from '@/services/api/assets.api.ts';

/**
 * Assets Feature Service
 * Handles business logic for asset management and hierarchy
 */
export const assetService = {
  /**
   * Create asset with hierarchy validation
   */
  async createAsset(data: Partial<Asset>) {
    // Validate required fields
    if (!data.name || !data.type) {
      throw new Error('Asset name and type are required');
    }

    // If parent is specified, validate it exists
    if (data.parentAssetId) {
      await assetsApi.getById(data.parentAssetId);
    }

    const response = await assetsApi.create(data);
    return response.data.data;
  },

  /**
   * Build complete asset hierarchy tree
   */
  async buildHierarchyTree(rootId?: string) {
    const roots = rootId 
      ? [await assetsApi.getById(rootId).then(r => r.data.data)]
      : await assetsApi.getRoots().then(r => r.data.data);

    const buildTree = async (asset: Asset): Promise<Asset & { children: any[] }> => {
      const children = await assetsApi.getChildren(asset.id).then(r => r.data.data);
      const childrenWithSubtree = await Promise.all(
        children.map(child => buildTree(child))
      );

      return {
        ...asset,
        children: childrenWithSubtree,
      };
    };

    const trees = await Promise.all(roots.map(root => buildTree(root)));
    return trees;
  },

  /**
   * Move asset to new parent
   */
  async moveAsset(assetId: string, newParentId: string | null) {
    // Validate that we're not creating a circular reference
    if (newParentId) {
      const path = await assetsApi.getPath(assetId).then(r => r.data.data);
      const wouldCreateCircular = path.some(p => p.id === newParentId);

      if (wouldCreateCircular) {
        throw new Error('Cannot move asset: would create circular reference');
      }
    }

    return assetsApi.update(assetId, { parentAssetId: newParentId ?? undefined });
  },

  /**
   * Get asset breadcrumb path
   */
  async getBreadcrumb(assetId: string) {
    const path = await assetsApi.getPath(assetId).then(r => r.data.data);
    
    return path.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
    }));
  },

  /**
   * Assign multiple devices to asset
   */
  async assignDevicesInBulk(assetId: string, deviceIds: string[]) {
    try {
      await assetsApi.assignDevicesBulk(assetId, deviceIds);
      return {
        success: true,
        assetId,
        deviceCount: deviceIds.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to assign devices: ${error.message}`);
    }
  },

  /**
   * Get asset with all related data
   */
  async getAssetComplete(assetId: string) {
    const [assetResponse, childrenResponse, devicesResponse, pathResponse] = 
      await Promise.all([
        assetsApi.getById(assetId),
        assetsApi.getChildren(assetId),
        assetsApi.getDevices(assetId),
        assetsApi.getPath(assetId),
      ]);

    return {
      asset: assetResponse.data.data,
      children: childrenResponse.data.data,
      devices: devicesResponse.data.data,
      path: pathResponse.data.data,
    };
  },

  /**
   * Calculate asset statistics
   */
  async calculateAssetStats(assetId: string) {
    const hierarchy = await assetsApi.getHierarchy(assetId).then(r => r.data.data);
    
    const countNodes = (node: any): number => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + node.children.reduce((sum: number, child: any) => 
        sum + countNodes(child), 0
      );
    };

    const devices = await assetsApi.getDevices(assetId).then(r => r.data.data);
    const children = await assetsApi.getChildren(assetId).then(r => r.data.data);

    return {
      totalAssets: countNodes(hierarchy),
      directChildren: children.length,
      assignedDevices: devices.length,
      depth: await this.calculateDepth(assetId),
    };
  },

  /**
   * Calculate hierarchy depth
   */
  async calculateDepth(assetId: string): Promise<number> {
    const children = await assetsApi.getChildren(assetId).then(r => r.data.data);
    
    if (children.length === 0) return 1;

    const childDepths = await Promise.all(
      children.map(child => this.calculateDepth(child.id))
    );

    return 1 + Math.max(...childDepths);
  },

  /**
   * Search assets by location radius
   */
  async findNearbyAssets(latitude: number, longitude: number, radiusKm: number) {
    const assets = await assetsApi.searchByLocation(
      latitude,
      longitude,
      radiusKm * 1000 // Convert to meters
    );

    return assets.data.data;
  },

  /**
   * Update asset location
   */
  async updateLocation(
    assetId: string,
    latitude: number,
    longitude: number,
    address?: string
  ) {
    return assetsApi.update(assetId, {
      location: {
        latitude,
        longitude,
        address,
      },
    });
  },

  /**
   * Clone asset with children
   */
  async cloneAssetWithChildren(assetId: string, newName: string, cloneChildren = false) {
    const original = await assetsApi.getById(assetId).then(r => r.data.data);

    const clonedData = {
      name: newName,
      type: original.type,
      label: original.label,
      assetProfileId: original.assetProfileId,
      parentAssetId: original.parentAssetId,
      location: original.location,
      attributes: original.attributes,
      additionalInfo: {
        ...original.additionalInfo,
        clonedFrom: assetId,
        clonedAt: new Date().toISOString(),
      },
    };

    const cloned = await this.createAsset(clonedData);

    if (cloneChildren) {
      const children = await assetsApi.getChildren(assetId).then(r => r.data.data);
      
      for (const child of children) {
        await this.cloneAssetWithChildren(
          child.id,
          `${child.name} (Copy)`,
          true
        );
      }
    }

    return cloned;
  },

  /**
   * Validate asset hierarchy
   */
  validateHierarchy(assets: Asset[]) {
    const ids = new Set(assets.map(a => a.id));
    const errors = [];

    for (const asset of assets) {
      // Check parent exists
      if (asset.parentAssetId && !ids.has(asset.parentAssetId)) {
        errors.push({
          assetId: asset.id,
          error: 'Parent asset not found',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};