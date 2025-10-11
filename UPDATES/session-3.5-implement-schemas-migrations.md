# Session 3.5: Implement All Schemas + Migrations

**Phase:** 3 - Full Feature Set
**Priority:** 🔴 CRITICAL (after designs complete)
**Estimated Time:** 2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Consolidate all 4 schema designs (Sessions 3.1-3.4) into single Prisma schema, create migration, and apply to database.

**Total:** 21 new models across 4 modules

---

## 📋 TASK FOR AGENT

```markdown
IMPLEMENT ALL SCHEMAS + CREATE MIGRATION for (platform) project

**Context:**
Combine all schema designs from Sessions 3.1-3.4 into production schema.
Create single atomic migration for all 21 models.

**Requirements:**

1. **Consolidate Schema Designs:**
   - Merge marketplace schema (5 models + 8 enums)
   - Merge REID schema (7 models + enums)
   - Merge expense-tax schema (5 models + enums)
   - Merge campaigns schema (4 models + enums)
   - Resolve any naming conflicts
   - Validate cross-module relationships

2. **Update Prisma Schema:**
   ```bash
   cd (platform)

   # Edit schema
   code prisma/schema.prisma

   # Add all 21 models + enums
   # Follow existing conventions
   # Use @@map for SQL table names
   ```

3. **Create Migration:**
   ```bash
   # Use helper script
   npm run db:migrate
   # Name: "add-marketplace-reid-expense-campaigns-modules"

   # Verify migration SQL
   cat prisma/migrations/[timestamp]_add-marketplace-reid-expense-campaigns-modules/migration.sql
   ```

4. **Apply Migration:**
   ```bash
   # Development database first
   npx prisma migrate deploy

   # Generate Prisma client
   npx prisma generate
   ```

5. **Update Documentation:**
   ```bash
   # Regenerate schema docs
   npm run db:docs

   # Verify updates
   cat prisma/SCHEMA-QUICK-REF.md | grep -E "marketplace|reid|expense|campaign"
   ```

6. **Verification (REQUIRED):**
   ```bash
   # TypeScript check
   npx tsc --noEmit

   # Check schema valid
   npx prisma validate

   # View in Prisma Studio
   npx prisma studio
   # Verify all 21 new tables exist

   # Build check
   npm run build
   ```

**DO NOT report success unless:**
- All 21 models added to schema
- Migration created successfully
- Migration applied to database
- Prisma client regenerated
- Documentation updated
- All verification commands pass
- Prisma Studio shows all new tables

**Return Format:**
## ✅ EXECUTION REPORT

**Models Added:** 21
- Marketplace: 5 models (tools, bundles, bundle_items, purchases, cart, reviews)
- REID Analytics: 7 models
- Expense-Tax: 5 models
- CMS Campaigns: 4 models

**Enums Added:** [count]

**Migration Created:**
- File: prisma/migrations/[timestamp]_add-marketplace-reid-expense-campaigns-modules/
- Tables: 21 new tables
- Indexes: [count]
- Foreign keys: [count]

**Verification Results:**
```
npx prisma validate:
[output]

npx prisma generate:
[output - client regenerated]

npm run db:docs:
[output - docs updated]

npx tsc --noEmit:
[no errors]

npm run build:
[success]
```

**Database State:**
- Total Models: 63 (42 existing + 21 new)
- Prisma Studio: ✅ All tables visible

**Issues Found:** NONE / [list any issues]
```

---

## 🔒 SECURITY REQUIREMENTS

**RLS Policies:**
- Add RLS policies in migration SQL for:
  - marketplace_purchases (organization_id)
  - marketplace_cart (user_id, organization_id)
  - marketplace_reviews (organization_id)
  - reid_* (all filter by organization_id)
  - expenses (organization_id)
  - tax_* (organization_id)
  - campaigns (organization_id)

**Multi-Tenancy:**
- Ensure ALL new models have organization_id column
- Add indexes on organization_id for query performance

---

## 🧪 VERIFICATION CHECKLIST

- [ ] All 21 models in schema
- [ ] Migration created
- [ ] Migration applied successfully
- [ ] Prisma client regenerated
- [ ] Schema documentation updated
- [ ] TypeScript check passes
- [ ] Build succeeds
- [ ] All tables visible in Prisma Studio

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- Single migration created with all 21 models
- Migration applied to development database
- All verification checks pass
- Documentation updated
- Agent provides complete verification outputs

---

## 🚨 FAILURE RECOVERY

**If migration fails:**
→ Check migration SQL for syntax errors
→ Verify no naming conflicts with existing tables
→ Test in separate test database first
→ Rollback and fix errors

**If relationships fail:**
→ Verify foreign key references correct tables/columns
→ Check enum values match across models
→ Ensure indexes on foreign key columns

**Max attempts:** 3

---

**Created:** 2025-10-10
**Dependencies:** Sessions 3.1-3.4 complete (all designs done)
**Next Session:** 3.6 - Update Marketplace Providers
