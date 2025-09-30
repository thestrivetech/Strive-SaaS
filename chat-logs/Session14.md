# Session 14 Tasks - Phase 4: Testing, Optimization & Deployment Prep

**Goal:** Complete E2E testing, performance optimization, security audit, and prepare for production deployment
**Starting Point:** Phase 3 - 100% Complete
**Estimated Duration:** 3-4 hours

---

## Current Status (From Session 13)

### ✅ Phase 3 Complete (100%)

**All SaaS Features Implemented:**
- ✅ **CRM System** - Full CRUD, search, filter, export, pagination
- ✅ **Project Management** - Full CRUD, 6 filters, file attachments, progress tracking
- ✅ **Task Management** - Full CRUD, 5 filters, bulk operations, real-time updates
- ✅ **File Attachments** - Upload, download, delete with multi-tenancy isolation
- ✅ **AI Chat Interface** - OpenRouter + Groq integration, 10 models, conversation history
- ✅ **Notifications System** - Create, read, delete, real-time delivery
- ✅ **Bulk Operations** - Select, update status, delete with loading states
- ✅ **Real-Time Updates** - Live task updates, notification delivery
- ✅ **Error Handling** - ErrorBoundary component for graceful error recovery

**Infrastructure Complete:**
- ✅ Prisma schema with 13 models
- ✅ Supabase authentication and database
- ✅ Supabase Storage bucket ("attachments")
- ✅ Server Actions for all mutations
- ✅ Module-based architecture
- ✅ Multi-tenancy enforcement at all layers

---

### 🔧 Phase 4 Priorities

**Focus Areas:**
1. Manual E2E testing of all features
2. Performance optimization and Lighthouse audit
3. Security audit and compliance check
4. Production environment configuration
5. Legacy marketing site fixes (stretch goal)

---

## Session 14 Primary Objectives

### Priority 1: Manual End-to-End Testing (60 min)

#### 1. CRM System Testing (15 min)
**Location:** `/crm`

**Test Scenarios:**
- [ ] **Create Customer**
  - Navigate to CRM page
  - Click "Add Customer" button
  - Fill in all required fields (name, email, company)
  - Select status (LEAD, PROSPECT, ACTIVE, CHURNED)
  - Select source (WEBSITE, REFERRAL, COLD_CALL, etc.)
  - Assign to team member
  - Add phone number
  - Submit form
  - **Expected:** Customer appears in list immediately

- [ ] **Edit Customer**
  - Click on customer from list
  - Click edit button
  - Modify fields (name, status, notes)
  - Save changes
  - **Expected:** Changes reflected immediately in list

- [ ] **Delete Customer**
  - Click delete button on customer
  - Confirm deletion in dialog
  - **Expected:** Customer removed from list

- [ ] **Search Customers**
  - Use search bar to search by name
  - Use search bar to search by email
  - Use search bar to search by company
  - **Expected:** Results filter in real-time

- [ ] **Filter Customers**
  - Filter by status (LEAD, ACTIVE, etc.)
  - Filter by source
  - Filter by assigned user
  - **Expected:** Only matching customers shown

- [ ] **Export to CSV**
  - Click export button
  - **Expected:** CSV file downloads with all customers

- [ ] **Pagination**
  - Create 20+ customers if needed
  - Navigate through pages
  - **Expected:** Smooth pagination, correct counts

**Success Criteria:** All operations work without errors, data persists correctly

---

#### 2. Project Management Testing (15 min)
**Location:** `/projects`

**Test Scenarios:**
- [ ] **Create Project**
  - Navigate to Projects page
  - Click "New Project" button
  - Fill in required fields (name, description)
  - Set status (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
  - Set priority (LOW, MEDIUM, HIGH, CRITICAL)
  - Select customer (if any)
  - Assign project manager
  - Set start date and due date
  - Set budget
  - Submit form
  - **Expected:** Project appears in list

- [ ] **Edit Project**
  - Click on project to view details
  - Click edit button
  - Modify fields (status, priority, dates)
  - Save changes
  - **Expected:** Changes reflected in project detail view

- [ ] **Delete Project**
  - Navigate to project detail page
  - Click delete button
  - Confirm deletion
  - **Expected:** Redirected to projects list, project removed

- [ ] **Filter Projects**
  - Filter by status
  - Filter by priority
  - Filter by customer
  - Filter by date range
  - **Expected:** Correct projects shown for each filter

- [ ] **View Project Progress**
  - Navigate to project with tasks
  - **Expected:** Progress bar shows correct percentage based on completed tasks

- [ ] **Export Projects**
  - Click export button on projects page
  - **Expected:** CSV file downloads with all projects

**Success Criteria:** All CRUD operations work, filters accurate, progress calculation correct

---

#### 3. Task Management Testing (15 min)
**Location:** `/projects/[projectId]` (task list within project)

**Test Scenarios:**
- [ ] **Create Task**
  - Navigate to project detail page
  - Click "New Task" button
  - Fill in task details (title, description)
  - Set status (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)
  - Set priority (LOW, MEDIUM, HIGH, CRITICAL)
  - Assign to team member
  - Set due date
  - Add estimated hours
  - Add tags
  - Submit form
  - **Expected:** Task appears in task list

- [ ] **Edit Task**
  - Click edit button on task
  - Modify fields (status, priority, assignee)
  - Save changes
  - **Expected:** Changes reflected in task card

- [ ] **Delete Task**
  - Click delete button on task
  - Confirm deletion
  - **Expected:** Task removed from list

- [ ] **Change Task Status**
  - Drag task to different status column (if using kanban view)
  - Or use status dropdown
  - **Expected:** Task moves to new status, project progress updates

- [ ] **Bulk Select Tasks**
  - Check checkbox on multiple tasks
  - **Expected:** Selection counter shows count, bulk actions button appears

- [ ] **Bulk Update Status**
  - Select multiple tasks
  - Click "Bulk Actions" → "Update Status"
  - Select new status
  - Confirm
  - **Expected:** All selected tasks update status, loading spinner shows during operation

- [ ] **Bulk Delete Tasks**
  - Select multiple tasks
  - Click "Bulk Actions" → "Delete"
  - Confirm deletion
  - **Expected:** All selected tasks deleted

- [ ] **Real-Time Task Updates** (Critical!)
  - Open project in two browser windows (or incognito)
  - Create/edit/delete task in window 1
  - **Expected:** Window 2 updates automatically without refresh
  - Check connection indicator (green dot = connected)

- [ ] **Filter Tasks**
  - Filter by status
  - Filter by priority
  - Filter by assignee
  - Filter by tags
  - **Expected:** Correct tasks shown for each filter

**Success Criteria:** All CRUD operations work, bulk operations functional, real-time sync confirmed

---

#### 4. File Attachments Testing (10 min)
**Location:** `/projects/[projectId]` (attachments section)

**Test Scenarios:**
- [ ] **Upload Single File**
  - Navigate to project detail page
  - Scroll to "Project Attachments" section
  - Click upload area or drag & drop a file
  - **Expected:** Upload progress shown, file appears in list after upload

- [ ] **Upload Multiple Files**
  - Drag and drop 3-5 files at once
  - **Expected:** All files upload sequentially, success toast for each

- [ ] **Upload Invalid File (Too Large)**
  - Try to upload a file > 10MB
  - **Expected:** Error message shown, file rejected

- [ ] **Upload Invalid File (Wrong Type)**
  - Try to upload unsupported file type (e.g., .exe, .dmg)
  - **Expected:** Error message shown, file rejected

- [ ] **View File Metadata**
  - Check uploaded file in list
  - **Expected:** Shows file name, size (formatted), upload date, uploader name

- [ ] **Download File**
  - Click download button on attachment
  - **Expected:** File downloads correctly, opens as expected

- [ ] **Delete File**
  - Click delete button on attachment
  - Confirm deletion in dialog
  - **Expected:** File removed from list, toast confirmation shown

- [ ] **Multi-Tenancy Verification** (Important!)
  - Upload file in organization 1
  - Switch to organization 2 (or create test org)
  - **Expected:** File from org 1 NOT visible in org 2

**Success Criteria:** Upload/download/delete work, validation catches errors, multi-tenancy enforced

---

#### 5. Notifications Testing (5 min)
**Location:** Top bar notification bell icon

**Test Scenarios:**
- [ ] **View Notifications**
  - Click bell icon in top bar
  - **Expected:** Dropdown opens with notification list

- [ ] **Unread Count**
  - Check bell icon badge
  - **Expected:** Shows correct count of unread notifications

- [ ] **Mark Notification as Read**
  - Click on unread notification
  - **Expected:** Notification marked as read, count decreases

- [ ] **Mark All as Read**
  - Click "Mark all as read" button
  - **Expected:** All notifications marked read, count becomes 0

- [ ] **Delete Notification**
  - Click delete button on notification
  - **Expected:** Notification removed from list

- [ ] **Real-Time Notification Delivery** (Critical!)
  - Open app in two browser windows
  - Create a task/project/customer in window 1
  - **Expected:** Notification appears in window 2 bell immediately

**Success Criteria:** Notifications deliver correctly, real-time updates work, read/delete functional

---

#### 6. AI Chat Testing (5 min)
**Location:** `/ai`

**Test Scenarios:**
- [ ] **Send Message**
  - Navigate to AI chat page
  - Type a message (e.g., "Help me write a project proposal")
  - Select a model (e.g., GPT-4)
  - Click send
  - **Expected:** Response appears, message history updates

- [ ] **Switch Models**
  - Try different AI models (GPT-4, Claude, Llama, Mixtral)
  - **Expected:** Each model responds appropriately

- [ ] **View Conversation History**
  - Send multiple messages
  - Refresh page
  - **Expected:** Conversation history persists

- [ ] **Clear Conversation**
  - Click "New Conversation" or clear button
  - **Expected:** History clears, fresh conversation starts

**Success Criteria:** AI responses work, model switching functional, history persists

---

### Priority 2: Performance Optimization (45 min)

#### 1. Production Build Testing (10 min)
**Objective:** Ensure clean production build

**Steps:**
```bash
# Clean build
rm -rf .next
npm run build
```

**Checks:**
- [ ] Build completes without errors
- [ ] Check bundle sizes in output
- [ ] Identify any warnings
- [ ] Note any "Failed to compile" messages

**Issues to Fix:**
1. Legacy web folder module errors (if blocking)
2. Any TypeScript errors that surface
3. Large bundle warnings (>500kb)

**Expected Result:** Clean build with no errors, warnings documented

---

#### 2. Lighthouse Audit (15 min)
**Objective:** Measure and optimize Core Web Vitals

**Steps:**
```bash
# Start production server
npm run build
npm run start

# Open Chrome DevTools
# Navigate to http://localhost:3000/dashboard
# Lighthouse tab → Run audit
```

**Target Scores:**
- **Performance:** > 90
- **Accessibility:** > 95
- **Best Practices:** > 95
- **SEO:** > 90

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Pages to Test:**
1. Dashboard (`/dashboard`)
2. CRM List (`/crm`)
3. Project Detail (`/projects/[id]`)
4. Task List (within project)

**Common Issues & Fixes:**
- Images not optimized → Use Next.js `<Image>` component
- Large JavaScript bundles → Add dynamic imports
- Unused CSS → Check Tailwind purge
- Fonts not preloaded → Add font optimization
- No caching headers → Check Next.js config

**Document:**
- Current scores for each page
- Identified bottlenecks
- Recommended fixes

---

#### 3. Bundle Size Analysis (10 min)
**Objective:** Identify and optimize large dependencies

**Steps:**
```bash
# Analyze bundle
npm run build -- --analyze

# Or use webpack-bundle-analyzer
npm install -D @next/bundle-analyzer
```

**Check for:**
- [ ] Duplicate dependencies
- [ ] Large libraries (> 100kb)
- [ ] Unused exports
- [ ] Moment.js or Lodash (should use tree-shakeable alternatives)

**Optimization Strategies:**
1. **Dynamic Imports:**
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Spinner />,
     ssr: false,
   });
   ```

2. **Tree Shaking:**
   ```typescript
   // Bad
   import _ from 'lodash';

   // Good
   import { debounce } from 'lodash-es';
   ```

3. **Code Splitting:**
   - Split routes automatically (Next.js default)
   - Split heavy components manually

**Target:** Bundle size < 500kb (initial load)

---

#### 4. Image Optimization (5 min)
**Objective:** Ensure all images use Next.js Image component

**Steps:**
```bash
# Search for <img> tags
grep -r "<img" app/ --include="*.tsx" --include="*.jsx"
```

**Replace with:**
```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={600}
  height={400}
  priority={false}  // true for above-fold images
/>
```

**Benefits:**
- Automatic lazy loading
- WebP conversion
- Responsive images
- Blur placeholder

---

#### 5. Performance Monitoring Setup (5 min)
**Objective:** Set up monitoring for production

**Options:**
1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics**
3. **Sentry Performance**

**Key Metrics to Track:**
- Core Web Vitals
- Page load times
- Time to Interactive (TTI)
- API response times
- Error rates

**Implementation:**
```typescript
// lib/analytics.ts
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
}
```

---

### Priority 3: Security Audit (45 min)

#### 1. Input Validation Audit (15 min)
**Objective:** Verify all user inputs are validated

**Checklist:**
- [ ] All server actions use Zod validation
- [ ] No raw SQL queries (only Prisma)
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] File uploads validate size and type (client + server)
- [ ] Email validation uses proper regex
- [ ] Phone validation uses proper format
- [ ] URLs validated before external requests

**Review Files:**
```bash
# Find all server actions
find lib/modules -name "actions.ts" -exec echo {} \;

# Check for dangerous patterns
grep -r "dangerouslySetInnerHTML" app/
grep -r "\$queryRaw" lib/
grep -r "innerHTML" app/
```

**For Each Server Action:**
```typescript
// ✅ Good - Zod validation
export async function createProject(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const validated = createProjectSchema.parse(input);  // ← Zod validation

  const project = await prisma.project.create({
    data: validated,
  });

  return { success: true, data: project };
}

// ❌ Bad - No validation
export async function createProject(input: any) {
  const project = await prisma.project.create({
    data: input,  // ← Direct use of unvalidated input
  });
  return project;
}
```

---

#### 2. Authentication & Authorization Audit (15 min)
**Objective:** Verify all routes are properly protected

**Checklist:**
- [ ] Middleware protects `/dashboard`, `/crm`, `/projects`, `/ai`, `/tools` routes
- [ ] All server actions call `getCurrentUser()`
- [ ] All queries filter by `user.organizationId`
- [ ] Resource ownership verified before mutations
- [ ] No service role keys in client code
- [ ] JWT secrets properly secured

**Review Middleware:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/dashboard', '/crm', '/projects', '/ai', '/tools'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
```

**Review Server Actions:**
```typescript
// ✅ Good - Auth check + org filtering
export async function getProjects() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const projects = await prisma.project.findMany({
    where: {
      organizationId: user.organizationId,  // ← Multi-tenancy
    },
  });

  return { success: true, data: projects };
}
```

---

#### 3. Multi-Tenancy Verification (10 min)
**Objective:** Ensure complete data isolation between organizations

**Test Scenarios:**
- [ ] Create test organization #1
- [ ] Create customer/project/task in org #1
- [ ] Create test organization #2
- [ ] Switch to org #2
- [ ] **Expected:** No data from org #1 visible in org #2

**Code Audit:**
```bash
# Find all Prisma queries
grep -r "prisma\." lib/modules --include="*.ts"

# Verify each query filters by organizationId
```

**Pattern to Verify:**
```typescript
// ✅ Every query MUST filter by organizationId
const items = await prisma.model.findMany({
  where: {
    organizationId: user.organizationId,  // ← Required
    // other filters...
  },
});

// ❌ Missing organizationId filter
const items = await prisma.model.findMany({
  where: {
    status: 'ACTIVE',  // ← Missing tenant isolation
  },
});
```

**Critical Areas:**
- CRM queries
- Project queries
- Task queries
- Attachment queries
- Notification queries
- AI conversation queries

---

#### 4. Environment Variables Audit (5 min)
**Objective:** Verify no secrets exposed to client

**Checklist:**
- [ ] No API keys in client code
- [ ] Only `NEXT_PUBLIC_` prefixed vars exposed to client
- [ ] `.env.local` in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used server-side
- [ ] Database URLs not logged
- [ ] JWT secrets properly secured

**Review `.env.local`:**
```bash
# ✅ Client-safe variables
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."  # Anon key is safe for client
NEXT_PUBLIC_APP_URL="..."

# ✅ Server-only variables (no NEXT_PUBLIC_ prefix)
DATABASE_URL="..."
DIRECT_URL="..."
SUPABASE_SERVICE_ROLE_KEY="..."  # NEVER expose to client
JWT_SECRET="..."

# Check .gitignore
grep ".env.local" .gitignore  # Should be present
```

---

### Priority 4: Deployment Configuration (30 min)

#### 1. Environment Variables Setup (10 min)
**Objective:** Prepare production environment configuration

**Variables Needed:**
```bash
# Database
DATABASE_URL="postgres://..."          # Supabase pooler URL
DIRECT_URL="postgres://..."            # Supabase direct URL

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."       # Server-only

# Authentication
JWT_SECRET="..."                       # Generate: openssl rand -base64 32

# App URLs
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
NEXT_PUBLIC_MARKETING_URL="https://strivetech.ai"

# AI Services (if using)
OPENROUTER_API_KEY="..."
GROQ_API_KEY="..."

# Monitoring (optional)
SENTRY_DSN="..."
NEXT_PUBLIC_GA_TRACKING_ID="..."

# Node Environment
NODE_ENV="production"
```

**Platform-Specific:**
- **Vercel:** Add in Project Settings → Environment Variables
- **Railway:** Add in Service → Variables
- **Custom:** Use `.env.production` or secret management system

---

#### 2. Database Migration Strategy (10 min)
**Objective:** Plan safe production database migration

**Strategy:**

**Option 1: Prisma Migrate (Recommended)**
```bash
# Development
npx prisma migrate dev

# Production (first time)
npx prisma migrate deploy

# Production (updates)
npx prisma migrate deploy
```

**Option 2: Prisma DB Push (Quick, less safe)**
```bash
npx prisma db push
```

**Migration Checklist:**
- [ ] Review all migrations in `prisma/migrations/`
- [ ] Test migrations on staging database
- [ ] Backup production database before migration
- [ ] Run migration during low-traffic window
- [ ] Verify data integrity after migration
- [ ] Have rollback plan ready

**Supabase Considerations:**
- Migrations run against direct connection (not pooler)
- Use `DIRECT_URL` for migrations
- Connection pooling (`pgbouncer=true`) not compatible with migrations

---

#### 3. Supabase Production Setup (5 min)
**Objective:** Configure production Supabase project

**Steps:**
1. **Create Production Project** (if using separate prod)
   - Go to Supabase Dashboard
   - Create new project
   - Note project ref, URLs, and keys

2. **Configure Storage Buckets**
   ```bash
   # Create attachments bucket (if needed)
   curl -X POST "https://{project-ref}.supabase.co/storage/v1/bucket" \
     -H "Authorization: Bearer {service-role-key}" \
     -d '{
       "id": "attachments",
       "public": false,
       "file_size_limit": 10485760
     }'
   ```

3. **Configure Authentication**
   - Enable email/password auth
   - Configure email templates
   - Set redirect URLs (app.strivetech.ai)

4. **Set Up Row Level Security (RLS)**
   - Enable RLS on all tables
   - Create policies for multi-tenancy

**RLS Policy Example:**
```sql
-- Allow users to only see their organization's data
CREATE POLICY "tenant_isolation" ON projects
  FOR ALL
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
```

---

#### 4. Domain Configuration (5 min)
**Objective:** Set up custom domain

**DNS Records Needed:**
- `A` or `CNAME` record for `app.strivetech.ai`
- SSL certificate (auto via platform)

**Platform Configuration:**
- **Vercel:** Project Settings → Domains → Add Domain
- **Railway:** Settings → Networking → Custom Domain
- **Other:** Follow platform-specific docs

**Checklist:**
- [ ] Domain added to platform
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] HTTPS enforced
- [ ] Redirect http → https

---

### Priority 5: Stretch Goals (Optional, 30-60 min)

#### 1. Fix Legacy Web Folder Build Errors (30 min)
**Objective:** Resolve missing module errors in marketing site

**Known Issues:**
- `@/lib/validation` module not found
- `@/lib/pdf-generator` module not found

**Files Affected:**
- `app/(web)/contact/page.tsx`
- `app/(web)/request/page.tsx`

**Options:**

**Option 1: Create Missing Modules**
```typescript
// lib/validation.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^\+?[\d\s-()]+$/.test(phone);
}
```

**Option 2: Remove Dependencies**
- Remove validation imports
- Use simple inline validation
- Remove PDF generation features (if not needed)

**Option 3: Defer to Future Session**
- Focus on platform functionality
- Marketing site can be separate deployment
- Address in dedicated marketing site migration session

---

#### 2. Add ErrorBoundary to Layouts (15 min)
**Objective:** Implement global error handling

**Add to Main Layout:**
```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/shared/error-boundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Add to Platform Layout:**
```typescript
// app/(platform)/layout.tsx
import { ErrorBoundary } from '@/components/shared/error-boundary';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Sidebar />
      <main>{children}</main>
    </ErrorBoundary>
  );
}
```

---

#### 3. Create User Documentation (30 min)
**Objective:** Basic user guide for each feature

**Files to Create:**
- `docs/user-guide/crm.md`
- `docs/user-guide/projects.md`
- `docs/user-guide/tasks.md`
- `docs/user-guide/ai-chat.md`
- `docs/user-guide/notifications.md`

**Content Structure:**
```markdown
# Feature Name

## Overview
Brief description of the feature and its purpose.

## Getting Started
1. Step 1
2. Step 2
3. Step 3

## Features
### Create [Entity]
How to create...

### Edit [Entity]
How to edit...

### Delete [Entity]
How to delete...

## Tips & Best Practices
- Tip 1
- Tip 2

## Troubleshooting
Common issues and solutions
```

---

## Technical Tasks Summary

### Components to Test
- CRM system (7 test scenarios)
- Projects (6 test scenarios)
- Tasks (10 test scenarios)
- Attachments (8 test scenarios)
- Notifications (6 test scenarios)
- AI Chat (4 test scenarios)

### Performance Checks
- Production build
- Lighthouse audit (4 pages)
- Bundle size analysis
- Image optimization
- Monitoring setup

### Security Audits
- Input validation (all server actions)
- Authentication/authorization (middleware + actions)
- Multi-tenancy (all queries)
- Environment variables

### Deployment Tasks
- Environment variables configuration
- Database migration strategy
- Supabase production setup
- Domain configuration

---

## Testing Checklist

### Must Complete ✅
- [ ] All CRM operations work (create, edit, delete, search, filter, export)
- [ ] All Project operations work (CRUD, filters, progress, attachments)
- [ ] All Task operations work (CRUD, bulk ops, real-time sync)
- [ ] File attachments work (upload, download, delete, validation)
- [ ] Notifications work (create, read, delete, real-time)
- [ ] AI chat functional (send, receive, history)
- [ ] Real-time updates confirmed (tasks, notifications)
- [ ] Multi-tenancy verified (data isolation between orgs)
- [ ] Production build succeeds
- [ ] Performance targets met (Lighthouse > 90)
- [ ] Security audit passed (all checks green)

### Stretch Goals 🎯
- [ ] Legacy web folder errors fixed
- [ ] ErrorBoundary added to layouts
- [ ] User documentation created
- [ ] CI/CD pipeline configured
- [ ] Monitoring dashboard set up

---

## Success Criteria

### Phase 4 Complete ✅
- [ ] All E2E tests passed manually
- [ ] No critical bugs found
- [ ] Performance scores > 90 (Lighthouse)
- [ ] Security audit passed (100% checklist)
- [ ] Production environment configured
- [ ] Database migration strategy documented
- [ ] Ready for production deployment

### Production Readiness 🚀
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Domain configured and SSL active
- [ ] Monitoring and error tracking set up
- [ ] Documentation complete
- [ ] Team trained on deployment process

---

## Implementation Order (Recommended)

### Phase 1: Manual E2E Testing (60 min)
1. CRM testing - 15 min
2. Projects testing - 15 min
3. Tasks testing - 15 min
4. Attachments testing - 10 min
5. Notifications testing - 5 min

**Checkpoint:** All features work end-to-end, no critical bugs

---

### Phase 2: Performance Optimization (45 min)
1. Production build - 10 min
2. Lighthouse audit - 15 min
3. Bundle analysis - 10 min
4. Image optimization - 5 min
5. Monitoring setup - 5 min

**Checkpoint:** Performance scores > 90, bundle optimized

---

### Phase 3: Security Audit (45 min)
1. Input validation audit - 15 min
2. Auth/authz audit - 15 min
3. Multi-tenancy verification - 10 min
4. Environment variables audit - 5 min

**Checkpoint:** All security checks passed, no vulnerabilities

---

### Phase 4: Deployment Config (30 min)
1. Environment variables - 10 min
2. Database migration strategy - 10 min
3. Supabase production setup - 5 min
4. Domain configuration - 5 min

**Checkpoint:** Production environment ready for deployment

---

### Phase 5: Stretch Goals (Optional, 30-60 min)
1. Fix legacy web folder - 30 min
2. Add ErrorBoundary to layouts - 15 min
3. Create user docs - 30 min

**Checkpoint:** Nice-to-haves complete

---

**Total Estimated:** 3-4 hours (without stretch goals)

---

## Notes for Next Session

### Quick Start Checklist
1. Read Session13_Summary.md (10 min)
2. Read this file (Session14.md) (10 min)
3. Start dev server: `npm run dev` (1 min)
4. Begin E2E testing with CRM module
5. Work through testing checklist systematically

### Known Issues to Watch For
- Real-time updates require WebSocket connection (check Supabase status)
- Bulk operations should show loading state
- File uploads limited to 10MB
- Multi-tenancy must be verified with separate organizations

### Testing Environment Setup
```bash
# Start dev server
npm run dev

# In separate terminal, open Prisma Studio (optional)
npx prisma studio

# Create test organizations and users if needed
# Test with multiple browser windows for real-time features
```

### Bug Reporting Template
```markdown
**Bug:** [Brief description]
**Location:** [Page/component]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Severity:** [Critical/High/Medium/Low]
```

---

## Post-Session 14: Phase 5 Preview

Once Phase 4 is complete, Phase 5 will focus on:

### 1. Production Deployment (2 hours)
- Deploy to Vercel/Railway
- Run production migrations
- Verify all features work in production
- Set up custom domain with SSL
- Configure CDN and edge caching

### 2. Post-Launch Monitoring (1 hour)
- Set up Sentry error tracking
- Configure analytics dashboard
- Set up performance monitoring
- Create alerting for critical issues

### 3. Team Onboarding (1 hour)
- Train team on platform features
- Document admin procedures
- Set up support workflows
- Create troubleshooting guides

### 4. Marketing Site Migration (4 hours)
- Migrate `app/(web)/` to new architecture
- Update components to use shadcn/ui
- Fix TypeScript errors
- Optimize performance
- Deploy marketing site

**Phase 5 Total:** ~8 hours

---

**Ready to complete Phase 4! Let's ship it! 🚀**
