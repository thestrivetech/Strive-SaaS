import 'server-only';

import { PrismaClient } from '@prisma/client';
import { tenantIsolationExtension } from './prisma-middleware';

/**
 * Prisma Client Singleton with Security & Monitoring
 *
 * Features:
 * - Automatic tenant isolation (prevents cross-org data leaks)
 * - Query logging in development
 * - Slow query detection (>1s in production, >100ms in dev)
 * - Connection pool monitoring
 * - Proper singleton pattern for Next.js hot reload
 *
 * CRITICAL SECURITY:
 * This client includes tenant isolation middleware that automatically
 * filters queries by organizationId. You MUST call setTenantContext()
 * before making queries on multi-tenant tables.
 *
 * @example
 * ```typescript
 * import { prisma } from '@/lib/database/prisma';
 * import { setTenantContext } from '@/lib/database/prisma-middleware';
 *
 * export async function getCustomers() {
 *   const user = await getCurrentUser();
 *
 *   // REQUIRED: Set tenant context
 *   setTenantContext({
 *     organizationId: user.organizationMembers[0].organizationId,
 *     userId: user.id
 *   });
 *
 *   // Automatically filtered by organizationId
 *   return await prisma.customers.findMany();
 * }
 * ```
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create and configure Prisma Client
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
      {
        emit: 'event',
        level: 'info',
      },
    ],
  });

  // Query logging (development only)
  if (process.env.NODE_ENV === 'development') {
    client.$on('query', (e) => {
      console.log('📊 Query:', e.query);
      console.log('📋 Params:', e.params);
      console.log('⏱️  Duration:', e.duration + 'ms');

      // Warn on slow queries in development (>100ms)
      if (e.duration > 100) {
        console.warn('⚠️  SLOW QUERY DETECTED (>100ms):', e.query);
      }
    });
  }

  // Slow query detection (production)
  if (process.env.NODE_ENV === 'production') {
    client.$on('query', (e) => {
      // Log queries that take longer than 1 second
      if (e.duration > 1000) {
        console.warn('[SLOW QUERY]', {
          duration: e.duration,
          query: e.query,
          params: e.params,
        });
        // TODO: Send to monitoring service (DataDog, Sentry, etc.)
      }
    });
  }

  // Error logging
  client.$on('error', (e) => {
    console.error('❌ Prisma Error:', e);
    // TODO: Send to error tracking service
  });

  // Warn logging
  client.$on('warn', (e) => {
    console.warn('⚠️  Prisma Warning:', e);
  });

  // Info logging (development only)
  if (process.env.NODE_ENV === 'development') {
    client.$on('info', (e) => {
      console.info('ℹ️  Prisma Info:', e);
    });
  }

  // Apply tenant isolation extension
  // CRITICAL: This prevents cross-tenant data leaks
  // Uses Prisma 6 client extensions (replaces deprecated middleware)
  const prismaWithExtensions = client.$extends(tenantIsolationExtension);

  return prismaWithExtensions;
}

/**
 * Prisma Client instance
 *
 * In development: Reuses same instance to prevent connection exhaustion
 * In production: New instance per serverless invocation
 */
export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnect Prisma Client gracefully
 *
 * Call this during application shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Check Prisma connection health
 *
 * @returns true if connected, false otherwise
 */
export async function checkPrismaConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Prisma connection check failed:', error);
    return false;
  }
}

/**
 * Get connection pool status
 *
 * Useful for monitoring and debugging
 */
export function getConnectionPoolStatus() {
  // @ts-expect-error - Accessing internal Prisma metrics
  const pool = prisma._engine?.connectionPool;

  return {
    size: pool?.size || 'unknown',
    available: pool?.available || 'unknown',
    borrowed: pool?.borrowed || 'unknown',
    pending: pool?.pending || 'unknown',
  };
}
