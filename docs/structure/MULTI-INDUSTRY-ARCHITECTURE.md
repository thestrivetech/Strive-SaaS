# Multi-Industry SaaS Platform - Future Evolution Strategy

**Created:** 2025-10-03
**Status:** ACTIVE - Future Planning Document
**Primary Architecture:** See [STRUCTURE-OVERVIEW-1.md](./STRUCTURE-OVERVIEW-1.md)

---

## Purpose

This document outlines the **future evolution path** for scaling beyond the initial industry-namespaced monolith architecture. For the current implementation plan, see [STRUCTURE-OVERVIEW-1.md](./STRUCTURE-OVERVIEW-1.md).

---

## Current Architecture (Phase 1)

**As defined in STRUCTURE-OVERVIEW-1.md:**

```
lib/
├── modules/       # Core platform modules (CRM, Projects, AI)
├── industries/    # Industry extensions (healthcare, real-estate, etc.)
│   └── [industry]/
│       ├── config.ts
│       ├── features/
│       ├── tools/
│       └── overrides/
└── tools/         # Marketplace tools
```

**Characteristics:**
- Single Next.js application
- Industry-as-plugin architecture
- Dynamic routing via `app/(platform)/industries/[industryId]/`
- All industries deployed together
- Shared compute resources

**When to use:** Start here. Sufficient for 95% of use cases.

---

## Future Evolution: Multi-App Monorepo (Phase 2)

### When to Migrate

**Triggers:**
- ✅ **Cost optimization:** Compute costs exceed $500/month per industry
- ✅ **Regulatory isolation:** HIPAA, SOC2, or other compliance requires data/compute separation
- ✅ **Scale characteristics:** Different industries have vastly different traffic patterns
- ✅ **Performance needs:** Industry-specific optimizations (e.g., real-time vs batch processing)
- ✅ **Industry count:** 5-10+ active industries with distinct user bases

**Break-even analysis:**
- Single app hosting: ~$50-200/month total
- Multi-app hosting: ~$50/month × N industries
- Multi-app becomes cost-effective at 5-10 industries OR when regulatory isolation is required

---

### Target Architecture

```
strive-saas/                    # Monorepo root
├── apps/
│   ├── platform-core/          # Shared authentication, org management
│   │   ├── app/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── industry-real-estate/   # RE-specific Next.js app
│   │   ├── app/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── industry-healthcare/    # HC-specific Next.js app
│   │   └── (same structure)
│   │
│   └── industry-fintech/       # FT-specific Next.js app
│       └── (same structure)
│
├── packages/                   # Shared NPM packages
│   ├── shared-modules/         # @strivetech/shared-modules
│   │   ├── crm/
│   │   ├── projects/
│   │   └── ai/
│   │
│   ├── shared-tools/           # @strivetech/shared-tools
│   │   ├── roi-calculator/
│   │   └── invoice-generator/
│   │
│   ├── ui-components/          # @strivetech/ui
│   │   └── shadcn components
│   │
│   └── core-types/             # @strivetech/types
│       └── shared types
│
├── package.json                # Root package.json
├── turbo.json                  # Turborepo config
└── pnpm-workspace.yaml         # Workspace config
```

---

### Benefits of Multi-App Architecture

| Aspect | Benefit |
|--------|---------|
| **Compute isolation** | Pay only for resources each industry uses |
| **Bundle size** | 500KB-1MB per industry vs 2-5MB monolith |
| **Deployment** | Deploy industries independently |
| **Scaling** | Scale healthcare separately from real estate |
| **Regional optimization** | Deploy healthcare US-only (HIPAA), RE globally |
| **Performance** | Industry-specific optimizations (edge functions, caching) |

---

### Migration Strategy

#### Step 1: Extract Shared Code (Week 1-2)

**Create NPM packages:**
```bash
# In monorepo packages/
mkdir -p packages/shared-modules
mkdir -p packages/shared-tools
mkdir -p packages/ui-components
mkdir -p packages/core-types

# Extract current lib/modules/ → packages/shared-modules/
# Extract current lib/tools/ → packages/shared-tools/
# Extract current components/ui/ → packages/ui-components/
# Extract current lib/types/ → packages/core-types/
```

**Package structure:**
```json
// packages/shared-modules/package.json
{
  "name": "@strivetech/shared-modules",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./crm": "./dist/crm/index.js",
    "./projects": "./dist/projects/index.js",
    "./ai": "./dist/ai/index.js"
  }
}
```

#### Step 2: Create Industry Apps (Week 3-4)

**For each industry:**
```bash
# Create app structure
mkdir -p apps/industry-real-estate/{app,lib,components}

# Install dependencies
cd apps/industry-real-estate
npm install @strivetech/shared-modules @strivetech/ui

# Configure next.config.js for monorepo
```

**Import shared code:**
```typescript
// apps/industry-real-estate/lib/crm/actions.ts
import { baseCRMActions } from '@strivetech/shared-modules/crm';

export const realEstateCRMActions = {
  ...baseCRMActions,
  attachProperty: async (customerId, propertyId) => { /* ... */ },
};
```

#### Step 3: Configure Monorepo Tooling (Week 4)

**Turborepo config:**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**"]
    },
    "dev": {
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Run commands:**
```bash
# Build all apps
turbo build

# Dev mode (all apps)
turbo dev

# Build specific industry
turbo build --filter=industry-real-estate
```

#### Step 4: Update Deployment (Week 5)

**Deploy to subdomains:**
- `app.strivetech.ai` → platform-core (auth, org management)
- `re.app.strivetech.ai` → industry-real-estate
- `hc.app.strivetech.ai` → industry-healthcare
- `ft.app.strivetech.ai` → industry-fintech

**Vercel configuration:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    { "src": "apps/platform-core/package.json", "use": "@vercel/next" },
    { "src": "apps/industry-real-estate/package.json", "use": "@vercel/next" },
    { "src": "apps/industry-healthcare/package.json", "use": "@vercel/next" }
  ]
}
```

#### Step 5: Migrate Users Gradually (Week 6+)

**Strategy:**
1. Deploy both architectures in parallel
2. Route new organizations to industry-specific apps
3. Migrate existing orgs gradually (by industry)
4. Monitor performance and costs
5. Decommission monolith after 90 days

---

### Shared Authentication Strategy

**Cross-app authentication:**
```typescript
// Shared session across subdomains
// Use shared JWT tokens with domain=.app.strivetech.ai

// platform-core: Issues JWT
const token = signJWT({ userId, orgId, industry });
res.setHeader('Set-Cookie', `session=${token}; Domain=.app.strivetech.ai`);

// industry apps: Validate JWT
const session = verifyJWT(req.cookies.session);
const org = await getOrganization(session.orgId);

// Redirect if wrong industry app
if (org.industry !== 'REAL_ESTATE') {
  redirect(`https://${org.industry.toLowerCase()}.app.strivetech.ai`);
}
```

---

### Database Strategy

**Option A: Shared Database (Simpler)**
- All apps connect to same Supabase database
- RLS policies enforce org isolation
- Industry-specific tables (e.g., `healthcare_patients`, `real_estate_properties`)

**Option B: Database per Industry (More Isolated)**
- Separate Supabase project per industry
- Core tables (User, Organization) replicated
- Complete data isolation for compliance

**Recommendation:** Start with Option A, migrate to Option B only if regulatory requirements demand it.

---

### Cost Comparison

**Current (Phase 1 - Monolith):**
- Hosting: $50-200/month
- Database: $25/month
- **Total: ~$75-225/month**

**Future (Phase 2 - Multi-App, 5 industries):**
- Hosting: $50/month × 5 = $250/month
- Database: $25-50/month (depending on strategy)
- CDN/Edge: $20/month
- **Total: ~$295-320/month**

**When it's worth it:**
- 5+ industries with distinct user bases
- Regulatory isolation needed (HIPAA)
- Industry-specific optimizations (save on compute)
- Different SLAs per industry

---

## Decision Matrix

| Criteria | Stay Monolith | Migrate Multi-App |
|----------|---------------|-------------------|
| Industries active | <5 | 5+ |
| Monthly users | <10,000 | 10,000+ |
| Regulatory isolation | Not required | Required (HIPAA, SOC2) |
| Industry traffic patterns | Similar | Vastly different |
| Compute costs | <$500/month | >$500/month |
| Team size | 1-5 devs | 5+ devs |

---

## Migration Checklist

**Pre-Migration:**
- [ ] Audit current dependencies across industries
- [ ] Identify truly shared code vs industry-specific
- [ ] Document API contracts between shared packages
- [ ] Set up cost monitoring for baseline comparison
- [ ] Create migration timeline (6-8 weeks)

**During Migration:**
- [ ] Extract to NPM packages
- [ ] Create monorepo structure (Turborepo/Nx)
- [ ] Build first industry app as proof of concept
- [ ] Set up CI/CD for multi-app deployment
- [ ] Configure subdomain routing

**Post-Migration:**
- [ ] Monitor bundle sizes (should decrease)
- [ ] Track deployment times (should be faster per industry)
- [ ] Measure compute costs (compare vs monolith)
- [ ] Gather developer feedback on DX
- [ ] Document lessons learned

---

## References

- **Current architecture:** [STRUCTURE-OVERVIEW-1.md](./STRUCTURE-OVERVIEW-1.md)
- **Type system:** [TYPES-GUIDE.md](../chat-logs/structure/types/TYPES-GUIDE.md)
- **Module patterns:** [CLAUDE.md](../../CLAUDE.md)

---

## Summary

**Start with Phase 1 (monolith)** as detailed in STRUCTURE-OVERVIEW-1.md. This document serves as your roadmap for **when and how to evolve** to Phase 2 (multi-app) when your platform reaches the scale and complexity that justifies it.

**Key takeaway:** Don't prematurely optimize. The industry-namespaced monolith will serve you well until you have clear signals (cost, compliance, scale) that demand the multi-app architecture.
