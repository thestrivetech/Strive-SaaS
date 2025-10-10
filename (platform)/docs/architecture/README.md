# Architecture Documentation

System architecture, API reference, and security implementation for the Strive Tech SaaS Platform.

[← Back to Documentation Index](../README.md)

---

## 📋 Contents

### Core Architecture
- [**AUTH-ARCHITECTURE.md**](./AUTH-ARCHITECTURE.md) - Authentication & authorization flow
- [**API-REFERENCE.md**](./API-REFERENCE.md) - Server Actions & API contracts

### Security
- [**APPLY-RLS-FIX.md**](./security/APPLY-RLS-FIX.md) - Row Level Security implementation
- [**SECURITY-REMEDIATION-REPORT.md**](./security/SECURITY-REMEDIATION-REPORT.md) - Security audit findings & fixes
- [**server-side-only-issues.txt**](./security/server-side-only-issues.txt) - Server-only imports explanation

---

## 🏗️ Authentication Architecture

**File:** [AUTH-ARCHITECTURE.md](./AUTH-ARCHITECTURE.md)

Complete authentication flow documentation:
- Supabase Auth integration
- Lazy user sync to Prisma
- Session management (httpOnly cookies)
- Onboarding flow
- RBAC integration

**Key Concepts:**
- Supabase handles ALL authentication (passwords, sessions, tokens)
- Prisma handles application data only
- Lazy sync on first authenticated request
- Multi-tenant organization setup during onboarding

---

## 🔌 API Reference

**File:** [API-REFERENCE.md](./API-REFERENCE.md)

Server Actions, endpoints, and API contracts:
- CRM module APIs
- Transaction module APIs
- AI module APIs
- Marketplace APIs
- Webhook endpoints

**Standards:**
- All mutations via Server Actions
- Zod validation on all inputs
- RBAC enforcement
- Multi-tenant isolation

---

## 🔒 Security Implementation

**Location:** [`security/`](./security/)

### Row Level Security (RLS)

**File:** [APPLY-RLS-FIX.md](./security/APPLY-RLS-FIX.md)

Complete RLS implementation guide:
- Why RLS is critical for multi-tenancy
- Setting up RLS policies in Supabase
- Prisma middleware for tenant context
- Testing RLS policies

**Critical Pattern:**
```typescript
import { setTenantContext } from '@/lib/database/prisma-middleware';

// ALWAYS set before queries
await setTenantContext({
  organizationId: session.user.organizationId,
  userId: session.user.id
});

// Now queries auto-filter by organization
const data = await prisma.customer.findMany();
```

### Security Audit

**File:** [SECURITY-REMEDIATION-REPORT.md](./security/SECURITY-REMEDIATION-REPORT.md)

Security audit findings and remediation:
- Localhost bypass removal (CRITICAL)
- Server-only imports enforcement
- Secret exposure prevention
- Input validation gaps

### Server-Only Imports

**File:** [server-side-only-issues.txt](./security/server-side-only-issues.txt)

Detailed explanation of server-only import requirements:
- Why certain files need 'server-only' imports
- Build errors and solutions
- Security implications
- Implementation strategy

---

## 🎯 Key Principles

### Multi-Tenancy
Every query must filter by `organizationId` to prevent data leaks across tenants.

**Enforcement Methods:**
1. Prisma middleware (automatic filtering)
2. RLS policies (database-level protection)
3. Manual filtering in queries (explicit)

### RBAC (Role-Based Access Control)
Dual-role system:
- **Global Role:** `SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `USER`
- **Organization Role:** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`

Both must be checked for authorization.

### Type Safety
- TypeScript strict mode
- Zod schemas for all inputs
- Generated Prisma types
- No `any` types (enforced by ESLint)

### Server-First
- Server Components by default
- Minimize client JavaScript
- Server Actions for mutations
- Edge runtime where possible

---

## 📚 Related Documentation

### Database
- [Database Docs](../../lib/database/docs/) - Prisma, Supabase, RLS policies
- [Schema Reference](../../prisma/SCHEMA-QUICK-REF.md) - Complete schema overview

### Authentication
- [Auth Onboarding Guide](../guides/developer/AUTH-ONBOARDING-GUIDE.md) - Developer implementation guide

### Deployment
- [Environment Setup](../deployment/ENVIRONMENT.md) - Environment variables
- [Deployment Checklist](../deployment/DEPLOYMENT-CHECKLIST.md) - Pre-deployment verification

---

## 🔍 Quick Reference

| Topic | File | Key Info |
|-------|------|----------|
| Auth Flow | AUTH-ARCHITECTURE.md | Supabase → Lazy Sync → Prisma |
| APIs | API-REFERENCE.md | Server Actions, webhooks |
| RLS | security/APPLY-RLS-FIX.md | setTenantContext() pattern |
| Security Audit | security/SECURITY-REMEDIATION-REPORT.md | Critical fixes applied |
| Server-Only | security/server-side-only-issues.txt | Import restrictions |

---

**Last Updated:** 2025-10-10
