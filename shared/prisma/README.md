# Prisma Schema Documentation

**Location:** `shared/prisma/schema.prisma`
**Projects:** (chatbot), (platform), (website)
**Database:** Supabase PostgreSQL

---

## 📊 Quick Stats

- **Models:** 83 (see SCHEMA-QUICK-REF.md for complete list)
- **Enums:** 76
- **Projects:** 3 (all share this schema)
- **Database Provider:** Supabase (PostgreSQL)

---

## 📖 Documentation Files

This directory contains **automatically generated** schema documentation to prevent expensive database queries:

### `SCHEMA-QUICK-REF.md` - Quick Reference
- **Size:** ~50 lines
- **Token Cost:** ~500 tokens (vs 18k from MCP `list_tables`)
- **Use for:** "What tables exist?", "What enums are available?"
- **Updates:** Run `npm run db:docs` after schema changes

### `SCHEMA-MODELS.md` - Model Details
- **Size:** ~500 lines
- **Content:** All models with fields and types
- **Use for:** "What fields does X have?", "What's the structure of Y?"
- **Format:** Markdown tables (easy to read and search)

### `SCHEMA-ENUMS.md` - Enum Values
- **Size:** ~200 lines
- **Content:** All enums with possible values
- **Use for:** "What are valid values for X enum?"
- **Format:** TypeScript-style enum blocks

---

## ⚠️ CRITICAL: Token Savings

**Problem:**
- Supabase MCP `list_tables` tool returns **18-21k tokens per call**
- Multiple schema queries per session = **40-60k tokens wasted**
- Devastating to context window and usage

**Solution:**
- Read local documentation files instead (~500 tokens)
- **99% token reduction** (18k → 500 tokens)
- Documentation stays in sync with schema via helper scripts

**DO:**
```bash
✅ cat shared/prisma/SCHEMA-QUICK-REF.md  # Fast, local, 500 tokens
✅ npm run db:docs                       # Update after schema changes
✅ git add shared/prisma/                # Commit docs with schema
```

**DON'T:**
```typescript
❌ Use MCP list_tables tool              // 18k tokens wasted!
❌ Query database for schema inspection  // Slow and expensive
❌ Skip documentation updates            // Docs become stale
```

---

## 🔧 Database Workflow

### 1. Schema Inspection

**When you need to know about the schema:**

```bash
# Quick reference (model & enum names only)
cat shared/prisma/SCHEMA-QUICK-REF.md

# Detailed model fields
cat shared/prisma/SCHEMA-MODELS.md

# Enum values
cat shared/prisma/SCHEMA-ENUMS.md
```

**⚠️ NEVER use MCP `list_tables` for this!** (18k tokens vs 500 tokens)

### 2. Making Schema Changes

**Step-by-step workflow:**

```bash
# 1. Edit the schema
vim shared/prisma/schema.prisma

# 2. Navigate to platform directory
cd (platform)/

# 3. Create migration (interactive)
npm run db:migrate
# - Prompts for migration name (snake_case)
# - Generates migration SQL
# - Updates documentation automatically

# 4. Check status
npm run db:status
# - Shows migration history
# - Detects pending changes

# 5. Review migration SQL
npm run db:apply
# - Shows SQL to be applied
# - Provides application instructions
```

### 3. Applying Migrations

**Option 1: Using Claude Code (Recommended)**

Ask Claude to apply the migration:
```
"Apply the latest migration to Supabase production"
```

Claude will use: `mcp__supabase-production__apply_migration`

**Option 2: Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. SQL Editor → Paste migration SQL
4. Run

**Option 3: Production Deployment**

```bash
npx prisma migrate deploy --schema=shared/prisma/schema.prisma
```

⚠️ **Only use in production environments!**

### 4. Verification

```bash
# Check if schema matches database
npm run db:sync

# View database in GUI
npm run prisma:studio

# Test application
npm run dev
```

---

## 📋 Helper Scripts

All database scripts are in: `../../scripts/database/`

**From (platform)/ directory:**

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run db:docs` | Generate schema documentation | After ANY schema changes |
| `npm run db:status` | Check migration status | Before creating migrations |
| `npm run db:migrate` | Create migration (interactive) | After schema changes |
| `npm run db:apply` | View migration SQL & instructions | Before applying to database |
| `npm run db:sync` | Check for schema drift | After applying migrations |

**Direct Script Execution:**

```bash
# From repository root:
node scripts/database/generate-schema-docs.js
node scripts/database/migration-status.js
node scripts/database/create-migration.js
node scripts/database/apply-migration.js
node scripts/database/check-schema-sync.js
```

---

## 🎯 Common Tasks

### "What tables exist in the database?"

```bash
cat shared/prisma/SCHEMA-QUICK-REF.md
# Shows all models categorized by type (Core, CRM, Transactions, etc.)
```

### "What fields does the `users` table have?"

```bash
grep -A 20 "## users" shared/prisma/SCHEMA-MODELS.md
# Shows all fields with types
```

### "What are the valid values for `UserRole` enum?"

```bash
grep -A 10 "## UserRole" shared/prisma/SCHEMA-ENUMS.md
# Shows all enum values
```

### "I changed the schema, now what?"

```bash
cd (platform)/
npm run db:migrate      # Creates migration + updates docs
npm run db:apply        # Shows SQL and instructions
# Then apply via Claude or Supabase dashboard
npm run db:sync         # Verify everything matches
```

### "Are my migrations applied to the database?"

```bash
cd (platform)/
npm run db:status       # Shows migration history + pending changes
npm run db:sync         # Checks schema-database sync
```

---

## 🚨 Important Notes

### Multi-Project Architecture

This schema is **shared across 3 projects:**
- `(chatbot)/` - AI Chatbot Widget
- `(platform)/` - Main SaaS Platform
- `(website)/` - Marketing Website

**All projects use the SAME Supabase database.**

### Schema Changes Affect All Projects

When you modify the schema:
1. All 3 projects must regenerate Prisma client
2. All 3 projects may need code updates
3. Test all 3 projects after schema changes

```bash
# Regenerate Prisma client in each project:
cd (platform) && npx prisma generate --schema=../shared/prisma/schema.prisma
cd (chatbot)  && npx prisma generate --schema=../shared/prisma/schema.prisma
cd (website)  && npx prisma generate --schema=../shared/prisma/schema.prisma
```

### Migration Safety

- ✅ **DO:** Test migrations locally first
- ✅ **DO:** Review migration SQL before applying
- ✅ **DO:** Backup production database before major changes
- ✅ **DO:** Update documentation after schema changes
- ❌ **DON'T:** Apply migrations directly to production without testing
- ❌ **DON'T:** Use `prisma db push` in production (dev only!)
- ❌ **DON'T:** Skip migrations (breaks reproducibility)

### Documentation Maintenance

**Documentation must stay in sync with schema!**

```bash
# ALWAYS run after schema changes:
npm run db:docs

# Commit together:
git add shared/prisma/schema.prisma
git add shared/prisma/migrations/
git add shared/prisma/*.md
git commit -m "feat: add user preferences table"
```

---

## 🔗 Related Documentation

- **Root CLAUDE.md:** `../../CLAUDE.md` - Repository overview + database workflow
- **Platform CLAUDE.md:** `../../(platform)/CLAUDE.md` - Platform-specific database rules
- **Scripts README:** `../../scripts/README.md` - All available scripts
- **Database Scripts:** `../../scripts/database/` - Helper script source code

---

## 📞 Quick Help

**Problem:** "I'm getting schema drift errors"
- **Solution:** Run `npm run db:sync` to see what's out of sync
- **Cause:** Schema changed but migration not applied
- **Fix:** Create and apply migration

**Problem:** "Claude is using too many tokens for database queries"
- **Solution:** Point Claude to `SCHEMA-QUICK-REF.md` instead
- **Cause:** Using MCP `list_tables` tool (18k tokens!)
- **Fix:** Read local documentation (500 tokens)

**Problem:** "My migration failed to apply"
- **Solution:** Check `npm run db:status` for pending migrations
- **Cause:** Migration SQL may have errors or dependencies
- **Fix:** Review migration SQL, fix errors, try again

**Problem:** "Documentation is out of date"
- **Solution:** Run `npm run db:docs` to regenerate
- **Cause:** Schema changed but docs not updated
- **Fix:** Always run `npm run db:docs` after schema changes

---

**Last Updated:** 2025-10-06
**Schema Version:** See latest migration in `migrations/` directory
