# Session 11: Navigation & Route Integration - Task List

## PHASE 1: ANALYSIS & SETUP
- [x] Navigate to (platform) directory
- [x] Read SCHEMA-QUICK-REF.md for database reference
- [x] Read platform CLAUDE.md for standards
- [x] Read existing middleware.ts (root level)
- [x] Read existing lib/middleware/auth.ts
- [x] Read existing lib/auth/rbac.ts and org-rbac.ts
- [x] Read existing navigation components
- [x] Read existing layouts ((marketing), (auth), (admin))
- [x] Identify what exists vs what needs creation

## PHASE 2: NAVIGATION COMPONENTS (Update/Verify)
- [ ] Verify/update components/shared/navigation/user-menu.tsx
  - Already exists, verify it includes profile, settings, logout
  - Verify role display is working
  - Check organization role display if needed
- [ ] Verify/update components/shared/navigation/breadcrumbs.tsx
  - Already exists, verify it works for all route groups
  - Update if needed for industry-specific routes
- [ ] Create/update components/shared/navigation/platform-nav.tsx
  - Create sidebar navigation for platform routes
  - Use existing SidebarNav component or enhance
  - Include role-based filtering
  - Support active states and badges

## PHASE 3: ROUTE GROUP LAYOUTS (Update with Navigation)
- [ ] Update app/(platform)/real-estate/layout.tsx (CREATE if missing)
  - Add industry-level layout wrapper
  - Include SidebarNav with platform navigation
  - Include Breadcrumbs component
  - Include UserMenu in header
  - Protect with auth check
- [ ] Verify app/(marketing)/layout.tsx
  - Already has MarketingNav
  - Confirm no changes needed
- [ ] Verify app/(auth)/layout.tsx (check onboarding & login)
  - Minimal layout (no nav needed)
  - Confirm no changes needed
- [ ] Verify app/(admin)/layout.tsx
  - Already has auth protection
  - Add admin-specific navigation if needed
  - Add Breadcrumbs and UserMenu

## PHASE 4: MIDDLEWARE ENHANCEMENTS
- [ ] Update middleware.ts (root level)
  - Already has auth protection via handlePlatformAuth
  - Already has rate limiting
  - Verify route protection for all route groups
  - Add any missing route patterns to config.matcher
- [ ] Verify lib/middleware/auth.ts
  - Already protects platform routes
  - Already checks RBAC for admin routes
  - Verify all new routes are covered
  - No schema changes needed

## PHASE 5: ROOT PAGE REDIRECT
- [ ] Update app/page.tsx
  - Currently uses HostDependent component
  - Update to redirect based on auth status:
    * Not logged in → /login
    * Logged in → /real-estate/dashboard
  - Or keep HostDependent if it handles this

## PHASE 6: HELPER COMPONENTS
- [ ] Create components/shared/layouts/platform-layout.tsx (if needed)
  - Wrapper for platform pages with standard layout
  - Sidebar + Header + Breadcrumbs + Content area
  - Reusable across all platform routes
- [ ] Verify components/shared/navigation/header.tsx
  - Check if header component exists
  - Should include UserMenu, Breadcrumbs, ThemeToggle

## PHASE 7: TESTING & VERIFICATION
- [ ] TypeScript check: npx tsc --noEmit
- [ ] Linting: npm run lint
- [ ] Build test: npm run build
- [ ] Verify file sizes (all files <500 lines)
- [ ] Test navigation flow manually (if possible)
- [ ] Verify all route groups have proper layouts
- [ ] Verify auth redirects work correctly
- [ ] Verify RBAC protection on admin routes

## PHASE 8: DOCUMENTATION
- [ ] Create execution report with:
  - Files created (with line counts)
  - Files modified (with line counts)
  - Verification command outputs
  - Changes summary
  - Issues found and resolved

## KEY REQUIREMENTS CHECKLIST
- [ ] All layouts use existing navigation components
- [ ] Auth protection via middleware (already implemented)
- [ ] RBAC checks for admin routes (already implemented)
- [ ] Breadcrumbs show context for all platform routes
- [ ] UserMenu available on all authenticated routes
- [ ] Platform navigation (sidebar) on real-estate routes
- [ ] No files exceed 500 lines
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings resolved
- [ ] Read existing files before editing (READ-BEFORE-EDIT)
