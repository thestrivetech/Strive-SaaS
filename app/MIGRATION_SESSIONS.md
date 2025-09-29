# Single Next.js App Migration - Session Breakdown

## Overview
Convert from Vite/Next.js hybrid to unified Next.js app with route groups.
**Total time:** ~6.5 hours across 7 sessions

---

## Session 1: Backup & Platform Reorganization (45 min)

### Phases: 1, 2, 3

### Goals:
- ✅ Create migration branch
- ✅ Document current structure
- ✅ Reorganize platform/ into app/(platform)/
- ✅ Remove symlink
- ✅ Create route group structure

### Prompt:
```
Execute Phases 1-3 of SINGLE_APP_MIGRATION_PLAN.md:
1. Create backup branch and document structure
2. Move platform/ routes into app/(platform)/ route group
3. Remove app symlink and create app/(web)/ and app/(platform)/ directories

Stop after Phase 3 and confirm structure is ready for web conversion.
```

### Deliverable:
Clean app router structure with (platform) route group ready

---

## Session 2: Convert Web Home & Core Pages (60 min)

### Phase: 4.1-4.3 (partial)

### Goals:
- ✅ Analyze web structure
- ✅ Create web root layout
- ✅ Convert homepage
- ✅ Convert about page
- ✅ Convert contact page

### Prompt:
```
Execute Phase 4 (first part) of SINGLE_APP_MIGRATION_PLAN.md:
- Create app/(web)/layout.tsx with marketing layout
- Convert web home page to app/(web)/page.tsx
- Convert about page to app/(web)/about/page.tsx
- Convert contact page to app/(web)/contact/page.tsx

Use web/client/src/pages/ as source. Move components to components/web/.
Test each page loads correctly before moving to next.
```

### Deliverable:
Web homepage and basic pages working in Next.js

---

## Session 3: Convert Remaining Web Pages (60 min)

### Phase: 4.3 (continued)

### Goals:
- ✅ Convert solutions pages
- ✅ Convert resources page
- ✅ Convert portfolio page
- ✅ Convert case studies

### Prompt:
```
Continue Phase 4 of SINGLE_APP_MIGRATION_PLAN.md:
- Convert solutions page to app/(web)/solutions/page.tsx
- Convert individual solution pages to app/(web)/solutions/[slug]/page.tsx
- Convert resources page to app/(web)/resources/page.tsx
- Convert portfolio page to app/(web)/portfolio/page.tsx

Move all web components to components/web/. Test each page.
```

### Deliverable:
All web pages converted to Next.js

---

## Session 4: Convert API Routes & Organize Components (60 min)

### Phases: 4.6, 5

### Goals:
- ✅ Convert web API routes
- ✅ Organize shared components
- ✅ Move web components
- ✅ Extract shared UI

### Prompt:
```
Execute Phases 4.6 and 5 of SINGLE_APP_MIGRATION_PLAN.md:
- Convert web/server/routes (contact, newsletter) to app/api/
- Organize components into: components/shared/, components/web/, components/platform/
- Move shadcn/ui components to components/shared/ui/
- Update all imports across codebase

Test API routes work and components render correctly.
```

### Deliverable:
All APIs working, components properly organized

---

## ~~Session 5: Configure Routing & Dependencies (60 min)~~
## REPLACED BY: Pre-Migration Cleanup (Phase 8 Early) ✅

### Phase: 8 (Consolidate Dependencies - executed BEFORE conversion)

### Goals:
- ✅ Remove Vite infrastructure from web/
- ✅ Remove Express server from web/
- ✅ Remove Drizzle ORM from web/
- ✅ Preserve Drizzle schema for Prisma migration
- ✅ Clean web/package.json to minimal deps
- ✅ Remove old deployment files

### Actual Prompt Used:
```
Please go into the web folder here: /Users/grant/Documents/GitHub/Strive-SaaS/app/web
→ I need you to remove vite, wouter, drizzle, express, and any other things that
won't be used when integrating this entire part of the codebase to next.js.
→ read this file: /Users/grant/Documents/GitHub/Strive-SaaS/docs/SINGLE_APP_MIGRATION_PLAN.md
and continually update it with the progress you make so we aren't doing these steps
in the future. Your only task right now is to clean the websites codebase to be
ready for the next.js integration and update.
```

### Deliverable: ✅
**Cleaned web folder ready for component conversion**
- Removed: Vite, Express, Drizzle, Wouter, 80+ dependencies
- Preserved: React components, pages, hooks, utilities
- Created: `docs/migration-artifacts/drizzle-schema-web.ts` (schema backup)
- Created: `docs/migration-artifacts/CLEANUP-SUMMARY.md` (detailed log)
- Updated: `SINGLE_APP_MIGRATION_PLAN.md` with cleanup progress

### Files Removed:
- `vite.config.ts`, `vitest.config.ts`, `drizzle.config.ts`
- `server/` directory (entire Express infrastructure)
- `shared/` directory (schema.ts backed up to migration-artifacts first)
- `deploy.sh`, `vercel.json`, `supabase-migration.sql`, `.lighthouserc.json`

### Git Issues Fixed:
- ✅ Resolved symlink error: `app/app/` paths beyond symbolic link
  - **Root cause:** `app -> platform` symlink caused git to track files as `app/app/*`
  - **Final solution:** Removed the symlink entirely with `rm app`
  - This fixed the "beyond a symbolic link" fatal error
  - Platform files remain safely in `platform/` directory
  - **Note:** Initial attempts to remove cached entries didn't work - removing symlink was required

### Dependencies: 127 → 47 packages
- Removed: Vite, Express, Drizzle, Wouter, Auth, Testing, Build tools
- Kept: React, Radix UI, Forms, Styling, Icons

### Time Taken: ~20 minutes
### Status: **COMPLETED - Ready for Phase 4 (component conversion)**

---

## Session 5 (NEW): Configure Routing & Merge Dependencies (60 min)

### Phases: 6, 7, 8 (remaining parts)

### Goals:
- [ ] Host-based middleware
- [ ] Update Next.js config
- [ ] Merge web component deps into root package.json
- [ ] Install and test

### Prompt:
```
Execute Phases 6-8 (remaining) of SINGLE_APP_MIGRATION_PLAN.md:
- Update middleware.ts with host-based routing for strivetech.ai vs app.strivetech.ai
- Update next.config.mjs for multi-domain support
- Merge remaining web component dependencies into root package.json
- Run npm install at root to test dependency resolution

Test both domains route correctly in development.
Note: Phase 8 cleanup already completed - only merge dependencies.
```

### Deliverable:
Routing works, single unified dependency list

---

## Session 6: Finalize Configuration (45 min)

### Phases: 9, 10, 11

### Goals:
- ✅ Update Tailwind
- ✅ Consolidate env vars
- ✅ Full test suite
- ✅ Fix issues

### Prompt:
```
Execute Phases 9-11 of SINGLE_APP_MIGRATION_PLAN.md:
- Update tailwind.config.ts to scan both (web) and (platform)
- Consolidate all env vars into single .env.local
- Clean install: rm -rf node_modules && npm install
- Test dev server: npm run dev
- Test both sites load correctly
- Run: npm run build to verify production build

Fix any errors that arise.
```

### Deliverable:
Everything builds and runs without errors

---

## Session 7: Deploy Config, Cleanup & Documentation (45 min)

### Phases: 12, 13, 14, 15

### Goals:
- ✅ Vercel configuration
- ✅ Archive old code
- ✅ Update documentation
- ✅ Final testing
- ✅ Create PR

### Prompt:
```
Execute final Phases 12-15 of SINGLE_APP_MIGRATION_PLAN.md:
- Create vercel.json for multi-domain deployment
- Archive old web/ directory to archives/
- Update README.md, CLAUDE.md with new structure
- Run full testing checklist from Phase 15
- Commit all changes and create summary of migration

Prepare for production deployment.
```

### Deliverable:
Production-ready, documented, ready to deploy

---

## Progress Tracking

### Completed Sessions:
- [ ] Session 1: Backup & Platform Reorganization
- [ ] Session 2: Convert Core Web Pages
- [ ] Session 3: Convert Remaining Web Pages
- [ ] Session 4: APIs & Component Organization
- [x] **Session 5 (Pre-Migration Cleanup)**: Phase 8 Early Execution ✅ (2025-09-29)
- [ ] Session 5 (NEW): Configure Routing & Merge Dependencies
- [ ] Session 6: Configuration & Testing
- [ ] Session 7: Deploy & Documentation

### Current Session: Complete - Phase 8 Cleanup ✅

### Notes:
**2025-09-29 - Phase 8 Cleanup Completed Early:**
- Executed Phase 8 (dependency cleanup) BEFORE component conversion
- Strategy change: Clean infrastructure first, then convert components
- Rationale: Easier to work with clean codebase during conversion
- 28 files still need code updates (wouter/vite imports)
- Drizzle schema preserved for Prisma migration
- Next: Proceed with Phase 4 (component conversion) or Phase 6-7 (routing config)

---

## Quick Commands

```bash
# Start migration
git checkout -b feature/single-app-migration

# Between sessions - commit progress
git add .
git commit -m "Session X complete: [description]"

# Test after each session
npm run dev
npm run build

# Final merge
git checkout main
git merge feature/single-app-migration
```

---

## Reference Files
- Full plan: `SINGLE_APP_MIGRATION_PLAN.md`
- Old monorepo plan (deprecated): `MONOREPO_RESTRUCTURE_PLAN.md`