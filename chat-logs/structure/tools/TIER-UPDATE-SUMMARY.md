# Tier & Architecture Update Summary

**Date:** October 2, 2025
**Type:** Critical Architecture Update
**Impact:** All tool marketplace files + Prisma schema

---

## 🎯 Changes Made

### 1. Tier System Updated

**OLD (4 tiers):**
```
FREE → BASIC → PRO → ENTERPRISE
```

**NEW (5 tiers):**
```
STARTER → GROWTH → ELITE → CUSTOM → ENTERPRISE
```

**IMPORTANT:** All pricing and feature allocations are **PLACEHOLDERS (TBD)**

---

### 2. Critical Module vs Tool Distinction Added

#### **MODULES** (Core Platform)
- **Location:** `lib/modules/`
- **What:** Core platform dashboards/pages
- **Examples:** CRM Dashboard, Projects, AI, Tasks, Chatbot
- **Access:** Always included based on subscription tier
- **Sold separately:** NO
- **Migration:** **DO NOT migrate to tools marketplace**

#### **TOOLS** (Marketplace Add-ons)
- **Location:** `lib/tools/`
- **What:** Add-on utilities that can be purchased/enabled
- **Examples:** ROI Calculator, Invoice Generator, Property Alerts
- **Access:** Users enable/purchase separately
- **Sold separately:** YES (can be)
- **Integration:** Can integrate INTO modules or work standalone

---

## 📝 Files Updated

### Core Library Files

#### 1. **`CLAUDE.md`** (Project Root)
```diff
- Tiers: T0 (FREE) | T1 ($299) | T2 ($699) | T3 (Custom)
+ Tiers: Starter | Growth | Elite | Custom | Enterprise (pricing TBD)
+ Modules vs Tools:
+   - MODULES = Core dashboards (lib/modules/)
+   - TOOLS = Add-on utilities (lib/tools/)
```

#### 2. **`lib/tools/types.ts`**
```diff
- export type ToolTier = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
+ export type ToolTier = 'STARTER' | 'GROWTH' | 'ELITE' | 'CUSTOM' | 'ENTERPRISE';

+ // NEW: Scope distinction
+ export type ToolScope = 'module' | 'tool' | 'integration';
+
+ // NEW: Implementation types updated
+ export type ToolImplementation =
+   | 'platform-module'  // Core platform module
+   | 'nextjs'           // Marketplace tool
+   | 'n8n'              // Marketplace tool
+   | 'hybrid'           // Marketplace tool
+   | 'external';        // Marketplace tool

+ // ToolMetadata now includes:
+ scope: ToolScope;                    // CRITICAL field
+ includedInTiers?: ToolTier[];        // NEW field
```

#### 3. **`lib/tools/constants.ts`**
```typescript
// Updated tier metadata
export const TIER_META: Record<ToolTier, ...> = {
  'STARTER': {
    name: 'Starter',
    description: 'Entry level tier (features TBD)',
    price: 0,              // PLACEHOLDER - TBD
    toolLimit: 0,          // PLACEHOLDER - TBD
    badge: 'Starter',
    color: 'gray',
  },
  'GROWTH': { /* ... PLACEHOLDER ... */ },
  'ELITE': { /* ... PLACEHOLDER ... */ },
  'CUSTOM': { /* ... PLACEHOLDER ... */ },
  'ENTERPRISE': { /* ... PLACEHOLDER ... */ },
};

// Updated tier hierarchy
export const TIER_HIERARCHY = {
  'STARTER': 0,
  'GROWTH': 1,
  'ELITE': 2,
  'CUSTOM': 3,
  'ENTERPRISE': 4,
};

// All limits marked as PLACEHOLDER - TBD
```

#### 4. **`prisma/schema.prisma`**
```diff
enum SubscriptionTier {
- FREE
- BASIC
- PRO
+ STARTER
+ GROWTH
+ ELITE
+ CUSTOM
  ENTERPRISE
}

model User {
- subscriptionTier SubscriptionTier @default(FREE)
+ subscriptionTier SubscriptionTier @default(STARTER)
}
```

#### 5. **`lib/tools/shared/crm-basic/index.ts`**
```typescript
export const tool: Tool = {
  metadata: {
    id: 'crm-basic',
    name: 'Basic CRM',

    // NEW: Scope field added
    scope: 'tool',  // This is a marketplace tool

    // Updated tier
    tier: 'STARTER',           // PLACEHOLDER - TBD
    requiredTier: 'STARTER',   // PLACEHOLDER - TBD

    // All pricing marked as PLACEHOLDER
    basePrice: 0,              // PLACEHOLDER - TBD
    isAddon: false,            // PLACEHOLDER - TBD
  },
  // ...
};
```

---

## 📚 Documentation Created

### 1. **`CRITICAL-DISTINCTIONS.md`** ⭐ **MUST READ**
Comprehensive guide explaining:
- Module vs Tool distinction
- Tier structure
- Implementation guidelines
- Common mistakes to avoid
- File structure standards

### 2. **`session1_summary.md`** (Updated)
- Added tier update section
- Added module/tool distinction warning
- Updated all tier references

### 3. **`session2_plan.md`** (Updated)
- Added critical warnings at top
- Updated tier references
- Clarified what NOT to migrate

---

## 🔍 What This Means

### Platform Modules (lib/modules/) - DO NOT TOUCH
These stay exactly where they are:
- ✅ `lib/modules/crm/` - CRM Dashboard
- ✅ `lib/modules/projects/` - Projects Dashboard
- ✅ `lib/modules/ai/` - AI Dashboard
- ✅ `lib/modules/tasks/` - Tasks Dashboard
- ✅ `lib/modules/chatbot/` - Chatbot Dashboard

**DO NOT:**
- Migrate these to `lib/tools/`
- Add them to marketplace
- Change their location
- Treat them as purchasable tools

### Marketplace Tools (lib/tools/) - This is what we're building
Only these go in the marketplace:
- ROI Calculator
- Invoice Generator
- Email Templates
- Link Shortener
- QR Generator
- Image Optimizer
- Data Export
- Time Tracker
- Analytics Dashboard
- Property Alerts (real estate)
- MLS Integration (real estate)
- etc.

---

## ⚠️ Important Reminders

### All Pricing is PLACEHOLDER
Every pricing value, limit, and tier allocation is marked as:
```typescript
// PLACEHOLDER - TBD
```

This means:
- Don't hardcode specific prices
- Don't assume feature allocation
- Expect these to change
- Keep flexible for updates

### New Type Signature for Tools
All tool definitions now MUST include:
```typescript
{
  metadata: {
    scope: 'tool',  // Required: 'module' | 'tool' | 'integration'
    tier: 'STARTER', // Updated tier names
    // ... rest of metadata
  }
}
```

---

## 🚀 Next Steps

### When Starting Session 2:

1. **Read First:**
   - ✅ [CRITICAL-DISTINCTIONS.md](./CRITICAL-DISTINCTIONS.md)
   - ✅ [Session 2 Plan](./session2_plan.md) (updated)

2. **Remember:**
   - Only migrate marketplace tools (NOT platform modules)
   - All pricing is placeholder (TBD)
   - Use new tier names (STARTER/GROWTH/ELITE/CUSTOM/ENTERPRISE)
   - Always add `scope` field to tool metadata

3. **Database Migration:**
   ```bash
   # When ready, create migration for tier changes
   npx prisma migrate dev --name update_subscription_tiers
   ```

4. **Testing:**
   - Update any tests using old tier names
   - Test with new STARTER default tier
   - Verify scope field is required

---

## 📋 Quick Reference

### Old → New Tier Mapping
```
FREE       → STARTER
BASIC      → GROWTH
PRO        → ELITE
(new)      → CUSTOM
ENTERPRISE → ENTERPRISE
```

### File Locations
```
Platform Modules:  lib/modules/  (CRM, Projects, AI, Tasks)
Marketplace Tools: lib/tools/    (ROI Calc, Invoice Gen, etc.)
```

### Key Distinctions
```
Modules:
  - Core platform functionality
  - Always included per tier
  - NOT sold separately
  - Location: lib/modules/

Tools:
  - Marketplace add-ons
  - Can be purchased separately
  - May integrate into modules
  - Location: lib/tools/
```

---

## ✅ Verification Checklist

After these updates:
- [ ] All tier names updated to new 5-tier system
- [ ] Prisma schema updated with new tiers
- [ ] All placeholders marked as TBD
- [ ] Module vs tool distinction documented
- [ ] Critical distinctions doc created
- [ ] Session summaries updated
- [ ] Example tool (crm-basic) updated with scope
- [ ] All constants updated

**Status: ✅ ALL COMPLETE**

---

**For Future Reference:**
- All tier-related decisions are placeholders
- Platform modules stay in `lib/modules/`
- Only marketplace tools go in `lib/tools/`
- Read CRITICAL-DISTINCTIONS.md before any tool work
