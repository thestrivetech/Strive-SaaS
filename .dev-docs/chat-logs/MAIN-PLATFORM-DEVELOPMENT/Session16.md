# Session 16 - Component Refactoring & Staging Deploy

**Goal:** Reduce function sizes, apply rate limiting, deploy to staging
**Starting Point:** Phase 3 - 92% Complete
**Estimated Duration:** 4-5 hours

---

## Current Status (From Session 15)

### ✅ Already Completed
- ✅ Type safety infrastructure (4 type definition files)
- ✅ Rate limiting module created (`lib/rate-limit.ts`)
- ✅ Platform `any` types eliminated (38 → 0)
- ✅ Code quality improvements (auto-fixes, entity escapes)
- ✅ ESLint: 474 problems (down from 497)
- ✅ Security infrastructure ready for integration

### 🔧 Carry-Over Tasks from Session 15
1. **Component extraction** - 5 large files need refactoring
2. **Rate limiting integration** - Module ready, needs application
3. **Staging deployment** - Infrastructure ready, needs setup

---

## Session 16 Primary Objectives

### Priority 1: Component Extraction (2-3 hours)

**Goal:** All functions <50 lines to pass ESLint `max-lines-per-function` rule

#### 1. Extract LoginPage Components (60 min)

**Current State:**
- File: `app/(platform)/login/page.tsx`
- Lines: 324
- Issue: Monolithic page with login + signup logic
- ESLint: max-lines-per-function warning

**Target Structure:**
```
components/features/auth/
├── login-form.tsx      (~80 lines) - Client component
├── signup-form.tsx     (~120 lines) - Client component
└── (page stays minimal ~40 lines)
```

**Implementation Plan:**

**Step 1: Create `components/features/auth/login-form.tsx`**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/auth/schemas';

interface LoginFormProps {
  onSuccess: (redirectTo: string) => void;
  onError: (error: string) => void;
  redirectTo: string;
}

export function LoginForm({ onSuccess, onError, redirectTo }: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to login');
      }

      onSuccess(redirectTo);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Invalid credentials');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

**Why Client Component:**
- Uses useState (form state)
- Uses useForm hook
- Has event handlers (onSubmit)

**Step 2: Create `components/features/auth/signup-form.tsx`**
```typescript
'use client';

// Similar structure to login-form
// ~120 lines including form fields
// Password confirmation validation
// Client component (form handling)
```

**Step 3: Refactor `app/(platform)/login/page.tsx`**
```typescript
'use client';

import { LoginForm } from '@/components/features/auth/login-form';
import { SignupForm } from '@/components/features/auth/signup-form';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm {...props} />
      </TabsContent>
      <TabsContent value="signup">
        <SignupForm {...props} />
      </TabsContent>
    </Tabs>
  );
}
```

**Expected Outcome:**
- LoginPage: 324 → ~40 lines ✅
- 2 new reusable form components
- Better separation of concerns

---

#### 2. Extract ProjectDetailPage Components (60 min)

**Current State:**
- File: `app/(platform)/projects/[projectId]/page.tsx`
- Lines: 319
- Issue: Mixed data fetching + UI rendering
- ESLint: max-lines-per-function warning

**Target Structure:**
```
components/features/projects/
├── project-header.tsx           (~100 lines) - Server component
├── project-tasks-section.tsx    (~120 lines) - Server component
└── (page stays ~100 lines with data fetching)
```

**Implementation Plan:**

**Step 1: Create `components/features/projects/project-header.tsx`**
```typescript
// Server component (no 'use client')
import { EditProjectDialog } from './edit-project-dialog';
import { DeleteProjectDialog } from './delete-project-dialog';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header with title, back button */}
      {/* Project info card */}
      {/* Status, priority, budget display */}
      {/* Edit/Delete buttons */}
    </div>
  );
}
```

**Why Server Component:**
- Pure display logic
- No client-side state
- No event handlers (dialogs handle their own)
- Better performance (no JS to client)

**Step 2: Create `components/features/projects/project-tasks-section.tsx`**
```typescript
// Server component
import { TaskList } from '@/components/features/tasks/task-list';
import { CreateTaskDialog } from '@/components/features/tasks/create-task-dialog';

interface ProjectTasksSectionProps {
  tasks: Task[];
  projectId: string;
  teamMembers: TeamMember[];
}

export function ProjectTasksSection({ tasks, projectId, teamMembers }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Tasks</CardTitle>
          <CreateTaskDialog projectId={projectId} teamMembers={teamMembers} />
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <TaskList tasks={tasks} {...props} />
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 3: Refactor `app/(platform)/projects/[projectId]/page.tsx`**
```typescript
// Server component (async)
export default async function ProjectDetailPage({ params }: Props) {
  // Data fetching (stays here)
  const [project, tasks, orgMembers, attachments] = await Promise.all([...]);

  // Data transformations
  const teamMembers = transformMembers(orgMembers);
  const progress = calculateProgress(project.tasks);

  // Component composition
  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      <ProjectTasksSection tasks={tasks} projectId={project.id} teamMembers={teamMembers} />
      {/* Attachments section */}
      {/* Activity timeline */}
    </div>
  );
}
```

**Expected Outcome:**
- ProjectDetailPage: 319 → ~100 lines ✅
- 2 new reusable display components
- Cleaner data flow (fetch → transform → display)

---

#### 3. Extract DashboardPage Components (30 min)

**Current State:**
- File: `app/(platform)/dashboard/page.tsx`
- Lines: 230
- Issue: Stats cards + widgets in one file
- ESLint: max-lines-per-function warning

**Target Structure:**
```
components/features/dashboard/
├── dashboard-stats-grid.tsx     (~80 lines) - Server component
└── (page stays ~80 lines)
```

**Implementation Plan:**

**Step 1: Create `components/features/dashboard/dashboard-stats-grid.tsx`**
```typescript
// Server component
interface DashboardStatsGridProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    totalCustomers: number;
    activeCustomers: number;
  };
}

export function DashboardStatsGrid({ stats }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeProjects} active
          </p>
        </CardContent>
      </Card>
      {/* Similar cards for tasks, customers, etc. */}
    </div>
  );
}
```

**Step 2: Refactor `app/(platform)/dashboard/page.tsx`**
```typescript
// Server component (async)
export default async function DashboardPage() {
  // Fetch data
  const stats = await getDashboardStats(organizationId);
  const recentActivity = await getRecentActivity(organizationId);

  return (
    <div className="space-y-6">
      <DashboardStatsGrid stats={stats} />
      <RecentActivityFeed activity={recentActivity} />
      {/* Other widgets */}
    </div>
  );
}
```

**Expected Outcome:**
- DashboardPage: 230 → ~80 lines ✅
- Reusable stats grid component
- Easier to test and maintain

---

#### Optional: Additional Extractions (if time permits)

**SettingsPage (320 lines):**
- Extract → `settings-tabs.tsx` (~200 lines)
- Page → ~80 lines

**ToolsPage (248 lines):**
- Extract → `tools-grid.tsx` (~150 lines)
- Page → ~60 lines

**Priority:** Lower (can be done in Session 17 if needed)

---

### Priority 2: Rate Limiting Integration (30-45 min)

**Goal:** Apply rate limiting to protect auth endpoints

#### 1. Update Auth Helpers (20 min)

**File:** `lib/auth/auth-helpers.ts`

**Changes to Make:**
```typescript
import { authRateLimit, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function signIn(
  email: string,
  password: string,
  request: Request
) {
  // Rate limit check
  const identifier = getClientIdentifier(request);
  const { success, remaining, reset } = await checkRateLimit(identifier, authRateLimit);

  if (!success) {
    throw new Error(
      `Too many login attempts. Please try again at ${reset.toLocaleTimeString()}`
    );
  }

  // Existing login logic...
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log failed attempt for monitoring
    console.warn(`Failed login attempt for ${email} from ${identifier}. ${remaining} attempts remaining.`);
    throw error;
  }

  return data;
}

export async function signUp(
  email: string,
  password: string,
  metadata: object,
  request: Request
) {
  // Rate limit check
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(identifier, authRateLimit);

  if (!success) {
    throw new Error('Too many signup attempts. Please try again later.');
  }

  // Existing signup logic...
}
```

**Testing:**
1. Test normal login (should work)
2. Test 10 failed logins (should get rate limited)
3. Test rate limit message shows reset time
4. Wait 10 seconds, verify can login again

---

#### 2. Update Middleware (15 min)

**File:** `middleware.ts`

**Changes to Make:**
```typescript
import { authRateLimit, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Rate limit auth endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    const identifier = getClientIdentifier(request);
    const { success, remaining, reset } = await checkRateLimit(identifier, authRateLimit);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((reset.getTime() - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((reset.getTime() - Date.now()) / 1000)),
            'X-RateLimit-Remaining': String(remaining),
          }
        }
      );
    }
  }

  // Existing middleware logic...
}
```

**Why This Approach:**
- Protects all auth routes automatically
- Returns proper 429 status code
- Includes retry headers for clients
- Works with API routes and Server Actions

---

#### 3. Environment Setup (5 min)

**Add to `.env.local`:**
```bash
# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

**Document in `.env.local.example`:**
```bash
# Rate Limiting (Optional - development mode bypasses if not set)
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

**Get Credentials:**
1. Create free account at https://upstash.com
2. Create Redis database
3. Copy REST URL and TOKEN from dashboard
4. Add to `.env.local`

---

#### 4. Testing Checklist

**Manual Tests:**
- [ ] Normal login works (no rate limit)
- [ ] 10 failed logins trigger rate limit
- [ ] 11th attempt returns 429 status
- [ ] Error message shows retry time
- [ ] After 10 seconds, can login again
- [ ] Signup also rate limited
- [ ] Different IPs get separate limits

**Automated Test (optional):**
```typescript
// Test rate limiting
describe('Rate Limiting', () => {
  it('blocks after 10 failed attempts', async () => {
    for (let i = 0; i < 10; i++) {
      await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
      });
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
    });

    expect(response.status).toBe(429);
  });
});
```

---

### Priority 3: Staging Deployment (1-2 hours)

**Goal:** App running on Vercel with all features tested

#### 1. Pre-Deployment Verification (15 min)

**Run all checks:**
```bash
# 1. Lint check
npm run lint
# Acceptable: <200 problems after component extraction

# 2. Type check
npm run type-check
# Acceptable: Platform code has zero errors

# 3. Build
npm run build
# Must succeed with zero errors

# 4. Test locally
npm run start
# Verify app works in production mode
```

**Checklist:**
- [ ] Build succeeds
- [ ] No critical TypeScript errors
- [ ] ESLint warnings acceptable (<200)
- [ ] App runs in production mode locally
- [ ] No runtime errors in console

**If build fails:**
1. Check error messages
2. Fix blocking issues
3. Re-run build
4. Don't deploy until build passes

---

#### 2. Vercel Project Setup (30 min)

**Steps:**

**1. Create Vercel Account/Project:**
- Go to https://vercel.com
- Click "Import Project"
- Connect GitHub repository
- Select `Strive-SaaS` repo

**2. Configure Project:**
```yaml
Framework Preset: Next.js
Root Directory: app/
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**3. Environment Variables:**

**Click "Environment Variables" and add:**

**Database:**
```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

**Supabase:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**AI Providers:**
```bash
OPENROUTER_API_KEY=...
GROQ_API_KEY=...
```

**Rate Limiting (new):**
```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**App Config:**
```bash
NEXT_PUBLIC_APP_URL=https://your-staging-url.vercel.app
NODE_ENV=production
```

**Important:**
- Copy values exactly from local `.env.local`
- Add to "Production" environment in Vercel
- Don't commit `.env` files to git

---

#### 3. Deploy (10 min)

**Option A: Auto-deploy from Git**
```bash
git add .
git commit -m "Session 16: Component extraction + rate limiting + staging"
git push origin main
# Vercel auto-deploys
```

**Option B: Manual deploy**
```bash
npx vercel --prod
```

**Monitor Deployment:**
- Watch build logs in Vercel dashboard
- Check for errors
- Wait for "Deployment Ready" status
- Note the staging URL

---

#### 4. End-to-End Testing (30 min)

**Test all features on staging URL:**

**Authentication:**
- [ ] Signup works
- [ ] Email verification (if enabled)
- [ ] Login works
- [ ] Rate limiting works (10 failed attempts)
- [ ] Logout works

**CRM:**
- [ ] Customer list loads
- [ ] Create customer works
- [ ] Edit customer works
- [ ] Delete customer works
- [ ] Filters work
- [ ] Export to CSV works

**Projects:**
- [ ] Project list loads
- [ ] Create project works
- [ ] Project detail page loads
- [ ] Tasks display correctly
- [ ] Create task works
- [ ] File attachments work (Supabase Storage)

**Dashboard:**
- [ ] Stats display correctly
- [ ] Recent activity shows
- [ ] Navigation works

**Settings:**
- [ ] Profile page works
- [ ] Team management works
- [ ] Organization settings work

**Multi-tenancy:**
- [ ] Different users see different data
- [ ] Organization isolation enforced
- [ ] No cross-tenant data leaks

**Error Handling:**
- [ ] 404 pages work
- [ ] Error boundaries catch errors
- [ ] Toast notifications appear correctly

---

#### 5. Lighthouse Audit (15 min)

**Run audit on staging URL:**

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Desktop" mode
4. Check all categories
5. Click "Analyze page load"

**Target Scores:**
- ✅ Performance: >90
- ✅ Accessibility: >90
- ✅ Best Practices: >90
- ✅ SEO: >90

**If scores <80, investigate:**

**Performance issues:**
- Large bundle size
- Unoptimized images
- Blocking scripts
- Slow server response

**Accessibility issues:**
- Missing alt text
- Low contrast
- Missing labels
- Keyboard navigation

**Best practices issues:**
- Console errors
- Deprecated APIs
- Insecure content
- Missing security headers

**Quick Fixes (if needed):**
1. Add missing alt text to images
2. Optimize large images (compress, WebP)
3. Add security headers in `next.config.js`
4. Fix console errors

**Document issues:**
- Create list of non-critical issues
- Defer to Session 17 if not blocking
- Focus on critical performance problems

---

## Technical Tasks Summary

### Files to Create (7-10)
- `components/features/auth/login-form.tsx`
- `components/features/auth/signup-form.tsx`
- `components/features/projects/project-header.tsx`
- `components/features/projects/project-tasks-section.tsx`
- `components/features/dashboard/dashboard-stats-grid.tsx`
- (Optional) `components/features/settings/settings-tabs.tsx`
- (Optional) `components/features/tools/tools-grid.tsx`

### Files to Modify (5-8)
- `app/(platform)/login/page.tsx` - Refactor to use extracted forms
- `app/(platform)/projects/[projectId]/page.tsx` - Refactor to use extracted components
- `app/(platform)/dashboard/page.tsx` - Refactor to use stats grid
- `lib/auth/auth-helpers.ts` - Add rate limiting
- `middleware.ts` - Add rate limiting to auth routes
- `.env.local` - Add Upstash credentials
- `.env.local.example` - Document new env vars
- (Optional) `app/(platform)/settings/page.tsx`

### Environment Variables to Add (2)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Deployment Tasks (5)
1. Pre-deployment verification
2. Vercel project setup
3. Environment variable configuration
4. Git push / deploy
5. End-to-end testing

---

## Testing Strategy

### Component Extraction Tests

**Login Forms:**
- [ ] Login form renders
- [ ] Form validation works
- [ ] Submit calls API correctly
- [ ] Error handling works
- [ ] Success redirects user

**Project Components:**
- [ ] Header displays all project data
- [ ] Tasks section shows tasks correctly
- [ ] Edit/Delete dialogs work
- [ ] Create task dialog works

**Dashboard:**
- [ ] Stats grid calculates correctly
- [ ] Cards display proper data
- [ ] Navigation links work

### Rate Limiting Tests

**Auth Protection:**
- [ ] Normal login allowed
- [ ] 10 failed attempts trigger block
- [ ] 11th attempt returns 429
- [ ] Error message is clear
- [ ] Rate limit resets after timeout
- [ ] Different users get separate limits

**Edge Cases:**
- [ ] Development mode bypasses (no Redis)
- [ ] Redis failure doesn't block (fails open)
- [ ] IP extraction works on Vercel
- [ ] Headers set correctly in response

### Deployment Tests

**Build & Deploy:**
- [ ] Build succeeds locally
- [ ] Vercel build succeeds
- [ ] No environment variable errors
- [ ] App starts successfully

**Functionality:**
- [ ] All CRUD operations work
- [ ] File uploads work
- [ ] Multi-tenancy enforced
- [ ] Rate limiting functional
- [ ] No console errors

**Performance:**
- [ ] Lighthouse score >80
- [ ] Page load <3s
- [ ] No layout shifts
- [ ] Images optimized

---

## Success Criteria

### Must Complete ✅

**Component Extraction:**
- [ ] All page components <100 lines
- [ ] All functions <50 lines
- [ ] ESLint max-lines-per-function passes
- [ ] Components are reusable and well-organized

**Rate Limiting:**
- [ ] Auth endpoints protected
- [ ] 10 req/10s limit enforced
- [ ] 429 response on limit exceeded
- [ ] Clear error messages to users
- [ ] Works in production environment

**Staging Deployment:**
- [ ] App deployed to Vercel
- [ ] All environment variables configured
- [ ] All features tested and working
- [ ] No critical errors
- [ ] Lighthouse score >80

**Documentation:**
- [ ] Environment variables documented
- [ ] Known issues documented
- [ ] Session 17 plan created

### Stretch Goals 🎯

**Additional Extractions:**
- [ ] SettingsPage extracted
- [ ] ToolsPage extracted
- [ ] All components <50 lines

**Performance:**
- [ ] Lighthouse score >90 on all metrics
- [ ] Bundle size <500kb
- [ ] First load <2s

**Additional Security:**
- [ ] Rate limiting on API routes
- [ ] Sentry error tracking setup
- [ ] Security headers configured

**Testing:**
- [ ] Unit tests for new components
- [ ] Integration tests for rate limiting
- [ ] E2E test for critical flows

---

## Implementation Order (Recommended)

### Phase 1: Component Extraction (2.5 hours)

**Hour 1: Login Components**
1. Create `login-form.tsx` (30 min)
2. Create `signup-form.tsx` (30 min)

**Hour 2: Project Components**
1. Create `project-header.tsx` (30 min)
2. Create `project-tasks-section.tsx` (30 min)

**Hour 2.5: Dashboard + Optional**
1. Create `dashboard-stats-grid.tsx` (20 min)
2. Refactor all page files (20 min)
3. Test all extractions (20 min)
4. (Optional) Settings/Tools extraction (30 min)

### Phase 2: Rate Limiting (45 min)

**Step 1: Setup (10 min)**
- Create Upstash account
- Get Redis credentials
- Add to `.env.local`

**Step 2: Integration (20 min)**
- Update `auth-helpers.ts`
- Update `middleware.ts`
- Update env example

**Step 3: Testing (15 min)**
- Test failed login flow
- Verify 429 response
- Test rate limit reset
- Document behavior

### Phase 3: Deployment (1.5 hours)

**Step 1: Pre-Deploy (15 min)**
- Run lint
- Run type-check
- Run build
- Test locally

**Step 2: Vercel Setup (30 min)**
- Create project
- Configure settings
- Add environment variables

**Step 3: Deploy & Test (30 min)**
- Push to Git
- Monitor build
- End-to-end testing

**Step 4: Lighthouse (15 min)**
- Run audit
- Document issues
- Quick fixes if needed

**Total:** 4-5 hours

---

## Known Blockers & Mitigations

### Potential Issue 1: Build Fails on Vercel

**Symptoms:**
- Build succeeds locally but fails on Vercel
- TypeScript errors in production build
- Missing dependencies

**Mitigation:**
1. Run `npm run build` locally first
2. Check for environment-specific errors
3. Ensure all dependencies in package.json
4. Verify Node version matches (18.x)

**Quick Fix:**
```bash
# If build fails, check logs
# Common issues:
# - Missing env vars
# - TypeScript strict mode
# - Import path issues
```

---

### Potential Issue 2: Rate Limiting Not Working

**Symptoms:**
- No rate limiting in production
- Redis connection errors
- Environment variables not loaded

**Mitigation:**
1. Verify Upstash env vars in Vercel
2. Test Redis connection separately
3. Check Vercel logs for errors
4. Ensure graceful degradation works

**Quick Fix:**
```typescript
// Add debug logging
console.log('Rate limit check:', {
  identifier,
  success,
  remaining,
  hasRedis: !!redis,
});
```

---

### Potential Issue 3: Lighthouse Score <80

**Symptoms:**
- Poor performance score
- Large bundle size
- Slow page load

**Mitigation:**
1. Check bundle size with analyzer
2. Optimize images (WebP, compression)
3. Code split heavy components
4. Defer non-critical scripts

**Quick Fix:**
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp'],
  },
  compress: true,
};
```

---

### Potential Issue 4: Component Extraction Breaks Functionality

**Symptoms:**
- Props not passed correctly
- Missing context
- State not shared

**Mitigation:**
1. Test each extraction immediately
2. Verify props interface matches
3. Check for missing imports
4. Use TypeScript to catch errors

**Quick Fix:**
```typescript
// Ensure proper prop typing
interface LoginFormProps {
  onSuccess: (redirect: string) => void;
  onError: (error: string) => void;
  redirectTo: string;
}
```

---

## Files to Reference

**From Session 15:**
- `lib/rate-limit.ts` - Rate limiting implementation
- `lib/types/filters.ts` - Type definitions
- `chat-logs/Session15_Summary.md` - Full context

**ESLint Config:**
- `eslint.config.mjs` - Function size limits (50 lines)

**Existing Components:**
- `components/features/auth/` - Auth dialogs
- `components/features/projects/` - Project components
- `components/features/tasks/` - Task components

---

## Next Session Preview (Session 17)

### Focus: Production Deployment + Final Polish

**Estimated Duration:** 3-4 hours

#### Tasks:
1. **Fix Staging Issues** (30 min)
   - Address any bugs found in Session 16
   - Fix Lighthouse issues <80
   - Resolve performance bottlenecks

2. **Production Deployment** (1 hour)
   - Deploy to app.strivetech.ai
   - Configure DNS settings
   - Setup SSL certificates
   - Production smoke testing

3. **Marketing Site Integration** (1 hour)
   - Update login flow
   - Add "Dashboard" link
   - Test auth flow end-to-end
   - Verify cookie sharing

4. **Final Security Audit** (30 min)
   - Review auth implementation
   - Check rate limiting
   - Verify multi-tenancy
   - Test error handling

5. **User Acceptance Testing** (30 min)
   - Test all major flows
   - Document known issues
   - Create user feedback form

---

## Conclusion

Session 16 focuses on three critical areas: component extraction for maintainability, rate limiting for security, and staging deployment for testing. By the end of this session, the app will be fully deployed to staging with all features tested and ready for production.

**Key Deliverables:**
- ✅ All functions <50 lines (ESLint compliant)
- ✅ Rate limiting protecting auth endpoints
- ✅ Staging environment fully functional
- ✅ Lighthouse score >80 (target >90)
- ✅ Complete documentation for Session 17

**Next Session:**
Session 17 will complete the production deployment, integrate with the marketing site, and conduct final testing before launch.

---

**Session 16 Status:** 📋 PLANNED
**Phase 3 Target:** 92% → 95%
**Next Session:** Session 17 - Production Deployment
