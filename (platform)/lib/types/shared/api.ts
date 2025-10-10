/**
 * Common API response types used across all domains
 * Provides consistent response structure for server actions and API routes
 */

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  statusCode?: number;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Common HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Common cookie options for API routes
 */
export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}

/**
 * Request handler types
 */
export type RouteHandler = (
  request: Request,
  context?: { params: Record<string, string> }
) => Promise<Response>;

/**
 * Query parameters for filtering and sorting
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}
