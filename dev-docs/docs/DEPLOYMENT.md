# Deployment Guide - Strive Tech Unified App

**Version:** 2.0 (Post-Migration)
**Last Updated:** 2025-09-30
**Status:** Production-Ready

---

## 🎯 Overview

This guide covers deploying the unified Next.js application that serves both:
- **Marketing Site:** strivetech.ai (web pages)
- **SaaS Platform:** app.strivetech.ai (application)

Both sites deploy together in a single build, using host-based routing via middleware.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint errors addressed (or documented/deferred)
- [ ] Build succeeds: `npm run build`
- [ ] No sensitive data in code (API keys, secrets)

### Environment Configuration
- [ ] All environment variables documented
- [ ] Production values ready (different from dev)
- [ ] Secrets generated securely
- [ ] Database migrations applied

### Testing
- [ ] All marketing pages load
- [ ] All platform pages load (with auth)
- [ ] Forms submit correctly
- [ ] Database operations work
- [ ] Authentication flows tested

---

## 🔐 Required Environment Variables

### Database (Supabase PostgreSQL)

**Primary Connection (with PgBouncer for connection pooling):**
```bash
DATABASE_URL="postgres://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

**Direct Connection (for migrations):**
```bash
DIRECT_URL="postgres://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Where to get:**
- Supabase Dashboard → Project Settings → Database → Connection String
- Current Project ID: `bztkedvdjbxffpjxihtc`
- Choose "Connection Pooling" for DATABASE_URL
- Choose "Session" for DIRECT_URL

---

### Supabase (Authentication & Database)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."
```

**Where to get:**
- Supabase Dashboard → Project Settings → API
- `NEXT_PUBLIC_*` vars are safe for client-side (anon key)
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** - never expose to client!

**Security Notes:**
- ⚠️ **NEVER** commit service role key to git
- ⚠️ Only use service role key in Server Actions
- ✅ Anon key is safe for client-side (has RLS protection)

---

### Authentication

```bash
JWT_SECRET="[RANDOM-32-BYTE-STRING]"
```

**How to generate:**
```bash
openssl rand -base64 32
```

**Purpose:**
- Signs JWTs for session tokens
- Must be unique per environment (dev/staging/production)

---

### Application URLs

```bash
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
NEXT_PUBLIC_MARKETING_URL="https://strivetech.ai"
NODE_ENV="production"
```

**Development values:**
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MARKETING_URL="http://localhost:3000"
NODE_ENV="development"
```

**Purpose:**
- Used for redirects, emails, API callbacks
- `NEXT_PUBLIC_*` prefix makes them available in browser
- Middleware uses these for host-based routing

---

### Chatbot Integration

```bash
NEXT_PUBLIC_CHATBOT_URL="https://chatbot.strivetech.ai"
```

**Purpose:**
- URL of iframe-embedded chatbot
- Used by `/chatbot-sai` page
- Production: Dedicated subdomain
- Development: Can use localhost with different port

---

### AI Integration (Optional)

```bash
OPENROUTER_API_KEY="sk-or-v1-..."
GROQ_API_KEY="gsk_..."
```

**Where to get:**
- OpenRouter: https://openrouter.ai/keys
- Groq: https://console.groq.com/keys

**Purpose:**
- Powers AI chat features
- Used in `/ai` platform routes
- Not required for basic functionality

---

### Stripe (Billing - Optional)

```bash
STRIPE_SECRET_KEY="sk_test_... or sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_test_... or pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Where to get:**
- Stripe Dashboard → Developers → API Keys
- Use test keys for dev/staging
- Use live keys for production only

**Purpose:**
- Payment processing
- Subscription management
- Webhooks for billing events

**Setup Webhooks:**
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://app.strivetech.ai/api/webhooks/stripe`
3. Select events: `customer.subscription.*`, `invoice.*`, `payment_intent.*`
4. Copy webhook secret to env var

---

### Email (SMTP Configuration)

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="no-reply@strivetech.ai"
SMTP_PASSWORD="[APP-PASSWORD]"
SMTP_FROM="no-reply@strivetech.ai"
```

**Gmail Setup:**
1. Enable 2FA on Google account
2. Generate App Password: Google Account → Security → App Passwords
3. Use App Password (not regular password)

**Other Providers:**
- **SendGrid:** smtp.sendgrid.net:587
- **AWS SES:** email-smtp.[region].amazonaws.com:587
- **Mailgun:** smtp.mailgun.org:587

**Purpose:**
- Contact form submissions
- Transactional emails (password reset, notifications)
- Newsletter signups

---

### Vercel (CI/CD - Optional)

```bash
VERCEL_TOKEN="[YOUR-VERCEL-TOKEN]"
PROJECT_ID="prj_..."
TEAM_ID="team_..."
```

**Where to get:**
- Vercel Dashboard → Settings → Tokens
- Project Settings → General → Project ID
- Account Settings → Team ID

**Purpose:**
- Programmatic deployments
- Vercel CLI authentication
- Not required if deploying via Vercel Git integration

---

## 🚀 Deployment Steps

### Option 1: Vercel (Recommended)

**Initial Setup:**
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import repository: `Strive-SaaS/app`
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `app/`
   - Build Command: `npm run build`
   - Output Directory: `.next`

**Environment Variables:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add all required variables (see above)
3. Set for **Production** environment
4. Optionally create Preview/Development environments

**Domain Configuration:**
1. Vercel Dashboard → Project → Settings → Domains
2. Add custom domains:
   - `strivetech.ai` (marketing site)
   - `app.strivetech.ai` (platform)
3. Configure DNS (see below)

**Deployment:**
```bash
# Automatic (on git push to main)
git push origin main

# Manual (using Vercel CLI)
npm install -g vercel
vercel --prod
```

---

### Option 2: Self-Hosted (Docker)

**Create Dockerfile:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t strive-app .
docker run -p 3000:3000 --env-file .env.production strive-app
```

**Using Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

---

### Option 3: Traditional VPS (AWS, DigitalOcean, etc.)

**Server Requirements:**
- Node.js 20+
- 2GB RAM minimum
- SSL certificate (Let's Encrypt)
- Nginx or similar reverse proxy

**Setup:**
```bash
# Clone repository
git clone https://github.com/yourusername/Strive-SaaS.git
cd Strive-SaaS/app

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "strive-app" -- start
pm2 save
pm2 startup
```

**Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/strivetech
upstream nextjs {
  server localhost:3000;
}

# Marketing site
server {
  server_name strivetech.ai www.strivetech.ai;

  location / {
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  listen 443 ssl;
  ssl_certificate /etc/letsencrypt/live/strivetech.ai/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/strivetech.ai/privkey.pem;
}

# Platform app
server {
  server_name app.strivetech.ai;

  location / {
    proxy_pass http://nextjs;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  listen 443 ssl;
  ssl_certificate /etc/letsencrypt/live/app.strivetech.ai/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/app.strivetech.ai/privkey.pem;
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name strivetech.ai www.strivetech.ai app.strivetech.ai;
  return 301 https://$host$request_uri;
}
```

---

## 🌐 DNS Configuration

**For Marketing Site (strivetech.ai):**
```
Type: A
Name: @
Value: [YOUR-SERVER-IP or Vercel IP]
TTL: 300

Type: CNAME
Name: www
Value: strivetech.ai
TTL: 300
```

**For Platform (app.strivetech.ai):**
```
Type: A
Name: app
Value: [YOUR-SERVER-IP or Vercel IP]
TTL: 300
```

**For Chatbot (chatbot.strivetech.ai):**
```
Type: A
Name: chatbot
Value: [CHATBOT-SERVER-IP]
TTL: 300
```

**Vercel-Specific:**
- Vercel provides DNS automatically if using Vercel nameservers
- Or add custom domain and point A/CNAME records to Vercel
- Vercel Dashboard shows exact DNS values needed

---

## 🗄️ Database Setup

### Initial Setup (One-Time)

**1. Create Supabase Project:**
- Go to https://supabase.com/dashboard
- Create new project under "Strive Tech" organization
- Save database password securely
- Wait for project to provision (~2 minutes)

**2. Run Migrations:**
```bash
# From app/ directory
npx prisma migrate deploy
```

**3. Generate Prisma Client:**
```bash
npx prisma generate
```

**4. Seed Database (Optional):**
```bash
npx prisma db seed
```

### Ongoing Migrations

**Development:**
```bash
npx prisma migrate dev --name [migration-name]
```

**Production:**
```bash
# Automatic via Vercel/CI
npx prisma migrate deploy

# Or manual
DATABASE_URL="[PRODUCTION-URL]" npx prisma migrate deploy
```

---

## 🔒 Security Checklist

### Environment Variables
- [ ] All secrets use strong, randomly generated values
- [ ] Service role key never exposed to client
- [ ] Production env vars different from dev
- [ ] No hardcoded credentials in code

### Database
- [ ] Row Level Security (RLS) enabled
- [ ] Proper policies for multi-tenancy
- [ ] Connection pooling configured
- [ ] SSL required for connections

### Authentication
- [ ] JWT secrets rotated regularly
- [ ] Secure cookie settings (httpOnly, secure, sameSite)
- [ ] Password hashing (handled by Supabase)
- [ ] Session timeout configured

### Application
- [ ] HTTPS enforced
- [ ] Security headers configured (see next.config.mjs)
- [ ] CORS properly configured
- [ ] Rate limiting on API routes
- [ ] Input validation with Zod

### Monitoring
- [ ] Error tracking (Sentry recommended)
- [ ] Uptime monitoring
- [ ] Log aggregation
- [ ] Performance monitoring

---

## 📊 Post-Deployment Verification

### Automated Checks
```bash
# Health check
curl https://app.strivetech.ai/api/health

# Marketing site
curl -I https://strivetech.ai/

# Platform (should redirect to login)
curl -I https://app.strivetech.ai/
```

### Manual Testing Checklist
- [ ] Marketing homepage loads
- [ ] All navigation links work
- [ ] Contact form submits
- [ ] Platform login works
- [ ] Platform dashboard loads (after auth)
- [ ] Database queries work
- [ ] AI features work (if enabled)
- [ ] Emails send correctly
- [ ] Images load from correct CDN
- [ ] SSL certificates valid
- [ ] Mobile responsive

### Performance Checks
- [ ] Lighthouse score > 90 (all categories)
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Speed Index < 3.4s

---

## 🚨 Troubleshooting

### Build Fails
**Symptom:** `npm run build` fails
**Cause:** TypeScript errors, ESLint errors, or missing dependencies
**Solution:**
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Clean install
rm -rf node_modules .next
npm install
```

### Database Connection Fails
**Symptom:** "Cannot connect to database"
**Cause:** Wrong connection string or firewall
**Solution:**
1. Verify `DATABASE_URL` in env vars
2. Check Supabase project is running
3. Verify SSL mode is enabled
4. Test connection: `psql $DATABASE_URL`

### Authentication Not Working
**Symptom:** Login fails or sessions expire immediately
**Cause:** Supabase keys wrong or cookies not set
**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and anon key
2. Check cookies are httpOnly and secure in middleware
3. Verify JWT_SECRET is set
4. Check browser console for CORS errors

### Host Routing Not Working
**Symptom:** Wrong site shows on domain
**Cause:** Middleware not detecting host correctly
**Solution:**
1. Check `middleware.ts` hostname detection
2. Verify DNS points to correct server
3. Check Vercel domain configuration
4. Test: `curl -H "Host: strivetech.ai" http://localhost:3000`

### Images Not Loading
**Symptom:** 404 on image files
**Cause:** Images not in public folder or CDN misconfigured
**Solution:**
1. Verify images in `public/` directory
2. Check `next.config.mjs` image domains
3. Use Next.js `<Image>` component (not `<img>`)
4. Check network tab for actual URLs

---

## 📚 Additional Resources

**Documentation:**
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Deployment: https://vercel.com/docs
- Supabase Deployment: https://supabase.com/docs/guides/platform

**Monitoring:**
- Vercel Analytics: Built-in
- Sentry: https://sentry.io/
- LogRocket: https://logrocket.com/

**Performance:**
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- WebPageTest: https://www.webpagetest.org/
- PageSpeed Insights: https://pagespeed.web.dev/

---

## 🔄 Rollback Procedure

### Vercel
1. Vercel Dashboard → Deployments
2. Find last known good deployment
3. Click "⋮" menu → "Promote to Production"

### Self-Hosted
```bash
# With PM2
pm2 stop strive-app
git checkout [last-good-commit]
npm install
npm run build
pm2 restart strive-app

# With Docker
docker pull [previous-image-tag]
docker-compose up -d
```

### Database
```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back [migration-name]
```

---

## 📝 Environment Variable Template

Create `.env.production` with:

```bash
# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Auth
JWT_SECRET="..."

# URLs
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
NEXT_PUBLIC_MARKETING_URL="https://strivetech.ai"
NODE_ENV="production"

# Chatbot
NEXT_PUBLIC_CHATBOT_URL="https://chatbot.strivetech.ai"

# AI (Optional)
OPENROUTER_API_KEY="sk-or-..."
GROQ_API_KEY="gsk_..."

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="no-reply@strivetech.ai"
SMTP_PASSWORD="..."
SMTP_FROM="no-reply@strivetech.ai"
```

---

**Last Updated:** 2025-09-30
**Maintainer:** Grant (Strive Tech)
**Status:** ✅ Production-Ready
