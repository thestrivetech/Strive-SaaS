# Main Dashboard Deployment Checklist

**Feature:** Main Dashboard Integration (Sessions 1-7)
**Target Environment:** Production (app.strivetech.ai)
**Last Updated:** 2025-10-07

---

## Pre-Deployment Verification

### 1. Database

- [ ] **Schema migrations applied**
  ```bash
  cd "(platform)"
  npm run db:status
  # Verify all migrations are applied
  ```

- [ ] **RLS policies enabled**
  ```bash
  # Check RLS policies for dashboard tables
  npm run db:check-rls
  # Verify: dashboard_metrics, dashboard_widgets, activity_feeds, quick_actions
  ```

- [ ] **Indexes created**
  ```sql
  -- Verify indexes exist:
  -- activity_feeds: organization_id, created_at
  -- dashboard_metrics: organization_id, category
  -- dashboard_widgets: organization_id, user_id
  -- quick_actions: organization_id
  ```

- [ ] **Database backup performed**
  ```bash
  # Create backup before deployment
  # Save to secure location
  ```

- [ ] **Test data cleaned**
  ```bash
  # Remove any test/development data
  # Verify only production-ready seed data remains
  ```

### 2. Code Quality

- [ ] **All tests passing**
  ```bash
  npm test -- --coverage
  # Required: 80%+ overall coverage
  # Dashboard modules: 90%+ coverage
  ```

- [ ] **No TypeScript errors**
  ```bash
  npx tsc --noEmit
  # Exit code: 0 (no errors)
  ```

- [ ] **No ESLint warnings**
  ```bash
  npm run lint
  # Exit code: 0 (no warnings or errors)
  ```

- [ ] **Code reviewed**
  - [ ] PR approved by at least 1 reviewer
  - [ ] All comments addressed
  - [ ] No "TODO" or "FIXME" in critical code

- [ ] **File size limits respected**
  ```bash
  # All files < 500 lines
  find lib/modules/dashboard -name "*.ts" -exec wc -l {} \; | awk '$1 > 500'
  # Should return empty
  ```

### 3. Security

- [ ] **RBAC permissions enforced**
  - [ ] All Server Actions check `requireAuth()`
  - [ ] All mutations verify `organizationRole` (ADMIN/OWNER)
  - [ ] Read operations filter by `organizationId`

- [ ] **Multi-tenancy isolation verified**
  ```typescript
  // Every Prisma query includes:
  where: {
    OR: [
      { organization_id: user.organizationId },
      { organization_id: null }, // System records only
    ],
  }
  ```

- [ ] **Input validation implemented**
  - [ ] All Server Actions use Zod schemas
  - [ ] No raw SQL with string interpolation
  - [ ] XSS protection (no dangerouslySetInnerHTML with user content)

- [ ] **Rate limiting configured**
  ```typescript
  // API routes have rate limiting
  // Dashboard actions: 100 req/min per org
  // Metric calculations: 20 req/min per org
  ```

- [ ] **No secrets in code**
  ```bash
  # Verify no hardcoded secrets
  grep -r "SUPABASE_SERVICE_ROLE_KEY" .
  grep -r "DOCUMENT_ENCRYPTION_KEY" .
  # Should only appear in .env.example (placeholders)
  ```

- [ ] **Environment variables set**
  - [ ] `DATABASE_URL` (Supabase connection)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - [ ] `DOCUMENT_ENCRYPTION_KEY` (if using document encryption)

### 4. Performance

- [ ] **Lighthouse score > 90**
  ```bash
  # Run Lighthouse audit
  npm run analyze
  # Performance: > 90
  # Accessibility: > 90
  # Best Practices: > 90
  # SEO: > 90
  ```

- [ ] **Bundle size optimized**
  ```bash
  npm run build
  # Check output:
  # Main bundle: < 500kb
  # Dashboard route: < 100kb
  ```

- [ ] **Images optimized**
  - [ ] All images use Next.js Image component
  - [ ] SVGs for icons (lucide-react)
  - [ ] No unoptimized large images

- [ ] **Caching configured**
  - [ ] Server-side caching for expensive queries
  - [ ] React.cache for request deduplication
  - [ ] Proper cache revalidation tags

- [ ] **Server Components used**
  - [ ] 80%+ of components are Server Components
  - [ ] "use client" only where necessary (interactivity)

### 5. Accessibility

- [ ] **Keyboard navigation**
  - [ ] All interactive elements accessible via Tab
  - [ ] Logical tab order
  - [ ] Visible focus indicators
  - [ ] No keyboard traps

- [ ] **Screen reader support**
  - [ ] ARIA labels on all interactive elements
  - [ ] ARIA live regions for dynamic content
  - [ ] Semantic HTML used (nav, main, section, article)
  - [ ] Alt text on all images

- [ ] **Color contrast**
  - [ ] WCAG AA compliance (4.5:1 for text)
  - [ ] Checked with axe DevTools
  - [ ] Color not sole indicator of information

- [ ] **Form accessibility**
  - [ ] All inputs have labels
  - [ ] Error messages associated with inputs (aria-describedby)
  - [ ] Required fields indicated
  - [ ] Form validation accessible

### 6. Environment Configuration

- [ ] **Production environment variables set in Vercel**
  - [ ] All DATABASE_URL, API keys configured
  - [ ] NEXT_PUBLIC_* variables set
  - [ ] Server-only secrets NOT in NEXT_PUBLIC_*

- [ ] **CORS configured**
  ```typescript
  // API routes have proper CORS headers
  // Only allow app.strivetech.ai origin
  ```

- [ ] **Error tracking enabled**
  - [ ] Sentry/LogRocket configured (if applicable)
  - [ ] Error boundaries in place
  - [ ] 500/404 pages styled

- [ ] **Analytics configured**
  - [ ] Google Analytics / Plausible installed
  - [ ] Dashboard events tracked
  - [ ] User interactions logged

---

## Deployment Steps

### Stage 1: Deploy to Staging

1. **Create deployment branch**
   ```bash
   git checkout -b deploy/dashboard-production
   git push origin deploy/dashboard-production
   ```

2. **Deploy to staging environment**
   ```bash
   # Vercel CLI or push to staging branch
   vercel deploy --target staging
   ```

3. **Run smoke tests on staging**
   - [ ] Dashboard loads without errors
   - [ ] Can create/edit metrics
   - [ ] Activities display correctly
   - [ ] Quick actions execute
   - [ ] Widgets render properly
   - [ ] Customization page works

4. **Performance test on staging**
   ```bash
   # Run Lighthouse on staging URL
   npx lighthouse https://staging.app.strivetech.ai/real-estate/dashboard \
     --output html \
     --output-path lighthouse-staging.html
   ```

5. **Load test (optional but recommended)**
   ```bash
   # Use k6, Artillery, or similar
   # Simulate 100 concurrent users
   # Target: Dashboard load < 2s, API responses < 200ms
   ```

### Stage 2: Deploy to Production

1. **Final verification**
   - [ ] All staging tests passed
   - [ ] No critical bugs found
   - [ ] Performance metrics acceptable
   - [ ] Stakeholder approval received

2. **Create production deployment**
   ```bash
   git checkout main
   git merge deploy/dashboard-production
   git push origin main
   ```

3. **Deploy to production**
   ```bash
   # Automatic via Vercel (main branch)
   # Or manual:
   vercel deploy --prod
   ```

4. **Verify production deployment**
   - [ ] Visit https://app.strivetech.ai/real-estate/dashboard
   - [ ] Check all features work
   - [ ] Verify no console errors
   - [ ] Check performance (< 2s load time)

5. **Monitor error logs**
   ```bash
   # Check Vercel logs immediately after deployment
   vercel logs --follow
   # Watch for errors in first 10 minutes
   ```

---

## Post-Deployment Monitoring

### First Hour

- [ ] **No critical errors in logs**
  - Check Vercel/Sentry dashboard
  - Error rate < 0.1%

- [ ] **Performance metrics normal**
  - Dashboard load time < 2s
  - API response time < 200ms
  - No timeout errors

- [ ] **User reports monitored**
  - Check support channels
  - Monitor feedback form
  - No widespread issues reported

### First Day

- [ ] **Analytics review**
  - Dashboard page views tracked
  - User engagement metrics
  - Feature adoption rates

- [ ] **Database performance**
  - Query times normal (< 100ms average)
  - No connection pool exhaustion
  - RLS overhead minimal (< 50ms)

- [ ] **Error rate check**
  - Overall error rate < 0.1%
  - No recurring errors
  - All errors triaged

### First Week

- [ ] **User acceptance testing**
  - Collect user feedback
  - Identify pain points
  - Plan improvements

- [ ] **Performance optimization**
  - Identify slow queries
  - Optimize where needed
  - Verify cache hit rates

- [ ] **Feature usage analysis**
  - Which features are used most?
  - Which features are ignored?
  - Plan future iterations

---

## Rollback Plan

### If Critical Issues Occur:

1. **Identify severity**
   - **P0 (Critical):** Data loss, security breach, complete failure
     - Execute immediate rollback
   - **P1 (High):** Major feature broken, significant UX degradation
     - Evaluate rollback vs. hotfix
   - **P2 (Medium):** Minor feature issues, cosmetic bugs
     - Plan fix for next deployment

2. **Execute rollback (P0/P1 only)**
   ```bash
   # Revert to previous deployment
   vercel rollback
   # Or manually:
   git revert HEAD
   git push origin main
   ```

3. **Investigate root cause**
   - Check logs for error details
   - Review recent changes
   - Identify failing component/query

4. **Prepare hotfix**
   ```bash
   git checkout -b hotfix/dashboard-issue
   # Fix the issue
   # Test thoroughly
   git push origin hotfix/dashboard-issue
   ```

5. **Re-deploy after fix**
   - Follow deployment steps again
   - Extra monitoring for first hour
   - Document issue and resolution

---

## Metrics to Track Post-Deployment

### Performance Metrics
- **Dashboard Load Time:** Target < 2s (P95)
- **API Response Time:** Target < 200ms (P95)
- **Time to Interactive:** Target < 3s
- **Lighthouse Performance Score:** Target > 90

### Business Metrics
- **Daily Active Users:** Track adoption
- **Feature Usage:** Which features are popular?
- **Quick Actions Executed:** How often used?
- **Customization Rate:** % users customizing dashboard

### Technical Metrics
- **Error Rate:** Target < 0.1%
- **Uptime:** Target > 99.9%
- **Cache Hit Rate:** Target > 80%
- **Database Query Time:** Target < 100ms avg

---

## Success Criteria

Deployment is considered successful when:

- [ ] Dashboard loads in < 2s for 95% of requests
- [ ] No critical (P0) or high (P1) bugs reported
- [ ] Error rate < 0.1%
- [ ] Lighthouse score > 90 across all metrics
- [ ] User feedback is positive (> 80% satisfaction)
- [ ] All monitoring dashboards show green status
- [ ] No security vulnerabilities detected
- [ ] Database performance remains stable

---

## Sign-Off

- [ ] **Developer:** Tests passing, code reviewed, ready to deploy
- [ ] **QA:** All test cases passed, no blockers found
- [ ] **Product:** Feature complete, acceptance criteria met
- [ ] **Security:** Security review passed, no vulnerabilities
- [ ] **DevOps:** Infrastructure ready, monitoring configured

**Deployment Date:** _____________
**Deployed By:** _____________
**Approval:** _____________

---

## Notes & Issues Discovered

```
[Add any notes, issues discovered during deployment, or lessons learned]
```

---

**End of Checklist**

---

## Quick Reference Commands

```bash
# Pre-deployment
npm test -- --coverage
npx tsc --noEmit
npm run lint
npm run build

# Database
npm run db:status
npm run db:check-rls

# Deployment
vercel deploy --target staging
vercel deploy --prod

# Monitoring
vercel logs --follow
npm run analyze

# Rollback
vercel rollback
```
