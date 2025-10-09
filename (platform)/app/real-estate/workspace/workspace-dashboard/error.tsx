'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Workspace Dashboard Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Dashboard Error</CardTitle>
          </div>
          <CardDescription>
            Something went wrong while loading the workspace dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/real-estate/user-dashboard">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Return to Industry Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Possible causes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Database connection issue</li>
              <li>Missing or invalid permissions</li>
              <li>Organization context not set</li>
              <li>Server configuration error</li>
            </ul>
            <p className="mt-3">
              If this issue persists, please contact support with the error ID above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
