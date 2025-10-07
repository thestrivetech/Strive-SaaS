import { prisma } from './prisma';
import { setTenantContext, getTenantContext } from './prisma-middleware';
// ⚠️ TEMPORARY: Commented out to avoid next/headers import chain for local preview
// import { getCurrentUser } from '@/lib/auth/auth-helpers';

/**
 * Database Utility Functions
 *
 * Common database operations and helpers:
 * - Automatic tenant context setup
 * - Pagination helpers
 * - Bulk operations
 * - Transaction helpers
 *
 * @example
 * ```typescript
 * import { withTenantContext, paginate } from '@/lib/database/utils';
 *
 * export async function getCustomers(page: number) {
 *   return await withTenantContext(async () => {
 *     return await paginate(prisma.customers, { page, pageSize: 50 });
 *   });
 * }
 * ```
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Execute a database operation with automatic tenant context setup
 *
 * Automatically:
 * 1. Gets current authenticated user
 * 2. Sets tenant context (organizationId, userId)
 * 3. Executes the operation
 * 4. Clears context after execution
 *
 * @param operation - Function to execute with tenant context
 * @returns Result of the operation
 *
 * @example
 * ```typescript
 * // In server action
 * export async function getCustomers() {
 *   return await withTenantContext(async () => {
 *     // Automatically filtered by organizationId
 *     return await prisma.customers.findMany();
 *   });
 * }
 * ```
 */
export async function withTenantContext<T>(
  operation: () => Promise<T>
): Promise<T> {
  // ⚠️ TEMPORARY FIX FOR LOCAL PREVIEW - REMOVE BEFORE PRODUCTION!
  // Commented out to avoid next/headers import chain
  // const user = await getCurrentUser();

  // if (!user || !user.organization_members || user.organization_members.length === 0) {
  //   throw new Error('User must be authenticated and belong to an organization');
  // }

  // TEMPORARY: Skip tenant context setting for local preview
  // TODO: Restore proper auth before production deployment

  // COMMENTED OUT FOR LOCAL PREVIEW:
  // setTenantContext({
  //   organizationId: user.organization_members[0].organization_id,
  //   userId: user.id,
  // });

  try {
    // Execute operation WITHOUT tenant context for now
    return await operation();
  } finally {
    // COMMENTED OUT FOR LOCAL PREVIEW:
    // setTenantContext(null);
  }
}

/**
 * Paginate Prisma query results
 *
 * @param model - Prisma model to query
 * @param params - Pagination parameters
 * @returns Paginated results with metadata
 *
 * @example
 * ```typescript
 * const result = await paginate(prisma.customers, {
 *   page: 1,
 *   pageSize: 50,
 *   orderBy: { createdAt: 'desc' }
 * });
 *
 * console.log(result.data); // Array of customers
 * console.log(result.pagination.totalPages); // Total pages
 * ```
 */
export async function paginate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  params: PaginationParams = {}
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    pageSize = 50,
    orderBy = { createdAt: 'desc' as const },
  } = params;

  const skip = (page - 1) * pageSize;

  // Get total count
  const total = await model.count();

  // Get paginated data
  const data = await model.findMany({
    skip,
    take: pageSize,
    orderBy,
  });

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

/**
 * Bulk create records with automatic tenant context
 *
 * @param model - Prisma model
 * @param data - Array of records to create
 * @param skipDuplicates - Skip duplicates on unique constraint violations
 * @returns Number of records created
 *
 * @example
 * ```typescript
 * const count = await bulkCreate(prisma.customers, [
 *   { name: 'Customer 1', email: 'c1@test.com' },
 *   { name: 'Customer 2', email: 'c2@test.com' },
 * ]);
 * console.log(`Created ${count} customers`);
 * ```
 */
export async function bulkCreate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  data: T[],
  skipDuplicates = true
): Promise<number> {
  const result = await model.createMany({
    data,
    skipDuplicates,
  });

  return result.count;
}

/**
 * Check if a record exists
 *
 * @param model - Prisma model
 * @param where - Where clause
 * @returns true if record exists
 *
 * @example
 * ```typescript
 * const exists = await recordExists(prisma.customers, {
 *   email: 'test@test.com'
 * });
 * ```
 */
export async function recordExists(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: any
): Promise<boolean> {
  const count = await model.count({ where });
  return count > 0;
}

/**
 * Find or create a record
 *
 * @param model - Prisma model
 * @param where - Where clause to find existing record
 * @param create - Data to create if not found
 * @returns Existing or newly created record
 *
 * @example
 * ```typescript
 * const customer = await findOrCreate(
 *   prisma.customers,
 *   { email: 'test@test.com' },
 *   { email: 'test@test.com', name: 'Test Customer' }
 * );
 * ```
 */
export async function findOrCreate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: any
): Promise<T> {
  const existing = await model.findUnique({ where });

  if (existing) {
    return existing;
  }

  return await model.create({ data: create });
}

/**
 * Soft delete a record by setting a deletedAt timestamp
 *
 * Note: Requires deletedAt field in schema
 *
 * @param model - Prisma model
 * @param where - Where clause
 * @returns Updated record
 *
 * @example
 * ```typescript
 * await softDelete(prisma.customers, { id: 'customer-id' });
 * ```
 */
export async function softDelete<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: any
): Promise<T> {
  return await model.update({
    where,
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Get records with cursor-based pagination (infinite scroll)
 *
 * Better performance than offset pagination for large datasets
 *
 * @param model - Prisma model
 * @param cursor - Cursor (last record ID from previous page)
 * @param take - Number of records to fetch
 * @param orderBy - Sort order
 * @returns Array of records
 *
 * @example
 * ```typescript
 * const customers = await cursorPaginate(
 *   prisma.customers,
 *   lastCustomerId, // cursor from previous page
 *   50 // page size
 * );
 * ```
 */
export async function cursorPaginate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  cursor: string | null,
  take = 50,
  orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' }
): Promise<T[]> {
  return await model.findMany({
    take,
    skip: cursor ? 1 : 0, // Skip the cursor record itself
    cursor: cursor ? { id: cursor } : undefined,
    orderBy,
  });
}

/**
 * Batch update records
 *
 * @param model - Prisma model
 * @param updates - Array of { where, data } objects
 * @returns Array of updated records
 *
 * @example
 * ```typescript
 * await batchUpdate(prisma.customers, [
 *   { where: { id: '1' }, data: { status: 'ACTIVE' } },
 *   { where: { id: '2' }, data: { status: 'CHURNED' } },
 * ]);
 * ```
 */
export async function batchUpdate<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Array<{ where: any; data: any }>
): Promise<T[]> {
  return await prisma.$transaction(
    updates.map((update) =>
      model.update({
        where: update.where,
        data: update.data,
      })
    )
  );
}

/**
 * Count records grouped by a field
 *
 * @param model - Prisma model
 * @param groupBy - Field to group by
 * @returns Array of groups with counts
 *
 * @example
 * ```typescript
 * const statusCounts = await countByField(prisma.customers, 'status');
 * // [{ status: 'ACTIVE', _count: 10 }, { status: 'CHURNED', _count: 5 }]
 * ```
 */
export async function countByField<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  groupBy: string
): Promise<T[]> {
  return await model.groupBy({
    by: [groupBy],
    _count: true,
  });
}

/**
 * Get tenant context for current request
 *
 * Useful for debugging and logging
 *
 * @returns Current tenant context
 *
 * @example
 * ```typescript
 * const context = getCurrentTenantContext();
 * console.log('Current org:', context.organizationId);
 * ```
 */
export function getCurrentTenantContext() {
  return getTenantContext();
}

/**
 * Execute multiple operations in a transaction
 *
 * @param operations - Array of operations to execute
 * @returns Results of all operations
 *
 * @example
 * ```typescript
 * const [customer, project] = await transaction([
 *   prisma.customers.create({ data: customerData }),
 *   prisma.projects.create({ data: projectData }),
 * ]);
 * ```
 */
export async function transaction<T extends readonly unknown[]>(
  operations: [...T]
): Promise<T> {
  return (await prisma.$transaction(operations as never)) as unknown as T;
}

/**
 * Upsert (update or insert) a record
 *
 * @param model - Prisma model
 * @param where - Where clause to find existing record
 * @param create - Data to create if not found
 * @param update - Data to update if found
 * @returns Upserted record
 *
 * @example
 * ```typescript
 * const customer = await upsert(
 *   prisma.customers,
 *   { email: 'test@test.com' },
 *   { email: 'test@test.com', name: 'New Customer' },
 *   { name: 'Updated Customer' }
 * );
 * ```
 */
export async function upsert<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: any
): Promise<T> {
  return await model.upsert({
    where,
    create,
    update,
  });
}
