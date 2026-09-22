import type { Asset } from '@/services/api/assets.api';

export interface AssetFormData {
  name: string;
  type: string;
  label?: string;
  assetProfileId?: string;
  parentId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
}

export interface AssetFilters {
  search?: string;
  type?: string;
  assetProfileId?: string;
  parentId?: string;
}

export interface AssetTreeNode extends Asset {
  children: AssetTreeNode[];
}

export interface AssetBreadcrumb {
  id: string;
  name: string;
  type: string;
}

export interface AssetStats {
  totalAssets: number;
  directChildren: number;
  assignedDevices: number;
  depth: number;
}

export type AssetAction =
  | 'view'
  | 'edit'
  | 'delete'
  | 'move'
  | 'assign-devices'
  | 'clone';

export interface AssetProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultRuleChain: string;
  createdAt: Date;
  assets: number;
  default: boolean;
}
export interface AssetProfilesResponse {
  message: string;
  data: AssetProfile[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
