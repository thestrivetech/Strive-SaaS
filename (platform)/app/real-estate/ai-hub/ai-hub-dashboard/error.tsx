'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

/**
 * AI Hub Dashboard Error Boundary
 *
 * Displays error state when dashboard fails to load
 * Provides retry functionality
 */
export default function AIHubDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('AI Hub Dashboard Error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Loading AI Hub Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred while loading the AI Hub dashboard.'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="default" size="sm">
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/real-estate/user-dashboard'} variant="outline" size="sm">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
