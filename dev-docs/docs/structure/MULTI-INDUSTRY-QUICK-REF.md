# Multi-Industry Architecture - Quick Reference

**For detailed plan, see:** [MULTI-INDUSTRY-ARCHITECTURE.md](./MULTI-INDUSTRY-ARCHITECTURE.md)

---

## User Requirements (Summary)

- Each company is **industry-specific** (real estate, healthcare, fintech, etc.)
- Each industry has **specific modules/dashboards and tools**
- Consider **"hosting separate apps"** for compute/hosting cost optimization
- Need **complete modularity** with shared functions and features
- **Core modules** (CRM, Projects, AI) are common but may differ per industry/company
- **General tools** for all + **industry-specific tools**
- Build **foundation that scales** without constant restructuring

---

## Chosen Architecture: Industry-Namespaced Monolith

**Directory Structure:**
```
lib/
├── core/          # Core utilities (auth, DB, types)
├── shared/        # Cross-industry (base modules, universal tools)
│   ├── modules/   # Base: CRM, Projects, AI
│   └── tools/     # Universal: ROI calc, Invoice gen
└── industries/    # Industry-specific
    ├── real-estate/
    │   ├── modules/crm/      # RE CRM extensions
    │   ├── modules/properties/  # RE-only module
    │   └── tools/mls-integration/
    ├── healthcare/
    └── fintech/
```

---

## Pattern: Base + Extensions

**Shared base:**
```typescript
// lib/shared/modules/crm/base.ts
export const baseCRMActions = { ... };
```

**Industry extensions:**
```typescript
// lib/industries/real-estate/modules/crm/extensions.ts
import { baseCRMActions } from '@/lib/shared/modules/crm/base';

export const realEstateCRMActions = {
  ...baseCRMActions,
  createCustomer: async (data) => {
    const enhanced = await addPropertyData(data);
    return baseCRMActions.createCustomer(enhanced);
  },
  attachProperty: async (customerId, propertyId) => { ... },
};
```

---

## Database Change

```prisma
model Organization {
  industry       Industry  # NEW: REAL_ESTATE | HEALTHCARE | FINTECH
  industryConfig Json      # NEW: industry-specific settings
}
```

---

## Migration Path

**Phase 1: Industry-Namespaced Monolith** (START HERE)
- Single Next.js app
- Industry-scoped code organization
- Dynamic loading based on org.industry
- Sufficient for 95% of needs

**Phase 2: Multi-App Split** (LATER, IF NEEDED)
- Separate Next.js apps per industry
- Shared code via NPM packages
- Deploy on industry subdomains
- When: 5+ industries OR regulatory isolation needed

---

## Implementation Checklist

**Phase 1 - Core Restructuring:**
- [ ] Add `industry` field to Organization model
- [ ] Create `lib/core/`, `lib/shared/`, `lib/industries/` structure
- [ ] Refactor current modules to `lib/shared/modules/` as "base"
- [ ] Create industry registry (`lib/industries/registry.ts`)
- [ ] Update middleware for industry context
- [ ] Build first industry extension (real-estate) as proof

**Phase 1 - First Industry (Real Estate):**
- [ ] Create `lib/industries/real-estate/` structure
- [ ] Extend CRM module for RE (properties, agents)
- [ ] Add RE-specific module (`properties/`)
- [ ] Add RE-specific tools (MLS, Property Alerts)
- [ ] Test industry switching

**Phase 2 - When Needed:**
- [ ] Extract to monorepo
- [ ] Create industry-specific Next.js apps
- [ ] Deploy separately per industry

---

## Key Decisions

| What | Decision | Why |
|------|----------|-----|
| Starting point | Monolith | Faster, simpler, sufficient |
| Split trigger | 5+ industries OR regulatory | Cost justified |
| Module pattern | Base + Extensions | Reusability + customization |
| Tool organization | Shared + Industry-specific | Clear separation |

---

## Next Steps

1. **Review** [MULTI-INDUSTRY-ARCHITECTURE.md](./MULTI-INDUSTRY-ARCHITECTURE.md) for full details
2. **Start** with Phase 1 database changes
3. **Prototype** real-estate industry extension
4. **Document** patterns for adding new industries
