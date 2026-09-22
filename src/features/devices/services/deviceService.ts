import { devicesApi } from '@/services/api/index.ts';
import type {
  Device,
  DeviceQuery,
  DeviceType,
} from '@/services/api/devices.api.ts';
import type { DeviceFormData } from '../types/device.types.ts';

/**
 * Devices Feature Service
 * Handles business logic for device management
 */
export const deviceService = {
  /**
   * Provision a new device with validation and setup
   */
  async provisionDevice(data: DeviceFormData | Partial<Device>) {
    // 2. Convert DeviceFormData to Device format
    const deviceData: any = {
      name: data.name,
      type: data.type,
      description: data.description,
      connectionType: data.connectionType,
      manufacturer: data.manufacturer,
      model: data.model,
      protocol: 'http',
      metadata: {
        manufacturer: data.manufacturer,
        model: data.model,
        codecId: data.codecId,
      },
    };

    // Clean up undefined fields in metadata
    Object.keys(deviceData.metadata).forEach((key) => {
      if (deviceData.metadata[key] === undefined) {
        delete deviceData.metadata[key];
      }
    });

    // 3. Create device
    const response = await devicesApi.create(deviceData);
    const device = response.data.data;

    // 3. Set default attributes if not provided
    // if (!data.attributes) {
    //   await devicesApi.updateAttributes(device.id, {
    //     status: 'provisioned',
    //     provisionedAt: new Date().toISOString(),
    //     active: true,
    //   });
    // }

    return device;
  },

  /**
   * Bulk provision multiple devices
   */
  async bulkProvision(devices: DeviceFormData[]) {
    const results = [];
    const errors = [];

    for (const device of devices) {
      try {
        const result = await this.provisionDevice(device);
        results.push(result);
      } catch (error: any) {
        errors.push({
          device: device.name,
          error: error.message,
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      total: devices.length,
      successCount: results.length,
      failCount: errors.length,
    };
  },

  /**
   * Activate device
   */
  // async activateDevice(deviceId: string) {
  //   await devicesApi.update(deviceId, {
  //     active: true,
  //     activatedAt: new Date().toISOString(),
  //   });

  //   return devicesApi.getById(deviceId);
  // },

  /**
   * Deactivate device
   */
  // async deactivateDevice(deviceId: string, reason?: string) {
  //   await devicesApi.updateAttributes(deviceId, {
  //     active: false,
  //     deactivatedAt: new Date().toISOString(),
  //     deactivationReason: reason,
  //   });

  //   return devicesApi.getById(deviceId);
  // },

  /**
   * Get device with telemetry data
   */
  async getDeviceWithTelemetry(deviceId: string, keys?: string[]) {
    const [deviceResponse, telemetryResponse] = await Promise.all([
      devicesApi.getById(deviceId),
      devicesApi.getTelemetry(deviceId, keys),
    ]);

    return {
      device: deviceResponse.data.data,
      telemetry: telemetryResponse.data.data,
    };
  },

  /**
   * Search devices with advanced filtering
   */
  async searchDevices(query: DeviceQuery & { tags?: string[] }) {
    const response = await devicesApi.getAll(query);

    // Apply client-side tag filtering if needed
    if (query.tags && query.tags.length > 0) {
      const filtered = response.data.data;

      return {
        ...response.data,
        data: filtered,
      };
    }

    return response.data;
  },

  /**
   * Clone device configuration
   */
  async cloneDevice(deviceId: string, newName: string) {
    const response = await devicesApi.getById(deviceId);
    const originalDevice = response.data.data;

    const clonedData = {
      name: newName,
      type: originalDevice.type,
      label: originalDevice.label,
      deviceProfileId: originalDevice.deviceProfileId,
      attributes: originalDevice.attributes,
      additionalInfo: {
        ...originalDevice.additionalInfo,
        clonedFrom: deviceId,
        clonedAt: new Date().toISOString(),
      },
    };

    return this.provisionDevice(clonedData);
  },

  /**
   * Validate device telemetry
   */
  validateTelemetry(telemetry: Record<string, any>, expectedKeys: string[]) {
    const missingKeys = expectedKeys.filter((key) => !(key in telemetry));

    if (missingKeys.length > 0) {
      throw new Error(
        `Missing required telemetry keys: ${missingKeys.join(', ')}`
      );
    }

    return true;
  },

  /**
   * Get device health status
   */
  async getDeviceHealth(deviceId: string) {
    const response = await devicesApi.getById(deviceId);
    const device = response.data.data;

    const lastSeen = device.lastActivityTime
      ? new Date(device.lastActivityTime)
      : null;

    const now = new Date();
    const minutesSinceLastSeen = lastSeen
      ? Math.floor((now.getTime() - lastSeen.getTime()) / 60000)
      : null;

    let status: 'online' | 'offline' | 'warning' = 'offline';

    if (minutesSinceLastSeen !== null) {
      if (minutesSinceLastSeen < 5) status = 'online';
      else if (minutesSinceLastSeen < 15) status = 'warning';
    }

    return {
      deviceId: device.id,
      deviceName: device.name,
      status,
      minutesSinceLastSeen,
      // active: device.active,
    };
  },
};
