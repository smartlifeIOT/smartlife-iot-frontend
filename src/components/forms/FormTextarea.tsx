import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface FormTextareaProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  rows?: number;
  disabled?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  form,
  name,
  label,
  placeholder,
  description,
  rows = 4,
  disabled,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: {field: any}) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};