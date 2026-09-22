export interface EdgeInstance {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'syncing' | 'error';
  version: string;
  ipAddress: string;
  lastSeen: Date;
  devices: number;
  cpu: number;
  memory: number;
  storage: number;
  uptime: string;
  dataSync: {
    pending: number;
    lastSync: Date;
  };
}

export interface EdgeActivity {
  id: string;
  instanceId: string;
  instanceName: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action: string;
  timestamp: Date;
  details?: string;
}
