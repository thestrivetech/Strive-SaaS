'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function SignatureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Signature page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-md py-12 text-center space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
      <h2 className="text-2xl font-bold">Failed to load signature</h2>
      <p className="text-muted-foreground">
        {error.message || 'The signature request could not be loaded'}
      </p>
      <div className="flex gap-2 justify-center">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/real-estate/workspace'}>
          Back to workspace
        </Button>
      </div>
    </div>
  );
}
