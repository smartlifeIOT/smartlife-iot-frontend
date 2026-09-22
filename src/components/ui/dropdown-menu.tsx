import * as React from 'react';
import { cn } from '@/lib/util';

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

interface DropdownMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const DropdownMenu = ({ open: controlledOpen, onOpenChange, defaultOpen = false, children }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
    <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    
    if (!context) {
      throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
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
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  align?: 'start' | 'end' | 'center';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, align = 'start', side = 'bottom', children, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    
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
          'z-50 min-w-[8rem] absolute overflow-hidden rounded-md   bg-white p-1 text-gray-950 shadow-md animate-in fade-in-0 zoom-in-95',
          alignClasses[align],
          sideClasses[side],
          className
        )}
        style={{ marginTop: side === 'bottom' ? sideOffset : undefined, marginBottom: side === 'top' ? sideOffset : undefined }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  disabled?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, disabled, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer hover:cursor-pointer hover:bg-gray-100 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900',
          disabled && 'pointer-events-none opacity-50',
          inset && 'pl-8',
          className
        )}
        onClick={disabled ? undefined : () => context?.onOpenChange(false)}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
};