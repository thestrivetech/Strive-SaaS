# Authentication & Onboarding System

**Last Updated:** 2025-10-06
**Status:** ✅ Production Ready
**Architecture:** Supabase Auth + Prisma + Next.js 15

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Onboarding Flow](#onboarding-flow)
4. [Middleware & Route Protection](#middleware--route-protection)
5. [Environment Configuration](#environment-configuration)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Core Principle: Separation of Concerns

```
┌─────────────────┐
│  Supabase Auth  │ ← Handles ALL authentication (passwords, sessions, tokens)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Prisma      │ ← Handles application data (users, orgs, projects)
└─────────────────┘
```

**Key Points:**
- **Supabase Auth** = Authentication source of truth
- **Prisma** = Application data only (NO password handling)
- **Lazy Sync** = Users created in DB when first needed, not during auth
- **Session Storage** = httpOnly cookies (secure, HTTP-only)

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Auth Provider | Supabase Auth | User authentication, session management |
| Database ORM | Prisma | Query Supabase PostgreSQL database |
| Framework | Next.js 15 | Server Components, Server Actions, Middleware |
| State Management | React 19 | Client-side state (minimal) |
| Validation | Zod | Schema validation for forms & API |

---

## Authentication Flow

### 1. Sign Up Flow

```typescript
User submits signup form
    ↓
API Route: /api/auth/signup
    ↓
Supabase Auth → Creates user account
    ↓ (stores in auth.users table)
Returns session data
    ↓
Client redirects to login
```

**Implementation:** @Claude -> We might have to make it to where Prisma schema is then updated with user details
- **Route:** `app/api/auth/signup/route.ts`
- **Action:** `supabase.auth.signUp({ email, password })`
- **Database:** NO Prisma interaction (Supabase handles it)
- **Response:** Returns Supabase user data + verification status

### 2. Login Flow

```typescript
User submits login form
    ↓
API Route: /api/auth/login
    ↓
Supabase Auth → Validates credentials
    ↓ (checks auth.users table)
Returns session + user data
    ↓
Session stored in httpOnly cookie
    ↓
Client redirects to dashboard
```

**Implementation:**
- **Route:** `app/api/auth/login/route.ts`
- **Action:** `supabase.auth.signInWithPassword({ email, password })`
- **Session:** Stored automatically by Supabase in cookies
- **Database:** NO Prisma interaction during login

### 3. Lazy User Sync

```typescript
User accesses protected route
    ↓
Middleware → Checks Supabase session
    ↓
getCurrentUser() → Checks Prisma database
    ↓
User NOT in DB? → Create from Supabase data
    ↓
Return user with organization data
```

**Implementation:**
- **File:** `lib/auth/auth-helpers.ts`
- **Function:** `getCurrentUser()`
- **Logic:**
  ```typescript
  let user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    // Lazy sync: Create user from Supabase session
    user = await prisma.users.create({
      data: {
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || email.split('@')[0],
        avatar_url: session.user.user_metadata?.avatar_url,
      }
    });
  }
  ```

**Benefits:**
- No database dependency during authentication
- Automatic user creation when needed
- Supabase remains single source of truth

---

## Onboarding Flow

### Complete Flow Diagram

```
New user signs up
    ↓
Login successful (Supabase session created)
    ↓
Lazy sync (User created in DB)
    ↓
requireAuth() checks organization
    ↓
No organization? → Redirect to /onboarding/organization
    ↓
User creates organization
    ↓
Organization + membership created in DB
    ↓
Redirect to /real-estate/dashboard
    ↓
Has organization? → Dashboard access granted
```

### Onboarding Logic

**Check in `requireAuth()` (lib/auth/auth-helpers.ts:112-124):**
```typescript
export const requireAuth = async (): Promise<EnhancedUser> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  // Check if user has completed onboarding
  if (!user.organization_members || user.organization_members.length === 0) {
    redirect('/onboarding/organization');
  }

  return enhanceUser(user);
};
```

**Middleware Protection (lib/middleware/auth.ts:124-142):**
```typescript
// Prevent users WITH organization from accessing onboarding
if (user && path.startsWith('/onboarding')) {
  const dbUser = await prisma.users.findUnique({
    where: { email: user.email! },
    select: { organization_members: true }
  });

  if (dbUser?.organization_members?.length > 0) {
    redirect('/real-estate/dashboard'); // Already has org
  }
}
```

### Onboarding Page

**Location:** `app/(auth)/onboarding/organization/page.tsx`

**Features:**
- Organization name (required)
- Description (optional)
- Creates organization + membership in one transaction
- Redirects to dashboard on success

**API Endpoint:** `app/api/onboarding/organization/route.ts`
```typescript
// Create organization
const organization = await prisma.organizations.create({
  data: { name, slug, description, subscription_status: 'TRIAL' }
});

// Add user as OWNER
await prisma.organization_members.create({
  data: {
    user_id: user.id,
    organization_id: organization.id,
    role: 'OWNER'
  }
});
```

---

## Middleware & Route Protection

### Middleware Flow

**File:** `middleware.ts` + `lib/middleware/auth.ts`

```typescript
Request → middleware.ts
    ↓
1. CORS handling (if needed)
    ↓
2. Rate limiting (auth routes, API routes)
    ↓
3. Detect host type (platform/chatbot/marketing)
    ↓
4. Platform auth → handlePlatformAuth()
    ↓
5. Route protection checks
    ↓
Continue or redirect
```

### Route Protection Levels

| Route Pattern | Protection | Logic |
|--------------|------------|-------|
| `/login`, `/signup` | None | Public access |
| `/onboarding/*` | Authenticated only | Must have Supabase session |
| `/real-estate/dashboard` | Auth + Organization | Requires completed onboarding |
| `/admin/*` | ADMIN or SUPER_ADMIN | Role-based access |
| `/platform-admin/*` | SUPER_ADMIN only | Platform dev access |
| `/real-estate/workspace` | Auth + Org + STARTER tier | Subscription tier check |

### Protected Route Example

```typescript
// Dashboard page (requires auth + org)
export default async function DashboardPage() {
  const user = await requireAuth(); // Auto-redirects if not authenticated or no org

  return <DashboardContent user={user} />;
}
```

---

## Environment Configuration

### Required Environment Variables

**Priority:** `.env.local` > `.env` > `.env.example`

#### Core Authentication
```bash
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"  # ⚠️ Server-side only

# Database Connection
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# JWT Secret
JWT_SECRET="[generated-secret]"  # Generate: openssl rand -base64 32
```

#### Optional (but recommended)
```bash
# AI Integration
OPENROUTER_API_KEY="sk-or-v1-..."
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk-proj-..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Document Encryption
DOCUMENT_ENCRYPTION_KEY="[32-byte-hex]"  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Password Special Characters

⚠️ **IMPORTANT:** If database password contains special characters (`$`, `&`, `@`, etc.), they MUST be URL-encoded:

```bash
# ❌ Wrong (will fail)
DATABASE_URL="postgresql://postgres:StriveLabs$99@..."

# ✅ Correct (URL encoded)
DATABASE_URL="postgresql://postgres:StriveLabs%2499@..."
```

**Encode password:**
```bash
node -e "console.log(encodeURIComponent('YourPassword$99'))"
```

---

## Security Considerations

### 1. Never Expose Secrets

**Server-Only:**
- `SUPABASE_SERVICE_ROLE_KEY` → Bypasses RLS
- `DATABASE_URL` → Contains password
- `JWT_SECRET` → Used for signing tokens
- `DOCUMENT_ENCRYPTION_KEY` → Encrypts sensitive documents

**Client-Safe:**
- `NEXT_PUBLIC_SUPABASE_URL` → Public
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Public (RLS protects data)

### 2. Session Security

**Implementation:**
```typescript
// Server-side session (secure)
const supabase = createServerClient(url, anonKey, {
  cookies: {
    get(name) { return cookieStore.get(name)?.value },
    set(name, value, options) { cookieStore.set({ name, value, ...options }) }
  }
});
```

**Features:**
- httpOnly cookies (no JS access)
- Secure flag (HTTPS only)
- SameSite protection (CSRF prevention)
- Automatic refresh (handled by Supabase)

### 3. Input Validation

**Always use Zod schemas:**
```typescript
// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters')
});

// API route validation
const { email, password } = loginApiSchema.parse(body);
```

### 4. Rate Limiting

**Protected endpoints:**
- `/api/auth/*` → 10 requests/minute
- `/api/*` → 100 requests/minute
- `/login`, `/signup` → 10 requests/minute

**Implementation:** `lib/rate-limit.ts` (Upstash Redis)

### 5. Password Visibility

**UI Feature:**
- Eye/EyeOff icons toggle password visibility
- Individual state per field (login, signup, confirm)
- Accessible with proper aria-labels

**Location:** `app/(auth)/login/page.tsx:23-25`

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:** `Can't reach database server` or `Authentication failed`

**Causes:**
- Missing `DATABASE_URL` in `.env.local`
- Password contains special characters (not URL encoded)
- Wrong database host/port

**Fix:**
```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. Verify DATABASE_URL is set
grep DATABASE_URL .env.local

# 3. URL encode password if needed
node -e "console.log(encodeURIComponent('YourPassword'))"
```

#### 2. Redirect Loop (Too Many Requests)

**Error:** Continuous redirects between login and dashboard

**Causes:**
- `getCurrentUser()` failing (database not reachable)
- User authenticated but database sync failing

**Fix:**
```bash
# 1. Restart dev server
# 2. Check database connection
# 3. Verify .env.local loaded (check Next.js startup logs)
```

#### 3. User Stuck on Onboarding

**Error:** User keeps getting redirected to onboarding

**Causes:**
- Organization creation failed
- Database transaction incomplete

**Fix:**
```sql
-- Check user's organization membership
SELECT * FROM organization_members WHERE user_id = '[user-id]';

-- Check organizations
SELECT * FROM organizations WHERE id IN (
  SELECT organization_id FROM organization_members WHERE user_id = '[user-id]'
);
```

#### 4. Supabase Session Not Persisting

**Error:** User logged out on page refresh

**Causes:**
- Cookie settings incorrect
- HTTPS required for secure cookies (in production)

**Fix:**
```typescript
// Verify cookie settings in Supabase client
cookies: {
  get(name: string) { return cookieStore.get(name)?.value },
  set(name: string, value: string, options) {
    cookieStore.set({ name, value, ...options }) // Options include httpOnly, secure
  }
}
```

---

## Development Checklist

### Before Starting Development

- [ ] `.env.local` exists with all required variables
- [ ] Database connection verified (check startup logs)
- [ ] Supabase project accessible
- [ ] Redis rate limiting configured (optional)

### When Adding New Protected Routes

- [ ] Add route pattern to middleware config (`middleware.ts:70-76`)
- [ ] Use `requireAuth()` in page component
- [ ] Add role/tier checks if needed
- [ ] Update route protection table in this doc

### When Modifying Auth Flow

- [ ] Test signup → login → onboarding → dashboard
- [ ] Verify lazy sync creates user correctly
- [ ] Check organization creation in database
- [ ] Test re-onboarding prevention (middleware)
- [ ] Update this documentation

### Testing Checklist

- [ ] New user signup (email verification)
- [ ] Existing user login
- [ ] Onboarding completion
- [ ] Dashboard access after onboarding
- [ ] Logout and re-login (session persistence)
- [ ] Rate limiting (try 11+ requests)
- [ ] Password visibility toggle

---

## Key Files Reference

### Authentication Core
- `lib/auth/auth-helpers.ts` - Core auth functions (getCurrentUser, requireAuth)
- `lib/auth/schemas.ts` - Zod validation schemas
- `lib/auth/constants.ts` - Auth routes, roles, tiers

### API Routes
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/signup/route.ts` - Signup endpoint
- `app/api/onboarding/organization/route.ts` - Organization creation

### UI Components
- `app/(auth)/login/page.tsx` - Login/Signup page (tabs)
- `app/(auth)/onboarding/organization/page.tsx` - Onboarding page

### Middleware
- `middleware.ts` - Root middleware
- `lib/middleware/auth.ts` - Platform auth logic
- `lib/middleware/routing.ts` - Host detection

### Database
- `lib/database/prisma.ts` - Prisma client singleton
- `../shared/prisma/schema.prisma` - Database schema

---

## Future Enhancements

### Planned Features
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Social auth (Google, GitHub)
- [ ] 2FA/MFA support
- [ ] Session management dashboard
- [ ] Audit log for auth events

### Migration Considerations
- [ ] Clerk integration (future auth provider)
- [ ] Multi-organization support per user
- [ ] SSO for enterprise customers
- [ ] Role-based permissions (granular)

---

## Version History

**v1.2** (2025-10-06)
- Fixed DATABASE_URL password encoding
- Added onboarding redirect logic to middleware
- Synchronized .env and .env.local files
- Added password visibility toggle

**v1.1** (2025-10-06)
- Removed Prisma from auth routes
- Implemented lazy user sync in getCurrentUser()
- Supabase Auth now handles ALL authentication
- Added comprehensive architecture documentation

**v1.0** (2025-10-05)
- Initial authentication system
- Supabase Auth integration
- Basic onboarding flow

---

**Maintained by:** Strive Tech Development Team
**Questions?** Check troubleshooting section or review `AUTH-ARCHITECTURE.md` for detailed technical flow
