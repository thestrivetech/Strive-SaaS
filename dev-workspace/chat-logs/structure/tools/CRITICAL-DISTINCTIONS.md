# CRITICAL ARCHITECTURAL DISTINCTIONS

**Last Updated:** October 2, 2025
**Status:** ACTIVE - Must be followed throughout project

---

## 🚨 MODULES vs TOOLS - Critical Difference

### **MODULES** = Core Platform Dashboards/Pages

**What they are:**
- Core platform functionality displayed as dashboards/pages
- Part of the base SaaS platform
- **NOT sold separately** - included with subscription tier
- Located in `lib/modules/`

**Examples:**
- CRM Dashboard (`lib/modules/crm/`)
- Projects Dashboard (`lib/modules/projects/`)
- AI Dashboard (`lib/modules/ai/`)
- Tasks Dashboard (`lib/modules/tasks/`)
- Chatbot Dashboard (`lib/modules/chatbot/`)

**Characteristics:**
- Always available based on subscription tier
- Displayed as main navigation items
- Core business functionality
- NOT in marketplace
- NOT purchasable separately

---

### **TOOLS** = Marketplace Add-on Utilities

**What they are:**
- Add-on utilities that users can purchase/enable
- Can integrate into existing modules OR work standalone
- Located in `lib/tools/`
- **CAN be sold separately** as marketplace items

**Examples:**
- ROI Calculator
- Invoice Generator
- Email Templates
- Link Shortener
- QR Generator
- Property Alerts (real estate)
- MLS Integration (real estate)

**Characteristics:**
- Users enable/purchase separately
- Displayed in tools marketplace
- May integrate into platform modules
- Purchasable as add-ons
- Industry-specific or general purpose

---

## 🎯 Subscription Tiers

### Current Tier Structure (5 Tiers)

```
STARTER   → Entry level
GROWTH    → Growing businesses
ELITE     → Advanced features
CUSTOM    → Tailored solutions
ENTERPRISE → Full enterprise suite
```

**IMPORTANT:** All pricing and feature allocation are **PLACEHOLDERS (TBD)**
- Exact pricing not finalized
- Module/tool inclusion per tier TBD
- Limits and quotas TBD
- Use placeholders that can be easily updated

---

## 📂 File Structure

### Platform Modules (Core)
```
lib/modules/
├── crm/              # CRM Dashboard (always included per tier)
├── projects/         # Projects Dashboard (always included per tier)
├── ai/               # AI Dashboard (always included per tier)
├── tasks/            # Tasks Dashboard (always included per tier)
├── chatbot/          # Chatbot Dashboard (always included per tier)
└── organization/     # Org settings (always included per tier)
```

### Marketplace Tools (Add-ons)
```
lib/tools/
├── shared/           # Cross-industry tools
│   ├── roi-calculator/
│   ├── invoice-generator/
│   ├── email-templates/
│   └── ...
├── real-estate/      # Real estate specific
│   ├── property-alerts/
│   ├── mls-integration/
│   └── ...
└── [other industries]/
```

---

## 🔧 Implementation Guidelines

### Type Definitions

```typescript
// Scope distinction
export type ToolScope =
  | 'module'        // Core platform module in lib/modules/
  | 'tool'          // Marketplace tool in lib/tools/
  | 'integration';  // Tool that integrates into a module

// Implementation type
export type ToolImplementation =
  | 'platform-module' // Core module (always available)
  | 'nextjs'          // Marketplace tool (Next.js)
  | 'n8n'             // Marketplace tool (n8n)
  | 'hybrid'          // Marketplace tool (both)
  | 'external';       // Marketplace tool (third-party)

// Tool metadata
export interface ToolMetadata {
  id: string;
  name: string;
  scope: ToolScope;                // CRITICAL: module vs tool
  tier: ToolTier;                  // PLACEHOLDER - TBD
  basePrice: number;               // PLACEHOLDER - TBD
  includedInTiers?: ToolTier[];    // PLACEHOLDER - TBD
  // ... rest
}
```

### Database Schema

```prisma
// Subscription tiers
enum SubscriptionTier {
  STARTER
  GROWTH
  ELITE
  CUSTOM
  ENTERPRISE
}

// Tool configs (marketplace tools only, NOT modules)
model OrganizationToolConfig {
  id             String
  organizationId String
  toolId         String    // Marketplace tool ID
  industry       String
  enabled        Boolean
  settings       Json
  // ...
}
```

---

## 📝 Documentation Standards

### In Code Comments

**Always include:**
```typescript
/**
 * CRITICAL: This is a MARKETPLACE TOOL, not a platform module
 * Platform modules (CRM Dashboard, etc.) live in lib/modules/
 */

/**
 * IMPORTANT: All pricing/limits are PLACEHOLDERS (TBD)
 * Final pricing structure pending business decisions
 */
```

### In Documentation Files

**Always clarify:**
- Whether discussing modules or tools
- Mark pricing as placeholder (TBD)
- Note that tier features are not finalized
- Distinguish between always-included (modules) vs purchasable (tools)

---

## ✅ Checklist for New Features

Before implementing any feature, confirm:

- [ ] Is this a MODULE (core platform) or TOOL (marketplace add-on)?
- [ ] Where does it belong? (`lib/modules/` or `lib/tools/`)
- [ ] Is it always included or purchasable?
- [ ] What tier(s) should have access? (mark as TBD if unsure)
- [ ] Is pricing finalized? (if not, use placeholder)
- [ ] Does it integrate into existing modules?
- [ ] Have I documented the module vs tool distinction?

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T:
- Mix modules and tools in the same directory
- Put marketplace tools in `lib/modules/`
- Put platform modules in `lib/tools/`
- Finalize pricing without business approval
- Assume tier features are set in stone
- Migrate platform modules to marketplace
- Create tools that duplicate module functionality

### ✅ DO:
- Keep modules in `lib/modules/` (core platform)
- Keep tools in `lib/tools/` (marketplace add-ons)
- Use placeholders for pricing (TBD)
- Mark all tier allocations as TBD
- Tools can integrate INTO modules
- Document the distinction clearly
- Allow flexibility for future changes

---

## 📊 Current Migration Status

### What We're Building:
- ✅ Tool marketplace system for ADD-ON utilities
- ✅ Registry for industry-specific tools
- ✅ Tool enabling/disabling for organizations

### What We're NOT Migrating:
- ❌ Platform modules (CRM, Projects, AI, Tasks)
- ❌ Core dashboard functionality
- ❌ Base platform features

### Platform Modules Stay In Place:
- `lib/modules/crm/` → **Keep as is** (core platform)
- `lib/modules/projects/` → **Keep as is** (core platform)
- `lib/modules/ai/` → **Keep as is** (core platform)
- `lib/modules/tasks/` → **Keep as is** (core platform)
- `lib/modules/chatbot/` → **Keep as is** (core platform)

---

## 🔗 Related Documentation

- [CLAUDE.md](../../../CLAUDE.md) - Updated with tier info
- [Session 1 Summary](./session1_summary.md) - Implementation details
- [Session 2 Plan](./session2_plan.md) - Next steps

---

**Remember:**
- **Modules** = Core platform pages (always included)
- **Tools** = Marketplace add-ons (purchasable)
- **Pricing** = All placeholders (TBD)
- **Tiers** = Starter, Growth, Elite, Custom, Enterprise

This distinction is **CRITICAL** to the entire architecture!
