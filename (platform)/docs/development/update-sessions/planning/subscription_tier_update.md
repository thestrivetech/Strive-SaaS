# Subscription Tier Update Plan

**Created:** 2025-10-04
**Status:** Planning
**Priority:** 🔴 HIGH - Affects pricing, billing, and feature gating

---

## 📋 Overview

Update subscription tier naming and structure from legacy FREE/BASIC/PRO model to new Starter/Growth/Elite/Enterprise model.

---

## 🎯 Current State vs New State

### Current Tiers (Prisma Schema)
```prisma
enum SubscriptionTier {
  FREE
  BASIC
  PRO
  ENTERPRISE
}
```

### New Tiers (Per README.md & CLAUDE.md)
```prisma
enum SubscriptionTier {
  Custom
  STARTER
  GROWTH
  ELITE
  ENTERPRISE
}
```

**Key Difference:**
- `ENTERPRISE` changes meaning: from "highest paid tier" → "custom enterprise tier requiring sales call"
- Removes `FREE` tier concept
- Renames `BASIC` → `STARTER`
- Renames `PRO` → `GROWTH`
- `ELITE` becomes the new highest standard tier
- `Custom` is a fully custom plan where users can select any specific tool or dashboard that they need -> Prices will come later after more tools and dashboards are added

---

## 💰 New Tier Structure

| Tier | Pricing | Description | Features |
|------|---------|-------------|----------|
| **Custom** | $[x]/mo | For any level of Agency, it just depends on their specific tools and dashboard needs | Each tool and dashboard will have individual pricing so users/companies can fully customize their subscription plan
| **STARTER** | $299/mo | Entry-level plan for small teams | CRM Dashboard, 3 tools, CRM basics |
| **GROWTH** | $699/mo | Mid-tier for growing businesses | CRM Dashboard, Transaction Dashboard, and CMS & Marketing Dashboard, 10 tools |
| **ELITE** | TBD | Premium tier with advanced features | Unlimited tools, advanced features |
| **ENTERPRISE** | Custom | Custom solutions, requires sales call | Fully custom based on client needs |

**Source:** README.md line 154, CLAUDE.md line 71

---

## 🔧 Required Changes

### 1. Database Schema Update
**File:** `shared/prisma/schema.prisma`

```prisma
// Current
enum SubscriptionTier {
  FREE
  BASIC
  PRO
  ENTERPRISE
}

// New
enum SubscriptionTier {
  STARTER
  GROWTH
  ELITE
  ENTERPRISE
}
```

**Migration Steps:**
1. Create migration to rename enum values
2. Update existing data:
   - `FREE` → `STARTER` (or handle separately if free tier needed)
   - `BASIC` → `STARTER`
   - `PRO` → `GROWTH`
   - `ENTERPRISE` → `ELITE` (existing enterprise customers)
   - New `ENTERPRISE` = custom tier only

---

### 2. Code References to Update

**Search for tier references:**
```bash
cd "(platform)"
grep -r "SubscriptionTier" --include="*.ts" --include="*.tsx"
grep -r "FREE\|BASIC\|PRO\|ENTERPRISE" --include="*.ts" --include="*.tsx" | grep -i tier
```

**Common locations:**
- `lib/auth/rbac.ts` - Feature gating by tier
- `lib/modules/organization/` - Organization tier checks
- `app/settings/billing/` - Billing UI
- `components/features/*/` - Feature-specific tier gates
- `prisma/seed.ts` - Default organization tier
- Documentation files

---

### 3. Pricing Updates

**Current pricing mentions in codebase:**
- STARTER: $299/mo (documented)
- GROWTH: $699/mo (documented)
- ELITE: TBD
- ENTERPRISE: Custom pricing

**Action items:**
- [ ] Define ELITE tier pricing
- [ ] Update Stripe product/price IDs
- [ ] Update pricing tables in UI
- [ ] Update marketing website pricing

---

### 4. Feature Gate Mapping

**Current system (from platform CLAUDE.md):**
```typescript
const tierLimits = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'ai', 'tools'],
  ELITE: ['*'], // All features
};
```

**New system:**
```typescript
const tierLimits = {
  STARTER: ['dashboard', 'profile', 'crm', 'projects'], // 3 tools
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'ai', 'tools'], // 10 tools
  ELITE: ['*'], // Unlimited tools, advanced features
  ENTERPRISE: ['*'], // Fully custom
};
```

**Questions:**
- Do we still need a FREE tier for trials?
- Should ENTERPRISE have different permissions than ELITE?
- What are "advanced features" for ELITE?

---

## 📝 Migration Strategy

### Option 1: Simple Rename (Breaking Change)
```sql
-- Rename enum values directly
ALTER TYPE "SubscriptionTier" RENAME VALUE 'FREE' TO 'STARTER';
ALTER TYPE "SubscriptionTier" RENAME VALUE 'BASIC' TO 'STARTER';
ALTER TYPE "SubscriptionTier" RENAME VALUE 'PRO' TO 'GROWTH';
-- Handle ENTERPRISE → ELITE for existing customers
```

**Pros:**
- Clean, straightforward
- Matches new naming exactly

**Cons:**
- May lose distinction between FREE and STARTER
- Existing ENTERPRISE customers need manual handling

---

### Option 2: Data Migration + Enum Update (Recommended)
```sql
-- 1. Add new enum values
ALTER TYPE "SubscriptionTier" ADD VALUE 'STARTER';
ALTER TYPE "SubscriptionTier" ADD VALUE 'GROWTH';
ALTER TYPE "SubscriptionTier" ADD VALUE 'ELITE';

-- 2. Migrate existing data
UPDATE organizations SET subscription_tier = 'STARTER' WHERE subscription_tier = 'FREE';
UPDATE organizations SET subscription_tier = 'STARTER' WHERE subscription_tier = 'BASIC';
UPDATE organizations SET subscription_tier = 'GROWTH' WHERE subscription_tier = 'PRO';
UPDATE organizations SET subscription_tier = 'ELITE' WHERE subscription_tier = 'ENTERPRISE';

-- 3. Remove old enum values (requires dropping and recreating)
-- This is more complex and may require downtime
```

**Pros:**
- More control over data migration
- Can handle edge cases

**Cons:**
- More complex migration
- PostgreSQL doesn't allow removing enum values easily

---

### Option 3: New Enum + Deprecation Period
```prisma
enum SubscriptionTier {
  // Deprecated
  FREE @deprecated
  BASIC @deprecated
  PRO @deprecated

  // Active
  STARTER
  GROWTH
  ELITE
  ENTERPRISE
}
```

**Pros:**
- Backwards compatible
- Can migrate gradually

**Cons:**
- Technical debt
- Cluttered enum

---

## ✅ Implementation Checklist

### Phase 1: Planning & Documentation
- [x] Document current vs new tier structure
- [ ] Define ELITE tier pricing
- [ ] Decide on FREE tier handling
- [ ] Choose migration strategy
- [ ] Get stakeholder approval

### Phase 2: Database Migration
- [ ] Create Prisma migration for enum update
- [ ] Test migration on dev database
- [ ] Create data migration script
- [ ] Backup production data
- [ ] Execute migration

### Phase 3: Code Updates
- [ ] Update all TypeScript references
- [ ] Update feature gating logic
- [ ] Update seed.ts with new tiers
- [ ] Update RBAC tier checks
- [ ] Update UI components (pricing tables, tier badges)

### Phase 4: Stripe Integration
- [ ] Create new Stripe products for STARTER/GROWTH/ELITE
- [ ] Update webhook handlers
- [ ] Update subscription creation logic
- [ ] Test tier upgrades/downgrades

### Phase 5: Testing
- [ ] Unit tests for tier checking logic
- [ ] Integration tests for subscription flow
- [ ] E2E tests for tier-gated features
- [ ] Manual QA of pricing pages

### Phase 6: Deployment
- [ ] Deploy to staging
- [ ] Verify all tiers work correctly
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Update marketing website

---

## 🚨 Risks & Considerations

1. **Existing Customers**
   - How do we handle customers on FREE/BASIC/PRO?
   - Grandfather existing ENTERPRISE customers?
   - Communicate changes before migration

2. **Billing Integration**
   - Stripe product IDs need updating
   - Webhook handlers need tier name updates
   - Invoice templates may reference old names

3. **Feature Flags**
   - Ensure all feature gates updated
   - Test that tier restrictions work correctly
   - No accidental access grants

4. **Documentation**
   - Update all docs mentioning tiers
   - Update API documentation
   - Update help center/FAQ

---

## 📊 Impact Analysis

**Files Affected (Estimated):**
- Database: 1 migration file
- Prisma: 1 schema update
- TypeScript: ~20-30 files
- Documentation: ~10 files
- Tests: ~15 test files

**Estimated Effort:**
- Planning: 2 hours
- Implementation: 8 hours
- Testing: 4 hours
- Deployment: 2 hours
- **Total:** ~16 hours (2 days)

---

## 🔗 Related Documents

- [Root README](../README.md) - Line 154: Tier pricing
- [Root CLAUDE.md](../CLAUDE.md) - Line 71: Tier description
- [Platform CLAUDE.md](../(platform)/CLAUDE.md) - RBAC tier checks
- [Session 7 Plan](../(platform)/update-sessions/session7-plan.md) - Current TypeScript cleanup

---

## 📅 Next Steps

1. **Immediate:** Get approval on ELITE tier pricing
2. **Immediate:** Decide on FREE tier handling (trial vs removed)
3. **Before migration:** Choose migration strategy
4. **Before migration:** Create comprehensive test plan
5. **After approval:** Create Session 8 plan for tier migration

---

**Status:** 📝 Awaiting pricing & strategy decisions
**Owner:** Platform Team
**Timeline:** TBD pending approval

**Last Updated:** 2025-10-04
