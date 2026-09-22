import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  registerItem: (value: string, label: string) => void;
  getItemLabel: (value: string) => string | undefined;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function extractTextFromChildren(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromChildren).join('');
  if (React.isValidElement(node) && (node.props as any)?.children) {
    return extractTextFromChildren((node.props as any).children);
  }
  return '';
}

export function Select({
  value: controlledValue,
  onValueChange,
  defaultValue = '',
  children,
  className = '',
  disabled = false,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [itemLabels, setItemLabels] = useState<Record<string, string>>({});

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  const registerItem = useCallback((itemValue: string, label: string) => {
    if (!label) return;
    setItemLabels((prev) =>
      prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }
    );
  }, []);

  const getItemLabel = useCallback(
    (itemValue: string) => {
      if (!itemValue && itemValue !== '') return undefined;
      if (itemLabels[itemValue]) return itemLabels[itemValue];
      // Case-insensitive lookup
      const matchedKey = Object.keys(itemLabels).find(
        (key) => key.toLowerCase() === itemValue.toLowerCase()
      );
      if (matchedKey && itemLabels[matchedKey]) return itemLabels[matchedKey];
      return undefined;
    },
    [itemLabels]
  );

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        registerItem,
        getItemLabel,
      }}
    >
      <div className={`relative ${className}`}>{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function SelectTrigger({
  children,
  className = '',
  disabled = false,
  id,
}: SelectTriggerProps) {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error('SelectTrigger must be used within Select');
  }

  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-0 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({
  placeholder = 'Select...',
  className = '',
}: SelectValueProps) {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error('SelectValue must be used within Select');
  }

  const label = context.value ? context.getItemLabel(context.value) : undefined;

  return (
    <span className={`dark:text-white ${className}`}>
      {label || placeholder}
    </span>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({
  children,
  className = '',
}: SelectContentProps) {
  const context = useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('SelectContent must be used within Select');
  }

  const { open, setOpen } = context;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:bg-gray-950 dark:border-gray-700 dark:text-white ${className} ${!open ? 'hidden' : ''}`}
    >
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  textValue?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({
  value,
  children,
  textValue,
  className = '',
  disabled = false,
}: SelectItemProps) {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error('SelectItem must be used within Select');
  }

  const isSelected =
    context.value === value ||
    (typeof context.value === 'string' &&
      typeof value === 'string' &&
      context.value.toLowerCase() === value.toLowerCase());

  useEffect(() => {
    const inferred = extractTextFromChildren(children);
    context.registerItem(value, textValue ?? (inferred || value));
  }, [children, context, textValue, value]);

  return (
    <div
      onClick={() => !disabled && context.onValueChange(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-gray-800 dark:text-white focus:bg-slate-100 dark:focus:bg-gray-800 ${
        isSelected ? 'bg-slate-50 dark:bg-gray-800' : ''
      } ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
}
