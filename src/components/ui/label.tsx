import * as React from 'react';
import { cn } from '@/lib/util.ts';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-normal text-black leading-relaxed    block',
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

export { Label };
