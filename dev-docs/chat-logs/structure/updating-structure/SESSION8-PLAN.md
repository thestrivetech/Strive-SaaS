# Session 8: Industry Tools Infrastructure - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3-4 hours
**Dependencies:** Session 1 ✅, Session 4 (routes), Session 5 (management)
**Parallel Safe:** Yes (can run alongside SESSION3, SESSION7)

---

## 🎯 Session Objectives

Enhance the tools system to support industry-specific tools, implement tool-to-industry association, create marketplace filtering, and enable dynamic tool installation/configuration.

**What Exists:**
- ✅ `lib/tools/registry/` - Tool registration system
- ✅ `lib/tools/shared/crm-basic/` - One shared tool example
- ✅ `lib/tools/manager.ts` - Tool lifecycle management
- ✅ `OrganizationToolConfig` Prisma model

**What's Missing:**
- ❌ Industry-specific tools implementation
- ❌ Tool-to-industry association logic
- ❌ Marketplace filtering by industry
- ❌ Tool installation UI improvements
- ❌ Tool configuration forms
- ❌ Industry tool routing integration

---

## 📋 Task Breakdown

### Phase 1: Industry Tool Association (1 hour)

**Directory:** `lib/tools/`

#### File 1: Update `types.ts`
- [ ] Add `industryId` field to ToolConfig interface
- [ ] Add `IndustryToolConfig` type
  - Extends base ToolConfig
  - Industry-specific settings
- [ ] Add `ToolAvailability` type
  - shared: Available to all industries
  - industry-specific: Single industry only
  - multi-industry: Multiple industries

```typescript
export interface ToolConfig {
  // Existing fields...
  industry: Industry | 'SHARED';        // Tool belongs to which industry
  availability: ToolAvailability;       // Who can use it
  compatibleWith?: Industry[];          // Which industries can install
}
```

#### File 2: Update `registry/index.ts`
- [ ] Add `getToolsByIndustry()` function
  - Returns tools for specific industry
  - Includes shared tools
  - Filters by availability
- [ ] Add `getSharedTools()` function
  - Returns only SHARED tools
  - Available to all industries
- [ ] Add `isToolCompatible()` function
  - Check if tool can be used with industry
  - Validate compatibility

```typescript
export function getToolsByIndustry(industryId: string): ToolConfig[] {
  const allTools = getRegisteredTools();

  return allTools.filter(tool => {
    // Include shared tools
    if (tool.industry === 'SHARED') return true;

    // Include industry-specific tools
    if (tool.industry === industryId.toUpperCase()) return true;

    // Include if compatible
    if (tool.compatibleWith?.includes(industryId.toUpperCase())) return true;

    return false;
  });
}
```

**Success Criteria:**
- Type-safe industry associations
- Proper filtering logic
- Backwards compatible with existing tools

---

### Phase 2: Create Industry-Specific Tools (1.5 hours)

**Directory:** `lib/industries/[industry]/tools/`

#### Real Estate Tools

**Tool 1: Property Alerts (`lib/industries/real-estate/tools/property-alerts/`)**
- [ ] `config.ts` - Tool configuration
  - Name: "Property Alerts"
  - Description: "Automated alerts for new listings"
  - Icon: Bell
  - Industry: REAL_ESTATE
  - Implementation: NEXTJS
- [ ] `types.ts` - Alert types, criteria types
- [ ] `actions.ts` - Create/update/delete alerts
- [ ] `queries.ts` - Get alerts, match properties
- [ ] `schemas.ts` - Validation schemas
- [ ] `index.ts` - Public API

**Tool 2: MLS Integration (`lib/industries/real-estate/tools/mls-integration/`)**
- [ ] `config.ts` - MLS integration tool
- [ ] `types.ts` - Listing types, sync status
- [ ] `sync.ts` - Sync logic with MLS
- [ ] `actions.ts` - Import listings, update status
- [ ] `queries.ts` - Get synced listings
- [ ] `schemas.ts` - MLS data validation
- [ ] `index.ts` - Public API

#### Healthcare Tools

**Tool 3: Patient Portal (`lib/industries/healthcare/tools/patient-portal/`)**
- [ ] `config.ts` - Patient portal configuration
  - Name: "Patient Portal"
  - Description: "Self-service patient access"
  - Icon: UserCircle
  - Industry: HEALTHCARE
  - Implementation: EXTERNAL (separate app)
- [ ] `types.ts` - Portal settings, access logs
- [ ] `actions.ts` - Generate portal links, manage access
- [ ] `queries.ts` - Get portal analytics
- [ ] `schemas.ts` - Portal config validation
- [ ] `index.ts` - Public API

**Tool 4: Prescription Tracker (`lib/industries/healthcare/tools/prescription-tracker/`)**
- [ ] `config.ts` - Prescription tracker tool
- [ ] `types.ts` - Prescription types, refill status
- [ ] `actions.ts` - Create prescriptions, track refills
- [ ] `queries.ts` - Get prescriptions, refill history
- [ ] `schemas.ts` - Prescription validation
- [ ] `index.ts` - Public API

**Success Criteria:**
- Each tool follows consistent structure
- Industry association properly set
- All tools registered in industry config
- Type-safe implementations

---

### Phase 3: Tool UI Components (1 hour)

**Directory:** `components/(platform)/shared/tools/`

#### File 1: `tool-card.tsx`
- [ ] Enhanced tool card with industry badge
- [ ] Shows industry icon/color
- [ ] Installation status
- [ ] Configuration button
- [ ] Enable/disable toggle

#### File 2: `tool-marketplace.tsx`
- [ ] Tool marketplace grid
- [ ] Filter by industry
- [ ] Filter by category (Analysis, Automation, etc.)
- [ ] Search tools
- [ ] Sort by popularity, name, date added
- [ ] Client Component (interactive)

#### File 3: `install-tool-dialog.tsx`
- [ ] Confirm tool installation
- [ ] Show tool requirements
- [ ] Show subscription tier requirements
- [ ] Configuration step (if needed)
- [ ] Calls `installTool()` action

#### File 4: `tool-config-form.tsx`
- [ ] Dynamic form based on tool config schema
- [ ] React Hook Form + Zod validation
- [ ] Save button calls `configureTool()` action
- [ ] Reset to defaults button

#### File 5: `industry-tools-section.tsx`
- [ ] Shows tools for current industry
- [ ] Grouped by shared vs industry-specific
- [ ] Quick install buttons
- [ ] Links to tool detail pages

**Success Criteria:**
- Reusable components
- Industry-aware filtering
- Client Components where needed
- Server Components for data fetching

---

### Phase 4: Tool Actions & Queries (45 minutes)

**Directory:** `lib/modules/tools/` (create if doesn't exist)

#### File 1: `actions.ts`
- [ ] `installTool()` - Install tool for organization
  - Check subscription tier allows tool
  - Check industry compatibility
  - Create OrganizationToolConfig record
  - Run tool's `onInstall()` lifecycle hook
  - Return success
- [ ] `uninstallTool()` - Uninstall tool
  - Run tool's `onUninstall()` hook
  - Remove configuration
  - Soft delete OrganizationToolConfig
  - Return success
- [ ] `configureTool()` - Update tool settings
  - Validate config with tool schema
  - Update OrganizationToolConfig.settings
  - Run tool's `onConfigure()` hook
  - Return success
- [ ] `enableTool()` / `disableTool()` - Toggle activation

**Success Criteria:**
- All actions have 'use server' directive
- Auth and org checks
- Subscription tier validation
- Tool lifecycle hooks called

---

#### File 2: `queries.ts`
- [ ] `getOrganizationTools()` - List installed tools
  - Filter by industry
  - Include configuration
  - Return enabled/disabled status
- [ ] `getAvailableTools()` - Tools available to install
  - Filter by industry
  - Exclude already installed
  - Check subscription tier
- [ ] `getToolConfig()` - Get specific tool configuration
- [ ] `getToolAnalytics()` - Usage statistics

---

#### File 3: `schemas.ts`
- [ ] `InstallToolSchema`
- [ ] `ConfigureToolSchema`
- [ ] `ToolFiltersSchema`

---

### Phase 5: Tool Routes Integration (30 minutes)

#### Update: `app/(platform)/tools/page.tsx`
- [ ] Read existing tools marketplace page
- [ ] Add industry filter dropdown
- [ ] Show industry badges on tool cards
- [ ] Filter tools by selected industry
- [ ] "All Tools" vs "My Industry Tools" toggle

#### Update: `app/(platform)/industries/[industryId]/tools/page.tsx`
- [ ] Show only tools for this industry
- [ ] Shared tools + industry-specific
- [ ] Quick install actions
- [ ] Link to main marketplace

---

### Phase 6: Testing (30 minutes)

#### File 1: `__tests__/lib/tools/registry.test.ts` (update)
- [ ] Test `getToolsByIndustry()` filtering
- [ ] Test `isToolCompatible()` logic
- [ ] Test shared tools always included

#### File 2: `__tests__/lib/modules/tools/actions.test.ts`
- [ ] Test `installTool()` success
- [ ] Test `installTool()` checks compatibility
- [ ] Test `installTool()` validates subscription
- [ ] Test `configureTool()` validation
- [ ] Test `uninstallTool()` cleanup

#### File 3: `__tests__/components/tool-marketplace.test.tsx`
- [ ] Test industry filtering works
- [ ] Test search functionality
- [ ] Test tool cards render correctly

**Coverage Target:** 80%+

---

## 📊 Files to Create/Update

### Business Logic (20+ files)
```
lib/tools/
├── types.ts                          # 🔄 Update (add industry fields)
├── registry/index.ts                 # 🔄 Update (add industry functions)
└── manager.ts                        # 🔄 Update (industry awareness)

lib/modules/tools/                    # ✅ Create new module
├── actions.ts                        # ✅ Create
├── queries.ts                        # ✅ Create
├── schemas.ts                        # ✅ Create
└── index.ts                          # ✅ Create

lib/industries/real-estate/tools/
├── property-alerts/                  # ✅ Create (6 files)
└── mls-integration/                  # ✅ Create (6 files)

lib/industries/healthcare/tools/
├── patient-portal/                   # ✅ Create (6 files)
└── prescription-tracker/             # ✅ Create (6 files)
```

### Components (5 files)
```
components/(platform)/shared/tools/
├── tool-card.tsx                     # ✅ Create
├── tool-marketplace.tsx              # ✅ Create
├── install-tool-dialog.tsx           # ✅ Create
├── tool-config-form.tsx              # ✅ Create
└── industry-tools-section.tsx        # ✅ Create
```

### Routes (2 files)
```
app/(platform)/
├── tools/page.tsx                    # 🔄 Update (industry filter)
└── industries/[industryId]/tools/page.tsx  # 🔄 Update (from SESSION4)
```

### Tests (3 files)
```
__tests__/
├── lib/tools/registry.test.ts        # 🔄 Update
├── lib/modules/tools/actions.test.ts # ✅ Create
└── components/tool-marketplace.test.tsx  # ✅ Create
```

**Total:** ~35 files (28 new, 7 updated)

---

## 🎯 Success Criteria

- [ ] Tool-to-industry association works
- [ ] Industry filtering in marketplace
- [ ] Install/uninstall tools functional
- [ ] Tool configuration forms work
- [ ] 4 industry-specific tools created (2 per industry)
- [ ] Shared tools still accessible
- [ ] Subscription tier gating works
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] All files under 500 lines
- [ ] Tool lifecycle hooks functional

---

## 🔗 Integration Points

### With Industry System
```typescript
// Get tools for healthcare industry
const healthcareTools = getToolsByIndustry('healthcare');

// Includes SHARED tools + HEALTHCARE tools
// Filters out REAL_ESTATE-only tools
```

### With Subscription Tiers
```typescript
const tierLimits = {
  STARTER: { maxTools: 3, allowedCategories: ['BASIC'] },
  GROWTH: { maxTools: 10, allowedCategories: ['BASIC', 'ANALYSIS'] },
  ELITE: { maxTools: 25, allowedCategories: '*' },
  CUSTOM: { maxTools: '*', allowedCategories: '*' },
  ENTERPRISE: { maxTools: '*', allowedCategories: '*' },
};
```

---

## 📝 Implementation Notes

### Tool Configuration Storage
```typescript
// OrganizationToolConfig model
{
  toolId: "property-alerts",
  industry: "REAL_ESTATE",
  enabled: true,
  settings: {
    priceRange: { min: 0, max: 1000000 },
    locations: ["Downtown", "Suburbs"],
    notificationEmail: "agent@example.com",
    frequency: "daily"
  }
}
```

### Tool Lifecycle Hooks
```typescript
// Every tool can implement lifecycle hooks
export class PropertyAlertsТool {
  async onInstall(orgId: string) {
    // Set up default alert criteria
    // Create initial database records
    // Send welcome email
  }

  async onUninstall(orgId: string) {
    // Clean up alert subscriptions
    // Archive existing alerts
    // Notify users
  }

  async onConfigure(orgId: string, settings: any) {
    // Validate settings
    // Update alert criteria
    // Restart alert processing
  }
}
```

---

## 🚀 Quick Start Command

```bash
# Create directory structure
mkdir -p lib/modules/tools lib/industries/real-estate/tools/{property-alerts,mls-integration}
mkdir -p lib/industries/healthcare/tools/{patient-portal,prescription-tracker}

# Run checks
npx tsc --noEmit && npm run lint && npm test
```

---

## 🔄 Dependencies

**Requires:**
- ✅ Session 1: Industry infrastructure
- ✅ Session 4: Industry routes (for tool pages)
- ✅ Session 5: Industry management (for tool enablement)

**Parallel Safe:** Yes (independent)

**Enables:**
- Industry-specific tool marketplace
- Dynamic tool installation
- Tool-based revenue opportunities
- Enhanced industry functionality

---

**Last Updated:** 2025-10-03
**Status:** ⏸️ Ready to Execute
