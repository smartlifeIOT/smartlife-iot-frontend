export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  trigger: {
    type: string;
    value?: number;
    value2?: number;
    debounce?: number;
    deviceId?: string;
    operator?: string;
    schedule?: string;
    attributeKey?: string;
    telemetryKey?: string;
    // Keep these for backward compatibility if needed, but mark as optional
    device?: string;
    condition?: string;
  };
  action: {
    type: string;
    value?: any;
    command?: string;
    message?: string;
    deviceId?: string;
    target?: string;
    recipients?: string[];
    webhookUrl?: string;
    webhookBody?: any;
    webhookMethod?: string;
    webhookHeaders?: any;
    delay?: number;
    priority?: 'low' | 'medium' | 'high';
    channel?: string;
  };
  actions?: Array<{
    id?: string;
    type: string;
    deviceId?: string;
    command?: string;
    value?: any;
    message?: string;
    recipients?: string[];
    delay?: number;
    priority?: 'low' | 'medium' | 'high';
    channel?: string;
    params?: any;
    webhookUrl?: string;
    webhookMethod?: string;
    webhookHeaders?: any;
    webhookBody?: any;
  }>;
  execution?: {
    sequence: boolean;
    parallel: boolean;
    stopOnError: boolean;
    retryCount: number;
  };
  executionCount: number;
  lastTriggered?: string | null;
  lastExecuted?: string | null;
  lastError?: string | null;
  settings?: {
    cooldown: number;
    activeDays: number[];
    maxRetries: number;
    activeHours?: {
      start: string;
      end: string;
    };
    retryOnFailure: boolean;
    maxExecutionsPerDay: number;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type TriggerType = 'threshold' | 'state' | 'schedule' | 'event';
