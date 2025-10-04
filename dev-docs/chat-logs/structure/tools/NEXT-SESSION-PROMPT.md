# Next Session: Update TYPES-GUIDE.md

**Task:** Update the TYPES-GUIDE.md to reflect recent architectural changes
**Priority:** HIGH - Critical for type system consistency
**Estimated Time:** 30-45 minutes

---

## 🎯 What You Need to Do

Update `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\chat-logs\NEW-REVIEW-&-UPDATE\session-logs\TYPES-GUIDE.md` with the following changes:

### 1. Update Tier System (5 Tiers)

**OLD (4 tiers):**
```typescript
export type ToolTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'ENTERPRISE';
export type OrganizationTier = 'free' | 'starter' | 'growth' | 'elite' | 'enterprise';
```

**NEW (5 tiers - MUST BE CONSISTENT):**
```typescript
export type ToolTier = 'STARTER' | 'GROWTH' | 'ELITE' | 'CUSTOM' | 'ENTERPRISE';
export type OrganizationTier = 'STARTER' | 'GROWTH' | 'ELITE' | 'CUSTOM' | 'ENTERPRISE';

// Add this comment above all tier definitions:
/**
 * Subscription tiers (5 levels)
 * IMPORTANT: All pricing and features are PLACEHOLDERS (TBD)
 */
```

### 2. Add CRITICAL Module vs Tool Distinction

Add this section at the top of the tool types section:

```typescript
# 2. Tool System Types #

/**
 * CRITICAL DISTINCTION - MODULES vs TOOLS
 *
 * MODULES = Core platform dashboards/pages (lib/modules/)
 *   - CRM Dashboard, Projects, AI, Tasks, Chatbot
 *   - Part of base platform functionality
 *   - NOT sold separately
 *   - Always included based on subscription tier
 *   - Examples: lib/modules/crm/, lib/modules/projects/
 *
 * TOOLS = Marketplace add-on utilities (lib/tools/)
 *   - ROI Calculator, Invoice Generator, Property Alerts
 *   - Can be purchased/enabled separately
 *   - May integrate INTO modules or work standalone
 *   - Industry-specific or general purpose
 *   - Examples: lib/tools/shared/roi-calculator/
 */

export type ToolScope =
  | 'module'        // Core platform module (lib/modules/) - always included
  | 'tool'          // Marketplace tool (lib/tools/) - purchasable add-on
  | 'integration';  // Tool that integrates into a module
```

### 3. Update ToolImplementation Type

**OLD:**
```typescript
export type ToolImplementation = 'nextjs' | 'n8n' | 'hybrid' | 'external';
```

**NEW:**
```typescript
export type ToolImplementation =
  | 'platform-module' // Core platform module in lib/modules/ (always available per tier)
  | 'nextjs'          // Built into Next.js app (marketplace tool)
  | 'n8n'             // n8n workflow automation (marketplace tool)
  | 'hybrid'          // Combination of Next.js + n8n (marketplace tool)
  | 'external';       // Third-party integration (marketplace tool)
```

### 4. Update ToolMetadata Interface

Add these new fields:

```typescript
export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string;
  industry: Industry;

  // ⭐ ADD THIS - CRITICAL
  scope: ToolScope;  // 'module' | 'tool' | 'integration'

  category: ToolCategory;
  tier: ToolTier;  // Use new tier names: STARTER/GROWTH/ELITE/CUSTOM/ENTERPRISE
  implementation: ToolImplementation;

  basePrice: number;  // Mark as PLACEHOLDER - TBD
  setupFee?: number;  // Mark as PLACEHOLDER - TBD

  // ⭐ ADD THIS - NEW FIELD
  includedInTiers?: ToolTier[];  // Which tiers include this for free (PLACEHOLDER - TBD)

  // ... rest of existing fields
}
```

### 5. Add Placeholder Notes

Throughout the pricing/tier sections, add:

```typescript
// IMPORTANT: All pricing and feature allocation are PLACEHOLDERS (TBD)
// Final pricing structure pending business decisions
```

---

## 📚 Reference Documents (Read These First)

**Must Read:**
1. `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\chat-logs\structure\tools\CRITICAL-DISTINCTIONS.md`
   - Complete explanation of modules vs tools
   - File structure standards
   - What NOT to do

2. `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\chat-logs\structure\tools\TIER-UPDATE-SUMMARY.md`
   - All changes made to tier system
   - Before/after comparisons
   - Complete file update list

3. `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md`
   - Updated with new tier structure (line 423-426)

**Current Correct Implementations:**
- `app/lib/tools/types.ts` ✅ Up to date
- `app/lib/tools/constants.ts` ✅ Up to date
- `app/prisma/schema.prisma` ✅ Up to date (enum SubscriptionTier)
- `app/lib/tools/shared/crm-basic/index.ts` ✅ Example tool with new structure

---

## ✅ Checklist for TYPES-GUIDE.md Updates

Update these specific lines:

- [ ] Line 57: Change `OrganizationTier` to use new 5-tier system (STARTER/GROWTH/ELITE/CUSTOM/ENTERPRISE)
- [ ] Line 510: Change `ToolTier` from TIER_1/2/3 to STARTER/GROWTH/ELITE/CUSTOM/ENTERPRISE
- [ ] Add `ToolScope` type definition (module/tool/integration)
- [ ] Update `ToolImplementation` to include 'platform-module'
- [ ] Add `scope` field to `ToolMetadata` interface
- [ ] Add `includedInTiers` field to `ToolMetadata` interface
- [ ] Add "CRITICAL DISTINCTION" section explaining modules vs tools
- [ ] Add "PLACEHOLDER (TBD)" comments to all pricing/tier references
- [ ] Verify all tier references use new naming consistently

---

## 🚨 Critical Points to Remember

1. **Modules ≠ Tools**
   - Modules are in `lib/modules/` (CRM, Projects, AI, Tasks)
   - Tools are in `lib/tools/` (ROI Calc, Invoice Gen, etc.)
   - DO NOT confuse these in the type guide

2. **5 Tiers (not 4)**
   - STARTER (was FREE/TIER_1)
   - GROWTH (was BASIC/TIER_2)
   - ELITE (was PRO/TIER_3)
   - CUSTOM (NEW - between Elite and Enterprise)
   - ENTERPRISE (same)

3. **All Pricing is Placeholder**
   - Mark every pricing/limit value as "PLACEHOLDER - TBD"
   - Final business decisions not yet made
   - Use consistent naming: `// PLACEHOLDER - TBD`

4. **Type Consistency**
   - `ToolTier` and `OrganizationTier` should use SAME tier names
   - Both should be: STARTER | GROWTH | ELITE | CUSTOM | ENTERPRISE
   - No mixing of old names (free, tier_1, etc.)

---

## 🔧 Quick Reference

### Old Tier Names → New Tier Names
```
FREE/TIER_1 → STARTER
BASIC/TIER_2 → GROWTH
PRO/TIER_3 → ELITE
(new) → CUSTOM
ENTERPRISE → ENTERPRISE
```

### File Locations
```
Platform Modules: lib/modules/  (NOT in types guide marketplace tools)
Marketplace Tools: lib/tools/    (what the types guide covers)
```

### Required New Types
```typescript
export type ToolScope = 'module' | 'tool' | 'integration';
export type ToolImplementation = 'platform-module' | 'nextjs' | 'n8n' | 'hybrid' | 'external';
```

---

## 📋 After Updating TYPES-GUIDE.md

1. Verify tier consistency throughout the file
2. Ensure all pricing has "PLACEHOLDER - TBD" notes
3. Check that modules vs tools distinction is clear
4. Update any example code to use new tier names
5. Cross-reference with `lib/tools/types.ts` for accuracy

---

## 💡 Context from Previous Session

**What was done:**
- Updated tier system from 4 to 5 tiers across entire project
- Added critical module vs tool distinction
- Updated Prisma schema with new SubscriptionTier enum
- Created CRITICAL-DISTINCTIONS.md documentation
- Updated all tool library files with new structure

**What's left:**
- TYPES-GUIDE.md still has old tier names and missing distinctions
- Need to align types guide with actual implementation
- Ensure consistency across all type documentation

---

**Start here:** Read CRITICAL-DISTINCTIONS.md, then update TYPES-GUIDE.md line by line using the checklist above.
