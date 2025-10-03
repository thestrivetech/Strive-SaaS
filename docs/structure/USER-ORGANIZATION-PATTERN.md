# User's Organization Pattern - Route Group Architecture

**Date:** 2025-10-03
**Status:** Documentation of user's preferred structure
**Purpose:** Define the organizational pattern to follow for refactoring

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

### Issue 2: Mixed Component Locations
Some components still in old locations from before refactoring:
- `components/(web)/features/` - Should these move to `(platform)/`?
- `components/(web)/layouts/` - Platform layouts or web layouts?

---

## ✅ What Needs to Happen

### Phase 1: Create Shared Route Group & Relocate UI ✨
1. **Create `components/(shared)/` directory:**
   ```bash
   mkdir -p components/(shared)/ui
   ```

2. **Move shadcn/ui components:**
   ```
   FROM: components/(web)/ui/
   TO:   components/(shared)/ui/
   ```

3. **Update all imports:**
   ```typescript
   // FROM (current - wrong)
   import { Button } from '@/components/(web)/ui/button';

   // TO (new - correct)
   import { Button } from '@/components/(shared)/ui/button';
   ```

4. **Add other shared components:**
   ```
   components/(shared)/
   ├── ui/                     # shadcn components
   ├── error-fallback.tsx      # Generic error handling
   ├── loading-spinner.tsx     # Generic loading states
   └── ...
   ```

### Phase 2: Align lib/industries/ with Component Structure
The `lib/industries/` structure needs to align with `components/(platform)/[industry]/`:

```
lib/industries/
├── _core/              ✅ Exists
├── registry.ts         ✅ Exists
├── healthcare/         ✅ Exists
│   ├── config.ts
│   ├── types.ts
│   ├── index.ts
│   ├── features/
│   ├── tools/
│   └── overrides/
│       └── crm/        ⚠️ Should align with components/(platform)/healthcare/
│
└── real-estate/        ✅ Exists
    ├── config.ts
    ├── types.ts
    ├── index.ts
    ├── features/
    ├── tools/
    └── overrides/
        ├── crm/        ⚠️ Should align with components/(platform)/real-estate/crm/
        └── tasks/      ⚠️ Should align with components/(platform)/real-estate/tasks/
```

**Alignment Strategy:**
- `lib/industries/[industry]/overrides/crm/` → Server-side logic
- `components/(platform)/[industry]/crm/` → UI components
- Both work together for industry-specific CRM customization

### Phase 3: Complete Industry Skeletons

For each industry in `components/(platform)/[industry]/`, ensure:

1. **Matching overrides in `lib/industries/[industry]/overrides/`**
   ```
   lib/industries/real-estate/overrides/
   ├── crm/
   │   ├── actions.ts      # Server actions
   │   ├── queries.ts      # Data fetching
   │   └── schemas.ts      # Validation
   └── tasks/
       ├── actions.ts
       ├── queries.ts
       └── schemas.ts
   ```

2. **Component-logic pairing:**
   - `components/(platform)/real-estate/crm/` ← UI
   - `lib/industries/real-estate/overrides/crm/` ← Logic

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

### Phase 5: Clean Up Legacy Locations

1. **Remove empty directories:**
   - Old `components/features/` (if empty after migration)
   - Old `components/layouts/` (if moved to route groups)

2. **Verify no cross-context imports:**
   - Platform components shouldn't import from `(web)/`
   - Web components shouldn't import from `(platform)/`
   - Shared resources should be at root or `(shared)/`

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

### Immediate Actions (Session 2)
- [ ] Move `components/(web)/ui/` to `components/ui/` or `components/(shared)/ui/`
- [ ] Update all UI imports across the codebase
- [ ] Verify platform components don't import from `(web)/` except UI
- [ ] Document the finalized import patterns

### Short-term Actions (Session 3-4)
- [ ] Complete industry component skeletons
- [ ] Create matching `lib/industries/[industry]/overrides/` for each component folder
- [ ] Align data structure with component structure
- [ ] Create comprehensive examples

### Long-term Actions (Session 5+)
- [ ] Migrate all legacy components to route group structure
- [ ] Remove old component locations
- [ ] Update all documentation
- [ ] Create component generator scripts

---

## 🚀 Next Steps

1. **Finalize UI location decision:**
   - Choose between `components/ui/` or `components/(shared)/ui/`
   - Update SESSION1-COMPLETE.md with decision

2. **Create Session 2 plan:**
   - Focus on UI relocation
   - Update all imports
   - Verify no cross-context dependencies

3. **Document import patterns:**
   - Create import style guide
   - Add ESLint rules to enforce patterns
   - Update tsconfig.json path aliases if needed

---

## 📚 Related Documentation

- [SESSION1-COMPLETE.md](../../chat-logs/structure/updating-structure/SESSION1-COMPLETE.md) - Industry foundation
- [STRUCTURE-OVERVIEW-1.md](./STRUCTURE-OVERVIEW-1.md) - Industry-as-plugin architecture
- [TYPES-GUIDE.md](./TYPES-GUIDE.md) - Type system organization
- [tools-guide.md](./tools-guide.md) - Tool system organization

---

**Last Updated:** 2025-10-03
**Documented By:** Claude (based on user's structural changes)
