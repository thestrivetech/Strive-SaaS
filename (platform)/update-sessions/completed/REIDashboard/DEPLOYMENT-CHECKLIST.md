# REID Dashboard Deployment Checklist

**Session:** 12 - Documentation & Deployment Preparation
**Date:** 2025-10-07
**Status:** Production Ready

---

## Pre-Deployment Verification

### Code Quality

- [ ] All tests passing (`npm test`)
  ```bash
  cd "(platform)"
  npm test -- --passWithNoTests
  ```

- [ ] 80%+ code coverage achieved
  ```bash
  npm test -- --coverage --watchAll=false
  # Expected: Overall coverage > 80%
  ```

- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
  ```bash
  npx tsc --noEmit 2>&1 | head -20
  # Expected: "Found 0 errors"
  ```

- [ ] Zero ESLint warnings (`npm run lint`)
  ```bash
  npm run lint 2>&1 | grep -E "(error|warning)"
  # Expected: No output (or only exempt files)
  ```

- [ ] Build successful (`npm run build`)
  ```bash
  npm run build 2>&1 | tail -10
  # Expected: "Compiled successfully"
  ```

### Database

- [ ] Migrations applied via Supabase MCP or helper scripts
  ```bash
  # Option 1: Using helper script (recommended)
  npm run db:status
  npm run db:migrate

  # Option 2: Using Supabase MCP (if needed)
  # Use MCP apply_migration tool
  ```

- [ ] RLS policies enabled on all REID tables
  ```sql
  -- Verify RLS enabled
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN (
    'neighborhood_insights',
    'property_alerts',
    'alert_triggers',
    'market_reports',
    'user_preferences'
  );
  -- Expected: rowsecurity = true for all
  ```

- [ ] Indexes created for performance
  ```sql
  -- Check indexes exist
  SELECT tablename, indexname
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename LIKE '%neighborhood%' OR tablename LIKE '%alert%';
  ```

- [ ] Test data seeded (staging only, NOT production)
  ```bash
  # Staging only!
  npm run seed:reid
  ```

### Environment Variables (Vercel)

**Platform Project → Settings → Environment Variables**

- [ ] `DATABASE_URL` configured
  - Value: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
  - Environment: Production, Preview, Development

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured
  - Value: `https://[PROJECT_ID].supabase.co`
  - Environment: All

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
  - Value: `eyJ...` (anon key from Supabase)
  - Environment: All

- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured (server-only!)
  - Value: `eyJ...` (service role key)
  - Environment: Production, Preview only
  - ⚠️ CRITICAL: Never expose to client!

- [ ] `OPENROUTER_API_KEY` configured (Elite tier AI features)
  - Value: `sk-or-...`
  - Environment: Production, Preview

- [ ] `GROQ_API_KEY` configured (AI fallback)
  - Value: `gsk_...`
  - Environment: Production, Preview

**Optional (for alerts):**

- [ ] `SENDGRID_API_KEY` configured (email notifications)
- [ ] `TWILIO_ACCOUNT_SID` configured (SMS notifications)
- [ ] `TWILIO_AUTH_TOKEN` configured (SMS notifications)
- [ ] `TWILIO_PHONE_NUMBER` configured (SMS notifications)

### Security

- [ ] API routes protected with `requireAuth()`
  ```typescript
  // Verify pattern in all API routes
  const session = await requireAuth();
  if (!canAccessREID(session.user)) {
    throw new Error('Unauthorized');
  }
  ```

- [ ] RBAC enforced (`canAccessREID`)
  ```typescript
  // Check in lib/auth/rbac.ts
  export function canAccessREID(user: User): boolean {
    const hasGlobalRole = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
    const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
    return hasGlobalRole && hasOrgAccess;
  }
  ```

- [ ] Multi-tenancy verified (organizationId filters)
  ```typescript
  // All queries must include:
  where: { organizationId: session.user.organizationId }
  ```

- [ ] Tier limits enforced
  ```typescript
  // GROWTH: 50 insights, 10 alerts, 5 reports/month
  // ELITE: unlimited
  const limits = getREIDLimits(user.subscriptionTier);
  ```

- [ ] No secrets in client-side code
  ```bash
  # Search for exposed secrets
  grep -r "SUPABASE_SERVICE_ROLE_KEY" app/
  grep -r "OPENROUTER_API_KEY" components/
  # Expected: No results
  ```

- [ ] Input validation with Zod everywhere
  ```bash
  # Check schemas exist
  ls lib/modules/rei-analytics/schemas.ts
  ```

### Features

- [ ] Market heatmap loads without SSR errors
  ```typescript
  // Verify dynamic import with ssr: false
  const Map = dynamic(() => import('./map'), { ssr: false });
  ```

- [ ] Charts render with dark theme
  ```tsx
  // Check Recharts dark theme colors
  <LineChart>
    <Line stroke="#06b6d4" />
  </LineChart>
  ```

- [ ] ROI simulator calculations accurate
  ```typescript
  // Test with known values
  // Input: $500k purchase, 20% down, 6.5% rate
  // Expected: Specific monthly payment
  ```

- [ ] AI profiles generate (Elite only)
  ```bash
  # Test endpoint manually
  curl -X POST /api/v1/reid/ai/profile \
    -H "Authorization: Bearer [TOKEN]" \
    -d '{"areaCode":"94110"}'
  ```

- [ ] Alerts create and trigger correctly
  ```sql
  -- Check alert processor
  SELECT * FROM property_alerts WHERE is_active = true;
  SELECT * FROM alert_triggers ORDER BY triggered_at DESC LIMIT 5;
  ```

- [ ] Reports generate with PDF/CSV export
  ```bash
  # Test report generation
  # Verify files uploaded to Supabase Storage
  ```

### Performance

- [ ] Lighthouse score > 90
  ```bash
  # Run Lighthouse on deployed URL
  npx lighthouse https://app.strivetech.ai/real-estate/rei-analytics/dashboard
  ```

- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] FID < 100ms (First Input Delay)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] Bundle size < 500KB initial load
  ```bash
  npm run build
  # Check .next/build-manifest.json
  ```

- [ ] Map loads < 2s
  ```javascript
  // Add performance monitoring
  console.time('map-load');
  // ... map initialization
  console.timeEnd('map-load');
  ```

### Mobile

- [ ] Responsive on mobile (375px width)
  ```bash
  # Test in Chrome DevTools mobile view
  ```

- [ ] Touch interactions work
  - Map pan/zoom on mobile
  - Alert swipe actions
  - Chart interactions

- [ ] Charts resize properly
  ```tsx
  // Verify ResponsiveContainer
  <ResponsiveContainer width="100%" height={300}>
    <LineChart>...</LineChart>
  </ResponsiveContainer>
  ```

- [ ] Maps interactive on mobile
  ```tsx
  // Check Leaflet touch handlers
  map.touchZoom.enable();
  map.dragging.enable();
  ```

---

## Deployment Steps

### 1. Staging Deployment

```bash
# Ensure you're in platform directory
cd "(platform)"

# Push to staging branch
git checkout staging
git merge feature/reid-dashboard
git push origin staging

# Vercel will auto-deploy to staging
# URL: https://strive-saas-staging.vercel.app
```

**Wait for build:**
- Check Vercel dashboard for build status
- Review build logs for errors
- Verify deployment successful

### 2. Smoke Tests (Staging)

**Login as GROWTH tier user:**

- [ ] Navigate to `/real-estate/rei-analytics/dashboard`
- [ ] Verify dashboard loads without errors
- [ ] Check market heatmap renders
- [ ] Test ROI simulator calculations
- [ ] Create a property alert (limit: 10)
- [ ] Generate a market report (limit: 5/month)
- [ ] Verify AI features blocked (requires Elite)
- [ ] Test demographics panel
- [ ] Check trends charts display

**Login as ELITE tier user:**

- [ ] Navigate to `/real-estate/rei-analytics/dashboard`
- [ ] Test all GROWTH features (should work)
- [ ] Generate AI neighborhood profile
- [ ] Test AI comparative analysis
- [ ] Create unlimited alerts
- [ ] Generate unlimited reports
- [ ] Verify no tier limits enforced

**RBAC Tests:**

- [ ] Login as VIEWER - should have read-only access
- [ ] Login as USER (client) - should be blocked from REID
- [ ] Login as MODERATOR - should have read access
- [ ] Login as ADMIN - should have full access

**Multi-Tenancy Tests:**

- [ ] Create data as Org A
- [ ] Login as Org B
- [ ] Verify Org B cannot see Org A's data
- [ ] Create data as Org B
- [ ] Verify complete isolation

### 3. Production Deployment

**Pre-Flight Checks:**

- [ ] All staging smoke tests passed
- [ ] No errors in Vercel staging logs
- [ ] Performance metrics acceptable
- [ ] Database migrations verified

**Deploy to Production:**

```bash
# Merge to main branch
git checkout main
git merge staging
git push origin main

# Vercel auto-deploys to production
# URL: https://app.strivetech.ai
```

### 4. Post-Deployment Verification

**Immediate Checks (within 5 minutes):**

- [ ] REID dashboard accessible at `/real-estate/rei-analytics/dashboard`
- [ ] No JavaScript errors in browser console
- [ ] Dark theme applied correctly
- [ ] All 8 modules loading correctly:
  1. Market Heatmap
  2. Demographics Panel
  3. Schools & Amenities
  4. Trends Analysis
  5. ROI Simulator
  6. AI Profiles (Elite)
  7. Property Alerts
  8. Market Reports

- [ ] Navigation links working (sidebar integration)
- [ ] RBAC blocking non-authorized users
- [ ] Tier limits enforcing correctly

**Data Verification (within 30 minutes):**

- [ ] Create test neighborhood insight
- [ ] Verify data saved to database
- [ ] Verify RLS filtering by organization
- [ ] Create test alert
- [ ] Verify alert processor running
- [ ] Generate test report
- [ ] Verify PDF/CSV generation

**Performance Checks (within 1 hour):**

- [ ] Run Lighthouse audit on production
- [ ] Check Vercel Analytics dashboard
- [ ] Monitor response times (< 200ms for Server Actions)
- [ ] Check database query performance
- [ ] Verify no memory leaks (chart re-renders)

---

## Monitoring

### Error Tracking

- [ ] Sentry configured for REID module
  ```typescript
  // Verify in app/real-estate/rei-analytics/layout.tsx
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
  ```

- [ ] Error boundaries in place
  ```tsx
  // Check app/real-estate/rei-analytics/dashboard/error.tsx exists
  ```

- [ ] Alert on 4xx/5xx errors
  ```bash
  # Configure in Vercel dashboard
  # Alerts → Error Rate → Threshold: 5%
  ```

### Analytics

- [ ] Track REID dashboard usage
  ```typescript
  // Verify analytics events
  trackEvent('reid_dashboard_view', { user_id, tier });
  ```

- [ ] Monitor AI API usage (Elite tier)
  ```sql
  -- Query usage tracking table
  SELECT COUNT(*) as ai_calls, user_id, DATE(created_at)
  FROM usage_tracking
  WHERE metric = 'ai_profile_generation'
  GROUP BY user_id, DATE(created_at);
  ```

- [ ] Track report generation
  ```sql
  SELECT COUNT(*) as reports_generated, organization_id, report_type
  FROM market_reports
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY organization_id, report_type;
  ```

- [ ] Monitor alert triggers
  ```sql
  SELECT COUNT(*) as triggers, alert_id, severity
  FROM alert_triggers
  WHERE triggered_at > NOW() - INTERVAL '24 hours'
  GROUP BY alert_id, severity;
  ```

### Performance

- [ ] Set up Vercel Analytics
  - Enable in Vercel dashboard → Analytics tab

- [ ] Monitor API response times
  ```sql
  -- Create monitoring query
  SELECT
    endpoint,
    AVG(response_time_ms) as avg_response,
    MAX(response_time_ms) as max_response,
    COUNT(*) as request_count
  FROM api_metrics
  WHERE endpoint LIKE '%/reid/%'
  GROUP BY endpoint;
  ```

- [ ] Track bundle size over time
  ```bash
  # Set up bundlewatch in package.json
  npm run bundlewatch
  ```

- [ ] Monitor database query performance
  ```sql
  -- Enable pg_stat_statements
  SELECT query, calls, mean_exec_time, max_exec_time
  FROM pg_stat_statements
  WHERE query LIKE '%neighborhood_insights%'
  ORDER BY mean_exec_time DESC
  LIMIT 10;
  ```

---

## Rollback Plan

If critical issues arise post-deployment:

### Immediate Actions (< 5 minutes)

1. **Disable REID routes in middleware**
   ```typescript
   // middleware.ts
   if (req.nextUrl.pathname.startsWith('/real-estate/rei-analytics')) {
     return NextResponse.redirect(new URL('/real-estate/dashboard', req.url));
   }
   ```

2. **Clear Vercel cache**
   ```bash
   vercel --prod --force
   ```

3. **Notify users via in-app banner**
   ```typescript
   // Add to dashboard layout
   <Alert variant="warning">
     REID Dashboard temporarily unavailable. Working on a fix.
   </Alert>
   ```

### Rollback Steps (< 30 minutes)

**Option 1: Revert Git Commit**
```bash
# Identify bad commit
git log --oneline -10

# Revert the commit
git revert <commit-hash>

# Push to trigger redeployment
git push origin main
```

**Option 2: Rollback in Vercel Dashboard**
```
1. Go to Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." → "Promote to Production"
4. Confirm rollback
```

**Option 3: Feature Flag Disable**
```typescript
// Create feature flag in database
UPDATE feature_flags
SET enabled = false
WHERE feature_name = 'reid_dashboard';

// Check flag in route
if (!isFeatureEnabled('reid_dashboard')) {
  return <ComingSoon />;
}
```

### Database Rollback (DANGER - Last Resort)

**Only if database schema causes critical issues:**

```sql
-- List recent migrations
SELECT * FROM _prisma_migrations
ORDER BY finished_at DESC
LIMIT 5;

-- Revert migration (DANGEROUS!)
-- 1. Backup database first
-- 2. Drop tables in reverse order (respects foreign keys)

-- CAUTION: This will delete ALL REID data!
DROP TABLE IF EXISTS alert_triggers CASCADE;
DROP TABLE IF EXISTS property_alerts CASCADE;
DROP TABLE IF EXISTS market_reports CASCADE;
DROP TABLE IF EXISTS neighborhood_insights CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- 3. Remove migration record
DELETE FROM _prisma_migrations
WHERE migration_name = 'add-reid-dashboard';

-- 4. Redeploy with schema before REID changes
```

### Communication Plan

**Internal (Immediate):**
- Slack: #engineering channel
- Email: engineering@strivetech.ai
- Subject: "REID Dashboard Rollback - [REASON]"

**External (within 1 hour):**
- In-app notification to affected users
- Status page update: status.strivetech.ai
- Email to Elite tier customers (if AI features affected)

**Follow-up (within 24 hours):**
- Post-mortem document
- Root cause analysis
- Prevention measures
- Timeline for fix and redeployment

---

## Success Criteria

Deployment is considered successful when:

- [ ] Zero production errors in first 24 hours
- [ ] < 5% increase in average response times
- [ ] REID dashboard accessible to GROWTH+ tier users
- [ ] All features functional (heatmap, charts, ROI, AI, alerts, reports)
- [ ] No security vulnerabilities reported
- [ ] No data leaks between organizations
- [ ] Positive user feedback (or no negative feedback)
- [ ] Performance metrics within acceptable range:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - API response < 200ms (p95)

---

## Post-Launch Activities

### Week 1

- [ ] Monitor error rates daily
  - Check Sentry dashboard every morning
  - Review Vercel error logs
  - Investigate any 500 errors immediately

- [ ] Review user feedback
  - Check support tickets for REID-related issues
  - Monitor in-app feedback widget
  - Review social media mentions

- [ ] Track feature adoption
  ```sql
  SELECT
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) as total_actions,
    action_type
  FROM activity_logs
  WHERE feature = 'reid_dashboard'
  AND created_at > NOW() - INTERVAL '7 days'
  GROUP BY action_type;
  ```

- [ ] Optimize performance bottlenecks
  - Identify slow queries (> 500ms)
  - Add database indexes if needed
  - Optimize chart data queries
  - Cache frequently accessed data

### Month 1

- [ ] Analyze usage patterns
  ```sql
  -- Most used features
  SELECT feature_name, COUNT(*) as usage_count
  FROM analytics_events
  WHERE event_name = 'feature_interaction'
  AND metadata->>'module' = 'reid'
  GROUP BY feature_name
  ORDER BY usage_count DESC;

  -- Peak usage times
  SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as events
  FROM analytics_events
  WHERE metadata->>'module' = 'reid'
  GROUP BY hour
  ORDER BY hour;
  ```

- [ ] Gather feature requests
  - Schedule user interviews (5-10 Elite users)
  - Create feedback survey
  - Analyze common support questions
  - Prioritize enhancement backlog

- [ ] Plan enhancements
  - Document most requested features
  - Estimate development effort
  - Create roadmap for Q2 2025
  - Assign to sprint planning

- [ ] Review tier upgrade conversions
  ```sql
  -- Check GROWTH → ELITE upgrades after REID launch
  SELECT
    COUNT(*) as upgrades,
    DATE(upgraded_at) as upgrade_date
  FROM subscriptions
  WHERE previous_tier = 'GROWTH'
  AND current_tier = 'ELITE'
  AND upgraded_at > '2025-10-07' -- REID launch date
  GROUP BY DATE(upgraded_at);
  ```

---

## Support Contacts

**Deployment Issues:**
- Email: dev-ops@strivetech.ai
- Slack: #platform-deployments

**Bug Reports:**
- Email: bugs@strivetech.ai
- Issue Tracker: github.com/strive-tech/platform/issues

**User Support:**
- Email: support@strivetech.ai
- Live Chat: app.strivetech.ai/support

**Security Concerns:**
- Email: security@strivetech.ai
- Emergency: security-hotline@strivetech.ai

---

## Appendix

### Useful Commands

```bash
# Check deployment status
vercel --prod

# View production logs
vercel logs --prod

# Run database migrations
npm run db:migrate

# Check migration status
npm run db:status

# Generate schema docs
npm run db:docs

# Run tests
npm test

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build production
npm run build

# Analyze bundle
npm run analyze
```

### Database Queries

```sql
-- Check REID table counts
SELECT
  'neighborhood_insights' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT organization_id) as org_count
FROM neighborhood_insights
UNION ALL
SELECT
  'property_alerts',
  COUNT(*),
  COUNT(DISTINCT organization_id)
FROM property_alerts
UNION ALL
SELECT
  'market_reports',
  COUNT(*),
  COUNT(DISTINCT organization_id)
FROM market_reports;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'neighborhood_insights',
  'property_alerts',
  'alert_triggers',
  'market_reports',
  'user_preferences'
);

-- Check active alerts
SELECT
  a.name,
  a.alert_type,
  a.frequency,
  a.is_active,
  a.trigger_count,
  a.last_triggered,
  COUNT(t.id) as pending_triggers
FROM property_alerts a
LEFT JOIN alert_triggers t ON t.alert_id = a.id AND t.acknowledged = false
WHERE a.is_active = true
GROUP BY a.id, a.name, a.alert_type, a.frequency, a.is_active, a.trigger_count, a.last_triggered;
```

---

**Last Updated:** 2025-10-07
**Version:** 1.0
**Status:** Ready for Production Deployment
