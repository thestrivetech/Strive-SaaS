# Session 4: Security & Performance - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** Session 1 ✅, Session 2 ✅, Session 3 ✅
**Parallel Safe:** Yes (can run with Session 5)

---

## 🎯 Session Objectives

Implement comprehensive security measures and performance optimizations to prepare the platform for production deployment.

**What Exists:**
- ✅ Auth system with RBAC (Session 2)
- ✅ Supabase integration
- ✅ Prisma database access
- ✅ Next.js 15 with App Router

**What's Missing:**
- ❌ Row Level Security (RLS) policies
- ❌ Environment variable validation
- ❌ Rate limiting infrastructure
- ❌ XSS/CSRF protection verification
- ❌ Performance optimization patterns
- ❌ Bundle size monitoring
- ❌ Security audit tools

---

## 📋 Task Breakdown

### Phase 1: Environment Validation (30 minutes)

**Directory:** `lib/`

#### File 1: Create `lib/env.ts`
- [ ] Import Zod for validation
- [ ] Define environment schema with all required vars
- [ ] Add type safety for process.env
- [ ] Validate at app startup
- [ ] Export typed env object
- [ ] Server-only protection

**Implementation:**
```typescript
import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),

  // AI Providers
  OPENROUTER_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // Stripe (optional for now)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

// Validate and export
export const env = envSchema.parse(process.env);

// Type-safe access
// Usage: import { env } from '@/lib/env';
// env.DATABASE_URL (fully typed)
```

**Success Criteria:**
- [ ] All env vars validated
- [ ] Type-safe environment access
- [ ] Fails fast if missing vars
- [ ] Server-only protected

---

### Phase 2: Row Level Security (RLS) Setup (45 minutes)

**Directory:** `prisma/migrations/` and `lib/database/`

#### File 1: Create RLS Migration SQL
- [ ] Create migration file for RLS policies
- [ ] Enable RLS on all multi-tenant tables
- [ ] Create policies for organization isolation
- [ ] Create helper functions for RLS context
- [ ] Add indexes for performance

**Create `prisma/migrations/[timestamp]_add_rls_policies/migration.sql`:**
```sql
-- Enable Row Level Security on multi-tenant tables
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIConversation" ENABLE ROW LEVEL SECURITY;

-- Create function to get current org from session
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS TEXT AS $$
  SELECT current_setting('app.current_org_id', true);
$$ LANGUAGE SQL STABLE;

-- Customer RLS policy
CREATE POLICY "tenant_isolation_customer" ON "Customer"
  USING ("organizationId" = current_user_org_id());

-- Project RLS policy
CREATE POLICY "tenant_isolation_project" ON "Project"
  USING ("organizationId" = current_user_org_id());

-- Task RLS policy
CREATE POLICY "tenant_isolation_task" ON "Task"
  USING ("organizationId" = current_user_org_id());

-- AI Conversation RLS policy
CREATE POLICY "tenant_isolation_ai" ON "AIConversation"
  USING ("organizationId" = current_user_org_id());

-- Create indexes for RLS performance
CREATE INDEX IF NOT EXISTS "idx_customer_org" ON "Customer"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_project_org" ON "Project"("organizationId");
CREATE INDEX IF NOT EXISTS "idx_task_org" ON "Task"("organizationId");
```

**Success Criteria:**
- [ ] RLS enabled on all tables
- [ ] Policies created for org isolation
- [ ] Helper functions defined
- [ ] Performance indexes added

---

#### File 2: Create `lib/database/rls.ts`
- [ ] Create RLS context setter
- [ ] `setRLSContext()` - Set org ID for session
- [ ] `withRLS()` - Wrapper for queries with RLS
- [ ] Import 'server-only'

**Implementation:**
```typescript
import 'server-only';
import { prisma } from './prisma';

export async function setRLSContext(
  userId: string,
  orgId: string
): Promise<void> {
  await prisma.$executeRaw`
    SELECT set_config('app.current_user_id', ${userId}, true);
  `;
  await prisma.$executeRaw`
    SELECT set_config('app.current_org_id', ${orgId}, true);
  `;
}

export async function withRLS<T>(
  userId: string,
  orgId: string,
  callback: () => Promise<T>
): Promise<T> {
  await setRLSContext(userId, orgId);
  return callback();
}
```

**Success Criteria:**
- [ ] RLS context functions work
- [ ] Server-only protected
- [ ] Type-safe wrapper
- [ ] Easy to use in Server Actions

---

### Phase 3: Rate Limiting (45 minutes)

**Directory:** `lib/security/`

#### File 1: Create `lib/security/rate-limit.ts`
- [ ] Create rate limiter using Upstash Redis
- [ ] Configure different limits per route type
- [ ] IP-based and user-based limiting
- [ ] Sliding window algorithm
- [ ] Return limit info in headers

**Implementation:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limiters for different routes
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  prefix: 'ratelimit:auth',
});

export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  prefix: 'ratelimit:api',
});

export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 AI requests per minute
  prefix: 'ratelimit:ai',
});

// Helper to check rate limit
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = apiLimiter
) {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}
```

**Success Criteria:**
- [ ] Upstash Redis configured
- [ ] Multiple rate limiters defined
- [ ] Sliding window algorithm
- [ ] Headers included in response

---

#### File 2: Update `middleware.ts` with Rate Limiting
- [ ] Read existing middleware
- [ ] Add rate limiting checks
- [ ] Different limits for different routes
- [ ] Return 429 when exceeded
- [ ] Add rate limit headers

**Add to middleware:**
```typescript
import { checkRateLimit, authLimiter, apiLimiter } from '@/lib/security/rate-limit';

// In middleware function
const identifier = request.ip ?? 'anonymous';

if (request.nextUrl.pathname.startsWith('/api/auth')) {
  const { success, headers } = await checkRateLimit(identifier, authLimiter);
  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers,
    });
  }
  // Add headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}
```

**Success Criteria:**
- [ ] Rate limiting enforced
- [ ] 429 returned when exceeded
- [ ] Headers in response
- [ ] Different limits per route

---

### Phase 4: Security Checklist Implementation (30 minutes)

**Directory:** `lib/security/`

#### File 1: Create `lib/security/input-validation.ts`
- [ ] Common validation functions
- [ ] Sanitize HTML input
- [ ] Validate file uploads
- [ ] Check file types/sizes
- [ ] URL validation

**Implementation:**
```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML to prevent XSS
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

// File upload validation
export const FileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  type: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
  ]),
});

// Safe URL validation
export const SafeUrlSchema = z.string().url().refine(
  (url) => {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  },
  { message: 'Only HTTP(S) URLs allowed' }
);
```

**Success Criteria:**
- [ ] HTML sanitization works
- [ ] File validation enforced
- [ ] URL validation secure
- [ ] XSS prevention

---

#### File 2: Create `lib/security/csrf.ts`
- [ ] CSRF token generation
- [ ] Token validation
- [ ] Integration with Server Actions
- [ ] Cookie-based tokens

**Note:** Next.js Server Actions have built-in CSRF protection, but add extra layer for API routes:

```typescript
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  cookies().set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
  });
  return token;
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieToken = cookies().get('csrf-token')?.value;
  return token === cookieToken;
}
```

**Success Criteria:**
- [ ] Token generation works
- [ ] Validation enforces security
- [ ] Cookies configured securely

---

### Phase 5: Performance Optimization (45 minutes)

**Directory:** `lib/` and `next.config.mjs`

#### File 1: Update `next.config.mjs`
- [ ] Enable bundle analyzer (optional)
- [ ] Configure image optimization
- [ ] Add compression
- [ ] Enable experimental features if needed
- [ ] Production optimizations

**Implementation:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  // Experimental features
  experimental: {
    optimizePackageImports: ['@mantine/core', 'lucide-react'],
  },
};

export default nextConfig;
```

**Success Criteria:**
- [ ] Bundle analyzer configured
- [ ] Image optimization enabled
- [ ] Compression on
- [ ] Production ready

---

#### File 2: Create `lib/performance/dynamic-imports.ts`
- [ ] Helper for dynamic imports
- [ ] Loading components
- [ ] Error boundaries
- [ ] Suspense wrappers

**Implementation:**
```typescript
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Helper for dynamic imports with loading
export function createDynamicComponent<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: React.ReactNode
) {
  return dynamic(importFn, {
    loading: () => loadingComponent || <Skeleton className="h-full w-full" />,
    ssr: false,
  });
}

// Commonly used dynamic components
export const DynamicChart = createDynamicComponent(
  () => import('@/components/charts/chart'),
  <Skeleton className="h-[400px] w-full" />
);

export const DynamicEditor = createDynamicComponent(
  () => import('@/components/editor/rich-text-editor'),
  <Skeleton className="h-[500px] w-full" />
);
```

**Success Criteria:**
- [ ] Dynamic import helpers
- [ ] Loading states
- [ ] Type-safe
- [ ] Easy to use

---

#### File 3: Create `lib/performance/cache.ts`
- [ ] Cache utilities for React Query
- [ ] Server-side caching helpers
- [ ] Revalidation strategies

**Implementation:**
```typescript
import { unstable_cache } from 'next/cache';

// Cache wrapper for expensive queries
export function createCachedQuery<T>(
  fn: () => Promise<T>,
  keys: string[],
  revalidate: number = 60 // seconds
) {
  return unstable_cache(fn, keys, {
    revalidate,
    tags: keys,
  });
}

// React Query defaults
export const queryDefaults = {
  queries: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  },
};
```

**Success Criteria:**
- [ ] Cache utilities created
- [ ] Revalidation configured
- [ ] Query defaults optimized

---

### Phase 6: Testing & Verification (30 minutes)

#### File 1: `__tests__/lib/security/rate-limit.test.ts`
- [ ] Test rate limiter enforces limits
- [ ] Test sliding window works
- [ ] Test different limiters
- [ ] Mock Redis

**Coverage Target:** 80%+

---

#### File 2: `__tests__/lib/security/input-validation.test.ts`
- [ ] Test HTML sanitization
- [ ] Test file validation
- [ ] Test URL validation
- [ ] Test XSS prevention

**Coverage Target:** 90%+

---

#### File 3: Security Audit Checklist
- [ ] Run security audit: `npm audit`
- [ ] Check for vulnerable dependencies
- [ ] Fix high/critical issues
- [ ] Update packages if needed
- [ ] Document any exceptions

---

## 📊 Files to Create/Update

### Environment & Validation (1 file)
```
lib/
└── env.ts                  # ✅ Create (env validation)
```

### Database Security (2 files)
```
prisma/migrations/
└── [timestamp]_add_rls_policies/
    └── migration.sql       # ✅ Create (RLS policies)

lib/database/
└── rls.ts                  # ✅ Create (RLS helpers)
```

### Security Infrastructure (4 files)
```
lib/security/
├── rate-limit.ts          # ✅ Create (rate limiting)
├── input-validation.ts    # ✅ Create (sanitization)
├── csrf.ts                # ✅ Create (CSRF tokens)
└── index.ts               # ✅ Create (exports)
```

### Performance (3 files)
```
lib/performance/
├── dynamic-imports.ts     # ✅ Create (lazy loading)
├── cache.ts               # ✅ Create (caching utils)
└── index.ts               # ✅ Create (exports)
```

### Configuration (2 files)
```
next.config.mjs            # 🔄 Update (optimization)
middleware.ts              # 🔄 Update (rate limiting)
```

### Tests (3 files)
```
__tests__/lib/security/
├── rate-limit.test.ts
├── input-validation.test.ts
└── rls.test.ts
```

**Total:** 15 files (13 new, 2 updates)

---

## 🎯 Success Criteria

**MANDATORY:**
- [ ] Environment validation enforced
- [ ] RLS policies enabled and working
- [ ] Rate limiting functional
- [ ] XSS prevention implemented
- [ ] CSRF protection verified
- [ ] Input sanitization works
- [ ] Performance optimizations applied
- [ ] Bundle analyzer configured
- [ ] Dynamic imports for heavy components
- [ ] Security audit passed
- [ ] No high/critical vulnerabilities
- [ ] TypeScript compiles: 0 errors
- [ ] Linter passes: 0 warnings
- [ ] Test coverage ≥ 80%

**Performance Targets:**
- [ ] Initial bundle < 500kb
- [ ] Route chunks < 100kb
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms

---

## 🔗 Integration Points

### With Auth System
```typescript
// RLS uses auth context
import { getCurrentUser } from '@/lib/auth/server';
import { setRLSContext } from '@/lib/database/rls';

const user = await getCurrentUser();
await setRLSContext(user.id, user.organizationId);
```

### With Middleware
```typescript
// Rate limiting in middleware
import { checkRateLimit } from '@/lib/security/rate-limit';

const { success } = await checkRateLimit(identifier);
if (!success) return new Response('429', { status: 429 });
```

### With Server Actions
```typescript
'use server';
import { sanitizeHtml } from '@/lib/security/input-validation';

export async function createPost(content: string) {
  const clean = sanitizeHtml(content);
  // ... save clean content
}
```

---

## 📝 Implementation Notes

### RLS Performance
```
RLS adds ~10-50ms overhead per query
Mitigate with:
- Proper indexes on organizationId
- Connection pooling
- Query optimization
- Caching frequently accessed data
```

### Rate Limiting Strategy
```
Auth routes:   5 req/min   (prevent brute force)
API routes:    100 req/min (general usage)
AI routes:     20 req/min  (expensive operations)
File uploads:  10 req/min  (prevent abuse)
```

### Security Headers
```typescript
// Add to middleware
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-XSS-Protection', '1; mode=block');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
```

---

## 🚀 Quick Start Commands

```bash
# Install security dependencies
npm install @upstash/ratelimit @upstash/redis isomorphic-dompurify

# Install dev dependencies
npm install -D @next/bundle-analyzer

# Run security audit
npm audit
npm audit fix

# Analyze bundle
ANALYZE=true npm run build

# Run performance tests
npm run build
npm run start
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ **Session 1:** Database connection, env vars
- ✅ **Session 2:** Auth system for RLS context
- ✅ Supabase configured
- ✅ Prisma schema

**Blocks (must complete before):**
- **SESSION6** (Deployment) - Security must be ready

**Can run parallel with:**
- ✅ **SESSION5** (Testing) - Independent work

**Enables:**
- Production-ready security
- Scalable performance
- Protected against common attacks
- Optimized user experience

---

## 📖 Reference Files

**Must read before starting:**
- `.env.local` - Environment variables
- `prisma/schema.prisma` - Database models
- `middleware.ts` - Current middleware
- `next.config.mjs` - Next.js config

**Documentation:**
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Upstash Rate Limiting](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)

---

## ⚠️ Security Critical

**NEVER:**
- ❌ Skip environment validation
- ❌ Disable RLS in production
- ❌ Remove rate limiting
- ❌ Trust user input without sanitization
- ❌ Expose service role keys
- ❌ Use dangerouslySetInnerHTML without sanitization

**ALWAYS:**
- ✅ Validate environment at startup
- ✅ Enable RLS on all multi-tenant tables
- ✅ Rate limit authentication endpoints
- ✅ Sanitize HTML inputs
- ✅ Use prepared statements (Prisma does this)
- ✅ Implement CSRF protection on forms

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 CRITICAL - Production security requirements
