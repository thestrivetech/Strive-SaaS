# Deployment Rollback Procedures

Emergency rollback guide for reverting failed deployments.

---

## 🚨 When to Rollback

Rollback immediately if:

- ❌ Critical functionality is broken (auth, database, payments)
- ❌ Data loss or corruption detected
- ❌ Security vulnerability introduced
- ❌ Error rate > 5% of requests
- ❌ Complete service outage
- ❌ Database migration caused data issues

**DO NOT rollback for:**
- ✅ Minor UI issues (can be fixed with hotfix)
- ✅ Non-critical feature bugs (can be disabled)
- ✅ Performance degradation < 20% (can be optimized)

---

## ⚡ Quick Rollback (Vercel)

### Option 1: Using Script (Fastest)

```bash
cd (platform)
./scripts/rollback.sh
```

**Steps:**
1. Lists recent deployments
2. Prompts for target deployment URL
3. Confirms rollback
4. Promotes previous deployment to production
5. Verifies health endpoint

**Time:** ~2-3 minutes

---

### Option 2: Vercel Dashboard (Visual)

1. Go to https://vercel.com/dashboard
2. Select project: **strive-platform**
3. Go to **Deployments**
4. Find last working deployment (check timestamp/commit)
5. Click **"..."** menu → **"Promote to Production"**
6. Confirm promotion

**Time:** ~3-5 minutes

---

### Option 3: Vercel CLI (Manual)

```bash
# List recent deployments
vercel ls

# Example output:
# strive-platform-abc123 (Production)  1h ago
# strive-platform-def456                2h ago  <- Last working
# strive-platform-ghi789                3h ago

# Promote previous deployment
vercel promote strive-platform-def456.vercel.app
```

**Time:** ~2-3 minutes

---

## 🔍 Verification After Rollback

### 1. Check Health Endpoint

```bash
curl https://app.strivetech.ai/api/health
```

**Expected:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "connected",
    "environment": "valid"
  }
}
```

---

### 2. Test Critical Functionality

**Authentication (1 minute):**
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect correctly

**CRM (2 minutes):**
- [ ] Can view customers
- [ ] Can create customer
- [ ] Can edit customer
- [ ] No data loss

**Database (1 minute):**
- [ ] Data is accessible
- [ ] No corruption
- [ ] Relationships intact

---

### 3. Monitor Error Logs

```bash
vercel logs --follow
```

**Watch for:**
- ✅ Error rate < 0.1%
- ✅ No database connection errors
- ✅ No auth failures

---

## 🗃️ Database Rollback (DANGEROUS)

**⚠️ WARNING:** Database rollback is risky and can cause data loss!

### When Database Rollback is Needed

Only if:
- Migration broke database schema
- Data corruption occurred
- Application cannot function with current schema

### Prerequisites

1. **BACKUP FIRST** (CRITICAL)
2. Verify backup is recent and complete
3. Have database admin available
4. Plan for downtime (10-30 minutes)

---

### Database Rollback Steps

#### Step 1: Create Immediate Backup

```bash
# Using Supabase Dashboard
# 1. Go to Database → Backups
# 2. Click "Create Backup"
# 3. Wait for completion
# 4. Download backup file
```

#### Step 2: Check Migration Status

```bash
npx prisma migrate status --schema=../shared/prisma/schema.prisma
```

**Output shows:**
- Applied migrations
- Pending migrations
- Failed migrations

---

#### Step 3: Rollback Migration (If Safe)

**⚠️ Only works if migration didn't delete data**

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back [migration-name] --schema=../shared/prisma/schema.prisma
```

**Example:**
```bash
npx prisma migrate resolve --rolled-back 20250104_add_new_field --schema=../shared/prisma/schema.prisma
```

---

#### Step 4: Restore from Backup (If Necessary)

**Using Supabase:**

1. Go to Supabase Dashboard → Database → Backups
2. Find backup BEFORE problematic migration
3. Click "Restore"
4. **⚠️ THIS WILL OVERWRITE CURRENT DATA**
5. Confirm restoration
6. Wait for completion (5-15 minutes)

**Using Prisma:**

```bash
# Pull current schema from database
npx prisma db pull --schema=../shared/prisma/schema.prisma

# Compare with git history
git diff ../shared/prisma/schema.prisma

# Manually revert changes if safe
```

---

## 🔄 Full Recovery Workflow

### Phase 1: Immediate Response (5 minutes)

1. **Assess Severity**
   - Check error logs
   - Verify health endpoint
   - Estimate impact (% users affected)

2. **Decide Action**
   - Minor issue? → Hotfix + deploy
   - Major issue? → Rollback immediately

3. **Communicate**
   - Notify team in Slack/Discord
   - Post status update if public-facing
   - Document issue in incident log

---

### Phase 2: Execute Rollback (5-10 minutes)

1. **Rollback Application** (Vercel)
   ```bash
   ./scripts/rollback.sh
   # OR use Vercel dashboard
   ```

2. **Verify Application Works**
   - Health check passes
   - Critical features work
   - Error logs clear

3. **Database (If Needed)**
   - Backup current state
   - Restore previous backup
   - Verify data integrity

---

### Phase 3: Root Cause Analysis (30-60 minutes)

1. **Identify Issue**
   - Review deployment changes
   - Check commit diff: `git diff HEAD~1 HEAD`
   - Examine error logs
   - Interview team members

2. **Document**
   - What went wrong
   - Why it wasn't caught in testing
   - Impact assessment
   - Root cause

3. **Create Fix**
   - Fix the bug
   - Write additional tests
   - Test thoroughly in staging

---

### Phase 4: Safe Redeploy (Variable)

1. **Pre-Deployment**
   - Fix is tested and verified
   - All tests pass
   - Team reviewed changes
   - Additional monitoring ready

2. **Deploy**
   ```bash
   # Run pre-deployment checks
   ./scripts/pre-deploy-check.sh

   # Deploy with extra monitoring
   vercel --prod
   ```

3. **Monitor Closely**
   - Watch logs for 1 hour minimum
   - Check error rates every 5 minutes
   - Verify critical functionality
   - Have rollback ready

---

## 📋 Rollback Checklist

### Before Rollback
- [ ] Identify issue severity
- [ ] Determine root cause (if time allows)
- [ ] Backup current state (if possible)
- [ ] Notify team
- [ ] Prepare incident report

### During Rollback
- [ ] Execute rollback (Vercel or script)
- [ ] Verify health endpoint returns 200 OK
- [ ] Test critical functionality
- [ ] Check error logs
- [ ] Confirm no data loss

### After Rollback
- [ ] Application is stable
- [ ] Error rate < 0.1%
- [ ] All critical features work
- [ ] Team notified of completion
- [ ] Incident documented
- [ ] Root cause analysis scheduled

---

## 🛡️ Prevention

### Pre-Deployment

1. **Always run pre-deployment checks**
   ```bash
   ./scripts/pre-deploy-check.sh
   ```

2. **Use staging environment**
   - Deploy to staging first
   - Test thoroughly
   - Only then deploy to production

3. **Database migrations**
   - Test migrations on staging database
   - Verify rollback plan exists
   - Backup before migrating

---

### During Deployment

1. **Monitor deployment process**
   - Watch build logs
   - Check for warnings
   - Verify successful completion

2. **Gradual rollout (future)**
   - Use Vercel's split testing
   - Deploy to 10% of traffic
   - Monitor before full rollout

---

### Post-Deployment

1. **Monitor for 1 hour minimum**
   ```bash
   vercel logs --follow
   ```

2. **Run smoke tests**
   - Test all critical features
   - Check error logs
   - Verify performance metrics

3. **Stay available**
   - Team on call for 1 hour
   - Ready to rollback if needed

---

## 📊 Incident Response Template

Use this template when documenting incidents:

```markdown
## Incident Report: [Date] [Time]

### Summary
- **Severity:** Critical / High / Medium / Low
- **Duration:** [X] minutes
- **Impact:** [%] of users affected
- **Root Cause:** [Brief description]

### Timeline
- **[HH:MM]** - Issue detected
- **[HH:MM]** - Rollback initiated
- **[HH:MM]** - Rollback completed
- **[HH:MM]** - Service restored

### Actions Taken
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Root Cause Analysis
- **What happened:** [Description]
- **Why it happened:** [Cause]
- **Why it wasn't caught:** [Testing gap]

### Prevention
- [ ] Additional tests added
- [ ] Process improved
- [ ] Documentation updated

### Follow-up
- [ ] Fix developed
- [ ] Fix tested
- [ ] Fix deployed
- [ ] Incident reviewed with team
```

---

## 🔗 Emergency Contacts

**Deployment Issues:**
- Vercel Status: https://www.vercel-status.com
- Vercel Support: https://vercel.com/support

**Database Issues:**
- Supabase Status: https://status.supabase.com
- Supabase Support: https://supabase.com/support

**Team:**
- On-call engineer: [Contact info]
- Database admin: [Contact info]
- Product owner: [Contact info]

---

## 📚 Additional Resources

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy safely
- [Environment Guide](./ENVIRONMENT.md) - Environment variables
- [Vercel Docs](https://vercel.com/docs) - Official documentation
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate) - Database rollbacks

---

**Last Updated:** 2025-01-04
**Review:** After every incident, update this guide with lessons learned
