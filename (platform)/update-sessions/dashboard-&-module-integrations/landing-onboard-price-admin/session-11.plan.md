# Session 11: Navigation & Route Integration

## Session Overview
**Goal:** Integrate all routes into a cohesive navigation system with proper middleware, route groups, and SSO between marketing/auth/admin/platform sections.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-10

## Objectives

1. ✅ Configure Next.js middleware for auth and RBAC
2. ✅ Set up route groups correctly ((marketing), (auth), (admin), (platform))
3. ✅ Implement navigation components for each section
4. ✅ Add user menu with profile/settings/logout
5. ✅ Configure SSO between domains (if using subdomains)
6. ✅ Add breadcrumbs for navigation context
7. ✅ Implement protected routes pattern
8. ✅ Add role-based route access

## Prerequisites

- [x] All pages created (Sessions 4-10)
- [x] Auth system in place (Supabase)
- [x] RBAC functions complete (Session 2)
- [x] Marketing/Admin/Platform layouts ready

## Route Structure Overview

```
Route Groups:
- (marketing)/          # Public landing/pricing pages
  - page.tsx           # Landing page
  - pricing/page.tsx   # Pricing
  - about/page.tsx     # About (future)

- (auth)/              # Authentication pages
  - login/page.tsx     # Login
  - signup/page.tsx    # Signup (future)
  - onboarding/page.tsx # Onboarding wizard

- (admin)/             # Admin dashboard (ADMIN only)
  - admin/page.tsx     # Admin dashboard
  - admin/users/       # User management
  - admin/organizations/ # Org management
  - admin/feature-flags/ # Feature flags
  - admin/alerts/      # System alerts

- (platform)/          # Main app (authenticated users)
  - dashboard/page.tsx # User dashboard (future)
  - real-estate/       # Industry routes (future)
```

## Component Structure

```
middleware.ts                 # Root middleware (auth + routing)

components/shared/navigation/
├── marketing-nav.tsx         # Public navigation
├── platform-nav.tsx          # App navigation
├── admin-nav.tsx             # Admin navigation (from Session 7)
├── user-menu.tsx             # User profile menu
├── breadcrumbs.tsx           # Navigation breadcrumbs
└── mobile-menu.tsx           # Mobile responsive menu
```

## Implementation Steps

### Step 1: Create Root Middleware

**File:** `middleware.ts` (root level)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.delete(name);
        },
      },
    }
  );

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/login', '/signup', '/pricing', '/about', '/'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Admin routes (ADMIN role required)
  const isAdminRoute = pathname.startsWith('/admin');

  // Protected routes (auth required)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/real-estate') ||
    pathname.startsWith('/onboarding');

  // Redirect logic
  if (!session && isProtectedRoute) {
    // Not authenticated, redirect to login
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session) {
    // User is authenticated
    const user = session.user;

    // Check admin access for admin routes
    if (isAdminRoute) {
      // Fetch user role (in real app, this would be in session or JWT)
      const { data: userData } = await supabase
        .from('users')
        .select('global_role')
        .eq('id', user.id)
        .single();

      if (userData?.global_role !== 'ADMIN') {
        // Not an admin, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Redirect from login/signup if already authenticated
    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

// Match all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};
```

### Step 2: Create User Menu Component

**File:** `components/shared/navigation/user-menu.tsx`

```tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  LogOut,
  Shield,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    globalRole?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/settings/billing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {user.globalRole === 'ADMIN' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Step 3: Create Platform Navigation

**File:** `components/shared/navigation/platform-nav.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserMenu } from './user-menu';
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/real-estate/crm', label: 'CRM', icon: Users },
  { href: '/real-estate/transactions', label: 'Transactions', icon: Building2 },
  { href: '/real-estate/tasks', label: 'Tasks', icon: FolderKanban },
  { href: '/real-estate/analytics', label: 'Analytics', icon: BarChart3 },
];

interface PlatformNavProps {
  user: any;
}

export function PlatformNav({ user }: PlatformNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            Strive
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* User Menu */}
          <UserMenu user={user} />

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container py-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted',
                    isActive && 'bg-muted text-primary'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
```

### Step 4: Create Breadcrumbs Component

**File:** `components/shared/navigation/breadcrumbs.tsx`

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on home pages
  if (segments.length === 0 || pathname === '/dashboard') {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="h-4 w-4" />
              <li>
                {isLast ? (
                  <span className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Step 5: Update Platform Layout

**File:** `app/(platform)/layout.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PlatformNav } from '@/components/shared/navigation/platform-nav';
import { Breadcrumbs } from '@/components/shared/navigation/breadcrumbs';

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Require authentication
  if (!session) {
    redirect('/login');
  }

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, global_role')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <PlatformNav user={user} />
      <div className="container py-8">
        <Breadcrumbs />
        {children}
      </div>
    </div>
  );
}
```

### Step 6: Create Root Page Redirect

**File:** `app/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect based on auth status
  if (session) {
    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('global_role')
      .eq('id', session.user.id)
      .single();

    if (user?.global_role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  } else {
    // Not authenticated, show landing page
    redirect('/landing'); // Or render landing page here
  }
}
```

### Step 7: Update Marketing Layout

**File:** `app/(marketing)/layout.tsx`

```tsx
import { MarketingNav } from '@/components/shared/layouts/marketing-nav';
import { Footer } from '@/components/shared/layouts/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

## Testing Requirements

### Test 1: Auth Redirect
```typescript
// Test unauthenticated redirect
it('should redirect to login from protected route', async () => {
  // Access /dashboard without auth
  const response = await fetch('/dashboard');
  expect(response.status).toBe(307); // Redirect
  expect(response.headers.get('location')).toContain('/login');
});
```

### Test 2: RBAC Admin Access
```typescript
// Test admin route protection
it('should redirect non-admin from admin routes', async () => {
  // Mock non-admin user
  // Access /admin
  // Verify redirect to /dashboard
});
```

### Test 3: Navigation Active State
```typescript
// Test nav active state
it('should highlight active navigation item', () => {
  render(<PlatformNav user={mockUser} />);
  // Navigate to /real-estate/crm
  // Verify CRM nav item has active class
});
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] Middleware configured and protecting routes
- [ ] Auth redirects working (login → dashboard)
- [ ] RBAC enforced (non-admin redirected from /admin)
- [ ] User menu functional with sign out
- [ ] Platform navigation with active states
- [ ] Breadcrumbs showing current path
- [ ] Mobile menu responsive
- [ ] All route groups properly structured
- [ ] SSO working (same session across routes)
- [ ] No console errors on navigation

**Quality Checks:**
- [ ] Route transitions smooth
- [ ] Navigation highlights correct
- [ ] Mobile menu closes on selection
- [ ] User avatar displays correctly
- [ ] Admin menu item shown for admins only
- [ ] Accessibility: keyboard navigation, ARIA

## Files Created/Modified

```
✅ middleware.ts (root)
✅ app/page.tsx (root redirect)
🔄 app/(marketing)/layout.tsx
🔄 app/(auth)/layout.tsx
✅ app/(platform)/layout.tsx
🔄 app/(admin)/layout.tsx (already created Session 7)
✅ components/shared/navigation/user-menu.tsx
✅ components/shared/navigation/platform-nav.tsx
✅ components/shared/navigation/breadcrumbs.tsx
🔄 components/shared/layouts/marketing-nav.tsx (already created Session 4)
✅ __tests__/middleware.test.ts
✅ __tests__/navigation/*.test.tsx
```

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 12: Testing, QA & Final Integration**
2. ✅ Navigation and routing complete
3. ✅ Ready for comprehensive testing and QA

---

**Session 11 Complete:** ✅ Navigation and route integration with middleware and RBAC implemented
