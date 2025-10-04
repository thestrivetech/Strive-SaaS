import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleCORS } from './lib/middleware/cors';
import { detectHostType } from './lib/middleware/routing';
import { handlePlatformAuth } from './lib/middleware/auth';

export async function middleware(request: NextRequest) {
  // Handle CORS for analytics endpoints
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

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
