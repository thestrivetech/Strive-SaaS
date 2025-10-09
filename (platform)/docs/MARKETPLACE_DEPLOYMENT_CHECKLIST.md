# Marketplace Module - Production Deployment Checklist

**Module:** Tool & Dashboard Marketplace
**Version:** 1.0.0
**Last Updated:** 2025-10-08

## Pre-Deployment Checks

### Code Quality

- [ ] **TypeScript Compilation**
  ```bash
  npx tsc --noEmit
  ```
  - Expected: 0 errors
  - Blockers: Any compilation errors

- [ ] **ESLint**
  ```bash
  npm run lint
  ```
  - Expected: 0 errors, 0 warnings
  - Blockers: Any ESLint errors

- [ ] **Build Success**
  ```bash
  npm run build
  ```
  - Expected: Successful build with no errors
  - Blockers: Build failures, webpack errors

### Testing

- [ ] **Unit Tests**
  ```bash
  npm test -- __tests__/modules/marketplace
  ```
  - Expected: All tests passing
  - Coverage: ≥ 80% for marketplace module
  - Blockers: Failing tests, coverage below 80%

- [ ] **Integration Tests**
  ```bash
  npm test -- __tests__/modules/marketplace/integration
  ```
  - Expected: All purchase flows working
  - Blockers: Checkout failures, payment errors

- [ ] **E2E Tests**
  ```bash
  npx playwright test e2e/marketplace
  ```
  - Expected: All E2E scenarios passing
  - Browsers: Chromium (minimum)
  - Blockers: Navigation errors, UI failures

### Database

- [ ] **Migration Status**
  ```bash
  npm run db:status
  ```
  - Verify all migrations applied
  - Check for pending migrations
  - Blockers: Unapplied migrations

- [ ] **Schema Documentation**
  ```bash
  npm run db:docs
  ```
  - Verify schema docs are up to date
  - Check SCHEMA-QUICK-REF.md matches production
  - Blockers: Outdated schema documentation

- [ ] **RLS Policies**
  ```bash
  npm run db:check-rls
  ```
  - Verify RLS enabled on marketplace tables
  - Check policies for multi-tenant isolation
  - Blockers: Missing RLS policies

- [ ] **Indexes**
  - Verify indexes exist on:
    - `marketplace_tools.category`
    - `marketplace_tools.tier`
    - `marketplace_tools.is_active`
    - `tool_purchases.organization_id`
    - `tool_purchases.tool_id`
    - `tool_reviews.tool_id`
  - Blockers: Missing critical indexes

### Security

- [ ] **RBAC Permissions**
  - Verify `canAccessMarketplace()` implemented
  - Verify `canPurchaseTools()` implemented
  - Test with different roles (ADMIN, USER, VIEWER)
  - Blockers: Missing permission checks

- [ ] **Multi-Tenancy**
  - Test organizationId isolation in queries
  - Verify user A cannot access user B's purchases
  - Check cart isolation between users
  - Blockers: Cross-org data leaks

- [ ] **Input Validation**
  - All server actions use Zod schemas
  - Client inputs sanitized
  - Price validation (no negative values)
  - Blockers: Unvalidated inputs

- [ ] **Subscription Tier Gates**
  - FREE tier: View only
  - CUSTOM tier: Pay-per-use
  - STARTER+ tiers: Included tools
  - Blockers: Tier bypass vulnerabilities

### Environment Variables

- [ ] **Required Variables Set**
  - `DATABASE_URL` (Supabase connection)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only)
  - `STRIPE_SECRET_KEY` (if payment integration active)
  - `STRIPE_WEBHOOK_SECRET` (if webhooks active)
  - Blockers: Missing environment variables

- [ ] **Localhost Bypass Removed**
  ```typescript
  // CRITICAL: Remove before production
  // File: lib/auth/auth-helpers.ts

  // ❌ This must be removed:
  const isLocalhost = typeof window === 'undefined' &&
    (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local');

  if (isLocalhost) {
    return mockUser; // REMOVE THIS!
  }
  ```
  - Blockers: Localhost bypass still active

### Performance

- [ ] **Caching Enabled**
  - `getMarketplaceTools()` cached (5 min)
  - `getToolBundles()` cached (10 min)
  - `getMarketplaceToolById()` React cached
  - Blockers: Missing cache configuration

- [ ] **Bundle Size**
  ```bash
  npm run build
  # Check Next.js output for bundle sizes
  ```
  - Marketplace routes: < 100kb
  - Shared chunks: < 500kb
  - Blockers: Excessive bundle sizes

- [ ] **Database Queries**
  - No N+1 queries
  - Proper use of `include` for relations
  - Pagination implemented (limit: 50)
  - Blockers: Slow queries (>500ms)

### SEO

- [ ] **Metadata Defined**
  - `/real-estate/marketplace/page.tsx`
  - `/real-estate/marketplace/dashboard/page.tsx`
  - `/real-estate/marketplace/tools/[toolId]/page.tsx`
  - Dynamic metadata for tool pages
  - Blockers: Missing metadata

- [ ] **Open Graph Tags**
  - Title, description, type set
  - Images configured (if applicable)
  - Blockers: Missing OG tags

### Error Handling

- [ ] **Error Boundaries**
  - `/real-estate/marketplace/error.tsx` exists
  - Catches module-level errors
  - Provides user-friendly messages
  - Blockers: Missing error boundary

- [ ] **Error Logging**
  - Console errors in development
  - Production errors sent to monitoring service
  - Error IDs tracked (digest)
  - Blockers: No error tracking

## Deployment Steps

### 1. Pre-Deployment Backup

- [ ] **Database Backup**
  ```bash
  # Supabase automatic backups enabled
  # Verify in Supabase dashboard
  ```

- [ ] **Code Backup**
  ```bash
  git tag -a marketplace-v1.0.0 -m "Marketplace module production release"
  git push origin marketplace-v1.0.0
  ```

### 2. Deployment to Vercel

- [ ] **Environment Variables**
  - All secrets configured in Vercel dashboard
  - Variables match `.env.local` format
  - Service role key set as secret

- [ ] **Build Command**
  ```
  npm run build
  ```

- [ ] **Install Command**
  ```
  npm install
  ```

- [ ] **Output Directory**
  ```
  .next
  ```

### 3. Database Migrations

- [ ] **Apply Migrations**
  ```bash
  npx prisma migrate deploy --schema=./prisma/schema.prisma
  ```

- [ ] **Verify Migration**
  ```bash
  npx prisma migrate status --schema=./prisma/schema.prisma
  ```

### 4. Post-Deployment Verification

- [ ] **Smoke Tests**
  - [ ] Browse marketplace tools
  - [ ] Add tool to cart
  - [ ] Complete purchase flow
  - [ ] View purchased tools
  - [ ] Submit tool review
  - [ ] Browse bundles
  - [ ] Filter by category/tier

- [ ] **Multi-Tenant Check**
  - [ ] Create 2 test organizations
  - [ ] Purchase tool in org A
  - [ ] Verify org B cannot see purchase
  - [ ] Verify cart isolation

- [ ] **Performance Check**
  - [ ] Lighthouse score (≥90 performance)
  - [ ] Core Web Vitals passing
  - [ ] API response times (<200ms average)

## Monitoring

### Metrics to Track

- [ ] **Usage Metrics**
  - Total tools in marketplace
  - Purchase count per tool
  - Average purchase value
  - Cart abandonment rate

- [ ] **Performance Metrics**
  - Page load times
  - API response times
  - Cache hit rates
  - Database query times

- [ ] **Error Metrics**
  - Error rate (target: <1%)
  - Failed purchases
  - Payment errors
  - 500 errors

### Alerts to Set Up

- [ ] **Critical Alerts**
  - Purchase failures (>5% error rate)
  - Database connection issues
  - Authentication failures

- [ ] **Warning Alerts**
  - High cart abandonment (>70%)
  - Slow queries (>1s)
  - Cache miss rate (>50%)

## Rollback Plan

### Trigger Conditions

- Critical bugs affecting purchases
- Data integrity issues
- Security vulnerabilities discovered
- Performance degradation (>5s load times)

### Rollback Steps

1. **Immediate Actions**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

2. **Database Rollback** (if needed)
   ```bash
   # Revert migration
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Communication**
   - Notify users of temporary marketplace unavailability
   - Post status update
   - Provide ETA for fix

4. **Investigation**
   - Review error logs
   - Identify root cause
   - Create hotfix branch
   - Test thoroughly before re-deployment

## Post-Deployment

### Documentation

- [ ] Update deployment log
- [ ] Document known issues
- [ ] Update runbook
- [ ] Share release notes with team

### Team Communication

- [ ] Notify team of successful deployment
- [ ] Share monitoring dashboard links
- [ ] Schedule post-deployment review
- [ ] Gather feedback

## Known Issues

_(Document any known issues or limitations)_

**Issue #1:** [Description]
- **Severity:** Low/Medium/High
- **Workaround:** [If applicable]
- **Fix ETA:** [Date]

## Sign-Off

- [ ] **Engineering Lead:** ______________________
- [ ] **QA Lead:** ______________________
- [ ] **Product Owner:** ______________________
- [ ] **Deployment Date:** ______________________

---

## Notes

- This checklist should be completed for EVERY production deployment
- All checkboxes must be checked before deployment
- Any blockers must be resolved before proceeding
- Keep this document updated with lessons learned
