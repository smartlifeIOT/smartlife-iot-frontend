import type {
  DeviceType,
  TransportType,
  ProvisionType,
} from '@/features/device-profiles/types';

export interface AlarmRule {
  id?: string;
  name: string;
  condition: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INDETERMINATE';
}

export interface TransportConfiguration {
  type: TransportType;
  mqttConfig?: {
    deviceTelemetryTopic?: string;
    deviceAttributesTopic?: string;
    deviceRpcRequestTopic?: string;
    deviceRpcResponseTopic?: string;
  };
  httpConfig?: {
    baseUrl?: string;
    timeout?: number;
  };
  coapConfig?: {
    port?: number;
    timeout?: number;
  };
  modbusConfig?: {
    port?: number;
    baudRate?: number;
  };
  loraWanConfig?: {
    region?: string;
    appEui?: string;
  };
}

export interface DeviceProvisioningConfig {
  provisionType: ProvisionType;
  defaultRuleChain: string;
  preProvisionedDevices?: string[];
}

import type { DeviceProfileMultiStepFormSchema } from './device-profile-form.schema';

// Use the Zod schema type as the source of truth
export type DeviceProfileMultiStepFormData = DeviceProfileMultiStepFormSchema;

export const DEFAULT_MULTI_STEP_FORM_DATA: DeviceProfileMultiStepFormData = {
  name: '',
  description: '',
  type: '',
  defaultRuleChainId: '',
  defaultQueueName: '',
  // defaultEdgeRuleChain: '',
  transportType: '',
  transportConfiguration: {},
  alarmRules: [],
  provisionType: '',
  provisionConfiguration: {},
};
