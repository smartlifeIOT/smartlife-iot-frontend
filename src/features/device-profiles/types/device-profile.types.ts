export type DeviceType = 'Sensor' | 'Gateway' | 'Meter' | 'Actuator';

export type TransportType = 'MQTT' | 'HTTP' | 'CoAP' | 'Modbus' | 'LoRaWAN';

export type ProvisionType =
  | 'Allow creating new devices'
  | 'Check pre-provisioned devices'
  | 'Disabled';

export interface DeviceProfile {
  id: string;
  name: string;
  description?: string;
  type: string; // API returns strings like "air_quality_monitor", "sensor", etc.
  transportType: string; // API returns strings like "mqtt", "http", etc.
  provisionType?: string; // API returns strings like "allow_create_new", etc.
  default: boolean; // API uses "default" not "isDefault"
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  devices?: number; // Count of devices using this profile (may need separate API call)
}

export interface DeviceProfileFormData {
  name: string;
  description: string;
  type: DeviceType;
  transportType: TransportType;
  provisionType: ProvisionType;
  defaultRuleChain: string;
}

export const DEFAULT_DEVICE_PROFILE_FORM_DATA: DeviceProfileFormData = {
  name: '',
  description: '',
  type: 'Sensor',
  transportType: 'MQTT',
  provisionType: 'Allow creating new devices',
  defaultRuleChain: 'Root Rule Chain',
};
