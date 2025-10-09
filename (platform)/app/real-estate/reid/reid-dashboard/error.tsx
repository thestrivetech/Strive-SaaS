'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REIDCard, REIDCardHeader, REIDCardContent } from '@/components/real-estate/reid/shared/REIDCard';

export default function REIDDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('REID Dashboard Error:', error);
  }, [error]);

  return (
    <div className="reid-theme min-h-screen p-6 flex items-center justify-center">
      <REIDCard className="max-w-2xl">
        <REIDCardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Dashboard Error</h3>
          </div>
        </REIDCardHeader>
        <REIDCardContent>
          <div className="space-y-4 text-center">
            <p className="text-slate-300">
              An error occurred while loading the REID Dashboard.
            </p>
            <p className="text-sm text-slate-400">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-500">Error ID: {error.digest}</p>
            )}
            <div className="flex gap-4 justify-center mt-6">
              <Button
                onClick={reset}
                variant="default"
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/real-estate/user-dashboard'}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </REIDCardContent>
      </REIDCard>
    </div>
  );
}
