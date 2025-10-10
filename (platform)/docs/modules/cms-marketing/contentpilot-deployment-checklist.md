# ContentPilot Deployment Checklist

**Module:** CMS & Marketing
**Version:** 1.0
**Target Environment:** Production
**Date:** 2025-10-07

## Pre-Deployment Verification

### Code Quality

- [ ] All TypeScript errors resolved (`npx tsc --noEmit`)
- [ ] All ESLint warnings addressed (`npm run lint`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] All tests passing (`npm test`)
- [ ] Test coverage ≥ 80% for content modules
- [ ] No `console.log` statements in production code
- [ ] No hardcoded secrets or credentials
- [ ] No `any` types (or properly exempted in eslint config)
- [ ] No unescaped entities in JSX (apostrophes/quotes properly escaped)
- [ ] File size limits respected (all files ≤ 500 lines)

**Verification Commands:**
```bash
cd (platform)
npx tsc --noEmit 2>&1 | head -20
npm run lint 2>&1 | grep -E "(error|warning)"
npm test -- lib/modules/content 2>&1 | tail -30
npm run build 2>&1 | tail -20
```

---

### Database

- [ ] All migrations applied (`npx prisma migrate status`)
- [ ] RLS policies enabled on all ContentPilot tables
- [ ] Database indexes created (39 performance indexes verified)
- [ ] Backup of database before migration
- [ ] Migration tested in staging environment
- [ ] Schema documentation up to date
- [ ] Prisma client regenerated (`npx prisma generate`)

**Tables to Verify RLS:**
```sql
-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'content_items',
    'content_categories',
    'content_tags',
    'content_revisions',
    'media_assets',
    'email_campaigns',
    'social_posts',
    'content_analytics'
  );
-- All should show rowsecurity = true
```

**Index Verification:**
```bash
cd (platform)
npm run db:status
node scripts/database/check-schema-sync.js
```

---

### Security

- [ ] Security audit passed (73 tests passing)
- [ ] All Server Actions use `requireAuth()` with proper roles
- [ ] RBAC enforced (GlobalRole + OrganizationRole checks)
- [ ] Input validation with Zod schemas on all mutations
- [ ] File upload restrictions verified (10MB images, 50MB videos)
- [ ] XSS prevention (no `dangerouslySetInnerHTML` with user input)
- [ ] SQL injection prevention (using Prisma ORM exclusively)
- [ ] No exposed `SUPABASE_SERVICE_ROLE_KEY` in client code
- [ ] CSRF protection enabled (Next.js built-in)
- [ ] Rate limiting configured (Upstash Redis)

**Security Test:**
```bash
cd (platform)
npm test -- lib/modules/content/__tests__/security
```

**RBAC Verification:**
```typescript
// Check all Server Actions have proper auth
// Search for Server Actions without requireAuth
grep -r "'use server'" lib/modules/content --include="*.ts" -A 5 | grep -L "requireAuth"
```

---

### Environment Variables

#### Required for All Environments

- [ ] `DATABASE_URL` - Supabase PostgreSQL connection (prisma uses this)
- [ ] `DIRECT_URL` - Direct database connection (for migrations)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe to expose)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Admin key (NEVER expose to client)
- [ ] `NEXTAUTH_SECRET` - Auth session encryption key
- [ ] `NEXTAUTH_URL` - Production domain (https://app.strivetech.ai)

#### ContentPilot-Specific

- [ ] `NEXT_PUBLIC_STORAGE_BUCKET` - Media upload bucket name
- [ ] `OPENROUTER_API_KEY` - AI content assistance (optional)
- [ ] `UPSTASH_REDIS_URL` - Rate limiting (optional but recommended)
- [ ] `UPSTASH_REDIS_TOKEN` - Redis authentication

#### Email Campaign Variables (if using email features)

- [ ] `SMTP_HOST` - Email sending server
- [ ] `SMTP_PORT` - SMTP port (587 for TLS)
- [ ] `SMTP_USER` - SMTP username
- [ ] `SMTP_PASSWORD` - SMTP password
- [ ] `SMTP_FROM_EMAIL` - Default sender email
- [ ] `SMTP_FROM_NAME` - Default sender name

**Verification:**
```bash
# Check Vercel environment variables
vercel env ls

# Verify no secrets in code
grep -r "SUPABASE_SERVICE_ROLE_KEY" app/ components/ lib/ --include="*.ts" --include="*.tsx"
# Should only appear in server-side code, never in 'use client' files
```

---

### Performance

- [ ] Database indexes verified in production (39 indexes)
- [ ] Image optimization enabled (Next.js image component)
- [ ] CDN configured for static assets (Vercel Edge Network)
- [ ] Caching headers configured (stale-while-revalidate)
- [ ] Bundle size optimized (initial JS < 500KB)
- [ ] Lazy loading implemented for below-fold content
- [ ] Code splitting enabled (dynamic imports for heavy components)
- [ ] Font optimization (next/font)

**Performance Metrics to Monitor:**
```
Target Lighthouse Scores:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95

Core Web Vitals:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
```

**Check Bundle Size:**
```bash
cd (platform)
npm run build
# Look for "First Load JS" - should be < 500KB for main pages
```

---

### Accessibility

- [ ] Keyboard navigation tested (Tab, Shift+Tab, Enter, Escape)
- [ ] Screen reader compatibility verified (NVDA, JAWS, VoiceOver)
- [ ] WCAG 2.1 Level AA compliance (automated + manual testing)
- [ ] Touch targets ≥ 44x44px (mobile-friendly)
- [ ] Color contrast meets standards (4.5:1 for text, 3:1 for UI)
- [ ] All images have alt text (required in schemas)
- [ ] Form labels properly associated
- [ ] Error messages announced to screen readers
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip to main content link present

**Accessibility Testing:**
```bash
# Run automated accessibility tests
npm test -- accessibility

# Manual testing checklist:
# 1. Navigate entire app using only keyboard
# 2. Test with screen reader (turn on VoiceOver/NVDA)
# 3. Check color contrast with browser DevTools
# 4. Verify form error announcements
# 5. Test touch targets on mobile device
```

---

### Mobile Responsiveness

- [ ] Tested on 320px (Mobile S - iPhone SE)
- [ ] Tested on 375px (Mobile M - iPhone 12/13)
- [ ] Tested on 414px (Mobile L - iPhone 12/13 Pro Max)
- [ ] Tested on 768px (Tablet - iPad)
- [ ] Tested on 1024px (Desktop - Laptop)
- [ ] Tested on 1920px (Large Desktop)
- [ ] Touch-friendly controls (buttons ≥ 44x44px)
- [ ] No horizontal scrolling on any breakpoint
- [ ] Readable font sizes (min 16px on mobile)
- [ ] Forms usable on mobile (large inputs, proper spacing)

**Test Viewports:**
```bash
# Browser DevTools responsive mode (F12 → Toggle device toolbar)
# Test these specific devices:
# - iPhone SE (320x568)
# - iPhone 12 Pro (390x844)
# - iPad (768x1024)
# - Desktop (1920x1080)
```

---

## Deployment Steps

### 1. Final Code Review

```bash
cd (platform)
git status
git diff main
git log --oneline -10
```

**Review Checklist:**
- [ ] All files follow project conventions
- [ ] No debug code or commented-out blocks
- [ ] Imports are clean (no unused)
- [ ] TypeScript types are explicit (no implicit any)
- [ ] Error handling is comprehensive
- [ ] Loading states are user-friendly

---

### 2. Run Pre-Deployment Tests

```bash
cd (platform)

# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Linting check
npm run lint

# 3. Test suite
npm test -- lib/modules/content --coverage

# 4. Build verification
npm run build

# All must pass before proceeding
```

**Expected Results:**
- TypeScript: 0 errors
- ESLint: 0 errors, 0 warnings
- Tests: All passing, coverage ≥ 80%
- Build: Success with no warnings

---

### 3. Database Migration

**CRITICAL: Always migrate staging before production!**

**Staging Migration:**
```bash
# Switch to staging database
export DATABASE_URL="postgresql://staging-db-url"

# Apply migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Verify
npx prisma migrate status

# Test staging app thoroughly
```

**Production Migration:**
```bash
# Backup production database FIRST
# (Supabase automatic backups + manual snapshot)

# Switch to production database
export DATABASE_URL="postgresql://production-db-url"

# Apply migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Verify
npx prisma migrate status

# Regenerate Prisma client
npx prisma generate
```

**Post-Migration Verification:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'content%';

-- Check indexes exist
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'content%';

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'content%';
```

---

### 4. Deploy to Vercel

**Option A: Git Push (Recommended)**
```bash
cd (platform)
git checkout main
git merge feature/contentpilot-integration
git push origin main
# Vercel auto-deploys on push to main
```

**Option B: Vercel CLI**
```bash
cd (platform)
vercel --prod
# Follow prompts
```

**Monitor Deployment:**
- Watch Vercel deployment dashboard
- Check build logs for errors
- Verify deployment completes successfully
- Note deployment URL

---

### 5. Post-Deployment Verification

**Smoke Tests (Perform Immediately After Deployment):**

1. **Dashboard Access:**
   - [ ] Navigate to `/real-estate/cms-marketing/dashboard`
   - [ ] Verify dashboard loads without errors
   - [ ] Check all quick action buttons work
   - [ ] Verify stats display correctly

2. **Content Management:**
   - [ ] Click "New Article" → Create test content
   - [ ] Fill in all required fields
   - [ ] Save as draft → Verify saved
   - [ ] Publish content → Verify published
   - [ ] Navigate to Content Library → Find published content
   - [ ] Edit content → Verify changes save
   - [ ] Delete test content → Verify deleted

3. **Media Library:**
   - [ ] Navigate to Media Library
   - [ ] Upload test image (JPG, < 1MB)
   - [ ] Verify upload succeeds
   - [ ] Create test folder
   - [ ] Move image to folder
   - [ ] Delete image → Verify deleted
   - [ ] Delete folder → Verify deleted

4. **Campaign Management:**
   - [ ] Navigate to Email Campaigns
   - [ ] Create test email campaign
   - [ ] Fill campaign details
   - [ ] Save as draft → Verify saved
   - [ ] Navigate to Social Posts
   - [ ] Create test social post
   - [ ] Schedule post → Verify scheduled
   - [ ] Delete test campaign/post

5. **Analytics:**
   - [ ] Navigate to Analytics Dashboard
   - [ ] Verify charts render without errors
   - [ ] Change date range → Verify data updates
   - [ ] Apply filters → Verify filtering works
   - [ ] Export report → Verify download succeeds

6. **Search & Filters:**
   - [ ] Search for content by title
   - [ ] Filter by status (Published, Draft)
   - [ ] Filter by category
   - [ ] Sort by date → Verify sorting works
   - [ ] Clear filters → Verify reset

7. **Permissions:**
   - [ ] Test as USER role (can create drafts)
   - [ ] Test as MODERATOR role (can create, edit)
   - [ ] Test as ADMIN role (can publish, delete)
   - [ ] Verify unauthorized actions are blocked

**Performance Checks:**

- [ ] Dashboard loads in < 2 seconds
- [ ] Content list loads in < 1 second
- [ ] Editor opens in < 1.5 seconds
- [ ] Media library loads in < 1 second
- [ ] Analytics renders in < 2 seconds
- [ ] Search responds in < 500ms
- [ ] File upload (1MB image) completes in < 3 seconds

**Error Monitoring:**

- [ ] No errors in browser console (F12 → Console)
- [ ] No errors in Vercel function logs
- [ ] No errors in Vercel Edge logs
- [ ] No errors in Supabase logs (Database, Auth, Storage)
- [ ] Error boundaries catch and display user-friendly messages
- [ ] Failed requests show toast notifications

**Cross-Browser Testing:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Security Verification:**

```bash
# Check for exposed secrets in browser
# Open browser DevTools → Network tab → Check headers/responses
# Verify SUPABASE_SERVICE_ROLE_KEY is NOT exposed

# Test RBAC enforcement
# Attempt to publish content as USER role → Should fail
# Attempt to delete content as MODERATOR role → Should fail
# Attempt to access another org's content → Should fail (404 or 403)
```

---

## Rollback Plan

**If critical issues arise, follow this rollback procedure:**

### Immediate Actions (< 5 minutes)

**Option 1: Revert Deployment (Fastest)**
```bash
# Vercel dashboard → Deployments → Previous deployment → Promote to Production
# OR via CLI:
vercel rollback
```

**Option 2: Disable ContentPilot Routes**

Edit `middleware.ts`:
```typescript
// Add at the top of matcher logic
if (pathname.startsWith('/cms-marketing') || pathname.includes('contentpilot')) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

Deploy immediately:
```bash
git add middleware.ts
git commit -m "Emergency: Disable ContentPilot routes"
git push origin main
```

**Option 3: Hide Navigation**

Edit `components/shared/navigation/sidebar-nav.tsx`:
```typescript
// Comment out ContentPilot nav items
// {
//   title: "ContentPilot",
//   href: "/real-estate/cms-marketing/dashboard",
//   ...
// },
```

---

### Database Rollback (Only if necessary)

**CAUTION: Only rollback database if schema changes caused critical issues**

```bash
# 1. Restore from Supabase backup
# Supabase Dashboard → Database → Backups → Select backup → Restore

# 2. OR manually revert migrations
cd (platform)
npx prisma migrate resolve --rolled-back [migration-name]

# 3. Regenerate Prisma client
npx prisma generate

# 4. Verify rollback
npx prisma migrate status
```

---

### Communication Plan

**Internal Team:**
- [ ] Notify engineering team via Slack (#engineering)
- [ ] Create incident report (who, what, when, why)
- [ ] Document what went wrong
- [ ] Schedule post-mortem meeting

**External Users (if applicable):**
- [ ] Post status update (status.strivetech.ai)
- [ ] Send email to affected users (if data loss or extended outage)
- [ ] Update in-app notification banner
- [ ] Provide timeline for fix

**Incident Severity Levels:**
- **P0 (Critical)**: Data loss, complete outage → Immediate rollback
- **P1 (High)**: Major feature broken, security issue → Rollback within 1 hour
- **P2 (Medium)**: Minor feature broken, performance degraded → Fix forward
- **P3 (Low)**: UI bugs, cosmetic issues → Fix in next release

---

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor error rates (target: < 0.1% of requests)
- [ ] Check user adoption metrics (how many users access ContentPilot)
- [ ] Monitor API response times (p50, p95, p99)
- [ ] Watch for user feedback and bug reports
- [ ] Check database query performance (slow query log)
- [ ] Monitor Vercel function execution times
- [ ] Track media upload success rate

**Monitoring Dashboards:**
- Vercel Analytics: https://vercel.com/[your-team]/[project]/analytics
- Supabase Logs: https://app.supabase.com/project/[project-id]/logs
- Sentry (if configured): Error tracking and performance

**Key Metrics to Track:**
```
Error Rate: errors / total requests
- Target: < 0.1%
- Alert: > 0.5%
- Critical: > 1%

Response Time (p95):
- Target: < 500ms
- Alert: > 1s
- Critical: > 2s

User Adoption:
- Day 1: > 5% of active users
- Week 1: > 10% of active users
- Month 1: > 25% of active users
```

---

### First Week

- [ ] Review user engagement metrics
  - Content items created per day
  - Media uploads per day
  - Campaigns sent per day
  - Time to first publish
  - Feature adoption rate

- [ ] Collect user feedback
  - In-app feedback widget
  - User interviews (5-10 users)
  - Support ticket analysis
  - Feature request tracking

- [ ] Address usability issues
  - UI/UX improvements based on feedback
  - Performance optimizations
  - Bug fixes (prioritize by severity)

- [ ] Optimize based on real usage patterns
  - Database query optimization (check slow queries)
  - Cache hit rate improvement
  - Bundle size reduction (if needed)

---

### Metrics to Track

**Usage Metrics:**
- Content items created per day (target: 10+ in first week)
- Media uploads per day (target: 20+ in first week)
- Campaigns sent per day (target: 2+ in first week)
- Average time to publish (target: < 10 minutes)
- User session duration (target: > 5 minutes)

**Performance Metrics:**
- Dashboard load time (target: < 2s)
- Content editor open time (target: < 1.5s)
- Search response time (target: < 500ms)
- Media upload time (target: < 3s for 1MB)
- Error rate (target: < 0.1%)

**Quality Metrics:**
- User satisfaction score / NPS (target: > 50)
- Support ticket volume (monitor for spikes)
- Bug report rate (target: < 5 per week)
- Feature completion rate (target: > 80%)

**Business Metrics:**
- Content published per organization (target: 5+ in first month)
- Campaign engagement rate (email open rate > 20%)
- Social post performance (engagement rate > 2%)
- ROI vs development cost

---

## Success Criteria

**Deployment is successful when ALL of the following are met:**

### Technical Success
- [ ] Zero critical bugs (P0/P1)
- [ ] Error rate < 0.1%
- [ ] All smoke tests passing
- [ ] Performance targets met (load times, response times)
- [ ] No data loss incidents
- [ ] No security incidents or vulnerabilities
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness verified

### User Success
- [ ] User adoption > 10% in first week
- [ ] Positive user feedback (NPS > 50)
- [ ] Support ticket volume normal (< 5 per week)
- [ ] Feature completion rate > 80% (users successfully complete tasks)

### Business Success
- [ ] Content creation rate meets targets
- [ ] Campaign engagement meets industry benchmarks
- [ ] No subscription downgrades due to issues
- [ ] Positive ROI trajectory

### Documentation Success
- [ ] User guide complete and accessible
- [ ] Support team trained on new features
- [ ] Troubleshooting guide available
- [ ] Admin documentation updated

---

## Sign-Off

**Pre-Deployment Sign-Off:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | _____________ | _______ | _________ |
| QA Lead | _____________ | _______ | _________ |
| Product Manager | _____________ | _______ | _________ |
| Security Lead | _____________ | _______ | _________ |

**Post-Deployment Sign-Off:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | _____________ | _______ | _________ |
| Product Manager | _____________ | _______ | _________ |

**Deployment Details:**

- **Deployment Date**: _____________
- **Deployed By**: _____________
- **Deployment Method**: [ ] Git Push [ ] Vercel CLI [ ] Other: _______
- **Database Migration**: [ ] Applied [ ] Not Required
- **Rollback Plan Tested**: [ ] Yes [ ] No
- **Monitoring Configured**: [ ] Yes [ ] No

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Next Review**: Post-deployment (within 7 days)
**Maintained By**: Engineering Team
