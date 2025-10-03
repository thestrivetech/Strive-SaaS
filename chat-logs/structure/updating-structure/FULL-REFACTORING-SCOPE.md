# Complete Refactoring Scope - Industry-as-Plugin Architecture

**Status:** Planning Document
**Date:** 2025-10-03

---

## Overview

The refactoring is NOT just about `lib/` - it's a **comprehensive reorganization** of the entire `app/` directory to support the industry-as-plugin architecture.

---

## Scope: What Gets Refactored

### 1. `lib/` Directory ✅ (Documented)

**Current:**
```
lib/
├── modules/
│   ├── crm/
│   ├── projects/
│   ├── ai/
│   └── tasks/
└── tools/
    └── shared/
```

**Target:**
```
lib/
├── modules/              # Core platform (no change)
│   ├── crm/
│   ├── projects/
│   ├── ai/
│   └── tasks/
│
├── industries/           # 🚀 NEW
│   ├── _core/           # Base abstractions
│   ├── healthcare/
│   │   ├── config.ts
│   │   ├── features/
│   │   ├── tools/
│   │   ├── overrides/
│   │   └── types.ts
│   └── real-estate/
│       └── [same structure]
│
└── tools/
    └── shared/          # Universal tools only
```

---

### 2. `components/` Directory 🔥 (NEEDS REFACTORING)

**Current (Disorganized):**
```
components/
├── about/              # ❌ Legacy marketing
├── analytics/          # ❓ Where does this go?
├── assessment/         # ❌ Legacy marketing
├── contact/            # ❌ Legacy marketing
├── features/           # ❌ Flat structure, should be "shared"
│   ├── ai/
│   ├── chatbot/
│   ├── crm/
│   ├── export/
│   ├── organization/
│   ├── projects/
│   ├── shared/
│   └── tasks/
├── filters/            # ❓ Where does this go?
├── industry/           # ❓ Empty? Delete or repurpose?
├── layouts/            # ✅ Keep, move to shared/
├── request/            # ❌ Legacy marketing
├── resources/          # ❌ Legacy marketing
├── seo/                # ❓ Shared utility?
├── shared/             # ❓ What's in here?
├── solutions/          # ❌ Legacy marketing
├── ui/                 # ✅ Keep (shadcn)
└── web/                # ❌ Legacy marketing
```

**Target (Clean & Organized):**
```
components/
├── ui/                        # ✅ shadcn/ui (keep as-is)
│
├── shared/                    # 🔄 RENAMED from "features"
│   ├── crm/                   # Base CRM components
│   ├── projects/              # Base project components
│   ├── tasks/
│   ├── ai/
│   ├── chatbot/
│   ├── organization/
│   ├── export/
│   └── layouts/               # Move layouts/ here
│
├── industries/                # 🚀 NEW: Industry-specific UI
│   ├── healthcare/
│   │   ├── crm/               # Healthcare CRM overrides
│   │   │   ├── patient-card.tsx
│   │   │   └── hipaa-badge.tsx
│   │   ├── tools/
│   │   │   ├── patient-portal.tsx
│   │   │   └── prescription-tracker.tsx
│   │   └── dashboard/
│   │       └── healthcare-metrics.tsx
│   │
│   ├── real-estate/
│   │   ├── crm/
│   │   │   ├── property-card.tsx
│   │   │   └── listing-form.tsx
│   │   └── tools/
│   │       ├── market-analysis.tsx
│   │       └── property-alerts.tsx
│   │
│   └── _shared/               # Patterns shared across industries
│       ├── industry-header.tsx
│       └── metric-card.tsx
│
└── web/                       # ❓ Legacy marketing (consider moving to app/(web)/_components/)
    ├── about/
    ├── contact/
    ├── solutions/
    └── resources/
```

**Actions for Components:**
1. ✅ Keep `components/ui/` as-is (shadcn)
2. 🔄 Rename `components/features/` → `components/shared/`
3. 🔄 Move `components/layouts/` → `components/shared/layouts/`
4. 🚀 Create `components/industries/` structure
5. 🔄 Move industry-specific logic from `shared/` to `industries/[industry]/`
6. 🗑️ Move or delete legacy marketing components (about/, contact/, solutions/, web/)
7. ❓ Audit analytics/, filters/, seo/ - decide if shared or move
8. 🗑️ Delete empty `components/industry/` if truly empty

---

### 3. `app/` Directory (Routes) 🔥 (NEEDS REFACTORING)

**Current:**
```
app/
├── (chatbot)/           # ✅ Keep
├── (platform)/          # ✅ Keep, add industries/
│   ├── dashboard/
│   ├── crm/
│   ├── projects/
│   ├── ai/
│   ├── tools/
│   ├── settings/
│   └── login/
├── (web)/               # ✅ Keep (legacy marketing)
└── api/                 # ✅ Keep
```

**Target:**
```
app/
├── (chatbot)/           # ✅ No change
│
├── (platform)/          # Protected routes
│   ├── dashboard/
│   ├── crm/             # Shared CRM (all industries)
│   ├── projects/        # Shared Projects
│   ├── ai/              # Shared AI
│   ├── tasks/
│   │
│   ├── industries/      # 🚀 NEW: Industry-specific routes
│   │   ├── [industryId]/
│   │   │   ├── layout.tsx        # Industry-specific layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx      # Industry dashboard
│   │   │   ├── tools/
│   │   │   │   └── [toolId]/
│   │   │   │       └── page.tsx  # Industry tool page
│   │   │   ├── crm/              # Industry CRM override
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx      # Industry config
│   │   │
│   │   └── _components/          # Shared industry UI patterns
│   │
│   ├── tools/           # Marketplace tools
│   ├── settings/
│   │   └── industries/  # 🚀 NEW: Enable/disable industries
│   │       └── page.tsx
│   └── login/
│
├── (web)/               # ✅ No change (legacy marketing)
└── api/                 # ✅ No change
```

**Actions for Routes:**
1. 🚀 Create `app/(platform)/industries/[industryId]/` structure
2. 🚀 Create dynamic routes for dashboard, tools, crm, settings
3. 🚀 Add `app/(platform)/settings/industries/` for industry management
4. ✅ Keep existing routes (dashboard, crm, projects, ai, tools, settings)

---

### 4. Database (Prisma Schema) 🔥 (NEEDS UPDATES)

**Actions:**
1. 🚀 Add `industry` field to Organization model
   ```prisma
   enum Industry {
     REAL_ESTATE
     HEALTHCARE
     FINTECH
     MANUFACTURING
     RETAIL
     EDUCATION
     LEGAL
     HOSPITALITY
     LOGISTICS
     CONSTRUCTION
   }

   model Organization {
     industry       Industry
     industryConfig Json
     enabledIndustries IndustryModule[]
   }
   ```

2. 🚀 Add `IndustryModule` model
   ```prisma
   model IndustryModule {
     id             String   @id @default(cuid())
     industryId     String
     organizationId String
     organization   Organization @relation(...)
     settings       Json
     enabledTools   String[]
     createdAt      DateTime @default(now())
     updatedAt      DateTime @updatedAt

     @@unique([industryId, organizationId])
   }
   ```

3. 🚀 Run migration: `npx prisma migrate dev --name add_industry_modules`

---

### 5. Middleware 🔥 (NEEDS UPDATES)

**Actions:**
1. 🔄 Add industry context extraction
2. 🔄 Set `x-industry` header based on org.industry
3. 🔄 Handle industry-specific routing logic
4. 🔄 Validate industry access (if org has industry enabled)

---

### 6. Types 🔥 (NEEDS REFACTORING)

**Current:**
```
lib/types/
├── platform/
├── shared/
└── index.ts
```

**Target:**
```
lib/types/
├── platform/
├── shared/
└── index.ts            # Core types only

lib/industries/[industry]/
└── types.ts            # Industry-specific types co-located
```

**Actions:**
1. ✅ Keep core platform types in `lib/types/`
2. 🔄 Move industry-specific types to `lib/industries/[industry]/types.ts`
3. 🔄 Update imports across codebase

---

## Summary: Full Scope

| Directory | Status | Action Required |
|-----------|--------|-----------------|
| `lib/modules/` | ✅ Stable | No changes needed |
| `lib/industries/` | 🚀 **NEW** | Create entire structure |
| `lib/tools/` | 🔄 Refactor | Organize into `shared/` only |
| `components/ui/` | ✅ Stable | No changes needed |
| `components/features/` | 🔄 Rename | → `components/shared/` |
| `components/industries/` | 🚀 **NEW** | Create entire structure |
| `components/[legacy]` | 🗑️ Clean up | Move or delete marketing components |
| `app/(platform)/` | 🔄 Extend | Add `industries/[industryId]/` routes |
| `prisma/schema.prisma` | 🔄 Update | Add Industry enum, IndustryModule model |
| `middleware.ts` | 🔄 Update | Add industry context logic |
| `lib/types/` | 🔄 Refactor | Move industry types to co-location |

---

## Estimated Sessions

1. **Session 1:** Audit & create `lib/industries/` foundation (registry, _core)
2. **Session 2:** Refactor `components/features/` → `components/shared/`
3. **Session 3:** Create `components/industries/` structure
4. **Session 4:** Create first industry (healthcare) - lib + components
5. **Session 5:** Add dynamic routing `app/(platform)/industries/[industryId]/`
6. **Session 6:** Database migrations (Industry enum, IndustryModule model)
7. **Session 7:** Update middleware for industry context
8. **Session 8:** Migrate existing features to industry-specific implementations
9. **Session 9:** Testing & validation
10. **Session 10:** Documentation & cleanup

---

## Critical Reminders

- **READ BEFORE EDIT** - Always use Read tool
- **SEARCH FIRST** - Use Glob/Grep to check if structures exist
- **TDD APPROACH** - Write tests first
- **80% COVERAGE** - Maintain minimum test coverage
- **500 LINE LIMIT** - Hard limit enforced by ESLint
- **UPDATE, DON'T CREATE** - Prefer editing existing files

---

## Next Steps

1. Update `session1.md` to include full audit (not just `lib/`)
2. Create detailed task breakdown for each session
3. Start Session 1 with comprehensive audit
