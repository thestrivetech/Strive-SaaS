import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function handlePlatformAuth(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;

  // ⚠️ TEMPORARY: Skip auth on localhost for presentation
  const isLocalhost = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1';
  if (isLocalhost && !path.startsWith('/api/')) {
    return NextResponse.next();
  }

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

  // Platform-admin routes (SUPER_ADMIN only - platform dev access)
  const isPlatformAdminRoute = path.startsWith('/platform-admin') || path.startsWith('/api/platform-admin/');

  // Org-admin routes (SUPER_ADMIN + ADMIN - organization management)
  const isAdminRoute = path.startsWith('/admin') || path.startsWith('/api/admin/');

  const isTransactionRoute = path.startsWith('/transactions') || path.startsWith('/real-estate/workspace');
  const isREIDRoute = path.startsWith('/real-estate/reid');
  const isProtectedRoute = path.startsWith('/dashboard') ||
    path.startsWith('/real-estate/dashboard') ||
    path.startsWith('/real-estate/workspace') ||
    path.startsWith('/real-estate/ai-hub') ||
    path.startsWith('/real-estate/expense-tax') ||
    path.startsWith('/real-estate/cms-marketing') ||
    path.startsWith('/real-estate/marketplace') ||
    path.startsWith('/crm') ||
    path.startsWith('/real-estate/crm') ||
    path.startsWith('/projects') ||
    path.startsWith('/ai') ||
    path.startsWith('/tools') ||
    path.startsWith('/settings') ||
    path.startsWith('/onboarding') ||
    isTransactionRoute ||
    isREIDRoute ||
    isAdminRoute ||
    isPlatformAdminRoute;

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    setNoCacheHeaders(redirectResponse);
    return redirectResponse;
  }

  // Platform-admin route protection (SUPER_ADMIN only - platform dev)
  if (user && isPlatformAdminRoute) {
    const { prisma } = await import('@/lib/database/prisma');
    const dbUser = await prisma.users.findUnique({
      where: { email: user.email! },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }
  }

  // Org-admin route protection (SUPER_ADMIN + ADMIN - organization management)
  if (user && isAdminRoute) {
    const { prisma } = await import('@/lib/database/prisma');
    const dbUser = await prisma.users.findUnique({
      where: { email: user.email! },
      select: { role: true },
    });

    if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'ADMIN')) {
      const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }
  }

  // Transaction route protection - role and tier check
  if (user && isTransactionRoute) {
    const { prisma } = await import('@/lib/database/prisma');
    const dbUser = await prisma.users.findUnique({
      where: { email: user.email! },
      select: { role: true, subscription_tier: true },
    });

    // Check user role (only USER, MODERATOR, ADMIN, SUPER_ADMIN can access)
    if (!dbUser || !['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
      const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }

    // Check subscription tier (STARTER or higher required)
    // Tier hierarchy: FREE < CUSTOM < STARTER < GROWTH < ELITE < ENTERPRISE
    const tierAccess = ['STARTER', 'GROWTH', 'ELITE', 'ENTERPRISE']; // Transaction module requires STARTER+
    if (!tierAccess.includes(dbUser.subscription_tier)) {
      const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard?upgrade=starter', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }
  }

  // REID Dashboard protection - ELITE tier required
  if (user && isREIDRoute) {
    const { prisma } = await import('@/lib/database/prisma');
    const dbUser = await prisma.users.findUnique({
      where: { email: user.email! },
      select: { role: true, subscription_tier: true },
    });

    // Check user role (only USER, MODERATOR, ADMIN, SUPER_ADMIN can access)
    if (!dbUser || !['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
      const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }

    // Check subscription tier (ELITE or higher required for REID Dashboard)
    // Tier hierarchy: FREE < CUSTOM < STARTER < GROWTH < ELITE < ENTERPRISE
    const tierAccess = ['ELITE', 'ENTERPRISE']; // REID requires ELITE+
    if (!tierAccess.includes(dbUser.subscription_tier)) {
      const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard?upgrade=elite', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }
  }

  // Check if user has completed onboarding (has an organization)
  if (user && path.startsWith('/onboarding')) {
    const { prisma } = await import('@/lib/database/prisma');
    const dbUser = await prisma.users.findUnique({
      where: { email: user.email! },
      select: {
        organization_members: {
          select: { organization_id: true }
        }
      }
    });

    // If user has organization, redirect to dashboard (onboarding complete)
    if (dbUser?.organization_members && dbUser.organization_members.length > 0) {
      const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
      setNoCacheHeaders(redirectResponse);
      return redirectResponse;
    }
  }

  if (user && path === '/login') {
    const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
    setNoCacheHeaders(redirectResponse);
    return redirectResponse;
  }

  if (user && path === '/') {
    const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
    setNoCacheHeaders(redirectResponse);
    return redirectResponse;
  }

  // Redirect old /dashboard to new /real-estate/dashboard
  if (user && path === '/dashboard') {
    const redirectResponse = NextResponse.redirect(new URL('/real-estate/dashboard', request.url));
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
