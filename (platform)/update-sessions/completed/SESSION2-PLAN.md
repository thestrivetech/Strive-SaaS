# Session 2: Auth & RBAC Implementation - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** Session 1 ✅ (must complete first)
**Parallel Safe:** No (creates core auth infrastructure)

---

## 🎯 Session Objectives

Implement Supabase authentication middleware and Role-Based Access Control (RBAC) system with dual-role support (Global + Organization roles).

**What Exists:**
- ✅ Supabase Auth configured (credentials in .env.local)
- ✅ Prisma models: User, Organization, OrganizationMember
- ✅ User roles: ADMIN, MODERATOR, EMPLOYEE, CLIENT
- ✅ Organization roles: OWNER, ADMIN, MEMBER, VIEWER

**What's Missing:**
- ❌ Supabase Auth middleware for session handling
- ❌ RBAC permission system
- ❌ Route protection middleware
- ❌ Auth helper functions (server-side)
- ❌ Permission checking utilities

---

## 📋 Task Breakdown

### Phase 1: Supabase Auth Middleware (45 minutes)

**Directory:** `lib/auth/`

#### File 1: `middleware.ts`
- [ ] Import Supabase SSR client
- [ ] Create `authMiddleware()` function
- [ ] Initialize Supabase client with cookie handling
- [ ] Get user session from Supabase Auth
- [ ] Check authentication status
- [ ] Redirect to `/login` if not authenticated
- [ ] Allow public routes (login, signup, reset)
- [ ] Return response with updated cookies

**Implementation:**
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function authMiddleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

**Success Criteria:**
- [ ] Supabase SSR client initialized
- [ ] Cookie handling configured
- [ ] Auth check performed on every request
- [ ] Unauthenticated users redirected
- [ ] Public routes allowed

---

#### File 2: `server.ts`
- [ ] Create server-side auth helpers
- [ ] `getCurrentUser()` - Get current user from session
- [ ] `getSession()` - Get full session object
- [ ] `requireAuth()` - Throw error if not authenticated
- [ ] `requireRole()` - Check user has specific role
- [ ] Import 'server-only' at top

**Implementation:**
```typescript
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/database/prisma';

export async function getCurrentUser() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get full user data with organization
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      organizationMembers: {
        include: {
          organization: true,
        },
      },
    },
  });

  return dbUser;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
```

**Success Criteria:**
- [ ] Server-only protection enabled
- [ ] Auth helpers work in Server Components
- [ ] User data fetched from database
- [ ] Organization membership included
- [ ] Type-safe returns

---

### Phase 2: RBAC System (1 hour)

**Directory:** `lib/auth/`

#### File 1: `rbac.ts`
- [ ] Define Permission type union
- [ ] Create ROLE_PERMISSIONS mapping
- [ ] Implement `hasPermission()` function
- [ ] Implement `requirePermission()` function
- [ ] Support wildcard permissions (e.g., 'crm:*')
- [ ] Export all RBAC utilities

**Implementation:**
```typescript
import { UserRole } from '@prisma/client';

export type Permission =
  | 'crm:read' | 'crm:write' | 'crm:delete'
  | 'projects:read' | 'projects:write' | 'projects:delete'
  | 'admin:access' | 'admin:settings'
  | 'tools:install' | 'tools:manage'
  | 'org:manage' | 'org:billing';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'admin:access',
    'admin:settings',
    'crm:read', 'crm:write', 'crm:delete',
    'projects:read', 'projects:write', 'projects:delete',
    'tools:install', 'tools:manage',
    'org:manage', 'org:billing',
  ],
  MODERATOR: [
    'crm:read', 'crm:write',
    'projects:read', 'projects:write',
    'tools:manage',
  ],
  EMPLOYEE: [
    'crm:read', 'crm:write',
    'projects:read', 'projects:write',
  ],
  CLIENT: [
    'projects:read',
  ],
};

export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  // Check exact permission
  if (permissions.includes(permission)) return true;

  // Check wildcard (e.g., 'crm:*' matches 'crm:read')
  const [resource] = permission.split(':');
  const wildcardPerm = `${resource}:*` as Permission;

  return permissions.includes(wildcardPerm);
}

export function requirePermission(
  userRole: UserRole,
  permission: Permission
): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}
```

**Success Criteria:**
- [ ] All permissions defined
- [ ] Role mappings complete
- [ ] Wildcard support works
- [ ] Type-safe permission checks
- [ ] Error thrown for missing permissions

---

#### File 2: `org-rbac.ts`
- [ ] Define organization-level permissions
- [ ] Create ORG_ROLE_PERMISSIONS mapping
- [ ] Implement `hasOrgPermission()` function
- [ ] Check both global + org roles
- [ ] Support organization context

**Implementation:**
```typescript
import { UserRole, OrganizationRole } from '@prisma/client';

export type OrgPermission =
  | 'members:invite' | 'members:remove'
  | 'settings:edit' | 'settings:billing'
  | 'industry:enable' | 'industry:disable';

const ORG_ROLE_PERMISSIONS: Record<OrganizationRole, OrgPermission[]> = {
  OWNER: [
    'members:invite', 'members:remove',
    'settings:edit', 'settings:billing',
    'industry:enable', 'industry:disable',
  ],
  ADMIN: [
    'members:invite', 'members:remove',
    'settings:edit',
    'industry:enable', 'industry:disable',
  ],
  MEMBER: [
    'members:invite',
  ],
  VIEWER: [],
};

export function hasOrgPermission(
  userRole: UserRole,
  orgRole: OrganizationRole,
  permission: OrgPermission
): boolean {
  // Global admins bypass org permissions
  if (userRole === 'ADMIN') return true;

  const orgPermissions = ORG_ROLE_PERMISSIONS[orgRole] || [];
  return orgPermissions.includes(permission);
}
```

**Success Criteria:**
- [ ] Org permissions defined
- [ ] Dual-role checking works
- [ ] Global admin bypass implemented
- [ ] Type-safe

---

### Phase 3: Route Protection (45 minutes)

**Directory:** `middleware.ts` (root)

#### File 1: Update Root Middleware
- [ ] Read existing `middleware.ts`
- [ ] Import `authMiddleware` from lib/auth
- [ ] Add RBAC checks for protected routes
- [ ] Define route matcher patterns
- [ ] Handle admin-only routes
- [ ] Handle role-based redirects

**Implementation:**
```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';
import { getCurrentUser } from '@/lib/auth/server';
import { hasPermission } from '@/lib/auth/rbac';

export async function middleware(request: NextRequest) {
  // Run auth middleware first
  const authResponse = await authMiddleware(request);

  // If redirected by auth, return immediately
  if (authResponse.status === 307 || authResponse.status === 308) {
    return authResponse;
  }

  const user = await getCurrentUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect CRM routes
  if (request.nextUrl.pathname.startsWith('/crm')) {
    if (!user || !hasPermission(user.role, 'crm:read')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};
```

**Success Criteria:**
- [ ] Auth middleware integrated
- [ ] Admin routes protected
- [ ] Role-based redirects work
- [ ] Matcher excludes static files
- [ ] No infinite redirect loops

---

#### File 2: Create Layout-Level Protection
- [ ] Create `lib/auth/guards.tsx` component guards
- [ ] `RequireAuth` component wrapper
- [ ] `RequireRole` component wrapper
- [ ] `RequirePermission` component wrapper
- [ ] Server Component based

**Implementation:**
```typescript
import { redirect } from 'next/navigation';
import { getCurrentUser } from './server';
import { hasPermission, type Permission } from './rbac';
import type { UserRole } from '@prisma/client';

export async function RequireAuth({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}

export async function RequireRole({
  role,
  children
}: {
  role: UserRole;
  children: React.ReactNode
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== role) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}

export async function RequirePermission({
  permission,
  children
}: {
  permission: Permission;
  children: React.ReactNode
}) {
  const user = await getCurrentUser();

  if (!user || !hasPermission(user.role, permission)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
```

**Usage in layouts:**
```typescript
// app/(platform)/crm/layout.tsx
import { RequirePermission } from '@/lib/auth/guards';

export default function CRMLayout({ children }) {
  return (
    <RequirePermission permission="crm:read">
      {children}
    </RequirePermission>
  );
}
```

**Success Criteria:**
- [ ] Component guards created
- [ ] Server Component based
- [ ] Redirects work correctly
- [ ] Type-safe props
- [ ] Easy to use in layouts

---

### Phase 4: Testing (30 minutes)

#### File 1: `__tests__/lib/auth/rbac.test.ts`
- [ ] Test `hasPermission()` with exact match
- [ ] Test `hasPermission()` with wildcard
- [ ] Test `requirePermission()` throws on missing
- [ ] Test all role permissions
- [ ] Test ADMIN role has all permissions

**Coverage Target:** 90%+

---

#### File 2: `__tests__/lib/auth/middleware.test.ts`
- [ ] Test authenticated user passes
- [ ] Test unauthenticated user redirects
- [ ] Test public routes allowed
- [ ] Test cookie handling
- [ ] Mock Supabase client

**Coverage Target:** 80%+

---

#### File 3: `__tests__/lib/auth/guards.test.tsx`
- [ ] Test RequireAuth redirects when not logged in
- [ ] Test RequireRole redirects for wrong role
- [ ] Test RequirePermission redirects without permission
- [ ] Test guards render children when authorized
- [ ] Mock getCurrentUser

**Coverage Target:** 80%+

---

## 📊 Files to Create

### Auth Infrastructure (6 files)
```
lib/auth/
├── middleware.ts           # ✅ Create (Supabase auth middleware)
├── server.ts               # ✅ Create (server-side helpers)
├── rbac.ts                 # ✅ Create (global RBAC)
├── org-rbac.ts            # ✅ Create (org-level RBAC)
├── guards.tsx             # ✅ Create (component guards)
└── index.ts               # ✅ Create (public API)
```

### Root Middleware (1 file)
```
middleware.ts               # 🔄 Update (integrate auth + RBAC)
```

### Tests (3 files)
```
__tests__/lib/auth/
├── rbac.test.ts           # ✅ Create
├── middleware.test.ts     # ✅ Create
└── guards.test.tsx        # ✅ Create
```

**Total:** 10 files (9 new, 1 update)

---

## 🎯 Success Criteria

**MANDATORY:**
- [ ] Supabase Auth middleware functional
- [ ] User sessions persist across requests
- [ ] RBAC system complete with all permissions
- [ ] Dual-role system (Global + Org) working
- [ ] Route protection enforced in middleware
- [ ] Component guards work in layouts
- [ ] Admin routes protected (ADMIN only)
- [ ] CRM routes protected (permission check)
- [ ] TypeScript compiles: 0 errors
- [ ] Linter passes: 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] All files under 500 lines

**Quality Checks:**
- [ ] No auth bypass possible
- [ ] No infinite redirect loops
- [ ] Cookies handled securely (httpOnly)
- [ ] Server-only protection on helpers
- [ ] Type-safe permission checks

---

## 🔗 Integration Points

### With Supabase
```typescript
// Supabase Auth session management
const { data: { user } } = await supabase.auth.getUser();

// Store in httpOnly cookies (secure)
response.cookies.set({
  name: 'sb-access-token',
  value: session.access_token,
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
});
```

### With Prisma Database
```typescript
// Link Supabase user to database user
const dbUser = await prisma.user.findUnique({
  where: { email: supabaseUser.email },
  include: {
    organizationMembers: {
      include: {
        organization: true,
      },
    },
  },
});
```

### With Server Components
```typescript
// Use in any Server Component
import { getCurrentUser } from '@/lib/auth/server';

export default async function Page() {
  const user = await getCurrentUser();
  return <div>Welcome {user.name}</div>;
}
```

### With Server Actions
```typescript
'use server';
import { requireAuth, requirePermission } from '@/lib/auth/server';
import { hasPermission } from '@/lib/auth/rbac';

export async function deleteCustomer(id: string) {
  const user = await requireAuth();
  requirePermission(user.role, 'crm:delete');

  // ... delete logic
}
```

---

## 📝 Implementation Notes

### Dual-Role System Explanation
```typescript
// User has TWO roles that work together:

interface User {
  // Global platform role
  role: 'ADMIN' | 'MODERATOR' | 'EMPLOYEE' | 'CLIENT';

  // Organization-specific role
  organizationMembers: {
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    organization: Organization;
  }[];
}

// Check BOTH for access:
function canManageOrgSettings(user: User): boolean {
  // Global admins can manage any org
  if (user.role === 'ADMIN') return true;

  // Org owners/admins can manage their org
  const orgMember = user.organizationMembers[0];
  return ['OWNER', 'ADMIN'].includes(orgMember.role);
}
```

### Permission Hierarchy
```
ADMIN (Global)
├── Full system access
├── All permissions granted
└── Bypass org-level checks

MODERATOR
├── CRM read/write
├── Projects read/write
└── Cannot delete

EMPLOYEE
├── CRM read/write
├── Projects read/write
└── No admin access

CLIENT
├── Projects read only
└── No CRM access
```

### Organization Roles
```
OWNER (Org-level)
├── All org permissions
├── Billing access
└── Can delete org

ADMIN (Org-level)
├── Member management
├── Settings access
└── No billing

MEMBER (Org-level)
├── Can invite members
└── Standard access

VIEWER (Org-level)
├── Read-only access
└── No modifications
```

### Middleware Execution Order
```
1. authMiddleware() - Check Supabase session
   ↓
2. Get user from database (with org data)
   ↓
3. Check route-specific permissions
   ↓
4. Redirect if unauthorized
   ↓
5. Allow request if authorized
```

---

## 🚀 Quick Start Commands

```bash
# Create directory
mkdir -p lib/auth

# Run after implementation
npx tsc --noEmit
npm run lint
npm test -- lib/auth --coverage
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ **Session 1:** Working app structure, Prisma client
- ✅ Supabase credentials in .env.local
- ✅ Prisma models: User, Organization, OrganizationMember

**Blocks (must complete before):**
- **SESSION3** (UI/UX) - Layouts need auth guards
- **SESSION4** (Security) - Builds on RBAC
- **SESSION5** (Testing) - Auth needed for tests
- **SESSION6** (Deployment) - Auth required in prod

**Enables:**
- Protected routes throughout platform
- Role-based UI rendering
- Secure Server Actions
- Organization-level permissions

---

## 📖 Reference Files

**Must read before starting:**
- Prisma schema: `User`, `Organization`, `OrganizationMember` models
- `.env.local` - Supabase credentials
- Next.js middleware docs
- Supabase SSR docs

**Similar patterns in codebase:**
- Check for existing auth utilities
- Look for Supabase client usage
- Review route protection patterns

---

## ⚠️ Security Warnings

**CRITICAL:**
- ✅ ALWAYS use httpOnly cookies for sessions
- ✅ NEVER expose SUPABASE_SERVICE_ROLE_KEY to client
- ✅ ALWAYS validate user session server-side
- ✅ NEVER trust client-side role checks
- ✅ ALWAYS re-check permissions in Server Actions

**Cookie Security:**
```typescript
// ✅ Secure cookie settings
{
  httpOnly: true,    // Prevent JS access
  secure: true,      // HTTPS only
  sameSite: 'lax',   // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 24 * 7  // 7 days
}
```

**Permission Checks:**
```typescript
// ❌ WRONG - Client can bypass
'use client';
if (user.role === 'ADMIN') {
  return <AdminPanel />;
}

// ✅ RIGHT - Server-side enforcement
import { RequireRole } from '@/lib/auth/guards';

export default function Layout({ children }) {
  return (
    <RequireRole role="ADMIN">
      {children}
    </RequireRole>
  );
}
```

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 CRITICAL - Core security infrastructure
