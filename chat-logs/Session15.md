# Session 15 - Pre-Production Fixes

**Goal:** Fix linting errors, add rate limiting, deploy to staging
**Duration:** 6-8 hours
**Starting:** Phase 4 complete, security audit 98/100

---

## Session 14 Findings

**Security:** 98/100 - Missing rate limiting only
**Build:** Successful but 38 ESLint errors
**Issues:**
- 38 `any` type errors across 20 files
- 25+ functions exceed 50 lines
- Rate limiting missing on auth endpoints
- 20+ unused variables

---

## Session 15 Tasks

### 1. Fix ESLint Errors (2-3 hours)

**Replace `any` Types:**
```typescript
// Priority files (38 total instances):
lib/modules/crm/actions.ts (2)
lib/modules/crm/queries.ts (2)
lib/export/csv.ts (5)
app/(platform)/crm/page.tsx (2)
app/(platform)/projects/[projectId]/page.tsx (4)
```

**Strategy:**
1. Create `lib/types/` for reusable types
2. Fix server-side files first (lib/*)
3. Fix page components
4. Remove unused imports/variables

**Types to Create:**
- `lib/types/crm.ts` - CustomerData interface
- `lib/types/projects.ts` - ProjectData interface
- `lib/types/csv.ts` - CSVRow interface

---

### 2. Add Rate Limiting (1 hour)

**Install:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Create:** `lib/rate-limit.ts`
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

**Modify:**
- `lib/auth/auth-helpers.ts` - Add rate limiting to signIn()
- `middleware.ts` - Add rate limiting to /api/auth/* routes

**Test:** Verify 429 response after 10 failed login attempts

---

### 3. Refactor Large Functions (2-3 hours)

**Priority Refactors:**

**LoginPage** (324 lines → 80 lines)
- Extract → `components/features/auth/login-form.tsx`
- Extract → `components/features/auth/signup-form.tsx`

**ProjectDetailPage** (319 lines → 150 lines)
- Extract → `components/features/projects/project-header.tsx`
- Extract → `components/features/projects/project-tasks.tsx`

**DashboardPage** (230 lines → 100 lines)
- Extract → `components/features/dashboard/dashboard-stats.tsx`

**Target:** All functions < 200 lines (pages can be up to 250)

---

### 4. Deploy to Staging (1-2 hours)

**Vercel Setup:**
1. Create project, connect GitHub
2. Set root directory: `app/`
3. Add environment variables (from Session 14 docs)
4. Include: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

**Deploy:**
```bash
git push origin main  # Auto-deploy via Vercel
```

**Test:**
- Login/signup works
- Rate limiting functional
- All CRUD operations
- Multi-tenancy isolation
- File uploads
- Performance: Lighthouse > 90

---

## Implementation Order

**Phase 1:** Fix types (1.5 hours)
**Phase 2:** Add rate limiting (1 hour)
**Phase 3:** Refactor functions (2 hours)
**Phase 4:** Deploy & test (1.5 hours)

**Total:** 6-8 hours

---

## Success Criteria

- [ ] Zero ESLint errors
- [ ] Zero `any` types in production code
- [ ] Rate limiting working (security = 100/100)
- [ ] Functions < 200 lines
- [ ] Staging deployed
- [ ] All features tested on staging
- [ ] Lighthouse score > 90

---

## Files to Create

1. `lib/rate-limit.ts` - Rate limiting utility
2. `lib/types/crm.ts` - CRM types
3. `lib/types/projects.ts` - Project types
4. `components/features/auth/login-form.tsx` - Extracted login
5. `components/features/auth/signup-form.tsx` - Extracted signup
6. `components/features/projects/project-header.tsx` - Extracted header
7. `components/features/projects/project-tasks.tsx` - Extracted tasks

**~10 new files, ~30 files modified**

---

## Next Session (16)

**Focus:** Production deployment
**Tasks:**
- Fix staging issues
- Add monitoring (Sentry)
- Deploy to app.strivetech.ai
- Production testing

---

## Quick Reference

**Session 14 Summary:** `chat-logs/Session14_Summary.md`

**Commands:**
```bash
npm run dev              # Dev server
npm run build            # Check for errors
npm run lint:fix         # Auto-fix linting
ANALYZE=true npm run build  # Bundle analysis
```

**Environment needed:**
```bash
# Add for rate limiting
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```
