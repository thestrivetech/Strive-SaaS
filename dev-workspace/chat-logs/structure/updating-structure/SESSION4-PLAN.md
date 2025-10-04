# Session 4: Dynamic Industry Routes - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3-4 hours
**Dependencies:** Session 1 ✅, Session 2 ✅, Session 3 (optional)
**Parallel Safe:** No (creates app structure)

---

## 🎯 Session Objectives

Create the dynamic routing infrastructure for industry-specific pages, enabling organizations to access industry-specific features through `/industries/[industryId]/` routes.

**What Exists:**
- ✅ `app/(platform)/dashboard/` - Main dashboard
- ✅ `app/(platform)/crm/` - Base CRM routes
- ✅ `app/(platform)/projects/` - Base projects routes
- ✅ `lib/industries/` - Industry backend infrastructure

**What's Missing:**
- ❌ `app/(platform)/industries/[industryId]/` - Dynamic industry routes
- ❌ Industry-specific layouts
- ❌ Industry dashboard pages
- ❌ Industry tools pages
- ❌ Navigation integration

---

## 📋 Task Breakdown

### Phase 1: Base Industry Routes Structure (45 minutes)

**Directory:** `app/(platform)/industries/[industryId]/`

#### File 1: `layout.tsx`
- [ ] Create industry-specific layout wrapper
- [ ] Validate industryId parameter
- [ ] Check organization has industry enabled
- [ ] Load industry configuration from registry
- [ ] Set industry context for child routes
- [ ] Add industry-specific navigation/breadcrumbs
- [ ] Handle industry not found errors
- [ ] Handle insufficient permissions

**Features:**
```typescript
// Validate industry access
const industry = await getIndustryConfig(industryId);
if (!industry) notFound();

const hasAccess = await hasIndustryEnabled(user.organizationId, industryId);
if (!hasAccess) redirect('/settings/industries');

// Provide context to children
return (
  <IndustryProvider industryId={industryId} config={industry}>
    <IndustryNav />
    {children}
  </IndustryProvider>
);
```

**Success Criteria:**
- Validates industry exists
- Enforces access control
- Provides industry context
- Server Component (async)

---

#### File 2: `page.tsx` (Industry Overview)
- [ ] Create industry overview/landing page
- [ ] Display industry name, description, icon
- [ ] Show enabled features list
- [ ] Show enabled tools list
- [ ] Quick stats/metrics cards
- [ ] Link to dashboard
- [ ] Link to settings
- [ ] Recent activity feed

**Success Criteria:**
- Fetches industry config
- Shows dynamic content based on industry
- Links to all industry sub-routes
- Server Component

---

### Phase 2: Industry Dashboard (30 minutes)

**Directory:** `app/(platform)/industries/[industryId]/dashboard/`

#### File 1: `page.tsx`
- [ ] Create industry-specific dashboard
- [ ] Load industry configuration
- [ ] Dynamically render industry widgets
- [ ] Show industry-specific metrics
- [ ] Show recent industry activity
- [ ] Show industry-specific quick actions
- [ ] Fallback to generic dashboard if no custom

**Example:**
```typescript
// Real Estate Dashboard
- Active listings count
- Buyer/Seller breakdown
- Recent property viewings
- Upcoming appointments
- Commission pipeline

// Healthcare Dashboard
- Patient appointments today
- HIPAA compliance status
- Active treatment plans
- Recent lab results
- Prescription refills
```

**Success Criteria:**
- Dynamic based on industry
- Fetches industry-specific data
- Reuses shared dashboard components where possible
- Server Component

---

### Phase 3: Industry Tools Routes (45 minutes)

**Directory:** `app/(platform)/industries/[industryId]/tools/`

#### File 1: `page.tsx` (Tools List)
- [ ] List all tools for this industry
- [ ] Filter by enabled/available status
- [ ] Show tool cards with icon, name, description
- [ ] Installation status for each tool
- [ ] Quick install/configure buttons
- [ ] Search and filter tools
- [ ] Category grouping

**Success Criteria:**
- Fetches tools from industry config
- Shows install status from OrganizationToolConfig
- Links to individual tool pages

---

#### File 2: `[toolId]/page.tsx` (Tool Detail)
- [ ] Create dynamic tool detail page
- [ ] Validate tool belongs to industry
- [ ] Show tool information (name, description, features)
- [ ] Installation instructions
- [ ] Configuration form (if installed)
- [ ] Enable/disable toggle
- [ ] Render tool UI (if Next.js implementation)
- [ ] External link (if external tool)

**Success Criteria:**
- Validates tool exists in industry
- Checks installation status
- Dynamic routing works
- Handles tool not found

---

#### File 3: `[toolId]/layout.tsx` (optional)
- [ ] Create tool-specific layout if needed
- [ ] Breadcrumbs: Industry → Tools → [Tool Name]
- [ ] Tool navigation sidebar

---

### Phase 4: Industry CRM Override (30 minutes)

**Directory:** `app/(platform)/industries/[industryId]/crm/`

#### File 1: `page.tsx`
- [ ] Create industry-specific CRM page
- [ ] Check if industry has CRM override
- [ ] Load industry CRM components if exists
- [ ] Otherwise, redirect to base `/crm`
- [ ] Use industry-specific schemas/actions

**Example:**
```typescript
// Real Estate CRM
import { RealEstateCRM } from '@/components/(platform)/real-estate/crm';

// Healthcare CRM
import { HealthcareCRM } from '@/components/(platform)/healthcare/crm';
```

**Success Criteria:**
- Conditional rendering based on industry
- Fallback to base CRM
- Uses industry overrides when available

---

### Phase 5: Industry Settings (30 minutes)

**Directory:** `app/(platform)/industries/[industryId]/settings/`

#### File 1: `page.tsx`
- [ ] Industry-specific settings page
- [ ] Configure industry features on/off
- [ ] Configure industry tools
- [ ] Industry-specific configuration (from industryConfig JSON)
- [ ] Feature toggles
- [ ] Permission requirements

**Settings Sections:**
- General (name, description, icon)
- Features (enable/disable features)
- Tools (manage tool installations)
- Advanced (industry-specific config JSON)

**Success Criteria:**
- CRUD operations for industry config
- Server Actions for updates
- Form validation with Zod

---

### Phase 6: Navigation Integration (45 minutes)

#### File 1: Update `components/(platform)/shared/navigation/sidebar-nav.tsx`
- [ ] Read existing sidebar navigation
- [ ] Add "Industries" section to sidebar
- [ ] Fetch user's enabled industries
- [ ] Dynamically render industry links
- [ ] Show industry icons
- [ ] Highlight active industry
- [ ] Collapsible industry menu

**Menu Structure:**
```
Platform
├── Dashboard
├── CRM
├── Projects
├── AI
├── Tasks
├── Tools
│
├── Industries ▼
│   ├── 🏥 Healthcare
│   │   ├── Dashboard
│   │   ├── Patients
│   │   └── Tools
│   └── 🏡 Real Estate
│       ├── Dashboard
│       ├── Properties
│       └── Tools
│
└── Settings
```

**Success Criteria:**
- Dynamic industry loading
- Shows only enabled industries
- Proper active state
- Icons render correctly

---

#### File 2: Update breadcrumbs component
- [ ] Find existing breadcrumb component
- [ ] Add industry route detection
- [ ] Show industry name in breadcrumbs
- [ ] Format: Dashboard > Industries > Healthcare > Patients

---

### Phase 7: Testing (30 minutes)

#### File 1: `__tests__/app/(platform)/industries/routing.test.ts`
- [ ] Test industry routes resolve correctly
- [ ] Test invalid industryId returns 404
- [ ] Test unauthorized access redirects
- [ ] Test dynamic tool routes work
- [ ] Mock industry registry

#### File 2: `__tests__/app/(platform)/industries/access-control.test.ts`
- [ ] Test user without industry access redirected
- [ ] Test user with industry access succeeds
- [ ] Test organization industry enablement check

**Coverage Target:** 80%+

---

## 📊 Files to Create

### App Routes (10-12 files)
```
app/(platform)/industries/
├── [industryId]/
│   ├── layout.tsx                    # ✅ Create (industry wrapper)
│   ├── page.tsx                      # ✅ Create (industry overview)
│   │
│   ├── dashboard/
│   │   └── page.tsx                  # ✅ Create (industry dashboard)
│   │
│   ├── tools/
│   │   ├── page.tsx                  # ✅ Create (tools list)
│   │   └── [toolId]/
│   │       ├── layout.tsx            # ✅ Create (tool wrapper)
│   │       └── page.tsx              # ✅ Create (tool detail)
│   │
│   ├── crm/
│   │   └── page.tsx                  # ✅ Create (industry CRM)
│   │
│   └── settings/
│       └── page.tsx                  # ✅ Create (industry settings)
│
└── _components/                      # ✅ Create (shared industry UI)
    ├── industry-header.tsx           # ✅ Create
    ├── industry-nav.tsx              # ✅ Create
    ├── industry-provider.tsx         # ✅ Create (context)
    └── industry-metrics.tsx          # ✅ Create
```

### Component Updates (2 files)
```
components/(platform)/shared/navigation/
├── sidebar-nav.tsx                   # 🔄 Update (add industries)
└── breadcrumbs.tsx                   # 🔄 Update (industry routes)
```

### Test Files (2 files)
```
__tests__/app/(platform)/industries/
├── routing.test.ts                   # ✅ Create
└── access-control.test.ts            # ✅ Create
```

**Total:** ~16 files (12 new routes, 2 components updated, 2 tests)

---

## 🎯 Success Criteria

- [ ] All industry routes created and functional
- [ ] Dynamic routing works: `/industries/healthcare`, `/industries/real-estate`
- [ ] Access control enforced (organization must have industry enabled)
- [ ] Industry not found returns 404
- [ ] Unauthorized access redirects to settings
- [ ] Sidebar navigation shows enabled industries
- [ ] Breadcrumbs include industry context
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] All files under 500 lines
- [ ] All routes are Server Components (async)
- [ ] No client-side data fetching (use Server Components)

---

## 🔗 Integration Points

### With Industry Registry
```typescript
import { getIndustryConfig, hasIndustryEnabled } from '@/lib/industries/registry';

// Validate industry
const industry = await getIndustryConfig(params.industryId);
if (!industry) notFound();

// Check access
const hasAccess = await hasIndustryEnabled(user.organizationId, params.industryId);
if (!hasAccess) redirect('/settings/industries');
```

### With Industry Components
```typescript
// Healthcare
import { HealthcareDashboard } from '@/components/(platform)/healthcare/dashboard';

// Real Estate
import { RealEstateDashboard } from '@/components/(platform)/real-estate/dashboard';

// Dynamic import based on industryId
const DashboardComponent = await import(`@/components/(platform)/${industryId}/dashboard`);
```

### With Industry Actions
```typescript
// Use industry-specific actions
import { getRealEstateCustomers } from '@/lib/industries/real-estate/overrides/crm';
import { getHealthcarePatients } from '@/lib/industries/healthcare/overrides/crm';
```

---

## 📝 Implementation Notes

### Route Parameter Validation
```typescript
// app/(platform)/industries/[industryId]/layout.tsx
import { Industry } from '@prisma/client';

const validIndustries = Object.values(Industry);
if (!validIndustries.includes(params.industryId.toUpperCase())) {
  notFound();
}
```

### Access Control Pattern
```typescript
// Every industry route must check access
async function checkIndustryAccess(
  industryId: string,
  organizationId: string
): Promise<boolean> {
  const config = await prisma.organizationToolConfig.findFirst({
    where: {
      organizationId,
      industry: industryId.toUpperCase(),
      enabled: true,
    },
  });
  return !!config;
}
```

### Dynamic Component Loading
```typescript
// Conditionally render industry dashboard
const industry = await getIndustryConfig(params.industryId);

// Option 1: Hardcoded switch
let DashboardComponent;
switch (industry.id) {
  case 'healthcare':
    DashboardComponent = await import('@/components/(platform)/healthcare/dashboard');
    break;
  case 'real-estate':
    DashboardComponent = await import('@/components/(platform)/real-estate/dashboard');
    break;
  default:
    DashboardComponent = GenericIndustryDashboard;
}

return <DashboardComponent />;
```

### Error Handling
```typescript
// Industry not found
if (!industry) {
  notFound(); // Returns 404
}

// Access denied
if (!hasAccess) {
  redirect('/settings/industries?error=access_denied');
}

// Server error
try {
  // ... fetch industry data
} catch (error) {
  throw new Error('Failed to load industry data');
}
```

---

## 🚀 Quick Start Command

```bash
# Create directory structure
mkdir -p app/\(platform\)/industries/\[industryId\]/\{dashboard,tools/\[toolId\],crm,settings\}

# Run checks after implementation
npx tsc --noEmit && npm run lint && npm test
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ Session 1: `lib/industries/registry.ts` - Industry registry functions
- ✅ Session 2: `components/(shared)/ui/` - UI components

**Optional (enhances functionality):**
- Session 3: Real estate business logic (enables real data in routes)
- Session 7: Healthcare business logic (enables healthcare routes)

**Blocks (must complete before):**
- SESSION5: Industry management UI depends on these routes existing
- SESSION9: Integration tests need routes to test

**Enables:**
- Users can access industry-specific dashboards
- Organizations can switch between enabled industries
- Industry-specific tools can be accessed
- Industry CRM overrides become functional

---

## 📖 Reference Files

**Read before starting:**
- `app/(platform)/dashboard/page.tsx` - Dashboard pattern
- `app/(platform)/crm/page.tsx` - CRM route pattern
- `lib/industries/registry.ts` - Industry functions
- `lib/industries/_core/industry-router.ts` - Routing utilities
- `components/(platform)/shared/navigation/sidebar-nav.tsx` - Navigation structure

**Similar patterns to follow:**
- `app/(platform)/crm/[customerId]/page.tsx` - Dynamic route pattern
- `app/(platform)/projects/[projectId]/page.tsx` - Dynamic route pattern

---

**Last Updated:** 2025-10-03
**Status:** ⏸️ Ready to Execute
