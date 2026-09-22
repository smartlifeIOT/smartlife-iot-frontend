import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_WS_BASE_URL || 'wss://api.smart-life.sa';

// ─── Server → Client payload types ──────────────────────────────────────────

export interface TelemetryUpdatePayload {
  deviceId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface DashboardCurrentDataPayload {
  widgets: unknown[];
  devices: unknown[];
}

export interface DashboardTelemetryUpdatePayload {
  deviceId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface AlarmUpdatePayload {
  id: string;
  status: string;
  severity: string;
  name: string;
}

export interface DeviceStatusPayload {
  deviceId: string;
  status: 'online' | 'offline';
}

export interface EdgeStatusPayload {
  edgeId: string;
  status: 'online' | 'offline';
  name: string;
}

// ─── WebSocketClient ─────────────────────────────────────────────────────────

class WebSocketClient {
  private socket: Socket | null = null;
  private connected = false;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async connect(token?: string): Promise<void> {
    if (this.connected) return;

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        // Guard against the promise hanging forever if the server never
        // responds with either `connect` or `connect_error`.
        const timeout = setTimeout(() => {
          this.socket?.disconnect();
          reject(new Error('WebSocket connection timed out'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.connected = true;
          console.log('✅ WebSocket connected! Socket ID:', this.socket?.id);
          resolve();
        });

        this.socket.on('connect_error', (err) => {
          clearTimeout(timeout);
          console.error('❌ WebSocket connection error:', err.message);
          reject(err);
        });

        this.socket.on('disconnect', (reason) => {
          this.connected = false;
          console.log('🔒 WebSocket disconnected. Reason:', reason);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // ── Generic low-level helpers ──────────────────────────────────────────────

  /** Generic subscribe to any event. Returns an unsubscribe callback. */
  subscribe<T = unknown>(
    event: string,
    handler: (data: T) => void
  ): () => void {
    if (!this.socket) {
      throw new Error('WebSocket is not connected. Call connect() first.');
    }
    this.socket.on(event, handler);
    return () => {
      this.socket?.off(event, handler);
    };
  }

  /** Generic emit to any event. */
  send(event: string, data: unknown): void {
    if (!this.socket) {
      throw new Error('WebSocket is not connected. Call connect() first.');
    }
    this.socket.emit(event, data);
  }

  // ── Client → Server: typed emit methods ───────────────────────────────────

  /** Subscribe to real-time telemetry pushes for a device. */
  subscribeToTelemetry(deviceId: string): void {
    this.send('subscribe-telemetry', { deviceId });
  }

  /** Unsubscribe from real-time telemetry pushes for a device. */
  unsubscribeFromTelemetry(deviceId: string): void {
    this.send('unsubscribe-telemetry', { deviceId });
  }

  /** Subscribe to dashboard updates. */
  subscribeToDashboard(dashboardId: string): void {
    this.send('subscribe-dashboard', { dashboardId });
  }

  /** Unsubscribe from dashboard updates. */
  unsubscribeFromDashboard(dashboardId: string): void {
    this.send('unsubscribe-dashboard', { dashboardId });
  }

  /** Subscribe to alarm updates (global, no payload needed). */
  subscribeToAlarms(): void {
    this.send('subscribe-alarms', {});
  }

  /** Request the latest telemetry snapshot for a device (one-shot). */
  getDeviceTelemetry(deviceId: string): void {
    this.send('get-device-telemetry', { deviceId });
  }

  // ── Server → Client: typed listener methods ────────────────────────────────

  /** Listen for new telemetry pushes: `telemetry:update`. */
  onTelemetryUpdate(
    handler: (payload: TelemetryUpdatePayload) => void
  ): () => void {
    return this.subscribe<TelemetryUpdatePayload>('telemetry:update', handler);
  }

  /** Listen for dashboard snapshot: `dashboard:current-data`. */
  onDashboardCurrentData(
    handler: (payload: DashboardCurrentDataPayload) => void
  ): () => void {
    return this.subscribe<DashboardCurrentDataPayload>(
      'dashboard:current-data',
      handler
    );
  }

  /** Listen for per-widget telemetry push from dashboard: `dashboard:telemetry-update`. */
  onDashboardTelemetryUpdate(
    handler: (payload: DashboardTelemetryUpdatePayload) => void
  ): () => void {
    return this.subscribe<DashboardTelemetryUpdatePayload>(
      'dashboard:telemetry-update',
      handler
    );
  }

  /** Listen for alarm state changes: `alarm:update`. */
  onAlarmUpdate(handler: (payload: AlarmUpdatePayload) => void): () => void {
    return this.subscribe<AlarmUpdatePayload>('alarm:update', handler);
  }

  /** Listen for device online/offline events: `device:status`. */
  onDeviceStatus(handler: (payload: DeviceStatusPayload) => void): () => void {
    return this.subscribe<DeviceStatusPayload>('device:status', handler);
  }

  /** Listen for edge online/offline events: `edge:status`. */
  onEdgeStatus(handler: (payload: EdgeStatusPayload) => void): () => void {
    return this.subscribe<EdgeStatusPayload>('edge:status', handler);
  }
}

const wsClient = new WebSocketClient();
export default wsClient;
