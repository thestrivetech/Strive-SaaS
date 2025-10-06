# Migration Plan: #
### Integrate app/web/ Website into Next.js App Router
### This document outlines all tasks required to transform the legacy website in app/web/ (served at strivetech.ai) into a fully functional Next.js 15 App Router module, coexisting seamlessly with the SaaS platform at app.strivetech.ai.

1. Directory & Routing Restructure
Keep the existing app/web/ folder alongside app/auth/ and app/platform/.

Move React client pages into Next.js pages:

app/web/client/src/pages/*.tsx → app/web/[route]/page.tsx

Convert filenames:

home.tsx → app/web/page.tsx (homepage)

solutions.tsx → app/web/solutions/page.tsx

about.tsx → app/web/about/page.tsx

contact.tsx → app/web/contact/page.tsx

Delete app/web/client/src/index.html; Next.js generates HTML.

Consolidate static assets:

Copy app/web/client/public/* → public/web/

Update image paths in pages to /web/[file].

2. Remove Legacy Routing & Libraries
Uninstall Wouter and any client-side router:

bash
npm uninstall wouter
Delete app/web/client/src/lib/queryClient.ts if unused.

Remove App.tsx router code; Next.js file-system routing replaces it.

Erase vite.config.ts, postcss.config.js, vitest.config.ts, and deploy.sh in app/web/.

Remove Express backend if fully migrating APIs (see Data & API section).

3. Authentication Unification
Remove Passport.js, express-session, and auth.ts in app/web/server/.

Use global Supabase Auth:

Add app/web/middleware.ts:

ts
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
...
export function middleware(req) {
  const supabase = createMiddlewareSupabaseClient({ req, res })
  ...
}
Protect web pages if required (e.g., /web/dashboard) with Next.js middleware.ts.

4. Data Layer Consolidation
Delete Drizzle ORM and supabase-migration.sql in app/web/.

Inherit Prisma schema from app/prisma/schema.prisma.

For web-specific tables (contact submissions, newsletter sign-ups), extend the Prisma schema with:

text
model ContactSubmission { ... }
model NewsletterSubscriber { ... }
Implement Next.js API routes under app/web/api/ for form handling:

app/web/api/contact/route.ts

app/web/api/subscribe/route.ts

5. UI & Styling Harmonization
Remove Tailwind config from app/web/; use root tailwind.config.ts.

Convert index.css and component-specific CSS to Tailwind classes.

Move web-specific components into components/web/:

Hero, FeaturesGrid, Testimonials, Footer, etc.

Replace service worker (sw.ts) with Next.js PWA plugin if needed.

6. Build & Scripts Consolidation
Delete legacy scripts in app/web/scripts/.

Remove separate package.json in app/web/; use root app/package.json.

Add web scripts to root package.json:

json
"scripts": {
  "dev:web": "next dev app/web",
  "build:web": "next build app/web",
  "start:web": "next start app/web"
}
7. Configuration & Environment
Remove .env in app/web/; merge all variables into root .env.local:

text
# Web site
NEXT_PUBLIC_WEB_API_URL=https://strivetech.ai/api
CONTACT_EMAIL_API_KEY=…
Delete app/web/.gitignore, .npmrc, .lighthouserc.json.

Ensure public/web/robots.txt and sitemap.xml generate at build time.

8. Testing & Quality Assurance
Co-locate web tests under tests/web/ using Jest and Playwright:

Unit tests: tests/web/unit/*.test.ts

E2E tests: tests/web/e2e/*.spec.ts

Update tsconfig.json to include app/web/:

json
"include": ["app/web/**/*", "app/**/*", "lib/**/*"]
Enforce global pre-commit hook:

bash
npm run lint && npm run type-check && npm test:unit
9. SEO & Analytics
Use Next.js Metadata API in each web page:

ts
export const metadata = { title: "...", description: "..." }
Install and configure next-sitemap:

bash
npm install next-sitemap
Add next-sitemap.js for /web routes.

Integrate Vercel Analytics and consent banner in layout.tsx.

10. Deployment & Domains
Update Vercel project settings:

Main domain: strivetech.ai → app/web production build

Subdomain: app.strivetech.ai → SaaS platform

Configure route:

json
// vercel.json
{
  "routes": [
    { "src": "/web/(.*)", "dest": "app/web/$1" },
    { "src": "/(.*)", "dest": "app/platform/$1" }
  ]
}
Set environment variables in Vercel dashboard for both domains.

11. Cleanup & Final Steps
Remove entire app/web/ folder once migration verified.

Archive legacy code in old/web/.

Update README with new web build instructions.

Conduct final security audit and performance testing for web site.

By completing these steps, strivetech.ai will run on the new Next.js App Router under app/web/, sharing the same architecture, authentication, database, styling, and build pipeline as your app.strivetech.ai SaaS platform.

Can I not just leave the folder name as "web" since it will still be functioning as the company's website? Or does it have to be changed?

Can I not just leave the folder name as "web" since it will still be functioning as the company's website? Or does it have to be changed?
You can absolutely keep the app/web/ folder name — it does not have to be renamed. Next.js' App Router treats each top-level folder under app/ as its own route segment.

By leaving it as app/web/, your public site will be served from /web, which you can then map to the root of strivetech.ai via your Vercel routing rules. Here's how:

Folder stays

text
app/
├── web/       ← public website
└── platform/  ← SaaS application
Vercel route configuration (vercel.json)

json
{
  "routes": [
    // Serve `app/web` at the root domain:
    { "src": "/(.*)", "has": [{ "header": "host", "value": "strivetech.ai" }], "dest": "app/web/$1" },

    // Serve the SaaS platform on the subdomain:
    { "src": "/(.*)", "has": [{ "header": "host", "value": "app.strivetech.ai" }], "dest": "app/platform/$1" }
  ]
}
Next.js page metadata

In app/web/layout.tsx, set the base <head> tags and canonical URLs for strivetech.ai.

In app/platform/layout.tsx, configure the base for app.strivetech.ai.

Environment variables

Use the same .env.local, but ensure any web-specific variables (e.g., contact form API keys) are only referenced inside app/web.

Shared configuration

Common utilities (e.g., analytics init, SEO helpers) can live in lib/shared/ and imported by both app/web and app/platform.

This approach preserves the semantic meaning of "web" for your website, while keeping the filesystem structure clear. It merely requires you to adjust your hosting/routes so that requests to strivetech.ai hit the app/web folder instead of /web in the URL.