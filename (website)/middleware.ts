import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Strive Tech Marketing Website
 *
 * Purpose: Future-ready for analytics tracking and redirects
 * Current: Minimal implementation (no auth needed for public site)
 */
export function middleware(request: NextRequest) {
  // Future: Add analytics tracking
  // Future: Add A/B testing variants
  // Future: Add redirect logic for deprecated URLs

  // For now, just pass through all requests
  return NextResponse.next();
}

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
