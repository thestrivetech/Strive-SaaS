'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * CMS & Marketing Dashboard Error Boundary
 *
 * Displays error state when dashboard fails to load
 * Provides options to retry or return to main dashboard
 */
export default function CMSMarketingDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CMS & Marketing Dashboard Error]:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-lg border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Failed to Load CMS & Marketing Dashboard</CardTitle>
          <CardDescription className="mt-2">
            {error.message || 'Unable to load dashboard data. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/real-estate/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Real Estate Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
