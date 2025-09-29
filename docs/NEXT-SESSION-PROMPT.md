# Next Session: Website Migration to Next.js App Router

## 🎯 Session Objective

Migrate the existing Vite/React website (`app/web/`) to Next.js 15 App Router, integrating it seamlessly with the SaaS platform while maintaining the company website functionality at `strivetech.ai`.

---

## 📋 CRITICAL: Read These Files First

**MUST READ before starting (in this order):**

1. **`/Users/grant/Documents/GitHub/Strive-SaaS/CLAUDE.md`**
   - Project architecture rules and standards
   - Tech stack requirements (Next.js 15.5.4, Prisma ONLY, Server Components default)
   - **File size limits:** 500 lines hard limit (enforced by ESLint)
   - **Soft targets:** Components 200 lines, Services 300 lines
   - Security mandates and authentication patterns
   - **CRITICAL:** No Drizzle ORM - Prisma ONLY
   - **CRITICAL:** Server Components by default, `'use client'` only when necessary

2. **`/Users/grant/Documents/GitHub/Strive-SaaS/docs/website-update-to-next.js.md`**
   - Complete migration plan with all 11 phases
   - File-by-file transformation guide
   - Routing structure and domain configuration
   - What to delete, what to keep, what to consolidate

3. **`/Users/grant/Documents/GitHub/Strive-SaaS/docs/content-management-strategy.md`**
   - How to handle large content pages (resources, solutions)
   - File size limits: Data files (no limit) vs UI components (500 line hard limit)
   - Component composition patterns to stay under limits
   - Dynamic routes for blog posts, whitepapers, case studies
   - **KEY INSIGHT:** Content is already separated into `/data/` folder ✅
   - **KEY INSIGHT:** 500-line limit applies to UI/logic, NOT data files

4. **Current Structure Overview:**
   - Existing: `/app/web/client/src/pages/*.tsx` (Vite + React + Wouter)
   - Target: `/app/app/web/*/page.tsx` (Next.js App Router)
   - Keep folder name as `web` - serves company website
   - Content already in `/data/resources/` structure (good!)

---

## 🏗️ Current State Analysis

### Existing Website Structure
```
app/web/
├── client/src/
│   ├── pages/
│   │   ├── home.tsx              → app/app/web/page.tsx
│   │   ├── solutions.tsx         → app/app/web/solutions/page.tsx
│   │   ├── company.tsx           → app/app/web/company/page.tsx
│   │   ├── contact.tsx           → app/app/web/contact/page.tsx
│   │   ├── portfolio.tsx         → app/app/web/portfolio/page.tsx
│   │   ├── resources.tsx         → app/app/web/resources/page.tsx
│   │   ├── assessment.tsx        → app/app/web/assessment/page.tsx
│   │   ├── onboarding.tsx        → app/app/web/onboarding/page.tsx
│   │   ├── request.tsx           → app/app/web/request/page.tsx
│   │   ├── chatbot-sai.tsx       → app/app/web/chatbot-sai/page.tsx
│   │   ├── solutions/            → app/app/web/solutions/[solution]/page.tsx
│   │   ├── privacy.tsx           → app/app/web/privacy/page.tsx
│   │   ├── terms.tsx             → app/app/web/terms/page.tsx
│   │   └── cookies.tsx           → app/app/web/cookies/page.tsx
│   ├── components/               → app/components/web/
│   └── lib/                      → Review and consolidate
├── server/                       → DELETE (replace with Next.js API routes)
├── public/                       → public/web/
└── [config files]                → DELETE (use root configs)
```

### Pages to Migrate (17 total)
- ✅ home.tsx (becomes root page.tsx)
- ⏳ solutions.tsx + solutions/* (11 solution pages)
- ⏳ company.tsx
- ⏳ contact.tsx
- ⏳ portfolio.tsx
- ⏳ resources.tsx
- ⏳ assessment.tsx
- ⏳ onboarding.tsx
- ⏳ request.tsx
- ⏳ chatbot-sai.tsx
- ⏳ privacy.tsx, terms.tsx, cookies.tsx

**Note:** analytics-dashboard.tsx and performance-dashboard.tsx are being moved to SaaS admin in separate migration (already in progress).

---

## 📝 SESSION WORKFLOW (Phase-by-Phase)

### Phase 1: Project Setup & Configuration (Start Here)

**1.1 Create Base Web Structure**
```bash
mkdir -p app/app/web
mkdir -p components/web
mkdir -p public/web
```

**1.2 Create Web Root Layout**
File: `/app/app/web/layout.tsx`
- Server Component with web-specific metadata
- Import shared components from `@/components/web`
- Set canonical URLs for strivetech.ai
- Include web analytics initialization
- Use existing shadcn/ui components

**1.3 Create Web Homepage**
File: `/app/app/web/page.tsx`
- Migrate from `app/web/client/src/pages/home.tsx`
- Convert to Server Component (default)
- Move interactive sections to `'use client'` components
- Update image paths to `/web/[file]`
- Use Next.js `<Image>` component

**Important Conversions:**
- Remove Wouter `<Link>` → Next.js `<Link>`
- Remove React Router hooks → Next.js navigation
- Server Components by default → only add `'use client'` for:
  - useState, useEffect, hooks
  - onClick, onChange, event handlers
  - Browser APIs (window, document)

---

### Phase 2: Core Pages Migration

**⚠️ IMPORTANT: Large Content Pages**

Two pages exceed 1000 lines due to embedded content:
- `resources.tsx` (1804 lines) - Blog posts, whitepapers, case studies
- `solutions.tsx` (1170 lines) - Solution descriptions

**Good News:** Content is already separated into `/data/` folders! ✅

**Strategy (see content-management-strategy.md):**
1. Data files (whitepapers, blog posts) = **No size limit** (they're just content)
2. UI components = **500 line hard limit** (enforced by ESLint)
3. **Soft targets:** Aim for 200-250 lines per component
4. Use component composition to build complex pages
5. Move `/app/web/client/src/data/` → `/app/data/web/`

**Priority Order:**
1. **contact.tsx** - Has API route dependency (create `/app/app/web/api/contact/route.ts`)
2. **company.tsx** - About/company info (simpler page to start)
3. **portfolio.tsx** - Case studies
4. **solutions.tsx** - Main solutions page (break into components)
5. **resources.tsx** - Blog/resources (break into components)

**For Each Page:**
1. Read the original React component
2. Identify client-side interactions (forms, animations, modals)
3. Create Server Component with metadata export
4. Extract interactive parts into separate `'use client'` components
5. Update all imports to Next.js equivalents
6. Move to appropriate route folder with `page.tsx` filename

**Example Pattern:**
```typescript
// app/app/web/contact/page.tsx
import { Metadata } from 'next';
import ContactForm from '@/components/web/contact-form'; // 'use client'

export const metadata: Metadata = {
  title: 'Contact Us | Strive Tech',
  description: '...',
};

export default function ContactPage() {
  // Server Component - can fetch data directly
  return (
    <div>
      <h1>Contact Us</h1>
      <ContactForm /> {/* Client Component for interactivity */}
    </div>
  );
}
```

---

### Phase 3: Component Migration

**3.1 Identify Shared Components**
From `app/web/client/src/components/`:
- Hero sections
- Feature grids
- Testimonials
- Footer
- Navigation
- Forms
- Cards

**3.2 Migrate to `/app/components/web/`**
- Keep existing shadcn/ui components
- Determine Server vs Client Component needs
- Update import paths to use `@/components/web`
- Remove Wouter dependencies

**3.3 Component Checklist:**
- [ ] Does it use state or effects? → `'use client'`
- [ ] Does it handle events? → `'use client'`
- [ ] Is it purely presentational? → Server Component
- [ ] Does it fetch data? → Server Component (use async)

---

### Phase 4: API Routes & Forms

**4.1 Create Next.js API Routes**
Replace Express backend with Next.js API routes:

File: `/app/app/web/api/contact/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  // Validate, store in Prisma, send email
  // Follow patterns from existing API routes
}
```

**API Routes Needed:**
- `/app/app/web/api/contact/route.ts` - Contact form submission
- `/app/app/web/api/subscribe/route.ts` - Newsletter subscription
- `/app/app/web/api/assessment/route.ts` - Assessment submission
- `/app/app/web/api/request/route.ts` - Demo request form

**4.2 Extend Prisma Schema**
File: `/app/prisma/schema.prisma`

Add web-specific models:
```prisma
model ContactSubmission {
  id        String   @id @default(uuid())
  name      String
  email     String
  company   String?
  message   String
  source    String   @default("website")
  status    String   @default("new") // new, contacted, closed
  createdAt DateTime @default(now())

  @@map("contact_submissions")
}

model NewsletterSubscriber {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String?
  subscribed    Boolean  @default(true)
  subscribedAt  DateTime @default(now())
  unsubscribedAt DateTime?

  @@map("newsletter_subscribers")
}
```

---

### Phase 5: Static Assets & Public Files

**5.1 Move Assets**
```bash
cp -r app/web/client/public/* public/web/
```

**5.2 Update Image References**
- All `src="/[file]"` → `src="/web/[file]"`
- Use Next.js `<Image>` component:
```typescript
import Image from 'next/image';

<Image
  src="/web/hero-image.png"
  alt="..."
  width={1200}
  height={600}
  priority
/>
```

**5.3 SEO Files**
- Generate `robots.txt` at build time
- Use `next-sitemap` for sitemap generation
- Configure in `next-sitemap.config.js`

---

### Phase 6: Configuration Cleanup

**6.1 Delete Legacy Files**
After migration is verified working:
```bash
# From app/web/
rm vite.config.ts
rm vitest.config.ts
rm postcss.config.js
rm deploy.sh
rm .lighthouserc.json
rm .npmrc
rm drizzle.config.ts
rm supabase-migration.sql
rm -rf server/
rm -rf scripts/
```

**6.2 Consolidate package.json**
- Remove separate `app/web/package.json`
- Move web-specific dependencies to root `package.json`
- Update scripts in root package.json

**6.3 Environment Variables**
Merge `app/web/.env` into root `.env.local`:
```bash
# Web-specific vars
NEXT_PUBLIC_WEB_API_URL=https://strivetech.ai/api
CONTACT_EMAIL_TO=contact@strivetech.ai
SENDGRID_API_KEY=...
```

---

### Phase 7: Routing & Domain Configuration

**7.1 Vercel Configuration**
File: `/vercel.json` (root level)
```json
{
  "routes": [
    {
      "src": "/(.*)",
      "has": [{ "header": "host", "value": "strivetech.ai" }],
      "dest": "/web/$1"
    },
    {
      "src": "/(.*)",
      "has": [{ "header": "host", "value": "app.strivetech.ai" }],
      "dest": "/platform/$1"
    }
  ]
}
```

**7.2 Middleware Updates**
Update `/app/middleware.ts` to handle web routes:
- Public web pages don't require auth
- Web API routes for form submissions
- Maintain existing auth checks for platform routes

---

## 🚨 CRITICAL REMINDERS

### Architecture Rules (from CLAUDE.md)
1. **Server Components First** - Default to Server Components, only use `'use client'` when absolutely necessary
2. **Prisma ONLY** - Delete all Drizzle ORM code, use Prisma for all database operations
3. **No Cross-Module Imports** - `web/` should not import from `platform/`, use `lib/shared/` for common code
4. **File Size Limits** - Components max 200 lines, services max 300 lines
5. **Supabase Auth ONLY** - Remove Passport.js, use existing Supabase Auth
6. **Zod Validation** - Always validate API inputs with Zod schemas
7. **TypeScript Strict** - Use types from `@prisma/client`, no `any` types

### Migration Rules
- ✅ Keep folder name as `web` (serves company website)
- ✅ Use existing shadcn/ui components
- ✅ Maintain existing design system
- ✅ Follow established patterns from SaaS app
- ❌ Don't create new authentication system
- ❌ Don't use Drizzle ORM
- ❌ Don't duplicate configs
- ❌ Don't break existing SaaS functionality

---

## 📊 Progress Tracking

Use TodoWrite tool to track:
- [ ] Phase 1: Base structure & homepage
- [ ] Phase 2: Core pages (contact, solutions, company, portfolio, resources)
- [ ] Phase 3: Component migration
- [ ] Phase 4: API routes & Prisma models
- [ ] Phase 5: Static assets
- [ ] Phase 6: Configuration cleanup
- [ ] Phase 7: Routing & deployment

---

## 🧪 Testing Checklist

After each phase:
- [ ] Run `npm run lint` - Zero warnings
- [ ] Run `npx tsc --noEmit` - Zero errors
- [ ] Test page renders correctly
- [ ] Test interactive elements work
- [ ] Verify images load from `/web/` path
- [ ] Check metadata appears in `<head>`
- [ ] Test forms submit successfully
- [ ] Verify data saves to Prisma database

---

## 🎯 Starting Point

**Session Start Sequence:**
1. Read CLAUDE.md (project rules)
2. Read website-update-to-next.js.md (migration plan)
3. Read current `app/web/client/src/pages/home.tsx`
4. Create Phase 1 todo list
5. Start with base structure and homepage migration

**First Files to Create:**
1. `/app/app/web/layout.tsx`
2. `/app/app/web/page.tsx` (homepage)
3. `/app/components/web/hero.tsx` (if needed as client component)

**Remember:** This is a PRODUCTION system. Every line matters. Follow established patterns. Security > Speed > Pretty.

---

## 📚 Reference Files

**For Patterns & Examples:**
- Auth patterns: `/app/middleware.ts`
- API routes: `/app/app/api/analytics/*/route.ts`
- Server Components: `/app/app/(platform)/dashboard/page.tsx`
- Client Components: Look for `'use client'` in existing files
- Prisma usage: `/app/lib/prisma.ts`
- Form handling: Check existing SaaS forms

**Migration Guide:**
- Full plan: `/docs/website-update-to-next.js.md`
- Current pages: `/app/web/client/src/pages/`
- Current components: `/app/web/client/src/components/`

---

**Ready to migrate? Start with Phase 1 and work sequentially. Good luck! 🚀**

