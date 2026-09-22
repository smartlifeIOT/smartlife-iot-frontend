import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ws } from '@/lib/websocket';
import { telemetryApi, TelemetryData } from '@/services/api';
import type { TelemetryUpdatePayload } from '@/services/websocket/wsClient';

interface LiveTelemetryResult {
  data: TelemetryData | undefined;
  isLive: boolean;
  isConnecting: boolean;
  isLoading: boolean;
  connectionState: 'connected' | 'connecting' | 'polling' | 'offline';
}

/**
 * Subscribes to real-time telemetry for a device over WebSocket.
 *
 * - Connects the shared WS client (lazy, once per deviceId).
 * - Emits `subscribe-telemetry` to tell the server which device to push.
 * - Listens on `telemetry:update` for live pushes from the server.
 * - Emits `get-device-telemetry` immediately after subscribing to get the
 *   latest snapshot without waiting for the next natural push interval.
 * - Falls back to REST polling every `pollIntervalMs` when WS is unavailable
 *   so widgets always show fresh data.
 */
export function useLiveTelemetry(
  deviceId: string | null | undefined,
  pollIntervalMs: number = 5000
): LiveTelemetryResult {
  const validDeviceId =
    deviceId && !deviceId.includes('device-uuid') ? deviceId : null;

  const [liveData, setLiveData] = useState<TelemetryData | undefined>(
    undefined
  );
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const deviceIdRef = useRef<string | null>(null);
  const liveDataRef = useRef<TelemetryData | undefined>(undefined);

  deviceIdRef.current = validDeviceId;

  // Normalise the `telemetry:update` payload into a TelemetryData shape.
  const handleTelemetryUpdate = useCallback(
    (payload: TelemetryUpdatePayload) => {
      console.log('[WS] telemetry:update', payload);
      if (!payload?.deviceId) return;

      // Only apply the push if it matches the device this hook is watching.
      if (
        deviceIdRef.current &&
        payload.deviceId !== deviceIdRef.current
      )
        return;

      const telemetry: TelemetryData = {
        deviceId: payload.deviceId,
        deviceKey: '',
        data: payload.data ?? {},
        timestamp: payload.timestamp ?? new Date().toISOString(),
        // Flat convenience fields from the data bag (if the server puts them there)
        temperature:
          (payload.data?.temperature as number | null) ?? null,
        humidity: (payload.data?.humidity as number | null) ?? null,
        pressure: (payload.data?.pressure as number | null) ?? null,
        latitude: (payload.data?.latitude as number | null) ?? null,
        longitude: (payload.data?.longitude as number | null) ?? null,
        batteryLevel: (payload.data?.batteryLevel as number | null) ?? null,
        signalStrength:
          (payload.data?.signalStrength as number | null) ?? null,
        metadata: (payload.data?.metadata as Record<string, unknown>) ?? {},
      } as TelemetryData;

      liveDataRef.current = telemetry;
      setLiveData(telemetry);
      setIsLive(true);
    },
    []
  );

  // --- Connect the shared WS client and subscribe ---
  useEffect(() => {
    if (!validDeviceId) {
      setIsLive(false);
      return;
    }

    let unsubscribeTelemetry: (() => void) | null = null;
    let unsubscribeDisconnect: (() => void) | null = null;
    let cancelled = false;

    const connectAndSubscribe = async () => {
      if (!cancelled) setIsConnecting(true);

      try {
        await ws.connect();
        if (cancelled) return;

        setWsConnected(true);
        setIsConnecting(false);

        // Listen for the socket dropping so we fall back to polling.
        unsubscribeDisconnect = ws.subscribe('disconnect', () => {
          if (!cancelled) {
            setWsConnected(false);
            setIsLive(false);
            setIsConnecting(false);
          }
        });

        // Subscribe to `telemetry:update` server pushes.
        unsubscribeTelemetry = ws.onTelemetryUpdate(handleTelemetryUpdate);

        // Tell the server which device we want pushed.
        ws.subscribeToTelemetry(validDeviceId);

        // Request an immediate snapshot so we don't wait for the first push.
        ws.getDeviceTelemetry(validDeviceId);
      } catch {
        // WS unavailable → polling fallback continues below.
        if (!cancelled) {
          setWsConnected(false);
          setIsConnecting(false);
        }
      }
    };

    connectAndSubscribe();

    return () => {
      cancelled = true;
      if (unsubscribeTelemetry) unsubscribeTelemetry();
      if (unsubscribeDisconnect) unsubscribeDisconnect();
      // Tell the server we no longer need pushes for this device.
      if (validDeviceId && ws.isConnected()) {
        ws.unsubscribeFromTelemetry(validDeviceId);
      }
      setWsConnected(false);
      setIsLive(false);
    };
  }, [validDeviceId, handleTelemetryUpdate]);

  // --- Fallback REST polling (active when WS isn't pushing live data) ---
  const { data: pollData, isLoading: isPolling } = useQuery({
    queryKey: ['widget-telemetry-live', validDeviceId],
    queryFn: () =>
      validDeviceId
        ? telemetryApi.getLatest(validDeviceId)
        : Promise.resolve(null),
    enabled: !!validDeviceId && !isLive,
    refetchInterval: isLive ? false : pollIntervalMs,
  });

  // When a fresh poll response arrives and we aren't receiving live push,
  // update the local data (still flagged as polling).
  useEffect(() => {
    // getLatest returns AxiosResponse<ApiResponse<TelemetryData>>, so the
    // telemetry object lives at pollData.data.data.
    const pd = pollData?.data?.data as TelemetryData | undefined;
    if (pd && !isLive && typeof pd === 'object') {
      liveDataRef.current = pd;
      setLiveData(pd);
    }
  }, [pollData, isLive]);

  const connectionState: LiveTelemetryResult['connectionState'] = isLive
    ? 'connected'
    : isConnecting
      ? 'connecting'
      : wsConnected
        ? 'connected'
        : isPolling
          ? 'polling'
          : 'offline';

  return {
    data: liveData,
    isLive,
    isConnecting,
    isLoading: isConnecting || isPolling,
    connectionState,
  };
}
