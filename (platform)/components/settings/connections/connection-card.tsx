'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus } from './connection-status';
import { disconnectConnection, testConnection, syncConnection } from '@/lib/modules/connections';
import { ConnectionCapabilities, type ConnectionProvider } from '@/lib/modules/connections/schemas';
import { toast } from 'sonner';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Music,
  Github,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Unplug,
  Chrome
} from 'lucide-react';

interface ConnectionCardProps {
  provider: ConnectionProvider;
  connection: any | null;
  isConnected: boolean;
}

const providerIcons: Record<ConnectionProvider, React.ReactNode> = {
  GOOGLE: <Chrome className="h-5 w-5" />,
  FACEBOOK: <Facebook className="h-5 w-5" />,
  TWITTER: <Twitter className="h-5 w-5" />,
  INSTAGRAM: <Instagram className="h-5 w-5" />,
  LINKEDIN: <Linkedin className="h-5 w-5" />,
  YOUTUBE: <Youtube className="h-5 w-5" />,
  TIKTOK: <Music className="h-5 w-5" />,
  GITHUB: <Github className="h-5 w-5" />,
  MICROSOFT: <Chrome className="h-5 w-5" />,
};

const providerNames: Record<ConnectionProvider, string> = {
  GOOGLE: 'Google',
  FACEBOOK: 'Facebook',
  TWITTER: 'Twitter (X)',
  INSTAGRAM: 'Instagram',
  LINKEDIN: 'LinkedIn',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  GITHUB: 'GitHub',
  MICROSOFT: 'Microsoft',
};

const providerColors: Record<ConnectionProvider, string> = {
  GOOGLE: 'bg-red-500',
  FACEBOOK: 'bg-blue-600',
  TWITTER: 'bg-sky-500',
  INSTAGRAM: 'bg-pink-600',
  LINKEDIN: 'bg-blue-700',
  YOUTUBE: 'bg-red-600',
  TIKTOK: 'bg-black',
  GITHUB: 'bg-gray-800',
  MICROSOFT: 'bg-blue-500',
};

export function ConnectionCard({ provider, connection, isConnected }: ConnectionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    // Initiate OAuth flow by redirecting to provider-specific OAuth endpoint
    const oauthEndpoints: Record<ConnectionProvider, string> = {
      GOOGLE: '/api/auth/oauth/google',
      FACEBOOK: '/api/auth/oauth/facebook',
      TWITTER: '/api/auth/oauth/twitter',
      INSTAGRAM: '/api/auth/oauth/instagram',
      LINKEDIN: '/api/auth/oauth/linkedin',
      YOUTUBE: '/api/auth/oauth/youtube',
      TIKTOK: '/api/auth/oauth/tiktok',
      GITHUB: '/api/auth/oauth/github',
      MICROSOFT: '/api/auth/oauth/microsoft',
    };

    const endpoint = oauthEndpoints[provider];
    if (endpoint) {
      window.location.href = endpoint;
    } else {
      toast.info(`${providerNames[provider]} OAuth coming soon`);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnectConnection(provider);
      toast.success(`Disconnected from ${providerNames[provider]}`);
    } catch (error) {
      toast.error('Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    try {
      await testConnection(provider);
      toast.success('Connection test successful');
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncConnection(provider);
      toast.success('Connection synced successfully');
    } catch (error) {
      toast.error('Failed to sync connection');
    } finally {
      setIsLoading(false);
    }
  };

  const capabilities = ConnectionCapabilities[provider] || [];

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`${providerColors[provider]} p-2 rounded-lg text-white`}>
              {providerIcons[provider]}
            </div>
            <div>
              <CardTitle className="text-base">{providerNames[provider]}</CardTitle>
              <CardDescription className="text-xs">
                {isConnected ? 'Connected' : 'Not connected'}
              </CardDescription>
            </div>
          </div>
          <ConnectionStatus status={connection?.status || 'DISCONNECTED'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">What this enables:</p>
          <ul className="space-y-1">
            {capabilities.map((capability, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {capability}
              </li>
            ))}
          </ul>
        </div>

        {connection && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Connected: {new Date(connection.created_at).toLocaleDateString()}
            </div>
            {connection.last_synced && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                Last synced: {new Date(connection.last_synced).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTest}
                disabled={isLoading}
                className="flex-1"
              >
                Test
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="flex-1"
              >
                <Unplug className="h-3 w-3 mr-1" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
            >
              Connect {providerNames[provider]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
