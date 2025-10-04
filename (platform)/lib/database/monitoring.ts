import 'server-only';

import { prisma, getConnectionPoolStatus } from './prisma';

/**
 * Database Monitoring & Health Check Utilities
 *
 * Provides tools for monitoring database health, performance, and usage:
 * - Connection health checks
 * - Query performance tracking
 * - Connection pool monitoring
 * - Database metrics collection
 *
 * @example
 * ```typescript
 * import { getDatabaseHealth } from '@/lib/database/monitoring';
 *
 * const health = await getDatabaseHealth();
 * if (!health.healthy) {
 *   console.error('Database unhealthy:', health.issues);
 * }
 * ```
 */

/**
 * Database health check result
 */
export interface DatabaseHealth {
  healthy: boolean;
  checks: {
    connection: boolean;
    latency: number;
    poolAvailable: boolean;
  };
  issues: string[];
  timestamp: Date;
}

/**
 * Database metrics for monitoring
 */
export interface DatabaseMetrics {
  connections: {
    total: number | string;
    active: number | string;
    idle: number | string;
  };
  queries: {
    slow: number;
    failed: number;
  };
  performance: {
    avgLatency: number;
    p95Latency: number;
  };
  timestamp: Date;
}

/**
 * Perform comprehensive database health check
 *
 * Checks:
 * - Database connectivity
 * - Query latency
 * - Connection pool availability
 *
 * @returns Health check result
 *
 * @example
 * ```typescript
 * // In API health check endpoint
 * export async function GET() {
 *   const health = await getDatabaseHealth();
 *   return Response.json(health, {
 *     status: health.healthy ? 200 : 503
 *   });
 * }
 * ```
 */
export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();
  const issues: string[] = [];

  let connectionHealthy = false;
  let latency = 0;
  let poolAvailable = true;

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    connectionHealthy = true;
    latency = Date.now() - startTime;

    // Warn if latency is high
    if (latency > 1000) {
      issues.push(`High database latency: ${latency}ms`);
    }
  } catch (error) {
    issues.push(`Database connection failed: ${error}`);
  }

  // Check connection pool status
  const poolStatus = getConnectionPoolStatus();
  if (poolStatus.available === 0 || poolStatus.available === 'unknown') {
    poolAvailable = false;
    issues.push('Connection pool exhausted');
  }

  return {
    healthy: connectionHealthy && poolAvailable && latency < 2000,
    checks: {
      connection: connectionHealthy,
      latency,
      poolAvailable,
    },
    issues,
    timestamp: new Date(),
  };
}

/**
 * Get current database metrics
 *
 * @returns Database metrics snapshot
 *
 * @example
 * ```typescript
 * const metrics = await getDatabaseMetrics();
 * console.log('Active connections:', metrics.connections.active);
 * ```
 */
export async function getDatabaseMetrics(): Promise<DatabaseMetrics> {
  const poolStatus = getConnectionPoolStatus();

  // In production, you'd track these metrics over time
  // For now, return current snapshot
  return {
    connections: {
      total: poolStatus.size,
      active: poolStatus.borrowed,
      idle: poolStatus.available,
    },
    queries: {
      slow: 0, // TODO: Track slow queries count
      failed: 0, // TODO: Track failed queries count
    },
    performance: {
      avgLatency: 0, // TODO: Calculate from query logs
      p95Latency: 0, // TODO: Calculate from query logs
    },
    timestamp: new Date(),
  };
}

/**
 * Check if database is reachable
 *
 * Simple ping test for database connectivity
 *
 * @returns true if database is reachable
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Database Ping] Failed:', error);
    return false;
  }
}

/**
 * Measure database query latency
 *
 * @returns Latency in milliseconds
 *
 * @example
 * ```typescript
 * const latency = await measureDatabaseLatency();
 * console.log(`Database latency: ${latency}ms`);
 * ```
 */
export async function measureDatabaseLatency(): Promise<number> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Date.now() - startTime;
  } catch (error) {
    console.error('[Database Latency] Failed:', error);
    return -1;
  }
}

/**
 * Get database table sizes
 *
 * Useful for monitoring storage usage and planning scaling
 *
 * @returns Array of tables with their sizes
 *
 * @example
 * ```typescript
 * const sizes = await getTableSizes();
 * sizes.forEach(({ table, size }) => {
 *   console.log(`${table}: ${size}`);
 * });
 * ```
 */
export async function getTableSizes(): Promise<
  Array<{ table: string; size: string; rowCount: bigint }>
> {
  try {
    const result = await prisma.$queryRaw<
      Array<{ table_name: string; total_size: string; row_count: bigint }>
    >`
      SELECT
        table_name,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS total_size,
        (SELECT COUNT(*) FROM quote_ident(table_name)) AS row_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
    `;

    return result.map((row) => ({
      table: row.table_name,
      size: row.total_size,
      rowCount: row.row_count,
    }));
  } catch (error) {
    console.error('[Table Sizes] Failed:', error);
    return [];
  }
}

/**
 * Get active database connections count
 *
 * @returns Number of active connections
 */
export async function getActiveConnectionsCount(): Promise<number> {
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
      AND state = 'active';
    `;

    return Number(result[0]?.count || 0);
  } catch (error) {
    console.error('[Active Connections] Failed:', error);
    return -1;
  }
}

/**
 * Get slow queries from pg_stat_statements
 *
 * Requires pg_stat_statements extension to be enabled
 *
 * @param limit - Number of slow queries to return
 * @returns Array of slow queries
 *
 * @example
 * ```typescript
 * const slowQueries = await getSlowQueries(10);
 * slowQueries.forEach(({ query, avg_time, calls }) => {
 *   console.log(`${query}: ${avg_time}ms (${calls} calls)`);
 * });
 * ```
 */
export async function getSlowQueries(limit = 10): Promise<
  Array<{
    query: string;
    calls: bigint;
    total_time: number;
    avg_time: number;
  }>
> {
  try {
    const result = await prisma.$queryRaw<
      Array<{
        query: string;
        calls: bigint;
        total_time: number;
        mean_time: number;
      }>
    >`
      SELECT
        query,
        calls,
        total_exec_time as total_time,
        mean_exec_time as mean_time
      FROM pg_stat_statements
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY mean_exec_time DESC
      LIMIT ${limit};
    `;

    return result.map((row) => ({
      query: row.query,
      calls: row.calls,
      total_time: row.total_time,
      avg_time: row.mean_time,
    }));
  } catch (error) {
    // pg_stat_statements might not be enabled
    console.warn('[Slow Queries] Extension not available:', error);
    return [];
  }
}

/**
 * Get index usage statistics
 *
 * Helps identify unused indexes that can be dropped
 *
 * @returns Array of indexes with usage stats
 *
 * @example
 * ```typescript
 * const indexes = await getIndexUsage();
 * const unused = indexes.filter(idx => idx.scans === 0n);
 * console.log(`Found ${unused.length} unused indexes`);
 * ```
 */
export async function getIndexUsage(): Promise<
  Array<{
    table: string;
    index: string;
    scans: bigint;
    size: string;
  }>
> {
  try {
    const result = await prisma.$queryRaw<
      Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        idx_scan: bigint;
        pg_size_pretty: string;
      }>
    >`
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        pg_size_pretty(pg_relation_size(indexrelid))
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
    `;

    return result.map((row) => ({
      table: row.tablename,
      index: row.indexname,
      scans: row.idx_scan,
      size: row.pg_size_pretty,
    }));
  } catch (error) {
    console.error('[Index Usage] Failed:', error);
    return [];
  }
}

/**
 * Monitor database health continuously
 *
 * Checks health at regular intervals and logs issues
 *
 * @param intervalMs - Check interval in milliseconds
 * @param onUnhealthy - Callback for unhealthy state
 *
 * @example
 * ```typescript
 * // Start monitoring in background
 * monitorDatabaseHealth(30000, (health) => {
 *   console.error('Database unhealthy!', health.issues);
 *   // Send alert to monitoring service
 * });
 * ```
 */
export function monitorDatabaseHealth(
  intervalMs = 30000,
  onUnhealthy?: (health: DatabaseHealth) => void
): NodeJS.Timeout {
  return setInterval(async () => {
    const health = await getDatabaseHealth();

    if (!health.healthy) {
      console.warn('[Database Monitor] Unhealthy:', health);
      onUnhealthy?.(health);
    }
  }, intervalMs);
}

/**
 * Log database metrics to console
 *
 * Useful for debugging and monitoring in development
 *
 * @example
 * ```typescript
 * // In development startup
 * if (process.env.NODE_ENV === 'development') {
 *   setInterval(logDatabaseMetrics, 60000); // Every minute
 * }
 * ```
 */
export async function logDatabaseMetrics(): Promise<void> {
  const metrics = await getDatabaseMetrics();
  const health = await getDatabaseHealth();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Database Metrics');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔌 Connections:');
  console.log(`  Total: ${metrics.connections.total}`);
  console.log(`  Active: ${metrics.connections.active}`);
  console.log(`  Idle: ${metrics.connections.idle}`);
  console.log('🏥 Health:');
  console.log(`  Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`  Latency: ${health.checks.latency}ms`);
  console.log(`  Pool Available: ${health.checks.poolAvailable ? '✅' : '❌'}`);
  if (health.issues.length > 0) {
    console.log('⚠️  Issues:', health.issues);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
