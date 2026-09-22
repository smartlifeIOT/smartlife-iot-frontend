import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/util';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  className,
  maxTags,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (maxTags && value.length >= maxTags) {
        return;
      }
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 min-h-[40px] w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white focus-within:border-secondary',
        className
      )}
    >
      {value.map((tag, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-md"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-red-600 focus:outline-none transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled || (maxTags ? value.length >= maxTags : false)}
        className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto bg-transparent"
      />
    </div>
  );
};

