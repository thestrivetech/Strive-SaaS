# Schema Archive - October 9, 2025

## Why Schemas Were Removed

This directory contains all Zod validation schemas that were removed from the platform codebase on October 9, 2025.

**Reason for Removal:** Focus on UI development and functionality without validation overhead. The platform is currently in UI-first development mode using mock data, and schemas were causing 100+ TypeScript errors that blocked development progress.

## What's Archived

### Module Schemas (48+ files)
All `schemas.ts` files from `lib/modules/` directory:
- CRM schemas (contacts, leads, deals)
- Transaction schemas (core, tasks, documents, listings, etc.)
- REID schemas (alerts, insights, reports, preferences)
- Expense schemas (expenses, receipts, reports, tax-estimates)
- Dashboard schemas (activities, metrics, widgets, quick-actions)
- Content schemas (campaigns, content, media)
- AI schemas (ai, ai-hub, ai-garage)
- Marketplace schemas
- Settings schemas (billing, organization, profile, security)
- Other module schemas

### Auth Schemas
- `lib/auth/schemas.ts` - Login, signup, password reset validation

## Current Development Phase

**Phase:** UI-First Development with Mock Data
- Mock data mode enabled: `NEXT_PUBLIC_USE_MOCKS=true`
- Schema: Minimal (users, organizations, organization_members only)
- Focus: Building UI components and gathering real requirements
- Validation: Temporarily disabled to focus on functionality

## When to Rebuild Schemas

Schemas will be rebuilt from scratch based on:
1. **Real UI requirements** - What fields are actually used in forms
2. **User feedback** - What validation makes sense for real use cases
3. **Data patterns** - What data structures emerged from UI development
4. **Business rules** - What validation rules are actually needed

## How to Reference These Schemas

When rebuilding schemas:
1. Look at the archived schema files in this directory
2. Extract field definitions and validation rules
3. Rebuild only what's needed based on current UI
4. Avoid over-engineering - add validation as requirements emerge

## Archive Structure

```
lib/schemas-archive-2025-10-09/
├── README.md (this file)
├── auth/
│   └── schemas.ts
└── modules/
    ├── admin/schemas.ts
    ├── ai/schemas.ts
    ├── ai-garage/
    │   ├── blueprints/schemas.ts
    │   ├── orders/schemas.ts
    │   └── templates/schemas.ts
    ├── ai-hub/schemas.ts
    ├── appointments/schemas.ts
    ├── attachments/schemas.ts
    ├── content/
    │   ├── campaigns/schemas.ts
    │   ├── content/schemas.ts
    │   ├── media/schemas.ts
    │   └── schemas.ts
    ├── crm/
    │   ├── contacts/schemas.ts
    │   ├── core/schemas.ts
    │   ├── deals/schemas.ts
    │   └── leads/schemas.ts
    ├── dashboard/
    │   ├── activities/schemas.ts
    │   ├── metrics/schemas.ts
    │   ├── quick-actions/schemas.ts
    │   ├── schemas.ts
    │   └── widgets/schemas.ts
    ├── expenses/
    │   ├── expenses/schemas.ts
    │   ├── receipts/schemas.ts
    │   ├── reports/schemas.ts
    │   └── tax-estimates/schemas.ts
    ├── marketplace/
    │   ├── reviews/schemas.ts
    │   └── schemas.ts
    ├── notifications/schemas.ts
    ├── onboarding/schemas.ts
    ├── organization/schemas.ts
    ├── projects/schemas.ts
    ├── reid/
    │   ├── ai/schemas.ts
    │   ├── alerts/schemas.ts
    │   ├── insights/schemas.ts
    │   ├── preferences/schemas.ts
    │   └── reports/schemas.ts
    ├── settings/
    │   ├── billing/schemas.ts
    │   ├── organization/schemas.ts
    │   ├── profile/schemas.ts
    │   └── security/schemas.ts
    ├── tasks/schemas.ts
    └── transactions/
        ├── core/schemas.ts
        ├── documents/schemas.ts
        ├── listings/schemas.ts
        ├── milestones/schemas.ts
        ├── parties/schemas.ts
        ├── signatures/schemas.ts
        ├── tasks/schemas.ts
        └── workflows/schemas.ts
```

## Notes

- All schema files were working at the time of archival
- Type exports from schemas were replaced with simple TypeScript type definitions
- Validation was removed from all Server Actions, queries, and API routes
- Tests remain but are exempt from ESLint rules
- This is a temporary state during UI development phase

## Restoration

To restore schemas:
1. Copy schema files back to their original locations
2. Restore imports in action/query files
3. Add back `.parse()` validation calls
4. Test and fix any type mismatches
5. Update based on new UI requirements

---

**Archived:** October 9, 2025
**Reason:** UI-first development focus
**Status:** Temporary removal during mock data phase
**Next Steps:** Rebuild from scratch based on real UI needs
