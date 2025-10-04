import 'server-only';

import { Prisma } from '@prisma/client';

/**
 * Database Error Handling Utilities
 *
 * Provides type-safe error handling for Prisma operations with:
 * - User-friendly error messages
 * - Proper error classification
 * - Retry logic for transient errors
 * - Connection error handling
 *
 * @example
 * ```typescript
 * import { handleDatabaseError, retryOnTransientError } from '@/lib/database/errors';
 *
 * try {
 *   const result = await retryOnTransientError(() =>
 *     prisma.customer.create({ data })
 *   );
 * } catch (error) {
 *   const userError = handleDatabaseError(error);
 *   return { error: userError.message };
 * }
 * ```
 */

/**
 * Database error types for classification
 */
export enum DatabaseErrorType {
  UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  CONNECTION = 'CONNECTION',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Structured database error
 */
export interface DatabaseError {
  type: DatabaseErrorType;
  message: string;
  code?: string;
  meta?: Record<string, unknown>;
  originalError?: unknown;
}

/**
 * Check if error is a Prisma error
 */
export function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Handle Prisma/database errors and convert to user-friendly messages
 *
 * @param error - Error from Prisma operation
 * @returns Structured database error with user-friendly message
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.customer.create({ data: { email: 'test@test.com' } });
 * } catch (error) {
 *   const dbError = handleDatabaseError(error);
 *   console.error(dbError.type, dbError.message);
 * }
 * ```
 */
export function handleDatabaseError(error: unknown): DatabaseError {
  // Prisma known request errors (P2xxx codes)
  if (isPrismaError(error)) {
    return handlePrismaError(error);
  }

  // Prisma client validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      type: DatabaseErrorType.VALIDATION,
      message: 'Invalid data provided. Please check your input and try again.',
      originalError: error,
    };
  }

  // Prisma client initialization errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      type: DatabaseErrorType.CONNECTION,
      message: 'Unable to connect to the database. Please try again later.',
      originalError: error,
    };
  }

  // Prisma client rust panic errors
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      type: DatabaseErrorType.UNKNOWN,
      message: 'An unexpected database error occurred. Please contact support.',
      originalError: error,
    };
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      type: DatabaseErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred.',
      originalError: error,
    };
  }

  // Unknown error type
  return {
    type: DatabaseErrorType.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    originalError: error,
  };
}

/**
 * Handle specific Prisma error codes
 *
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): DatabaseError {
  const code = error.code;
  const meta = error.meta;

  switch (code) {
    // P2002: Unique constraint violation
    case 'P2002': {
      const fields = (meta?.target as string[]) || ['field'];
      const fieldNames = fields.join(', ');
      return {
        type: DatabaseErrorType.UNIQUE_CONSTRAINT,
        message: `A record with this ${fieldNames} already exists.`,
        code,
        meta,
        originalError: error,
      };
    }

    // P2003: Foreign key constraint violation
    case 'P2003': {
      return {
        type: DatabaseErrorType.FOREIGN_KEY_CONSTRAINT,
        message: 'This record is referenced by other records and cannot be deleted.',
        code,
        meta,
        originalError: error,
      };
    }

    // P2025: Record not found
    case 'P2025': {
      return {
        type: DatabaseErrorType.NOT_FOUND,
        message: 'The requested record was not found.',
        code,
        meta,
        originalError: error,
      };
    }

    // P2024: Connection timeout
    case 'P2024': {
      return {
        type: DatabaseErrorType.TIMEOUT,
        message: 'Database operation timed out. Please try again.',
        code,
        meta,
        originalError: error,
      };
    }

    // P1000-P1017: Connection errors
    case 'P1000':
    case 'P1001':
    case 'P1002':
    case 'P1003':
    case 'P1008':
    case 'P1009':
    case 'P1010':
    case 'P1011':
    case 'P1012':
    case 'P1013':
    case 'P1014':
    case 'P1015':
    case 'P1016':
    case 'P1017': {
      return {
        type: DatabaseErrorType.CONNECTION,
        message: 'Unable to connect to the database. Please try again later.',
        code,
        meta,
        originalError: error,
      };
    }

    // P2004: Constraint violation
    case 'P2004': {
      return {
        type: DatabaseErrorType.VALIDATION,
        message: 'The operation violates a database constraint.',
        code,
        meta,
        originalError: error,
      };
    }

    // P2014: Invalid relation
    case 'P2014': {
      return {
        type: DatabaseErrorType.VALIDATION,
        message: 'Invalid relationship between records.',
        code,
        meta,
        originalError: error,
      };
    }

    // Default: Unknown Prisma error
    default: {
      console.error('[Prisma Error]', code, meta);
      return {
        type: DatabaseErrorType.UNKNOWN,
        message: 'A database error occurred. Please try again.',
        code,
        meta,
        originalError: error,
      };
    }
  }
}

/**
 * Retry a database operation on transient errors
 *
 * Automatically retries operations that fail due to:
 * - Connection errors
 * - Timeouts
 * - Deadlocks
 *
 * @param operation - Function that returns a Promise
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Delay between retries in milliseconds (default: 1000)
 * @returns Result of the operation
 *
 * @example
 * ```typescript
 * const customer = await retryOnTransientError(
 *   () => prisma.customer.create({ data }),
 *   3,  // max retries
 *   1000  // 1 second delay
 * );
 * ```
 */
export async function retryOnTransientError<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if error is transient (retryable)
      const isTransient = isTransientError(error);

      if (!isTransient || attempt === maxRetries) {
        // Not retryable or max retries reached
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt - 1);
      console.warn(`[Database] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is transient and can be retried
 */
function isTransientError(error: unknown): boolean {
  if (!isPrismaError(error)) {
    return false;
  }

  const transientCodes = [
    'P1000', // Authentication failed
    'P1001', // Can't reach database server
    'P1002', // Database server timeout
    'P1008', // Operations timed out
    'P2024', // Timed out fetching a new connection from the pool
    'P2034', // Transaction failed due to write conflict
  ];

  return transientCodes.includes(error.code);
}

/**
 * Wrap a Prisma transaction with error handling
 *
 * @param operation - Transaction function
 * @returns Result of transaction
 *
 * @example
 * ```typescript
 * const result = await safeTransaction(async (tx) => {
 *   const customer = await tx.customer.create({ data: customerData });
 *   const project = await tx.project.create({ data: { customerId: customer.id } });
 *   return { customer, project };
 * });
 * ```
 */
export async function safeTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    // Import prisma inside function to avoid circular dependency
    const { prisma } = await import('./prisma');
    return await prisma.$transaction(operation);
  } catch (error) {
    const dbError = handleDatabaseError(error);
    console.error('[Transaction Error]', dbError);
    throw error;
  }
}

/**
 * Assert that a record exists, or throw a not found error
 *
 * @param record - Record to check
 * @param entityName - Name of entity for error message
 * @throws DatabaseError if record is null
 *
 * @example
 * ```typescript
 * const customer = await prisma.customer.findUnique({ where: { id } });
 * assertRecordExists(customer, 'Customer');
 * // TypeScript now knows customer is not null
 * ```
 */
export function assertRecordExists<T>(
  record: T | null,
  entityName = 'Record'
): asserts record is T {
  if (!record) {
    throw new Error(`${entityName} not found`);
  }
}

/**
 * Check if record exists without throwing
 *
 * @param record - Record to check
 * @returns true if record exists, false otherwise
 */
export function recordExists<T>(record: T | null): record is T {
  return record !== null && record !== undefined;
}

/**
 * Format database error for API response
 *
 * @param error - Error from database operation
 * @returns Formatted error object for API response
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.customer.create({ data });
 * } catch (error) {
 *   const apiError = formatErrorForAPI(error);
 *   return Response.json(apiError, { status: apiError.status });
 * }
 * ```
 */
export function formatErrorForAPI(error: unknown): {
  error: string;
  message: string;
  status: number;
  code?: string;
} {
  const dbError = handleDatabaseError(error);

  const statusMap: Record<DatabaseErrorType, number> = {
    [DatabaseErrorType.UNIQUE_CONSTRAINT]: 409,
    [DatabaseErrorType.FOREIGN_KEY_CONSTRAINT]: 409,
    [DatabaseErrorType.NOT_FOUND]: 404,
    [DatabaseErrorType.VALIDATION]: 400,
    [DatabaseErrorType.CONNECTION]: 503,
    [DatabaseErrorType.TIMEOUT]: 504,
    [DatabaseErrorType.UNAUTHORIZED]: 403,
    [DatabaseErrorType.UNKNOWN]: 500,
  };

  return {
    error: dbError.type,
    message: dbError.message,
    status: statusMap[dbError.type] || 500,
    code: dbError.code,
  };
}
