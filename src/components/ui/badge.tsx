import React from 'react';
import { cn } from '@/lib/util';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'error'
  | 'critical';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:text-white';

  const variants = {
    default: 'bg-secondary text-white hover:bg-secondary/80',
    secondary: 'bg-red-100 text-red-600 hover:bg-slate-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: 'bg-blue-600 text-white hover:bg-blue-700',
    error: 'bg-red-600 text-white hover:bg-red-700',
    critical: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
