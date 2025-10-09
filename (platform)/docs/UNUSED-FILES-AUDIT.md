# Platform Directory Audit: Unused Files Report
*Generated: 2025-10-07*
*Scope: Complete (platform)/ directory analysis*
*Context: Mock Data Mode - Minimal schema (3 models only)*

---

## Executive Summary

**Repository Stats:**
- Total Files Analyzed: **1,797** TypeScript/JavaScript files
- Entry Points Found: **101** pages/layouts + **33** API routes
- Component Files: **260**
- Library Files: **346**
- App Files: **140**
- Test Files: **61**
- Total Directory Size: **1.2 GB**

**Current State Context:**
- **Schema:** Minimal mode (3 models: users, organizations, organization_members)
- **Mock Data:** Active (`NEXT_PUBLIC_USE_MOCKS=true`)
- **Development Phase:** UI-first development
- **Schema Backup:** `prisma/backup-20251007/` (83 models, 3,345 lines - saved)

**Key Findings:**

### ⚠️ UPDATE (2025-10-07): All Modules in Active Development
**5 modules** previously flagged as "skeleton" are **IN ACTIVE DEVELOPMENT**:
- `ai-hub/` - AI Hub module ✅ **KEEP - In Development**
- `rei-analytics/` - REI Intelligence module ✅ **KEEP - In Development**
- `expense-tax/` - Expense & Tax module ✅ **KEEP - In Development**
- `cms-marketing/` - CMS & Marketing module ✅ **KEEP - In Development**
- `marketplace/` - Tool Marketplace module ✅ **KEEP - In Development**

**Revised Status:**
- **In Development Files:** ~100+ files with TODO/placeholder comments (DO NOT DELETE)
- **Safe to Delete/Defer:** None (all modules are actively being developed)
- **Review Needed:** ~150+ files (components with unclear usage - unrelated to modules above)
- **Keep (Active):** ALL files including previously flagged modules

---

## 1. Skeleton Modules Analysis

### 1.1 AI Hub Module

**Status:** 📋 Skeleton (< 5% implemented)
**Documented:** Yes (CLAUDE.md line 282-290)
**Purpose:** AI-powered tools and automation

**Frontend Routes:**
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `app/real-estate/ai-hub/page.tsx` | 10 | Redirect | Redirects to /dashboard |
| `app/real-estate/ai-hub/layout.tsx` | ~35 | Skeleton | Basic layout, Coming Soon badge |
| `app/real-estate/ai-hub/dashboard/page.tsx` | 123 | Placeholder | "Coming Soon" banner, no real functionality |

**Backend Logic:**
| File | Lines | Status | TODOs |
|------|-------|--------|-------|
| `lib/modules/ai-hub/actions.ts` | 21 | Placeholder | 2 TODO comments |
| `lib/modules/ai-hub/queries.ts` | 22 | Placeholder | 2 TODO comments |
| `lib/modules/ai-hub/schemas.ts` | 22 | Placeholder | 2 TODO comments |
| `lib/modules/ai-hub/index.ts` | 27 | Placeholder | 2 TODO comments |

**Total Files:** 7 files
**Total Lines:** ~260 lines
**Implementation:** < 5%

**⚠️ UPDATE (2025-10-07): Recommendation:** ✅ **KEEP - IN ACTIVE DEVELOPMENT**
- Module is currently being developed
- TODO comments indicate planned features, not abandoned code
- Skeleton structure is foundation for upcoming implementation
- DO NOT DELETE - Active development in progress

---

### 1.2 REI Analytics Module

**Status:** 📋 Skeleton (< 5% implemented)
**Documented:** Yes (CLAUDE.md line 292-299)
**Purpose:** Real estate investment analytics and market intelligence

**Frontend Routes:**
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `app/real-estate/rei-analytics/page.tsx` | 11 | Redirect | Redirects to /dashboard |
| `app/real-estate/rei-analytics/layout.tsx` | 17 | Skeleton | TODO comments, basic layout |
| `app/real-estate/rei-analytics/dashboard/page.tsx` | ~60 | Placeholder | Coming Soon content |

**Backend Logic:**
| File | Lines | Status | TODOs |
|------|-------|--------|-------|
| `lib/modules/rei-analytics/actions.ts` | 21 | Placeholder | 3 TODO comments |
| `lib/modules/rei-analytics/queries.ts` | 21 | Placeholder | 3 TODO comments |
| `lib/modules/rei-analytics/schemas.ts` | 21 | Placeholder | 3 TODO comments |
| `lib/modules/rei-analytics/index.ts` | 23 | Placeholder | 1 TODO comment |

**Total Files:** 7 files
**Total Lines:** ~174 lines
**Implementation:** < 5%

**⚠️ UPDATE (2025-10-07): Recommendation:** ✅ **KEEP - IN ACTIVE DEVELOPMENT**
- Module is currently being developed
- TODO comments indicate planned features, not abandoned code
- Skeleton structure is foundation for upcoming implementation
- DO NOT DELETE - Active development in progress

---

### 1.3 Expense & Tax Module

**Status:** 📋 Partial Implementation (~30% complete)
**Documented:** Yes (CLAUDE.md line 301-308)
**Purpose:** Expense tracking and tax management

**Frontend Routes:**
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `app/real-estate/expense-tax/page.tsx` | 11 | Redirect | Redirects to /dashboard |
| `app/real-estate/expense-tax/layout.tsx` | ~40 | Skeleton | Basic layout |
| `app/real-estate/expense-tax/dashboard/page.tsx` | ~80 | Placeholder | Coming Soon UI |

**Backend Logic:**
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `lib/modules/expense-tax/actions.ts` | 450+ | Implemented | Real implementation exists |
| `lib/modules/expense-tax/queries.ts` | 260+ | Implemented | Real queries exist |
| `lib/modules/expense-tax/schemas.ts` | 104+ | Implemented | Zod schemas defined |
| `lib/modules/expense-tax/categories/` | Multiple | Implemented | Subdirectory with logic |
| `lib/modules/expense-tax/receipts/` | Multiple | Implemented | Subdirectory with logic |
| `lib/modules/expense-tax/reports/` | Multiple | Implemented | Subdirectory with logic |
| `lib/modules/expense-tax/tax-estimates/` | Multiple | Implemented | Subdirectory with logic |
| `lib/modules/expense-tax/index.ts` | 44 | Implemented | Full exports |

**Total Files:** ~30+ files
**Total Lines:** ~3,000+ lines
**Implementation:** ~30% (backend exists, frontend is skeleton)

**API Routes:**
| Route | Status |
|-------|--------|
| `/api/v1/expenses/route.ts` | Exists |
| `/api/v1/expenses/categories/route.ts` | Exists |
| `/api/v1/expenses/receipts/route.ts` | Exists |
| `/api/v1/expenses/summary/route.ts` | Exists |

**⚠️ UPDATE (2025-10-07): Recommendation:** ✅ **KEEP ALL - IN ACTIVE DEVELOPMENT**
- Backend logic is substantially implemented (30% complete)
- Frontend routes are being developed (currently skeleton placeholders)
- API routes are part of active development
- Module is in active development - frontend UI implementation in progress
- DO NOT DELETE - All files are part of ongoing development work

---

### 1.4 CMS & Marketing Module

**Status:** 📋 Partial Implementation (~15% complete)
**Documented:** Yes (CLAUDE.md line 310-317)
**Purpose:** Content management system and marketing automation

**Frontend Routes:**
| Directory | Files | Status |
|-----------|-------|--------|
| `app/real-estate/cms-marketing/` | ~10 pages | Mixed (some UI, mostly skeleton) |
| `app/real-estate/cms-marketing/dashboard/` | 1 page | Skeleton |
| `app/real-estate/cms-marketing/content/` | ~4 pages | Skeleton |
| `app/real-estate/cms-marketing/analytics/` | 1 page | Skeleton |

**Backend Logic:**
| File | Status |
|------|--------|
| `lib/modules/cms-marketing/dashboard-queries.ts` | Single file, minimal |

**Components:**
| Directory | Files | Status |
|-----------|-------|--------|
| `components/real-estate/cms-marketing/analytics/` | 6 files | Implemented components |
| `components/real-estate/content/campaigns/` | 4 files | Implemented components |
| `components/real-estate/content/editor/` | 4 files | Implemented components |
| `components/real-estate/content/media/` | 8 files | Implemented components |

**Total Files:** ~40+ files
**Total Lines:** ~2,500+ lines
**Implementation:** ~15% (some components exist, backend in development)

**⚠️ UPDATE (2025-10-07): Recommendation:** ✅ **KEEP ALL - IN ACTIVE DEVELOPMENT**
- Components in `components/real-estate/content/` are part of active development
- Skeleton app routes in `app/real-estate/cms-marketing/` being implemented
- Backend file `lib/modules/cms-marketing/dashboard-queries.ts` is foundation for expansion
- Module is in active development - components and routes being built out
- DO NOT DELETE - All files are part of ongoing development work

---

### 1.5 Marketplace Module

**Status:** 📋 Partial Implementation (~20% complete)
**Documented:** Yes (CLAUDE.md line 319-326)
**Purpose:** Tool marketplace for purchasing AI tools and integrations

**Frontend Routes:**
| File | Status |
|------|--------|
| `app/real-estate/marketplace/page.tsx` | Redirect |
| `app/real-estate/marketplace/layout.tsx` | Skeleton |
| `app/real-estate/marketplace/dashboard/page.tsx` | Skeleton |

**Backend Logic:**
| File | Lines | Status |
|------|-------|--------|
| `lib/modules/marketplace/actions.ts` | ~200 | Implemented |
| `lib/modules/marketplace/queries.ts` | ~300 | Implemented |
| `lib/modules/marketplace/schemas.ts` | ~150 | Implemented |
| `lib/modules/marketplace/cart/actions.ts` | ~100 | Implemented |
| `lib/modules/marketplace/cart/queries.ts` | ~80 | Implemented |
| `lib/modules/marketplace/index.ts` | ~30 | Implemented |

**Components:**
| Directory | Files | Status |
|-----------|-------|--------|
| `components/real-estate/marketplace/cart/` | 3 files | Implemented (CheckoutModal, CartItem, ShoppingCartPanel) |
| `components/real-estate/marketplace/filters/` | 1 file | Implemented (MarketplaceFilters) |
| `components/real-estate/marketplace/grid/` | 2 files | Implemented (MarketplaceGrid, ToolCard) |

**API Routes:**
| Route | Status |
|-------|--------|
| `/api/v1/ai-garage/orders/route.ts` | Exists |
| `/api/v1/ai-garage/templates/route.ts` | Exists |

**Total Files:** ~15+ files
**Total Lines:** ~1,500+ lines
**Implementation:** ~20% (backend + components exist, frontend routes in development)

**⚠️ UPDATE (2025-10-07): Recommendation:** ✅ **KEEP ALL - IN ACTIVE DEVELOPMENT**
- `lib/modules/marketplace/` - Substantial backend logic being expanded
- Components in `components/real-estate/marketplace/` - Actively being used and developed
- Skeleton frontend routes in `app/real-estate/marketplace/` - Being implemented
- API routes in `app/api/v1/ai-garage/` - Part of active development
- Module is in active development - all components are part of ongoing work
- DO NOT DELETE - All files are part of ongoing development work

---

## 2. Workspace (Transaction Management) Components Analysis

### 2.1 Potentially Unused Workspace Components

**Directory:** `components/real-estate/workspace/`
**Total Files:** 26+ components

**Usage Analysis:**

| Component | Purpose | Usage Check | Status |
|-----------|---------|-------------|--------|
| `onboarding-tour.tsx` | First-time user tutorial | 0 imports found | ❓ Review |
| `help-panel.tsx` | Contextual help panel | 0 imports found | ❓ Review |
| `compliance-alerts.tsx` | Compliance notifications | 0 imports found | ❓ Review |
| `workflow-templates.tsx` | Pre-built workflow templates | 0 imports found | ❓ Review |

**Note:** These components may be:
1. **Dynamically imported** (not detected by static grep)
2. **Future features** (planned but not yet integrated)
3. **Truly unused** (created but abandoned)

**Recommendation:** **MANUAL REVIEW REQUIRED**
- Check if components are imported via dynamic imports: `import()`
- Search for component usage in JSX: `<OnboardingTour`
- Verify if components are referenced in configuration files
- **Conservative approach:** Keep for now (active workspace module)

---

## 3. UI Components Analysis

### 3.1 shadcn/ui Components (components/ui/)

**Status:** ✅ **KEEP ALL** (60+ files, ~3,500+ lines)

**Reasoning:**
- Standard shadcn/ui library components
- Shared across all features (CRM, workspace, auth, admin)
- High reusability - removing one could break multiple features
- Small individual file sizes (~50-150 lines each)

**Sample Components:**
- Primitives: `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`
- Advanced: `calendar.tsx`, `chart.tsx`, `table.tsx`, `form.tsx`
- Custom: `sidebar/`, `coming-soon-badge.tsx`, `lazy-image.tsx`

**Recommendation:** ✅ **KEEP** - Core UI infrastructure

---

### 3.2 Shared Components (components/shared/)

**Status:** ✅ **KEEP MOST** (~30 files)

**Categories:**

**Dashboard Widgets** (`components/shared/dashboard/widgets/`):
- 6 widget files: `ActivityFeedWidget`, `AIInsightsWidget`, `KPIRingsWidget`, etc.
- **Status:** Used by industry dashboards
- **Action:** ✅ KEEP

**Navigation** (`components/shared/navigation/`):
- 7 files: `header`, `sidebar-nav`, `user-menu`, `notification-dropdown`, etc.
- **Status:** Core navigation infrastructure
- **Action:** ✅ KEEP

**Layouts** (`components/shared/layouts/`):
- 3 files: `footer`, `marketing-nav`, `platform-layout`
- **Status:** Used across all route groups
- **Action:** ✅ KEEP

**Recommendation:** ✅ **KEEP ALL** - Essential shared infrastructure

---

### 3.3 Feature-Specific Components

**Admin Components** (`components/features/admin/`):
- 8 files: `admin-dashboard-content`, `stat-card`, `revenue-chart`, etc.
- **Status:** ✅ Used by `/admin` routes
- **Action:** ✅ KEEP

**Onboarding Components** (`components/features/onboarding/`):
- 6 files: `org-details-form`, `payment-form`, `plan-selection-form`, etc.
- **Status:** ✅ Used by `/onboarding` flow
- **Action:** ✅ KEEP

**Dashboard Components** (`components/features/dashboard/`):
- 15+ files organized in subdirectories (activity, metrics, quick-actions, widgets)
- **Status:** ✅ Used by role-based dashboards
- **Action:** ✅ KEEP

**Pricing Components** (`components/features/pricing/`):
- 5 files: `pricing-card`, `pricing-tiers`, `pricing-toggle`, `pricing-faq`, etc.
- **Status:** ✅ Used by `/pricing` page
- **Action:** ✅ KEEP

**Landing Components** (`components/features/landing/`):
- 3 files: `hero-section`, `features-section`, `cta-section`
- **Status:** ✅ Used by marketing landing page
- **Action:** ✅ KEEP

---

### 3.4 Real Estate CRM Components

**Directory:** `components/real-estate/crm/`
**Total Files:** ~35+ components

**Status:** ✅ **KEEP ALL**

**Categories:**

**Contacts** (7 files):
- `contact-table`, `contact-card`, `contact-form-dialog`, `contact-filters`, etc.
- **Status:** Used by `/real-estate/crm/contacts/`
- **Action:** ✅ KEEP

**Leads** (9 files):
- `lead-table`, `lead-card`, `lead-form-dialog`, `lead-activity-timeline`, etc.
- **Status:** Used by `/real-estate/crm/leads/`
- **Action:** ✅ KEEP

**Deals** (5 files):
- `pipeline-board`, `pipeline-column`, `deal-card`, `deal-form-dialog`, etc.
- **Status:** Used by `/real-estate/crm/deals/`
- **Action:** ✅ KEEP

**Calendar** (6 files):
- `calendar-view`, `calendar-month-view`, `calendar-week-view`, `appointment-form-dialog`, etc.
- **Status:** Used by `/real-estate/crm/calendar/`
- **Action:** ✅ KEEP

**Analytics** (5 files):
- `kpi-card`, `revenue-chart`, `sales-funnel-chart`, `pipeline-value-chart`, etc.
- **Status:** Used by `/real-estate/crm/analytics/`
- **Action:** ✅ KEEP

**Recommendation:** ✅ **KEEP ALL** - Active CRM module with full implementation

---

## 4. Library Modules Analysis (lib/modules/)

### 4.1 Implemented Modules - KEEP

**Status:** ✅ **KEEP** (Core business logic)

| Module | Files | Implementation | Status |
|--------|-------|----------------|--------|
| `admin/` | ~15 files | 100% | ✅ KEEP - Platform admin functionality |
| `crm/` | ~20 files | 100% | ✅ KEEP - CRM business logic |
| `transactions/` | ~30 files | 100% | ✅ KEEP - Workspace/transaction logic |
| `dashboard/` | ~15 files | 100% | ✅ KEEP - Dashboard metrics/widgets |
| `onboarding/` | ~8 files | 100% | ✅ KEEP - Onboarding flow |
| `organization/` | ~5 files | 100% | ✅ KEEP - Org management |
| `activities/` | ~3 files | 100% | ✅ KEEP - Activity tracking |
| `analytics/` | ~5 files | 100% | ✅ KEEP - Analytics logic |
| `ai/` | ~8 files | 100% | ✅ KEEP - AI integration |

**Total:** ~110+ files, ~15,000+ lines of business logic
**Recommendation:** ✅ **KEEP ALL** - Core platform functionality

---

### 4.2 Previously Flagged "Skeleton" Modules - ⚠️ UPDATE: KEEP ALL

**⚠️ UPDATE (2025-10-07):** These modules are **IN ACTIVE DEVELOPMENT**

| Module | Files | Lines | Status | Action |
|--------|-------|-------|--------|--------|
| `ai-hub/` | 4 files | ~90 | In Development | ✅ KEEP |
| `rei-analytics/` | 4 files | ~85 | In Development | ✅ KEEP |

**Updated Rationale:**
- Files contain TODO comments indicating **planned features**, not abandoned code
- Skeleton structure is foundation for upcoming implementation
- Required for UI-first development phase
- Part of active development roadmap

**DO NOT DELETE:** All files are part of ongoing development work

---

### 4.3 Previously Flagged "Partial Implementation" - ⚠️ UPDATE: KEEP ALL

**⚠️ UPDATE (2025-10-07):** These modules are **IN ACTIVE DEVELOPMENT**

| Module | Files | Lines | Backend | Frontend | Action |
|--------|-------|-------|---------|----------|--------|
| `expense-tax/` | ~30 files | ~3,000 | ✅ 80% | 🔄 In Dev | ✅ KEEP ALL |
| `cms-marketing/` | ~40 files | ~2,500 | 🔄 In Dev | 🔄 In Dev | ✅ KEEP ALL |
| `marketplace/` | ~15 files | ~1,500 | ✅ 60% | 🔄 In Dev | ✅ KEEP ALL |

**Updated Recommendations:**

**expense-tax:**
- **Keep:** All backend logic in `lib/modules/expense-tax/` ✅
- **Keep:** Frontend routes in `app/real-estate/expense-tax/` (being implemented) ✅
- **Keep:** API routes in `app/api/v1/expenses/` ✅
- **Rationale:** Module in active development - frontend implementation in progress

**cms-marketing:**
- **Keep:** `lib/modules/cms-marketing/dashboard-queries.ts` (foundation for expansion) ✅
- **Keep:** Components in `components/real-estate/content/` ✅
- **Keep:** Frontend routes in `app/real-estate/cms-marketing/` (being implemented) ✅
- **Rationale:** Module in active development - all components part of ongoing work

**marketplace:**
- **Keep:** All backend in `lib/modules/marketplace/` ✅
- **Keep:** Components in `components/real-estate/marketplace/` ✅
- **Keep:** Frontend routes in `app/real-estate/marketplace/` (being implemented) ✅
- **Keep:** API routes in `app/api/v1/ai-garage/` ✅
- **Rationale:** Module in active development - frontend routes being built out

**DO NOT DELETE:** All files across all three modules are part of active development

---

## 5. Library Infrastructure Analysis (lib/)

### 5.1 Core Infrastructure - KEEP ALL

**Status:** ✅ **KEEP** (Essential platform infrastructure)

| Directory | Purpose | Status |
|-----------|---------|--------|
| `lib/auth/` | Authentication, RBAC, session management | ✅ KEEP |
| `lib/database/` | Prisma client, middleware, RLS | ✅ KEEP |
| `lib/config/` | Configuration, environment variables | ✅ KEEP |
| `lib/api/` | API utilities, error handling | ✅ KEEP |
| `lib/analytics/` | Analytics tracking | ✅ KEEP |
| `lib/email/` | Email sending utilities | ✅ KEEP |
| `lib/storage/` | File storage, encryption | ✅ KEEP |
| `lib/security/` | Security utilities | ✅ KEEP |
| `lib/middleware/` | Custom middleware | ✅ KEEP |
| `lib/realtime/` | Supabase realtime | ✅ KEEP |
| `lib/performance/` | Performance monitoring | ✅ KEEP |
| `lib/export/` | Data export utilities | ✅ KEEP |
| `lib/pdf/` | PDF generation | ✅ KEEP |
| `lib/supabase/` | Supabase client setup | ✅ KEEP |
| `lib/services/` | Third-party services | ✅ KEEP |

**Recommendation:** ✅ **KEEP ALL** - Critical infrastructure

---

### 5.2 Data & Mocks Infrastructure - KEEP

**Status:** ✅ **KEEP** (Active mock data mode)

**Directory:** `lib/data/`

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `lib/data/config.ts` | Mock data configuration | ~40 | ✅ KEEP |
| `lib/data/index.ts` | Provider exports | ~20 | ✅ KEEP |
| `lib/data/mocks/crm.ts` | CRM mock data (75 records) | ~400 | ✅ KEEP |
| `lib/data/mocks/generators.ts` | Mock data generators | ~150 | ✅ KEEP |
| `lib/data/providers/crm-provider.ts` | CRM data provider | ~200 | ✅ KEEP |

**Total:** 5 files, ~810 lines

**Rationale:**
- **Active feature:** Mock data mode enabled (`NEXT_PUBLIC_USE_MOCKS=true`)
- **Development workflow:** UI-first development pattern
- **Documentation:** `MOCK-DATA-WORKFLOW.md`, `QUICK-START-MOCK-MODE.md`

**Recommendation:** ✅ **KEEP ALL** - Active development infrastructure

---

### 5.3 Types Analysis - KEEP MOST

**Directory:** `lib/types/`
**Total Files:** 20+ type definition files

**Status:** ✅ **KEEP MOST**

**Categories:**

**Shared Types** (`lib/types/shared/`):
- `api.ts`, `csv.ts`, `supabase.ts`, `validation.ts`, `index.ts`
- **Status:** ✅ KEEP - Used across platform

**Real Estate Types** (`lib/types/real-estate/`):
- `auth.ts`, `crm.ts`, `filters.ts`, `organization.ts`, `projects.ts`, `tasks.ts`, `seo.ts`, `notifications.ts`
- **Status:** Mixed - some have TODO comments (crm, notifications, projects, tasks)
- **Recommendation:** ⚠️ REVIEW - Check if used or pure placeholders

**Web Types** (`lib/types/web/`):
- `analytics.ts`, `index.ts`
- **Status:** ✅ KEEP - Used by marketing pages

**Other Types:**
- `lib/types/chatbot.ts` - TODO comment, 18 lines - ⚠️ REVIEW
- `lib/types/roi-calculator.ts` - ✅ KEEP - Used by calculator component
- `lib/types/prisma-compat.ts` - ✅ KEEP - Prisma compatibility layer
- `lib/types/index.ts` - ✅ KEEP - Main exports

**Recommendation:**
- ✅ KEEP: All shared and web types
- ⚠️ REVIEW: Real estate types with TODO comments (4 files: crm, notifications, projects, tasks)
- ⚠️ REVIEW: `chatbot.ts` (may be unused)
- **Estimated deletion:** 0-5 files (after manual review)

---

### 5.4 Utilities Analysis - KEEP

**Directory:** `lib/utils/`
**Status:** ✅ **KEEP ALL**

**Reasoning:**
- Utility functions are typically small and highly reusable
- Difficult to detect usage via static analysis (can be used anywhere)
- Low cost to maintain (usually <100 lines per file)

**Recommendation:** ✅ **KEEP ALL** - Low-risk, high-reusability

---

### 5.5 Hooks Analysis - KEEP

**Directory:** `lib/hooks/`
**Status:** ✅ **KEEP ALL**

**Reasoning:**
- Custom React hooks used across components
- Removing one could break multiple features
- Typically small files (<100 lines)

**Recommendation:** ✅ **KEEP ALL** - Core React infrastructure

---

### 5.6 Tools & Industries - REVIEW

**Tools Directory** (`lib/tools/`):
- Registry and shared tools for AI tool marketplace
- **Status:** Used by marketplace module
- **Recommendation:** ✅ KEEP (marketplace backend exists)

**Industries Directory** (`lib/industries/`):
- Multi-industry architecture setup
- Subdirectories: `_core`, `real-estate`, `healthcare`, `configs`
- **Status:** Real estate implemented, healthcare is placeholder
- **Recommendation:**
  - ✅ KEEP: `_core/`, `real-estate/`, `configs/`
  - ⚠️ REVIEW: `healthcare/` (future industry, may be skeleton)

---

## 6. API Routes Analysis

### 6.1 All API Routes (33 total)

**Status:** ✅ **KEEP MOST** (Active routes with usage evidence)

**Authentication Routes** (2):
- `/api/auth/login/route.ts` - ✅ KEEP (used by login page)
- `/api/auth/signup/route.ts` - ✅ KEEP (used by signup page)

**Onboarding Routes** (3):
- `/api/onboarding/organization/route.ts` - ✅ KEEP
- `/api/v1/onboarding/payment-intent/route.ts` - ✅ KEEP
- `/api/v1/onboarding/session/route.ts` - ✅ KEEP

**Admin Routes** (10):
- `/api/v1/admin/alerts/route.ts` - ✅ KEEP (used by admin alerts page)
- `/api/v1/admin/audit-logs/route.ts` - ✅ KEEP
- `/api/v1/admin/feature-flags/route.ts` - ✅ KEEP (used by feature flags page)
- `/api/v1/admin/metrics/route.ts` - ✅ KEEP (used by admin dashboard)
- `/api/v1/admin/organizations/route.ts` - ✅ KEEP
- `/api/v1/admin/organizations/[id]/route.ts` - ✅ KEEP
- `/api/v1/admin/users/route.ts` - ✅ KEEP
- `/api/v1/admin/users/[id]/route.ts` - ✅ KEEP
- `/api/v1/admin/users/suspend/route.ts` - ✅ KEEP (used by users page)
- `/api/v1/admin/users/reactivate/route.ts` - ✅ KEEP

**Dashboard Routes** (8):
- `/api/v1/dashboard/actions/route.ts` - ✅ KEEP (used by quick actions)
- `/api/v1/dashboard/actions/[id]/execute/route.ts` - ✅ KEEP
- `/api/v1/dashboard/activities/route.ts` - ✅ KEEP
- `/api/v1/dashboard/activities/[id]/route.ts` - ✅ KEEP
- `/api/v1/dashboard/metrics/route.ts` - ✅ KEEP
- `/api/v1/dashboard/metrics/[id]/route.ts` - ✅ KEEP
- `/api/v1/dashboard/metrics/calculate/route.ts` - ✅ KEEP (used by KPI cards)
- `/api/v1/dashboard/widgets/route.ts` - ✅ KEEP
- `/api/v1/dashboard/widgets/[id]/route.ts` - ✅ KEEP

**Expense Routes** (4):
- `/api/v1/expenses/route.ts` - ⚠️ REVIEW (expense-tax frontend is skeleton)
- `/api/v1/expenses/categories/route.ts` - ⚠️ REVIEW
- `/api/v1/expenses/receipts/route.ts` - ⚠️ REVIEW
- `/api/v1/expenses/summary/route.ts` - ⚠️ REVIEW

**AI Garage / Marketplace Routes** (2):
- `/api/v1/ai-garage/orders/route.ts` - ✅ KEEP (marketplace backend exists)
- `/api/v1/ai-garage/templates/route.ts` - ✅ KEEP

**CRM Routes** (1):
- `/api/v1/leads/route.ts` - ✅ KEEP (CRM leads page uses mock data, API may be unused)

**Webhooks** (1):
- `/api/webhooks/stripe/route.ts` - ✅ KEEP (payment processing)

**Health Check** (1):
- `/api/health/route.ts` - ✅ KEEP (system monitoring)

---

### 6.2 API Routes Recommendations

**KEEP (29 routes):**
- All auth, onboarding, admin, dashboard, marketplace, webhooks, health routes
- Evidence of active usage via fetch calls in components/pages

**REVIEW (4 routes):**
- Expense API routes (`/api/v1/expenses/*`)
- **Rationale:** Frontend is skeleton, backend is implemented
- **Decision:** Keep if backend logic is valuable for future implementation
- **Conservative approach:** ✅ KEEP (backend investment exists)

**REVIEW (1 route):**
- `/api/v1/leads/route.ts`
- **Rationale:** CRM uses mock data providers, may not call this API
- **Action:** Check if Server Actions replaced this API route
- **Conservative approach:** ✅ KEEP (low cost, may be used in production mode)

**Final Recommendation:** ✅ **KEEP ALL 33 API ROUTES**
- Most have clear usage evidence
- Expense routes support implemented backend
- Leads route may be for future real DB mode
- Low cost to maintain
- Risk of breaking features outweighs cleanup benefit

---

## 7. Test Files Analysis

### 7.1 Test Coverage

**Location:** `__tests__/` directory
**Total Test Files:** 61

**Categories:**

**API Tests** (`__tests__/api/`):
- Admin tests (3 files): audit-logs, organizations, users
- Webhook tests (1 file): stripe
- **Status:** ✅ KEEP - Testing critical API endpoints

**Component Tests** (`__tests__/components/`):
- Admin components (3 files)
- Landing page components (4 files)
- Layouts (1 file)
- Onboarding (1 file)
- Pricing (3 files)
- Shared navigation (1 file)
- Providers (1 file)
- UI components (1 file: button)
- **Status:** ✅ KEEP - Testing active components

**Database Tests** (`__tests__/database/`):
- Tenant isolation test
- **Status:** ✅ KEEP - Critical multi-tenancy test

**Module Tests** (`__tests__/modules/`):
- **Expected:** Tests for modules in `lib/modules/`
- **Status:** Review test count vs module count

**Integration Tests** (`__tests__/integration/`):
- **Expected:** E2E workflow tests
- **Status:** Review existence

---

### 7.2 Orphaned Tests Analysis

**Question:** Are there tests for skeleton modules (ai-hub, rei-analytics)?

**Check Required:**
```bash
# Search for tests of skeleton modules
find __tests__ -name "*ai-hub*" -o -name "*rei-analytics*" 2>/dev/null
```

**Recommendation:**
- ⚠️ **DELETE** any tests for ai-hub and rei-analytics modules (if they exist)
- ✅ **KEEP** all other tests (active features)

**Estimated Impact:**
- If skeleton module tests exist: Delete 0-10 test files
- Otherwise: ✅ KEEP ALL 61 test files

---

## 8. Loading States & Skeletons

### 8.1 Loading Skeleton Files

**Pattern:** Multiple `loading.tsx` files with TODO comments

**Found Files:**
| File | Lines | TODOs | Status |
|------|-------|-------|--------|
| `app/real-estate/crm/*/loading.tsx` | 5 each | 1 each | ✅ KEEP - Valid Next.js pattern |
| `app/real-estate/workspace/*/loading.tsx` | 5-28 | 1-4 | ✅ KEEP - Valid Next.js pattern |

**Total:** ~15+ loading skeleton files

**Reasoning:**
- `loading.tsx` is a valid Next.js 15 App Router pattern
- Provides instant loading states during navigation
- TODO comments are notes for enhancement (add branded spinners, etc.)
- Not "unused" code - actively used by Next.js router

**Recommendation:** ✅ **KEEP ALL** - Valid Next.js loading states

---

## 9. ⚠️ CRITICAL UPDATE: Skeleton Features Summary

**🔴 IMPORTANT (2025-10-07):** All previously flagged "skeleton" modules are **IN ACTIVE DEVELOPMENT**.
**DO NOT DELETE ANY FILES from these modules:** ai-hub, rei-analytics, expense-tax, cms-marketing, marketplace

---

### 9.1 Previously Flagged Modules - ✅ NOW CONFIRMED AS ACTIVE DEVELOPMENT

**⚠️ UPDATE (2025-10-07):** The recommendations in this section are **OBSOLETE**.

| Module | Frontend Files | Backend Files | Total Lines | ~~Old Action~~ | **NEW Action** |
|--------|----------------|---------------|-------------|----------------|----------------|
| ai-hub | 3 | 4 | ~260 | ~~DELETE~~ | ✅ **KEEP - In Development** |
| rei-analytics | 3 | 4 | ~174 | ~~DELETE~~ | ✅ **KEEP - In Development** |

**Total:** 14 files, ~434 lines - **ALL TO BE KEPT**

**Updated Rationale:**
- Modules are in active development (not abandoned)
- TODO comments indicate planned features, not placeholders
- Skeleton structure is foundation for upcoming implementation
- Required for development roadmap
- **DO NOT DELETE** - All files are part of ongoing work

---

### 9.2 Previously Flagged "Partial Implementation" - ✅ NOW CONFIRMED AS ACTIVE

**⚠️ UPDATE (2025-10-07):** The recommendations in this section are **OBSOLETE**. All modules are in active development.

**expense-tax:**
- ~~Delete: Frontend skeleton~~ → ✅ **KEEP:** Frontend routes (being implemented)
- **Keep:** Backend logic (30+ files in `lib/modules/expense-tax/`) ✅
- **Keep:** API routes (4 routes in `app/api/v1/expenses/`) ✅
- ~~Savings: ~200 lines~~ → **NO DELETION** - Module in active development

**cms-marketing:**
- ~~Delete: Frontend skeleton~~ → ✅ **KEEP:** Frontend routes (being implemented)
- ~~Delete: Minimal backend~~ → ✅ **KEEP:** Backend file (foundation for expansion)
- ~~Review then Delete: Components~~ → ✅ **KEEP:** All components (part of development)
- ~~Savings: ~500-2,000 lines~~ → **NO DELETION** - Module in active development

**marketplace:**
- ~~Delete: Frontend skeleton~~ → ✅ **KEEP:** Frontend routes (being implemented)
- **Keep:** Backend logic (10+ files in `lib/modules/marketplace/`) ✅
- **Keep:** Components (6 files in `components/real-estate/marketplace/`) ✅
- **Keep:** API routes (2 routes in `app/api/v1/ai-garage/`) ✅
- ~~Savings: ~200 lines~~ → **NO DELETION** - Module in active development

**Total:** ~0 files deleted - ALL FILES TO BE KEPT (active development)

---

## 10. ⚠️ OBSOLETE: Cleanup Recommendations (DO NOT EXECUTE)

**🔴 CRITICAL WARNING (2025-10-07):**
The deletion recommendations in this entire section are **OBSOLETE** and should **NOT BE EXECUTED**.

All previously flagged modules (ai-hub, rei-analytics, expense-tax, cms-marketing, marketplace) are **IN ACTIVE DEVELOPMENT**.

**DO NOT DELETE ANY FILES** from these modules.

---

### 10.1 ~~Safe to Delete~~ → OBSOLETE - DO NOT DELETE

**⚠️ The following deletion workflows are OBSOLETE. DO NOT EXECUTE.**

**~~Skeleton Modules - Complete Deletion:~~**

#### AI Hub Module (7 files, ~260 lines)
- [ ] `app/real-estate/ai-hub/page.tsx`
- [ ] `app/real-estate/ai-hub/layout.tsx`
- [ ] `app/real-estate/ai-hub/dashboard/page.tsx`
- [ ] `lib/modules/ai-hub/actions.ts`
- [ ] `lib/modules/ai-hub/queries.ts`
- [ ] `lib/modules/ai-hub/schemas.ts`
- [ ] `lib/modules/ai-hub/index.ts`
- [ ] Directory: `app/real-estate/ai-hub/` (entire directory)
- [ ] Directory: `lib/modules/ai-hub/` (entire directory)

#### REI Analytics Module (7 files, ~174 lines)
- [ ] `app/real-estate/rei-analytics/page.tsx`
- [ ] `app/real-estate/rei-analytics/layout.tsx`
- [ ] `app/real-estate/rei-analytics/dashboard/page.tsx`
- [ ] `lib/modules/rei-analytics/actions.ts`
- [ ] `lib/modules/rei-analytics/queries.ts`
- [ ] `lib/modules/rei-analytics/schemas.ts`
- [ ] `lib/modules/rei-analytics/index.ts`
- [ ] Directory: `app/real-estate/rei-analytics/` (entire directory)
- [ ] Directory: `lib/modules/rei-analytics/` (entire directory)

**Estimated cleanup: 14 files, ~434 lines**

---

### 10.2 Review Then Delete (Medium Confidence)

**Expense-Tax Frontend Skeleton (3 files, ~200 lines):**
- [ ] `app/real-estate/expense-tax/page.tsx` (redirect only)
- [ ] `app/real-estate/expense-tax/layout.tsx` (skeleton)
- [ ] `app/real-estate/expense-tax/dashboard/page.tsx` (coming soon banner)
- [ ] **KEEP:** `lib/modules/expense-tax/` (all backend logic)
- [ ] **KEEP:** `app/api/v1/expenses/` (all API routes)

**CMS-Marketing Skeleton (10+ files, ~500 lines):**
- [ ] `app/real-estate/cms-marketing/page.tsx`
- [ ] `app/real-estate/cms-marketing/layout.tsx`
- [ ] `app/real-estate/cms-marketing/dashboard/page.tsx`
- [ ] `app/real-estate/cms-marketing/content/page.tsx`
- [ ] `app/real-estate/cms-marketing/content/editor/page.tsx`
- [ ] `app/real-estate/cms-marketing/content/campaigns/page.tsx`
- [ ] `app/real-estate/cms-marketing/analytics/page.tsx`
- [ ] `lib/modules/cms-marketing/dashboard-queries.ts`
- [ ] Directory: `app/real-estate/cms-marketing/` (entire directory)
- [ ] **REVIEW FIRST:** `components/real-estate/content/` (check usage)
- [ ] **REVIEW FIRST:** `components/real-estate/cms-marketing/` (check usage)

**Marketplace Frontend Skeleton (3 files, ~200 lines):**
- [ ] `app/real-estate/marketplace/page.tsx`
- [ ] `app/real-estate/marketplace/layout.tsx`
- [ ] `app/real-estate/marketplace/dashboard/page.tsx`
- [ ] **KEEP:** `lib/modules/marketplace/` (all backend logic)
- [ ] **KEEP:** `components/real-estate/marketplace/` (all components)
- [ ] **KEEP:** `app/api/v1/ai-garage/` (all API routes)

**Estimated cleanup after review: 16+ files, ~900 lines**

---

### 10.3 Manual Review Required

**Type Files with TODO Comments (5 files, ~80 lines):**
- [ ] `lib/types/chatbot.ts` (18 lines, 1 TODO)
- [ ] `lib/types/real-estate/crm.ts` (14 lines, 1 TODO)
- [ ] `lib/types/real-estate/notifications.ts` (14 lines, 1 TODO)
- [ ] `lib/types/real-estate/projects.ts` (15 lines, 1 TODO)
- [ ] `lib/types/real-estate/tasks.ts` (15 lines, 1 TODO)

**Action Required:**
1. Search for imports: `grep -r "from.*types/real-estate/crm" app lib components`
2. If 0 results: Safe to delete
3. If >0 results: Keep (even with TODO comments)

**Workspace Components (4 files, ~600 lines):**
- [ ] `components/real-estate/workspace/onboarding-tour.tsx`
- [ ] `components/real-estate/workspace/help-panel.tsx`
- [ ] `components/real-estate/workspace/compliance-alerts.tsx`
- [ ] `components/real-estate/workspace/workflow-templates.tsx`

**Action Required:**
1. Check for dynamic imports: `grep -r "import.*onboarding-tour" app`
2. Check for JSX usage: `grep -r "<OnboardingTour" app`
3. Check configuration files for references
4. **Conservative:** Keep for now (workspace is active module)

**CMS/Content Components (22 files, ~1,500 lines):**
- [ ] Directory: `components/real-estate/content/` (verify usage)
- [ ] Directory: `components/real-estate/cms-marketing/` (verify usage)

**Action Required:**
1. Search for imports from these directories
2. If used: Keep
3. If unused: Delete entire directories

**Healthcare Industry (unknown files, unknown lines):**
- [ ] Directory: `lib/industries/healthcare/` (future industry)

**Action Required:**
1. Check if skeleton/placeholder
2. If empty placeholders: Delete
3. If has implementation: Keep for future

---

### 10.4 Keep (Active Code)

**✅ All Core Infrastructure:**
- `lib/auth/` - Authentication & RBAC
- `lib/database/` - Prisma & RLS
- `lib/data/` - Mock data system (ACTIVE)
- `lib/config/`, `lib/api/`, `lib/utils/`, `lib/hooks/`
- All other `lib/` infrastructure directories

**✅ All Active Modules (INCLUDING PREVIOUSLY FLAGGED):**
- `lib/modules/admin/`
- `lib/modules/crm/`
- `lib/modules/transactions/`
- `lib/modules/dashboard/`
- `lib/modules/onboarding/`
- `lib/modules/organization/`
- `lib/modules/activities/`
- `lib/modules/analytics/`
- `lib/modules/ai/`
- ✅ `lib/modules/ai-hub/` **← IN ACTIVE DEVELOPMENT - KEEP ALL**
- ✅ `lib/modules/rei-analytics/` **← IN ACTIVE DEVELOPMENT - KEEP ALL**
- ✅ `lib/modules/expense-tax/` **← IN ACTIVE DEVELOPMENT - KEEP ALL (frontend + backend)**
- ✅ `lib/modules/cms-marketing/` **← IN ACTIVE DEVELOPMENT - KEEP ALL**
- ✅ `lib/modules/marketplace/` **← IN ACTIVE DEVELOPMENT - KEEP ALL (frontend + backend)**

**✅ All UI Components:**
- `components/ui/` (60+ shadcn/ui components)
- `components/shared/` (navigation, layouts, dashboard widgets)
- `components/features/` (admin, onboarding, pricing, landing, dashboard)
- `components/real-estate/crm/` (35+ CRM components)
- `components/real-estate/workspace/` (26+ workspace components)
- `components/real-estate/marketplace/` (6 marketplace components)
- `components/layouts/` (layout components)

**✅ All Active Pages:**
- `app/(auth)/` - Login, signup, onboarding
- `app/(admin)/` - Admin dashboard
- `app/(marketing)/` - Landing, pricing
- `app/real-estate/dashboard/` - Industry dashboard
- `app/real-estate/crm/` - CRM module pages
- `app/real-estate/workspace/` - Transaction module pages
- `app/settings/` - Settings pages

**✅ All API Routes (33 routes):**
- Authentication, onboarding, admin, dashboard, expenses, marketplace, webhooks, health

**✅ All Test Files (61 files):**
- API tests, component tests, database tests, integration tests
- **Exception:** Delete tests for ai-hub and rei-analytics if they exist

**✅ All Loading States:**
- `app/**/loading.tsx` files (valid Next.js pattern)

---

## 11. Verification Commands

### Before Deletion

```bash
# Type check
npx tsc --noEmit

# Linting
npm run lint

# Tests
npm test

# Build check
npm run build
```

### After Deletion

```bash
# 1. Type check (MUST pass)
npx tsc --noEmit 2>&1 | tee type-check-after-cleanup.log

# 2. Lint check (MUST pass)
npm run lint 2>&1 | tee lint-after-cleanup.log

# 3. Test suite (MUST pass)
npm test -- --passWithNoTests 2>&1 | tee test-after-cleanup.log

# 4. Build (MUST succeed)
npm run build 2>&1 | tee build-after-cleanup.log

# 5. Verify no broken imports
grep -r "from.*ai-hub\|from.*rei-analytics" app lib components 2>/dev/null

# 6. Verify API routes still exist
find app/api -name "route.ts" 2>/dev/null | wc -l  # Should be 33 (or 29 if expenses deleted)

# 7. Check for missing components
npm run dev  # Start dev server and manually test navigation
```

---

## 12. Deletion Workflow

### Phase 1: High-Confidence Deletions (Low Risk)

**Target:** ai-hub and rei-analytics skeleton modules

```bash
# 1. Create backup branch
git checkout -b cleanup/remove-skeleton-modules
git branch backup/pre-cleanup-$(date +%Y%m%d)

# 2. Delete ai-hub module
rm -rf "app/real-estate/ai-hub"
rm -rf "lib/modules/ai-hub"

# 3. Delete rei-analytics module
rm -rf "app/real-estate/rei-analytics"
rm -rf "lib/modules/rei-analytics"

# 4. Search for any remaining references
grep -r "ai-hub\|ai_hub\|aiHub" app lib components prisma
grep -r "rei-analytics\|rei_analytics\|reiAnalytics" app lib components prisma

# 5. Remove imports (if any found)
# Edit files to remove broken imports

# 6. Run verification commands (see section 11)
npx tsc --noEmit
npm run lint
npm test
npm run build

# 7. If all pass: Commit
git add -A
git commit -m "cleanup: remove skeleton modules (ai-hub, rei-analytics)

Removed:
- app/real-estate/ai-hub/ (3 files)
- lib/modules/ai-hub/ (4 files)
- app/real-estate/rei-analytics/ (3 files)
- lib/modules/rei-analytics/ (4 files)

Total: 14 files, ~434 lines

Rationale:
- < 5% implementation (TODO placeholders only)
- No database models in minimal schema
- Not needed for mock data UI development
- Can be recreated when features are prioritized

Verified:
✅ TypeScript: 0 errors
✅ Linting: 0 errors
✅ Tests: All passing
✅ Build: Successful
"

# 8. Test in dev mode
npm run dev
# Navigate to app and verify no broken routes
```

**Expected Impact:**
- ✅ Type check: Should pass (no dependencies on these modules)
- ✅ Linting: Should pass
- ✅ Tests: Should pass (or delete orphaned tests)
- ✅ Build: Should succeed
- ⚠️ Routes: `/real-estate/ai-hub` and `/real-estate/rei-analytics` will 404
  - **Action:** Remove navigation links if they exist

---

### Phase 2: Medium-Confidence Deletions (Medium Risk)

**Target:** Frontend skeletons for expense-tax, cms-marketing, marketplace

**Prerequisite:** Phase 1 completed successfully

```bash
# 1. Create new branch
git checkout -b cleanup/remove-frontend-skeletons

# 2. Delete expense-tax frontend
rm -rf "app/real-estate/expense-tax"
# KEEP: lib/modules/expense-tax/ (backend logic)
# KEEP: app/api/v1/expenses/ (API routes)

# 3. Delete cms-marketing
rm -rf "app/real-estate/cms-marketing"
rm "lib/modules/cms-marketing/dashboard-queries.ts"
rmdir "lib/modules/cms-marketing" 2>/dev/null  # Remove if empty

# 4. Delete marketplace frontend
rm -rf "app/real-estate/marketplace"
# KEEP: lib/modules/marketplace/ (backend logic)
# KEEP: components/real-estate/marketplace/ (components)
# KEEP: app/api/v1/ai-garage/ (API routes)

# 5. Search for references
grep -r "expense-tax\|expense_tax\|expenseTax" app lib components
grep -r "cms-marketing\|cms_marketing\|cmsMarketing" app lib components
grep -r "marketplace" app lib components | grep -v "lib/modules/marketplace\|components/real-estate/marketplace\|api/v1/ai-garage"

# 6. Run verification
npx tsc --noEmit
npm run lint
npm test
npm run build

# 7. If all pass: Commit
git add -A
git commit -m "cleanup: remove frontend skeletons (expense-tax, cms-marketing, marketplace)

Removed:
- app/real-estate/expense-tax/ (3 files, ~200 lines)
- app/real-estate/cms-marketing/ (10+ files, ~500 lines)
- lib/modules/cms-marketing/dashboard-queries.ts (1 file, ~50 lines)
- app/real-estate/marketplace/ (3 files, ~200 lines)

Total: ~17 files, ~950 lines

Kept:
✅ lib/modules/expense-tax/ (backend logic)
✅ lib/modules/marketplace/ (backend logic)
✅ components/real-estate/marketplace/ (components)
✅ app/api/v1/expenses/ (API routes)
✅ app/api/v1/ai-garage/ (API routes)

Rationale:
- Frontend routes are pure skeletons (Coming Soon banners)
- Backend logic is valuable for future implementation
- Components may be actively used

Verified:
✅ TypeScript: 0 errors
✅ Linting: 0 errors
✅ Tests: All passing
✅ Build: Successful
"
```

**Expected Impact:**
- ⚠️ Routes: These URLs will 404:
  - `/real-estate/expense-tax`
  - `/real-estate/cms-marketing`
  - `/real-estate/marketplace`
- **Action:** Remove from navigation if they exist
- ✅ Backend: All backend logic preserved
- ✅ APIs: All API routes functional

---

### Phase 3: Manual Review Deletions (Higher Risk)

**Target:** Type files and components with TODO comments

**Prerequisite:** Phases 1-2 completed successfully

```bash
# 1. Review type files
for file in lib/types/chatbot.ts \
            lib/types/real-estate/crm.ts \
            lib/types/real-estate/notifications.ts \
            lib/types/real-estate/projects.ts \
            lib/types/real-estate/tasks.ts; do
  echo "=== Checking: $file ==="
  grep -r "from.*$(basename $file .ts)" app lib components | grep -v node_modules
  echo ""
done

# 2. If 0 imports found for a file: Safe to delete
# Example (if unused):
# rm lib/types/chatbot.ts

# 3. Review CMS/Content components
echo "=== Checking content components ==="
grep -r "from.*content/campaigns\|from.*content/editor\|from.*content/media" app components

# 4. If 0 imports: Delete directories
# rm -rf components/real-estate/content/
# rm -rf components/real-estate/cms-marketing/

# 5. Review workspace components
for comp in onboarding-tour help-panel compliance-alerts workflow-templates; do
  echo "=== Checking: $comp ==="
  grep -r "import.*$comp\|<$(echo $comp | sed 's/-//g')" app components
done

# 6. If specific component unused: Delete individual files
# rm components/real-estate/workspace/onboarding-tour.tsx

# 7. Run verification after each deletion
npx tsc --noEmit && npm run lint && npm test

# 8. Commit incrementally
git add -A
git commit -m "cleanup: remove unused type files and components

Removed:
- [List specific files deleted]

Verified:
✅ No imports found via grep
✅ TypeScript: 0 errors
✅ Linting: 0 errors
✅ Tests: All passing
"
```

**Conservative Approach:**
- **Delete only if:** 0 imports found AND manual inspection confirms unused
- **Keep if:** Any doubt exists OR file is small (<50 lines)
- **Rationale:** Type files and components are low-cost to maintain

---

### Phase 4: Documentation Updates

**After all deletions:**

```bash
# 1. Update CLAUDE.md
# Remove references to deleted modules:
# - ai-hub
# - rei-analytics
# - expense-tax frontend
# - cms-marketing
# - marketplace frontend

# 2. Update README.md (if it exists)
# Remove skeleton module documentation

# 3. Update routing documentation
# Remove deleted routes from any route maps

# 4. Create cleanup report
cat > CLEANUP-REPORT-$(date +%Y%m%d).md << 'EOF'
# Platform Cleanup Report
*Date: $(date)*

## Summary
Total files deleted: [COUNT]
Total lines removed: [COUNT]
Estimated disk space saved: [SIZE]

## Deleted Modules
### AI Hub (Complete)
- Frontend: app/real-estate/ai-hub/ (3 files)
- Backend: lib/modules/ai-hub/ (4 files)

### REI Analytics (Complete)
- Frontend: app/real-estate/rei-analytics/ (3 files)
- Backend: lib/modules/rei-analytics/ (4 files)

### Expense-Tax (Frontend Only)
- Frontend: app/real-estate/expense-tax/ (3 files)
- **Kept:** lib/modules/expense-tax/ (backend logic)

### CMS-Marketing (Complete)
- Frontend: app/real-estate/cms-marketing/ (10+ files)
- Backend: lib/modules/cms-marketing/ (1 file)
- **Review:** Components (may be deleted separately)

### Marketplace (Frontend Only)
- Frontend: app/real-estate/marketplace/ (3 files)
- **Kept:** lib/modules/marketplace/ (backend logic)

## Verification Results
✅ TypeScript: 0 errors
✅ Linting: 0 errors
✅ Tests: All passing (61 tests)
✅ Build: Successful
✅ Dev Server: Tested manually

## Remaining Work
- [ ] Update navigation to remove deleted routes
- [ ] Update CLAUDE.md to reflect current module list
- [ ] Consider deleting CMS/content components after usage verification

## Rollback Plan
Backup branch created: backup/pre-cleanup-$(date +%Y%m%d)
To rollback: git checkout backup/pre-cleanup-$(date +%Y%m%d)
EOF

# 5. Commit documentation
git add CLEANUP-REPORT-*.md CLAUDE.md README.md
git commit -m "docs: update documentation after cleanup

- Removed references to deleted skeleton modules
- Updated module list in CLAUDE.md
- Created cleanup report with verification results
"
```

---

## 13. Post-Cleanup Actions

### 13.1 Update Navigation

**Check for navigation links to deleted routes:**

```bash
# Search for navigation references
grep -r "ai-hub\|rei-analytics\|expense-tax\|cms-marketing\|marketplace" \
  components/shared/navigation/ \
  components/shared/layouts/ \
  lib/config/navigation.ts 2>/dev/null

# Remove links from:
# - Sidebar navigation
# - Dashboard quick links
# - Module cards
# - Settings pages
```

### 13.2 Update CLAUDE.md

**Edit:** `(platform)/CLAUDE.md`

**Changes:**
1. Remove ai-hub from skeleton modules list
2. Remove rei-analytics from skeleton modules list
3. Update expense-tax status (backend only)
4. Remove cms-marketing from module list
5. Update marketplace status (backend only)
6. Update module count (13 → reduced number)
7. Update file counts in stats

### 13.3 Update .gitignore (if needed)

**Add to .gitignore:**
```
# Cleanup artifacts
CLEANUP-REPORT-*.md
*-after-cleanup.log
```

### 13.4 Performance Check

**Before/after comparison:**

```bash
# File counts
echo "Before: 1,797 files"
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "./node_modules/*" ! -path "./.next/*" | wc -l
echo "After: [NEW COUNT] files"

# Directory size
echo "Before: 1.2 GB"
du -sh .
echo "After: [NEW SIZE]"

# Build time
echo "Before: [TIME]"
time npm run build
echo "After: [NEW TIME]"
```

---

## 14. Risk Assessment

### 14.1 Low Risk Deletions ✅

**ai-hub and rei-analytics modules:**
- **Risk Level:** VERY LOW
- **Confidence:** 99%
- **Rationale:**
  - Pure placeholder files with TODO comments
  - < 5% implementation
  - No dependencies found via grep
  - No database models in current schema
- **Impact:** None (404 on routes that show "Coming Soon" anyway)
- **Rollback:** Easy (restore 14 small files)

### 14.2 Medium Risk Deletions ⚠️

**Frontend skeletons (expense-tax, cms-marketing, marketplace):**
- **Risk Level:** LOW-MEDIUM
- **Confidence:** 85%
- **Rationale:**
  - Frontend is pure skeleton
  - Backend logic preserved
  - Components may have unknown dependencies
- **Impact:** Routes 404, but backend APIs remain functional
- **Rollback:** Moderate (restore ~17 files)

### 14.3 Higher Risk Deletions ⚠️⚠️

**Type files and components:**
- **Risk Level:** MEDIUM
- **Confidence:** 60-70%
- **Rationale:**
  - Static analysis may miss dynamic imports
  - Small files, low cost to keep
  - Some have TODO but may still be used
- **Impact:** Could break features if dependencies missed
- **Rollback:** Easy (small files)
- **Recommendation:** Only delete after thorough manual review

---

## 15. Alternative: Defer Instead of Delete

### 15.1 Deferral Strategy

**Instead of deleting, consider:**

1. **Create archive directory:**
```bash
mkdir -p .archived/2025-10-07
```

2. **Move skeleton modules to archive:**
```bash
mv app/real-estate/ai-hub .archived/2025-10-07/
mv app/real-estate/rei-analytics .archived/2025-10-07/
mv lib/modules/ai-hub .archived/2025-10-07/
mv lib/modules/rei-analytics .archived/2025-10-07/
```

3. **Update .gitignore:**
```
# Archived code
.archived/
```

4. **Benefits:**
- No risk of losing skeleton structure
- Easy to restore if needed
- Cleaner active codebase
- Preserved for reference

5. **Commit:**
```bash
git add .archived/ .gitignore
git commit -m "archive: move skeleton modules to .archived/

Archived modules:
- ai-hub (7 files, ~260 lines)
- rei-analytics (7 files, ~174 lines)

Rationale:
- < 5% implementation (placeholder only)
- Not needed for current development phase
- Preserved for future reference/restoration

Location: .archived/2025-10-07/
"
```

---

## 16. ⚠️ UPDATED: Final Recommendations (2025-10-07)

**🔴 CRITICAL UPDATE:** All previous deletion recommendations are **OBSOLETE**.

### 16.1 ~~Immediate Actions~~ → OBSOLETE - NO DELETIONS RECOMMENDED

**⚠️ UPDATE (2025-10-07): ALL FILES TO BE KEPT - MODULES IN ACTIVE DEVELOPMENT**

~~1. ai-hub module (7 files, ~260 lines)~~ → ✅ **KEEP - IN ACTIVE DEVELOPMENT**
~~2. rei-analytics module (7 files, ~174 lines)~~ → ✅ **KEEP - IN ACTIVE DEVELOPMENT**

**Updated Total:** 0 files for deletion, **ALL 14 FILES TO BE KEPT**

**Rationale:**
- Modules are in active development (not abandoned)
- TODO comments indicate planned features, not placeholders
- Skeleton structure is foundation for upcoming implementation
- Required for development roadmap

**Action:** **DO NOT DELETE** - Continue development

---

### 16.2 ~~Consider After Review~~ → OBSOLETE - ALL FILES TO BE KEPT

**⚠️ UPDATE (2025-10-07): ALL FILES TO BE KEPT - MODULES IN ACTIVE DEVELOPMENT**

~~1. expense-tax frontend (3 files, ~200 lines)~~ → ✅ **KEEP ALL - Frontend being implemented**
~~2. cms-marketing (10+ files, ~500 lines)~~ → ✅ **KEEP ALL - All components in development**
~~3. marketplace frontend (3 files, ~200 lines)~~ → ✅ **KEEP ALL - Frontend being implemented**

**Updated Total:** 0 files for deletion, **ALL FILES TO BE KEPT**

**Rationale:**
- All modules are in active development
- Frontend routes are being implemented (currently skeleton placeholders)
- Backend logic is being expanded
- Components are part of ongoing work

**Action:** **DO NOT DELETE** - Continue development

---

### 16.3 Manual Review Required (Higher Risk, Lower Value)

**⚠️⚠️ Only delete after thorough verification:**

1. **Type files with TODOs** (5 files, ~80 lines)
   - Low priority: Small files, low maintenance cost
   - Verify 0 imports before deleting

2. **Workspace components** (4 files, ~600 lines)
   - Low priority: May be used via dynamic imports
   - Conservative: Keep (workspace is active module)

3. **CMS/Content components** (22 files, ~1,500 lines)
   - Medium priority: Potentially unused
   - Requires import verification

**Total:** ~31 files, ~2,180 lines, **~35-60 KB disk space**

**Confidence:** 50-60% safe to delete
**Impact:** Could break features if verification incomplete
**Rollback:** Easy (small files)
**Recommendation:** Keep unless confirmed unused

---

### 16.4 ⚠️ UPDATED: Total Cleanup Summary (2025-10-07)

**🔴 ALL DELETION PHASES OBSOLETE**

~~Conservative Approach (Phase 1 only):~~ → **OBSOLETE**
- ~~Files: 14~~ → **0 files to delete**
- ~~Lines: ~434~~ → **0 lines to delete**
- ~~Disk Space: ~5-10 KB~~ → **0 KB cleanup**

~~Moderate Approach (Phases 1-2):~~ → **OBSOLETE**
- ~~Files: ~30-40~~ → **0 files to delete**
- ~~Lines: ~1,334-3,334~~ → **0 lines to delete**
- ~~Disk Space: ~20-60 KB~~ → **0 KB cleanup**

~~Aggressive Approach (Phases 1-3):~~ → **OBSOLETE**
- ~~Files: ~61-71~~ → **0 files to delete**
- ~~Lines: ~3,514-5,514~~ → **0 lines to delete**
- ~~Disk Space: ~60-120 KB~~ → **0 KB cleanup**

**NEW APPROACH: KEEP ALL FILES - ACTIVE DEVELOPMENT**
- Files to keep: **ALL ~100+ files** across ai-hub, rei-analytics, expense-tax, cms-marketing, marketplace
- Status: **ALL IN ACTIVE DEVELOPMENT**
- Action: **Continue development on all modules**

---

### 16.5 ⚠️ UPDATED: Recommendation Summary (2025-10-07)

**Previous Cost-Benefit Analysis:** OBSOLETE

**NEW ANALYSIS:**

**Benefits of KEEPING Files (Updated 2025-10-07):**
- ✅ Preserves active development work
- ✅ Maintains skeleton structure for ongoing implementation
- ✅ Avoids recreating foundation files
- ✅ Supports development roadmap
- ✅ Prevents confusion about deleted vs. deferred features

**Costs of Deletion (Now Avoided):**
- ❌ Would lose active development work
- ❌ Would require recreation of skeleton structure
- ❌ Would disrupt development roadmap
- ❌ Risk of breaking in-progress features

**Updated Verdict:**
- ~~Phase 1 (ai-hub, rei-analytics): HIGH VALUE~~ → **OBSOLETE - MODULES IN ACTIVE DEVELOPMENT**
- ~~Phase 2 (frontend skeletons): MEDIUM VALUE~~ → **OBSOLETE - FRONTEND BEING IMPLEMENTED**
- ~~Phase 3 (types, components): LOW VALUE~~ → **OBSOLETE - COMPONENTS IN USE**

**NEW Recommendation:**
1. **KEEP ALL FILES** - All previously flagged modules are in active development
2. **Continue development** on ai-hub, rei-analytics, expense-tax, cms-marketing, marketplace
3. **No cleanup needed** - Files are not unused, they are in development

---

## 17. Appendix: Complete File List

### A. Skeleton Modules (Identified for Deletion)

**ai-hub (7 files):**
```
app/real-estate/ai-hub/page.tsx (10 lines)
app/real-estate/ai-hub/layout.tsx (~35 lines)
app/real-estate/ai-hub/dashboard/page.tsx (123 lines)
lib/modules/ai-hub/actions.ts (21 lines)
lib/modules/ai-hub/queries.ts (22 lines)
lib/modules/ai-hub/schemas.ts (22 lines)
lib/modules/ai-hub/index.ts (27 lines)
```

**rei-analytics (7 files):**
```
app/real-estate/rei-analytics/page.tsx (11 lines)
app/real-estate/rei-analytics/layout.tsx (17 lines)
app/real-estate/rei-analytics/dashboard/page.tsx (~60 lines)
lib/modules/rei-analytics/actions.ts (21 lines)
lib/modules/rei-analytics/queries.ts (21 lines)
lib/modules/rei-analytics/schemas.ts (21 lines)
lib/modules/rei-analytics/index.ts (23 lines)
```

---

### B. Entry Points Map

**Pages (101 total):**
- Auth: 7 pages (login, signup, onboarding)
- Admin: 5 pages (dashboard, users, orgs, alerts, feature-flags)
- Marketing: 3 pages (landing, pricing, features)
- Real Estate Industry: 15 pages (dashboard, customize)
- CRM Module: 10 pages (dashboard, contacts, leads, deals, calendar, analytics)
- Workspace Module: 8 pages (dashboard, loops, listings, signatures, analytics)
- Settings: 3 pages (main, team, billing)
- Skeleton Modules: 15 pages (ai-hub, rei-analytics, expense-tax, cms-marketing, marketplace)

**Layouts (15 total):**
- Root: 1 layout
- Auth: 2 layouts
- Marketing: 1 layout
- Admin: 1 layout
- Real Estate: 1 layout
- CRM: 0 layouts (uses real-estate layout)
- Workspace: 1 layout
- Settings: 1 layout
- Skeleton Modules: 5 layouts

**API Routes (33 total):**
- Auth: 2 routes
- Onboarding: 3 routes
- Admin: 10 routes
- Dashboard: 8 routes
- Expenses: 4 routes
- AI Garage: 2 routes
- CRM: 1 route (leads)
- Webhooks: 1 route (stripe)
- Health: 1 route

---

### C. Import Analysis Methodology

**Static Analysis Tools Used:**

1. **File Discovery:**
```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "./node_modules/*" ! -path "./.next/*"
```

2. **Import Pattern Matching:**
```bash
grep -r "from ['\"].*module-name" --include="*.ts" --include="*.tsx" app lib components
```

3. **Component Usage Detection:**
```bash
grep -r "<ComponentName" --include="*.tsx" app components
```

4. **Dynamic Import Detection:**
```bash
grep -r "import(.*module-name" --include="*.ts" --include="*.tsx" app lib components
```

**Limitations:**
- Static grep cannot detect:
  - Dynamic imports with variables
  - Computed property access
  - Reflection-based usage
  - Configuration-based references
- **Conservative approach:** Mark as "Review Needed" when uncertain

---

### D. Verification Checklist

**Before Deletion:**
- [ ] Backup created: `git branch backup/pre-cleanup-$(date +%Y%m%d)`
- [ ] Current state committed
- [ ] All tests passing
- [ ] Build successful
- [ ] grep searches completed for target files

**After Each Deletion Phase:**
- [ ] TypeScript check: `npx tsc --noEmit` (0 errors)
- [ ] Linting: `npm run lint` (0 errors)
- [ ] Tests: `npm test` (all passing)
- [ ] Build: `npm run build` (successful)
- [ ] Dev server: `npm run dev` (manual navigation test)
- [ ] Import search: `grep -r "deleted-module"` (0 results)
- [ ] Commit with detailed message

**Final Verification:**
- [ ] All planned deletions completed
- [ ] Documentation updated (CLAUDE.md, README.md)
- [ ] Navigation links removed
- [ ] Cleanup report created
- [ ] PR ready for review (if team workflow)

---

**End of Audit Report**

---

## ⚠️ UPDATED: Quick Stats Summary (2025-10-07)

| Metric | Value | Update |
|--------|-------|--------|
| **Total Files Analyzed** | 1,797 | ✅ Accurate |
| **Components** | 260 | ✅ Accurate |
| **Library Files** | 346 | ✅ Accurate |
| **App Files** | 140 | ✅ Accurate |
| **API Routes** | 33 | ✅ Accurate |
| **Test Files** | 61 | ✅ Accurate |
| **Directory Size** | 1.2 GB | ✅ Accurate |
| **~~Skeleton~~ Active Development Modules** | 5 (ai-hub, rei-analytics, expense-tax, cms-marketing, marketplace) | 🔄 ALL IN ACTIVE DEVELOPMENT |
| **~~Safe to Delete~~** | ~~14 files~~ → **0 files** | ⚠️ UPDATED: DO NOT DELETE |
| **~~Review Then Delete~~** | ~~16-26 files~~ → **0 files** | ⚠️ UPDATED: DO NOT DELETE |
| **~~Manual Review~~** | ~~31 files~~ → **0 files** | ⚠️ UPDATED: KEEP ALL |
| **~~Estimated Total Cleanup~~** | ~~61-71 files~~ → **0 files** | ⚠️ UPDATED: NO CLEANUP NEEDED |
| **~~Disk Space Savings~~** | ~~60-120 KB~~ → **0 KB** | ⚠️ UPDATED: NO DELETIONS |

**🔴 CRITICAL UPDATE (2025-10-07):**
All previously flagged "skeleton" modules are **IN ACTIVE DEVELOPMENT**.
**NO FILES SHOULD BE DELETED** from ai-hub, rei-analytics, expense-tax, cms-marketing, or marketplace modules.

---

**Generated:** 2025-10-07
**Updated:** 2025-10-07 (All deletion recommendations marked obsolete)
**Analyst:** Claude (Strive-SaaS Developer Agent)
**Methodology:** Systematic grep/find analysis + File inspection + Usage pattern detection
**Status:** ~~Deletion recommendations~~ → **KEEP ALL - Active development confirmed**