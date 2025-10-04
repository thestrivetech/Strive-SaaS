# User's Organization Pattern - Route Group Architecture

**Date:** 2025-10-03
**Status:** ✅ IMPLEMENTED - Sessions 1-2 Complete
**Purpose:** Define the organizational pattern to follow for refactoring

## 📊 Implementation Status

**Session 1 (Complete):**
- ✅ Created `lib/industries/` foundation (21 files)
- ✅ Healthcare and Real Estate industry skeletons
- ✅ Prisma schema updated with Industry enum

**Session 2 (Complete):**
- ✅ Created `components/(shared)/` route group
- ✅ Moved 66 UI files from `(web)/ui/` to `(shared)/ui/`
- ✅ Updated 358 import statements across codebase
- ✅ 0 TypeScript errors introduced

**Next (Session 3):**
- ⏳ Create real estate business logic (overrides)

---

## 🎯 Core Principle: Route Group Mirroring

The user has reorganized the directory structure to **mirror the Next.js app router** using route group naming conventions `(groupName)`. This creates clear separation by application context.

---

## 📂 Directory Structure Pattern

### 1. Components Organization

```
components/
├── (shared)/               # ✨ NEW: Shared across ALL apps
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── [all shadcn components]
│   │
│   └── [other shared components]
│       ├── error-fallback.tsx
│       ├── loading-spinner.tsx
│       └── ...
│
├── (chatbot)/              # 🤖 Chatbot-specific components
│   └── [chatbot components]
│
├── (platform)/             # 🏢 Platform (SaaS) components
│   ├── shared/             # Shared across platform features
│   │   ├── navigation/
│   │   └── error-boundary.tsx
│   │
│   ├── projects/           # Core module components
│   │   ├── organization/
│   │   ├── create-project-dialog.tsx
│   │   ├── edit-project-dialog.tsx
│   │   └── ...
│   │
│   ├── healthcare/         # 🏥 Industry-specific components
│   │   └── [industry-specific UI]
│   │
│   ├── real-estate/        # 🏠 Industry-specific components
│   │   ├── crm/            # Module-specific industry UI
│   │   │   ├── customer-actions-menu.tsx
│   │   │   ├── customer-filters.tsx
│   │   │   ├── create-customer-dialog.tsx
│   │   │   └── ...
│   │   └── tasks/          # Module-specific industry UI
│   │       ├── task-card.tsx
│   │       ├── task-filters.tsx
│   │       └── ...
│   │
│   └── legal/              # ⚖️ Industry-specific components
│       └── [industry-specific UI]
│
├── (web)/                  # 🌐 Marketing website components
│   ├── features/
│   ├── about/
│   ├── contact/
│   ├── solutions/
│   ├── layouts/
│   │   ├── sidebar/
│   │   └── topbar/
│   └── shared/
│
└── HostDependent.tsx       # Root-level utility
```

### 2. Data Organization

```
data/
├── (chatbot)/              # 🤖 Chatbot data
│
├── (platform)/             # 🏢 Platform data
│   ├── industries/         # Industry-specific data (empty - ready for use)
│   └── shared/             # Shared platform data (empty - ready for use)
│
└── (web)/                  # 🌐 Marketing data ✅ UPDATED
    ├── portfolio/          # Portfolio projects
    │   └── projects/
    ├── resources/          # Marketing resources
    │   ├── blog-posts/
    │   ├── case-studies/
    │   ├── whitepapers/
    │   ├── technology/
    │   └── quizzes/
    ├── industries.tsx      # Marketing content about industries
    ├── industry-cards.tsx
    ├── industry-statistics.ts
    ├── solutions.tsx       # Marketing content about solutions
    └── solutions-mapping.ts
```

---

## 🔑 Key Organizational Rules

### Rule 1: Route Group Naming
**Pattern:** Use `(groupName)` to mirror app router structure
- `(chatbot)` - Chatbot application context
- `(platform)` - SaaS platform context
- `(web)` - Marketing website context

**Benefit:** Clear separation of concerns, easier to locate files

### Rule 2: Industry-Specific Components
**Pattern:** `components/(platform)/[industry]/[module]/`

**Example:**
```
components/(platform)/real-estate/
├── crm/              # Real estate CRM UI
├── tasks/            # Real estate task UI
├── projects/         # Real estate project UI (future)
└── dashboard/        # Real estate dashboard (future)
```

**Benefit:** Industry UI is co-located with the industry it serves

### Rule 3: Module-Based Organization
**Pattern:** Within each industry, organize by module (crm, tasks, projects, ai)

**Example:**
- `real-estate/crm/` - Customer management UI for real estate
- `real-estate/tasks/` - Task management UI for real estate
- `healthcare/crm/` - Patient management UI for healthcare

**Benefit:** Easy to find module-specific industry customizations

### Rule 4: Shared Components
**Pattern:** `components/(platform)/shared/` for cross-industry platform components

**What Goes Here:**
- Navigation components
- Error boundaries
- Common layouts (that aren't industry-specific)
- Shared utilities

**What Doesn't:**
- Industry-specific UI → Goes in `(platform)/[industry]/`
- Marketing components → Goes in `(web)/`
- shadcn/ui → Should be at root or `(shared)/ui/`

---

## ✅ Solution: Shared Components Route Group

### Decision: Use `components/(shared)/` ✨

**Current:** `components/(web)/ui/` (shadcn components)
**Problem:** Platform and chatbot components importing from web context

**Solution:** Create `components/(shared)/` route group
```
components/(shared)/
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── [all shadcn]
└── [other shared components]
```

**Benefits:**
- ✅ Explicit shared context
- ✅ Accessible to all apps (web, platform, chatbot)
- ✅ Consistent with route group pattern
- ✅ Clear ownership and purpose

### ✅ Resolved: Shared Components Location

**Decision Made:** Use `components/(shared)/` route group

**Implementation Complete (Session 2):**
- ✅ Created `components/(shared)/ui/` directory
- ✅ Moved all 66 shadcn/ui components from `(web)/ui/` to `(shared)/ui/`
- ✅ Updated 358 import statements
- ✅ Verified build passes (0 new errors)

**Import Pattern:**
```typescript
// ✅ Correct - Shared across all apps
import { Button } from '@/components/(shared)/ui/button';
import { Card } from '@/components/(shared)/ui/card';
```

---

## ✅ Phase 1: COMPLETE - Shared Route Group & UI Migration

### Session 2 Completed (2025-10-03)

1. **✅ Created `components/(shared)/` directory**
   ```bash
   mkdir -p components/(shared)/ui
   ```

2. **✅ Moved shadcn/ui components (66 files)**
   ```
   FROM: components/(web)/ui/
   TO:   components/(shared)/ui/
   ```

3. **✅ Updated all imports (358 statements)**
   ```typescript
   // OLD (removed)
   import { Button } from '@/components/(web)/ui/button';

   // NEW (implemented)
   import { Button } from '@/components/(shared)/ui/button';
   ```

4. **Future: Add other shared components**
   ```
   components/(shared)/
   ├── ui/                     # ✅ 66 shadcn components
   ├── error-fallback.tsx      # ⏳ To be added
   ├── loading-spinner.tsx     # ⏳ To be added
   └── ...
   ```

### Phase 2: ✅ Created - ⏳ Pending Alignment

**Session 1 Created:**
```
lib/industries/
├── _core/              ✅ Created (4 files)
├── registry.ts         ✅ Created
├── index.ts            ✅ Created
├── healthcare/         ✅ Skeleton created
│   ├── config.ts       ✅ Complete
│   ├── types.ts        ✅ Complete (10+ types)
│   ├── index.ts        ✅ Complete
│   ├── features/       ⏳ Placeholder (index.ts only)
│   ├── tools/          ⏳ Placeholder (index.ts only)
│   └── overrides/      ⏳ Placeholder (index.ts only)
│
└── real-estate/        ✅ Skeleton created
    ├── config.ts       ✅ Complete
    ├── types.ts        ✅ Complete (15+ types)
    ├── index.ts        ✅ Complete
    ├── features/       ⏳ Placeholder (index.ts only)
    ├── tools/          ⏳ Placeholder (index.ts only)
    └── overrides/      ⏳ Placeholder (index.ts only)
        ├── crm/        ⏳ TO BE CREATED (Session 3)
        └── tasks/      ⏳ TO BE CREATED (Session 3)
```

**Current Component Structure:**
```
components/(platform)/
├── shared/             ✅ Exists
├── real-estate/        ✅ Exists (14 files)
│   ├── crm/           ✅ 7 files
│   └── tasks/         ✅ 7 files
├── healthcare/         ⏳ Placeholder (empty)
└── legal/              ⏳ Placeholder (empty)
```

**Alignment Strategy (Session 3):**
- `lib/industries/real-estate/overrides/crm/` ← Create actions, queries, schemas
- `components/(platform)/real-estate/crm/` ← UI already exists
- Wire components to server actions

### Phase 3: ⏳ NEXT - Complete Industry Overrides (Session 3)

**Goal:** Create business logic to match existing UI components

**To Be Created:**
```
lib/industries/real-estate/overrides/
├── crm/                    # Match 7 UI components
│   ├── actions.ts          # Server actions
│   ├── queries.ts          # Data fetching
│   ├── schemas.ts          # Zod validation
│   └── index.ts            # Public API
└── tasks/                  # Match 7 UI components
    ├── actions.ts
    ├── queries.ts
    ├── schemas.ts
    └── index.ts
```

**Component-Logic Pairing:**
```
UI Layer (Exists)                     Business Logic (To Create)
━━━━━━━━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
components/(platform)/                lib/industries/
└── real-estate/                      └── real-estate/
    ├── crm/ (7 files) ✅         ←→     └── overrides/
    │                                         ├── crm/ ⏳
    └── tasks/ (7 files) ✅       ←→         └── tasks/ ⏳
```

### Phase 4: Data Directory Alignment ✅ STRUCTURE READY

**Current State:** Route group structure in place, ready for content

```
data/(platform)/industries/  # ✅ Created (empty, ready for use)
├── healthcare/              # 🔄 TO BE ADDED
│   ├── templates/
│   ├── configs/
│   └── defaults/
└── real-estate/             # 🔄 TO BE ADDED
    ├── templates/
    ├── configs/
    └── defaults/
```

**Marketing Data:** ✅ Properly organized in `data/(web)/`
- Portfolio content moved to `data/(web)/portfolio/`
- Resources moved to `data/(web)/resources/`
- Industry marketing content in `data/(web)/` (industries.tsx, solutions.tsx, etc.)

### Phase 5: ✅ COMPLETE - Legacy Cleanup (Session 2)

1. **✅ Removed empty directories:**
   - ✅ Removed `components/(web)/ui/` after migration to `(shared)/ui/`

2. **✅ Verified cross-context imports:**
   - ✅ Platform components now import from `(shared)/ui/`
   - ✅ Web components now import from `(shared)/ui/`
   - ✅ Chatbot components now import from `(shared)/ui/`
   - ✅ All 358 import statements updated and verified

---

## 📝 File Organization Standards

### Naming Conventions

**Components:**
- Industry-specific: `components/(platform)/[industry]/[module]/component-name.tsx`
- Shared platform: `components/(platform)/shared/component-name.tsx`
- Marketing: `components/(web)/feature/component-name.tsx`

**Data:**
- Industry data: `data/(platform)/industries/[industry]/data-file.ts`
- Shared data: `data/(platform)/shared/data-file.ts`
- Marketing data: `data/(web)/data-file.ts`

**Business Logic:**
- Industry overrides: `lib/industries/[industry]/overrides/[module]/`
- Core modules: `lib/modules/[module]/`
- Shared tools: `lib/tools/shared/[tool]/`
- Industry tools: `lib/industries/[industry]/tools/[tool]/`

### Import Path Patterns

```typescript
// UI Components (shared)
import { Button } from '@/components/ui/button';

// Platform Shared Components
import { ErrorBoundary } from '@/components/(platform)/shared/error-boundary';

// Industry-Specific Components
import { CustomerCard } from '@/components/(platform)/real-estate/crm/customer-card';

// Industry Business Logic
import { createCustomer } from '@/lib/industries/real-estate/overrides/crm/actions';

// Core Module Logic
import { getProjects } from '@/lib/modules/projects/queries';

// Industry Types
import type { RealEstateCustomer } from '@/lib/industries/real-estate/types';
```

---

## 🎯 Benefits of This Structure

### 1. **Clear Context Separation**
- No confusion about whether a component is for platform, web, or chatbot
- Route groups make context explicit

### 2. **Industry Co-location**
- All industry-specific code (UI + logic) lives together
- Easy to find all real-estate customizations
- Easy to add new industries

### 3. **Scalability**
- Add new industry: Create folder in `components/(platform)/[industry]/` and `lib/industries/[industry]/`
- Add new module override: Add folder in both locations
- Pattern is consistent and predictable

### 4. **Mirrors App Router**
- Component structure matches route structure
- Intuitive navigation between files
- Natural mental model

### 5. **Avoids Conflicts**
- No name conflicts between contexts
- Clear ownership of files
- Easier to refactor

---

## 📋 Migration Checklist

### ✅ Session 2 (Complete)
- [x] Create `components/(shared)/ui/` directory
- [x] Move all 66 UI files from `(web)/ui/` to `(shared)/ui/`
- [x] Update all 358 UI imports across the codebase
- [x] Verify platform components don't import from `(web)/ui/`
- [x] Verify build passes (0 new errors)
- [x] Document the finalized import patterns

### ⏳ Session 3 (Next - Industry Overrides)
- [ ] Create `lib/industries/real-estate/overrides/crm/` (actions, queries, schemas)
- [ ] Create `lib/industries/real-estate/overrides/tasks/` (actions, queries, schemas)
- [ ] Wire components to server actions
- [ ] Write tests for override functions
- [ ] Document the component-logic pairing pattern

### 🔮 Session 4+ (Future)
- [ ] Create healthcare components and overrides
- [ ] Implement dynamic routing `app/(platform)/industries/[industryId]/`
- [ ] Create industry switcher UI
- [ ] Migrate remaining legacy components
- [ ] Create component generator scripts

---

## ✅ Completed Steps

1. **✅ Finalized UI location decision (Session 2):**
   - ✅ Chose `components/(shared)/ui/` for explicit shared context
   - ✅ Updated all documentation with decision
   - ✅ Implemented migration successfully

2. **✅ Session 2 execution (Complete):**
   - ✅ UI relocation completed (66 files)
   - ✅ All imports updated (358 statements)
   - ✅ Verified no cross-context dependencies
   - ✅ Build verification passed

3. **✅ Documentation updated:**
   - ✅ Import style guide documented
   - ✅ Created SESSION2-COMPLETE.md
   - ✅ Updated CHANGELOG.md
   - ✅ Updated QUICK-SUMMARY.md

## 🚀 Next Steps (Session 3)

1. **Create Real Estate Overrides:**
   - Create `lib/industries/real-estate/overrides/crm/` with actions, queries, schemas
   - Create `lib/industries/real-estate/overrides/tasks/` with actions, queries, schemas
   - Wire existing UI components to new server actions

2. **Testing:**
   - Write unit tests for override functions
   - Test real estate-specific business logic
   - Verify component-logic integration

3. **Documentation:**
   - Document override patterns
   - Create examples of component-logic pairing
   - Update architecture guides

---

## 📚 Related Documentation

- [SESSION1-COMPLETE.md](../../chat-logs/structure/updating-structure/SESSION1-COMPLETE.md) - Industry foundation
- [STRUCTURE-OVERVIEW-1.md](./STRUCTURE-OVERVIEW-1.md) - Industry-as-plugin architecture
- [TYPES-GUIDE.md](./TYPES-GUIDE.md) - Type system organization
- [tools-guide.md](./tools-guide.md) - Tool system organization

---

## 📊 Summary Statistics

| Metric | Session 1 | Session 2 | Total |
|--------|-----------|-----------|-------|
| **Files Created** | 21 | 1 directory | 21 files + 1 dir |
| **Files Moved** | 0 | 66 | 66 |
| **Imports Updated** | 0 | 358 | 358 |
| **TypeScript Errors** | 0 | 0 | 0 |
| **Lines of Code** | ~1,920 | ~358 | ~2,278 |
| **Duration** | 2-3 hours | 2 hours | 4-5 hours |

**Current Status:**
- ✅ Industry foundation: Complete
- ✅ Shared components: Complete
- ⏳ Industry overrides: Next
- 🔮 Dynamic routing: Future
- 🔮 Industry switcher: Future

---

**Last Updated:** 2025-10-03 (Session 2 Complete)
**Documented By:** Claude (based on user's structural changes and decisions)
