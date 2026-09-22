import React from 'react';
import { ErrorBoundary } from './index';
import type { ErrorInfo } from 'react';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

/**
 * Functional wrapper for ErrorBoundary component
 * Makes it easier to use in functional components
 */
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  onError,
  resetKeys,
  resetOnPropsChange,
}) => {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
      resetKeys={resetKeys}
      resetOnPropsChange={resetOnPropsChange}
    >
      {children}
    </ErrorBoundary>
  );
};

