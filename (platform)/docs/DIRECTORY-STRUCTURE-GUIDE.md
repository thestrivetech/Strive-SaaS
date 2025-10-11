# Strive Platform Directory Structure Documentation

**Version:** 1.0
**Generated:** 2025-10-11
**Total Files:** 1,212
**Total Directories:** 503
**Total Size:** 15.4 MB

---

## Overview

This document provides comprehensive documentation of the (platform) directory structure, explaining the purpose and responsibility of each major directory and key files. The platform follows a 3-level hierarchical architecture: **Industry > Module > Page**.

---

## Root Level Configuration

### Core Configuration Files

- **`.env.example`** (4.4 KB) - Environment variable template with placeholder values for configuration
- **`CLAUDE.md`** (20.7 KB) - Claude AI session memory and platform development standards
- **`README.md`** (25.7 KB) - Comprehensive project documentation and setup guide
- **`package.json`** (5.9 KB) - NPM dependencies, scripts, and project metadata
- **`tsconfig.json`** (789 B) - TypeScript compiler configuration with strict mode enabled
- **`next.config.mjs`** (3.9 KB) - Next.js 15 configuration (Turbopack, image optimization, security headers)
- **`middleware.ts`** (2.6 KB) - Next.js middleware for authentication, RBAC, and route protection
- **`eslint.config.mjs`** (3 KB) - ESLint configuration with 500-line file limit enforcement
- **`jest.config.ts`** (2.2 KB) - Jest testing configuration with coverage thresholds
- **`jest.setup.ts`** (5.2 KB) - Global test setup, mocks, and environment configuration
- **`tailwind.config.ts`** (545 B) - Tailwind CSS configuration with custom theme
- **`postcss.config.mjs`** (86 B) - PostCSS configuration for Tailwind
- **`components.json`** (474 B) - shadcn/ui component configuration
- **`vercel.json`** (1.2 KB) - Vercel deployment configuration
- **`instrumentation.ts`** (1.7 KB) - Next.js instrumentation for monitoring and observability

---

## Core Directories

### `app/` - Frontend Application (238 files)

The app directory contains all Next.js 15 routes using the App Router pattern. Organized by route groups and follows the Industry > Module > Page hierarchy.

#### `app/(auth)/` - Authentication Routes (6 files)
Authentication and onboarding flows outside the main platform layout.

- **`login/`** - User login page with Supabase Auth integration
  - `page.tsx` (17.2 KB) - Login form with email/password and OAuth providers
  - `layout.tsx` (1 KB) - Auth-specific layout (no sidebar/nav)

- **`signup/`** - User registration
  - `page.tsx` (313 B) - Signup page redirects to Supabase signup

- **`onboarding/`** - Multi-step onboarding wizard
  - `page.tsx` (5 KB) - Onboarding wizard orchestration
  - `organization/page.tsx` (3.7 KB) - Organization creation step
  - `layout.tsx` (455 B) - Onboarding-specific layout

#### `app/(marketing)/` - Public Marketing Pages (3 files)
Marketing and sales pages accessible to unauthenticated users.

- **`page.tsx`** (1.3 KB) - Landing page with hero section and features
- **`pricing/page.tsx`** (1.6 KB) - Pricing tiers showcase (6-tier per-seat model)
- **`layout.tsx`** (396 B) - Marketing layout with simplified navigation

#### `app/(admin)/` - System Administration (19 files)
SUPER_ADMIN only routes for platform-wide administration (3 users: Grant, Garrett, Jeff).

- **`admin/`** - Admin dashboard and tools
  - `page.tsx` (8.1 KB) - Admin overview dashboard
  - `alerts/page.tsx` (5.1 KB) - System alerts management
  - `audit/` - Audit log viewer for compliance
  - `feature-flags/page.tsx` (6.3 KB) - Feature flag management
  - `organizations/` - Organization management (view all orgs)
  - `users/` - User management (cross-organization)
  - `settings/` - Platform-wide settings (6 components)
  - `subscriptions/` - Subscription tier management

#### `app/real-estate/` - Real Estate Industry (124 files)
Complete real estate SaaS implementation with 8 modules.

**Industry Layout:**
- `layout.tsx` (2.1 KB) - Real estate industry wrapper with navigation

**Modules:**

1. **`crm/` - Customer Relationship Management (27 files)**
   - `crm-dashboard/page.tsx` (9.5 KB) - CRM overview with KPIs
   - `contacts/` - Contact management (list, detail pages)
   - `leads/` - Lead tracking and scoring
   - `deals/` - Deal pipeline and management
   - `calendar/` - Appointment scheduling
   - `analytics/` - CRM analytics and reports

2. **`workspace/` - Transaction Management (19 files)**
   - `workspace-dashboard/page.tsx` (8.8 KB) - Transaction loops overview
   - `[loopId]/page.tsx` (2.9 KB) - Individual transaction loop detail
   - `listings/` - Property listing management
   - `analytics/` - Transaction analytics
   - `sign/[signatureId]/` - Document signing interface

3. **`ai-hub/` - AI Automation Hub (17 files)**
   - `ai-hub-dashboard/page.tsx` (8 KB) - AI hub overview
   - `agents/` - AI agent management
   - `workflows/` - Workflow builder and automation
   - `teams/` - Agent team collaboration
   - `integrations/` - External integrations
   - `marketplace/` - AI template marketplace
   - `analytics/` - Usage analytics

4. **`cms-marketing/` - Content & Marketing (20 files)**
   - `cms-dashboard/page.tsx` (14.5 KB) - Content management overview
   - `content/` - Content editor and library
   - `content/campaigns/` - Marketing campaigns
   - `content/editor/` - Rich text editor
   - `analytics/` - Content performance metrics

5. **`expense-tax/` - Expense & Tax Management (10 files)**
   - `expense-tax-dashboard/page.tsx` (5.7 KB) - Expense overview
   - `reports/` - Tax reports and generation
   - `analytics/` - Expense analytics
   - `settings/` - Tax configuration

6. **`marketplace/` - Tool Marketplace (12 files)**
   - `dashboard/page.tsx` (14.2 KB) - Marketplace browse
   - `tools/[toolId]/` - Tool detail pages
   - `bundles/[bundleId]/` - Bundle offerings
   - `cart/` - Shopping cart
   - `purchases/` - Purchase history and management

7. **`reid/` - REI Intelligence (13 files)**
   - `reid-dashboard/page.tsx` (4.3 KB) - Real estate intelligence overview
   - `heatmap/` - Market heat maps
   - `trends/` - Market trends analysis
   - `demographics/` - Demographic data
   - `schools/` - School district data
   - `alerts/` - Market alerts
   - `ai-profiles/` - AI property profiling
   - `reports/` - Intelligence reports
   - `roi/` - ROI calculators

8. **`user-dashboard/` - Personalized Dashboard (5 files)**
   - `page.tsx` (14.5 KB) - User's customized dashboard
   - `customize/page.tsx` (9.4 KB) - Dashboard customization interface

#### `app/settings/` - Shared Settings (8 files)
Cross-industry user and organization settings.

- `page.tsx` (168 B) - Settings index
- `profile/` - User profile management
- `organization/` - Organization settings
- `team/` - Team member management
- `billing/` - Billing and subscription
- `security/` - Security settings
- `notifications/` - Notification preferences
- `layout.tsx` (1.9 KB) - Settings layout with sidebar navigation

#### `app/strive/` - SUPER_ADMIN Internal Tools (15 files)
Internal platform management and future project directories.

- `platform-admin/page.tsx` (7.2 KB) - Platform administration dashboard
- `projects-future/` - Future project components (9 files)
- `CRM/README.md` - Internal CRM documentation
- `dashboard/README.md` - Internal dashboard docs
- `sid/README.md` - SID (Strive Intelligence Dashboard) placeholder

#### `app/api/` - API Routes (58 files)
REST API endpoints for external integrations and webhooks.

**API Structure:**

- **`auth/`** - Authentication endpoints
  - `login/route.ts` (2.8 KB) - Login endpoint
  - `signup/route.ts` (2.3 KB) - Registration endpoint

- **`onboarding/`** - Onboarding API
  - `organization/route.ts` (2.7 KB) - Organization creation

- **`health/route.ts`** (4 KB) - Health check endpoint for monitoring

- **`v1/`** - Versioned API (53 files)
  - `admin/` - Admin API endpoints (10 routes)
  - `ai-garage/` - AI garage API (2 routes)
  - `ai-hub/` - AI hub API (19 routes)
  - `dashboard/` - Dashboard API (9 routes)
  - `expenses/` - Expense management API (6 routes)
  - `leads/route.ts` - Lead management API
  - `onboarding/` - Onboarding API (2 routes)
  - `reid/` - REI Intelligence API (4 routes)

- **`webhooks/`** - Webhook handlers
  - `stripe/route.ts` (6.6 KB) - Stripe payment webhooks

#### `app/` - Root Files

- **`layout.tsx`** (1.2 KB) - Root layout with providers and metadata
- **`page.tsx`** (330 B) - Root redirect logic
- **`globals.css`** (19.2 KB) - Global styles and Tailwind utilities
- **`favicon.ico`** (15 KB) - Platform favicon
- **`unregister-sw.tsx`** (1.2 KB) - Service worker unregistration

---

### `components/` - UI Components (333 files)

Reusable React components organized by feature and industry.

#### `components/ui/` - shadcn/ui Primitives (66 files)
Base UI components built on Radix UI.

- **Core Components:** `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`
- **Form Components:** `form.tsx`, `select.tsx`, `checkbox.tsx`, `textarea.tsx`, `calendar.tsx`
- **Data Display:** `table.tsx`, `badge.tsx`, `avatar.tsx`, `skeleton.tsx`, `tooltip.tsx`
- **Navigation:** `tabs.tsx`, `breadcrumb.tsx`, `pagination.tsx`, `command.tsx`
- **Feedback:** `toast.tsx`, `alert.tsx`, `alert-dialog.tsx`, `progress.tsx`
- **Specialized:** `chart.tsx`, `file-upload.tsx`, `multi-select.tsx`, `date-range-picker.tsx`
- **Custom:** `floating-chat.tsx` (20.9 KB), `calendly-fallback.tsx` (10.8 KB)

**Sidebar System** (6 files in `ui/sidebar/`):
- Comprehensive sidebar component system with menu, groups, and responsive behavior

#### `components/shared/` - Shared Platform Components (38 files)

**Dashboard System** (26 files in `shared/dashboard/`):
- `Sidebar.tsx` (16.5 KB) - Main navigation sidebar
- `TopBar.tsx` (13.3 KB) - Top navigation bar with search and notifications
- `CommandBar.tsx` (17.9 KB) - Command palette (Cmd+K)
- `DashboardGrid.tsx` (10 KB) - Customizable dashboard grid system
- `HeroSection.tsx` (7.3 KB) - Dashboard hero section
- `QuickAddDialog.tsx` (10.6 KB) - Quick action dialog
- `MiniCalendar.tsx` (8.3 KB) - Inline calendar widget
- `MobileBottomNav.tsx` (2.8 KB) - Mobile navigation
- `ParticleBackground.tsx` (4.3 KB) - Animated background

**Widgets** (6 files in `shared/dashboard/widgets/`):
- `ActivityFeedWidget.tsx` (7.9 KB) - Real-time activity feed
- `AIInsightsWidget.tsx` (5.7 KB) - AI-powered insights
- `KPIRingsWidget.tsx` (3.7 KB) - KPI visualization rings
- `LiveChartsWidget.tsx` (10.6 KB) - Real-time charts
- `SmartSuggestionsWidget.tsx` (6.2 KB) - AI suggestions
- `WorldMapWidget.tsx` (5.3 KB) - Geographic visualization

**Skeletons** (4 files in `shared/dashboard/skeletons/`):
- Loading states for dashboard components

**Layouts** (3 files in `shared/layouts/`):
- `footer.tsx`, `marketing-nav.tsx`, `platform-layout.tsx`

**Navigation** (7 files in `shared/navigation/`):
- `breadcrumbs.tsx`, `header.tsx`, `sidebar-nav.tsx`, `user-menu.tsx`
- `notification-dropdown.tsx` (9.7 KB), `theme-toggle.tsx`

**Utilities:**
- `error-boundary.tsx` (3.5 KB) - Error boundary component
- `providers.tsx` (757 B) - React Query and context providers

#### `components/real-estate/` - Real Estate Components (172 files)

Industry-specific components organized by module.

**AI Components** (3 files in `real-estate/ai/`):
- `ai-chat.tsx` (6.6 KB) - AI chat interface
- `message-bubble.tsx`, `typing-indicator.tsx`

**AI Hub** (20 files in `real-estate/ai-hub/`):
- **Agents:** `AgentCard.tsx`, `AgentLab.tsx`, `AgentWizard.tsx` (15.5 KB)
- **Dashboard:** `ActivityFeed.tsx`, `AgentStatus.tsx`, `ExecutionMetrics.tsx`
- **Teams:** `TeamCard.tsx`, `TeamsList.tsx`
- **Workflows:** `WorkflowBuilder.tsx` (9.2 KB), `WorkflowCard.tsx`, `CustomNode.tsx`

**CMS Marketing** (6 files in `real-estate/cms-marketing/analytics/`):
- `analytics-dashboard.tsx`, `campaign-metrics.tsx`, `content-performance.tsx`

**Content Management** (20 files in `real-estate/content/`):
- **Campaigns:** `campaign-list.tsx`, `email-campaign-builder.tsx` (11.1 KB)
- **Editor:** `rich-text-editor.tsx`, `editor-toolbar.tsx`, `seo-panel.tsx`
- **Media:** `media-library.tsx`, `media-picker-dialog.tsx`, `media-upload-zone.tsx`

**CRM** (43 files in `real-estate/crm/`):
- **Contacts:** `contact-card.tsx`, `contact-form-dialog.tsx` (11.6 KB), `contact-table.tsx`
- **Leads:** `lead-card.tsx`, `lead-form-dialog.tsx` (10.4 KB), `lead-score-badge.tsx`
- **Deals:** `deal-card.tsx`, `pipeline-board.tsx`, `deal-form-dialog.tsx` (8.9 KB)
- **Calendar:** `appointment-form-dialog.tsx` (13.4 KB), `calendar-view.tsx`
- **Analytics:** `kpi-card.tsx`, `revenue-chart.tsx`, `sales-funnel-chart.tsx`
- **Listings:** `listing-card.tsx` (5.9 KB), `listing-filters.tsx` (7.2 KB)

**Expense & Tax** (21 files in `real-estate/expense-tax/`):
- **Dashboard:** `DashboardSkeleton.tsx`
- **Forms:** `AddExpenseModal.tsx` (10.1 KB), `ReceiptUpload.tsx`
- **Analytics:** `CategoryTrends.tsx`, `SpendingTrends.tsx`
- **Settings:** `CategoryManager.tsx`, `TaxConfiguration.tsx` (10.7 KB)
- **Reports:** `ReportGenerator.tsx` (8.9 KB), `ReportCard.tsx`

**Marketplace** (19 files in `real-estate/marketplace/`):
- **Bundles:** `BundleCard.tsx`, `BundleGrid.tsx`
- **Cart:** `ShoppingCartPanel.tsx` (6.6 KB), `CartItem.tsx`, `CheckoutModal.tsx`
- **Reviews:** `ReviewForm.tsx`, `StarRating.tsx`, `RatingDistribution.tsx`
- **Purchases:** `PurchasedToolCard.tsx`, `PurchaseHistory.tsx`

**REI Intelligence** (25 files in `real-estate/reid/`):
- **AI Profiles:** `AIProfilesClient.tsx`, `ProfileCard.tsx`
- **Alerts:** `AlertsPanel.tsx`, `CreateAlertDialog.tsx` (7.7 KB)
- **Maps:** `MarketHeatmap.tsx`, `LeafletMap.tsx`
- **Schools:** `SchoolsClient.tsx` (10.6 KB), `SchoolComparisonDialog.tsx`
- **Shared:** `MetricCard.tsx`, `AlertBadge.tsx`, `REIDCard.tsx`

**Workspace (Transaction Management)** (15 files in `real-estate/workspace/`):
- `create-loop-dialog.tsx` (6.6 KB) - Create transaction loop
- `document-upload.tsx` (4.3 KB), `document-list.tsx`
- `party-invite-dialog.tsx` (8.7 KB), `party-list.tsx` (8.1 KB)
- `task-create-dialog.tsx` (9.1 KB), `task-checklist.tsx`
- `signature-requests.tsx`, `sign-document-form.tsx`
- `activity-feed.tsx`, `loop-overview.tsx`

#### `components/features/` - Feature Components (39 files)

**Admin** (7 files in `features/admin/`):
- `admin-sidebar.tsx`, `data-table.tsx`, `stat-card.tsx`
- `feature-flag-form.tsx`, `system-alert-form.tsx`

**Dashboard** (18 files in `features/dashboard/`):
- **Activity:** `activity-feed.tsx`, `activity-item.tsx` (5.7 KB)
- **Metrics:** `kpi-card.tsx`, `kpi-cards.tsx`
- **Quick Actions:** `quick-actions-grid.tsx` (5.1 KB)
- **Widgets:** `chart-widget.tsx`, `progress-widget.tsx`

**Landing** (3 files in `features/landing/`):
- `hero-section.tsx`, `features-section.tsx`, `cta-section.tsx`

**Onboarding** (6 files in `features/onboarding/`):
- `onboarding-layout.tsx`, `onboarding-progress.tsx`
- `org-details-form.tsx`, `plan-selection-form.tsx`, `payment-form.tsx`

**Pricing** (5 files in `features/pricing/`):
- `pricing-card.tsx`, `pricing-tiers.tsx`, `pricing-faq.tsx`
- `pricing-data.ts` (1.9 KB) - Tier definitions

#### `components/layouts/` - Layout Components (6 files)

- `admin-layout.tsx` (1.1 KB) - Admin area layout
- `employee-layout.tsx` (1.1 KB) - Employee workspace layout
- `client-layout.tsx` (959 B) - Client portal layout
- `base-platform-layout.tsx` (631 B) - Base platform wrapper
- `dashboard-shell.tsx` (600 B) - Dashboard container

#### `components/settings/` - Settings Components (10 files)

- `profile-settings-form.tsx` (8.7 KB) - User profile editor
- `organization-form.tsx` (3.4 KB) - Organization settings
- `billing-settings-form.tsx` (7.4 KB) - Billing management
- `security-settings-form.tsx` (10.7 KB) - Security configuration
- `notification-settings-form.tsx` (5 KB) - Notification preferences
- `invite-member-dialog.tsx` (5.1 KB) - Team invitation
- `team-member-actions.tsx` (5.8 KB) - Member management
- `settings-sidebar.tsx` (2.1 KB) - Settings navigation

#### `components/subscription/` - Subscription Components (2 files)

- `tier-gate.tsx` (2 KB) - Subscription tier gating
- `upgrade-prompt.tsx` (9.1 KB) - Upgrade prompts and modals

---

### `lib/` - Backend Logic & Utilities (415 files)

Server-side business logic, utilities, and infrastructure.

#### `lib/modules/` - Business Logic Modules (242 files)

Self-contained business logic modules with actions, queries, and schemas.

**Module Structure Pattern:**
```
module-name/
├── actions.ts      # Server Actions (mutations)
├── queries.ts      # Data fetching
├── schemas.ts      # Zod validation schemas
├── index.ts        # Public API exports
└── [submodules]/   # Feature subdirectories
```

**Core Modules:**

1. **`activities/`** (2 files) - Activity tracking and logging
   - `queries.ts` (3.1 KB) - Activity feed queries

2. **`admin/`** (7 files) - Platform administration
   - `actions.ts` (7.8 KB), `queries.ts` (4.4 KB)
   - `audit.ts` (4.3 KB) - Audit logging
   - `metrics.ts` (6.5 KB) - Platform metrics
   - `settings.ts` (4.3 KB) - System settings
   - `subscriptions.ts` (3.7 KB) - Subscription management

3. **`ai/`** (3 files) - AI assistant integration
   - `actions.ts` (6.3 KB), `queries.ts` (1.8 KB)

4. **`ai-garage/`** (10 files) - AI template marketplace
   - **Blueprints:** `actions.ts` (12.1 KB), `queries.ts` (9.2 KB)
   - **Orders:** `actions.ts` (8.9 KB), `queries.ts` (7.2 KB)
   - **Templates:** `actions.ts` (14 KB), `queries.ts` (11.2 KB), `utils.ts` (8.3 KB)

5. **`ai-hub/`** (39 files) - AI automation hub
   - **Agents:** `actions.ts` (7.7 KB), `execution.ts` (7.1 KB), `providers.ts` (6.3 KB)
   - **Integrations:** `actions.ts` (7.3 KB), providers (4 files: gmail, http, slack, webhook)
   - **Teams:** `actions.ts` (11.3 KB), `patterns.ts` (10.6 KB), `execution.ts` (6.4 KB)
   - **Workflows:** `actions.ts` (6.3 KB), `execution.ts` (9.5 KB)
   - **Templates:** `actions.ts` (7.5 KB), `utils.ts` (6.1 KB)

6. **`analytics/`** (6 files) - Business analytics
   - `kpis.ts` (5 KB), `forecasting.ts` (5.2 KB)
   - `performance-metrics.ts` (6.8 KB), `pipeline-metrics.ts` (4.4 KB)
   - `revenue-metrics.ts` (5.4 KB)

7. **`appointments/`** (5 files) - Calendar and scheduling
   - `actions.ts` (10.4 KB), `queries.ts` (9.1 KB), `schemas.ts` (4.3 KB)
   - `calendar.ts` (4.9 KB) - Calendar utilities

8. **`attachments/`** (2 files) - File attachments
   - `actions.ts` (8 KB) - Upload, delete, validation

9. **`compliance/`** (3 files) - Compliance monitoring
   - `checker.ts` (9.5 KB) - Compliance rules engine
   - `alerts.ts` (4.8 KB) - Compliance alerts

10. **`content/`** (18 files) - Content management system
    - **Content:** `actions.ts` (8.2 KB), `queries.ts` (6.6 KB), `helpers.ts` (4.4 KB)
    - **Campaigns:** `actions.ts` (8.8 KB), `queries.ts` (6.1 KB)
    - **Media:** `actions.ts` (9.9 KB), `queries.ts` (10.1 KB), `upload.ts` (6.6 KB)
    - **Analytics:** `campaign-analytics.ts` (7.2 KB), `content-analytics.ts` (6.4 KB)

11. **`crm/`** (19 files) - Customer relationship management
    - **Contacts:** `actions.ts` (16.4 KB), `queries.ts` (11.6 KB), `schemas.ts` (4.7 KB)
    - **Leads:** `actions.ts` (14.8 KB), `queries.ts` (9.6 KB), `schemas.ts` (3.8 KB)
    - **Deals:** `actions.ts` (14.5 KB), `queries.ts` (9.3 KB), `pipeline.ts` (6.5 KB)
    - **Core:** `actions.ts` (10.4 KB), `queries.ts` (7.8 KB)

12. **`dashboard/`** (12 files) - Dashboard customization
    - **Activities:** `actions.ts` (1.4 KB), `queries.ts` (3.1 KB)
    - **Metrics:** `actions.ts` (3 KB), `calculator.ts` (4.8 KB), `queries.ts` (1.3 KB)
    - **Quick Actions:** `actions.ts` (3.7 KB), `queries.ts` (1.5 KB)
    - **Widgets:** `actions.ts` (2.5 KB), `queries.ts` (1.2 KB)

13. **`expenses/`** (16 files) - Expense management
    - **Expenses:** `actions.ts` (7.8 KB), `queries.ts` (8.6 KB), `schemas.ts` (2.9 KB)
    - **Receipts:** `actions.ts` (5.2 KB) - OCR and processing
    - **Reports:** `actions.ts` (3.8 KB), `schemas.ts` (2.7 KB)
    - **Tax Estimates:** `actions.ts` (4 KB), `calculations.ts` (3.4 KB)

14. **`marketplace/`** (10 files) - Tool marketplace
    - `actions.ts` (7.2 KB), `queries.ts` (10.4 KB)
    - **Cart:** `actions.ts` (8.3 KB), `queries.ts` (2 KB), `types.ts` (617 B)
    - **Reviews:** `actions.ts` (6.9 KB), `queries.ts` (6.8 KB)

15. **`notifications/`** (2 files) - Notification system
    - `actions.ts` (5.3 KB), `queries.ts` (3.3 KB)

16. **`onboarding/`** (8 files) - User onboarding
    - `actions.ts` (4.9 KB), `queries.ts` (3.5 KB)
    - `completion.ts` (4.7 KB), `payment.ts` (3.5 KB), `session.ts` (3.5 KB)

17. **`organization/`** (4 files) - Organization management
    - `actions.ts` (5.3 KB), `queries.ts` (1.5 KB), `schemas.ts` (3 KB)
    - `context.ts` (2.1 KB) - Organization context

18. **`projects/`** (3 files) - Project management
    - `actions.ts` (4.6 KB), `queries.ts` (6.4 KB), `schemas.ts` (2.1 KB)

19. **`reid/`** (22 files) - Real Estate Intelligence Dashboard
    - **AI:** `actions.ts` (8.3 KB), `insights-analyzer.ts` (10.6 KB), `profile-generator.ts` (7.4 KB)
    - **Alerts:** `actions.ts` (5 KB), `queries.ts` (2.4 KB), `schemas.ts` (1.7 KB)
    - **Insights:** `actions.ts` (5.8 KB), `queries.ts` (3.3 KB)
    - **Reports:** `actions.ts` (6.1 KB), `generator.ts` (8.5 KB)
    - **Preferences:** `actions.ts` (1.7 KB), `queries.ts` (683 B)

20. **`settings/`** (9 files) - User settings
    - **Billing:** `actions.ts` (5.9 KB), `queries.ts` (2.9 KB)
    - **Organization:** `actions.ts` (6.3 KB), `queries.ts` (1.9 KB)
    - **Profile:** `actions.ts` (4.3 KB), `queries.ts` (1.3 KB)
    - **Security:** `actions.ts` (5.1 KB), `queries.ts` (3.4 KB)

21. **`tasks/`** (4 files) - Task management
    - `actions.ts` (9.4 KB), `bulk-actions.ts` (8.1 KB), `queries.ts` (7.7 KB)

22. **`workspace/`** (37 files) - Transaction management (formerly transactions)
    - **Core:** `actions.ts` (6.9 KB), `queries.ts` (5.3 KB), `permissions.ts` (5.2 KB)
    - **Documents:** `actions.ts` (11.1 KB), `queries.ts` (7.7 KB)
    - **Listings:** `actions.ts` (11.8 KB), `queries.ts` (13.9 KB)
    - **Milestones:** `calculator.ts` (7 KB), `schemas.ts` (1.6 KB), `utils.ts` (3.8 KB)
    - **Parties:** `actions.ts` (5 KB), `queries.ts` (4.9 KB)
    - **Signatures:** `actions.ts` (11.5 KB), `queries.ts` (10.1 KB)
    - **Tasks:** `actions.ts` (8.8 KB), `queries.ts` (5.8 KB)
    - **Workflows:** `actions.ts` (10 KB), `queries.ts` (3.2 KB), `schemas.ts` (2.5 KB)
    - **Activity:** `formatters.ts` (9.5 KB), `queries.ts` (9.3 KB), `types.ts` (614 B)
    - **Analytics:** `charts.ts` (6.5 KB), `queries.ts` (7.6 KB)

#### `lib/auth/` - Authentication & Authorization (11 files)

- **`auth-helpers.ts`** (7.9 KB) - Core auth utilities (getCurrentUser, requireAuth)
- **`middleware.ts`** (263 B) - Auth middleware wrapper
- **`rbac.ts`** (25.6 KB) - Role-Based Access Control (permissions, guards)
- **`org-rbac.ts`** (8.3 KB) - Organization-level RBAC
- **`subscription.ts`** (7.3 KB) - Subscription tier enforcement
- **`guards.tsx`** (6.8 KB) - React auth guards
- **`actions.ts`** (383 B) - Auth server actions
- **`user-helpers.ts`** (3.4 KB) - User utility functions
- **`constants.ts`** (2.2 KB) - Auth constants and permissions
- **`types.ts`** (3.2 KB) - Auth type definitions
- **`utils.ts`** (314 B) - Auth utilities

#### `lib/database/` - Database Infrastructure (6 files)

- **`prisma.ts`** (4.3 KB) - Prisma client singleton
- **`prisma-middleware.ts`** (8.8 KB) - Tenant isolation middleware
- **`prisma-extension.ts`** (6.6 KB) - Prisma client extensions
- **`monitoring.ts`** (10.7 KB) - Query performance monitoring
- **`errors.ts`** (10.6 KB) - Database error handling
- **`utils.ts`** (10.5 KB) - Database utilities (pagination, filtering)

#### `lib/supabase/` - Supabase Integration (2 files)

- **`client.ts`** (1.3 KB) - Client-side Supabase client
- **`server.ts`** (3.1 KB) - Server-side Supabase client

#### `lib/storage/` - File Storage (3 files)

- **`supabase-storage.ts`** (12.4 KB) - Supabase storage operations
- **`validation.ts`** (7.2 KB) - File validation (type, size)
- **`encryption/index.ts`** (3.9 KB) - Document encryption (AES-256-GCM)

#### `lib/middleware/` - Request Middleware (3 files)

- **`auth.ts`** (8.1 KB) - Authentication middleware
- **`rate-limit.ts`** (3.4 KB) - Rate limiting
- **`cors.ts`** (1.1 KB) - CORS configuration

#### `lib/security/` - Security Utilities (5 files)

- **`audit.ts`** (10.9 KB) - Security audit logging
- **`content-audit.ts`** (7.4 KB) - Content security auditing
- **`csrf.ts`** (5.3 KB) - CSRF protection
- **`input-validation.ts`** (8.5 KB) - Input sanitization and validation

#### `lib/industries/` - Multi-Industry System (19 files)

Industry configuration and routing system.

- **`_core/`** (4 files) - Core industry abstractions
  - `base-industry.ts` (3.7 KB), `industry-config.ts` (2.8 KB)
  - `industry-router.ts` (4.2 KB)

- **`real-estate/`** (6 files) - Real estate industry
  - `config.ts` (5.9 KB), `types.ts` (6.8 KB)
  - `features/`, `overrides/`, `tools/`

- **`healthcare/`** (6 files) - Healthcare industry (future)
  - `config.ts` (5 KB), `types.ts` (4.3 KB)
  - `features/`, `overrides/`, `tools/`

- **`registry.ts`** (3.1 KB) - Industry registry

#### `lib/tools/` - Tool System (14 files)

Marketplace tool infrastructure.

- **`types.ts`** (8.8 KB) - Tool type definitions
- **`constants.ts`** (11.5 KB) - Tool categories and metadata
- **`manager.ts`** (9.1 KB) - Tool lifecycle management
- **`registry/`** (3 files) - Tool registry and loading
- **`shared/crm-basic/`** (6 files) - Example CRM tool

#### `lib/types/` - Type Definitions (20 files)

TypeScript type definitions organized by domain.

- **`real-estate/`** (9 files) - Real estate types
- **`shared/`** (5 files) - Shared types (api, csv, supabase, validation)
- **`web/`** (2 files) - Web analytics types
- **Root:** `prisma-compat.ts`, `chatbot.ts`, `roi-calculator.ts`

#### `lib/email/` - Email Notifications (1 file)

- **`notifications.ts`** (15.7 KB) - Email templates and sending

#### `lib/ai/` - AI Services (2 files)

- **`config.ts`** (3.8 KB) - AI model configuration (OpenRouter, Groq)
- **`service.ts`** (3.5 KB) - AI API integration

#### `lib/analytics/` - Analytics (2 files)

- **`analytics-tracker.ts`** (11.6 KB) - Event tracking
- **`web-vitals.ts`** (5.2 KB) - Core Web Vitals monitoring

#### `lib/performance/` - Performance Optimization (4 files)

- **`cache.ts`** (7 KB) - Redis caching layer
- **`dashboard-cache.ts`** (4.6 KB) - Dashboard-specific caching
- **`dynamic-imports.tsx`** (5.8 KB) - Code splitting utilities

#### `lib/realtime/` - Real-time Features (2 files)

- **`client.ts`** (3.6 KB) - Supabase Realtime client
- **`use-realtime.ts`** (3.6 KB) - Real-time React hook

#### `lib/pdf/` - PDF Generation (2 files)

- **`pdf-generator-legacy.ts`** (5.3 KB) - Legacy PDF generator
- **`professional-brochure.tsx`** (16.4 KB) - React PDF brochure template

#### `lib/services/` - External Services (1 file)

- **`rag-service.ts`** (12.5 KB) - RAG (Retrieval-Augmented Generation) service

#### `lib/test/` - Testing Utilities (3 files)

- **`setup.ts`** (6.1 KB) - Test environment setup
- **`utils.ts`** (5.6 KB) - Test helper functions
- **`index.ts`** (3.7 KB) - Test exports

#### `lib/config/` - Configuration (2 files)

- **`public.ts`** (1.1 KB) - Public configuration (client-safe)
- **`server.ts`** (829 B) - Server-only configuration

#### `lib/api/` - API Utilities (1 file)

- **`error-handler.ts`** (3 KB) - Centralized API error handling

#### `lib/export/` - Data Export (1 file)

- **`csv.ts`** (2.8 KB) - CSV export utilities

#### `lib/hooks/` - React Hooks (2 files)

- **`useChatbotViewport.ts`** (2.2 KB) - Chatbot viewport management
- **`useShoppingCart.ts`** (1.9 KB) - Shopping cart state

#### `lib/utils/` - Utilities (2 files)

- **`animation-utils.ts`** (4.6 KB) - Animation helpers
- **`parent-communication.ts`** (9.7 KB) - iframe communication

#### `lib/` - Root Files

- **`env.ts`** (7.2 KB) - Environment variable validation
- **`utils.ts`** (3.2 KB) - General utilities
- **`validation.ts`** (3.1 KB) - Validation helpers
- **`queryClient.ts`** (1.4 KB) - React Query client
- **`rate-limit.ts`** (2.7 KB) - Rate limiting utilities
- **`seo-config.ts`** (11.9 KB) - SEO configuration
- **`pdf-generator.ts`** (14.5 KB) - PDF generation
- **`pdf-generator-helpers.ts`** (7 KB) - PDF utilities
- **`browser-detection.ts`** (8 KB) - Browser detection
- **`chatbot-iframe-communication.ts`** (7.6 KB) - Chatbot iframe helpers
- **`chatbot-performance-monitor.ts`** (2.3 KB) - Chatbot monitoring
- **`analytics-tracker.ts`** (2.1 KB) - Analytics tracking
- **`supabase.ts`** (720 B), **`supabase-server.ts`** (1.7 KB) - Legacy Supabase

#### `lib/schemas-archive-2025-10-09/` - Archived Schemas (51 files)

Deprecated Zod schemas from before module consolidation (historical reference only).

---

### `hooks/` - React Custom Hooks (12 files)

Global React hooks for state management and side effects.

- **`use-advanced-chat.ts`** (4.1 KB) - Advanced chat functionality
- **`use-command-bar.ts`** (3.6 KB) - Command bar state
- **`use-debounce.ts`** (401 B) - Debounce hook
- **`use-mobile.tsx`** (584 B) - Mobile detection
- **`use-scroll-manager.ts`** (6.2 KB) - Scroll position management
- **`use-seo.ts`** (2.7 KB) - Dynamic SEO updates
- **`use-theme.ts`** (2.6 KB) - Theme management
- **`use-toast.ts`** (4 KB) - Toast notifications
- **`useCalendlyIntegration.ts`** (9.4 KB) - Calendly integration
- **`useDebounce.ts`** (1.4 KB) - Debounce (duplicate)
- **`usePageTracking.ts`** (1.3 KB) - Page view tracking
- **`usePrefetch.ts`** (2.5 KB) - Route prefetching

---

### `__tests__/` - Test Suite (105 files)

Comprehensive test coverage with unit, integration, and E2E tests.

#### Test Organization:

**`__tests__/api/`** (6 files) - API endpoint tests
- `admin/` - Admin API tests (3 files)
- `v1/reid/` - REID API tests (2 files)
- `webhooks/stripe.test.ts` - Stripe webhook tests

**`__tests__/components/`** (19 files) - Component tests
- `admin/` - Admin UI tests (3 files)
- `landing/` - Marketing page tests (4 files)
- `onboarding/wizard.test.tsx` - Onboarding wizard
- `pricing/` - Pricing component tests (3 files)
- `real-estate/expense-tax/` - Expense components (2 files)
- `real-estate/reid/` - REID components (2 files)
- `shared/navigation/` - Navigation tests
- `ui/button.test.tsx` - UI primitive tests

**`__tests__/database/`** (2 files) - Database tests
- `tenant-isolation.test.ts` (7.3 KB) - Multi-tenancy tests
- `test-rls.ts` (10.2 KB) - RLS policy tests

**`__tests__/e2e/`** (3 files) - End-to-end tests (Playwright)
- `marketplace/` - Marketplace flows (2 files)
- `reid-dashboard.spec.ts` - REID dashboard

**`__tests__/fixtures/`** (3 files) - Test fixtures
- `organizations.ts`, `projects.ts`, `users.ts`

**`__tests__/integration/`** (7 files) - Integration tests
- `auth/test-auth.js` - Auth flows
- `expense-tax/expense-workflow.test.ts` - Expense workflows
- `auth-flow.test.ts`, `crm-workflow.test.ts`, `lead-to-deal-workflow.test.ts`
- `notifications/`, `realtime/`

**`__tests__/lib/`** (18 files) - Library tests
- `auth/` - RBAC and middleware tests (4 files)
- `industries/` - Industry registry tests (3 files)
- `modules/content/` - Content module tests (5 files)
- `modules/reid/` - REID module tests (3 files)
- `performance/cache.test.ts` - Cache tests
- `security/` - Security tests (2 files)

**`__tests__/modules/`** (32 files) - Module tests
- `appointments/schemas.test.ts`
- `contacts/` - Contact module tests (3 files)
- `dashboard/` - Dashboard tests (2 files)
- `documents/` - Document tests (2 files)
- `leads/` - Lead tests (3 files)
- `marketplace/` - Marketplace tests (8 files)
- `milestones/calculator.test.ts`
- `onboarding/` - Onboarding tests (3 files)
- `signatures/` - Signature tests (2 files)
- `transactions/` - Transaction tests (3 files)
- `workflows/` - Workflow tests (3 files)

**`__tests__/security/`** (2 files) - Security tests
- `reid-rbac.test.ts`, `test-content-security-audit.ts`

**`__tests__/storage/`** (3 files) - Storage tests
- `encryption.test.ts`, `test-storage.ts`, `validation.test.ts`

**`__tests__/unit/lib/modules/`** (2 files) - Unit tests
- `crm/actions.test.ts`, `notifications/actions.test.ts`

**`__tests__/utils/`** (2 files) - Test utilities
- `mock-factories.ts` (6.8 KB), `test-helpers.ts` (4.8 KB)

**Test Scripts:**
- `setup-test-db.sh`, `setup-fresh-test-db.sh`, `reset-test-db.sh`
- `README.md` (10.6 KB) - Test documentation

---

### `prisma/` - Database Schema (3 files + migrations)

**Database:** Supabase PostgreSQL
**ORM:** Prisma
**Models:** 42 models
**Enums:** 69 enums
**Total Schema Size:** 113.5 KB

- **`schema.prisma`** (113.5 KB) - Complete database schema
  - Core models: User, Organization, OrganizationMember
  - CRM: Contact, Lead, Deal, Appointment
  - Workspace: TransactionLoop, Listing, Document, Signature, Task
  - Content: ContentItem, Campaign, MediaAsset
  - Marketplace: Tool, Bundle, Purchase, Review
  - Dashboard: Metric, Widget, Activity
  - AI Hub: Agent, Workflow, Integration, Team
  - REI Intelligence: Insight, Alert, Report
  - Expenses: Expense, Receipt, TaxEstimate

- **`seed.ts`** (4.6 KB) - Database seeding script

- **`migrations/`** - Migration history (empty - introspected from production)

- **`README.md`** (8.5 KB) - Schema documentation

**Schema Documentation (auto-generated):**
- Located in root: `SCHEMA-QUICK-REF.md`, `SCHEMA-MODELS.md`, `SCHEMA-ENUMS.md`

---

### `public/` - Static Assets (64 files)

Public assets served directly by Next.js.

#### `public/assets/` (57 files)

**`email/`** (2 files) - Email templates
- `email-header.png` (54.4 KB), `email-footer.png` (75.1 KB)

**`email-templates/`** (14 files) - Marketing email assets
- Newsletter template and components
- Social media icons (5 files)

**`favicons/`** (7 files) - Browser icons
- Multiple sizes for different platforms
- `favicon.ico` (15 KB), `site.webmanifest`

**`headshots/`** (3 files) - Team photos
- Garrett, Grant, Jeff headshots (WebP format)

**`logos/`** (3 files) - Brand logos
- `strive_logo.webp` (7.9 KB)
- Transparent variants

**`optimized/`** (28 files) - Optimized images
- Multiple sizes (320w, 640w, 1024w)
- Multiple formats (AVIF, WebP)
- Blur placeholders

#### `public/` - Root Files

- **`robots.txt`** (1.1 KB) - Search engine directives
- **`sitemap.xml`** (5.2 KB) - Site structure for SEO
- **SVG Icons:** `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`

---

### `scripts/` - Utility Scripts (22 files)

Automation and deployment scripts.

**Database:**
- `init-database.js` (3.8 KB) - Database initialization
- `verify-database-config.ts` (5.8 KB) - Config validation

**Deployment:**
- `deploy-production.sh` (6.6 KB) - Production deployment
- `migrate-production.sh` (5 KB) - Production migrations
- `pre-deploy-check.sh` (6 KB) - Pre-deployment validation
- `rollback.sh` (5.2 KB) - Rollback procedure

**Testing:**
- `run-tests.sh` (4.7 KB) - Test runner
- `test-ci.sh` (4.8 KB) - CI test script

**Maintenance:**
- `fix-broken-imports.cjs` (4.2 KB) - Import path fixes
- `fix-all-broken-imports.cjs` (4.7 KB) - Bulk import fixes
- `fix-index-exports.cjs` (2.4 KB) - Export fixes
- `generate-directory-map.cjs` (9.2 KB) - This documentation generator
- `image-optimization.ts` (10.1 KB) - Image optimization
- `security-audit.ts` (10.1 KB) - Security scanning
- `validate-seo.ts` (7.6 KB) - SEO validation

**Data:**
- `generate-embeddings.ts` (2.7 KB) - Vector embeddings for RAG
- `migrate-roles-tiers.ts` (7.8 KB) - Role/tier migration
- `expenses/seed-categories.ts` (6 KB) - Expense category seeding

**Documentation:**
- `README.md` (9.4 KB) - Scripts documentation
- `migration-config.example.json` (1.7 KB) - Migration config template
- `project-directory-map.json` (4.6 KB) - Old directory map
- `project-directory-map.txt` (1.4 KB) - Old text map

---

### `docs/` - Documentation Directory

Project documentation organized by category.

**Existing Subdirectories:**
- `architecture/` - Architecture documentation
- `deployment/` - Deployment guides
- `development/` - Development workflows and session logs
- `guides/` - How-to guides
- `modules/` - Module-specific documentation
- `reports/` - Analysis reports

**Documentation Files:**
- `README.md` (13.3 KB) - Documentation index

---

## Key Architectural Patterns

### 1. Module Structure Pattern

All business logic modules follow this structure:

```
module-name/
├── actions.ts      # Server Actions (mutations)
├── queries.ts      # Data fetching
├── schemas.ts      # Zod validation
├── index.ts        # Public API
└── [feature]/      # Sub-features
    ├── actions.ts
    ├── queries.ts
    └── schemas.ts
```

**Example: CRM Module**
```
lib/modules/crm/
├── contacts/
│   ├── actions.ts    # createContact, updateContact, deleteContact
│   ├── queries.ts    # getContacts, getContactById
│   ├── schemas.ts    # ContactSchema, UpdateContactSchema
│   └── index.ts      # Export public API
├── leads/
├── deals/
├── core/
└── index.ts          # Export all CRM functions
```

### 2. Frontend/Backend Alignment

Frontend routes mirror backend module structure:

```
Frontend: app/real-estate/crm/contacts/page.tsx
           ↓ calls
Backend:  lib/modules/crm/contacts/actions.ts
           ↓ queries
Database: Prisma ORM → Supabase PostgreSQL
```

### 3. Component Hierarchy

```
components/
├── ui/                    # Primitive components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── shared/                # Shared across industries
│   ├── dashboard/
│   ├── navigation/
│   └── layouts/
├── real-estate/           # Industry-specific
│   ├── crm/
│   ├── workspace/
│   └── ...
└── features/              # Feature-specific
    ├── admin/
    ├── pricing/
    └── onboarding/
```

### 4. Authentication Flow

```
User → Supabase Auth (login/signup)
  ↓
Protected Route → middleware.ts
  ↓
requireAuth() → lib/auth/auth-helpers.ts
  ↓
Lazy Sync → Creates/updates user in Prisma
  ↓
RBAC Check → lib/auth/rbac.ts
  ↓
Subscription Check → lib/auth/subscription.ts
  ↓
Render Page
```

### 5. Multi-Tenancy Pattern

Every database query includes organization isolation:

```typescript
// Set tenant context
await setTenantContext({
  organizationId: user.organizationId,
  userId: user.id
});

// Queries auto-filter by organization
const customers = await prisma.customer.findMany();
```

### 6. Testing Hierarchy

```
__tests__/
├── unit/              # Pure function tests
├── integration/       # Module integration tests
├── e2e/              # Full user flow tests (Playwright)
├── components/       # React component tests
├── api/              # API endpoint tests
└── database/         # RLS and tenant isolation tests
```

---

## File Size Analysis

### Largest Files (Top 10)

1. `lib/auth/rbac.ts` - 25.6 KB (RBAC permissions system)
2. `app/(marketing)/page.tsx` - 1.3 KB (Landing page - actually small)
3. `components/ui/floating-chat.tsx` - 20.9 KB (Chat widget)
4. `components/shared/dashboard/CommandBar.tsx` - 17.9 KB (Command palette)
5. `components/shared/dashboard/Sidebar.tsx` - 16.5 KB (Main navigation)
6. `lib/pdf/professional-brochure.tsx` - 16.4 KB (PDF template)
7. `lib/modules/crm/contacts/actions.ts` - 16.4 KB (Contact CRUD)
8. `lib/email/notifications.ts` - 15.7 KB (Email templates)
9. `lib/modules/crm/leads/actions.ts` - 14.8 KB (Lead CRUD)
10. `lib/pdf-generator.ts` - 14.5 KB (PDF generation)

### Files Approaching Limit (450-500 lines)

None found. Maximum file size enforced at 500 lines by ESLint.

---

## Module Consolidation Summary

**Previous:** 26 modules (pre-2025-10-05)
**Current:** 13 consolidated modules

**Consolidation Pattern:**
- `transactions/` → `workspace/` (naming alignment with frontend)
- Grouped related features under parent modules
- Maintained clear boundaries between modules
- No cross-module imports (enforced by ESLint)

---

## Critical Dependencies

### Frontend
- **Next.js:** 15.0.4 (App Router, Server Components, Server Actions)
- **React:** 19.1.0 (Latest with useOptimistic, useFormStatus)
- **TypeScript:** 5.6+ (Strict mode)
- **Tailwind CSS:** 3.4.19
- **shadcn/ui:** Latest (Radix UI primitives)

### Backend
- **Prisma:** 6.2.0 (ORM)
- **Supabase:** Latest (Auth, Storage, Realtime)
- **Zod:** Latest (Validation)

### Testing
- **Jest:** 29.7.0
- **React Testing Library:** 16.1.0
- **Playwright:** Latest (E2E)

### AI/ML
- **OpenRouter:** API integration
- **Groq:** API integration
- **pgvector:** Vector search (via Supabase)

---

## Deployment Structure

**Platform:** Vercel
**Database:** Supabase (PostgreSQL)
**Storage:** Supabase Storage
**Auth:** Supabase Auth
**CDN:** Vercel Edge Network

**Environment Variables:** 25+ required (see `.env.example`)

---

## Security Layers

1. **Authentication:** Supabase Auth with JWT
2. **Authorization:** Dual-role RBAC (global + organization roles)
3. **Multi-Tenancy:** RLS policies + application-level filtering
4. **Subscription Tiers:** Feature gating (6 tiers)
5. **Input Validation:** Zod schemas on all inputs
6. **Rate Limiting:** API rate limits
7. **Document Encryption:** AES-256-GCM for sensitive documents
8. **Audit Logging:** All admin actions logged

---

## Performance Optimizations

1. **Server Components:** 80%+ server-rendered
2. **Code Splitting:** Dynamic imports for heavy components
3. **Image Optimization:** Next.js Image with AVIF/WebP
4. **Caching:** Redis for dashboard data
5. **Database:** Prisma query optimization + connection pooling
6. **Bundle Size:** <500kb initial JS
7. **Real-time:** Supabase Realtime for live updates

---

## Structural Inconsistencies Found

### 1. Duplicate Files
- `hooks/use-debounce.ts` (401 B) and `hooks/useDebounce.ts` (1.4 KB)
- `lib/supabase.ts` (720 B) and `lib/supabase-server.ts` (1.7 KB) vs. `lib/supabase/client.ts` and `lib/supabase/server.ts`

### 2. Archive Directories
- `lib/schemas-archive-2025-10-09/` (51 files) - Should be removed or moved to `.ignore/`

### 3. Root-Level Metadata Files
- `project-directory-map.json` (912 KB) - Very large, should be in `docs/` or `.gitignore`
- `project-directory-map.txt` (146.5 KB) - Duplicate of generated files
- `tsconfig.tsbuildinfo` (6.1 MB) - Should be in `.gitignore`

### 4. Missing Index Exports
Some component directories lack `index.ts` files for cleaner imports

### 5. Test File Locations
Some test files in `__tests__/helpers/` and `__tests__/utils/` could be consolidated

---

## Summary Report

### Statistics
- **Total Directories:** 503
- **Total Files:** 1,212
- **Total Size:** 15.4 MB
- **TypeScript Files:** ~850
- **React Components:** ~450
- **Test Files:** 105

### Architecture Patterns Identified
1. ✅ 3-Level Industry Hierarchy (Industry > Module > Page)
2. ✅ Module Self-Containment (actions, queries, schemas, index)
3. ✅ Frontend/Backend Alignment (app/ mirrors lib/modules/)
4. ✅ Component Hierarchy (ui > shared > industry > features)
5. ✅ Security Layers (Auth > RBAC > Multi-Tenancy > Tiers)
6. ✅ Test Coverage (Unit > Integration > E2E)

### Code Quality Metrics
- **ESLint:** 500-line file limit enforced
- **TypeScript:** Strict mode enabled
- **Test Coverage:** Target 80%+ (per CLAUDE.md)
- **No explicit `any`:** Warnings enabled (291 instances to fix)

### Production Readiness
- ✅ Authentication system complete
- ✅ Multi-tenancy implemented
- ✅ RBAC system functional
- ✅ Real Estate industry fully built
- ⚠️ Mock data mode disabled (2025-10-10)
- ⚠️ 28 TypeScript errors in tests (non-blocking)
- ⚠️ 291 `any` type warnings to resolve

---

## Recommendations

### Immediate Actions
1. **Remove duplicate files** (use-debounce, supabase clients)
2. **Add to .gitignore:** `tsconfig.tsbuildinfo`, large JSON maps
3. **Clean up archives:** Move `lib/schemas-archive-2025-10-09/` to `.ignore/`
4. **Fix test TypeScript errors** (28 errors in test files)

### Short-term Improvements
1. **Add index.ts exports** to component directories
2. **Consolidate test utilities** (merge helpers and utils)
3. **Document module APIs** (add JSDoc to public exports)
4. **Create module README files** in `lib/modules/`

### Long-term Enhancements
1. **Resolve `any` type warnings** (291 instances)
2. **Increase test coverage** to 80%+ across all modules
3. **Add Storybook** for component documentation
4. **Implement module dependency graph** visualization

---

**Document Generated:** 2025-10-11
**Generator Script:** `scripts/generate-directory-map.cjs`
**Source Data:** `project-directory-map.txt` (1,728 lines)

---

*This documentation is auto-generated and should be regenerated when significant structural changes occur.*
