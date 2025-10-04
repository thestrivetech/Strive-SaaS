# Session 5: Industry Settings & Management UI - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** Session 1 ✅, Session 2 ✅, Session 4 (routes)
**Parallel Safe:** No (depends on SESSION4)

---

## 🎯 Session Objectives

Create the UI for organizations to enable/disable industries, configure industry settings, and manage industry-specific features from the platform settings page.

**What Exists:**
- ✅ `app/(platform)/settings/` - Base settings routes
- ✅ `lib/industries/registry.ts` - Industry backend
- ✅ Prisma schema with `Organization.industry` and `Organization.industryConfig`

**What's Missing:**
- ❌ `app/(platform)/settings/industries/` - Industry management page
- ❌ Industry enable/disable UI
- ❌ Industry switcher component
- ❌ Industry configuration forms
- ❌ Server Actions for industry management

---

## 📋 Task Breakdown

### Phase 1: Industry Management Page (1 hour)

**Directory:** `app/(platform)/settings/industries/`

#### File 1: `page.tsx`
- [ ] Create industry management settings page
- [ ] Show "Available Industries" section
  - List all registered industries from registry
  - Show industry icon, name, description
  - Show status (beta, active, coming-soon)
  - Enable/disable toggle for each
- [ ] Show "Enabled Industries" section
  - List currently enabled industries
  - Primary industry badge
  - Quick access links to industry dashboards
  - Configure buttons
- [ ] Show "Coming Soon" section
  - Grayed-out industry cards
  - "Request Access" buttons
- [ ] Fetch data server-side
  - `getRegisteredIndustries()` from registry
  - `getOrganizationIndustries(orgId)` from database

**Layout Structure:**
```tsx
<SettingsLayout>
  <PageHeader
    title="Industries"
    description="Enable and configure industry-specific features"
  />

  <EnabledIndustriesSection />
  <AvailableIndustriesSection />
  <ComingSoonIndustriesSection />
</SettingsLayout>
```

**Success Criteria:**
- Server Component (async data fetching)
- Displays all registered industries
- Shows enable status correctly
- Links to individual industry settings

---

### Phase 2: Industry Cards & Actions (45 minutes)

**Directory:** `components/(platform)/shared/settings/industries/`

#### File 1: `industry-card.tsx`
- [ ] Create reusable industry card component
- [ ] Props: industry config, enabled status, onClick
- [ ] Display:
  - Industry icon (from Lucide)
  - Industry name
  - Description
  - Status badge (Beta, Active, Coming Soon)
  - Feature count
  - Tool count
- [ ] Actions:
  - Enable/Disable toggle
  - Configure button (if enabled)
  - View Details link
- [ ] Client Component (interactive)

**Component Structure:**
```tsx
<Card>
  <CardHeader>
    <Icon /> {name}
    <StatusBadge />
  </CardHeader>
  <CardContent>
    <Description />
    <FeatureList />
  </CardContent>
  <CardFooter>
    <EnableToggle />
    <ConfigureButton />
  </CardFooter>
</Card>
```

**Success Criteria:**
- Reusable across multiple contexts
- Handles enable/disable optimistically
- Shows loading states
- Client Component with "use client"

---

#### File 2: `enable-industry-dialog.tsx`
- [ ] Create confirmation dialog for enabling industry
- [ ] Show industry details
- [ ] Show required subscription tier
- [ ] Show features that will be enabled
- [ ] Show tools that will be available
- [ ] Confirm button calls `enableIndustry()` action
- [ ] Success feedback
- [ ] Error handling

**Success Criteria:**
- Clear confirmation flow
- Shows impact of enabling
- Calls server action
- Optimistic UI updates

---

#### File 3: `disable-industry-dialog.tsx`
- [ ] Create confirmation dialog for disabling industry
- [ ] Warning about losing access
- [ ] Show what will be disabled (features, tools)
- [ ] Show if any data will be affected
- [ ] Confirm button calls `disableIndustry()` action
- [ ] Success feedback
- [ ] Error handling

**Success Criteria:**
- Clear warning messages
- Shows impact of disabling
- Prevents accidental disabling
- Client Component

---

#### File 4: `set-primary-industry-dialog.tsx`
- [ ] Create dialog for setting primary industry
- [ ] Explain primary industry concept
- [ ] Show current primary
- [ ] Dropdown to select new primary
- [ ] Confirm button calls `setPrimaryIndustry()` action
- [ ] Success feedback

**Success Criteria:**
- Only shows enabled industries in dropdown
- Updates organization record
- Updates UI immediately

---

### Phase 3: Industry Switcher Component (30 minutes)

**Directory:** `components/(platform)/shared/navigation/`

#### File 1: `industry-switcher.tsx`
- [ ] Create dropdown/menu for switching industries
- [ ] Show list of enabled industries
- [ ] Highlight current industry (if on industry route)
- [ ] Click switches to industry dashboard
- [ ] Add "Manage Industries" link to settings
- [ ] Show industry icons
- [ ] Show "No Industries Enabled" state

**Placement:** Sidebar or top bar

**Success Criteria:**
- Shows only enabled industries
- Smooth navigation
- Visual indication of current industry
- Client Component (interactive)

---

### Phase 4: Server Actions for Industry Management (45 minutes)

**Directory:** `lib/modules/organization/`

#### File 1: `actions.ts` (update existing)
- [ ] Add `enableIndustry()` server action
  - Validate user is org admin
  - Validate industry exists in registry
  - Check subscription tier allows industry
  - Create OrganizationToolConfig record (or similar)
  - Set Organization.industry if first enabled
  - Return success
- [ ] Add `disableIndustry()` server action
  - Validate user is org admin
  - Cannot disable if it's primary industry
  - Remove OrganizationToolConfig
  - Return success
- [ ] Add `setPrimaryIndustry()` server action
  - Validate industry is enabled
  - Update Organization.industry field
  - Return success
- [ ] Add `configureIndustry()` server action
  - Update Organization.industryConfig JSON
  - Validate config with industry schema
  - Return success

**Success Criteria:**
- All actions have 'use server' directive
- Auth and RBAC checks (admin only)
- Input validation with Zod
- Proper error handling
- Type-safe responses

---

#### File 2: `schemas.ts` (update existing)
- [ ] Add `EnableIndustrySchema`
  - industryId (string, required)
  - organizationId (string, required)
- [ ] Add `DisableIndustrySchema`
  - industryId (string, required)
  - organizationId (string, required)
- [ ] Add `SetPrimaryIndustrySchema`
  - industryId (string, required)
  - organizationId (string, required)
- [ ] Add `ConfigureIndustrySchema`
  - industryId (string, required)
  - organizationId (string, required)
  - config (JSON object)

**Success Criteria:**
- Zod validation schemas
- Type-safe
- Exported for use in actions

---

### Phase 5: Industry Configuration Form (30 minutes)

**Directory:** `components/(platform)/shared/settings/industries/`

#### File 1: `industry-config-form.tsx`
- [ ] Create dynamic form for industry-specific settings
- [ ] Load industry config schema
- [ ] Render form fields based on schema
- [ ] Use React Hook Form + Zod
- [ ] Save button calls `configureIndustry()` action
- [ ] Reset button
- [ ] Validation errors display

**Example Fields (Real Estate):**
```typescript
- Default commission rate
- MLS integration API key
- Preferred listing duration
- Auto-assign leads (toggle)
```

**Example Fields (Healthcare):**
```typescript
- HIPAA compliance mode (toggle)
- Default appointment duration
- Patient portal URL
- EMR integration type
```

**Success Criteria:**
- Dynamic based on industry
- Form validation
- Saves to Organization.industryConfig JSON
- Client Component

---

### Phase 6: Testing (30 minutes)

#### File 1: `__tests__/app/(platform)/settings/industries.test.ts`
- [ ] Test industries page loads
- [ ] Test showing enabled industries
- [ ] Test showing available industries
- [ ] Mock registry and database calls

#### File 2: `__tests__/lib/modules/organization/actions.test.ts` (update)
- [ ] Test `enableIndustry()` success
- [ ] Test `enableIndustry()` auth failure
- [ ] Test `enableIndustry()` invalid industry
- [ ] Test `disableIndustry()` success
- [ ] Test `disableIndustry()` prevents disabling primary
- [ ] Test `setPrimaryIndustry()` success
- [ ] Test `configureIndustry()` validation

#### File 3: `__tests__/components/industry-card.test.tsx`
- [ ] Test industry card renders
- [ ] Test enable toggle works
- [ ] Test configure button shows when enabled
- [ ] Test status badges display correctly

**Coverage Target:** 80%+

---

## 📊 Files to Create

### App Routes (1 file)
```
app/(platform)/settings/industries/
└── page.tsx                          # ✅ Create (industry management page)
```

### Components (7 files)
```
components/(platform)/shared/settings/industries/
├── industry-card.tsx                 # ✅ Create (reusable card)
├── enable-industry-dialog.tsx        # ✅ Create (confirmation)
├── disable-industry-dialog.tsx       # ✅ Create (confirmation)
├── set-primary-industry-dialog.tsx   # ✅ Create (set primary)
├── industry-config-form.tsx          # ✅ Create (config form)
└── index.ts                          # ✅ Create (exports)

components/(platform)/shared/navigation/
├── industry-switcher.tsx             # ✅ Create (dropdown switcher)
└── sidebar-nav.tsx                   # 🔄 Update (add switcher)
```

### Business Logic (2 files updated)
```
lib/modules/organization/
├── actions.ts                        # 🔄 Update (add industry actions)
└── schemas.ts                        # 🔄 Update (add industry schemas)
```

### Tests (3 files)
```
__tests__/
├── app/(platform)/settings/industries.test.ts
├── lib/modules/organization/actions.test.ts    # 🔄 Update
└── components/industry-card.test.tsx
```

**Total:** 14 files (8 new, 4 updated, 2 test files)

---

## 🎯 Success Criteria

- [ ] Industry management page functional
- [ ] Enable/disable industries works
- [ ] Set primary industry works
- [ ] Industry configuration form works
- [ ] Industry switcher component works
- [ ] All actions have proper auth checks
- [ ] All inputs validated with Zod
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] All files under 500 lines
- [ ] Optimistic UI updates for better UX
- [ ] Error handling with user-friendly messages

---

## 🔗 Integration Points

### With Industry Registry
```typescript
import { getRegisteredIndustries, getIndustryConfig } from '@/lib/industries/registry';

// Get all available industries
const industries = getRegisteredIndustries();

// Get specific industry details
const healthcare = getIndustryConfig('healthcare');
```

### With Database
```typescript
// Check enabled industries
const orgIndustries = await prisma.organization.findUnique({
  where: { id: orgId },
  select: {
    industry: true,              // Primary industry
    industryConfig: true,         // JSON config
  },
});

// Enable industry (store in appropriate table/field)
await prisma.organizationToolConfig.create({
  data: {
    organizationId: orgId,
    industry: 'HEALTHCARE',
    enabled: true,
  },
});
```

### With Navigation
```typescript
// Sidebar navigation shows switcher
<Sidebar>
  <IndustrySwitcher />
  <MainNav />
</Sidebar>
```

---

## 📝 Implementation Notes

### Enable/Disable Flow
```typescript
// Enable Industry
1. User clicks "Enable" on industry card
2. Show confirmation dialog with details
3. User confirms
4. Call enableIndustry() server action
5. Create database record
6. Optimistic UI update (show as enabled immediately)
7. Show success toast
8. Refresh server data in background

// Disable Industry
1. User clicks "Disable" on enabled industry
2. Show warning dialog
3. Check if primary industry → prevent disable
4. User confirms
5. Call disableIndustry() server action
6. Remove database record
7. Update UI
8. Show success toast
```

### Primary Industry Logic
```typescript
// Only one primary industry per organization
// First enabled industry automatically becomes primary
// Can change primary from settings
// Cannot disable primary without setting a new one first

async function setPrimaryIndustry(industryId: string) {
  const isEnabled = await checkIndustryEnabled(orgId, industryId);
  if (!isEnabled) {
    throw new Error('Cannot set disabled industry as primary');
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { industry: industryId.toUpperCase() },
  });
}
```

### Industry Configuration Storage
```typescript
// Store in Organization.industryConfig JSON field
{
  "healthcare": {
    "hipaaMode": true,
    "appointmentDuration": 30,
    "patientPortalUrl": "https://portal.example.com",
    "emrIntegration": "epic"
  },
  "real-estate": {
    "commissionRate": 6.0,
    "mlsApiKey": "encrypted_key_here",
    "listingDuration": 90,
    "autoAssignLeads": true
  }
}
```

### Subscription Tier Gating
```typescript
// Check if subscription allows industry
const tierLimits = {
  STARTER: ['SHARED'],
  GROWTH: ['SHARED', 'REAL_ESTATE'],
  ELITE: ['SHARED', 'REAL_ESTATE', 'HEALTHCARE'],
  CUSTOM: '*', // All industries
  ENTERPRISE: '*',
};

async function canEnableIndustry(industryId: string, orgId: string) {
  const org = await getOrganization(orgId);
  const subscription = await getSubscription(org.subscriptionId);
  const allowed = tierLimits[subscription.tier];

  if (allowed === '*') return true;
  return allowed.includes(industryId);
}
```

---

## 🚀 Quick Start Command

```bash
# Create directory structure
mkdir -p app/\(platform\)/settings/industries
mkdir -p components/\(platform\)/shared/settings/industries

# Run checks after implementation
npx tsc --noEmit && npm run lint && npm test
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ Session 1: `lib/industries/registry.ts` - Industry registry
- ✅ Session 2: `components/(shared)/ui/` - UI components
- ✅ Session 4: Industry routes (for "View Dashboard" links to work)

**Blocks (must complete before):**
- SESSION9: Integration tests need this UI to test enablement flow

**Enables:**
- Users can enable/disable industries
- Organizations can configure industry-specific settings
- Industry switcher becomes functional
- Industry management workflow complete

---

## 📖 Reference Files

**Read before starting:**
- `app/(platform)/settings/team/page.tsx` - Settings page pattern
- `lib/modules/organization/actions.ts` - Organization actions pattern
- `components/(platform)/shared/` - Shared component patterns
- `lib/industries/registry.ts` - Registry functions
- `CLAUDE.md` - Form validation and Server Actions standards

**Similar patterns:**
- Tool management UI (if exists) - Similar enable/disable flow
- Team member management - Similar CRUD operations
- Organization settings - Similar configuration forms

---

**Last Updated:** 2025-10-03
**Status:** ⏸️ Ready to Execute
