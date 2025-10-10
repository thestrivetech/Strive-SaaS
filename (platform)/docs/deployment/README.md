# Deployment Documentation

Everything needed to deploy and maintain the Strive Tech SaaS Platform in production.

[← Back to Documentation Index](../README.md)

---

## 📋 Contents

### Core Deployment
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Main deployment guide
- [**DEPLOYMENT-CHECKLIST.md**](./DEPLOYMENT-CHECKLIST.md) - Pre-deployment checklist
- [**PRE-DEPLOYMENT-CHECKLIST.md**](./PRE-DEPLOYMENT-CHECKLIST.md) - Final verification steps
- [**ENVIRONMENT.md**](./ENVIRONMENT.md) - Environment variables & configuration

### Operations
- [**ROLLBACK.md**](./ROLLBACK.md) - Rollback procedures
- [**storage-setup.md**](./storage-setup.md) - Supabase Storage configuration
- [**transaction-deployment.md**](./transaction-deployment.md) - Transaction module deployment

---

## 🚀 Deployment Process

### 1. Main Deployment Guide

**File:** [DEPLOYMENT.md](./DEPLOYMENT.md)

Complete deployment process:
- Prerequisites
- Environment setup
- Database migration
- Vercel deployment
- Post-deployment verification

**Deployment Platforms:**
- **Production:** Vercel (app.strivetech.ai)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **CDN:** Vercel Edge Network

### 2. Pre-Deployment Checklists

**Files:**
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Initial checklist
- [PRE-DEPLOYMENT-CHECKLIST.md](./PRE-DEPLOYMENT-CHECKLIST.md) - Final verification

**Critical Checks:**
- ✅ Build succeeds (`npm run build`)
- ✅ Tests pass (`npm test`)
- ✅ Linting clean (`npm run lint`)
- ✅ Type checking clean (`npx tsc --noEmit`)
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ RLS policies enabled
- ✅ No secrets exposed
- ✅ No localhost bypasses

### 3. Environment Configuration

**File:** [ENVIRONMENT.md](./ENVIRONMENT.md)

Complete environment variable reference:

**Required Variables:**
```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # NEVER expose to client!

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
DOCUMENT_ENCRYPTION_KEY=...  # 64-char hex string

# NextAuth (if using)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://app.strivetech.ai
```

**Environment Files:**
- `.env.local` - Local development (NEVER commit!)
- `.env.example` - Template with placeholder values (committed)
- Vercel Environment Variables - Production secrets

---

## 🔧 Operations

### Rollback Procedures

**File:** [ROLLBACK.md](./ROLLBACK.md)

Emergency rollback procedures:
- Identifying issues requiring rollback
- Reverting Vercel deployment
- Rolling back database migrations
- Restoring from backups
- Post-rollback verification

**When to Rollback:**
- Critical production bugs
- Database corruption
- Performance degradation
- Security vulnerabilities

### Storage Configuration

**File:** [storage-setup.md](./storage-setup.md)

Supabase Storage bucket configuration:
- Bucket creation
- RLS policies for storage
- File upload/download patterns
- Access control
- CDN optimization

**Buckets:**
- `avatars` - User profile images
- `documents` - Transaction documents (encrypted)
- `attachments` - General file attachments
- `public` - Public assets

### Transaction Module Deployment

**File:** [transaction-deployment.md](./transaction-deployment.md)

Special deployment considerations for transaction module:
- Document encryption setup
- Storage bucket configuration
- Database migrations
- Feature flags
- Testing workflow

---

## ⚠️ Critical Warnings

### NEVER Deploy With:
❌ Localhost authentication bypass
❌ Mock data mode enabled
❌ Exposed service role keys
❌ Missing DOCUMENT_ENCRYPTION_KEY
❌ Disabled RLS policies
❌ Hardcoded secrets
❌ Build warnings
❌ Failing tests

### ALWAYS Verify:
✅ Environment variables set in Vercel
✅ Database migrations applied
✅ RLS policies enabled
✅ Build succeeds with zero warnings
✅ Tests pass with 80%+ coverage
✅ Type checking passes
✅ Stripe webhooks configured
✅ Backup plan in place

---

## 📊 Deployment Checklist Summary

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Build successful (zero warnings)
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] RLS policies verified
- [ ] Security audit passed

### Deployment
- [ ] Merge to main branch
- [ ] Vercel auto-deploys
- [ ] Database migrations run
- [ ] Health checks pass
- [ ] Monitoring enabled

### Post-Deployment
- [ ] Smoke tests pass
- [ ] Critical user flows verified
- [ ] Error tracking active
- [ ] Performance metrics normal
- [ ] Backup confirmed
- [ ] Team notified

---

## 🔍 Quick Reference

| Topic | File | Key Info |
|-------|------|----------|
| Main Deployment | DEPLOYMENT.md | Complete deployment process |
| Checklists | PRE-DEPLOYMENT-CHECKLIST.md | Final verification steps |
| Environment | ENVIRONMENT.md | All required env vars |
| Rollback | ROLLBACK.md | Emergency procedures |
| Storage | storage-setup.md | Supabase Storage config |
| Transactions | transaction-deployment.md | Module-specific deployment |

---

## 📚 Related Documentation

### Architecture
- [Security Implementation](../architecture/security/) - RLS, server-only imports
- [API Reference](../architecture/API-REFERENCE.md) - Endpoint documentation

### Development
- [Active Sessions](../development/update-sessions/active/) - Current work status
- [Testing](../development/testing/) - Test configuration

### Reports
- [Session Reports](../reports/sessions/) - Deployment history
- [Audit Reports](../reports/audits/) - Quality metrics

---

**Last Updated:** 2025-10-10
**Deployment Platform:** Vercel
**Database:** Supabase PostgreSQL
**Production URL:** app.strivetech.ai
