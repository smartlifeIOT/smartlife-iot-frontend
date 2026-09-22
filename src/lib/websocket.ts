import wsClient, {
  AlarmUpdatePayload,
  DeviceStatusPayload,
  EdgeStatusPayload,
  TelemetryUpdatePayload,
  DashboardCurrentDataPayload,
  DashboardTelemetryUpdatePayload,
} from '@/services/websocket/wsClient';
import { localStorageService } from '@/services/storage/localStorage';
import { toast } from '@/stores/useNotificationStore';

class WebSocketManager {
  private static instance: WebSocketManager;
  private connected = false;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      const token = localStorageService.getToken();
      await wsClient.connect(token || undefined);
      this.connected = true;
      console.log('WebSocket connected');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      toast.error(
        'Connection Error',
        'Failed to establish real-time connection'
      );
      // Re-throw so callers (e.g. useLiveTelemetry) can run their own
      // fallback logic instead of wrongly assuming the socket connected.
      throw error;
    }
  }

  disconnect(): void {
    wsClient.disconnect();
    this.connected = false;
    console.log('WebSocket disconnected');
  }

  isConnected(): boolean {
    return this.connected && wsClient.isConnected();
  }

  // ── Generic low-level helpers ──────────────────────────────────────────────

  subscribe<T = unknown>(
    event: string,
    handler: (data: T) => void
  ): () => void {
    return wsClient.subscribe(event, handler);
  }

  send(event: string, data: unknown): void {
    wsClient.send(event, data);
  }

  // ── Client → Server: typed emit methods ───────────────────────────────────

  /** Emit `subscribe-telemetry` for the given device. */
  subscribeToTelemetry(deviceId: string): void {
    wsClient.subscribeToTelemetry(deviceId);
  }

  /** Emit `unsubscribe-telemetry` for the given device. */
  unsubscribeFromTelemetry(deviceId: string): void {
    wsClient.unsubscribeFromTelemetry(deviceId);
  }

  /** Emit `subscribe-dashboard` for the given dashboard. */
  subscribeToDashboard(dashboardId: string): void {
    wsClient.subscribeToDashboard(dashboardId);
  }

  /** Emit `unsubscribe-dashboard` for the given dashboard. */
  unsubscribeFromDashboard(dashboardId: string): void {
    wsClient.unsubscribeFromDashboard(dashboardId);
  }

  /** Emit `subscribe-alarms` (global, no payload). */
  subscribeToAlarms(): void {
    wsClient.subscribeToAlarms();
  }

  /** Emit `get-device-telemetry` for an immediate one-shot snapshot. */
  getDeviceTelemetry(deviceId: string): void {
    wsClient.getDeviceTelemetry(deviceId);
  }

  // ── Server → Client: typed listener methods ────────────────────────────────

  /** Listen on `telemetry:update`. Returns unsubscribe callback. */
  onTelemetryUpdate(
    handler: (payload: TelemetryUpdatePayload) => void
  ): () => void {
    return wsClient.onTelemetryUpdate(handler);
  }

  /** Listen on `dashboard:current-data`. Returns unsubscribe callback. */
  onDashboardCurrentData(
    handler: (payload: DashboardCurrentDataPayload) => void
  ): () => void {
    return wsClient.onDashboardCurrentData(handler);
  }

  /** Listen on `dashboard:telemetry-update`. Returns unsubscribe callback. */
  onDashboardTelemetryUpdate(
    handler: (payload: DashboardTelemetryUpdatePayload) => void
  ): () => void {
    return wsClient.onDashboardTelemetryUpdate(handler);
  }

  /** Listen on `alarm:update`. Returns unsubscribe callback. */
  onAlarmUpdate(handler: (payload: AlarmUpdatePayload) => void): () => void {
    return wsClient.onAlarmUpdate(handler);
  }

  /** Listen on `device:status`. Returns unsubscribe callback. */
  onDeviceStatus(handler: (payload: DeviceStatusPayload) => void): () => void {
    return wsClient.onDeviceStatus(handler);
  }

  /** Listen on `edge:status`. Returns unsubscribe callback. */
  onEdgeStatus(handler: (payload: EdgeStatusPayload) => void): () => void {
    return wsClient.onEdgeStatus(handler);
  }
}

export const ws = WebSocketManager.getInstance();
export default ws;
