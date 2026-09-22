import * as React from 'react';
import { cn } from '@/lib/util';

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(
  undefined
);

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Popover = ({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, handleOpenChange]);

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const context = React.useContext(PopoverContext);

    if (!context) {
      throw new Error('PopoverTrigger must be used within Popover');
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: () => context.onOpenChange(!context.open),
        ...props,
      } as any);
    }

    return (
      <button
        ref={ref}
        onClick={() => context.onOpenChange(!context.open)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = 'PopoverTrigger';

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      align = 'center',
      sideOffset = 4,
      side = 'bottom',
      children,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(PopoverContext);

    if (!context || !context.open) return null;

    const alignClasses = {
      start: 'left-0',
      end: 'right-0',
      center: 'left-1/2 -translate-x-1/2',
    };

    const sideClasses = {
      top: 'bottom-full mb-1',
      right: 'left-full ml-1',
      bottom: 'top-full mt-1',
      left: 'right-full mr-1',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'z-50 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95',
          alignClasses[align],
          sideClasses[side],
          className
        )}
        style={{
          marginTop: side === 'bottom' ? sideOffset : undefined,
          marginBottom: side === 'top' ? sideOffset : undefined,
          marginLeft: side === 'right' ? sideOffset : undefined,
          marginRight: side === 'left' ? sideOffset : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
