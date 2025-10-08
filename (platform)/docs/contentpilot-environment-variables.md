# ContentPilot Environment Variables

**Module:** CMS & Marketing
**Version:** 1.0
**Last Updated:** 2025-10-07

## Required Environment Variables

### Core Database & Auth

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"

# NextAuth
NEXTAUTH_URL="https://app.strivetech.ai"
NEXTAUTH_SECRET="[RANDOM-SECRET-64-CHARS]"
```

**Notes:**
- `DATABASE_URL`: Used by Prisma for queries (connection pooling via pgbouncer)
- `DIRECT_URL`: Used by Prisma for migrations (direct database connection)
- `SUPABASE_SERVICE_ROLE_KEY`: **NEVER expose to client** (server-only)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

---

### ContentPilot-Specific

```bash
# Storage
NEXT_PUBLIC_STORAGE_BUCKET="media-assets"
SUPABASE_STORAGE_URL="https://[PROJECT-REF].supabase.co/storage/v1"

# Mock Data Mode (Development Only)
NEXT_PUBLIC_USE_MOCKS="false"  # Set to "true" for mock data mode
```

**Notes:**
- `NEXT_PUBLIC_STORAGE_BUCKET`: Supabase bucket for media uploads
- `NEXT_PUBLIC_USE_MOCKS`: Toggle between mock data and real database

---

### Email Campaigns (Optional)

If you're using the email campaign feature, configure SMTP:

```bash
# SMTP Configuration
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="[SENDGRID-API-KEY]"
SMTP_FROM_EMAIL="noreply@strivetech.ai"
SMTP_FROM_NAME="Strive Tech"

# Or use alternative providers:
# - AWS SES: smtp.us-east-1.amazonaws.com
# - Mailgun: smtp.mailgun.org
# - Postmark: smtp.postmarkapp.com
```

**Provider Recommendations:**
- **SendGrid**: Free tier (100 emails/day), easy setup
- **AWS SES**: Pay-as-you-go ($0.10 per 1,000 emails)
- **Postmark**: $1.25 per 1,000 emails, excellent deliverability
- **Mailgun**: Free tier (5,000 emails/month)

---

### AI Features (Optional)

If you're using AI-powered content assistance:

```bash
# OpenRouter (Multi-model AI)
OPENROUTER_API_KEY="[OPENROUTER-KEY]"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"

# Or direct model providers:
# OpenAI
OPENAI_API_KEY="[OPENAI-KEY]"

# Anthropic
ANTHROPIC_API_KEY="[ANTHROPIC-KEY]"
```

**Notes:**
- OpenRouter provides unified API for multiple AI models
- ContentPilot AI features: content suggestions, SEO optimization, headline generation

---

### Rate Limiting (Recommended)

```bash
# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_URL="https://[ENDPOINT].upstash.io"
UPSTASH_REDIS_TOKEN="[TOKEN]"
```

**Purpose:**
- Prevent abuse (API rate limiting)
- Protect against spam (campaign sending limits)
- Cache frequently accessed data

**Setup:**
1. Create free Upstash account: https://upstash.com
2. Create Redis database
3. Copy URL and token to `.env.local`

---

### Analytics (Optional)

```bash
# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Plausible Analytics (Privacy-friendly alternative)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="app.strivetech.ai"
```

**Notes:**
- Track content performance
- Measure campaign effectiveness
- User behavior analytics

---

## Environment Setup Guide

### Development (.env.local)

Create `.env.local` in `(platform)/` directory:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit with your values
nano .env.local  # or use VS Code
```

**Required for development:**
- Database URLs (Supabase)
- Auth keys (Supabase + NextAuth)
- Storage bucket name

**Optional for development:**
- SMTP (use mock mode or console logs)
- AI keys (features gracefully degrade)
- Rate limiting (not enforced in dev)

---

### Staging (.env.staging)

Create `.env.staging` for staging environment:

```bash
# Same as production but with staging database
DATABASE_URL="postgresql://postgres:[PASSWORD]@staging-db.supabase.co:6543/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@staging-db.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://staging-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[STAGING-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[STAGING-SERVICE-ROLE-KEY]"

NEXTAUTH_URL="https://staging.app.strivetech.ai"
NEXTAUTH_SECRET="[DIFFERENT-SECRET]"

# Use real SMTP in staging
SMTP_HOST="smtp.sendgrid.net"
SMTP_USER="apikey"
SMTP_PASSWORD="[STAGING-SENDGRID-KEY]"

# Test AI features
OPENROUTER_API_KEY="[TEST-KEY]"
```

**Purpose:**
- Test with production-like data
- Verify email sending works
- Test AI integrations
- Catch environment-specific bugs

---

### Production (Vercel Environment Variables)

Configure in Vercel dashboard:

**Step 1: Navigate to Project Settings**
```
Vercel Dashboard → Project → Settings → Environment Variables
```

**Step 2: Add Required Variables**

For each variable:
1. Click "Add New"
2. Enter key name (e.g., `DATABASE_URL`)
3. Enter value
4. Select environment: **Production** (and optionally Preview, Development)
5. Click "Save"

**Step 3: Mark Sensitive Variables**

Ensure these are **NOT** exposed to browser:
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `SMTP_PASSWORD`
- `OPENROUTER_API_KEY`

**Variables that ARE safe to expose (start with NEXT_PUBLIC_):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STORAGE_BUCKET`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

---

## Security Best Practices

### 1. Secret Rotation

**Rotate secrets regularly:**
- `NEXTAUTH_SECRET`: Every 90 days
- `SUPABASE_SERVICE_ROLE_KEY`: On staff changes
- `SMTP_PASSWORD`: Every 90 days
- API keys: Every 90 days or on breach

**How to rotate:**
1. Generate new secret
2. Add to Vercel (both old and new)
3. Deploy with both secrets active (transition period)
4. Update all systems to use new secret
5. Remove old secret after 7 days

### 2. Secret Storage

**Never commit secrets:**
- Add `.env.local` to `.gitignore`
- Use `.env.example` for templates only
- Store production secrets in password manager
- Use Vercel's encrypted storage

**Backup critical secrets:**
- Document where each secret came from
- Store recovery codes securely
- Keep backups encrypted

### 3. Access Control

**Limit who can access secrets:**
- Vercel: Only admins have access to environment variables
- Supabase: Use API keys, not database credentials
- Team: Rotate secrets when team members leave

### 4. Monitoring

**Watch for secret exposure:**
- GitHub secret scanning (automatic)
- Vercel build logs (review for leaks)
- Application logs (ensure no secrets logged)

**If secret is exposed:**
1. Rotate immediately
2. Audit access logs
3. Review git history
4. Notify security team

---

## Validation Checklist

Before deploying, verify all required variables are set:

### Development
- [ ] `DATABASE_URL` configured
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured
- [ ] `NEXTAUTH_SECRET` generated
- [ ] `NEXTAUTH_URL` set to `http://localhost:3000`

### Staging
- [ ] All development variables configured
- [ ] Staging database URL configured
- [ ] SMTP credentials configured (real sending)
- [ ] `NEXTAUTH_URL` set to staging domain

### Production
- [ ] All staging variables configured
- [ ] Production database URL configured
- [ ] Production Supabase keys configured
- [ ] Production SMTP configured
- [ ] `NEXTAUTH_URL` set to `https://app.strivetech.ai`
- [ ] All secrets marked as sensitive in Vercel
- [ ] No `NEXT_PUBLIC_USE_MOCKS` (should be false or absent)

### Optional Features
- [ ] AI features: `OPENROUTER_API_KEY` configured
- [ ] Rate limiting: Upstash Redis configured
- [ ] Analytics: GA or Plausible configured
- [ ] Email campaigns: SMTP fully tested

---

## Troubleshooting

### Issue: Environment variable not found

**Symptoms:**
```
Error: Environment variable DATABASE_URL is not set
```

**Solutions:**
1. Check variable name is correct (case-sensitive)
2. Verify `.env.local` exists in project root
3. Restart dev server (`npm run dev`)
4. Check Vercel deployment logs for missing variables

### Issue: NEXT_PUBLIC_ variable not updating

**Symptoms:**
- Changed `NEXT_PUBLIC_STORAGE_BUCKET` but using old value

**Solutions:**
1. Restart dev server (variables are embedded at build time)
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

### Issue: Database connection fails

**Symptoms:**
```
Error: Can't reach database server at db.xxx.supabase.co:6543
```

**Solutions:**
1. Check `DATABASE_URL` format (correct port, password, database)
2. Verify Supabase project is not paused (free tier auto-pauses)
3. Check IP whitelist (Vercel IPs allowed)
4. Test connection: `psql $DATABASE_URL`

### Issue: Supabase service role key not working

**Symptoms:**
```
Error: Invalid API key
```

**Solutions:**
1. Verify using `SUPABASE_SERVICE_ROLE_KEY` not `SUPABASE_ANON_KEY`
2. Check key hasn't been rotated in Supabase dashboard
3. Ensure no extra whitespace in variable value
4. Verify key is set in server-side code only (not client)

### Issue: SMTP authentication failed

**Symptoms:**
```
Error: Invalid login credentials
```

**Solutions:**
1. Verify SMTP username/password correct
2. Check SMTP host and port (587 for TLS, 465 for SSL)
3. Ensure sender email is verified in provider dashboard
4. Test with SMTP testing tool (e.g., `swaks`)

---

## Example .env.local

```bash
# ============================================
# CONTENTPILOT ENVIRONMENT VARIABLES
# ============================================

# --------------------------------------------
# Core Database & Auth (REQUIRED)
# --------------------------------------------
DATABASE_URL="postgresql://postgres:your-password@db.abc123xyz.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:your-password@db.abc123xyz.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://abc123xyz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"

# --------------------------------------------
# Storage (REQUIRED)
# --------------------------------------------
NEXT_PUBLIC_STORAGE_BUCKET="media-assets"
SUPABASE_STORAGE_URL="https://abc123xyz.supabase.co/storage/v1"

# --------------------------------------------
# Mock Data Mode (Development Only)
# --------------------------------------------
NEXT_PUBLIC_USE_MOCKS="false"

# --------------------------------------------
# Email Campaigns (Optional)
# --------------------------------------------
# SMTP_HOST="smtp.sendgrid.net"
# SMTP_PORT="587"
# SMTP_USER="apikey"
# SMTP_PASSWORD="SG.xxxxxxxxxxxxx"
# SMTP_FROM_EMAIL="noreply@strivetech.ai"
# SMTP_FROM_NAME="Strive Tech"

# --------------------------------------------
# AI Features (Optional)
# --------------------------------------------
# OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxxx"
# OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"

# --------------------------------------------
# Rate Limiting (Optional)
# --------------------------------------------
# UPSTASH_REDIS_URL="https://your-endpoint.upstash.io"
# UPSTASH_REDIS_TOKEN="AXxxxxxxxxxxxx"

# --------------------------------------------
# Analytics (Optional)
# --------------------------------------------
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
# NEXT_PUBLIC_PLAUSIBLE_DOMAIN="app.strivetech.ai"
```

---

## Quick Reference

### Variable Categories

| Category | Count | Required | Purpose |
|----------|-------|----------|---------|
| Core Database & Auth | 7 | ✅ Yes | Database, authentication, sessions |
| Storage | 2 | ✅ Yes | Media uploads, file storage |
| Mock Data | 1 | ❌ No | Development mode toggle |
| Email Campaigns | 6 | ❌ No | SMTP email sending |
| AI Features | 2 | ❌ No | AI content assistance |
| Rate Limiting | 2 | ⚠️ Recommended | API protection |
| Analytics | 2 | ❌ No | Usage tracking |

### Minimum Setup (Development)

To run ContentPilot in development with core features only:

```bash
DATABASE_URL="..."
DIRECT_URL="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_STORAGE_BUCKET="media-assets"
```

**Total: 8 variables**

### Recommended Setup (Production)

For production deployment with all features:

**Required (8) + Recommended (2 rate limiting) + Optional based on needs**

**Total: 10-20 variables depending on features enabled**

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Next Review**: Before production deployment
**Maintained By**: DevOps & Engineering Teams
