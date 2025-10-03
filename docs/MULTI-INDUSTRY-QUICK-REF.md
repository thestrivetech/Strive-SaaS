# Multi-Industry Architecture - Quick Reference

**Primary Documentation:** [STRUCTURE-OVERVIEW-1.md](./structure/STRUCTURE-OVERVIEW-1.md)
**Future Evolution:** [MULTI-INDUSTRY-ARCHITECTURE.md](./structure/MULTI-INDUSTRY-ARCHITECTURE.md)

---

## Current Architecture (Phase 1)

**Industry-as-Plugin Monolith**

```
lib/
├── modules/       # Core platform (CRM, Projects, AI, Tasks)
├── industries/    # Industry-specific extensions
│   └── [industry]/
│       ├── config.ts      # Industry metadata
│       ├── features/      # Industry-specific features
│       ├── tools/         # Industry-specific tools (MLS, Patient Portal, etc.)
│       └── overrides/     # Module customizations (CRM with HIPAA, etc.)
└── tools/
    └── shared/    # Universal marketplace tools (ROI calc, Invoice gen, etc.)
```

**Key Distinction:**
- **Industry tools** → `lib/industries/[industry]/tools/` (co-located with industry)
- **Shared tools** → `lib/tools/shared/` (universal, cross-industry)

**Key Pattern:**
```typescript
// Base module
// lib/modules/crm/actions.ts
export const baseCRMActions = { ... };

// Industry extension
// lib/industries/healthcare/overrides/crm/actions.ts
export const healthcareCRMActions = {
  ...baseCRMActions,
  createCustomer: async (data) => {
    await validateHIPAA(data);
    return baseCRMActions.createCustomer(data);
  },
};
```

---

## Database Schema

```prisma
model Organization {
  industry         Industry       # NEW: enum field
  industryConfig   Json           # NEW: industry settings
  enabledIndustries IndustryModule[]
}

model IndustryModule {
  industryId     String
  organizationId String
  settings       Json
  enabledTools   String[]
}

enum Industry {
  REAL_ESTATE | HEALTHCARE | FINTECH | MANUFACTURING
  RETAIL | EDUCATION | LEGAL | HOSPITALITY | LOGISTICS | CONSTRUCTION
}
```

---

## Implementation Checklist

**Phase 1 (Current - Start Here):**
- [ ] Add `industry` field to Organization model
- [ ] Create `lib/industries/` structure
- [ ] Build industry registry (`lib/industries/registry.ts`)
- [ ] Add dynamic routing (`app/(platform)/industries/[industryId]/`)
- [ ] Implement first industry (healthcare or real-estate)
- [ ] Update middleware for industry context

**Phase 2 (Future - When Needed):**
- See [MULTI-INDUSTRY-ARCHITECTURE.md](./structure/MULTI-INDUSTRY-ARCHITECTURE.md) for multi-app evolution

---

## When to Evolve to Multi-App

**Stay with monolith if:**
- ✅ <5 active industries
- ✅ <10,000 monthly users
- ✅ Compute costs <$500/month
- ✅ No regulatory isolation needed

**Migrate to multi-app when:**
- ⚠️ 5-10+ active industries
- ⚠️ 10,000+ monthly users
- ⚠️ Compute costs >$500/month per industry
- ⚠️ HIPAA/SOC2 requires isolation

---

## Key Resources

| Document | Purpose |
|----------|---------|
| [STRUCTURE-OVERVIEW-1.md](./structure/STRUCTURE-OVERVIEW-1.md) | **Primary architecture (use this)** |
| [MULTI-INDUSTRY-ARCHITECTURE.md](./structure/MULTI-INDUSTRY-ARCHITECTURE.md) | Future evolution path |
| [CLAUDE.md](../CLAUDE.md) | Development standards |

---

## Quick Start

1. Read [STRUCTURE-OVERVIEW-1.md](./structure/STRUCTURE-OVERVIEW-1.md)
2. Implement Phase 1 (industry-as-plugin)
3. Add industries as needed
4. When scale demands it, reference [MULTI-INDUSTRY-ARCHITECTURE.md](./structure/MULTI-INDUSTRY-ARCHITECTURE.md) for Phase 2
