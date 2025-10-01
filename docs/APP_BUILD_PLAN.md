# SaaS Application Build Plan

**Project:** Strive Tech SaaS Platform (app.strivetech.ai)
**Framework:** Next.js 15 + App Router
**Status:** 🚧 In Progress

---

## Architecture Overview

### Deployment Structure
- **Marketing Site:** `strivetech.ai` (existing React site in `app/web/` - legacy, not actively developed)
- **SaaS Platform:** `app.strivetech.ai` (new Next.js 15 app in `app/`)
  - Contains: Admin dashboard, client portal, employee workspace, CRM, projects, AI tools

### Authentication
- Shared auth via cookies (domain: `.strivetech.ai`)
- Login/signup on marketing site → redirects to app
- App validates JWT from marketing site

### Databases
- **Existing DB:** Marketing site (contact forms, analytics) - UNCHANGED
- **New DB:** SaaS platform (organizations, projects, CRM, AI tools)
- User sync on signup between both databases

### Multiple Dashboard Types Within the APP
The `app/` directory contains multiple dashboard experiences within the application:
- **Admin Dashboard:** Full system access, user management, analytics
- **Employee Dashboard:** Project management, CRM, time tracking
- **Client Portal:** Project visibility, communication, invoices
- All share the same database and infrastructure but have role-based views

### Design System
- Reuse shadcn/ui components from `app/web/client/src/components/ui/`
- Maintain consistent UI/UX with marketing site
- Add new app-specific components as needed (dashboards, CRM, project views)

---

## Phase 1: Foundation (Week 1-2) - **100% Complete** ✅

### ✅ Completed Tasks
- [x] Initialize Next.js 15 app with App Router
- [x] Setup TypeScript configuration
- [x] Create comprehensive Prisma schema (13 models)
- [x] Copy 56 UI components from app/web/client/src/components/ui
- [x] Setup basic project dependencies (Prisma, Supabase, shadcn utilities)
- [x] Create environment template (.env.local.example)
- [x] Setup Tailwind CSS configuration with brand colors
- [x] Reorganize components into proper folder structure (ui/, features/, layouts/)
- [x] Create new Supabase database (Strive-App-Creation organization)
- [x] Configure environment variables with database credentials
- [x] Setup Supabase client files (lib/supabase.ts & lib/supabase-server.ts)
- [x] Run Prisma migrations and create all database tables
- [x] Verify database connection and app functionality
- [x] Implement auth verification middleware with Supabase SSR
- [x] Build base dashboard layout (sidebar, topbar, navigation)
- [x] Create auth verification API route (/api/auth/login)
- [x] Design app routing structure for different roles (platform, auth groups)
- [x] Install additional UI components (dropdown-menu, progress)

### Session 1 documented in: C:\Users\zochr\Desktop\GitHub\Strive_Website\chat-logs\session1.md


---

## Phase 2: Core Application Interface (Week 3-4) - **100% Complete** ✅

### ✅ Completed Tasks
- [x] Build main dashboard home page with widgets
- [x] Build settings page (account, preferences, security)
- [x] Create activity feed component (in dashboard)
- [x] Fix middleware authentication (@supabase/ssr module resolution)
- [x] Connect frontend to actual data (dashboard using real database queries)
- [x] Create organization management module (server actions, schemas, queries)
- [x] Implement sign out functionality in user menu
- [x] Implement user profile management backend (auth helpers, getCurrentUser)
- [x] Create organization creation UI dialog with slug validation
- [x] Implement team invitation dialog with role selection
- [x] Build organization switcher component for topbar
- [x] Create team management page at /settings/team with member list
- [x] Add member role management UI (view roles, identify owner/admin)
- [x] Connect team invitation to backend actions (invite, update roles, remove members)

### Session 2 documented in: C:\Users\zochr\Desktop\GitHub\Strive_Website\chat-logs\Session2.md
### Session 3 documented in: C:\Users\zochr\Desktop\GitHub\Strive_Website\chat-logs\Session3.md
### Session 4 documented in: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\chat-logs\Session4.md

### 📋 Deferred to Later Phases
- [ ] Team invitation acceptance flow (email integration required - Phase 4)
- [ ] Implement notification system (UI exists, needs backend - Phase 3)
- [ ] Implement real-time updates for activity feed (WebSocket/SSE - Phase 3)

---

## Phase 3: SaaS Features (Week 5-8) - **92% Complete** 🚧

### ✅ Type Safety & Infrastructure (Session 15) - Complete
- [x] Created type definition files (filters, csv, organization, analytics)
- [x] Fixed all platform `any` types (38 instances eliminated)
- [x] Installed rate limiting packages (@upstash/ratelimit, @upstash/redis)
- [x] Created rate limiting module (auth, API, strict limiters)
- [x] Fixed unescaped HTML entities (3 instances)
- [x] Auto-fixed unused imports/variables (50+ instances)
- [x] Fixed gtag/analytics type issues
- [x] Improved CSV export type safety
- [x] Enhanced filter interfaces with flexible types
- [ ] Component extraction (deferred to Session 16)
- [ ] Rate limiting integration (deferred to Session 16)

**Session 15 documented in:** `chat-logs/Session15_Summary.md`

### ✅ CRM System - Complete
- [x] Create CRM module structure (schemas, queries, actions)
- [x] Customer list view with real database integration
- [x] Customer creation dialog with form validation
- [x] Customer edit functionality
- [x] Customer delete functionality
- [x] Customer statistics dashboard (total, active, leads, prospects)
- [x] Multi-tenancy enforcement on all CRM operations
- [x] Activity logging for customer operations
- [x] Search and filter functionality (status, tags, assignee)
- [x] Pagination for customer lists
- [x] Export to CSV
- [ ] Customer detail pages with full information (deferred)
- [ ] Lead tracking and pipeline visualization (deferred)
- [ ] Contact history and notes (deferred)
- [ ] Customer segmentation and tags (basic complete, advanced deferred)
- [ ] Sales pipeline Kanban board (deferred)

### ✅ Project & Task Management - Complete
- [x] Project list and creation flow
- [x] Project edit and delete functionality
- [x] Task list with real-time updates
- [x] Task creation, edit, delete
- [x] Task status management
- [x] Bulk task operations (update status, delete)
- [x] Advanced filtering (6 filters for projects, 5 for tasks)
- [x] Export to CSV (projects and tasks)
- [x] Real-time collaboration (multi-user updates)
- [x] Activity logging
- [ ] Kanban board for tasks (deferred)
- [ ] Time tracking integration (deferred)
- [ ] Project templates (deferred)
- [ ] Progress tracking charts (deferred)

### ✅ AI Integration (Sai Assistant) - Complete
- [x] Chat interface in the app
- [x] OpenRouter integration (multi-model support)
- [x] Groq integration (fast open-source models)
- [x] Model selection UI (tier-based, 10 models)
- [x] Context-aware AI assistance
- [x] AI conversation history
- [x] Usage tracking and limits (per tier)
- [x] Transparency: Show which model is being used
- [ ] Tool activation from chat (deferred)

### ✅ Notifications System - Complete
- [x] Notification creation (server actions)
- [x] Notification list view with unread count
- [x] Mark as read functionality
- [x] Mark all as read
- [x] Delete notifications
- [x] Real-time updates (new notifications appear instantly)
- [x] Integrated in topbar across all layouts

### 🔧 File Attachments - 50% Complete (Session 12)
- [x] Attachment model in Prisma schema
- [x] FileUpload component with drag & drop
- [x] Attachments module (schemas, actions)
- [x] Upload to Supabase Storage
- [x] Download with signed URLs
- [x] Delete from storage and database
- [x] Multi-tenancy enforcement
- [ ] TaskAttachments component (Session 13)
- [ ] Integration in task pages (Session 13)
- [ ] Prisma migration applied (Session 13)
- [ ] Supabase bucket created (Session 13)

### 📋 Tool Marketplace
- [ ] Tool browsing and discovery UI
- [ ] Tool detail pages with pricing
- [ ] Tool activation/installation flow
- [ ] Active tools management
- [ ] Tool settings and configuration

### 📋 Analytics & Reporting
- [ ] Dashboard analytics widgets
- [ ] Custom report builder
- [ ] Export functionality (PDF, CSV)
- [ ] Real-time data visualization
- [ ] Usage metrics and insights

---

## Phase 4: Integration & Launch (Week 9-10)

### 🚧 Pre-Production (Session 16-17) - In Progress

#### Session 16 Tasks (Planned)
- [ ] Extract large components to meet ESLint requirements
  - LoginPage → login-form.tsx + signup-form.tsx
  - ProjectDetailPage → project-header.tsx + project-tasks-section.tsx
  - DashboardPage → dashboard-stats-grid.tsx
  - Target: All functions <50 lines
- [ ] Apply rate limiting to auth endpoints
  - Update lib/auth/auth-helpers.ts
  - Update middleware.ts
  - Test 10 req/10s limit
- [ ] Deploy to Vercel staging
  - Configure environment variables (including Upstash)
  - End-to-end testing
  - Lighthouse audit (target >90)

**Session 16 documented in:** `chat-logs/Session16.md`

#### Session 17 Tasks (Production Deployment)
- [ ] Fix staging issues from Session 16
- [ ] Production deployment to app.strivetech.ai
- [ ] Configure production DNS
- [ ] Marketing site integration (auth flow)
- [ ] Final security audit
- [ ] Load testing and performance optimization
- [ ] User acceptance testing

### 📋 Marketing Site Integration
- [ ] Update marketing site login to set shared cookie
- [ ] Update signup flow to create records in both DBs
- [ ] Add "Dashboard" link in user dropdown → app.strivetech.ai
- [ ] Test authentication flow end-to-end
- [ ] Verify cookie sharing across subdomains

### 📋 Deployment & Infrastructure
- [ ] Configure Vercel deployment for the app
- [ ] Setup app.strivetech.ai subdomain DNS
- [ ] Configure environment variables in production
- [ ] Setup error tracking (Sentry)
- [ ] Configure analytics and monitoring
- [ ] Load testing and performance optimization

### 📋 Testing & QA
- [ ] End-to-end authentication testing
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness verification
- [ ] Security audit (XSS, CSRF, auth)
- [ ] Performance testing (Core Web Vitals)
- [ ] User acceptance testing

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.6+
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** TanStack Query + Zustand (if needed)
- **Forms:** React Hook Form + Zod

### Backend
- **API:** Next.js API Routes + Server Actions
- **Database (HYBRID APPROACH - Both Required):**
  - **Supabase** - PostgreSQL provider + Auth + Storage + Realtime
  - **Prisma 6.16.2** - ORM that connects TO Supabase database
  - **Prisma for:** Complex queries, transactions, Server Actions
  - **Supabase for:** Auth, Realtime, file storage, presence
  - See: [`database/PRISMA-SUPABASE-STRATEGY.md`](database/PRISMA-SUPABASE-STRATEGY.md)
- **File Storage:** Supabase Storage

### Third-Party Services
- **Auth Provider:** Shared from marketing site (consider Clerk migration later)
- **Payments:** Stripe (Phase 3+)
- **Email:** SMTP (shared service)
- **AI Providers:**
  - **OpenRouter** - Primary gateway for 200+ models (proprietary & open-source)
  - **Groq** - High-speed inference for open-source models (Llama, Mixtral, Gemma)
  - Strategy: Mix of open-source (cost-effective) and proprietary (advanced) models
- **Monitoring:** Vercel Analytics + Sentry

---

## File Structure (SaaS Platform - app/)

```
app/                             # SaaS Platform root directory
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Auth-related routes
│   │   ├── login/              # Fallback login page
│   │   └── verify/             # Auth verification
│   ├── (admin)/                # Admin dashboard routes
│   │   ├── dashboard/          # Admin overview
│   │   ├── users/              # User management
│   │   ├── organizations/      # Org management
│   │   └── settings/           # System settings
│   ├── (employee)/             # Employee dashboard routes
│   │   ├── dashboard/          # Employee home
│   │   ├── projects/           # Project management
│   │   ├── crm/                # CRM system
│   │   ├── tasks/              # Task management
│   │   └── time-tracking/      # Time tracking
│   ├── (client)/               # Client portal routes
│   │   ├── dashboard/          # Client overview
│   │   ├── projects/           # View assigned projects
│   │   ├── invoices/           # Billing & invoices
│   │   └── support/            # Support tickets
│   ├── (shared)/               # Shared across all roles
│   │   ├── tools/              # Tool marketplace
│   │   ├── ai/                 # Sai assistant
│   │   ├── profile/            # User profile
│   │   └── notifications/      # Notifications
│   ├── api/                    # API routes
│   │   ├── auth/               # Auth verification
│   │   ├── users/              # User management
│   │   ├── organizations/      # Org management
│   │   ├── projects/           # Project CRUD
│   │   ├── crm/                # CRM operations
│   │   └── webhooks/           # Stripe, etc.
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # Copied from app/web/client/src/components/ui (56 components)
│   ├── admin/                  # Admin dashboard components
│   ├── employee/               # Employee dashboard components
│   ├── client/                 # Client portal components
│   ├── crm/                    # CRM-specific components
│   ├── projects/               # Project management components
│   ├── forms/                  # Form components
│   └── layouts/                # Layout components (shell, sidebar, nav)
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # Auth utilities
│   └── utils.ts               # General utilities
├── prisma/
│   └── schema.prisma          # Database schema
├── middleware.ts              # Auth middleware
├── next.config.js             # Next.js config
├── tailwind.config.ts         # Tailwind config
└── package.json               # Dependencies
```

---

## Database Schema (New Supabase DB)

### Core Tables
- `users` - Extended user profiles
- `organizations` - Multi-tenant workspaces
- `organization_members` - User-org relationships with roles
- `subscriptions` - Stripe subscription management
- `usage_tracking` - Usage metrics for billing

### CRM Tables
- `customers` - CRM customer records
- `leads` - Sales pipeline leads
- `contacts` - Contact information
- `notes` - Customer interaction notes

### Project Management Tables
- `projects` - Project records
- `tasks` - Task management
- `time_entries` - Time tracking
- `milestones` - Project milestones

### AI & Tools Tables
- `ai_conversations` - Chat history with Sai
- `ai_tools` - Available tools catalog
- `active_tools` - User-activated tools
- `tool_usage` - Tool usage tracking

### System Tables
- `activity_logs` - Audit trail
- `notifications` - User notifications
- `invitations` - Org invitations

---

## Environment Variables Needed

```env
# SaaS App (.env.local)
DATABASE_URL="postgresql://..."           # New Supabase DB
DIRECT_URL="postgresql://..."             # Direct connection

# Supabase (New App DB)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Auth (Shared with marketing site)
JWT_SECRET="..."                          # Same as marketing site
NEXT_PUBLIC_MARKETING_URL="https://strivetech.ai"

# API Keys
OPENROUTER_API_KEY="..."                  # Multi-model gateway (200+ models)
GROQ_API_KEY="..."                        # Fast open-source inference
STRIPE_SECRET_KEY="..."                   # For billing
STRIPE_WEBHOOK_SECRET="..."

# App Config
NEXT_PUBLIC_APP_URL="https://app.strivetech.ai"
NODE_ENV="development"
```

---

## Key Decisions & Notes

### Why Separate Next.js App in `app/` directory?
- Zero risk to production marketing site
- Independent deployment and scaling
- Clear separation of concerns (marketing vs. application)
- Easier to develop and test in isolation
- Semantic naming: `app/` = SaaS application, not just "a dashboard"
- Contains multiple dashboard types (admin, employee, client)
- Future-proof for monorepo structure (web/ and app/)

### Why Keep Marketing Site Separate?
- Already production-ready and stable
- Legacy React app (not actively developed)
- Focus on building new Next.js app features
- Clean separation between marketing and SaaS platform

### Why Dual Databases?
- Marketing DB has existing data (forms, analytics)
- SaaS DB needs complex schema (multi-tenant, CRM, etc.)
- Clean separation of concerns
- User records synced on authentication

### Why Subdomain Strategy?
- Clean URL structure (`app.` prefix = dashboard)
- Cookie sharing for seamless auth (`.strivetech.ai` domain)
- Independent DNS and deployment config
- Professional appearance for SaaS product

---

## Success Criteria

### Phase 1 Complete When:
- [x] Next.js app runs locally ✅
- [x] UI components copied and working ✅
- [x] Database connected and schema deployed ✅
- [x] Auth middleware validates tokens ✅
- [x] Basic dashboard layout renders ✅

### Phase 2 Complete When:
- [ ] Users can view their profile
- [ ] Organizations can be created/managed
- [ ] Team members can be invited with role assignment
- [ ] Settings page is functional
- [ ] Role-based navigation works (admin/employee/client see different menus)
- [ ] Basic admin, employee, and client dashboard layouts exist

### Phase 3 Complete When:
- [ ] CRM system allows customer management
- [ ] Projects and tasks can be created/tracked
- [ ] Sai assistant chat is functional
- [ ] Tools can be browsed and activated
- [ ] Analytics dashboard shows real data

### Phase 4 Complete When:
- [ ] Users can login on marketing site and access app
- [ ] Authentication works seamlessly across domains
- [ ] App is live at app.strivetech.ai
- [ ] Role-based dashboards route correctly (admin → /admin/dashboard, etc.)
- [ ] All core features are production-ready
- [ ] Performance and security are verified

---

## Next Immediate Steps

1. ✅ Initialize Next.js 15 app - **COMPLETE**
2. ✅ Configure TypeScript - **COMPLETE**
3. ✅ Setup Tailwind CSS with brand colors - **COMPLETE**
4. ✅ Reorganize components into ui/ folder structure - **COMPLETE**
5. ✅ Create new Supabase database project - **COMPLETE**
6. ✅ Configure .env.local with database credentials - **COMPLETE**
7. ✅ Run Prisma migrations to create tables - **COMPLETE**
8. 🚧 Implement auth middleware
9. 🚧 Build dashboard layout shell
10. 📋 Create role-based routing structure
11. 📋 Build basic dashboard pages

**Current Status:** Phase 3 - 92% Complete
**Last Completed:** Session 15 - Type safety improvements & rate limiting infrastructure
**Next Session:** Session 16 - Component refactoring & staging deployment

### Recent Progress (Session 15)
- ✅ Type safety: All platform `any` types eliminated
- ✅ Rate limiting: Infrastructure created (ready for integration)
- ✅ Code quality: ESLint errors reduced (497 → 474)
- ✅ Security: Type safety + rate limiting module
- ✅ Developer experience: Comprehensive type definitions

### Session 16 Priorities
1. **Component Extraction** (2-3 hours)
   - Refactor 5 large files to meet <50 line function limits
   - Extract login, project, and dashboard components
   - Improve code organization and reusability

2. **Rate Limiting Integration** (30-45 min)
   - Apply rate limiting to auth endpoints
   - Test brute force protection (10 req/10s)
   - Configure Upstash Redis environment variables

3. **Staging Deployment** (1-2 hours)
   - Deploy to Vercel staging environment
   - Configure all environment variables
   - End-to-end testing of all features
   - Lighthouse audit (target score >90)

### Phase 4 Timeline
- **Session 16:** Component refactor + Staging deploy (4-5 hours)
- **Session 17:** Production deploy + Final testing (3-4 hours)
- **Target:** Production launch by end of Session 17