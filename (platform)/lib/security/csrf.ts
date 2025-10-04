import 'server-only';

import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * This module provides CSRF token generation and validation for API routes.
 *
 * NOTE: Next.js Server Actions have built-in CSRF protection.
 * This is primarily for custom API routes and additional security layers.
 *
 * How it works:
 * 1. Server generates a unique token and stores it in an HTTP-only cookie
 * 2. Client includes token in request headers or form data
 * 3. Server validates token matches cookie before processing request
 */

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_TOKEN_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 *
 * @returns Random token string (64 hex characters)
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Set CSRF token cookie
 *
 * Call this when starting a new session or on first page load.
 * Token is stored in an HTTP-only, secure cookie.
 *
 * @returns The generated token (for embedding in forms)
 *
 * @example
 * ```typescript
 * // In a Server Component or API route
 * import { setCSRFToken } from '@/lib/security/csrf';
 *
 * export async function GET() {
 *   const token = await setCSRFToken();
 *   return Response.json({ csrfToken: token });
 * }
 * ```
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

/**
 * Get CSRF token from cookies
 *
 * @returns Token from cookie, or null if not found
 */
export async function getCSRFTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_COOKIE_NAME)?.value || null;
}

/**
 * Validate CSRF token from request
 *
 * Checks if token in request matches token in cookie.
 *
 * @param request - Incoming request
 * @returns true if token is valid, false otherwise
 *
 * @example
 * ```typescript
 * // In an API route
 * import { validateCSRFToken } from '@/lib/security/csrf';
 *
 * export async function POST(request: Request) {
 *   const isValid = await validateCSRFToken(request);
 *
 *   if (!isValid) {
 *     return new Response('Invalid CSRF token', { status: 403 });
 *   }
 *
 *   // Process request...
 * }
 * ```
 */
export async function validateCSRFToken(request: Request): Promise<boolean> {
  // Get token from cookie
  const cookieToken = await getCSRFTokenFromCookie();

  if (!cookieToken) {
    return false;
  }

  // Get token from request header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER_NAME);

  if (!headerToken) {
    // Also check form data or JSON body
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        const body = await request.clone().json();
        const bodyToken = body.csrfToken || body.csrf_token;

        if (bodyToken) {
          return bodyToken === cookieToken;
        }
      } catch {
        // Failed to parse JSON, continue to return false
      }
    }

    if (contentType?.includes('application/x-www-form-urlencoded') || contentType?.includes('multipart/form-data')) {
      try {
        const formData = await request.clone().formData();
        const formToken = formData.get('csrfToken') || formData.get('csrf_token');

        if (formToken && typeof formToken === 'string') {
          return formToken === cookieToken;
        }
      } catch {
        // Failed to parse form data, continue to return false
      }
    }

    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(headerToken, cookieToken);
}

/**
 * Constant-time string comparison
 *
 * Prevents timing attacks by ensuring comparison always takes same time.
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings match
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Middleware helper for CSRF protection
 *
 * Use this in Next.js middleware to protect API routes.
 *
 * @param request - Incoming request
 * @returns Response if validation fails, null if valid
 *
 * @example
 * ```typescript
 * // In middleware.ts
 * import { csrfMiddleware } from '@/lib/security/csrf';
 *
 * export async function middleware(request: NextRequest) {
 *   // Protect POST/PUT/DELETE/PATCH requests
 *   if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
 *     const csrfError = await csrfMiddleware(request);
 *     if (csrfError) return csrfError;
 *   }
 *
 *   return NextResponse.next();
 * }
 * ```
 */
export async function csrfMiddleware(request: Request): Promise<Response | null> {
  const isValid = await validateCSRFToken(request);

  if (!isValid) {
    return new Response('CSRF token validation failed', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return null;
}
