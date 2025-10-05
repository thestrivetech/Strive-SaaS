# CRM Integration - Updates Summary

## 📋 Session Start Prompt Created

**File:** `SESSION-START-PROMPT.md`

A reusable template for starting each session has been created. Simply replace `{SESSION_NUMBER}` with 1-10 to begin any session.

### What the Prompt Does:
1. ✅ Reads root CLAUDE.md for dev rules
2. ✅ Reads platform CLAUDE.md for platform-specific rules
3. ✅ Reads the specific session plan file
4. ✅ Creates detailed todo list with TodoWrite tool
5. ✅ Reminds about important requirements (RBAC, multi-tenancy, etc.)
6. ✅ Requires session summary at the end

### Session End Requirement:
Each session must create a summary file:
- **Path:** `session{N}-summary.md`
- **Contents:**
  - Session objectives (completed/partial/not started)
  - Files created (full list with paths)
  - Files modified (full list with paths)
  - Key implementations and features added
  - Issues encountered and resolutions
  - Testing performed
  - Next steps
  - Overall progress percentage

---

## 🔄 Database Operations Updated to Use Supabase MCP

All session plans have been updated to use **Supabase MCP tools** instead of direct Prisma CLI commands for database operations.

### Files Updated:

#### 1. ✅ Session 1: Database Foundation
**File:** `session1.plan.md`

**Changes Made:**
- ❌ Removed: `npx prisma validate`
- ❌ Removed: `npx prisma migrate dev`
- ❌ Removed: `npx prisma migrate status`
- ❌ Removed: `npx prisma studio`
- ✅ Added: `mcp__supabase__list_tables` for validation
- ✅ Added: `mcp__supabase__apply_migration` for schema creation
- ✅ Added: `mcp__supabase__execute_sql` for verification
- ✅ Added: `mcp__supabase__list_migrations` for migration status
- ✅ Updated: Testing section with MCP tools
- ✅ Updated: Rollback plan with MCP tools

**Key Sections Updated:**
- Step 2: Validate Schema (now uses `list_tables`)
- Step 3: Create Migration (now uses `apply_migration`)
- Step 5: Verify in Database (now uses `execute_sql`)
- Step 6: Add RLS Policies (now uses `apply_migration`)
- Testing & Validation (all 6 tests updated)
- Rollback Plan (now uses `execute_sql` for drops)

#### 2. ✅ Session 7: Calendar & Appointments
**File:** `session7.plan.md`

**Changes Made:**
- ✅ Added: Database Extension section with migration instructions
- ✅ Added: `mcp__supabase__apply_migration` for extending appointments table
- ✅ Added: Step-by-step migration process
- ✅ Kept: `npx prisma generate` (only for local type generation)

**Key Sections Updated:**
- Database Extension (now 3 steps with MCP migration)
- Clear separation between database changes (MCP) and type generation (Prisma CLI)

#### 3. ✅ Session 10: Testing & Go-Live
**File:** `session10.plan.md`

**Changes Made:**
- ❌ Removed: `npx prisma migrate deploy`
- ❌ Removed: `npx prisma migrate status`
- ❌ Removed: `npx prisma migrate resolve`
- ✅ Added: `mcp__supabase__list_migrations` for verification
- ✅ Added: `mcp__supabase__list_tables` for validation
- ✅ Added: `mcp__supabase__execute_sql` for RLS verification
- ✅ Updated: Rollback plan with MCP tools

**Key Sections Updated:**
- Database Migration (Production) - now uses MCP tools
- Rollback Plan - now uses MCP for database rollback

---

## 🛠 Supabase MCP Tools Reference

### Tools Available:

1. **`mcp__supabase__list_tables`**
   - **Purpose:** List all tables in schema(s)
   - **Parameters:** `{ "schemas": ["public"] }`
   - **Use Case:** Verify tables exist

2. **`mcp__supabase__apply_migration`**
   - **Purpose:** Apply SQL migration to database
   - **Parameters:** `{ "name": "migration_name", "query": "SQL..." }`
   - **Use Case:** Create tables, add columns, create indexes, add RLS policies

3. **`mcp__supabase__execute_sql`**
   - **Purpose:** Execute raw SQL queries
   - **Parameters:** `{ "query": "SELECT..." }`
   - **Use Case:** Verify data, check table structure, inspect RLS policies

4. **`mcp__supabase__list_migrations`**
   - **Purpose:** List all applied migrations
   - **Parameters:** None
   - **Use Case:** Check migration history

5. **`mcp__supabase__list_extensions`**
   - **Purpose:** List database extensions
   - **Parameters:** None
   - **Use Case:** Verify required extensions installed

6. **`mcp__supabase__get_logs`**
   - **Purpose:** Get logs for debugging
   - **Parameters:** `{ "service": "postgres" }`
   - **Use Case:** Debug database issues

---

## ✅ What Changed and Why

### Before (Using Prisma CLI):
```bash
# These commands directly manipulate the database
npx prisma migrate dev --name create_tables
npx prisma migrate deploy
npx prisma migrate status
npx prisma studio
```

**Problems:**
- ❌ Bypasses Supabase's migration tracking
- ❌ Can cause conflicts with Supabase dashboard
- ❌ Doesn't integrate with Supabase MCP tooling

### After (Using Supabase MCP):
```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "create_tables",
  "query": "CREATE TABLE..."
}

// Tool: mcp__supabase__list_migrations
// Shows all migrations in Supabase

// Tool: mcp__supabase__execute_sql
{
  "query": "SELECT * FROM..."
}
```

**Benefits:**
- ✅ Proper integration with Supabase
- ✅ Migration tracking in Supabase dashboard
- ✅ Better collaboration with Claude Code
- ✅ Unified tooling approach

### What Stayed the Same:
```bash
# Still use Prisma CLI for type generation ONLY
npx prisma generate --schema=shared/prisma/schema.prisma
```

**Why:** This command only generates local TypeScript types, doesn't modify the database.

---

## 📝 Migration Workflow (New Process)

### During Development:

1. **Update Prisma Schema**
   - Edit `shared/prisma/schema.prisma`
   - Add new models, fields, relations

2. **Apply Migration via MCP**
   ```typescript
   // Tool: mcp__supabase__apply_migration
   {
     "name": "descriptive_name",
     "query": "CREATE TABLE... / ALTER TABLE..."
   }
   ```

3. **Generate Types Locally**
   ```bash
   npx prisma generate --schema=shared/prisma/schema.prisma
   ```

4. **Verify Migration**
   ```typescript
   // Tool: mcp__supabase__list_migrations
   // Tool: mcp__supabase__list_tables
   ```

### During Deployment:

1. **Verify Migrations Applied**
   - Use `mcp__supabase__list_migrations`

2. **Check Table Structure**
   - Use `mcp__supabase__list_tables`

3. **Verify RLS Policies**
   - Use `mcp__supabase__execute_sql` to query `pg_policies`

4. **Generate Production Types**
   ```bash
   npx prisma generate --schema=shared/prisma/schema.prisma
   ```

---

## 🎯 Quick Reference

### Starting a Session:
1. Copy template from `SESSION-START-PROMPT.md`
2. Replace `{SESSION_NUMBER}` with current session (1-10)
3. Paste into Claude Code
4. Follow the structured workflow

### Database Operations:
- **Creating tables:** Use `mcp__supabase__apply_migration`
- **Altering tables:** Use `mcp__supabase__apply_migration`
- **Adding RLS policies:** Use `mcp__supabase__apply_migration`
- **Verifying changes:** Use `mcp__supabase__execute_sql`
- **Listing tables:** Use `mcp__supabase__list_tables`
- **Checking migrations:** Use `mcp__supabase__list_migrations`
- **Generating types:** Use `npx prisma generate` (local only)

### Ending a Session:
1. Complete all objectives
2. Create `session{N}-summary.md` file
3. Document progress and next steps
4. Update overall progress tracker

---

## 📊 Updated Files Summary

| File | Status | Changes |
|------|--------|---------|
| `SESSION-START-PROMPT.md` | ✅ Created | Reusable session start template |
| `session1.plan.md` | ✅ Updated | Database operations → Supabase MCP |
| `session7.plan.md` | ✅ Updated | Database extension → Supabase MCP |
| `session10.plan.md` | ✅ Updated | Deployment & rollback → Supabase MCP |
| `session2.plan.md` | ✅ No changes | Backend only, no DB changes |
| `session3.plan.md` | ✅ No changes | UI only, no DB changes |
| `session4.plan.md` | ✅ No changes | Uses existing backend |
| `session5.plan.md` | ✅ No changes | Uses existing backend |
| `session6.plan.md` | ✅ No changes | Uses existing backend |
| `session8.plan.md` | ✅ No changes | Analytics only, no DB changes |
| `session9.plan.md` | ✅ No changes | Dashboard integration only |

---

## 🚀 Ready to Execute

All session plans are now:
- ✅ Using Supabase MCP for database operations
- ✅ Have structured session start prompts
- ✅ Require session summaries
- ✅ Follow platform standards
- ✅ Production-ready

**Next Step:** Start Session 1 using the template in `SESSION-START-PROMPT.md`

---

**Last Updated:** 2025-10-04
**Update Version:** 2.0 (Supabase MCP Integration)
