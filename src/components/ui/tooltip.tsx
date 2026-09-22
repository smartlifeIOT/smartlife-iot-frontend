import * as React from 'react';
import { cn } from '@/lib/util';

interface TooltipContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

const TooltipProvider = ({ children, }: TooltipProviderProps) => {
  return <>{children}</>;
};

interface TooltipProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
  delayDuration?: number;
}

const Tooltip = ({ open: controlledOpen, onOpenChange, defaultOpen = false, children, }: TooltipProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </TooltipContext.Provider>
  );
};

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, asChild, className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const context = React.useContext(TooltipContext);
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    if (!context) {
      throw new Error('TooltipTrigger must be used within Tooltip');
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      timeoutRef.current = setTimeout(() => {
        context.onOpenChange(true);
      }, 200);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      context.onOpenChange(false);
      onMouseLeave?.(e);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ...props,
      } as any);
    }

    return (
      <div
        ref={ref}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, side = 'top', align = 'center', children, ...props }, ref) => {
    const context = React.useContext(TooltipContext);

    if (!context || !context.open) return null;

    const sideClasses = {
      top: 'bottom-full mb-1',
      right: 'left-full ml-1',
      bottom: 'top-full mt-1',
      left: 'right-full mr-1',
    };

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'z-50 overflow-hidden rounded-md  absolute   bg-secondary   right-0 shadow-md text-start w-40    px-3 py-1.5 text-sm text-white  shadow-md animate-in fade-in-0 zoom-in-95',
          sideClasses[side],
          alignClasses[align],
          className
        )}
        style={{
          marginTop: side === 'bottom' ? sideOffset : undefined,
          marginBottom: side === 'top' ? sideOffset : undefined,
          marginLeft: side === 'right' ? sideOffset : undefined,
          marginRight: side === 'left' ? sideOffset : undefined,
        }}
        onMouseEnter={() => context.onOpenChange(true)}
        onMouseLeave={() => context.onOpenChange(false)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };