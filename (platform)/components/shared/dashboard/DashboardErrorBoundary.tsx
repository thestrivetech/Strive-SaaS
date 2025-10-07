'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/**
 * Dashboard Error Boundary
 * Catches React errors in dashboard widgets and displays user-friendly fallback
 * Prevents one widget error from crashing the entire dashboard
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="glass-strong rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center border border-destructive/20">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <h3 className="text-lg font-semibold mb-2">Widget Error</h3>

          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            This widget encountered an error and couldn&apos;t be displayed.
            The rest of your dashboard is working normally.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 text-left w-full max-w-md">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-32">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="glass hover:bg-muted/30"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error fallback for inline errors
 */
export function WidgetErrorFallback({ message }: { message?: string }) {
  return (
    <div className="glass rounded-xl p-4 border border-destructive/20 h-full flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {message || 'Failed to load widget'}
        </p>
      </div>
    </div>
  );
}
