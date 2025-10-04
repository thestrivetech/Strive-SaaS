import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleCORS } from './lib/middleware/cors';
import { detectHostType } from './lib/middleware/routing';
import { handlePlatformAuth } from './lib/middleware/auth';
import { checkRateLimit, getClientIdentifier, authRateLimit, apiRateLimit } from './lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Handle CORS for analytics endpoints
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  // Get client identifier for rate limiting
  const identifier = getClientIdentifier(request);

  // Apply rate limiting to authentication routes
  if (request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) {
    const { success, limit, remaining, reset } = await checkRateLimit(identifier, authRateLimit);

    if (!success) {
      return new NextResponse('Too many requests. Please try again later.', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toISOString(),
          'Retry-After': Math.ceil((reset.getTime() - Date.now()) / 1000).toString(),
        },
      });
    }
  }

  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const { success, limit, remaining, reset } = await checkRateLimit(identifier, apiRateLimit);

    if (!success) {
      return new NextResponse('API rate limit exceeded. Please try again later.', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toISOString(),
          'Retry-After': Math.ceil((reset.getTime() - Date.now()) / 1000).toString(),
        },
      });
    }
  }

  // Detect host type and route accordingly
  const hostType = detectHostType(request);

  // Chatbot and marketing sites don't require auth
  if (hostType === 'chatbot' || hostType === 'marketing') {
    return NextResponse.next();
  }

  // Platform site requires authentication
  if (hostType === 'platform') {
    return await handlePlatformAuth(request);
  }

  // Unknown hostname, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/analytics/:path*',
    '/api/admin/:path*',
    '/admin/:path*',
  ],
};
