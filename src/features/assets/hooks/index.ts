import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/services/api';
import { assetService } from '../services/assetService';
import type { AssetQuery } from '@/services/api/assets.api';
import type { AssetFormData } from '../types';
import toast from 'react-hot-toast';

export const useAssets = (params?: AssetQuery) => {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetsApi.getAll(params),
  });
};

export const useAsset = (assetId: string) => {
  return useQuery({
    queryKey: ['assets', assetId],
    queryFn: () => assetsApi.getById(assetId),
    enabled: !!assetId,
  });
};

export const useAssetHierarchy = (assetId?: string) => {
  return useQuery({
    queryKey: ['assets', 'hierarchy', assetId],
    queryFn: () => assetService.buildHierarchyTree(assetId),
  });
};

export const useAssetBreadcrumb = (assetId: string) => {
  return useQuery({
    queryKey: ['assets', assetId, 'breadcrumb'],
    queryFn: () => assetService.getBreadcrumb(assetId),
    enabled: !!assetId,
  });
};

export const useAssetComplete = (assetId: string) => {
  return useQuery({
    queryKey: ['assets', assetId, 'complete'],
    queryFn: () => assetService.getAssetComplete(assetId),
    enabled: !!assetId,
  });
};

export const useAssetStatistics = () => {
  return useQuery({
    queryKey: ['assets', 'statistics'],
    queryFn: () => assetsApi.getStatistics(),
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssetFormData) => assetService.createAsset(data),
    onSuccess: () => {
      toast.success('Asset created successfully');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      toast.error('Failed to create asset');
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetFormData> }) =>
      assetsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] });
      toast.success('Asset updated successfully');
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => assetsApi.delete(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useMoveAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assetId,
      newParentId,
    }: {
      assetId: string;
      newParentId: string | null;
    }) => assetService.moveAsset(assetId, newParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useAssignDevices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assetId,
      deviceIds,
    }: {
      assetId: string;
      deviceIds: string[];
    }) => assetService.assignDevicesInBulk(assetId, deviceIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assets', variables.assetId],
      });
    },
  });
};

export { useAssetsPage } from './useAssetsPage';
export type { Asset } from './useAssetsPage';
export { useAssetDetails } from './useAssetDetails';
export type {
  AssetDetails,
  ConnectedDevice,
  RecentActivity,
  AssetHierarchy,
} from './useAssetDetails';
