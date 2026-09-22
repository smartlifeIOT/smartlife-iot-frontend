import React from 'react';
import { cn } from '@/lib/util';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

// Full page loading spinner
export const LoadingPage: React.FC<{ text?: string }> = ({
  text = 'Loading...',
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};

// Overlay loading spinner
export const LoadingOverlay: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};
