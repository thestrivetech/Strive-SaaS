import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

  const path = request.nextUrl.pathname;

  // Protected routes that require authentication
  const isProtectedRoute = path.startsWith('/dashboard') ||
                          path.startsWith('/crm') ||
                          path.startsWith('/projects') ||
                          path.startsWith('/ai') ||
                          path.startsWith('/tools') ||
                          path.startsWith('/settings');

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

  // Add no-cache headers to auth-related pages
  if (path.startsWith('/login') || path.startsWith('/dashboard') || isProtectedRoute) {
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
  ],
};