import * as React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div
            className={`w-5 h-5 border-2 border-[#949CA9] rounded peer-checked:bg-secondary peer-checked:border-secondary transition-all flex items-center justify-center ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
          </div>
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
