'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import type { ConnectionProvider } from './schemas';

/**
 * Get all connections for the current user
 */
export async function getUserConnections() {
  const session = await requireAuth();

  const connections = await prisma.user_connections.findMany({
    where: {
      user_id: session.user.id,
      is_active: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return connections;
}

/**
 * Get a specific connection by provider
 */
export async function getConnectionByProvider(provider: ConnectionProvider) {
  const session = await requireAuth();

  const connection = await prisma.user_connections.findUnique({
    where: {
      user_id_provider: {
        user_id: session.user.id,
        provider: provider,
      },
    },
  });

  return connection;
}

/**
 * Check if a connection exists and is active
 */
export async function isProviderConnected(provider: ConnectionProvider): Promise<boolean> {
  const session = await requireAuth();

  const connection = await prisma.user_connections.findFirst({
    where: {
      user_id: session.user.id,
      provider: provider,
      is_active: true,
      status: 'CONNECTED',
    },
  });

  return !!connection;
}

/**
 * Get connection stats for current user
 */
export async function getConnectionStats() {
  const session = await requireAuth();

  const connections = await prisma.user_connections.findMany({
    where: {
      user_id: session.user.id,
      is_active: true,
    },
  });

  const stats = {
    total: connections.length,
    connected: connections.filter((c) => c.status === 'CONNECTED').length,
    disconnected: connections.filter((c) => c.status === 'DISCONNECTED').length,
    error: connections.filter((c) => c.status === 'ERROR').length,
    expired: connections.filter((c) => c.status === 'EXPIRED').length,
  };

  return stats;
}

/**
 * Get connections that need token refresh
 */
export async function getExpiredConnections() {
  const session = await requireAuth();

  const now = new Date();

  const connections = await prisma.user_connections.findMany({
    where: {
      user_id: session.user.id,
      is_active: true,
      expires_at: {
        lt: now,
      },
      status: 'CONNECTED',
    },
  });

  return connections;
}

/**
 * Get all available providers and their connection status
 */
export async function getProvidersWithStatus() {
  const session = await requireAuth();

  const providers = [
    'GOOGLE',
    'FACEBOOK',
    'TWITTER',
    'INSTAGRAM',
    'LINKEDIN',
    'YOUTUBE',
    'TIKTOK',
    'GITHUB',
    'MICROSOFT',
  ] as ConnectionProvider[];

  const connections = await prisma.user_connections.findMany({
    where: {
      user_id: session.user.id,
      is_active: true,
    },
  });

  const connectionMap = new Map(
    connections.map((c) => [c.provider, c])
  );

  return providers.map((provider) => ({
    provider,
    connection: connectionMap.get(provider) || null,
    isConnected: connectionMap.has(provider) && connectionMap.get(provider)?.status === 'CONNECTED',
  }));
}
