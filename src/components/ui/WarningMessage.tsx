import { useState, ReactNode } from 'react';

export type WarningVariant = 'warning' | 'error' | 'info' | 'success';

export interface WarningMessageProps {
  /** Main message text or content */
  children: ReactNode;
  /** Optional title shown above the message */
  title?: string;
  /** Visual style — defaults to 'warning' */
  variant?: WarningVariant;
  /** Show a close (x) button that dismisses the message */
  dismissible?: boolean;
  /** Called when the message is dismissed */
  onDismiss?: () => void;
  /** Extra classes for layout tweaks from the parent */
  className?: string;
}

const VARIANT_STYLES: Record<
  WarningVariant,
  { container: string; icon: string; title: string }
> = {
  warning: {
    container: 'bg-amber-50 border-amber-300 text-amber-900',
    icon: 'text-amber-500',
    title: 'text-amber-900',
  },
  error: {
    container: 'bg-red-50 border-red-300 text-red-900',
    icon: 'text-red-500',
    title: 'text-red-900',
  },
  info: {
    container: 'bg-blue-50 border-blue-300 text-blue-900',
    icon: 'text-blue-500',
    title: 'text-blue-900',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    icon: 'text-emerald-500',
    title: 'text-emerald-900',
  },
};

function VariantIcon({
  variant,
  className,
}: {
  variant: WarningVariant;
  className: string;
}) {
  if (variant === 'error') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.516 2.63H3.72c-1.347 0-2.189-1.463-1.515-2.63L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (variant === 'info') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2H9Zm.75 0a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 10 9h-.25Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (variant === 'success') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  // warning (default)
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.516 2.63H3.72c-1.347 0-2.189-1.463-1.515-2.63L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function WarningMessage({
  children,
  title,
  variant = 'warning',
  dismissible = false,
  onDismiss,
  className = '',
}: WarningMessageProps) {
  const [dismissed, setDismissed] = useState(false);
  const styles = VARIANT_STYLES[variant];

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${styles.container} ${className}`}
    >
      <VariantIcon
        variant={variant}
        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`}
      />

      <div className="flex-1 text-sm leading-relaxed">
        {title && (
          <p className={`font-medium mb-0.5 ${styles.title}`}>{title}</p>
        )}
        <div>{children}</div>
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss message"
          className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current transition-opacity"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default WarningMessage;
