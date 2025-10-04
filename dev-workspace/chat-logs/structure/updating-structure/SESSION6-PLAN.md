# Session 6: Middleware & Industry Context - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2 hours
**Dependencies:** Session 1 ✅, Session 4 (routes), Session 5 (management)
**Parallel Safe:** No (modifies core middleware)

---

## 🎯 Session Objectives

Update the middleware to detect industry context, validate industry access, and provide industry information to all routes via request headers and context providers.

**What Exists:**
- ✅ `middleware.ts` - Root middleware file (37 lines)
- ✅ `lib/middleware/auth.ts` - Platform authentication
- ✅ `lib/middleware/cors.ts` - CORS handling
- ✅ `lib/middleware/routing.ts` - Host detection
- ✅ `lib/industries/registry.ts` - Industry functions

**What's Missing:**
- ❌ Industry detection in middleware
- ❌ Industry access validation
- ❌ Industry context in request headers
- ❌ Industry context provider for client
- ❌ RBAC updates for industry permissions

---

## 📋 Task Breakdown

### Phase 1: Industry Middleware Utilities (45 minutes)

**Directory:** `lib/middleware/`

#### File 1: `industry.ts` (create new)
- [ ] Create `detectIndustryFromPath()` function
  - Extract industryId from `/industries/[industryId]/` routes
  - Return null if not on industry route
  - Validate industryId format
- [ ] Create `getOrganizationIndustries()` function
  - Fetch enabled industries for organization
  - Cache result in middleware
  - Return array of enabled industry IDs
- [ ] Create `validateIndustryAccess()` function
  - Check if organization has industry enabled
  - Check if user has permission to access industry
  - Return boolean
- [ ] Create `setIndustryHeaders()` function
  - Set x-industry-id header if on industry route
  - Set x-industry-enabled header with list
  - Set x-primary-industry header

**Functions:**
```typescript
export function detectIndustryFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/industries\/([^\/]+)/);
  return match ? match[1] : null;
}

export async function getOrganizationIndustries(
  orgId: string
): Promise<string[]> {
  // Query database for enabled industries
  const configs = await prisma.organizationToolConfig.findMany({
    where: { organizationId: orgId, enabled: true },
    select: { industry: true },
  });
  return configs.map(c => c.industry);
}

export async function validateIndustryAccess(
  industryId: string,
  orgId: string,
  userId: string
): Promise<boolean> {
  const enabledIndustries = await getOrganizationIndustries(orgId);
  return enabledIndustries.includes(industryId.toUpperCase());
}

export function setIndustryHeaders(
  response: NextResponse,
  industryId: string | null,
  enabledIndustries: string[],
  primaryIndustry: string | null
): void {
  if (industryId) {
    response.headers.set('x-industry-id', industryId);
  }
  response.headers.set('x-industry-enabled', enabledIndustries.join(','));
  if (primaryIndustry) {
    response.headers.set('x-primary-industry', primaryIndustry);
  }
}
```

**Success Criteria:**
- All functions properly typed
- Error handling for database failures
- Efficient (minimal queries)
- Exported for use in middleware

---

### Phase 2: Update Root Middleware (30 minutes)

**File:** `middleware.ts` (update existing)

#### Updates:
- [ ] Import industry middleware utilities
- [ ] Detect industry from request path
- [ ] Validate industry access if on industry route
- [ ] Set industry headers for all platform requests
- [ ] Redirect unauthorized industry access
- [ ] Add industry routes to matcher config

**Updated Flow:**
```typescript
export async function middleware(request: NextRequest) {
  // 1. Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  // 2. Detect host type
  const hostType = detectHostType(request);

  // 3. Chatbot and marketing don't require auth or industry
  if (hostType === 'chatbot' || hostType === 'marketing') {
    return NextResponse.next();
  }

  // 4. Platform requires authentication
  if (hostType === 'platform') {
    const authResponse = await handlePlatformAuth(request);

    // If auth failed, return early
    if (authResponse.status === 401 || authResponse.status === 302) {
      return authResponse;
    }

    // 5. Extract user from auth response
    const user = getUserFromRequest(request);

    // 6. Detect industry context
    const industryId = detectIndustryFromPath(request.nextUrl.pathname);

    // 7. Validate industry access if on industry route
    if (industryId) {
      const hasAccess = await validateIndustryAccess(
        industryId,
        user.organizationId,
        user.id
      );

      if (!hasAccess) {
        return NextResponse.redirect(
          new URL('/settings/industries?error=access_denied', request.url)
        );
      }
    }

    // 8. Get all enabled industries and primary
    const enabledIndustries = await getOrganizationIndustries(user.organizationId);
    const org = await getOrganization(user.organizationId);

    // 9. Set industry headers
    const response = NextResponse.next();
    setIndustryHeaders(
      response,
      industryId,
      enabledIndustries,
      org.industry
    );

    return response;
  }

  return NextResponse.next();
}
```

**Success Criteria:**
- Validates industry access
- Sets proper headers
- Redirects unauthorized access
- Maintains existing auth flow
- Minimal performance impact

---

#### Update matcher config:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/analytics/:path*',
    '/api/admin/:path*',
    '/admin/:path*',
    '/industries/:path*', // ✅ Add industry routes
  ],
};
```

---

### Phase 3: Industry Context Provider (30 minutes)

**Directory:** `lib/context/`

#### File 1: `industry-context.tsx` (create new)
- [ ] Create IndustryContext with React Context API
- [ ] Provide industry ID, config, enabled list
- [ ] Create `useIndustry()` hook
- [ ] Create `IndustryProvider` component
- [ ] Read from request headers (x-industry-*)
- [ ] Client-side context for components

**Implementation:**
```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { IndustryConfig } from '@/lib/industries/_core/industry-config';

interface IndustryContextValue {
  currentIndustry: string | null;
  industryConfig: IndustryConfig | null;
  enabledIndustries: string[];
  primaryIndustry: string | null;
  hasIndustry: (industryId: string) => boolean;
}

const IndustryContext = createContext<IndustryContextValue | null>(null);

export function IndustryProvider({
  children,
  currentIndustry,
  enabledIndustries,
  primaryIndustry,
}: {
  children: ReactNode;
  currentIndustry: string | null;
  enabledIndustries: string[];
  primaryIndustry: string | null;
}) {
  const industryConfig = currentIndustry
    ? getIndustryConfig(currentIndustry)
    : null;

  const hasIndustry = (industryId: string) => {
    return enabledIndustries.includes(industryId.toUpperCase());
  };

  return (
    <IndustryContext.Provider
      value={{
        currentIndustry,
        industryConfig,
        enabledIndustries,
        primaryIndustry,
        hasIndustry,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const context = useContext(IndustryContext);
  if (!context) {
    throw new Error('useIndustry must be used within IndustryProvider');
  }
  return context;
}
```

**Success Criteria:**
- Type-safe context
- Easy to use hook
- Works in Client Components
- Reads from headers

---

#### File 2: Update `app/(platform)/layout.tsx`
- [ ] Read industry headers from request
- [ ] Wrap children in IndustryProvider
- [ ] Pass current industry, enabled list, primary

```typescript
import { headers } from 'next/headers';
import { IndustryProvider } from '@/lib/context/industry-context';

export default async function PlatformLayout({ children }) {
  const headersList = headers();
  const currentIndustry = headersList.get('x-industry-id');
  const enabledIndustries = headersList.get('x-industry-enabled')?.split(',') || [];
  const primaryIndustry = headersList.get('x-primary-industry');

  return (
    <IndustryProvider
      currentIndustry={currentIndustry}
      enabledIndustries={enabledIndustries}
      primaryIndustry={primaryIndustry}
    >
      {children}
    </IndustryProvider>
  );
}
```

---

### Phase 4: RBAC Industry Permissions (30 minutes)

**Directory:** `lib/auth/`

#### File 1: Update `rbac.ts`
- [ ] Add industry-specific permission checks
- [ ] Create `canAccessIndustry()` function
- [ ] Create `canManageIndustries()` function (admin only)
- [ ] Create `canConfigureIndustry()` function
- [ ] Integrate with existing RBAC system

**New Functions:**
```typescript
export async function canAccessIndustry(
  userId: string,
  industryId: string
): Promise<boolean> {
  const user = await getUser(userId);
  const org = await getOrganization(user.organizationId);

  // Check if industry enabled for organization
  const enabledIndustries = await getOrganizationIndustries(org.id);
  if (!enabledIndustries.includes(industryId.toUpperCase())) {
    return false;
  }

  // Check user role allows industry access
  // All members can access enabled industries by default
  return true;
}

export async function canManageIndustries(
  userId: string
): Promise<boolean> {
  const user = await getUser(userId);
  const member = await getOrganizationMember(userId, user.organizationId);

  // Only OWNER and ADMIN can manage industries
  return ['OWNER', 'ADMIN'].includes(member.role);
}

export async function canConfigureIndustry(
  userId: string,
  industryId: string
): Promise<boolean> {
  // Must be able to access industry
  const hasAccess = await canAccessIndustry(userId, industryId);
  if (!hasAccess) return false;

  // Must be admin or owner
  return await canManageIndustries(userId);
}
```

**Success Criteria:**
- Integrates with existing RBAC
- Proper role checks
- Used in Server Actions
- Used in middleware

---

### Phase 5: Testing (30 minutes)

#### File 1: `__tests__/lib/middleware/industry.test.ts`
- [ ] Test `detectIndustryFromPath()` with various URLs
- [ ] Test `getOrganizationIndustries()` returns correct list
- [ ] Test `validateIndustryAccess()` allows/denies correctly
- [ ] Test `setIndustryHeaders()` sets headers properly
- [ ] Mock database calls

#### File 2: `__tests__/middleware.test.ts` (update)
- [ ] Test middleware redirects unauthorized industry access
- [ ] Test middleware sets industry headers
- [ ] Test middleware allows authorized access
- [ ] Mock auth and database

#### File 3: `__tests__/lib/auth/rbac.test.ts` (update)
- [ ] Test `canAccessIndustry()` permissions
- [ ] Test `canManageIndustries()` role checks
- [ ] Test `canConfigureIndustry()` combined checks

**Coverage Target:** 80%+

---

## 📊 Files to Create/Update

### Middleware Files (2 files)
```
lib/middleware/
├── industry.ts                       # ✅ Create (new utilities)
└── cors.ts, auth.ts, routing.ts      # ✅ Existing (no changes)

middleware.ts                         # 🔄 Update (add industry logic)
```

### Context Files (2 files)
```
lib/context/
└── industry-context.tsx              # ✅ Create (React Context)

app/(platform)/layout.tsx             # 🔄 Update (add provider)
```

### RBAC Files (1 file)
```
lib/auth/
└── rbac.ts                           # 🔄 Update (add industry permissions)
```

### Test Files (3 files)
```
__tests__/
├── lib/middleware/industry.test.ts   # ✅ Create
├── middleware.test.ts                # 🔄 Update
└── lib/auth/rbac.test.ts             # 🔄 Update
```

**Total:** 8 files (3 new, 5 updated)

---

## 🎯 Success Criteria

- [ ] Middleware detects industry context
- [ ] Unauthorized industry access redirected
- [ ] Industry headers set correctly
- [ ] IndustryProvider works in all platform routes
- [ ] `useIndustry()` hook functional in Client Components
- [ ] RBAC permissions enforce industry access
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] No performance degradation (< 50ms added latency)
- [ ] All files under 500 lines
- [ ] Middleware complexity under 200 lines

---

## 🔗 Integration Points

### With Industry Routes
```typescript
// Industry routes automatically get validated
// app/(platform)/industries/[industryId]/page.tsx
// Middleware checks access before route handler runs
```

### With Components
```typescript
'use client';

import { useIndustry } from '@/lib/context/industry-context';

export function MyComponent() {
  const { currentIndustry, hasIndustry, industryConfig } = useIndustry();

  if (!currentIndustry) {
    return <div>Not on an industry page</div>;
  }

  return (
    <div>
      <h1>{industryConfig?.name}</h1>
      {hasIndustry('healthcare') && <HealthcareFeature />}
    </div>
  );
}
```

### With Server Actions
```typescript
'use server';

import { canConfigureIndustry } from '@/lib/auth/rbac';

export async function updateIndustrySettings(industryId: string, settings: any) {
  const user = await getCurrentUser();

  // Check permission
  const canConfigure = await canConfigureIndustry(user.id, industryId);
  if (!canConfigure) {
    return { error: 'Insufficient permissions' };
  }

  // Update settings...
}
```

---

## 📝 Implementation Notes

### Performance Optimization
```typescript
// Cache industry data in middleware to avoid multiple DB queries
const industryCache = new Map<string, { industries: string[]; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getOrganizationIndustries(orgId: string): Promise<string[]> {
  const cached = industryCache.get(orgId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.industries;
  }

  const industries = await fetchFromDatabase(orgId);
  industryCache.set(orgId, { industries, timestamp: Date.now() });
  return industries;
}
```

### Error Handling
```typescript
// Gracefully handle industry detection failures
try {
  const hasAccess = await validateIndustryAccess(industryId, orgId, userId);
  if (!hasAccess) {
    return redirectToSettings();
  }
} catch (error) {
  console.error('Industry validation failed:', error);
  // Allow request to continue if validation fails
  // Don't block users due to transient errors
  return NextResponse.next();
}
```

### Header Propagation
```typescript
// Headers set in middleware are available in:
// 1. Server Components via headers()
// 2. Server Actions via request context
// 3. API routes via req.headers

// Example in Server Component:
import { headers } from 'next/headers';

export default async function Page() {
  const industryId = headers().get('x-industry-id');
  // Use industryId...
}
```

---

## 🚀 Quick Start Command

```bash
# Create directory structure
mkdir -p lib/middleware lib/context __tests__/lib/middleware

# Run checks after implementation
npx tsc --noEmit && npm run lint && npm test
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ Session 1: `lib/industries/registry.ts` - Industry functions
- ✅ Session 4: Industry routes exist
- ✅ Session 5: Industry management actions

**Blocks (must complete before):**
- SESSION9: Integration testing needs middleware working

**Enables:**
- Industry context available everywhere
- Automatic access validation
- Industry-aware components
- Industry permissions enforced

---

## 📖 Reference Files

**Read before starting:**
- `middleware.ts` - Current middleware implementation
- `lib/middleware/auth.ts` - Auth middleware pattern
- `lib/auth/rbac.ts` - Existing RBAC system
- `app/(platform)/layout.tsx` - Platform layout structure
- Next.js middleware docs - Headers and redirects

**Testing references:**
- `__tests__/lib/auth/rbac.test.ts` - RBAC testing pattern
- Jest mocking docs - Mocking Prisma and Next.js functions

---

**Last Updated:** 2025-10-03
**Status:** ⏸️ Ready to Execute
