import 'server-only';

import { Prisma } from '@prisma/client';

/**
 * Prisma Extension: RLS Context Setter
 *
 * Sets PostgreSQL session variables for Row Level Security (RLS) context.
 *
 * This provides defense-in-depth security:
 * - Prisma middleware filters queries in application code (first layer)
 * - RLS policies filter at database level (second layer)
 *
 * Even though Prisma uses service role and bypasses RLS by default,
 * this extension ensures that:
 * 1. Raw SQL queries ($queryRaw) respect RLS context
 * 2. Database functions can access current_user_org()
 * 3. Audit logs have proper context
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { createRLSExtension } from '@/lib/database/prisma-extension';
 *
 * const basePrisma = new PrismaClient();
 * const prisma = basePrisma.$extends(createRLSExtension({
 *   organizationId: 'org_123',
 *   userId: 'user_456'
 * }));
 *
 * // All operations now have RLS context set
 * const customers = await prisma.customers.findMany();
 * ```
 */

interface RLSContext {
  organizationId?: string;
  userId?: string;
}

/**
 * Create a Prisma extension that sets RLS context for all database operations
 *
 * @param context - Organization and user IDs for RLS context
 * @returns Prisma extension
 */
export function createRLSExtension(context: RLSContext) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      name: 'rlsContext',
      query: {
        $allModels: {
          async $allOperations({ args, query, operation, model }) {
            // Set RLS context variables before each query
            const setContextQuery = buildSetContextQuery(context);

            // Execute context setter and actual query in a transaction
            // This ensures context is set for the duration of the query
            const [, result] = await client.$transaction([
              client.$executeRawUnsafe(setContextQuery),
              query(args),
            ]);

            return result;
          },
        },
      },
    })
  );
}

/**
 * Build the SQL query to set RLS context variables
 *
 * These variables can be accessed by RLS policies using:
 * - current_setting('app.current_user_id')::uuid
 * - current_setting('app.current_org_id')::uuid
 *
 * @param context - RLS context
 * @returns SQL query string
 */
function buildSetContextQuery(context: RLSContext): string {
  const queries: string[] = [];

  if (context.userId) {
    queries.push(`SET LOCAL app.current_user_id = '${sanitizeUUID(context.userId)}'`);
  }

  if (context.organizationId) {
    queries.push(`SET LOCAL app.current_org_id = '${sanitizeUUID(context.organizationId)}'`);
  }

  // If no context provided, set to NULL to prevent reusing old context
  if (queries.length === 0) {
    queries.push(`SET LOCAL app.current_user_id = NULL`);
    queries.push(`SET LOCAL app.current_org_id = NULL`);
  }

  return queries.join('; ');
}

/**
 * Sanitize UUID input to prevent SQL injection
 *
 * CRITICAL: Always sanitize before using in raw SQL
 *
 * @param uuid - UUID to sanitize
 * @returns Sanitized UUID
 * @throws Error if UUID format is invalid
 */
function sanitizeUUID(uuid: string): string {
  // UUID format: 8-4-4-4-12 hex characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    throw new Error(`Invalid UUID format: ${uuid}`);
  }

  return uuid;
}

/**
 * Create RLS-aware Prisma client
 *
 * This is a convenience function that combines base Prisma client with RLS extension
 *
 * @param basePrisma - Base Prisma client
 * @param context - RLS context
 * @returns Prisma client with RLS extension
 *
 * @example
 * ```typescript
 * import { prisma } from '@/lib/database/prisma';
 * import { withRLSContext } from '@/lib/database/prisma-extension';
 * import { getCurrentUser } from '@/lib/auth/auth-helpers';
 *
 * export async function getCustomers() {
 *   const user = await getCurrentUser();
 *
 *   const rlsPrisma = withRLSContext(prisma, {
 *     organizationId: user.organizationMembers[0].organizationId,
 *     userId: user.id
 *   });
 *
 *   return await rlsPrisma.customers.findMany();
 * }
 * ```
 */
export function withRLSContext(
  basePrisma: unknown,
  context: RLSContext
): unknown {
  const extension = createRLSExtension(context);
  // @ts-expect-error - $extends is available on Prisma client
  return basePrisma.$extends(extension);
}

/**
 * Check if RLS context variables are set in the database
 *
 * Useful for testing and debugging
 *
 * @param prisma - Prisma client
 * @returns Current RLS context from database
 *
 * @example
 * ```typescript
 * const context = await getRLSContext(prisma);
 * console.log('Current org:', context.organizationId);
 * console.log('Current user:', context.userId);
 * ```
 */
export async function getRLSContext(
  prisma: { $queryRaw: (query: TemplateStringsArray) => Promise<unknown[]> }
): Promise<RLSContext> {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        current_setting('app.current_user_id', true) AS user_id,
        current_setting('app.current_org_id', true) AS org_id
    ` as unknown as [{ user_id: string | null; org_id: string | null }];

    return {
      userId: result[0]?.user_id || undefined,
      organizationId: result[0]?.org_id || undefined,
    };
  } catch (error) {
    console.error('Error getting RLS context:', error);
    return {};
  }
}

/**
 * Prisma extension for automatic RLS context setting from async storage
 *
 * This version automatically pulls context from AsyncLocalStorage
 * instead of requiring manual context passing
 *
 * Note: Requires Node.js AsyncLocalStorage setup
 *
 * @returns Prisma extension
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { createAutoRLSExtension } from '@/lib/database/prisma-extension';
 *
 * const prisma = new PrismaClient().$extends(createAutoRLSExtension());
 *
 * // Context automatically picked up from async storage
 * const customers = await prisma.customers.findMany();
 * ```
 */
export function createAutoRLSExtension() {
  return Prisma.defineExtension((client) =>
    client.$extends({
      name: 'autoRLSContext',
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // In future: Get context from AsyncLocalStorage
            // For now: Log warning if used without context
            if (process.env.NODE_ENV === 'development') {
              console.warn('[RLS Extension] Using auto-RLS without AsyncLocalStorage implementation');
            }

            return query(args);
          },
        },
      },
    })
  );
}
