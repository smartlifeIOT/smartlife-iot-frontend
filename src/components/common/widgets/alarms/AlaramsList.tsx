import { AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { Widget } from '../../WidgetCanvas/WidgetCanvas';
import toast from 'react-hot-toast';
import { alarmsApi } from '@/services/api';
import {
  DataSourceBadge,
  EmptyDeviceState,
} from '../../WidgetCanvas/WidgetRenderer';

export default function AlaramsList({
  widget,
  activeAlarmsList,
  acknowledgedAlarms,
  setAcknowledgedAlarms,
  isValidDevice,
  resolvedDeviceName,
}: {
  widget: Widget;
  activeAlarmsList: any[];
  acknowledgedAlarms: any[];
  setAcknowledgedAlarms: any;
  isValidDevice: boolean;
  resolvedDeviceName: string;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
          <ShieldAlert className="w-4 h-4" /> {widget.title || 'System Alarms'}
        </span>
        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
          {Math.max(0, activeAlarmsList.length - acknowledgedAlarms.length)}{' '}
          Active
        </span>
      </div>

      {!isValidDevice ? (
        <EmptyDeviceState widget={widget} icon={ShieldAlert} />
      ) : (
        <div className="space-y-2 text-[11px] overflow-auto my-auto py-1">
          {activeAlarmsList.map((alarm) => {
            const isAck = acknowledgedAlarms.includes(alarm.id);
            if (isAck) return null;
            return (
              <div
                key={alarm.id}
                className={`flex items-center justify-between p-2 rounded-lg border shadow shadow-[rgba(0,0,0,0.2)] ${
                  alarm.level === 'critical' || alarm.level === 'major'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${
                      alarm.level === 'critical' || alarm.level === 'major'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 leading-none truncate">
                      {alarm.title}
                    </p>
                    <span className="text-[9px] text-slate-400 font-mono block truncate">
                      {alarm.target}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setAcknowledgedAlarms((prev: string[]) => [
                      ...prev,
                      alarm.id,
                    ]);
                    try {
                      await alarmsApi.acknowledge(alarm.id);
                    } catch {
                      // ignore if fallback mock ID
                    }
                    toast.success(`Acknowledged alarm: ${alarm.title}`);
                  }}
                  className="px-2 py-0.5 text-[9px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 shrink-0 ml-2"
                >
                  Ack
                </button>
              </div>
            );
          })}
          {acknowledgedAlarms.length >= activeAlarmsList.length && (
            <div className="text-center py-4 text-emerald-500 text-xs font-semibold flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> All alarms acknowledged
            </div>
          )}
        </div>
      )}
      <DataSourceBadge widget={widget} deviceName={resolvedDeviceName} />
    </div>
  );
}
