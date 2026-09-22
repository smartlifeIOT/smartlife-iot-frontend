import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deviceProfilesApi,
  assetProfilesApi,
} from '@/services/api/profiles.api';
import type { DeviceProfileMultiStepFormData } from '../types/device-profile-form.types';
import type { AssetProfileFormData } from '../types/asset-profile-form.types';

/**
 * Hook to fetch all device profiles
 */
export const useDeviceProfiles = (params?: {
  search?: string;
  tenantId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['profiles', 'device', params],
    queryFn: () => deviceProfilesApi.getAll(params),
  });
};

/**
 * Hook to fetch device profile statistics
 */
export const useDeviceProfileStatistics = () => {
  return useQuery({
    queryKey: ['profiles', 'device', 'statistics'],
    queryFn: () => deviceProfilesApi.getStatistics(),
  });
};

/**
 * Hook to fetch a single device profile by ID
 */
export const useDeviceProfile = (profileId: string) => {
  return useQuery({
    queryKey: ['profiles', 'device', profileId],
    queryFn: () => deviceProfilesApi.getById(profileId),
    enabled: !!profileId,
  });
};

/**
 * Hook to fetch all asset profiles
 */
export const useAssetProfiles = (params?: {
  search?: string;
  tenantId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['profiles', 'asset', params],
    queryFn: () => assetProfilesApi.getAll(params),
  });
};

/**
 * Hook to fetch assets by asset profile ids
 */

export const useAssetProfileAssets = (profileIds?: string[]) => {
  return useQuery({
    queryKey: ['profiles', 'asset', 'assets', profileIds],
    queryFn: async () => {
      const ids = profileIds || [];
      const results = await Promise.all(
        ids.map((id) => assetProfilesApi.getAssets(id))
      );
      return results.reduce<Record<string, unknown[]>>((acc, res, index) => {
        acc[ids[index]] = res.data.data || [];
        return acc;
      }, {});
    },
    enabled: !!profileIds?.length,
  });
};

/**
 * Hook to fetch a single asset profile by ID
 */
export const useAssetProfile = (profileId: string) => {
  return useQuery({
    queryKey: ['profiles', 'asset', profileId],
    queryFn: () => assetProfilesApi.getById(profileId),
    enabled: !!profileId,
  });
};

/**
 * Transform form data to API format for device profile
 */
// function transformFormDataToApiFormat(
//   formData: DeviceProfileMultiStepFormData
// ): Partial<import('@/services/api/profiles.api').DeviceProfile> {
//   // Transform device type
//   const transformType = (
//     type: string
//   ): 'DEFAULT' | 'MQTT' | 'HTTP' | 'COAP' | 'LWM2M' | 'SNMP' => {
//     const typeMap: Record<
//       string,
//       'DEFAULT' | 'MQTT' | 'HTTP' | 'COAP' | 'LWM2M' | 'SNMP'
//     > = {
//       Sensor: 'DEFAULT',
//       Gateway: 'DEFAULT',
//       Meter: 'DEFAULT',
//       Actuator: 'DEFAULT',
//     };
//     return typeMap[type] || 'DEFAULT';
//   };

//   // Transform transport type
//   const transformTransportType = (
//     type?: string
//   ): 'DEFAULT' | 'MQTT' | 'HTTP' | 'COAP' | 'LWM2M' | 'SNMP' => {
//     if (!type) return 'DEFAULT';
//     const transportMap: Record<
//       string,
//       'DEFAULT' | 'MQTT' | 'HTTP' | 'COAP' | 'LWM2M' | 'SNMP'
//     > = {
//       MQTT: 'MQTT',
//       HTTP: 'HTTP',
//       COAP: 'COAP',
//       LWM2M: 'LWM2M',
//       SNMP: 'SNMP',
//     };
//     return transportMap[type] || 'DEFAULT';
//   };

//   // Transform provision type
//   const transformProvisionType = (
//     provisionType?: string
//   ):
//     | 'DISABLED'
//     | 'ALLOW_CREATE_NEW_DEVICES'
//     | 'CHECK_PRE_PROVISIONED_DEVICES'
//     | undefined => {
//     if (!provisionType) return undefined;
//     if (provisionType === 'Disabled') return 'DISABLED';
//     if (provisionType === 'Allow creating new devices')
//       return 'ALLOW_CREATE_NEW_DEVICES';
//     if (provisionType === 'Check pre-provisioned devices')
//       return 'CHECK_PRE_PROVISIONED_DEVICES';
//     return undefined;
//   };

//   return {
//     name: formData.name,
//     description: formData.description || undefined,
//     type: transformType(formData.type),
//     transportType: transformTransportType(formData.transportConfig?.type),
//     transportConfiguration: formData.transportConfig
//       ? {
//           type: formData.transportConfig.type,
//           ...formData.transportConfig.mqttConfig,
//           ...formData.transportConfig.httpConfig,
//           ...formData.transportConfig.coapConfig,
//           ...formData.transportConfig.modbusConfig,
//           ...formData.transportConfig.loraWanConfig,
//         }
//       : undefined,
//     alarmRules: formData.alarmRules?.map((rule) => ({
//       name: rule.name,
//       condition: rule.condition,
//       severity: rule.severity,
//     })),
//     provisionType: transformProvisionType(
//       formData.provisioningConfig?.provisionType
//     ),
//     provisionConfiguration: formData.provisioningConfig
//       ? {
//           provisionType: formData.provisioningConfig.provisionType,
//           defaultRuleChain: formData.provisioningConfig.defaultRuleChain,
//           preProvisionedDevices:
//             formData.provisioningConfig.preProvisionedDevices,
//         }
//       : undefined,
//   };
// }

/**
 * Hook to create a device profile
 * Transforms form data to API format and submits to /profiles/device
 */
export const useCreateDeviceProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: DeviceProfileMultiStepFormData) => {
      // const apiData = transformFormDataToApiFormat(formData);
      return deviceProfilesApi.create(formData);
    },
    onSuccess: () => {
      // Invalidate and refetch device profiles list
      queryClient.invalidateQueries({ queryKey: ['profiles', 'device'] });
    },
  });
};

/**
 * Hook to update a device profile
 */
export const useUpdateDeviceProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      data,
    }: {
      profileId: string;
      data: DeviceProfileMultiStepFormData;
    }) => {
      // const apiData = transformFormDataToApiFormat(data);
      return deviceProfilesApi.update(profileId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch device profiles list and the specific profile
      queryClient.invalidateQueries({ queryKey: ['profiles', 'device'] });
      queryClient.invalidateQueries({
        queryKey: ['profiles', 'device', variables.profileId],
      });
    },
  });
};

/**
 * Hook to create an asset profile
 * Transforms form data to API format and submits to /profiles/asset
 */
export const useCreateAssetProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AssetProfileFormData) => {
      // Transform form data to API format
      const apiData = {
        name: formData.name,
        description: formData.description || undefined,
        defaultRuleChainId: formData.defaultRuleChain || undefined,
        defaultQueueName: formData.defaultQueueName || undefined,
        // Map other fields as needed based on API structure
      };
      return assetProfilesApi.create(apiData);
    },
    onSuccess: () => {
      // Invalidate and refetch asset profiles list
      queryClient.invalidateQueries({ queryKey: ['profiles', 'asset'] });
    },
  });
};

/**
 * Hook to update an asset profile
 */
export const useUpdateAssetProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      data,
    }: {
      profileId: string;
      data: AssetProfileFormData;
    }) => {
      const apiData = {
        name: data.name,
        description: data.description || undefined,
        defaultRuleChainId: data.defaultRuleChain || undefined,
        defaultQueueName: data.defaultQueueName || undefined,
        // Map other fields as needed based on API structure
      };
      return assetProfilesApi.update(profileId, apiData);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch asset profiles list and the specific profile
      queryClient.invalidateQueries({ queryKey: ['profiles', 'asset'] });
      queryClient.invalidateQueries({
        queryKey: ['profiles', 'asset', variables.profileId],
      });
    },
  });
};

/**
 * Hook to delete an asset profile
 */
export const useDeleteAssetProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      return assetProfilesApi.delete(profileId);
    },
    onSuccess: () => {
      // Invalidate and refetch asset profiles list
      queryClient.invalidateQueries({ queryKey: ['profiles', 'asset'] });
    },
  });
};
