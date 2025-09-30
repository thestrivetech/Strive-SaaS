import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

  // Handle CORS for public analytics endpoints
  if (path.startsWith('/api/analytics/')) {
    // Allow website domain to send analytics data
    const allowedOrigins = [
      'https://strivetech.ai',
      'https://www.strivetech.ai',
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Next.js dev server
    ];

    const origin = request.headers.get('origin');
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to actual requests
    const response = NextResponse.next();
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    return response;
  }

  // ============================================
  // HOST-BASED ROUTING
  // ============================================

  // Marketing site (strivetech.ai) - no auth required
  // Routes are in app/(web)/ so Next.js handles them automatically
  const isMarketingSite =
    hostname === 'strivetech.ai' ||
    hostname === 'www.strivetech.ai' ||
    (hostname.includes('localhost') && path.startsWith('/web'));

  if (isMarketingSite) {
    // No auth checks for marketing site
    return NextResponse.next();
  }

  // Platform site (app.strivetech.ai) - auth required for most routes
  // Routes are in app/(platform)/
  const isPlatformSite =
    hostname === 'app.strivetech.ai' ||
    (hostname.includes('localhost') && !path.startsWith('/web'));

  if (!isPlatformSite) {
    // Unknown hostname, continue normally
    return NextResponse.next();
  }

  // ============================================
  // PLATFORM AUTH & ROUTING
  // ============================================

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Dynamic import to work with Turbopack
  const { createServerClient } = await import('@supabase/ssr');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin routes that require ADMIN role
  const isAdminRoute = path.startsWith('/admin') || path.startsWith('/api/admin/');

  // Protected routes that require authentication
  const isProtectedRoute = path.startsWith('/dashboard') ||
                          path.startsWith('/crm') ||
                          path.startsWith('/projects') ||
                          path.startsWith('/ai') ||
                          path.startsWith('/tools') ||
                          path.startsWith('/settings') ||
                          isAdminRoute;

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    redirectResponse.headers.set('Pragma', 'no-cache');
    redirectResponse.headers.set('Expires', '0');
    return redirectResponse;
  }

  // Admin route protection - check ADMIN role
  if (user && isAdminRoute) {
    // Dynamic import to prevent circular dependency
    const { prisma } = await import('./lib/prisma');

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      // User is not admin, redirect to dashboard
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
      redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      redirectResponse.headers.set('Pragma', 'no-cache');
      redirectResponse.headers.set('Expires', '0');
      return redirectResponse;
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && path === '/login') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    redirectResponse.headers.set('Pragma', 'no-cache');
    redirectResponse.headers.set('Expires', '0');
    return redirectResponse;
  }

  // If user is authenticated and on root path, redirect to dashboard
  if (user && path === '/') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    redirectResponse.headers.set('Pragma', 'no-cache');
    redirectResponse.headers.set('Expires', '0');
    return redirectResponse;
  }

  // If user is not authenticated and on root path, redirect to login
  if (!user && path === '/') {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    redirectResponse.headers.set('Pragma', 'no-cache');
    redirectResponse.headers.set('Expires', '0');
    return redirectResponse;
  }

  // Add no-cache headers ONLY to HTML pages (not static assets)
  // This prevents browser caching of auth state but allows JS/CSS/images to cache
  const isStaticAsset = path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);

  if (!isStaticAsset && (path.startsWith('/login') || path.startsWith('/dashboard') || isProtectedRoute)) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/analytics/:path*',
    '/api/admin/:path*',
    '/admin/:path*',
  ],
};