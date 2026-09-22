import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { floorPlansApi } from '@/services/api';
import { floorPlanService } from '../services/floorPlanService';
import type {
  FloorPlan,
  FloorPlanQuery,
  DeviceMarker,
} from '@/features/floorPlan/services/floor-plans.api';
import toast from 'react-hot-toast';

// ============================================
// Floor Plan Query Hooks
// ============================================

/**
 * Hook to fetch all floor plans
 * Handles nested API response structure: response.data.data.data
 * Returns data with extracted floor plans array for easier access
 */
export const useFloorPlans = (params?: FloorPlanQuery) => {
  return useQuery({
    queryKey: ['floor-plans', params],
    queryFn: async () => {
      const response = await floorPlansApi.getAll(params);
      // Handle deeply nested response: response.data.data.data
      // Extract the actual floor plans array
      return response.data.data;
    },
  });
};

// upload the dwg

/**
 * Hook to fetch a single floor plan by ID
 * Handles nested API response structure: response.data.data
 */
export const useFloorPlan = (floorPlanId: string | undefined) => {
  return useQuery({
    queryKey: ['floor-plans', floorPlanId],
    queryFn: async () => {
      const response = await floorPlansApi.getById(floorPlanId!);
      // Handle nested response structure: response.data.data
      // The API returns: { data: { data: FloorPlan } }
      const apiResponse = response.data as unknown as {
        data?: FloorPlan;
      };
      return {
        ...response,
        data: apiResponse?.data || (response.data as unknown as FloorPlan),
      };
    },
    enabled: !!floorPlanId,
    retry: 2,
  });
};

/**
 * Hook to fetch floor plan with devices
 */
export const useFloorPlanWithDevices = (floorPlanId: string | undefined) => {
  return useQuery({
    queryKey: ['floor-plans', floorPlanId, 'devices'],
    queryFn: () => floorPlanService.getFloorPlanWithDevices(floorPlanId!),
    enabled: !!floorPlanId,
    retry: 2,
  });
};

/**
 * Hook to fetch floor plans by building
 */
export const useFloorPlansByBuilding = (
  building: string | undefined,
  params?: FloorPlanQuery
) => {
  return useQuery({
    queryKey: ['floor-plans', 'building', building, params],
    queryFn: () => floorPlanService.getFloorPlansByBuilding(building!, params),
    enabled: !!building,
  });
};

/**
 * Hook to fetch floor plans by floor
 */
export const useFloorPlansByFloor = (
  floor: string | undefined,
  params?: FloorPlanQuery
) => {
  return useQuery({
    queryKey: ['floor-plans', 'floor', floor, params],
    queryFn: () => floorPlanService.getFloorPlansByFloor(floor!, params),
    enabled: !!floor,
  });
};

/**
 * Hook to fetch floor plan devices
 */
export const useFloorPlanDevices = (floorPlanId: string | undefined) => {
  return useQuery({
    queryKey: ['floor-plans', floorPlanId, 'devices'],
    queryFn: () => floorPlansApi.getDevices(floorPlanId!),
    enabled: !!floorPlanId,
  });
};

/**
 * Hook to fetch floor plan statistics
 */
export const useFloorPlanStatistics = () => {
  return useQuery({
    queryKey: ['floor-plans', 'statistics'],
    queryFn: async () => {
      const response = await floorPlansApi.getStatistics();
      return response.data.data;
    },
  });
};

// ============================================
// Floor Plan Mutation Hooks
// ============================================

/**
 * Hook to create a new floor plan
 */
export const useCreateFloorPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      building?: string;
      floor?: string;
      imageFile?: File;
      dimensions: { width: number; height: number; scale?: number };
      deviceMarkers?: DeviceMarker[];
      metadata?: Record<string, unknown>;
    }) => floorPlanService.createFloorPlan(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', 'statistics'],
      });
      toast.success('Floor plan created successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create floor plan');
    },
  });
};

/**
 * Hook to update a floor plan
 */
export const useUpdateFloorPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FloorPlan> }) =>
      floorPlanService.updateFloorPlan(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.id],
      });
      toast.success('Floor plan updated successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update floor plan');
    },
  });
};

/**
 * Hook to delete a floor plan
 */
export const useDeleteFloorPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (floorPlanId: string) => floorPlansApi.delete(floorPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', 'statistics'],
      });
      toast.success('Floor plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete floor plan');
    },
  });
};

/**
 * Hook to clone a floor plan
 */
export const useCloneFloorPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      floorPlanService.cloneFloorPlan(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] });
      toast.success('Floor plan cloned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clone floor plan');
    },
  });
};

/**
 * Hook to upload floor plan image
 */
export const useUploadFloorPlanImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, imageFile }: { id: string; imageFile: File }) =>
      floorPlanService.uploadFloorPlanImage(id, imageFile),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.id],
      });
      toast.success('Image uploaded successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
};

// ============================================
// Device Marker Mutation Hooks
// ============================================

/**
 * Hook to add a device marker to a floor plan
 */
export const useAddDeviceMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      floorPlanId,
      marker,
    }: {
      floorPlanId: string;
      marker: DeviceMarker;
    }) => floorPlanService.addDeviceMarker(floorPlanId, marker),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.floorPlanId],
      });
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.floorPlanId, 'devices'],
      });
      toast.success('Device marker added successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add device marker');
    },
  });
};

/**
 * Hook to update a device marker
 */
export const useUpdateDeviceMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      floorPlanId,
      deviceId,
      updates,
    }: {
      floorPlanId: string;
      deviceId: string;
      updates: Partial<DeviceMarker>;
    }) => floorPlanService.updateDeviceMarker(floorPlanId, deviceId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.floorPlanId],
      });
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.floorPlanId, 'devices'],
      });
      toast.success('Device marker updated successfully');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update device marker');
    },
  });
};

/**
 * Hook to remove a device marker
 */
export const useRemoveDeviceMarker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      floorPlanId,
      deviceId,
    }: {
      floorPlanId: string;
      deviceId: string;
    }) => floorPlanService.removeDeviceMarker(floorPlanId, deviceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.floorPlanId],
      });
      queryClient.invalidateQueries({
        queryKey: ['floor-plans', variables.floorPlanId, 'devices'],
      });
      toast.success('Device marker removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove device marker');
    },
  });
};
