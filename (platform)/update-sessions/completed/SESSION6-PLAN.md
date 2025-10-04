# Session 6: Deployment Preparation - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** Sessions 1-5 ✅ (ALL must be complete)
**Parallel Safe:** No (final session, deploys to production)

---

## 🎯 Session Objectives

Prepare the platform for production deployment to Vercel with proper database migrations, environment configuration, and domain setup for `app.strivetech.ai`.

**What Exists:**
- ✅ Working app with all features (Sessions 1-5)
- ✅ Tests passing with 80%+ coverage
- ✅ Security implemented
- ✅ Performance optimized
- ✅ Supabase database configured

**What's Missing:**
- ❌ Production environment variables in Vercel
- ❌ Production database migrations
- ❌ Vercel deployment configuration
- ❌ Domain configuration (app.strivetech.ai)
- ❌ Production health checks
- ❌ Deployment scripts
- ❌ Rollback procedures

---

## 📋 Task Breakdown

### Phase 1: Pre-Deployment Verification (45 minutes)

#### Step 1.1: Final Quality Checks
- [ ] Run full test suite: `npm test -- --coverage`
- [ ] Verify 80%+ coverage achieved
- [ ] Run TypeScript compiler: `npx tsc --noEmit`
- [ ] Verify 0 type errors
- [ ] Run linter: `npm run lint`
- [ ] Verify 0 warnings
- [ ] Run security audit: `npm audit`
- [ ] Fix any high/critical vulnerabilities

**Create checklist script: `scripts/pre-deploy-check.sh`**
```bash
#!/bin/bash

set -e

echo "🔍 Pre-Deployment Verification..."
echo ""

echo "1. Running tests with coverage..."
npm test -- --coverage --watchAll=false

echo ""
echo "2. Type checking..."
npx tsc --noEmit

echo ""
echo "3. Linting..."
npm run lint

echo ""
echo "4. Security audit..."
npm audit --audit-level=moderate

echo ""
echo "5. Building for production..."
npm run build

echo ""
echo "✅ All pre-deployment checks passed!"
```

**Success Criteria:**
- [ ] All tests passing
- [ ] 80%+ coverage
- [ ] 0 TypeScript errors
- [ ] 0 lint warnings
- [ ] No high/critical security issues
- [ ] Production build succeeds

---

#### Step 1.2: Environment Variables Audit
- [ ] Review all `.env.local` variables
- [ ] Document required production env vars
- [ ] Identify sensitive vs public vars
- [ ] Verify no secrets in code
- [ ] Check `.env.example` is up to date

**Create `docs/ENVIRONMENT.md`:**
```markdown
# Environment Variables

## Required for Production

### Database (Supabase)
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `DIRECT_URL` - Direct database connection (Supabase)

### Supabase Auth & Storage
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (SECRET)

### AI Providers
- `OPENROUTER_API_KEY` - OpenRouter API key (SECRET)
- `GROQ_API_KEY` - Groq API key (SECRET)

### Rate Limiting
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token (SECRET)

### Stripe (if enabled)
- `STRIPE_SECRET_KEY` - Stripe secret key (SECRET)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (SECRET)

### App Configuration
- `NEXT_PUBLIC_APP_URL` - https://app.strivetech.ai
- `NODE_ENV` - production

## Setting in Vercel
1. Go to Project Settings > Environment Variables
2. Add each variable for "Production" environment
3. Mark sensitive keys as "Secret"
4. Redeploy after adding all variables
```

**Success Criteria:**
- [ ] All env vars documented
- [ ] Secrets identified
- [ ] Documentation created

---

### Phase 2: Database Preparation (30 minutes)

#### Step 2.1: Production Migration Plan
- [ ] Review all Prisma migrations
- [ ] Test migrations on staging database (if available)
- [ ] Create migration rollback plan
- [ ] Document migration steps

**Create `scripts/migrate-production.sh`:**
```bash
#!/bin/bash

set -e

echo "⚠️  WARNING: This will run migrations on PRODUCTION database"
echo "Current database: $DATABASE_URL"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Migration cancelled"
  exit 1
fi

echo ""
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=../shared/prisma/schema.prisma

echo ""
echo "✅ Production migrations complete"

echo ""
echo "Generating Prisma Client..."
npx prisma generate --schema=../shared/prisma/schema.prisma

echo ""
echo "✅ Prisma Client generated"
```

**Make executable:** `chmod +x scripts/migrate-production.sh`

**Success Criteria:**
- [ ] Migration script created
- [ ] Rollback plan documented
- [ ] Tested on staging (if available)
- [ ] Executable permissions set

---

#### Step 2.2: Database Seed Script (optional)
- [ ] Create seed script for initial data
- [ ] Admin user creation
- [ ] Default organization
- [ ] Sample data (if needed)

**Create `prisma/seed.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database...');

  // Create default admin user (if needed)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@strivetech.ai' },
    update: {},
    create: {
      email: 'admin@strivetech.ai',
      name: 'System Admin',
      role: 'ADMIN',
      // ... other fields
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create default organization (if needed)
  const org = await prisma.organization.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      name: 'Strive Tech',
      industry: 'SHARED',
      subscriptionTier: 'ENTERPRISE',
    },
  });

  console.log('✅ Default organization created:', org.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Add to package.json:**
```json
{
  "scripts": {
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Success Criteria:**
- [ ] Seed script created
- [ ] Default data defined
- [ ] Idempotent (safe to run multiple times)

---

### Phase 3: Vercel Deployment Setup (45 minutes)

#### Step 3.1: Vercel Configuration
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Configure build settings

**Create `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.strivetech.ai"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database_url",
      "DIRECT_URL": "@direct_url",
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
    }
  }
}
```

**Success Criteria:**
- [ ] Vercel CLI installed
- [ ] Project linked
- [ ] Configuration created
- [ ] Build settings verified

---

#### Step 3.2: Set Environment Variables in Vercel
- [ ] Navigate to Vercel Dashboard → Project → Settings → Environment Variables
- [ ] Add all production environment variables
- [ ] Set environment to "Production"
- [ ] Mark secrets appropriately

**Checklist:**
```
Database:
□ DATABASE_URL (from Supabase)
□ DIRECT_URL (from Supabase)

Supabase:
□ NEXT_PUBLIC_SUPABASE_URL
□ NEXT_PUBLIC_SUPABASE_ANON_KEY
□ SUPABASE_SERVICE_ROLE_KEY (secret)

AI:
□ OPENROUTER_API_KEY (secret)
□ GROQ_API_KEY (secret)

Redis:
□ UPSTASH_REDIS_REST_URL
□ UPSTASH_REDIS_REST_TOKEN (secret)

Stripe (if enabled):
□ STRIPE_SECRET_KEY (secret)
□ STRIPE_WEBHOOK_SECRET (secret)

App:
□ NEXT_PUBLIC_APP_URL = https://app.strivetech.ai
□ NODE_ENV = production
```

**Success Criteria:**
- [ ] All env vars set in Vercel
- [ ] Secrets marked correctly
- [ ] Production environment selected

---

#### Step 3.3: Deploy to Vercel
- [ ] Deploy to production: `vercel --prod`
- [ ] Monitor build logs
- [ ] Verify deployment succeeds
- [ ] Check deployment URL
- [ ] Test initial deployment

**Deployment command:**
```bash
# Deploy to production
vercel --prod

# Or with alias
vercel --prod --alias app.strivetech.ai
```

**Success Criteria:**
- [ ] Deployment succeeds
- [ ] Build completes without errors
- [ ] Deployment URL accessible
- [ ] App loads correctly

---

### Phase 4: Domain Configuration (30 minutes)

#### Step 4.1: Configure Custom Domain
- [ ] Add domain in Vercel: `app.strivetech.ai`
- [ ] Get DNS configuration from Vercel
- [ ] Update DNS records with domain provider
- [ ] Verify domain ownership
- [ ] Wait for DNS propagation
- [ ] Test HTTPS certificate

**DNS Records (example):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 300

Type: TXT (for verification)
Name: _vercel
Value: [verification-token-from-vercel]
```

**Success Criteria:**
- [ ] Domain added in Vercel
- [ ] DNS records updated
- [ ] Domain verified
- [ ] HTTPS working
- [ ] app.strivetech.ai resolves

---

#### Step 4.2: SSL/TLS Configuration
- [ ] Verify Vercel auto-SSL is enabled
- [ ] Check certificate is valid
- [ ] Test HTTPS redirect (HTTP → HTTPS)
- [ ] Verify security headers

**Vercel auto-configures:**
- ✅ SSL certificate (Let's Encrypt)
- ✅ HTTP → HTTPS redirect
- ✅ Security headers
- ✅ Certificate renewal

**Success Criteria:**
- [ ] HTTPS enabled
- [ ] Certificate valid
- [ ] HTTP redirects to HTTPS
- [ ] No SSL warnings

---

### Phase 5: Post-Deployment Verification (30 minutes)

#### Step 5.1: Health Checks
- [ ] Create health check endpoint
- [ ] Test database connection
- [ ] Test Supabase connection
- [ ] Test AI provider APIs
- [ ] Test rate limiting

**Create `app/api/health/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    // Check environment
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    const missing = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missing.length > 0) {
      throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

**Success Criteria:**
- [ ] Health endpoint created
- [ ] Returns 200 OK when healthy
- [ ] Database connection verified
- [ ] Environment validated

---

#### Step 5.2: Smoke Tests
- [ ] Test authentication flow (login/logout)
- [ ] Test creating a customer (CRM)
- [ ] Test creating a project
- [ ] Test AI assistant
- [ ] Test role-based access
- [ ] Test subscription features

**Manual Test Checklist:**
```
Authentication:
□ Login with valid credentials
□ Logout successfully
□ Protected routes redirect

CRM:
□ Create customer
□ View customer list
□ Edit customer
□ Delete customer

Projects:
□ Create project
□ Assign team members
□ Update project status

AI:
□ Send message to AI assistant
□ Receive response

RBAC:
□ Admin can access admin routes
□ Employee cannot access admin routes
□ Client has limited access
```

**Success Criteria:**
- [ ] All smoke tests pass
- [ ] No errors in console
- [ ] Performance acceptable
- [ ] UI renders correctly

---

#### Step 5.3: Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry optional)
- [ ] Configure uptime monitoring
- [ ] Set up alerts

**Vercel Analytics (included):**
- ✅ Real user monitoring
- ✅ Web vitals tracking
- ✅ Performance insights

**Additional monitoring (optional):**
```bash
# Install Sentry (optional)
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard@latest -i nextjs
```

**Success Criteria:**
- [ ] Analytics enabled
- [ ] Monitoring active
- [ ] Alerts configured (if applicable)

---

### Phase 6: Rollback & Recovery Plan (15 minutes)

#### Step 6.1: Create Rollback Script
- [ ] Document rollback procedure
- [ ] Create rollback to previous deployment
- [ ] Test rollback process

**Create `docs/ROLLBACK.md`:**
```markdown
# Deployment Rollback Procedure

## Quick Rollback (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." menu → "Promote to Production"
4. Confirm promotion

**CLI Method:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## Database Rollback

⚠️ Database rollback is risky - create backup first!

```bash
# Create backup
npx prisma db pull --schema=../shared/prisma/schema.prisma

# Rollback migration (if needed)
npx prisma migrate resolve --rolled-back [migration-name]
```

## Full Recovery Steps

1. Rollback Vercel deployment (instant)
2. Check database state
3. Verify app functionality
4. Monitor error logs
5. Fix issues
6. Redeploy
```

**Success Criteria:**
- [ ] Rollback procedure documented
- [ ] Tested rollback process
- [ ] Team trained on procedure

---

## 📊 Files to Create/Update

### Scripts (4 files)
```
scripts/
├── pre-deploy-check.sh        # ✅ Create (verification)
├── migrate-production.sh      # ✅ Create (migrations)
├── deploy-production.sh       # ✅ Create (full deploy)
└── rollback.sh                # ✅ Create (rollback)
```

### Configuration (2 files)
```
vercel.json                    # ✅ Create (Vercel config)
prisma/seed.ts                 # ✅ Create (database seed)
```

### Health Check (1 file)
```
app/api/health/route.ts        # ✅ Create (health endpoint)
```

### Documentation (3 files)
```
docs/
├── ENVIRONMENT.md             # ✅ Create (env vars guide)
├── DEPLOYMENT.md              # ✅ Create (deploy guide)
└── ROLLBACK.md                # ✅ Create (rollback guide)
```

### Package.json (1 file)
```
package.json                   # 🔄 Update (add deploy scripts)
```

**Total:** 11 files (10 new, 1 update)

---

## 🎯 Success Criteria

**MANDATORY:**
- [ ] All pre-deployment checks pass
- [ ] Environment variables set in Vercel
- [ ] Production database migrated
- [ ] Vercel deployment succeeds
- [ ] Domain configured (app.strivetech.ai)
- [ ] HTTPS/SSL working
- [ ] Health check endpoint returns 200 OK
- [ ] All smoke tests pass
- [ ] Monitoring enabled
- [ ] Rollback procedure documented

**Production Metrics:**
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] No console errors
- [ ] 99.9% uptime target

---

## 🔗 Integration Points

### With Vercel
```bash
# Deploy
vercel --prod

# Check deployment
vercel ls

# View logs
vercel logs [deployment-url]

# Rollback
vercel rollback
```

### With Supabase
```
Production database:
- Connection pooling enabled
- RLS policies active
- Backups configured
- Monitoring enabled
```

### With Upstash Redis
```
Production Redis:
- Rate limiting active
- Persistent storage
- Multi-region support
```

---

## 📝 Implementation Notes

### Deployment Checklist
```
Pre-deployment:
□ All tests passing
□ 80%+ coverage
□ 0 TypeScript errors
□ 0 lint warnings
□ Security audit passed
□ Build succeeds

During deployment:
□ Environment vars set
□ Migrations run
□ Deployment succeeds
□ Domain configured
□ HTTPS enabled

Post-deployment:
□ Health check passes
□ Smoke tests pass
□ Monitoring active
□ Team notified
```

### Environment Tiers
```
Development:
- .env.local (gitignored)
- Local database
- Test API keys

Staging (optional):
- Vercel preview
- Staging database
- Test integrations

Production:
- Vercel production
- Supabase production
- Real API keys
```

---

## 🚀 Quick Start Commands

```bash
# Pre-deployment check
./scripts/pre-deploy-check.sh

# Deploy to production
vercel --prod

# Run migrations (after deploy)
./scripts/migrate-production.sh

# Check health
curl https://app.strivetech.ai/api/health

# View logs
vercel logs --follow
```

---

## 🔄 Dependencies

**Requires (ALL previous sessions):**
- ✅ **Session 1:** App structure fixed
- ✅ **Session 2:** Auth implemented
- ✅ **Session 3:** UI complete
- ✅ **Session 4:** Security & performance
- ✅ **Session 5:** Tests passing

**This is the FINAL session:**
- Deploys to production
- Makes app publicly accessible
- Enables real users

**Enables:**
- Platform goes live on app.strivetech.ai
- Users can access the platform
- Business can operate
- Revenue generation begins

---

## 📖 Reference Files

**Must read before starting:**
- All previous session plans
- `docs/ENVIRONMENT.md` (create this)
- Vercel documentation
- Supabase production checklist

**Deployment Guides:**
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Next.js Production](https://nextjs.org/docs/deployment)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment)

---

## ⚠️ Production Warnings

**CRITICAL:**
- ✅ ALWAYS run pre-deployment checks
- ✅ ALWAYS backup database before migrations
- ✅ ALWAYS test in staging first (if available)
- ✅ ALWAYS have rollback plan ready
- ✅ NEVER deploy with failing tests
- ✅ NEVER expose secrets in logs

**During Deployment:**
- Expect 1-2 minutes downtime during deploy
- Monitor error logs closely
- Be ready to rollback
- Have team on standby

**After Deployment:**
- Monitor for 1 hour minimum
- Check error rates
- Verify all features work
- Watch performance metrics
- Document any issues

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 FINAL - Production deployment
