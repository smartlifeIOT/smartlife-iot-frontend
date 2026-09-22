import * as React from 'react';
import { cn } from '@/lib/util';
import { useThemeStore } from '@/stores/useThemeStore';

const CardComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { effectiveTheme } = useThemeStore();

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border shadow-sm hover:shadow-md transition-all',
        // Light mode
        effectiveTheme === 'light' &&
          'border-slate-200 bg-white text-slate-950',
        // Dark mode
        effectiveTheme === 'dark' &&
          'border-slate-800 bg-slate-950 text-slate-50',
        // Fallback for Tailwind dark: classes
        'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
        className
      )}
      {...props}
    />
  );
});
CardComponent.displayName = 'Card';

const Card = CardComponent;

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 px-6 py-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitleComponent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { effectiveTheme } = useThemeStore();

  return (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-semibold leading-none tracking-tight',
        // Light mode
        effectiveTheme === 'light' && 'text-slate-900',
        // Dark mode
        effectiveTheme === 'dark' && 'text-slate-100',
        // Fallback for Tailwind dark: classes
        'dark:text-slate-100',
        className
      )}
      {...props}
    />
  );
});
CardTitleComponent.displayName = 'CardTitle';

const CardTitle = CardTitleComponent;

const CardDescriptionComponent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { effectiveTheme } = useThemeStore();

  return (
    <p
      ref={ref}
      className={cn(
        'text-sm',
        // Light mode
        effectiveTheme === 'light' && 'text-slate-500',
        // Dark mode
        effectiveTheme === 'dark' && 'text-slate-400',
        // Fallback for Tailwind dark: classes
        'dark:text-slate-400',
        className
      )}
      {...props}
    />
  );
});
CardDescriptionComponent.displayName = 'CardDescription';

const CardDescription = CardDescriptionComponent;

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
