import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiting middleware for API routes
 *
 * In-memory implementation suitable for development and single-instance deployments.
 * For production multi-instance deployments, consider using Redis or similar distributed cache.
 *
 * @param options - Configuration options
 * @param options.interval - Time window in milliseconds (e.g., 60000 for 1 minute)
 * @param options.maxRequests - Maximum number of requests allowed in the interval
 *
 * @example
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const limitCheck = await rateLimit({ interval: 60000, maxRequests: 10 })(req);
 *   if (limitCheck) return limitCheck;
 *
 *   // Process request...
 * }
 * ```
 */
export function rateLimit(options: {
  interval: number; // milliseconds
  maxRequests: number;
}) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const key = `${ip}:${req.nextUrl.pathname}`;

    // Clean up old entries (to prevent memory leaks)
    if (store[key] && store[key].resetAt < now) {
      delete store[key];
    }

    // Initialize or increment counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetAt: now + options.interval,
      };
    } else {
      store[key].count++;
    }

    // Check if limit exceeded
    if (store[key].count > options.maxRequests) {
      const retryAfter = Math.ceil((store[key].resetAt - now) / 1000);

      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: `${retryAfter} seconds`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': options.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(store[key].resetAt).toISOString(),
          },
        }
      );
    }

    // Calculate remaining requests
    const remaining = options.maxRequests - store[key].count;

    // Add rate limit headers to response (will need to be applied to successful responses)
    // This is informational only and doesn't block the request
    return null; // Allow request to proceed
  };
}

/**
 * Clean up expired entries (call periodically to prevent memory leaks)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(ip: string, pathname: string): {
  count: number;
  resetAt: number;
  remaining: number;
} | null {
  const key = `${ip}:${pathname}`;
  const entry = store[key];

  if (!entry) {
    return null;
  }

  return {
    count: entry.count,
    resetAt: entry.resetAt,
    remaining: Math.max(0, entry.count),
  };
}

/**
 * Reset rate limit for a specific key (useful for testing)
 */
export function resetRateLimit(ip: string, pathname: string): void {
  const key = `${ip}:${pathname}`;
  delete store[key];
}
