/**
 * Rate limiting for authentication and API endpoints
 * Uses Upstash Redis for distributed rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client (will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? Redis.fromEnv()
  : null;

/**
 * Rate limiter for authentication endpoints
 * Allows 10 requests per 10 seconds per IP/identifier
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

/**
 * Rate limiter for API endpoints
 * Allows 100 requests per minute per IP/identifier
 */
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null;

/**
 * Rate limiter for strict endpoints (e.g., email sending)
 * Allows 5 requests per hour per IP/identifier
 */
export const strictRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '3600 s'),
      analytics: true,
      prefix: 'ratelimit:strict',
    })
  : null;

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP, user ID, email, etc.)
 * @param limiter - Rate limiter instance
 * @returns Object with success status and remaining requests
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  // If no Redis configured (development), allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: new Date(Date.now() + 10000),
    };
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    return {
      success,
      limit,
      remaining,
      reset: new Date(reset),
    };
  } catch (error) {
    // If rate limit check fails, allow request but log error
    console.error('Rate limit check failed:', error);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    };
  }
}

/**
 * Get client identifier from request
 * Uses IP address as primary identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}
