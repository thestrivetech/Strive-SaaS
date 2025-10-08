'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Content Module Error Boundary
 *
 * Handles errors in the content management section
 * Provides user-friendly error messages and recovery options
 */
export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('[Content Module Error]:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Content Error</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {error.message || 'An error occurred while loading content'}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <Button onClick={reset} className="flex-1">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/real-estate/cms-marketing/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
