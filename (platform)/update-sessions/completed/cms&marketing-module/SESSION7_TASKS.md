# Session 7: ContentPilot Navigation & Dashboard Integration - Task List

## Pre-Implementation Analysis
- [x] Read CLAUDE.md, SCHEMA files, existing navigation patterns
- [x] Identified route discrepancy: needs /content/ NOT /cms-marketing/
- [x] Backend stays as lib/modules/cms-marketing/, frontend moves to app/real-estate/content/

## Phase 1: Navigation Updates
- [ ] Update sidebar-nav.tsx defaultNavItems array
  - Change href from '/real-estate/cms-marketing/dashboard' to '/real-estate/content/dashboard'  
  - Change title from 'CMS & Marketing' to 'ContentPilot'
  - Icon: FileText (lucide-react)
  - Permission: Update to check GROWTH tier + role
  - Remove "Coming Soon" badge

- [ ] Update lib/auth/rbac.ts
  - Add canAccessContentPilot() function (checks GROWTH tier minimum)
  - Update getNavigationItems() with new ContentPilot entry
  - Add to canAccessRoute() route permissions for '/real-estate/content'
  - Update getContentLimits() if needed for GROWTH tier

## Phase 2: Create /content/ Route Structure  
- [ ] Create app/real-estate/content/page.tsx (redirect to /dashboard)
- [ ] Create app/real-estate/content/layout.tsx (if needed for shared UI)
- [ ] Create app/real-estate/content/dashboard/page.tsx (main dashboard)
- [ ] Create app/real-estate/content/dashboard/loading.tsx
- [ ] Create app/real-estate/content/dashboard/error.tsx

## Phase 3: Dashboard Components
Create in components/real-estate/content/dashboard/:
- [ ] content-overview.tsx - Stats cards (total content, campaigns, views, ROI)
- [ ] quick-actions.tsx - Action buttons grid (client component)
- [ ] recent-content.tsx - Recent content list with empty state
- [ ] content-calendar.tsx - Scheduled content calendar
- [ ] campaign-summary.tsx - Active campaigns metrics

## Phase 4: Shared Components
Create in components/real-estate/content/shared/:
- [ ] breadcrumb-nav.tsx - Breadcrumb navigation component
- [ ] feature-tour.tsx - First-visit onboarding tour (Dialog + localStorage)

## Phase 5: Backend Data Functions
Verify/create in lib/modules/content/ or use existing cms-marketing:
- [ ] Verify getContentStats() exists (or use getCMSDashboardStats)
- [ ] Verify getContentItems() exists (or use getRecentContent)
- [ ] Verify getCampaignMetrics() exists (or use getRecentCampaigns)

## Phase 6: Type Safety & Validation
- [ ] Add ContentPilot types if needed in lib/types/
- [ ] Ensure Zod schemas exist for any forms
- [ ] Verify subscription tier checks (GROWTH minimum)

## Phase 7: Verification
- [ ] TypeScript check: npx tsc --noEmit
- [ ] ESLint check: npm run lint
- [ ] Build check: npm run build  
- [ ] File size check: all files under 500 lines
- [ ] Security checklist complete
- [ ] Navigation testing checklist complete

## Blocking Requirements
- Must pass ALL verification steps
- Must include command outputs in report
- Security checks confirmed (RBAC, tier, organizationId filtering)
- Navigation works for GROWTH+ users, hidden for others
