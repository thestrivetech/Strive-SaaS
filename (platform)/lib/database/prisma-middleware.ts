import 'server-only';

import { Prisma } from '@prisma/client';

/**
 * Multi-tenant tables that require organization_id filtering
 *
 * CRITICAL: These tables MUST have organizationId filtering to prevent data leaks
 * RLS is enabled on these tables as a backup, but Prisma bypasses RLS with service role
 */
const MULTI_TENANT_TABLES = [
  'activity_logs',
  'ai_conversations',
  'appointments',
  'attachments',
  'content',
  'conversations',
  'customers',
  'notifications',
  'organization_members',
  'projects',
  'subscriptions',
  'usage_tracking',
  // Transaction Management tables
  'transaction_audit_logs',
  'transaction_loops',
  'documents',
  'loop_parties',
  'transaction_tasks',
  'signature_requests',
  'document_signatures',
  // CRM tables
  'leads',
  'contacts',
  'deals',
  'listings',
  'activities',
] as const;

/**
 * User-level tables that require user_id filtering
 */
const USER_SCOPED_TABLES = [
  'ai_conversations',
  'notifications',
] as const;

type MultiTenantTable = typeof MULTI_TENANT_TABLES[number];
type UserScopedTable = typeof USER_SCOPED_TABLES[number];

interface TenantContext {
  organizationId?: string;
  userId?: string;
}

let currentTenantContext: TenantContext = {};

/**
 * Set the tenant context for all subsequent Prisma queries
 *
 * MUST be called at the start of every request/server action
 * to ensure proper multi-tenant isolation
 *
 * @example
 * ```typescript
 * import { setTenantContext } from '@/lib/prisma-middleware';
 *
 * export async function getCustomers() {
 *   const user = await getCurrentUser();
 *   setTenantContext({
 *     organizationId: user.organizationMembers[0].organizationId,
 *     userId: user.id
 *   });
 *
 *   // This will automatically filter by organizationId
 *   return await prisma.customers.findMany();
 * }
 * ```
 */
export function setTenantContext(context: TenantContext): void {
  currentTenantContext = { ...context };
}

/**
 * Get the current tenant context
 */
export function getTenantContext(): TenantContext {
  return { ...currentTenantContext };
}

/**
 * Clear the tenant context
 *
 * Useful for testing or when switching contexts
 */
export function clearTenantContext(): void {
  currentTenantContext = {};
}

/**
 * Check if a model name is a multi-tenant table
 */
function isMultiTenantTable(model: string): model is MultiTenantTable {
  return MULTI_TENANT_TABLES.includes(model as MultiTenantTable);
}

/**
 * Check if a model name requires user-level scoping
 */
function isUserScopedTable(model: string): model is UserScopedTable {
  return USER_SCOPED_TABLES.includes(model as UserScopedTable);
}

/**
 * Tenant Isolation Extension for Prisma Client
 *
 * Automatically injects organizationId and/or userId filters into Prisma queries
 * to prevent accidental cross-tenant or cross-user data access
 *
 * WARNING: This is a critical security feature. Do NOT disable.
 *
 * Features:
 * - Auto-filters findMany, findFirst, findUnique, count, aggregate
 * - Auto-filters update, updateMany, delete, deleteMany
 * - Blocks operations on tenant tables without context
 * - Logs attempts to access data for audit trail
 *
 * Uses Prisma 6 client extensions (replaces deprecated middleware)
 */
export const tenantIsolationExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'tenantIsolation',
    query: {
      $allModels: {
        async $allOperations({ args, query, model, operation }): Promise<any> {
          // Skip if no model
          if (!model) {
            return (query as any)(args);
          }

          const isMultiTenant = isMultiTenantTable(model);
          const isUserScoped = isUserScopedTable(model);

          // Skip non-tenant tables
          if (!isMultiTenant && !isUserScoped) {
            return query(args as any);
          }

          const context = getTenantContext();

          // Operations that need filtering
          const readOperations = ['findUnique', 'findFirst', 'findMany', 'count', 'aggregate'];
          const writeOperations = ['update', 'updateMany', 'delete', 'deleteMany'];
          const createOperations = ['create', 'createMany', 'upsert'];

          // For multi-tenant tables, require organizationId
          if (isMultiTenant && !context.organizationId) {
            const message = `[Tenant Isolation] Blocked ${operation} on ${model}: No tenant context set`;
            console.error(message);
            throw new Error('Tenant context required for this operation');
          }

          // For user-scoped tables, require userId
          if (isUserScoped && !context.userId && readOperations.includes(operation)) {
            const message = `[Tenant Isolation] Blocked ${operation} on ${model}: No user context set`;
            console.error(message);
            throw new Error('User context required for this operation');
          }

          // Type guard for args with 'where' property
          const hasWhere = (args: any): args is { where?: any } => {
            return readOperations.includes(operation) || writeOperations.includes(operation);
          };

          // Type guard for args with 'data' property
          const hasData = (args: any): args is { data?: any } => {
            return operation === 'create' || operation === 'createMany';
          };

          // Type guard for upsert args
          const hasCreate = (args: any): args is { create?: any } => {
            return operation === 'upsert';
          };

          // Inject filters for read operations
          if (readOperations.includes(operation) && hasWhere(args)) {
            const where = (args.where as any) || {};

            if (isMultiTenant && context.organizationId) {
              // Add organization_id filter
              (args as any).where = {
                ...where,
                organization_id: context.organizationId,
              };
            }

            if (isUserScoped && context.userId) {
              // Add user_id filter for user-scoped tables
              (args as any).where = {
                ...(args as any).where,
                user_id: context.userId,
              };
            }

            if (process.env.NODE_ENV === 'development') {
              console.log(`[Tenant Isolation] ${operation} on ${model} - filtered by org:${context.organizationId}`);
            }
          }

          // Inject organizationId for create operations
          if (createOperations.includes(operation) && isMultiTenant && context.organizationId) {
            if (operation === 'create' && hasData(args)) {
              (args as any).data = {
                ...(args.data as any),
                organization_id: context.organizationId,
              };
            } else if (operation === 'createMany' && hasData(args)) {
              if (Array.isArray(args.data)) {
                (args as any).data = (args.data as any[]).map((item: any) => ({
                  ...item,
                  organization_id: context.organizationId,
                }));
              }
            } else if (operation === 'upsert' && hasCreate(args)) {
              (args as any).create = {
                ...(args.create as any),
                organization_id: context.organizationId,
              };
            }

            if (process.env.NODE_ENV === 'development') {
              console.log(`[Tenant Isolation] ${operation} on ${model} - injected org_id:${context.organizationId}`);
            }
          }

          // Inject filters for write operations
          if (writeOperations.includes(operation) && hasWhere(args)) {
            const where = (args.where as any) || {};

            if (isMultiTenant && context.organizationId) {
              (args as any).where = {
                ...where,
                organization_id: context.organizationId,
              };
            }

            if (isUserScoped && context.userId) {
              (args as any).where = {
                ...(args as any).where,
                user_id: context.userId,
              };
            }

            if (process.env.NODE_ENV === 'development') {
              console.log(`[Tenant Isolation] ${operation} on ${model} - filtered by org:${context.organizationId}`);
            }
          }

          return query(args as any);
        },
      },
    },
  })
);

/**
 * Apply tenant isolation to a Prisma client
 *
 * @param client - Base Prisma client
 * @returns Prisma client with tenant isolation extension
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { applyTenantIsolation } from '@/lib/prisma-middleware';
 *
 * const basePrisma = new PrismaClient();
 * export const prisma = applyTenantIsolation(basePrisma);
 * ```
 */
export function applyTenantIsolation(client: any) {
  return client.$extends(tenantIsolationExtension);
}
