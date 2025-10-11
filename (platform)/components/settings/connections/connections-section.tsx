'use client';

import { ConnectionCard } from './connection-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ConnectionsSectionProps {
  providers: Array<{
    provider: any;
    connection: any | null;
    isConnected: boolean;
  }>;
}

export function ConnectionsSection({ providers }: ConnectionsSectionProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>About Connections</AlertTitle>
        <AlertDescription>
          Connect your accounts to unlock powerful AI features. Your data is encrypted and secure.
          You can disconnect at any time.
        </AlertDescription>
      </Alert>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Connections</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map(({ provider, connection, isConnected }) => (
            <ConnectionCard
              key={provider}
              provider={provider}
              connection={connection}
              isConnected={isConnected}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
