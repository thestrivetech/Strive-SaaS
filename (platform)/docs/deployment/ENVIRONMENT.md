# Environment Variables Guide

Complete guide to environment variables for Strive Tech Platform deployment.

---

## 📋 Required Environment Variables

### Database (Supabase PostgreSQL)

**`DATABASE_URL`** (SECRET)
- **Purpose:** PostgreSQL connection string for Prisma (connection pooling)
- **Format:** `postgresql://user:password@host:5432/database?pgbouncer=true&schema=public`
- **Source:** Supabase Dashboard → Settings → Database → Connection Pooling
- **Example:** `postgresql://postgres:[PASSWORD]@db.example.supabase.co:5432/postgres?pgbouncer=true`

**`DIRECT_URL`** (SECRET)
- **Purpose:** Direct database connection (for migrations)
- **Format:** `postgresql://user:password@host:5432/database`
- **Source:** Supabase Dashboard → Settings → Database → Connection String
- **Example:** `postgresql://postgres:[PASSWORD]@db.example.supabase.co:5432/postgres`

---

### Supabase Authentication & Storage

**`NEXT_PUBLIC_SUPABASE_URL`** (PUBLIC)
- **Purpose:** Supabase project URL
- **Format:** `https://[project-id].supabase.co`
- **Source:** Supabase Dashboard → Settings → API
- **Example:** `https://abcdefghijklmnopqrst.supabase.co`

**`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (PUBLIC)
- **Purpose:** Supabase anonymous key (client-side auth)
- **Format:** Long JWT token starting with `eyJ`
- **Source:** Supabase Dashboard → Settings → API → anon public
- **Security:** Safe to expose in client (RLS protects data)

**`SUPABASE_SERVICE_ROLE_KEY`** (SECRET)
- **Purpose:** Supabase service role key (server-side only)
- **Format:** Long JWT token starting with `eyJ`
- **Source:** Supabase Dashboard → Settings → API → service_role secret
- **⚠️ CRITICAL:** NEVER expose this to client or commit to git
- **Usage:** Server-side operations that bypass RLS

---

### AI Providers

**`OPENROUTER_API_KEY`** (SECRET)
- **Purpose:** OpenRouter API key for AI models
- **Format:** `sk-or-v1-[random-string]`
- **Source:** https://openrouter.ai/keys
- **Used for:** AI Assistant (Sai) chat functionality

**`GROQ_API_KEY`** (SECRET)
- **Purpose:** Groq API key for fast inference
- **Format:** `gsk_[random-string]`
- **Source:** https://console.groq.com/keys
- **Used for:** Alternative AI provider for faster responses

---

### Rate Limiting (Upstash Redis)

**`UPSTASH_REDIS_REST_URL`**
- **Purpose:** Upstash Redis REST URL
- **Format:** `https://[region]-[id].upstash.io`
- **Source:** Upstash Dashboard → Your Redis → REST API → UPSTASH_REDIS_REST_URL
- **Used for:** Rate limiting on auth and API routes

**`UPSTASH_REDIS_REST_TOKEN`** (SECRET)
- **Purpose:** Upstash Redis authentication token
- **Format:** Random string
- **Source:** Upstash Dashboard → Your Redis → REST API → UPSTASH_REDIS_REST_TOKEN
- **Used for:** Authenticating with Redis

---

### Stripe (Payment Processing)

**`STRIPE_SECRET_KEY`** (SECRET)
- **Purpose:** Stripe secret key for server-side operations
- **Format:** `sk_live_[random-string]` (production) or `sk_test_[random-string]` (test)
- **Source:** Stripe Dashboard → Developers → API Keys → Secret key
- **Used for:** Creating subscriptions, handling payments

**`STRIPE_WEBHOOK_SECRET`** (SECRET)
- **Purpose:** Stripe webhook signing secret
- **Format:** `whsec_[random-string]`
- **Source:** Stripe Dashboard → Developers → Webhooks → Signing secret
- **Used for:** Verifying webhook authenticity

**`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** (PUBLIC)
- **Purpose:** Stripe publishable key for client-side
- **Format:** `pk_live_[random-string]` (production) or `pk_test_[random-string]` (test)
- **Source:** Stripe Dashboard → Developers → API Keys → Publishable key
- **Used for:** Stripe Elements, client-side payment forms

---

### Application Configuration

**`NEXT_PUBLIC_APP_URL`** (PUBLIC)
- **Purpose:** Application URL (for redirects, webhooks, etc.)
- **Production:** `https://app.strivetech.ai`
- **Development:** `http://localhost:3000`
- **Used for:** OAuth callbacks, webhook URLs, email links

**`NODE_ENV`**
- **Purpose:** Application environment
- **Values:** `development` | `production` | `test`
- **Production:** `production`
- **Auto-set by Vercel in production**

---

## 🔧 Setting Environment Variables in Vercel

### Step 1: Access Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **platform**
3. Navigate to: **Settings → Environment Variables**

### Step 2: Add Variables

For each variable above:

1. Click **"Add New"**
2. **Key:** Enter variable name (e.g., `DATABASE_URL`)
3. **Value:** Paste the value
4. **Environment:** Select **"Production"** (or "Preview", "Development" if needed)
5. **Sensitive:** ✅ Check for SECRET variables (marks as encrypted)
6. Click **"Save"**

### Step 3: Bulk Import (Optional)

Vercel also supports bulk import via `.env` file upload:

1. Create `.env.production` locally (DO NOT COMMIT)
2. Add all production variables
3. In Vercel: Settings → Environment Variables → Import `.env` → Upload file

---

## 🔒 Security Best Practices

### DO ✅

- ✅ Mark all SECRET variables as "Sensitive" in Vercel
- ✅ Use different keys for production vs development
- ✅ Rotate keys periodically (every 90 days)
- ✅ Use connection pooling URL for `DATABASE_URL`
- ✅ Use direct URL for `DIRECT_URL` (migrations only)
- ✅ Verify HTTPS for all public URLs
- ✅ Keep `.env.local` in `.gitignore`

### DON'T ❌

- ❌ NEVER commit `.env` or `.env.local` to git
- ❌ NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client
- ❌ NEVER hardcode API keys in code
- ❌ NEVER share production keys in Slack/email
- ❌ NEVER use production keys in development
- ❌ NEVER log environment variables

---

## 🧪 Environment Tiers

### Development (Local)

File: `.env.local` (gitignored)

```bash
# Database (local or dev Supabase)
DATABASE_URL="postgresql://localhost:5432/platform_dev"
DIRECT_URL="postgresql://localhost:5432/platform_dev"

# Supabase (dev project)
NEXT_PUBLIC_SUPABASE_URL="https://dev-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."  # Dev service key

# AI (test keys)
OPENROUTER_API_KEY="sk-or-test-..."
GROQ_API_KEY="gsk_test..."

# Redis (dev)
UPSTASH_REDIS_REST_URL="https://dev-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="dev-token"

# Stripe (test mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Production (Vercel)

Set in Vercel Dashboard (all production values):

```
DATABASE_URL → Supabase production pooling URL
DIRECT_URL → Supabase production direct URL
NEXT_PUBLIC_SUPABASE_URL → Production project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY → Production anon key
SUPABASE_SERVICE_ROLE_KEY → Production service role key (SENSITIVE)
OPENROUTER_API_KEY → Production API key (SENSITIVE)
GROQ_API_KEY → Production API key (SENSITIVE)
UPSTASH_REDIS_REST_URL → Production Redis URL
UPSTASH_REDIS_REST_TOKEN → Production Redis token (SENSITIVE)
STRIPE_SECRET_KEY → sk_live_... (SENSITIVE)
STRIPE_WEBHOOK_SECRET → whsec_... (SENSITIVE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → pk_live_...
NEXT_PUBLIC_APP_URL → https://app.strivetech.ai
NODE_ENV → production (auto-set)
```

---

## 🔍 Verification

### Check Environment in Code

Use `lib/env.ts` to validate all required vars at startup:

```typescript
import { env } from '@/lib/env';

// This will throw error if any required var is missing
console.log('Environment validated:', env.NODE_ENV);
```

### Health Check Endpoint

After deployment, verify environment:

```bash
curl https://app.strivetech.ai/api/health

# Should return:
{
  "status": "healthy",
  "checks": {
    "database": "connected",
    "environment": "valid"
  }
}
```

### Common Issues

**"Missing environment variables"**
- Check variable is set in Vercel for correct environment
- Redeploy after adding variables
- Verify variable name spelling (case-sensitive)

**"Database connection failed"**
- Verify `DATABASE_URL` is connection pooling URL
- Check Supabase database is running
- Verify IP allowlist in Supabase (should allow Vercel IPs)

**"Unauthorized" errors with Supabase**
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify not using service key on client (use anon key)
- Check RLS policies are configured

---

## 📝 Template

Use this template for `.env.local` (development):

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/db"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# AI Providers
OPENROUTER_API_KEY="sk-or-v1-..."
GROQ_API_KEY="gsk_..."

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

**Last Updated:** 2025-01-04
**For Questions:** Check `docs/DEPLOYMENT.md` for deployment steps
