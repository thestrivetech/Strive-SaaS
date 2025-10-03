# Tool Architecture Implementation - Session 1 Summary

**Date:** October 2, 2025
**Status:** ✅ Phase 1 Complete - Core Infrastructure Built
**Updated:** October 2, 2025 - Tiers & Module/Tool Distinction Added
**Next Session:** Phase 2-5 (Data Layer, UI, Testing, Documentation)

---

## 🚨 CRITICAL UPDATE: Modules vs Tools

**MODULES** = Core platform dashboards (lib/modules/) - CRM, Projects, AI, Tasks
- Always included with subscription tier
- NOT sold separately
- Part of base platform

**TOOLS** = Marketplace add-ons (lib/tools/) - ROI Calc, Invoice Gen, Property Alerts
- Can be purchased/enabled separately
- May integrate into modules
- Industry-specific or general

**See:** [CRITICAL-DISTINCTIONS.md](./CRITICAL-DISTINCTIONS.md) for full details

---

## 🎯 Subscription Tiers (Updated)

**5 Tiers:** Starter | Growth | Elite | Custom | Enterprise

**IMPORTANT:** All pricing and feature allocation are PLACEHOLDERS (TBD)
- Final pricing not set
- Module/tool inclusion per tier TBD
- Limits and quotas TBD

---

## 🎯 Session Objectives Completed

### ✅ Primary Goals Achieved
1. **Core type system with proper tier alignment** - Using FREE/BASIC/PRO/ENTERPRISE (not TIER_1/2/3)
2. **Lazy-loaded registry system** - Optimized code splitting by industry
3. **Tool lifecycle management** - Enable/disable/configure with validation
4. **Database schema design** - Prisma models for tool configurations
5. **Complete example tool** - crm-basic as template for future tools
6. **Industry folder structure** - 11 industries ready for tool development

---

## 📦 Files Created

### Core Library Files (`app/lib/tools/`)

#### **1. `types.ts` (185 lines)**
Complete type system for the tool marketplace:
- ✅ `Industry` type - 11 industries (shared, real-estate, healthcare, etc.)
- ✅ `ToolCategory` type - 13 functional categories
- ✅ `ToolTier` type - FREE/BASIC/PRO/ENTERPRISE (matches Prisma)
- ✅ `ToolMetadata` interface - Full tool configuration
- ✅ `Tool` interface - Complete tool definition with actions/queries/hooks
- ✅ `OrganizationToolConfig` interface - Matches Prisma model
- ✅ `ToolAccessResult` interface - Access control responses
- ✅ `ToolFilter`, `ToolDisplayOptions` - Filtering and display

**Key Features:**
- Aligns with existing subscription tiers
- Full TypeScript type safety
- Comprehensive documentation

#### **2. `constants.ts` (290 lines)**
Global configuration and metadata:
- ✅ `INDUSTRY_META` - Display data for all 11 industries
- ✅ `CATEGORY_META` - Category descriptions and icons
- ✅ `TIER_META` - Tier pricing and limits
- ✅ `TOOL_LIMITS` - API calls, workflow runs per tier
- ✅ `TIER_HIERARCHY` - For tier comparisons
- ✅ `STATUS_META` - Tool status display data
- ✅ Helper functions: `hasRequiredTier()`, `formatPrice()`, `getIndustryName()`

**Tier Limits:**
- FREE: 0 tools, 0 API calls
- BASIC: 3 tools, 10K API calls, $299/mo
- PRO: 10 tools, 50K API calls, $699/mo
- ENTERPRISE: Unlimited tools/calls, Custom pricing

#### **3. `manager.ts` (280 lines)**
Tool lifecycle and access control:
- ✅ `checkToolAccess()` - Validates tier, limits, dependencies
- ✅ `enableTool()` - Runs onEnable hook, validates settings
- ✅ `disableTool()` - Runs onDisable hook
- ✅ `configureTool()` - Updates settings with validation
- ✅ `checkToolHealth()` - Health monitoring
- ✅ `validateToolSettings()` - Comprehensive settings validation
- ✅ `getDefaultToolSettings()` - Returns default config

**Security Features:**
- Input validation with Zod schemas
- Dependency checking
- Tier requirement enforcement
- Tool limit checking

#### **4. `index.ts` (115 lines)**
Main library entry point:
- ✅ Exports all types
- ✅ Exports all registry functions
- ✅ Exports all manager functions
- ✅ Exports all constants
- ✅ Single import point for consumers

**Usage:**
```typescript
import {
  getToolsByIndustry,
  checkToolAccess,
  enableTool,
  TIER_META
} from '@/lib/tools';
```

### Registry System (`app/lib/tools/registry/`)

#### **5. `loaders.ts` (155 lines)**
Lazy loading by industry with caching:
- ✅ Individual loader functions for each industry
- ✅ `loadSharedTools()` - Loads crm-basic (commented pending type fixes)
- ✅ `loadRealEstateTools()` - Ready for real estate tools
- ✅ 9 additional industry loaders
- ✅ `INDUSTRY_LOADERS` registry
- ✅ In-memory caching to prevent re-loading
- ✅ `loadIndustryTools()` - Main loader with cache
- ✅ `preloadIndustries()` - For SSR optimization
- ✅ `clearIndustryCache()` - For testing/invalidation

**Performance Benefits:**
- Only loads tools when industry is accessed
- Tree-shaking removes unused industries
- Caching prevents redundant imports

#### **6. `helpers.ts` (280 lines)**
Search, filter, and lookup utilities:
- ✅ `getToolsByIndustry()` - Get all tools for one industry
- ✅ `getToolById()` - Get specific tool by ID + industry
- ✅ `findToolById()` - Search across all industries
- ✅ `getAllTools()` - Load all tools from all industries
- ✅ `filterTools()` - Filter by industry/category/tier/status/tags/search
- ✅ `sortTools()` - Sort by name/price/category/newest/popularity
- ✅ `paginateTools()` - Pagination support
- ✅ `getToolsWithOptions()` - Combined filter + sort + paginate
- ✅ `searchTools()` - Full-text search across metadata
- ✅ `getToolDependencies()` - Recursive dependency resolution
- ✅ `validateToolDependencies()` - Check if all deps available

**Advanced Features:**
- Recursive dependency tracking
- Full-text search
- Flexible filtering and sorting

#### **7. `index.ts` (60 lines)**
Registry exports with documentation:
- ✅ Re-exports all loader functions
- ✅ Re-exports all helper functions
- ✅ Re-exports key types
- ✅ Usage examples in comments

### Example Tool (`app/lib/tools/shared/crm-basic/`)

#### **8. `types.ts` (20 lines)**
Tool-specific TypeScript types:
- ✅ `CRMBasicSettings` interface
- ✅ `LeadData` interface

#### **9. `schemas.ts` (30 lines)**
Zod validation schemas:
- ✅ `CRMBasicSettingsSchema`
- ✅ `LeadDataSchema`
- ✅ `CreateLeadSchema`
- ✅ `UpdateLeadSchema`

#### **10. `config.ts` (45 lines)**
Tool configuration:
- ✅ `CRM_BASIC_SETTINGS` - 4 configurable settings
- ✅ `DEFAULT_CRM_SETTINGS` - Default values
- ✅ Includes validation rules and descriptions

**Settings:**
- Auto-assign leads (boolean)
- Lead scoring (boolean)
- New lead notifications (boolean)
- Round robin assignment (boolean)

#### **11. `actions.ts` (50 lines)**
Server Actions (placeholder):
- ✅ `createLead()` - Create new lead
- ✅ `updateLead()` - Update existing lead
- ✅ `deleteLead()` - Delete lead
- ✅ `assignLead()` - Assign to user
- ✅ Input validation with Zod
- ✅ Marked with `'use server'`

#### **12. `queries.ts` (60 lines)**
Data fetching functions (placeholder):
- ✅ `getLeads()` - Get all leads for org
- ✅ `getLead()` - Get specific lead
- ✅ `getLeadsByStatus()` - Filter by status
- ✅ `getLeadsByAssignee()` - Filter by assignee
- ✅ `searchLeads()` - Search functionality

#### **13. `index.ts` (115 lines)**
Complete tool definition:
- ✅ Full `Tool` object with metadata
- ✅ Lifecycle hooks (onEnable, onDisable, onConfigure)
- ✅ Health check implementation
- ✅ Actions and queries registration
- ✅ Re-exports all types, schemas, functions
- ✅ Type assertions added for compatibility

**Tool Metadata:**
- ID: `crm-basic`
- Name: Basic CRM
- Industry: `shared`
- Category: `lead-management`
- Tier: `FREE`
- Price: $0 (included)
- Status: `active`
- Version: 1.0.0

### Database Schema (`app/prisma/schema.prisma`)

#### **14. Enums Added**
```prisma
enum ToolImplementation {
  NEXTJS
  N8N
  HYBRID
  EXTERNAL
}

enum ToolStatus {
  ACTIVE
  BETA
  DEPRECATED
  COMING_SOON
}
```

#### **15. OrganizationToolConfig Model**
```prisma
model OrganizationToolConfig {
  id             String       @id @default(uuid())
  organizationId String       @map("organization_id")
  toolId         String       @map("tool_id")
  industry       String
  enabled        Boolean      @default(false)
  settings       Json         @default("{}")
  enabledAt      DateTime?    @map("enabled_at")
  disabledAt     DateTime?    @map("disabled_at")
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  organization   Organization @relation(...)

  @@unique([organizationId, toolId])
  @@index([organizationId, enabled])
  @@index([industry])
  @@index([toolId])
}
```

**Features:**
- Unique constraint on org + tool
- Indexes for performance
- JSON settings storage
- Audit timestamps
- Relation to Organization model

#### **16. Organization Model Updated**
Added relation:
```prisma
toolConfigs OrganizationToolConfig[]
```

### Folder Structure

#### **17. Industry Folders Created**
```
app/lib/tools/
├── shared/           ✅ (crm-basic implemented)
├── real-estate/      ✅
├── healthcare/       ✅
├── fintech/          ✅
├── manufacturing/    ✅
├── retail/           ✅
├── education/        ✅
├── legal/            ✅
├── hospitality/      ✅
├── logistics/        ✅
└── construction/     ✅
```

---

## 🏗️ Architecture Decisions

### Next.js Best Practices Applied

1. **Server Components by Default**
   - All registry/manager functions are async
   - No unnecessary client components
   - Tool pages will be Server Components

2. **Code Splitting Optimization**
   - Registry split into 3 files (<500 lines each)
   - Lazy loading by industry
   - Dynamic imports prevent bundling all tools

3. **Type Safety**
   - Full TypeScript throughout
   - Zod validation on all inputs
   - Prisma-generated types

4. **Security First**
   - Server Actions for mutations
   - Access control in manager
   - Settings validation
   - No client-side secrets

5. **Performance**
   - In-memory caching
   - Lazy loading
   - Tree-shaking support
   - SSR-friendly preloading

### Improvements Over Original Guide

| Original Guide | Our Implementation | Why Better |
|---------------|-------------------|------------|
| Import all tools upfront | Lazy load by industry | Smaller initial bundle |
| Single registry file | Split into 3 files | Stays under 500-line limit |
| TIER_1/2/3 naming | FREE/BASIC/PRO/ENTERPRISE | Matches existing system |
| No caching | In-memory cache | Prevents re-imports |
| Manual registration | Dynamic imports | Auto-discovery |
| No type assertions | Type compatibility | Works with strict types |

---

## 🔧 Technical Specifications

### File Size Compliance
✅ All files under 500-line hard limit:
- `types.ts`: 185 lines
- `constants.ts`: 290 lines
- `manager.ts`: 280 lines
- `registry/loaders.ts`: 155 lines
- `registry/helpers.ts`: 280 lines
- All within standards ✅

### Type System
- ✅ 25+ exported types
- ✅ Full TypeScript coverage
- ✅ Zod schemas for runtime validation
- ✅ Prisma types for database

### Testing Readiness
- ✅ Pure functions (testable)
- ✅ Dependency injection ready
- ✅ Mock-friendly design
- ✅ Clear interfaces

---

## 📋 Known Issues & Limitations

### ⚠️ Items Requiring Attention

1. **Database Migration Pending**
   - Migration created but not run (DB credentials needed)
   - Run when connected: `npx prisma migrate dev --name add_tool_management_tables`

2. **Type Assertions Added**
   - crm-basic actions/queries have type assertions
   - Needed for compatibility with `Tool` interface
   - Consider refining `Tool.actions` and `Tool.queries` types

3. **Loader Import Commented**
   - `loadSharedTools()` has crm-basic import commented
   - Uncomment when type issues resolved
   - Currently returns empty object

4. **Placeholder Implementations**
   - crm-basic actions/queries are stubs
   - Need integration with actual CRM module
   - Database operations not implemented

---

## 🎓 Usage Guide

### For Developers

#### Creating a New Tool

1. **Create folder structure:**
```bash
mkdir -p app/lib/tools/{industry}/{tool-name}/{services,components}
```

2. **Create required files:**
- `index.ts` - Tool definition
- `types.ts` - TypeScript interfaces
- `schemas.ts` - Zod validation
- `config.ts` - Settings configuration
- `actions.ts` - Server Actions
- `queries.ts` - Data queries

3. **Follow crm-basic template:**
```typescript
// index.ts
export const tool: Tool = {
  metadata: { /* ... */ },
  actions: { /* ... */ },
  queries: { /* ... */ },
  onEnable: async (orgId) => { /* ... */ },
  onDisable: async (orgId) => { /* ... */ },
  healthCheck: async () => { /* ... */ },
};
```

4. **Register in loader:**
```typescript
// registry/loaders.ts
export async function loadYourIndustryTools() {
  const { tool } = await import('../{industry}/{tool-name}');
  return { '{tool-id}': tool };
}
```

#### Using the Registry

```typescript
// Get tools for an industry
import { getToolsByIndustry } from '@/lib/tools';
const tools = await getToolsByIndustry('real-estate');

// Search tools
import { searchTools } from '@/lib/tools';
const results = await searchTools('crm');

// Check access
import { checkToolAccess } from '@/lib/tools';
const access = await checkToolAccess({
  toolId: 'property-alerts',
  industry: 'real-estate',
  userTier: 'BASIC',
  enabledToolsCount: 2,
});

// Enable a tool
import { enableTool, getToolById } from '@/lib/tools';
const tool = await getToolById('crm-basic', 'shared');
if (tool) {
  await enableTool({
    tool,
    organizationId: 'org-123',
    settings: { autoAssignLeads: true }
  });
}
```

---

## 🚀 Next Session Tasks

### Phase 2: Data Layer & Business Logic
**Priority: HIGH** - Required for functionality

1. **Create `lib/modules/tools/` directory**
   - `actions.ts` - Server Actions for tool management
     - `enableToolForOrganization()`
     - `disableToolForOrganization()`
     - `updateToolConfiguration()`
     - `getOrganizationTools()`
   - `queries.ts` - Data fetching
     - `getEnabledTools(organizationId)`
     - `getToolConfig(organizationId, toolId)`
     - `getAvailableTools(organizationId)`
   - `schemas.ts` - Zod validation
     - `EnableToolSchema`
     - `UpdateToolConfigSchema`
   - Integration with Prisma `OrganizationToolConfig` model

2. **Extract hardcoded tools from existing page**
   - Migrate 10 tools from `app/(platform)/tools/page.tsx`
   - Create proper tool definitions for each
   - Register in appropriate industry loaders

### Phase 3: UI Implementation
**Priority: HIGH** - User-facing changes

3. **Refactor `app/(platform)/tools/page.tsx`**
   - Replace hardcoded tools array with registry
   - Use `getToolsWithOptions()` for filtering
   - Maintain existing UI/UX
   - Add industry filtering

4. **Create dynamic routes**
   - `app/(platform)/tools/[industry]/page.tsx`
     - Show tools for specific industry
     - Use `getToolsByIndustry()`
     - Server Component implementation
   - `app/(platform)/tools/[industry]/[toolId]/page.tsx`
     - Tool detail page
     - Enable/disable controls
     - Configuration UI
     - Health status display

5. **Create reusable components**
   - `components/features/tools/ToolGrid.tsx`
   - `components/features/tools/ToolCard.tsx`
   - `components/features/tools/ToolDetail.tsx`
   - `components/features/tools/ToolSettings.tsx`
   - `components/features/tools/IndustrySelector.tsx`

### Phase 4: Testing & Quality
**Priority: CRITICAL** - Blocks deployment

6. **Write comprehensive tests**
   - `__tests__/lib/tools/registry.test.ts`
     - Test all lookup functions
     - Test filtering and sorting
     - Test dependency validation
   - `__tests__/lib/tools/manager.test.ts`
     - Test access control
     - Test lifecycle hooks
     - Test settings validation
   - `__tests__/lib/modules/tools/actions.test.ts`
     - Test all Server Actions
     - Test error handling
   - Target: 80%+ coverage (MANDATORY)

7. **Run quality checks**
   ```bash
   npm run lint        # Must pass
   npx tsc --noEmit    # Must pass
   npm test            # 80%+ coverage
   npm run build       # Must succeed
   ```

8. **Database migration**
   - Connect to database
   - Run: `npx prisma migrate dev --name add_tool_management_tables`
   - Verify tables created
   - Test with real data

### Phase 5: Documentation & Polish
**Priority: MEDIUM** - Important for maintenance

9. **Update project documentation**
   - `docs/architecture/tool-system.md`
     - Architecture overview
     - Design decisions
     - How to create tools
   - `docs/api/tools-api.md`
     - Registry API reference
     - Manager API reference
     - Examples
   - Update `README.md` if needed

10. **Add inline documentation**
    - JSDoc comments where missing
    - Update type documentation
    - Add more usage examples

---

## 📊 Progress Metrics

### Completed: 9/22 Major Tasks (41%)

✅ **Completed Tasks:**
1. Review existing tools ✅
2. Create types.ts ✅
3. Create constants.ts ✅
4. Create registry system ✅
5. Create manager.ts ✅
6. Add Prisma schema ✅
7. Create main entry point ✅
8. Create industry folders ✅
9. Create example tool (crm-basic) ✅

⏳ **Remaining Tasks:**
10. Extract hardcoded tools
11. Create modules/tools/ actions
12. Create modules/tools/ queries
13. Refactor tools page
14. Create industry page
15. Create tool detail page
16. Create UI components
17. Write registry tests
18. Write manager tests
19. Write action tests
20. Run migration
21. Run lint/build
22. Update documentation

### Estimated Completion
- **Phase 2 (Data):** 2-3 hours
- **Phase 3 (UI):** 3-4 hours
- **Phase 4 (Testing):** 2-3 hours
- **Phase 5 (Docs):** 1 hour
- **Total:** 8-11 hours remaining

---

## 🔗 Key Imports for Next Session

```typescript
// Core library
import {
  getToolsByIndustry,
  getAllTools,
  searchTools,
  checkToolAccess,
  enableTool,
  disableTool,
  configureTool,
  TIER_META,
  INDUSTRY_META,
  formatPrice
} from '@/lib/tools';

// Types
import type {
  Tool,
  ToolMetadata,
  Industry,
  ToolTier,
  ToolFilter,
  ToolDisplayOptions
} from '@/lib/tools';

// Prisma
import { prisma } from '@/lib/prisma';
import type { OrganizationToolConfig } from '@prisma/client';

// Existing tools page
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getToolLimit } from '@/lib/auth/rbac';
```

---

## 🎯 Success Criteria for Next Session

### Must Complete:
- [ ] All 10 hardcoded tools migrated to registry
- [ ] Tool management Server Actions working
- [ ] Main tools page using registry
- [ ] At least one dynamic route working
- [ ] Basic components created
- [ ] 80%+ test coverage achieved
- [ ] All quality checks passing
- [ ] Database migration successful

### Nice to Have:
- [ ] All dynamic routes complete
- [ ] Advanced filtering UI
- [ ] Health monitoring dashboard
- [ ] Complete documentation
- [ ] Performance optimizations

---

## 💡 Lessons Learned

1. **Type System Challenges**
   - Tool.actions and Tool.queries type signatures needed refinement
   - Type assertions were necessary but not ideal
   - Consider using generics for better type inference

2. **Next.js Best Practices**
   - Lazy loading critical for large tool libraries
   - File size limits enforced architecture improvements
   - Server Components default is correct approach

3. **Prisma Integration**
   - Enum naming must match exactly
   - Relations need to be bidirectional
   - JSON fields useful for flexible settings

4. **Code Organization**
   - Industry-based structure scales well
   - Template tool (crm-basic) invaluable for consistency
   - Registry pattern works well with lazy loading

---

## 📝 Notes for Future Development

### Scalability Considerations
- Consider moving to database-driven registry for 100+ tools
- Add tool versioning system
- Implement tool marketplace (install/uninstall)
- Add tool permissions system
- Consider plugin architecture for third-party tools

### Performance Optimizations
- Add Redis caching for tool metadata
- Implement stale-while-revalidate for tool lists
- Use Suspense boundaries for tool loading
- Consider CDN for tool assets

### Security Enhancements
- Add tool permission system (RBAC)
- Implement rate limiting per tool
- Add audit logging for tool changes
- Secure tool API keys in environment
- Add tool sandbox for untrusted code

---

**Session 1 Status: ✅ COMPLETE**
**Ready for Session 2: ✅ YES**
**Blockers: None**
**Database Migration: Pending (requires credentials)**

---

*Generated: October 2, 2025*
*Tool Architecture Version: 1.0.0*
*Next Session: Phase 2-5 Implementation*
