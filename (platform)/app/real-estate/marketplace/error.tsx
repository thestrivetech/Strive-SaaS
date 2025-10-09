'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Marketplace Error Boundary
 *
 * Catches errors in marketplace module and provides recovery options
 */
export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('[Marketplace Error]', error);

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, LogRocket, etc.
      // logErrorToService(error);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-2xl w-full border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <CardTitle>Something went wrong in the marketplace</CardTitle>
              <CardDescription>
                We encountered an error while loading marketplace data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error details (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Production error message */}
          {process.env.NODE_ENV === 'production' && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred while loading the marketplace. Our team has been
                notified and is working on a fix.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Recovery actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex items-center gap-2 flex-1">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/real-estate/user-dashboard')}
              className="flex items-center gap-2 flex-1"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          {/* Help text */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              If this problem persists, please{' '}
              <a href="/settings/support" className="text-primary hover:underline">
                contact support
              </a>
              {error.digest && ` and reference error ID: ${error.digest}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
