import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: Error | { message?: string } | null;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  retryText = 'Try Again',
  className = '',
}) => {
  const displayMessage =
    message ||
    error?.message ||
    'An unexpected error occurred. Please try again later.';

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{displayMessage}</p>
            </div>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryText}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

