/**
 * Pagination Types for Transaction Module
 *
 * Provides consistent pagination across documents, tasks, signatures, and other large datasets.
 */

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  page?: number;      // 1-indexed page number (default: 1)
  limit?: number;     // Items per page (default: 50, max: 100)
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Calculate pagination skip/take values
 *
 * Enforces limits:
 * - Page must be >= 1
 * - Limit must be between 1 and 100
 *
 * @param params - Pagination parameters
 * @returns Normalized page, limit, and skip values
 */
export function calculatePagination(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 50));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create paginated result object
 *
 * @param data - Array of results
 * @param total - Total count of items (from count query)
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated result with metadata
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const pageCount = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pageCount,
      hasNextPage: page < pageCount,
      hasPreviousPage: page > 1,
    },
  };
}
