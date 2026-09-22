export interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'gateway' | 'controller' | 'actuator';
  status: 'online' | 'offline' | 'idle' | 'error' | 'maintenance';
  model?: string;
  manufacturer?: string;
  firmwareVersion?: string;
  location?: string;
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: any;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alarm {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INDETERMINATE';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED';
  originatorId: string;
  startTime: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  description?: string;
  attributes?: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}