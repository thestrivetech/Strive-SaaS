import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function handlePlatformAuth(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = path.startsWith('/admin') || path.startsWith('/api/admin/');
  const isProtectedRoute = path.startsWith('/dashboard') ||
    path.startsWith('/crm') ||
    path.startsWith('/projects') ||
    path.startsWith('/ai') ||
    path.startsWith('/tools') ||
    path.startsWith('/settings') ||
    path.startsWith('/onboarding') ||
    isAdminRoute;

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    setNoCacheHeaders(redirectResponse);
    return redirectResponse;
  }

  if (user && isAdminRoute) {
    const { prisma } = await import('@/lib/prisma');
    const dbUser = await prisma.users.findUnique({
      where: { email: user.email! },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }
  }

  if (user && path === '/login') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    setNoCacheHeaders(redirectResponse);
    return redirectResponse;
  }

  if (user && path === '/') {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    setNoCacheHeaders(redirectResponse);
    return redirectResponse;
  }

  if (!user && path === '/') {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    setNoCacheHeaders(redirectResponse);
    return redirectResponse;
  }

  const isStaticAsset = path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
  if (!isStaticAsset && (path.startsWith('/login') || path.startsWith('/dashboard') || isProtectedRoute)) {
    setNoCacheHeaders(response);
  }

  return response;
}

function setNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
}
