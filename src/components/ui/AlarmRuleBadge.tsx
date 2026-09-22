import {
  ArrowUp,
  ArrowDown,
  Equal,
  AlertTriangle,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { AlarmRule } from '@/services/api/alarms.api';

// ---- Types ----
type Condition = AlarmRule['condition'];

// ---- Helpers ----

// Map condition -> symbol, label, and icon
const CONDITION_MAP: Record<
  Condition,
  { symbol: string; label: string; icon: LucideIcon }
> = {
  GREATER_THAN: { symbol: '>', label: 'greater than', icon: ArrowUp },
  LESS_THAN: { symbol: '<', label: 'less than', icon: ArrowDown },
  GREATER_THAN_OR_EQUAL: { symbol: '≥', label: 'at least', icon: ArrowUp },
  LESS_THAN_OR_EQUAL: { symbol: '≤', label: 'at most', icon: ArrowDown },
  EQUAL: { symbol: '=', label: 'equal to', icon: Equal },
  NOT_EQUAL: { symbol: '≠', label: 'not equal to', icon: AlertTriangle },
};

// Turn "temperature" -> "Temperature", "batteryLevel" -> "Battery Level"
function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> spaced
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Turn 300 -> "5 min", 90 -> "1 min 30 sec", 3600 -> "1 hr"
function humanizeDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hrs) parts.push(`${hrs} hr`);
  if (mins) parts.push(`${mins} min`);
  if (secs) parts.push(`${secs} sec`);

  return parts.join(' ');
}

// Optional: unit lookup by telemetryKey (extend as needed)
const UNIT_MAP: Record<string, string> = {
  temperature: '°C',
  humidity: '%',
  batteryLevel: '%',
  pressure: 'hPa',
  voltage: 'V',
};

// Pure function: rule -> plain readable sentence (useful for tooltips, logs, alerts list)
export function formatAlarmRule(rule: AlarmRule): string {
  const { symbol } = CONDITION_MAP[rule.condition];
  const unit = UNIT_MAP[rule.telemetryKey] || '';
  return `${humanizeKey(rule.telemetryKey)} ${symbol} ${rule.value}${unit} for ${humanizeDuration(
    rule.duration
  )}`;
}

// ---- React Component ----
interface AlarmRuleBadgeProps {
  rule: AlarmRule;
}

export function AlarmRuleBadge({ rule }: AlarmRuleBadgeProps) {
  const { symbol, icon: ConditionIcon } = CONDITION_MAP[rule.condition];
  const unit = UNIT_MAP[rule.telemetryKey] || '';

  return (
    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
      <div className="w-7 h-7 rounded-md text-red-500 bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
        <ConditionIcon className="w-4 h-4 " />
      </div>

      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-slate-800">
          {humanizeKey(rule.telemetryKey)}{' '}
          <span className="text-red-500 font-bold">{symbol}</span> {rule.value}
          {unit}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <Clock className="w-3 h-3" />
          sustained for {humanizeDuration(rule.duration)}
        </span>
      </div>
    </div>
  );
}
