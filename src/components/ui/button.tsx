import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/util';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 cursor-pointer hover:cursor-pointer focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white hover:bg-black/80 active:bg-black/90 cursor-pointer shadow-sm  ',
        primary:
          'bg-[#43489C] text-white     rounded-xl hover:bg-[#43489C]/90 active:bg-[#43489C]/90  shadow-sm ',

        secondary:
          'bg-[#A53887] text-white rounded-xl  hover:bg-[#A53887]/90 active:bg-[#A53887]/90 shadow-sm',
        ghost:
          'bg-[#D5D5D587] text-gray-700 rounded-xl  hover:bg-[#D5D5D587]/90 active:bg-[#D5D5D587]/90 shadow-sm',
        link: 'text-purple-600 underline-offset-4 hover:underline hover:text-purple-700',
        success:
          ' bg-green-600 text-white hover:bg-green-600/90 active:bg-green-600/90 shadow-sm',
        warning:
          'bg-yellow-600 text-white hover:bg-yellow-600/90 active:bg-yellow-600/90 shadow-sm',
        info: 'bg-blue-600 text-white hover:bg-blue-600/90 active:bg-blue-600/90 shadow-sm',
        social:
          'bg-white text-gray-700 cursor-pointer bg-gray-100 active:bg-gray-200 shadow-sm',
        outline:
          'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
        destructive:
          'bg-red-800 text-white hover:bg-red-800/90 active:bg-red-800/90 shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-3xl',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-3xl px-8 text-base',
        xl: 'h-14 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // If asChild, render children directly (simplified version without Radix Slot)
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        disabled: disabled || isLoading,
        ...props,
      } as any);
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }) +
            ' dark:text-white dark:bg-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white'
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
