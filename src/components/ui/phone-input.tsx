import * as React from 'react';
import PhoneInputWithCountry, {
  type Country,
} from 'react-phone-number-input';
import type { DefaultInputComponentProps } from 'react-phone-number-input';
import { cn } from '@/lib/util';
// Import base styles
import 'react-phone-number-input/style.css';

export interface PhoneInputProps
  extends Omit<
    DefaultInputComponentProps,
    'value' | 'onChange' | 'defaultCountry'
  > {
  error?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  defaultCountry?: Country;
  className?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, error, value, onChange, defaultCountry = 'US', ...props }, ref) => {
    return (
      <div className="w-full">
        <div
          className={cn(
            'flex items-center w-full border-b border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-950',
            error && 'border-red-500',
            className
          )}
        >
          <PhoneInputWithCountry
            ref={ref as never}
            international
            defaultCountry={defaultCountry}
            value={value}
            onChange={onChange}
            className={cn(
              'flex-1 w-full',
              '[&_.PhoneInputInput]:border-0',
              '[&_.PhoneInputInput]:bg-transparent',
              '[&_.PhoneInputInput]:px-3',
              '[&_.PhoneInputInput]:py-2',
              '[&_.PhoneInputInput]:text-sm',
              '[&_.PhoneInputInput]:outline-none',
              '[&_.PhoneInputInput]:focus:outline-none',
              '[&_.PhoneInputInput]:focus-visible:outline-none',
              '[&_.PhoneInputInput]:focus-visible:ring-0',
              '[&_.PhoneInputInput]:h-10',
              '[&_.PhoneInputCountrySelect]:border-0',
              '[&_.PhoneInputCountrySelect]:bg-transparent',
              '[&_.PhoneInputCountrySelect]:pr-2',
              '[&_.PhoneInputCountrySelect]:outline-none',
              '[&_.PhoneInputCountrySelect]:focus:outline-none',
              '[&_.PhoneInputCountryIcon]:border-0',
              '[&_.PhoneInputCountryIcon]:focus:outline-none',
              '[&_.PhoneInputCountryIconImg]:border-0',
              error && '[&_.PhoneInputInput]:text-red-600'
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };

