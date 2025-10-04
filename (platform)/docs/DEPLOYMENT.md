# Production Deployment Guide

Complete step-by-step guide for deploying Strive Tech Platform to production at `app.strivetech.ai`.

---

## 🎯 Prerequisites

Before deploying, ensure you have:

- ✅ All tests passing (80%+ coverage)
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Security audit clean
- ✅ Production build succeeds
- ✅ Supabase production database set up
- ✅ Vercel account with deployment access
- ✅ Domain `strivetech.ai` configured with DNS access

---

## 📋 Pre-Deployment Checklist

### 1. Run Pre-Deployment Verification

```bash
cd (platform)
chmod +x scripts/*.sh  # Make scripts executable
./scripts/pre-deploy-check.sh
```

**Expected Output:**
```
✅ Checks Passed: 6
╔════════════════════════════════════════╗
║   ✅ READY FOR PRODUCTION DEPLOYMENT   ║
╚════════════════════════════════════════╝
```

**If any checks fail:** Fix issues before proceeding.

---

### 2. Review Environment Variables

1. Check `docs/ENVIRONMENT.md` for complete list
2. Ensure you have production values for:
   - Supabase (DATABASE_URL, SUPABASE keys)
   - AI providers (OpenRouter, Groq)
   - Redis (Upstash)
   - Stripe (if enabled)

---

### 3. Database Preparation

**Option A: New Database (First Deployment)**
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy --schema=../shared/prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema=../shared/prisma/schema.prisma
```

**Option B: Existing Database (Updates)**
```bash
# Run migration script (with safety checks)
./scripts/migrate-production.sh
```

---

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

**Verify installation:**
```bash
vercel --version
```

---

### Step 2: Login to Vercel

```bash
vercel login
```

**Follow prompts:**
1. Choose login method (email, GitHub, GitLab, Bitbucket)
2. Verify authentication
3. Confirm login success

---

### Step 3: Link Project (First Time Only)

```bash
cd (platform)
vercel link
```

**Prompts:**
1. **Set up and deploy?** → `Y` (yes)
2. **Which scope?** → Select your team/account
3. **Link to existing project?** → `N` (no, for first time) or `Y` (if already exists)
4. **Project name?** → `strive-platform` (or your preferred name)

**Expected Output:**
```
✔ Linked to your-team/strive-platform (created .vercel directory)
```

**Note:** This creates `.vercel/` directory with project info. **DO NOT commit** (add to `.gitignore`).

---

### Step 4: Set Environment Variables in Vercel

**Via Dashboard (Recommended):**

1. Go to https://vercel.com/dashboard
2. Select project: **strive-platform**
3. Settings → Environment Variables
4. Add each variable from `docs/ENVIRONMENT.md`

**Required Variables for Production:**

```
# Database
DATABASE_URL → [Supabase pooling URL]
DIRECT_URL → [Supabase direct URL]

# Supabase
NEXT_PUBLIC_SUPABASE_URL → https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY → eyJ...
SUPABASE_SERVICE_ROLE_KEY → eyJ... (mark as Secret)

# AI
OPENROUTER_API_KEY → sk-or-... (mark as Secret)
GROQ_API_KEY → gsk_... (mark as Secret)

# Redis
UPSTASH_REDIS_REST_URL → https://...
UPSTASH_REDIS_REST_TOKEN → ... (mark as Secret)

# Stripe (if enabled)
STRIPE_SECRET_KEY → sk_live_... (mark as Secret)
STRIPE_WEBHOOK_SECRET → whsec_... (mark as Secret)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → pk_live_...

# App
NEXT_PUBLIC_APP_URL → https://app.strivetech.ai
NODE_ENV → production
```

**Important:**
- ✅ Set environment to: **Production**
- ✅ Mark SECRET keys as "Sensitive"
- ✅ Verify all values before saving

---

### Step 5: Deploy to Production

**Option A: Using Script (Recommended)**

```bash
./scripts/deploy-production.sh
```

**Workflow:**
1. Runs pre-deployment checks
2. Deploys to Vercel
3. Prompts for migrations (if needed)
4. Verifies health endpoint

**Option B: Manual Deployment**

```bash
vercel --prod
```

**Deployment Process:**
1. Vercel uploads project files
2. Installs dependencies
3. Runs build: `npm run build`
4. Deploys to production edge network
5. Returns deployment URL

**Expected Output:**
```
✔ Production: https://strive-platform-xxx.vercel.app [1m 23s]
✔ Deployed to production. Run `vercel --prod` to overwrite later deployments.
```

---

### Step 6: Configure Custom Domain

**In Vercel Dashboard:**

1. Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `app.strivetech.ai`
4. Click "Add"

**Vercel provides DNS configuration:**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 300
```

**In Your DNS Provider (e.g., Cloudflare, Namecheap):**

1. Go to DNS settings for `strivetech.ai`
2. Add CNAME record:
   - **Type:** CNAME
   - **Name:** app
   - **Target:** cname.vercel-dns.com
   - **TTL:** 300 (or Auto)
3. Save changes

**Wait for DNS propagation** (5-60 minutes)

**Verify:**
```bash
nslookup app.strivetech.ai
```

**Expected:** Should resolve to Vercel's servers

---

### Step 7: Verify SSL/TLS

Vercel automatically provisions SSL certificate:

1. Wait ~1-2 minutes after domain verification
2. Test HTTPS: https://app.strivetech.ai
3. Verify certificate:
   - Click lock icon in browser
   - Check certificate is valid
   - Issued by Let's Encrypt

**Force HTTPS:**
- Vercel automatically redirects HTTP → HTTPS
- No additional configuration needed

---

## ✅ Post-Deployment Verification

### 1. Health Check

```bash
curl https://app.strivetech.ai/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-04T12:00:00.000Z",
  "environment": "production",
  "checks": {
    "database": "connected",
    "environment": "valid",
    "optional_services": "available"
  }
}
```

**If unhealthy:**
- Check Vercel logs: `vercel logs --follow`
- Verify environment variables in Vercel dashboard
- Check database connectivity

---

### 2. Manual Smoke Tests

**Authentication:**
- [ ] Navigate to https://app.strivetech.ai
- [ ] Click "Sign Up" or "Login"
- [ ] Create account / Login with test user
- [ ] Verify redirect to dashboard
- [ ] Logout successfully

**CRM (Employee Role):**
- [ ] Navigate to /crm
- [ ] Create new customer
- [ ] View customer list
- [ ] Edit customer details
- [ ] Delete customer
- [ ] Verify multi-tenant isolation

**Projects:**
- [ ] Navigate to /projects
- [ ] Create new project
- [ ] Assign team members
- [ ] Update project status
- [ ] Verify RBAC (role-based access)

**AI Assistant:**
- [ ] Open AI chat
- [ ] Send test message
- [ ] Receive AI response
- [ ] Verify conversation history

**RBAC:**
- [ ] Test ADMIN can access /dashboard/admin
- [ ] Test EMPLOYEE cannot access admin routes
- [ ] Test CLIENT has read-only access

---

### 3. Monitor Logs

```bash
# Real-time logs
vercel logs --follow

# Or in Vercel Dashboard
# Project → Deployments → [Latest] → Logs
```

**Watch for:**
- ✅ Successful requests (200, 304)
- ✅ Database queries working
- ❌ 500 errors
- ❌ Environment variable errors
- ❌ Database connection failures

---

### 4. Performance Check

**Via Vercel Analytics:**
1. Project → Analytics
2. Check Core Web Vitals:
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

**Lighthouse (Manual):**
1. Open Chrome DevTools
2. Lighthouse tab
3. Generate report
4. Target: 90+ score

---

## 🔄 Updating Deployment

### Minor Updates (Code Changes)

```bash
# Make changes
git add .
git commit -m "Update: description"
git push origin main

# Deploy
vercel --prod
```

### Database Schema Changes

```bash
# 1. Update schema: ../shared/prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name description --schema=../shared/prisma/schema.prisma

# 3. Deploy code
vercel --prod

# 4. Run migration on production
./scripts/migrate-production.sh
```

---

## 🆘 Troubleshooting

### Build Fails

**Error:** `Build failed with exit code 1`

**Solutions:**
- Check Vercel build logs
- Verify dependencies in package.json
- Run `npm run build` locally to reproduce
- Check environment variables are set

---

### Database Connection Failed

**Error:** `Can't reach database server`

**Solutions:**
- Verify DATABASE_URL is correct
- Check Supabase database is running
- Verify IP allowlist in Supabase (allow all 0.0.0.0/0 for Vercel)
- Test connection: `npx prisma db pull`

---

### Missing Environment Variables

**Error:** `Missing environment variables: DATABASE_URL`

**Solutions:**
- Go to Vercel → Settings → Environment Variables
- Add missing variables
- Redeploy: `vercel --prod` (triggers rebuild with new vars)

---

### Domain Not Resolving

**Error:** `DNS_PROBE_FINISHED_NXDOMAIN`

**Solutions:**
- Verify CNAME record in DNS provider
- Check TTL (may take time to propagate)
- Use `nslookup app.strivetech.ai` to verify
- Wait up to 24 hours for full propagation (usually < 1 hour)

---

### Health Check Fails

**Error:** 500 from `/api/health`

**Solutions:**
- Check Vercel logs for specific error
- Verify DATABASE_URL connection
- Verify all required env vars are set
- Test Prisma connection: `prisma studio`

---

## 📊 Monitoring & Maintenance

### Daily

- ✅ Check Vercel Analytics (traffic, errors)
- ✅ Review error logs (if > 0.1% error rate)
- ✅ Monitor uptime (target: 99.9%)

### Weekly

- ✅ Review performance metrics
- ✅ Check database performance (Supabase dashboard)
- ✅ Update dependencies: `npm outdated`

### Monthly

- ✅ Security audit: `npm audit`
- ✅ Rotate API keys (if required)
- ✅ Review and optimize database queries
- ✅ Check disk space (Supabase)

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Production App:** https://app.strivetech.ai
- **Health Check:** https://app.strivetech.ai/api/health
- **Documentation:** [docs/ENVIRONMENT.md](./ENVIRONMENT.md), [docs/ROLLBACK.md](./ROLLBACK.md)

---

## 📞 Support

**For deployment issues:**
1. Check this guide first
2. Review Vercel logs: `vercel logs`
3. Check Supabase status: https://status.supabase.com
4. Vercel support: https://vercel.com/support

**For rollback:**
- See [docs/ROLLBACK.md](./ROLLBACK.md)
- Emergency: `./scripts/rollback.sh`

---

**Last Updated:** 2025-01-04
**Next Steps:** Monitor deployment for 1 hour, run smoke tests, check metrics
