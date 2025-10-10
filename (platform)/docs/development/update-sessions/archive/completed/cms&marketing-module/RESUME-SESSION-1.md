# Resume Session 1 - Quick Start Guide

**Status:** Session 1 is 60% complete (foundation done, implementation pending)
**Time to Complete:** 30-60 minutes
**Last Updated:** 2025-10-05

---

## ⚡ Quick Resume Checklist

When you're ready to resume Session 1, follow these steps:

### ✅ Pre-Flight Checks (5 minutes)

1. **Verify Schema Stability**
   ```bash
   cd "C:\Users\zochr\Desktop\GitHub\Strive-SaaS"
   git status shared/prisma/schema.prisma
   ```
   - **Check:** No pending changes from other developers
   - **Action:** If changes exist, pull and review before proceeding

2. **Check for Conflicts**
   ```bash
   cd "(platform)"
   git pull origin main
   ```
   - **Check:** No merge conflicts in schema file
   - **Action:** Resolve any conflicts before proceeding

3. **Verify Current State**
   - ✅ Enums added (ContentPilot enums lines 1392-1443)
   - ✅ Legacy content migrated (line 162)
   - ⏸️ ContentPilot models: NOT ADDED YET
   - ⏸️ Relations: COMMENTED (lines 554-563, 747-756)

---

## 🚀 Implementation Steps (30-45 minutes)

### Step 1: Add ContentPilot Models (10 minutes)

1. **Open the schema file:**
   ```bash
   code "shared/prisma/schema.prisma"
   ```

2. **Find insertion point:** Line 182 (after `legacy_content` model, before `conversations`)

3. **Copy models from reference:**
   - Open: `CONTENTPILOT-MODELS-REFERENCE.md`
   - Copy entire "ContentPilot Models" section
   - Paste at line 183 in schema.prisma

4. **Verify syntax:**
   ```bash
   npx prisma format --schema=../shared/prisma/schema.prisma
   ```
   - **Expected:** ✔ Formatted schema.prisma

### Step 2: Uncomment Relations (5 minutes)

1. **User Model (Lines 747-756):**
   - Find comment block: `// ContentPilot CMS & Marketing relations (TODO: Enable when CMS tables are migrated)`
   - Remove `//` from all 9 relation lines
   - Remove the TODO comment, keep header: `// ContentPilot CMS & Marketing relations`

2. **Organization Model (Lines 554-563):**
   - Find comment block: `// ContentPilot CMS & Marketing relations (TODO: Enable when CMS tables are migrated)`
   - Remove `//` from all 9 relation lines
   - Remove the TODO comment, keep header: `// ContentPilot CMS & Marketing relations`

3. **Validate:**
   ```bash
   npx prisma validate --schema=../shared/prisma/schema.prisma
   ```
   - **Expected:** ✔ Schema is valid

### Step 3: Generate Prisma Client (5 minutes)

```bash
npx prisma generate --schema=../shared/prisma/schema.prisma
```

- **Expected Output:**
  ```
  ✔ Generated Prisma Client (x.x.x) in node_modules/@prisma/client
  ```

- **If errors:** Check model syntax, relation names, enum references

### Step 4: Create Migration (10 minutes)

```bash
npx prisma migrate dev --name add_contentpilot_cms_tables --schema=../shared/prisma/schema.prisma
```

- **Expected:**
  - Migration file created in `shared/prisma/migrations/`
  - Migration automatically applied to database
  - 11 new tables visible in database

- **If errors:**
  - Check for conflicting table names
  - Verify database connection
  - Review migration SQL for issues

### Step 5: Apply RLS Policies (10 minutes)

1. **Copy RLS SQL:**
   - Open `CONTENTPILOT-MODELS-REFERENCE.md`
   - Find "RLS Policies SQL Script" section
   - Copy entire SQL script

2. **Execute SQL:**
   - Open Supabase Studio SQL Editor OR
   - Use `psql` or preferred database client
   - Paste and execute RLS SQL

3. **Verify:**
   ```sql
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE tablename LIKE 'content_%' OR tablename LIKE '%campaign%' OR tablename LIKE 'media_%'
   ORDER BY tablename, policyname;
   ```
   - **Expected:** 34 policies listed

### Step 6: Apply Performance Indexes (10 minutes)

1. **Copy Index SQL:**
   - Open `CONTENTPILOT-MODELS-REFERENCE.md`
   - Find "Performance Indexes SQL Script" section
   - Copy entire SQL script

2. **Execute SQL:**
   - Same database client as RLS step
   - Paste and execute index SQL
   - Note: `CONCURRENTLY` means indexes build in background

3. **Verify:**
   ```sql
   SELECT tablename, indexname
   FROM pg_indexes
   WHERE tablename LIKE 'content_%' OR tablename LIKE '%campaign%' OR tablename LIKE 'media_%'
   ORDER BY tablename, indexname;
   ```
   - **Expected:** 10+ indexes listed

### Step 7: TypeScript Validation (5 minutes)

```bash
cd "(platform)"
npx tsc --noEmit
```

- **Expected:** No output (0 errors)
- **If errors:**
  - Review error messages
  - Check relation names match model names
  - Verify enum references are correct

### Step 8: Verify Multi-Tenancy (CRITICAL - 10 minutes)

1. **Test RLS isolation:**
   ```sql
   -- Set org context
   SET app.current_org_id = 'test-org-1';

   -- Insert test content
   INSERT INTO content_items (id, title, slug, content, type, status, organization_id, author_id)
   VALUES ('test-1', 'Test Article', 'test-article', 'Test content', 'ARTICLE', 'DRAFT', 'test-org-1', 'test-user-1');

   -- Should see content
   SELECT * FROM content_items WHERE id = 'test-1';

   -- Switch org context
   SET app.current_org_id = 'test-org-2';

   -- Should NOT see content (empty result)
   SELECT * FROM content_items WHERE id = 'test-1';

   -- Cleanup
   SET app.current_org_id = 'test-org-1';
   DELETE FROM content_items WHERE id = 'test-1';
   ```

2. **Expected Results:**
   - First SELECT: Returns 1 row
   - Second SELECT: Returns 0 rows (RLS blocking)
   - DELETE: Successfully removes test data

---

## ✅ Completion Verification

After completing all steps, verify:

```bash
# From platform directory
cd "(platform)"

# 1. Schema is valid
npx prisma validate --schema=../shared/prisma/schema.prisma

# 2. TypeScript compiles
npx tsc --noEmit

# 3. Tables exist
# (Check via Supabase Studio or database client)

# 4. RLS enabled
# (Run SQL query from Step 6)

# 5. Indexes created
# (Run SQL query from Step 6)
```

**All checks pass? ✅ Session 1 is complete!**

---

## 📊 Expected Results After Completion

### Database Changes

- **Tables Added:** 11 (content_items, content_categories, content_tags, media_assets, media_folders, campaigns, campaign_content, email_campaigns, social_media_posts, content_revisions, content_comments)
- **Enums Added:** 6 (already added: CampaignType, CampaignStatus, EmailStatus, PostStatus, CommentStatus, SocialPlatform)
- **Enums Extended:** 2 (ContentType, ContentStatus)
- **RLS Policies:** 34 (multi-tenancy enforced on all tables)
- **Indexes:** 10+ (performance optimizations)

### Code Changes

- **Models Added:** 11 Prisma models in schema.prisma
- **Relations Updated:** User model (9 new relations), Organization model (9 new relations)
- **TypeScript Types:** Auto-generated by Prisma Client
- **Migration File:** Created in `shared/prisma/migrations/`

---

## 🚨 Common Issues & Solutions

### Issue: "Relation X does not exist"

**Cause:** Relation name mismatch between model and field
**Solution:**
1. Check relation names in User/Organization models
2. Ensure they match model names exactly (case-sensitive)
3. Example: `content_items[]` must point to model named `content_items`

### Issue: "Enum Y is not defined"

**Cause:** Enum not added to schema
**Solution:**
1. Verify all 6 ContentPilot enums exist (lines 1392-1443)
2. Check spelling matches exactly in model
3. Run `npx prisma format` to catch typos

### Issue: Migration fails with "table already exists"

**Cause:** Previous incomplete migration attempt
**Solution:**
1. Check `shared/prisma/migrations/` for partial migrations
2. Roll back incomplete migration if safe
3. Drop conflicting tables manually (if safe)
4. Re-run migration

### Issue: RLS policies not working

**Cause:** `current_setting('app.current_org_id')` not set
**Solution:**
1. Ensure application sets org context before queries
2. Check Supabase configuration for RLS
3. Verify policy SQL executed without errors

### Issue: TypeScript errors after generation

**Cause:** Conflicting types or relation names
**Solution:**
1. Delete `node_modules/.prisma` and `node_modules/@prisma`
2. Re-run `npx prisma generate`
3. Restart TypeScript server in VSCode

---

## 📋 Session 1 Completion Checklist

Copy this to session summary when complete:

- [ ] **11 ContentPilot models added to schema**
- [ ] **Relations uncommented in User model (9 relations)**
- [ ] **Relations uncommented in Organization model (9 relations)**
- [ ] **Prisma schema validates successfully**
- [ ] **Prisma client generated successfully**
- [ ] **Migration created: `add_contentpilot_cms_tables`**
- [ ] **Migration applied to database**
- [ ] **34 RLS policies created and active**
- [ ] **10+ performance indexes created**
- [ ] **TypeScript validation passes (0 errors)**
- [ ] **Multi-tenancy isolation verified with test queries**
- [ ] **All 11 tables visible in Supabase Studio**
- [ ] **Session summary updated with completion status**

---

## 🎯 Next Steps After Session 1

Once Session 1 is complete:

1. **Update Session Summary:**
   - Mark all objectives as complete
   - Update progress percentage to 100%
   - Add verification command outputs

2. **Commit Changes:**
   ```bash
   git add shared/prisma/
   git commit -m "feat(contentpilot): Add ContentPilot CMS database schema

   - Add 11 ContentPilot tables (content, media, campaigns)
   - Implement RLS policies for multi-tenancy
   - Add performance indexes
   - Extend ContentType and ContentStatus enums
   - Add 6 new ContentPilot-specific enums

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Proceed to Session 2:**
   - Read `session2.plan.md`
   - Start building content management backend
   - Implement Zod validation schemas
   - Create content server actions

---

## 📞 Need Help?

**Reference Documents:**
- Full models: `CONTENTPILOT-MODELS-REFERENCE.md`
- Session summary: `session1-summary.md`
- Original plan: `session1.plan.md`
- Todo list: `.todo.md`

**Verification Scripts:**
All SQL verification queries are in `CONTENTPILOT-MODELS-REFERENCE.md`

---

**Document Version:** 1.0
**Status:** READY TO USE
**Estimated Completion Time:** 30-60 minutes
**Last Updated:** 2025-10-05
