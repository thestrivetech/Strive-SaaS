# Single Next.js App Migration Plan: Multi-Site with Route Groups

## 🎯 Goal
Convert from a mixed Vite/Next.js structure to a **single Next.js application** serving both:
- **strivetech.ai** - Marketing website (currently Vite)
- **app.strivetech.ai** - SaaS platform (currently Next.js)

Using Next.js App Router **route groups** and **host-based routing** for clean separation.

---

## 📋 Current Structure (After Session 1 - 2025-09-29)

**✅ SESSION 1 COMPLETE:** Platform routes reorganized into Next.js App Router with route groups

```
app/                                    # ✅ Project root = Next.js App Router root
├── package.json                        # Next.js deps
├── next.config.mjs                     # Platform config
├── tailwind.config.ts                  # Tailwind config
├── middleware.ts                       # Auth + routing middleware
├── globals.css                         # ✅ Global styles (moved from platform/)
├── favicon.ico                         # ✅ Favicon (moved from platform/)
│
├── (platform)/                         # ✅ Platform route group (MOVED from platform/)
│   ├── layout.tsx                      # Platform layout
│   ├── page.tsx                        # Root redirect
│   ├── login/                          # Auth routes
│   ├── dashboard/                      # Dashboard
│   ├── crm/                            # CRM
│   ├── projects/                       # Projects
│   ├── ai/                             # AI tools
│   ├── tools/                          # Tool marketplace
│   └── settings/                       # Settings
│
├── (web)/                              # ✅ Web route group (EMPTY - ready for Session 2)
│
├── api/                                # ✅ API routes (moved from platform/api/)
│   └── auth/                           # Auth endpoints
│
├── components/                         # Platform components
├── lib/                                # Platform libs
├── hooks/                              # Platform hooks
│
├── web/                                # 🔄 SOURCE for conversion (Session 2+)
│   ├── package.json                    # Minimal deps (components only)
│   ├── client/                         # React components & pages
│   │   ├── src/
│   │   │   ├── pages/                  # ⚠️ TO CONVERT → app/(web)/
│   │   │   ├── components/             # ⚠️ TO MOVE → components/web/
│   │   │   ├── hooks/                  # ⚠️ TO MOVE → hooks/
│   │   │   ├── lib/                    # Utilities
│   │   │   └── data/                   # Static data
│   │   └── public/                     # Static assets
│   ├── attached_assets/                # Images/media
│   ├── email-previews/                 # Email templates
│   └── scripts/                        # Utility scripts
│
├── platform-backup-OLD/                # ✅ Archived (backup files only)
│   ├── auth-layout-backup.tsx
│   └── platform-layout-backup.tsx
│
└── prisma/                             # Database (platform only)
```

**✅ Completed Cleanup (Phase 8) - 2025-09-29:**
- ✅ Removed Vite (vite.config.ts, vitest.config.ts)
- ✅ Removed Express server (entire server/ directory)
- ✅ Removed Drizzle ORM (drizzle.config.ts, shared/ directory)
  - Schema preserved at: `docs/migration-artifacts/drizzle-schema-web.ts`
- ✅ Removed deployment files (deploy.sh, vercel.json, supabase-migration.sql, .lighthouserc.json)
- ✅ Cleaned package.json - removed 80+ unnecessary dependencies:
  - Vite & plugins
  - Express & middleware
  - Drizzle ORM
  - Wouter router (marked for removal from code)
  - Auth packages (bcrypt, passport, jsonwebtoken)
  - Build tools (esbuild, tsx, cross-env)
- ✅ Fixed git symlink errors:
  - **Problem:** `app -> platform` symlink caused fatal error: "beyond a symbolic link"
  - **Solution:** Removed symlink with `rm app` command
  - This fixed git tracking issues where files appeared as `app/app/*` paths
  - Platform files remain safely in `platform/` directory
  - **Lesson:** Symlinks should be removed before migration, not tracked in git

**✅ Completed Session 1 (Platform Reorganization) - 2025-09-29:**
- ✅ Created migration branch: `feature/single-app-migration`
- ✅ MOVED all platform routes to `app/(platform)/` (NO copying, NO duplication)
- ✅ Created empty `app/(web)/` route group for web conversion
- ✅ Moved API routes to `app/api/`
- ✅ Moved globals.css and favicon.ico to app root
- ✅ Archived old `platform/` directory as `platform-backup-OLD/`
- ✅ **Critical fix:** Avoided redundant `app/app/` nesting - `app/` IS the Next.js root
- ✅ Zero duplication verified
- ✅ Documentation: Full session log at `chat-logs/old-site-updates/session3.md`

**🟡 Session 2 (Session 4) - Web Pages Conversion (75% Complete) - 2025-09-29:**
- ✅ Created `app/components/web/` directory structure
- ✅ Converted Navigation component to Next.js (app/components/web/navigation.tsx)
  - Replaced Wouter with Next.js routing (Link, usePathname)
  - Added "use client" for interactive mobile menu
  - Updated to Next.js Image component
- ✅ Converted Footer component to Next.js (app/components/web/footer.tsx)
  - Replaced Wouter Link with Next.js Link
  - Kept as Server Component (no interactivity)
- ✅ Created web layout (app/(web)/layout.tsx)
  - Marketing-focused with Navigation and Footer
  - Full HTML structure with <html> and <body> tags
  - SEO metadata configured
- ✅ Converted home page (app/(web)/page.tsx)
  - Added "use client" for interactive features
  - Removed all Wouter imports
  - Preserved all functionality (carousels, modals, industry selector)
  - ~600 lines (within acceptable range for complex marketing page)
- ✅ Converted about page (app/(web)/about/page.tsx)
  - Added "use client" for team carousel
  - Removed Wouter routing
  - Updated to Next.js Image for team photos
  - ~450 lines
- ⚠️ Contact page PENDING (blocked by dev server issue)
- ⚠️ Testing BLOCKED (dev server won't start)

**🔴 Critical Blocker:**
- Dev server fails with "Couldn't find any pages or app directory" error
- Route groups exist correctly, both have proper layouts
- TypeScript compiles with ZERO errors in new code
- Issue appears to be Next.js configuration or file system detection
- Resolution needed in Session 5 before proceeding

**⚠️ Remaining for Session 5 (Complete Session 2):**
- Fix dev server configuration issue
- Test all 3 converted pages
- Convert contact page (30-40 min)
- Delete old source files (after testing)
- Full documentation at `chat-logs/old-site-updates/session4.md`

**⚠️ Remaining for Future Sessions (Session 3+):**
- Convert remaining web pages (solutions, portfolio, resources)
- Move additional web components to `components/web/`
- Convert API routes (contact form, newsletter)
- Configure host-based routing
- Merge dependencies

---

## 🎯 Target Structure (Clean Single App)

```
app/
├── package.json                        # ✅ ONE Next.js with all deps
├── next.config.mjs                     # ✅ ONE config (multi-domain)
├── tailwind.config.ts                  # ✅ ONE Tailwind (shared styles)
├── tsconfig.json                       # ✅ ONE TypeScript config
├── middleware.ts                       # ✅ Host-based routing
│
├── app/                                # Next.js App Router
│   ├── (web)/                          # 🌐 Marketing site (strivetech.ai)
│   │   ├── layout.tsx                  # Marketing layout
│   │   ├── page.tsx                    # Homepage
│   │   ├── solutions/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── resources/
│   │   │   └── page.tsx
│   │   └── portfolio/
│   │       └── page.tsx
│   │
│   ├── (platform)/                     # 🔐 SaaS app (app.strivetech.ai)
│   │   ├── layout.tsx                  # Platform layout
│   │   ├── page.tsx                    # Root redirect
│   │   ├── login/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── crm/
│   │   ├── projects/
│   │   ├── ai/
│   │   ├── tools/
│   │   └── settings/
│   │
│   ├── api/                            # ✅ SHARED API ROUTES
│   │   ├── auth/                       # Platform auth
│   │   ├── contact/                    # Web contact form
│   │   ├── newsletter/                 # Web newsletter
│   │   └── webhooks/                   # Platform webhooks
│   │
│   └── globals.css                     # ✅ ONE global stylesheet
│
├── components/                         # ✅ ORGANIZED BY USAGE
│   ├── shared/                         # Used by BOTH sites
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   └── seo/
│   │       └── meta-tags.tsx
│   │
│   ├── web/                            # Marketing-specific
│   │   ├── hero-section.tsx
│   │   ├── pricing-card.tsx
│   │   ├── solution-card.tsx
│   │   ├── testimonials.tsx
│   │   └── cta-banner.tsx
│   │
│   └── platform/                       # Platform-specific
│       ├── dashboard-shell.tsx
│       ├── sidebar.tsx
│       ├── topbar.tsx
│       └── analytics-chart.tsx
│
├── lib/                                # ✅ SHARED UTILITIES
│   ├── supabase.ts                     # Shared DB client
│   ├── supabase-server.ts              # Server-side client
│   ├── auth/
│   │   ├── actions.ts
│   │   ├── schemas.ts
│   │   └── rbac.ts
│   ├── utils.ts                        # Shared helpers
│   ├── constants.ts                    # Shared constants
│   └── analytics/                      # Shared analytics
│
├── hooks/                              # ✅ SHARED HOOKS
│   ├── use-toast.ts
│   ├── use-mobile.tsx
│   └── use-debounce.ts
│
├── public/                             # ✅ SHARED STATIC ASSETS
│   ├── images/
│   │   ├── web/                        # Marketing images
│   │   └── platform/                   # Platform images
│   ├── fonts/
│   └── favicon.ico
│
├── prisma/                             # ✅ SHARED DATABASE
│   ├── schema.prisma
│   └── migrations/
│
├── scripts/                            # Build/deploy scripts
│   └── init-database.js
│
└── .env.local                          # ✅ ONE env file (both sites)
```

---

## 📝 Step-by-Step Migration Plan

### Phase 1: Backup & Preparation (15 min)

1. **Create migration branch**
   ```bash
   git checkout -b feature/single-app-migration
   git add .
   git commit -m "Pre-migration snapshot"
   ```

2. **Document current web/ structure**
   ```bash
   cd web
   find client/src -type f -name "*.tsx" -o -name "*.ts" > ../WEB_FILES.txt
   cd ..
   ```

3. **Backup web/ dependencies**
   ```bash
   cp web/package.json web-package-backup.json
   ```

---

### Phase 2: Rename Current Platform Structure (10 min)

1. **Move platform/ content to temporary location**
   ```bash
   # Current structure has platform/ with app router content
   # Need to reorganize into (platform) route group

   mkdir -p app-temp/(platform)
   cp -r platform/* app-temp/(platform)/
   ```

2. **Remove old symlink** - Already done in previous session, double check to make sure
   ```bash
   rm app  # Remove the platform symlink
   ```

---

### Phase 3: Create New App Router Structure (20 min)

1. **Create route group directories**
   ```bash
   mkdir -p app/(web)
   mkdir -p app/(platform)
   mkdir -p app/api
   ```

2. **Move platform routes into (platform) group**
   ```bash
   # Move all existing platform routes
   mv app-temp/(platform)/* app/(platform)/
   rm -rf app-temp
   ```

3. **Create web route group layout**
   ```bash
   # We'll create this in next phase when converting web pages
   touch app/(web)/layout.tsx
   touch app/(web)/page.tsx
   ```

---

### Phase 4: Convert Web (Vite) to Next.js (90 min)

This is the most complex phase - converting React/Vite components to Next.js pages.

#### 4.1: Analyze Current Web Structure
```bash
# Key web pages to convert:
web/client/src/pages/
├── home.tsx           → app/(web)/page.tsx
├── solutions.tsx      → app/(web)/solutions/page.tsx
├── company.tsx        → app/(web)/about/page.tsx
├── contact.tsx        → app/(web)/contact/page.tsx
├── resources.tsx      → app/(web)/resources/page.tsx
├── portfolio.tsx      → app/(web)/portfolio/page.tsx
└── solutions/
    ├── ai-automation.tsx
    ├── healthcare.tsx
    └── ... (specific solution pages)
```

#### 4.2: Create Web Root Layout
Create `app/(web)/layout.tsx`:
```typescript
import { Inter } from 'next/font/google';
import { Header } from '@/components/web/header';
import { Footer } from '@/components/web/footer';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Strive Tech - AI & Innovation Solutions',
  description: 'Transform your business with cutting-edge AI solutions',
};

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

#### 4.3: Convert Home Page
Create `app/(web)/page.tsx`:
```typescript
import { HeroSection } from '@/components/web/hero-section';
import { SolutionsGrid } from '@/components/web/solutions-grid';
import { CTABanner } from '@/components/web/cta-banner';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SolutionsGrid />
      <CTABanner />
    </>
  );
}
```

#### 4.4: Convert Each Web Page
For each page in `web/client/src/pages/`:
1. Create corresponding Next.js page in `app/(web)/`
2. Convert client-side routing to Next.js Links
3. Convert React hooks to Next.js patterns
4. Move components to `components/web/`

**Example conversion - Solutions Page:**

**Before (Vite):** `web/client/src/pages/solutions.tsx`
```typescript
import { useNavigate } from 'wouter';
import { SolutionCard } from '@/components/ui/solution-card';

export default function Solutions() {
  const [, setLocation] = useNavigate();
  // ... component logic
}
```

**After (Next.js):** `app/(web)/solutions/page.tsx`
```typescript
import Link from 'next/link';
import { SolutionCard } from '@/components/web/solution-card';

export default function SolutionsPage() {
  // Convert to server component or use 'use client' if needed
  return (
    <div>
      {/* Content */}
    </div>
  );
}
```

#### 4.5: Move Web Components
```bash
# Move web-specific components
mkdir -p components/web
cp -r web/client/src/components/* components/web/

# Clean up and organize
# Keep only web-specific components in components/web/
# Move truly shared components to components/shared/
```

#### 4.6: Convert API Routes
```bash
# Convert Express routes to Next.js API routes
# web/server/routes.ts → app/api/

# Example:
# POST /api/contact → app/api/contact/route.ts
# POST /api/newsletter → app/api/newsletter/route.ts
```

**Example API route conversion:**

**Before (Express):** `web/server/routes.ts`
```typescript
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  // ... handle contact form
});
```

**After (Next.js):** `app/api/contact/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();
  // ... handle contact form
  return NextResponse.json({ success: true });
}
```

---

### Phase 5: Organize Shared Components (30 min)

1. **Create shared component structure**
   ```bash
   mkdir -p components/shared/ui
   mkdir -p components/shared/layouts
   mkdir -p components/shared/seo
   ```

2. **Identify and move shared components**
   - Buttons, Cards, Inputs (shadcn/ui) → `components/shared/ui/`
   - Headers, Footers → `components/shared/layouts/`
   - SEO components → `components/shared/seo/`

3. **Update imports across the codebase**
   - Platform components import from `@/components/shared/ui`
   - Web components import from `@/components/shared/ui`

---

### Phase 6: Configure Host-Based Routing (20 min)

1. **Update middleware.ts**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { createServerClient } from '@supabase/ssr';

   export async function middleware(request: NextRequest) {
     const hostname = request.headers.get('host') || '';
     const { pathname } = request.nextUrl;

     let response = NextResponse.next();

     // Initialize Supabase for auth
     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             return request.cookies.get(name)?.value;
           },
           set(name: string, value: string, options: any) {
             request.cookies.set({ name, value, ...options });
             response = NextResponse.next({ request });
             response.cookies.set({ name, value, ...options });
           },
           remove(name: string, options: any) {
             request.cookies.set({ name, value: '', ...options });
             response = NextResponse.next({ request });
             response.cookies.set({ name, value: '', ...options });
           },
         },
       }
     );

     // Get user for auth checks (platform only)
     const { data: { user } } = await supabase.auth.getUser();

     // ============================================
     // MARKETING SITE (strivetech.ai)
     // ============================================
     if (
       hostname === 'strivetech.ai' ||
       hostname === 'www.strivetech.ai' ||
       (hostname.includes('localhost') && pathname.startsWith('/web'))
     ) {
       // Marketing site - no auth required
       // Routes are already in app/(web)/ so Next.js handles them
       return response;
     }

     // ============================================
     // PLATFORM (app.strivetech.ai)
     // ============================================
     if (
       hostname === 'app.strivetech.ai' ||
       (hostname.includes('localhost') && !pathname.startsWith('/web'))
     ) {
       // Protected routes
       const isProtectedRoute =
         pathname.startsWith('/dashboard') ||
         pathname.startsWith('/crm') ||
         pathname.startsWith('/projects') ||
         pathname.startsWith('/ai') ||
         pathname.startsWith('/tools') ||
         pathname.startsWith('/settings');

       // Redirect to login if not authenticated
       if (!user && isProtectedRoute) {
         const redirectUrl = new URL('/login', request.url);
         redirectUrl.searchParams.set('redirect', pathname);
         return NextResponse.redirect(redirectUrl);
       }

       // Redirect to dashboard if authenticated and on login page
       if (user && pathname === '/login') {
         return NextResponse.redirect(new URL('/dashboard', request.url));
       }

       // Root path handling
       if (pathname === '/') {
         if (user) {
           return NextResponse.redirect(new URL('/dashboard', request.url));
         } else {
           return NextResponse.redirect(new URL('/login', request.url));
         }
       }

       return response;
     }

     return response;
   }

   export const config = {
     matcher: [
       '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     ],
   };
   ```

2. **Create development domain mapping**
   For local development, you can:
   - Use `/web` prefix for marketing site testing
   - Default to platform on `localhost:3000`
   - Or set up local hosts:
     ```bash
     # Add to /etc/hosts
     127.0.0.1 local.strivetech.ai
     127.0.0.1 app.local.strivetech.ai
     ```

---

### Phase 7: Update Next.js Config (15 min)

1. **Update next.config.mjs for multi-domain**
   ```javascript
   import path from "path";
   import { fileURLToPath } from "url";

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);

   /** @type {import('next').NextConfig} */
   const nextConfig = {
     turbopack: {
       root: __dirname,
     },

     // Handle multiple domains
     async headers() {
       return [
         {
           source: '/:path*',
           headers: [
             {
               key: 'X-DNS-Prefetch-Control',
               value: 'on'
             },
             {
               key: 'Strict-Transport-Security',
               value: 'max-age=63072000; includeSubDomains; preload'
             },
           ],
         },
       ];
     },

     // Image domains (if needed)
     images: {
       domains: ['strivetech.ai', 'app.strivetech.ai'],
     },
   };

   export default nextConfig;
   ```

---

### Phase 8: Consolidate Dependencies (20 min)

1. **Merge package.json dependencies**
   ```bash
   # Review web/package.json for unique deps
   # Add any missing deps to root package.json

   # Example additions might include:
   # - Web-specific animation libraries
   # - Marketing-specific tools
   # - Any web utilities not in platform
   ```

2. **Update root package.json**
   ```json
   {
     "name": "strive-saas-unified",
     "version": "1.0.0",
     "private": true,
     "scripts": {
       "dev": "next dev --turbopack",
       "build": "next build --turbopack",
       "start": "next start",
       "lint": "eslint",
       "type-check": "tsc --noEmit",
       "test": "jest",
       "prisma:generate": "prisma generate",
       "prisma:migrate": "prisma migrate dev",
       "prisma:studio": "prisma studio"
     },
     "dependencies": {
       "@hookform/resolvers": "^5.2.2",
       "@prisma/client": "^6.16.2",
       "@radix-ui/react-avatar": "^1.1.10",
       "@supabase/ssr": "^0.7.0",
       "@supabase/supabase-js": "^2.58.0",
       "next": "^15.6.0-canary.33",
       "react": "19.1.0",
       "react-dom": "19.1.0",
       "react-hook-form": "^7.63.0",
       "zod": "^4.1.11",
       "lucide-react": "^0.544.0",
       "class-variance-authority": "^0.7.1",
       "clsx": "^2.1.1",
       "tailwind-merge": "^3.3.1",
       "tailwindcss-animate": "^1.0.7",

       // Add web-specific deps that were in web/package.json
       "framer-motion": "^11.13.1",
       // ... other unique web deps
     },
     "devDependencies": {
       "@tailwindcss/postcss": "^4",
       "@types/node": "^20",
       "@types/react": "^19",
       "@types/react-dom": "^19",
       "eslint": "^9",
       "eslint-config-next": "15.5.4",
       "prisma": "^6.16.2",
       "tailwindcss": "^4",
       "typescript": "^5"
     }
   }
   ```

3. **Remove old web/ directory dependencies**
   ```bash
   # After confirming everything works
   rm -rf web/node_modules
   rm web/package.json
   rm web/package-lock.json
   ```

---

### Phase 9: Update Tailwind Configuration (10 min)

1. **Update tailwind.config.ts to scan both route groups**
   ```typescript
   import type { Config } from '@tailwindcss/vite';

   const config: Config = {
     content: [
       './pages/**/*.{js,ts,jsx,tsx,mdx}',
       './components/**/*.{js,ts,jsx,tsx,mdx}',
       './app/**/*.{js,ts,jsx,tsx,mdx}',        // Scans both (web) and (platform)
       './lib/**/*.{js,ts,jsx,tsx,mdx}',
       './hooks/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {
         colors: {
           // Platform colors
           primary: '#ff7033',
           secondary: '#020a1c',

           // Web marketing colors
           'brand-orange': '#ff7033',
           'brand-purple': '#8b5cf6',
           'brand-dark': '#020a1c',
         },
       },
     },
     plugins: [],
   };

   export default config;
   ```

2. **Consolidate global styles**
   Move `platform/globals.css` to `app/globals.css` and merge with any web styles:
   ```css
   /* app/globals.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* Platform-specific styles */
   .platform-gradient {
     background: linear-gradient(to bottom right, #ff7033, #8b5cf6);
   }

   /* Web marketing-specific styles */
   .hero-gradient {
     background: linear-gradient(135deg, #ff7033 0%, #8b5cf6 100%);
   }

   /* Shared styles */
   .container {
     @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
   }
   ```

---

### Phase 10: Update Environment Variables (5 min)

1. **Consolidate .env.local**
   Keep one `.env.local` at root with all variables for both sites:
   ```bash
   # Database (shared)
   DATABASE_URL="postgres://..."
   DIRECT_URL="postgres://..."

   # Supabase (shared)
   NEXT_PUBLIC_SUPABASE_URL="https://..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."

   # Auth (platform)
   JWT_SECRET="..."

   # URLs
   NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
   NEXT_PUBLIC_MARKETING_URL="https://strivetech.ai"

   # AI (platform)
   OPENROUTER_API_KEY="..."

   # Stripe (platform)
   STRIPE_SECRET_KEY="..."
   STRIPE_PUBLISHABLE_KEY="..."

   # Email (both can use)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="..."
   SMTP_PASSWORD="..."
   ```

---

### Phase 11: Install Dependencies & Test (30 min)

1. **Clean install**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```

4. **Test both sites**
   - Test Platform: `http://localhost:3000` (should redirect to /login or /dashboard)
   - Test Web (development): `http://localhost:3000/web`
   - Or set up local domains in hosts file

5. **Test key pages**
   - [ ] Platform login works
   - [ ] Platform dashboard loads
   - [ ] Web homepage loads
   - [ ] Web solutions pages load
   - [ ] Web contact form works
   - [ ] Shared components render correctly

---

### Phase 12: Update Deployment Configuration (15 min)

1. **Update Vercel configuration**
   Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "nextjs",
     "outputDirectory": ".next",
     "regions": ["iad1"],

     "routes": [
       {
         "src": "/(.*)",
         "headers": {
           "cache-control": "public, max-age=0, must-revalidate"
         }
       }
     ]
   }
   ```

2. **Configure domain routing in Vercel dashboard**
   - Add both domains to same project:
     - `strivetech.ai` → Production
     - `app.strivetech.ai` → Production
   - Middleware will handle routing based on hostname

3. **Update environment variables in Vercel**
   - Add all `.env.local` variables to Vercel project
   - Set for Production environment

---

### Phase 13: Cleanup Old Web Directory (10 min)

1. **Archive old web/ directory**
   ```bash
   mkdir -p archives
   mv web archives/web-vite-backup-$(date +%Y%m%d)
   ```

2. **Remove old web configs**
   ```bash
   # These are no longer needed
   # But keep them in archives just in case
   ```

3. **Update .gitignore**
   ```gitignore
   # Root level
   node_modules/
   .next/
   .env*.local
   .DS_Store
   *.log

   # Archives
   archives/

   # Build outputs
   dist/
   build/
   ```

---

### Phase 14: Update Documentation (15 min)

1. **Update README.md**
   ```markdown
   # Strive Tech - Unified Next.js Application

   **Single Next.js app serving two domains:**
   - 🌐 **strivetech.ai** - Marketing website
   - 🔐 **app.strivetech.ai** - SaaS platform

   ## Structure

   \`\`\`
   app/
   ├── (web)/          # Marketing site pages
   ├── (platform)/     # SaaS application pages
   └── api/            # Shared API routes

   components/
   ├── shared/         # Used by both sites
   ├── web/            # Marketing-specific
   └── platform/       # Platform-specific
   \`\`\`

   ## Development

   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

   - Platform: http://localhost:3000
   - Web (dev): http://localhost:3000/web

   ## Deployment

   Both sites deploy together to Vercel. Middleware routes by hostname:
   - strivetech.ai → (web) routes
   - app.strivetech.ai → (platform) routes
   ```

2. **Update CLAUDE.md**
   ```markdown
   # Project Structure

   ## Single Next.js App with Route Groups

   \`\`\`
   app/
   ├── (web)/              # Marketing: strivetech.ai
   ├── (platform)/         # Platform: app.strivetech.ai
   └── api/                # Shared API routes

   components/
   ├── shared/ui/          # shadcn components (both)
   ├── web/                # Marketing components
   └── platform/           # Platform components
   \`\`\`

   ## Key Concepts

   - **Route Groups** `(web)` and `(platform)` organize routes without affecting URLs
   - **Middleware** routes by hostname (strivetech.ai vs app.strivetech.ai)
   - **Shared code** in components/shared/, lib/, hooks/
   - **Single build** deploys both sites together
   ```

3. **Create migration completion note**
   Create `MIGRATION_COMPLETE.md`:
   ```markdown
   # Migration Complete: Vite → Unified Next.js

   ## What Changed

   ✅ Converted web/ from Vite to Next.js
   ✅ Organized into route groups: (web) and (platform)
   ✅ Consolidated all dependencies
   ✅ Shared components, lib, hooks
   ✅ Single deployment for both sites
   ✅ Host-based routing via middleware

   ## New Development Workflow

   \`\`\`bash
   npm run dev          # Start both sites
   \`\`\`

   ## Domain Routing

   - localhost:3000 → Platform (default)
   - localhost:3000/web → Marketing (dev prefix)
   - strivetech.ai → Marketing (production)
   - app.strivetech.ai → Platform (production)

   ## Archived

   - Old web/ Vite project → archives/web-vite-backup-YYYYMMDD/
   ```

---

### Phase 15: Final Testing & Validation (30 min)

1. **Comprehensive testing checklist**
   - [ ] Platform login/logout works
   - [ ] Platform protected routes require auth
   - [ ] Platform dashboard displays correctly
   - [ ] All platform pages load
   - [ ] Web homepage loads
   - [ ] Web navigation works
   - [ ] Web forms submit correctly
   - [ ] Shared components work on both sites
   - [ ] API routes work for both sites
   - [ ] Database queries work
   - [ ] Prisma Studio opens
   - [ ] Images load correctly
   - [ ] Styles apply correctly to both sites
   - [ ] No console errors
   - [ ] Build succeeds: `npm run build`
   - [ ] Production mode works: `npm run start`

2. **Performance check**
   ```bash
   npm run build
   npm run start

   # Check bundle sizes
   # Verify both sites load quickly
   ```

3. **Type checking**
   ```bash
   npm run type-check
   # Should have zero errors
   ```

4. **Linting**
   ```bash
   npm run lint
   # Fix any issues
   ```

---

## 🎯 Success Criteria

- [ ] Single `package.json` with all dependencies
- [ ] `app/(web)/` contains all marketing pages
- [ ] `app/(platform)/` contains all SaaS pages
- [ ] `components/shared/` used by both sites
- [ ] Middleware routes by hostname
- [ ] Both sites work in development
- [ ] Single build produces both sites
- [ ] All tests pass
- [ ] No duplicate code
- [ ] Clean git history (logical commits)

---

## 📊 Migration Checklist by Page

### Web Pages to Convert
- [ ] Homepage (`/`)
- [ ] Solutions (`/solutions`)
- [ ] Individual Solutions (`/solutions/[slug]`)
- [ ] About/Company (`/about`)
- [ ] Contact (`/contact`)
- [ ] Resources (`/resources`)
- [ ] Portfolio (`/portfolio`)
- [ ] Individual Case Studies
- [ ] Privacy Policy
- [ ] Terms of Service

### Platform Pages (Already Next.js)
- [x] Login
- [x] Dashboard
- [x] CRM
- [x] Projects
- [x] AI Tools
- [x] Settings

### API Routes
- [ ] Contact form (`/api/contact`)
- [ ] Newsletter (`/api/newsletter`)
- [x] Auth routes (`/api/auth/*`)
- [x] Webhooks (`/api/webhooks/*`)

---

## ⏱️ Time Estimates

| Phase | Task | Time |
|-------|------|------|
| 1 | Backup & Prep | 15 min |
| 2 | Rename Platform | 10 min |
| 3 | Create Structure | 20 min |
| 4 | Convert Web to Next.js | 90 min |
| 5 | Organize Shared Components | 30 min |
| 6 | Host-Based Routing | 20 min |
| 7 | Update Next Config | 15 min |
| 8 | Consolidate Dependencies | 20 min |
| 9 | Update Tailwind | 10 min |
| 10 | Environment Variables | 5 min |
| 11 | Install & Test | 30 min |
| 12 | Deployment Config | 15 min |
| 13 | Cleanup | 10 min |
| 14 | Documentation | 15 min |
| 15 | Final Testing | 30 min |
| **TOTAL** | | **~5.5 hours** |

---

## 🚀 Quick Start Commands

```bash
# 1. Backup
git checkout -b feature/single-app-migration
git add . && git commit -m "Pre-migration snapshot"

# 2. Start migration (follow phases 2-15)
# ... execute each phase ...

# 3. Test
npm install
npm run dev

# 4. Deploy
git add .
git commit -m "Migrate to unified Next.js app with route groups"
git push origin feature/single-app-migration
# Create PR and merge
```

---

## 🔧 Troubleshooting

### Issue: Module not found errors
**Solution:** Ensure `@/` alias in tsconfig.json points to root, update imports

### Issue: Styles not applying
**Solution:** Check tailwind.config.ts content array includes both route groups

### Issue: API routes not working
**Solution:** Ensure API routes are in `app/api/` (not in route groups)

### Issue: Images not loading
**Solution:** Images should be in `public/`, update image paths

### Issue: Middleware routing broken
**Solution:** Check hostname matching logic, test with both domains

### Issue: Environment variables not loading
**Solution:** Restart dev server after .env changes

---

## 📊 Migration Progress Log

### Phase 8: Consolidate Dependencies - ✅ COMPLETED (2025-09-29)

**Completed Actions:**
1. ✅ Removed Vite configuration files:
   - `vite.config.ts`
   - `vitest.config.ts`

2. ✅ Removed Express server infrastructure:
   - Entire `server/` directory including:
     - `index.ts`, `routes.ts`, `auth.ts`, `vite.ts`, `storage.ts`
     - `middleware/`, `routes/`, `services/`, `lib/`

3. ✅ Preserved & removed Drizzle ORM:
   - Copied `shared/schema.ts` to `docs/migration-artifacts/drizzle-schema-web.ts`
   - Removed `drizzle.config.ts`
   - Removed `shared/` directory

4. ✅ Removed old deployment files:
   - `deploy.sh`
   - `vercel.json` (web-specific)
   - `supabase-migration.sql`
   - `.lighthouserc.json`

5. ✅ Cleaned `web/package.json`:
   - Renamed to "strive-web-components"
   - Marked as private with warning description
   - Removed 80+ dependencies:
     - **Vite ecosystem:** vite, @vitejs/plugin-react, vite-plugin-pwa, rollup-plugin-visualizer
     - **Express ecosystem:** express, compression, helmet, express-rate-limit, express-session, express-validator
     - **Drizzle ORM:** drizzle-orm, drizzle-zod, drizzle-kit
     - **Wouter:** wouter (router)
     - **Auth/Security:** bcrypt, jsonwebtoken, passport, passport-local, @types/bcrypt, @types/jsonwebtoken, @types/passport*
     - **Database:** @neondatabase/serverless, postgres, connect-pg-simple, memorystore
     - **Build tools:** esbuild, tsx, cross-env, dotenv
     - **Testing:** vitest, @vitest/*, msw, jsdom, @testing-library/*
     - **Misc:** winston, ws, nodemailer, imagemin*, jspdf, html2canvas, sitemap, workbox-window, idb
   - Kept only React component dependencies (39 packages)
   - Kept essential dev dependencies (8 packages)

**Files Remaining in web/ folder:**
- `client/` - React components and pages (need conversion)
- `attached_assets/` - Images and media
- `email-previews/` - Email templates
- `api/` - Serverless functions (review needed)
- `scripts/` - Utility scripts (review needed)
- `public/` - Static assets
- Config files: `components.json`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`

**Next Steps:**
- Phase 4: Convert web pages from Vite/Wouter to Next.js
- Phase 5: Organize shared components
- Phase 6: Configure host-based routing

**Time Taken:** ~20 minutes
**Status:** Ready for Phase 4 (component conversion)

---

**Ready to begin?** Phase 8 complete - proceed with Phase 4 (Convert Web to Next.js)!