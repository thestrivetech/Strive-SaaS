# Scripts

Utility scripts for the Strive SaaS project.

## Available Scripts

### `generate-directory-map.js`

Generates comprehensive project directory structure maps in both text and JSON formats.

**Usage:**
```bash
node scripts/generate-directory-map.js
```

**Outputs:**
- `project-directory-map.txt` - Human-readable tree structure (root directory)
- `project-directory-map.json` - Machine-readable JSON format (root directory)

**Features:**
- 📁 Respects .gitignore patterns
- 🚫 Excludes node_modules, .next, build folders
- 📊 Shows file sizes and statistics
- 🎨 Uses emojis for file types
- 📈 Provides summary statistics

**Configuration:**
- Excluded directories: node_modules, .next, .vercel, .git, dist, build, .cache, .turbo, .claude, .serena
- Excluded files: .DS_Store, .env.local, package-lock.json, etc.
- Excluded extensions: .log, .lock

### `database/` - Database Management Scripts

**⚠️ CRITICAL:** These scripts solve the massive token usage problem when working with database schemas.

**Problem:** Supabase MCP `list_tables` tool returns 18-21k tokens per call, devastating the context window.
**Solution:** Local schema documentation files that can be read for ~500 tokens (99% reduction).

#### Available Scripts

**`generate-schema-docs.js`** - Schema Documentation Generator
- **Purpose:** Generates human-readable schema documentation from Prisma schema
- **Usage:** `node scripts/database/generate-schema-docs.js` or `npm run db:docs` (from platform directory)
- **Outputs:**
  - `shared/prisma/SCHEMA-QUICK-REF.md` - Quick reference (~50 lines)
  - `shared/prisma/SCHEMA-MODELS.md` - All models with fields (~500 lines)
  - `shared/prisma/SCHEMA-ENUMS.md` - All enums with values (~200 lines)
- **When to run:** After ANY schema changes
- **Token savings:** 99% (18k → 500 tokens per schema query)

**`create-migration.js`** - Interactive Migration Creator
- **Purpose:** Streamlined Prisma migration creation with automatic documentation updates
- **Usage:** `node scripts/database/create-migration.js` or `npm run db:migrate`
- **Features:**
  - Interactive CLI prompts for migration name
  - Validates snake_case naming
  - Generates migration using Prisma
  - Automatically updates schema documentation
  - Provides next steps guidance

**`apply-migration.js`** - Migration Application Guide
- **Purpose:** Shows latest migration SQL and provides application instructions
- **Usage:** `node scripts/database/apply-migration.js` or `npm run db:apply`
- **Features:**
  - Displays migration SQL for review
  - Provides multiple application methods (Claude MCP, Supabase Dashboard, Prisma Deploy)
  - Post-migration checklist
  - Safety warnings for production

**`migration-status.js`** - Migration Status Checker
- **Purpose:** Shows migration history and checks for pending schema changes
- **Usage:** `node scripts/database/migration-status.js` or `npm run db:status`
- **Features:**
  - Lists all migrations with dates
  - Shows latest migration
  - Detects pending schema changes
  - Provides quick stats
  - Suggests next steps

**`check-schema-sync.js`** - Schema Drift Detector
- **Purpose:** Verifies local schema matches database structure
- **Usage:** `node scripts/database/check-schema-sync.js` or `npm run db:sync`
- **Features:**
  - Checks schema-database synchronization
  - Detects schema drift
  - Identifies unapplied migrations
  - Provides remediation steps

#### Workflow Example

```bash
# 1. Make schema changes
# Edit: shared/prisma/schema.prisma

# 2. Create migration (from platform directory)
npm run db:migrate
# Prompts for name, creates migration, updates docs

# 3. Check status
npm run db:status
# Shows pending migrations

# 4. Apply migration
npm run db:apply
# Shows SQL and instructions for Claude/Supabase

# 5. Verify
npm run db:sync
# Confirms schema is in sync
```

#### Best Practices

**DO:**
- ✅ Read `SCHEMA-QUICK-REF.md` before asking about schema
- ✅ Use helper scripts for all database operations
- ✅ Run `npm run db:docs` after ANY schema changes
- ✅ Commit schema + migrations + documentation together
- ✅ Use MCP tools ONLY for applying migrations, not exploration

**DON'T:**
- ❌ Use MCP `list_tables` for schema inspection (18k tokens!)
- ❌ Query database to see what tables exist (read docs instead)
- ❌ Create migrations without updating documentation
- ❌ Bypass helper scripts (they ensure consistency)

---

## Adding New Scripts

1. Create a new `.js` file in this directory
2. Add a shebang line: `#!/usr/bin/env node`
3. Document it in this README
4. Make it executable: `chmod +x scripts/your-script.js` (Unix/Mac)

## Notes

- All scripts run from the project root directory
- Scripts should be Node.js compatible (no TypeScript)
- Keep scripts focused and single-purpose
- Add error handling and helpful console output
