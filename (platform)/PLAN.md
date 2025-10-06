# Platform Production Roadmap

**Project:** Strive Tech SaaS Platform
**Domain:** `app.strivetech.ai`
**Type:** Enterprise B2B Multi-tenant SaaS
**Framework:** Next.js 15.6.0 + React 19.1.0 + TypeScript 5.6+
**Status:** 🚧 Development → Production

---

## 🎯 Project Overview

The **Platform** is the core SaaS application providing enterprise business management tools with AI-powered automation across multiple industries.

### Core Features
- **Role-based dashboards** - SUPER_ADMIN (platform-admin), ADMIN (org-admin), MODERATOR, USER
- **CRM System** - Customer relationship management
- **Project Management** - Tasks, timelines, collaboration
- **AI Assistant (Sai)** - Intelligent automation & insights
- **Tool Marketplace** - Shared & industry-specific tools
- **Multi-tenant Architecture** - Organization-based isolation

---

## 🏗️ Architecture: 3-Level Hierarchy

**Platform Design Philosophy:** Scalable multi-industry architecture

### Level 1: INDUSTRY
- **Definition:** Top-level business vertical
- **Examples:** Real Estate, Healthcare, Legal, Construction
- **Location:** `app/{industry}/`
- **URL Pattern:** `/real-estate/*`, `/healthcare/*`
- **Contains:** Industry dashboard + Multiple modules

### Level 2: MODULE
- **Definition:** Complete functional area within an industry
- **Examples:** CRM (Customer Relationship Management), Transactions, Analytics, AI Hub
- **Location:** `app/{industry}/{module}/`
- **URL Pattern:** `/real-estate/crm/*`, `/real-estate/transactions/*`
- **Contains:** Module dashboard + Multiple feature pages
- **Backend:** Business logic in `lib/modules/{module}/`

### Level 3: PAGE
- **Definition:** Individual pages within a module
- **Types:**
  - **Dashboard Page:** Overview/summary page (e.g., `/crm/dashboard`)
  - **Feature Pages:** Specific functionality pages (e.g., `/crm/contacts`, `/crm/leads`)
  - **Detail Pages:** Dynamic routes (e.g., `/crm/contacts/[id]`)

### Terminology Clarity
- ✅ `/real-estate/` = Industry
- ✅ `/real-estate/dashboard/` = Industry Dashboard (overview for all Real Estate)
- ✅ `/real-estate/crm/` = CRM Module
- ✅ `/real-estate/crm/dashboard/` = CRM Module Dashboard (overview for CRM only)
- ✅ `/real-estate/crm/contacts/` = Contacts Page (feature within CRM Module)
- ❌ `/real-estate/crm/contacts/` ≠ "Contacts Dashboard" (INCORRECT terminology)

---

## 📁 Current Structure (Post-Refactoring)

```
(platform)/
├── app/
│   ├── layout.tsx, page.tsx, globals.css, favicon.ico ✅
│   ├── (auth)/                  # ROUTE GROUP: Auth ✅
│   │   ├── login/, onboarding/
│   ├── (marketing)/             # ROUTE GROUP: Marketing ✅
│   ├── real-estate/             # INDUSTRY: Real Estate ✅
│   │   ├── dashboard/          # PAGE: Industry dashboard
│   │   ├── crm/                # MODULE: CRM
│   │   │   ├── dashboard/, contacts/, leads/, deals/
│   │   │   ├── analytics/, calendar/
│   │   └── transactions/       # MODULE: Transactions
│   │       ├── [loopId]/, listings/, sign/
│   └── api/                     # API routes ✅
│       ├── auth/, health/, onboarding/, v1/
│
├── components/
│   ├── layouts/                 # Layout components ✅
│   ├── real-estate/             # Industry components ✅
│   │   ├── ai/, crm/, projects/, transactions/
│   ├── shared/navigation/       # Shared components ✅
│   ├── subscription/            # Subscription components ✅
│   └── ui/                      # shadcn/ui ✅
│
├── lib/
│   ├── modules/                 # 13 feature modules ✅
│   │   ├── activities/, ai/, analytics/
│   │   ├── appointments/, attachments/, compliance/
│   │   ├── crm/, dashboard/, notifications/
│   │   ├── organization/, projects/, tasks/, transactions/
│   ├── industries/              # Industry plugins ✅
│   │   ├── _core/, configs/, healthcare/, real-estate/
│   ├── tools/                   # Tool registry ✅
│   │   ├── registry/, shared/
│   ├── auth/                    # Auth & RBAC ✅
│   ├── database/                # Prisma client ✅
│   ├── types/                   # TypeScript types ✅
│   │   ├── real-estate/, shared/, web/
│   └── utils/                   # Utilities ✅
│
├── prisma/                      ✅
├── __tests__/                   ✅
├── public/assets/               ✅
├── scripts/                     ✅
└── middleware.ts                ✅
```

### ✅ Refactoring Complete

The following architectural improvements have been implemented:
- ✅ **Route Groups:** `(auth)` and `(marketing)` for organized routing
- ✅ **Industry Verticals:** `real-estate/` as the first industry implementation
- ✅ **Component Organization:** Industry-specific components under `components/real-estate/`
- ✅ **Module Consolidation:** 13 feature modules in `lib/modules/`
- ✅ **Type Organization:** Separated by industry (`real-estate/`) and `shared/`

### 🎯 Current Focus

Platform is production-ready with:
- Multi-tenant architecture via RLS
- 4-role RBAC system (SUPER_ADMIN, ADMIN, MODERATOR, USER)
- 6-tier per-seat pricing (FREE, CUSTOM, STARTER, GROWTH, ELITE, ENTERPRISE)
- Real Estate vertical fully implemented (CRM, Dashboard, Transactions)

---

## 🏗️ Phase 2: Architecture & Auth (CRITICAL)

### 2.1: Implement Supabase Auth Middleware

Create `lib/auth/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function authMiddleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}
```

Update `middleware.ts`:
```typescript
import { authMiddleware } from '@/lib/auth/middleware';

export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};
```

### 2.2: Implement RBAC (Role-Based Access Control)

Create `lib/auth/rbac.ts`:
```typescript
import { UserRole, OrganizationRole } from '@prisma/client';

type Permission =
  | 'crm:read' | 'crm:write' | 'crm:delete'
  | 'projects:read' | 'projects:write' | 'projects:delete'
  | 'admin:access' | 'tools:install';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ['*'], // Unrestricted platform access
  ADMIN: ['admin:access', 'crm:*', 'projects:*', 'tools:*'],
  MODERATOR: ['crm:*', 'projects:write', 'projects:read'],
  USER: ['crm:read', 'crm:write', 'projects:read', 'projects:write'],
};

export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(p =>
    p === permission ||
    p.replace(':*', '') === permission.split(':')[0]
  );
}
```

### 2.3: Protect Routes with Middleware

Update each route's `layout.tsx` or `page.tsx`:
```typescript
// app/crm/layout.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/server';
import { hasPermission } from '@/lib/auth/rbac';

export default async function CRMLayout({ children }) {
  const user = await getCurrentUser();

  if (!hasPermission(user.role, 'crm:read')) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
```

---

## 🎨 Phase 3: UI/UX & Layouts

### 3.1: Enhanced Root Layout

Update `app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Strive Tech Platform',
    default: 'Strive Tech - Enterprise SaaS Platform',
  },
  description: 'AI-Powered Business Management Platform',
  metadataBase: new URL('https://app.strivetech.ai'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

Create `components/providers.tsx`:
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

### 3.2: Dashboard Layouts by Role

Create `components/(platform)/layouts/`:
- `PlatformAdminLayout.tsx` - For SUPER_ADMIN users (platform-admin dashboard)
- `OrgAdminLayout.tsx` - For ADMIN users (org-admin dashboard)
- `UserLayout.tsx` - For USER role (standard workspace)

Each with:
- Sidebar navigation (role-specific links)
- Header with user menu
- Breadcrumbs
- Notifications panel

---

## 🔒 Phase 4: Security & Performance

### 4.1: Security Checklist

- [ ] **Row Level Security (RLS)** - Enable in Supabase for all tables
- [ ] **Input Validation** - Use Zod schemas on ALL forms and Server Actions
- [ ] **Rate Limiting** - Implement with Upstash Redis
- [ ] **CSRF Protection** - Next.js handles automatically for Server Actions
- [ ] **XSS Prevention** - Use React's built-in escaping (avoid dangerouslySetInnerHTML)
- [ ] **API Key Protection** - NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client
- [ ] **Environment Validation** - Validate all env vars at startup

Create `lib/env.ts`:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

### 4.2: Performance Optimization

```typescript
// Server Components by default (80%+)
// Only add "use client" when necessary:
// - useState, useEffect, hooks
// - onClick, onChange, event handlers
// - Browser APIs (window, document)

// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
  loading: () => <Skeleton />,
});

// Image optimization
import Image from 'next/image';
<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>

// Bundle analysis
// Run: ANALYZE=true npm run build
```

---

## ✅ Phase 5: Testing (80% Minimum)

### 5.1: Test Structure

```
(platform)/
├── __tests__/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/              # E2E tests (Playwright)
└── lib/
    └── modules/
        └── crm/
            ├── actions.ts
            └── actions.test.ts  # Co-located tests
```

### 5.2: Testing Requirements

**Required Coverage:**
- Server Actions: 100%
- API Routes: 100%
- Business Logic (lib/modules): 90%
- Components: 80%
- **Overall: 80% minimum (BLOCKS commit)**

**Run tests:**
```bash
npm test                 # Run all tests
npm test -- --coverage   # With coverage report
npm test -- --watch      # Watch mode
```

### 5.3: Example Server Action Test

```typescript
// lib/modules/crm/actions.test.ts
import { createCustomer } from './actions';
import { prisma } from '@/lib/database/prisma';

jest.mock('@/lib/database/prisma');

describe('CRM Actions', () => {
  it('should create customer with valid data', async () => {
    const mockCustomer = { id: '1', name: 'Test', email: 'test@example.com' };
    (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);

    const result = await createCustomer({
      name: 'Test',
      email: 'test@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCustomer);
  });
});
```

---

## 🚀 Phase 6: Deployment to Production

### 6.1: Pre-Deployment Checklist

- [ ] All Phase 1 critical fixes completed
- [ ] Auth middleware implemented
- [ ] RBAC working for all routes
- [ ] 80%+ test coverage achieved
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set in Vercel
- [ ] Database migrations run on production DB
- [ ] RLS policies enabled in Supabase

### 6.2: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd (platform)
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

### 6.3: Database Setup

```bash
# Run migrations on production
npm run prisma:migrate -- --schema=../shared/prisma/schema.prisma

# Verify with Prisma Studio
npm run prisma:studio
```

### 6.4: Domain Configuration

- Point `app.strivetech.ai` to Vercel
- SSL auto-configured by Vercel
- Verify HTTPS works

---

## 📊 Success Metrics

### Technical Metrics
- ✅ **Build:** Zero errors, zero warnings
- ✅ **Tests:** 80%+ coverage, all passing
- ✅ **Performance:** Lighthouse score > 90
- ✅ **Type Safety:** Zero TypeScript errors
- ✅ **Security:** All audits passing

### Functional Metrics
- ✅ **Auth:** Login/logout working
- ✅ **RBAC:** Role-based access enforced
- ✅ **CRM:** Create/read/update customers
- ✅ **Projects:** Project management functional
- ✅ **AI:** Sai assistant responding
- ✅ **Multi-tenant:** Org isolation working

---

## 🔗 Related Documentation

- [Project Root](../README.md)
- [Shared Prisma Schema](../shared/prisma/schema.prisma)
- [Development Standards](../CLAUDE.md)
- [Chatbot Plan](../(chatbot)/PLAN.md)
- [Website Plan](../(website)/PLAN.md)

---

## 🎯 Next Actions

1. **IMMEDIATE:** Run Phase 1 fixes (app/styling/ folder)
2. **TODAY:** Phase 2 auth middleware
3. **THIS WEEK:** Phase 3 layouts + Phase 4 security
4. **NEXT WEEK:** Phase 5 testing
5. **DEPLOY:** Phase 6 production launch

**Start with Phase 1.1 NOW - the app won't work correctly until this is fixed!**
