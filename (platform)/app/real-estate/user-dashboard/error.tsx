'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

/**
 * Dashboard Error Boundary
 *
 * Catches and displays errors that occur during dashboard rendering
 * Provides recovery options for users
 *
 * @client - Required for error boundaries
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We encountered an error while loading your dashboard. This has been
            logged and we&apos;ll look into it.
          </p>

          {error.message && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {error.message}
              </p>
            </div>
          )}

          {error.digest && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Error ID: {error.digest}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
