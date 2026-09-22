import toast from 'react-hot-toast';
import { ToggleRight, Loader2, Power } from 'lucide-react';
import {
  EmptyDeviceState,
  LiveStatusBadge,
  DataSourceBadge,
} from '../../WidgetCanvas/WidgetRenderer';
import { Widget } from '../../WidgetCanvas';
import { devicesApi } from '@/services/api';

export default function ToggleSwitch({
  toggleState,
  setToggleState,
  widget,
  primaryDeviceId,
  isValidDevice,
  isLiveTelemetry,
  isConnectingTelemetry,
  isPollingFallback,
  resolvedDeviceName,
  switchKey,
  setIsSendingCommand,
  isSendingCommand,
}: {
  toggleState: boolean;
  setToggleState: (value: boolean) => void;
  primaryColor: string;
  widget: Widget;
  primaryDeviceId: string;
  isValidDevice: boolean;
  isLiveTelemetry: boolean;
  isConnectingTelemetry: boolean;
  isPollingFallback: boolean;
  classification: string;
  resolvedDeviceName: string;
  switchKey: string;
  setIsSendingCommand: (value: boolean) => void;
  isSendingCommand: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3   dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 rounded-lg overflow-hidden">
      {/* Ambient glow when switch is ON */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          toggleState && isValidDevice ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top bar */}
      <div className="relative z-10    ">
        <LiveStatusBadge
          isLive={isLiveTelemetry}
          isConnecting={isConnectingTelemetry}
          isPolling={isPollingFallback}
        />
      </div>

      {!isValidDevice ? (
        <div className="relative z-10">
          <EmptyDeviceState widget={widget} icon={ToggleRight} />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-3.5 py-3">
          <button
            type="button"
            disabled={isSendingCommand}
            aria-pressed={toggleState}
            onClick={async () => {
              if (!primaryDeviceId) return;
              const nextState = !toggleState;
              setToggleState(nextState); // optimistic update
              setIsSendingCommand(true);
              try {
                await devicesApi.sendCommand(primaryDeviceId, 'control', {
                  [switchKey]: nextState,
                });
                toast.success(
                  `${switchKey} turned ${nextState ? 'ON' : 'OFF'}`
                );
              } catch (err: any) {
                // Revert optimistic update on failure
                setToggleState(!nextState);
                toast.error(
                  err?.response?.data?.message || 'Failed to send command'
                );
              } finally {
                setIsSendingCommand(false);
              }
            }}
            className={`group relative flex flex-col items-center gap-3 outline-none cursor-pointer select-none disabled:cursor-wait rounded-2xl focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900 ${
              isSendingCommand ? 'opacity-80' : ''
            }`}
          >
            {/* Animated state badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-300 border ${
                toggleState
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shadow shadow-[rgba(0,0,0,0.5)]'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  toggleState ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isSendingCommand ? 'Sending…' : toggleState ? 'On' : 'Off'}
            </span>

            {/* Switch track */}
            <div
              className={`relative flex items-center w-24 h-12  shadow shadow-[rgba(0,0,0,0.5)] rounded-full p-1.5 transition-all duration-300 ease-out ${
                toggleState
                  ? 'bg-emerald-500 '
                  : 'bg-slate-300 dark:bg-slate-700 '
              } ${isSendingCommand ? 'opacity-60' : ''}`}
            >
              {/* ON label */}
              <span
                className={`absolute left-3 text-[9px] font-black text-white/90 tracking-wide transition-opacity duration-200 ${
                  toggleState ? 'opacity-100' : 'opacity-0'
                }`}
              >
                ON
              </span>
              {/* OFF label */}
              <span
                className={`absolute right-3 text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-wide transition-opacity duration-200 ${
                  toggleState ? 'opacity-0' : 'opacity-100'
                }`}
              >
                OFF
              </span>

              {/* Sliding knob */}
              <div
                className={`relative z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform duration-300 ease-out ${
                  toggleState ? 'translate-x-12' : 'translate-x-0'
                }`}
              >
                {isSendingCommand ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                ) : (
                  <Power
                    className={`w-5 h-5 transition-colors duration-300 ${
                      toggleState ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Hint */}
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {isSendingCommand ? 'Sending command…' : 'Tap to toggle'}
            </span>
          </button>
        </div>
      )}
      <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
    </div>
  );
}
