import { useState, useEffect, useCallback } from 'react';
import { ws } from '@/lib/websocket';
import type { AlarmUpdatePayload } from '@/services/websocket/wsClient';

/**
 * Subscribes to global alarm updates over WebSocket.
 *
 * - Emits `subscribe-alarms` on mount to opt-in to the alarm push channel.
 * - Listens on `alarm:update` for live alarm state changes from the server.
 * - Returns an array of the latest alarm payloads received (newest first).
 *
 * Usage:
 *   const { alarms, isConnected } = useAlarmStream();
 */
export function useAlarmStream() {
  const [alarms, setAlarms] = useState<AlarmUpdatePayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAlarmUpdate = useCallback((payload: AlarmUpdatePayload) => {
    console.log('[WS] alarm:update', payload);
    if (!payload?.id) return;

    setAlarms((prev) => {
      // Replace existing entry for the same alarm id, otherwise prepend.
      const exists = prev.findIndex((a) => a.id === payload.id);
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = payload;
        return updated;
      }
      return [payload, ...prev];
    });
  }, []);

  useEffect(() => {
    let unsubscribeAlarm: (() => void) | null = null;
    let unsubscribeDisconnect: (() => void) | null = null;
    let cancelled = false;

    const connectAndSubscribe = async () => {
      if (!cancelled) setIsConnecting(true);

      try {
        await ws.connect();
        if (cancelled) return;

        setIsConnected(true);
        setIsConnecting(false);

        // Fall back to disconnected state if socket drops.
        unsubscribeDisconnect = ws.subscribe('disconnect', () => {
          if (!cancelled) {
            setIsConnected(false);
            setIsConnecting(false);
          }
        });

        // Listen for alarm pushes.
        unsubscribeAlarm = ws.onAlarmUpdate(handleAlarmUpdate);

        // Tell the server we want alarm pushes.
        ws.subscribeToAlarms();
      } catch {
        if (!cancelled) {
          setIsConnected(false);
          setIsConnecting(false);
        }
      }
    };

    connectAndSubscribe();

    return () => {
      cancelled = true;
      if (unsubscribeAlarm) unsubscribeAlarm();
      if (unsubscribeDisconnect) unsubscribeDisconnect();
    };
  }, [handleAlarmUpdate]);

  return { alarms, isConnected, isConnecting };
}
