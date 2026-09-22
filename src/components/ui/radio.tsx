import * as React from 'react';
import { cn } from '@/lib/util';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            type="radio"
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div className="w-5 h-5 border-2 border-[#949CA9] rounded-full peer-checked:bg-secondary peer-checked:border-secondary transition-all flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        {label && (
          <span className="text-sm text-gray-700">{label}</span>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };

