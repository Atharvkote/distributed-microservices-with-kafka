import React from 'react';
import { AlertTriangle, WifiOff, ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorType = 'generic' | 'network' | 'server' | 'notFound';

interface ErrorStateProps {
  /** Title shown in the error state */
  title?: string;
  /** Descriptive message shown below the title */
  message?: string;
  /** Retry callback — if provided, a retry button is shown */
  onRetry?: () => void;
  /** Loading state for the retry button */
  retryLoading?: boolean;
  /** Visual variant affecting the icon shown */
  variant?: ErrorType;
  className?: string;
}

const iconMap: Record<ErrorType, React.ElementType> = {
  generic: AlertTriangle,
  network: WifiOff,
  server: ServerCrash,
  notFound: AlertTriangle,
};

const defaultMessages: Record<ErrorType, { title: string; message: string }> = {
  generic: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
  network: {
    title: 'No internet connection',
    message: 'Check your network connection and try again.',
  },
  server: {
    title: 'Server error',
    message: 'The server encountered an error. Our team is working on it.',
  },
  notFound: {
    title: 'Not found',
    message: 'The resource you are looking for does not exist.',
  },
};

/**
 * ErrorState — displayed whenever an API call fails or data cannot be loaded.
 *
 * Usage:
 *   <ErrorState onRetry={refetch} />
 *   <ErrorState variant="network" />
 *   <ErrorState title="Custom" message="Custom message" onRetry={fn} />
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLoading = false,
  variant = 'generic',
  className,
}) => {
  const Icon = iconMap[variant];
  const defaults = defaultMessages[variant];
  const displayTitle = title ?? defaults.title;
  const displayMessage = message ?? defaults.message;

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
        className
      )}
    >
      {/* Icon container */}
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <Icon className="h-8 w-8 text-destructive" />
      </div>

      {/* Text */}
      <div className="space-y-1 max-w-sm">
        <h3 className="font-semibold text-sm text-foreground">{displayTitle}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{displayMessage}</p>
      </div>

      {/* Retry */}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          loading={retryLoading}
          className="gap-2 mt-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
};

export default React.memo(ErrorState);
