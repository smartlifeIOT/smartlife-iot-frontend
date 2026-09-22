// Brand Colors
export const BRAND_COLORS = {
  primary: '#44489D', // Blue
  secondary: '#C36BA9', // Purple
  accent: '#10B981', // Green
  danger: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#06B6D4', // Cyan
  success: '#22C55E', // Green
} as const;

export const COLORSCHART = ['#C36BA9', '#E5E7EB', '#1FB3E1'];

// Status Colors
export const STATUS_COLORS = {
  online: '#22C55E',
  offline: '#EF4444',
  idle: '#F59E0B',
  error: '#DC2626',
  maintenance: '#3B82F6',
  active: '#10B981',
  inactive: '#6B7280',
  pending: '#F59E0B',
} as const;

// Device Type Colors
export const DEVICE_TYPE_COLORS = {
  sensor: '#3B82F6',
  gateway: '#8B5CF6',
  controller: '#F59E0B',
  actuator: '#10B981',
} as const;

// Alarm Severity Colors
export const ALARM_SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  MAJOR: '#EF4444',
  MINOR: '#F59E0B',
  WARNING: '#FBBF24',
  INDETERMINATE: '#6B7280',
} as const;

// Chart Colors
export const CHART_COLORS = [
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
];

// Background Colors
export const BACKGROUND_COLORS = {
  primary: '#FFFFFF',
  secondary: '#F9FAFB',
  tertiary: '#F3F4F6',
  dark: '#1F2937',
  darker: '#111827',
} as const;

// Text Colors
export const TEXT_COLORS = {
  primary: '#111827',
  secondary: '#6B7280',
  tertiary: '#9CA3AF',
  inverse: '#FFFFFF',
  link: '#3B82F6',
} as const;

// Border Colors
export const BORDER_COLORS = {
  light: '#E5E7EB',
  medium: '#D1D5DB',
  dark: '#9CA3AF',
} as const;

// Gradient Colors
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  danger: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
} as const;

// Theme Colors
export const THEME_COLORS = {
  light: {
    background: '#FFFFFF',
    foreground: '#111827',
    card: '#F9FAFB',
    border: '#E5E7EB',
  },
  dark: {
    background: '#111827',
    foreground: '#F9FAFB',
    card: '#1F2937',
    border: '#374151',
  },
} as const;

// Export all
export const COLORS = {
  brand: BRAND_COLORS,
  status: STATUS_COLORS,
  deviceType: DEVICE_TYPE_COLORS,
  alarmSeverity: ALARM_SEVERITY_COLORS,
  chart: CHART_COLORS,
  background: BACKGROUND_COLORS,
  text: TEXT_COLORS,
  border: BORDER_COLORS,
  gradients: GRADIENTS,
  theme: THEME_COLORS,
} as const;

export default COLORS;
