# Transaction Dashboard Integration - Session Start Prompt

**Use this prompt at the start of each session. Just change the session number!**

---

## 📋 Session Start Prompt Template

```
I'm starting Session [session1] of the Transaction Management Dashboard integration.

Please follow these steps:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file to understand all development standards and critical rules
   - Pay special attention to:
     - READ-BEFORE-EDIT mandate
     - Multi-tenancy requirements (RLS, organizationId)
     - RBAC enforcement patterns
     - Security mandates
     - Testing requirements (80%+ coverage)
     - File size limits (500 lines max)

2. **Read Session Plan:**
   - Read the session plan file: `session[1]-*.plan.md`
   - Review all phases and task breakdowns
   - Understand success criteria
   - Note all files to create/update
   - Identify dependencies and integration points

3. **Create Detailed To-Do List:**
   - Use the TodoWrite tool to create a comprehensive to-do list
   - Break down each phase into granular, actionable tasks
   - Include all checkboxes from the session plan
   - Add tasks for:
     - File creation/updates
     - Testing (unit, integration)
     - Type checking
     - Linting
     - Documentation updates
   - Mark the first task as "in_progress"

4. **Execute Session Tasks:**
   - Follow the session plan phases in order
   - Update todo list as you complete tasks
   - Read files before editing (READ-BEFORE-EDIT mandate)
   - Run tests after each major change
   - Verify TypeScript compilation
   - Check for linting errors

5. **Database Operations (IMPORTANT):**
   - Use Supabase MCP tools for ALL database operations:
     - `mcp__supabase__list_tables` - View tables
     - `mcp__supabase__apply_migration` - Create migrations
     - `mcp__supabase__execute_sql` - Run SQL queries
     - `mcp__supabase__list_migrations` - Check migration status
   - DO NOT use npx prisma commands directly
   - Generate Prisma client after migrations: `npx prisma generate --schema=../shared/prisma/schema.prisma`

6. **Validation & Testing:**
   - Run type check: `npx tsc --noEmit`
   - Run linter: `npm run lint`
   - Run tests: `npm test [module-name]`
   - Check coverage: `npm test -- --coverage`
   - Verify all success criteria from session plan

7. **Session Summary:**
   - At the end of the session, create a summary file: `session[SESSION_NUMBER]-summary.md`
   - Include:
     - ✅ Completed tasks
     - 📁 Files created/updated
     - 🧪 Tests added/passing
     - ⚠️ Known issues or blockers
     - 📝 Notes for next session
     - 🔗 Integration points verified

Let's begin with Session [SESSION_NUMBER]!
```

---

## 🔄 How to Use This Prompt

### Step 1: Copy the Prompt
Copy the entire prompt template above

### Step 2: Replace Session Number
Replace `[1]` with the actual session number (1, 2, 3, etc.)

Example for Session 1:
```
I'm starting Session 1 of the Transaction Management Dashboard integration.
```

### Step 3: Paste and Execute
Paste the complete prompt into your chat with Claude

---

## 📝 Example: Starting Session 1

```
I'm starting Session 1 of the Transaction Management Dashboard integration.

Please follow these steps:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file to understand all development standards and critical rules
   - Pay special attention to:
     - READ-BEFORE-EDIT mandate
     - Multi-tenancy requirements (RLS, organizationId)
     - RBAC enforcement patterns
     - Security mandates
     - Testing requirements (80%+ coverage)
     - File size limits (500 lines max)

2. **Read Session Plan:**
   - Read the session plan file: `session[1]-*.plan.md`
   - Review all phases and task breakdowns
   - Understand success criteria
   - Note all files to create/update
   - Identify dependencies and integration points

3. **Create Detailed To-Do List:**
   - Use the TodoWrite tool to create a comprehensive to-do list
   - Break down each phase into granular, actionable tasks
   - Include all checkboxes from the session plan
   - Add tasks for:
     - File creation/updates
     - Testing (unit, integration)
     - Type checking
     - Linting
     - Documentation updates
   - Mark the first task as "in_progress"

4. **Execute Session Tasks:**
   - Follow the session plan phases in order
   - Update todo list as you complete tasks
   - Read files before editing (READ-BEFORE-EDIT mandate)
   - Run tests after each major change
   - Verify TypeScript compilation
   - Check for linting errors

5. **Database Operations (IMPORTANT):**
   - Use Supabase MCP tools for ALL database operations:
     - `mcp__supabase__list_tables` - View tables
     - `mcp__supabase__apply_migration` - Create migrations
     - `mcp__supabase__execute_sql` - Run SQL queries
     - `mcp__supabase__list_migrations` - Check migration status
   - DO NOT use npx prisma commands directly
   - Generate Prisma client after migrations: `npx prisma generate --schema=../shared/prisma/schema.prisma`

6. **Validation & Testing:**
   - Run type check: `npx tsc --noEmit`
   - Run linter: `npm run lint`
   - Run tests: `npm test [module-name]`
   - Check coverage: `npm test -- --coverage`
   - Verify all success criteria from session plan

7. **Session Summary:**
   - At the end of the session, create a summary file: `session1-summary.md`
   - Include:
     - ✅ Completed tasks
     - 📁 Files created/updated
     - 🧪 Tests added/passing
     - ⚠️ Known issues or blockers
     - 📝 Notes for next session
     - 🔗 Integration points verified

Let's begin with Session 1!
```

---

## 📋 Session Summary Template

At the end of each session, create a summary using this template:

```markdown
# Session [N] Summary - [Session Title]

**Date:** [Date]
**Duration:** [Actual time taken]
**Status:** ✅ Complete / ⏸️ In Progress / ❌ Blocked

---

## ✅ Completed Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## 📁 Files Created

```
path/to/file1.ts
path/to/file2.tsx
path/to/file3.test.ts
```

## 📝 Files Updated

```
existing/file1.ts
existing/file2.tsx
```

## 🧪 Testing

- **Tests Added:** [Number]
- **Tests Passing:** [Number/Total]
- **Coverage:** [Percentage]%
- **Type Check:** ✅ Pass / ❌ Fail
- **Lint Check:** ✅ Pass / ❌ Fail

## ⚠️ Issues & Blockers

- Issue 1: [Description]
- Issue 2: [Description]

## 📝 Notes for Next Session

- Note 1
- Note 2

## 🔗 Integration Points Verified

- [ ] Integration point 1
- [ ] Integration point 2

## 📊 Session Metrics

- **Files Changed:** [Number]
- **Lines Added:** [Number]
- **Lines Removed:** [Number]
- **Commits Made:** [Number]

---

**Next Session:** Session [N+1] - [Title]
```

---

## 🎯 Quick Reference

### Before Starting
- [ ] Have session plan file ready
- [ ] Environment variables set
- [ ] Database connection verified
- [ ] All dependencies installed

### During Session
- [ ] Follow plan phases sequentially
- [ ] Update todos as you progress
- [ ] Test after each major change
- [ ] Read files before editing
- [ ] Use Supabase MCP for database ops

### After Session
- [ ] All tests passing
- [ ] Type check passes
- [ ] Lint check passes
- [ ] Create session summary
- [ ] Commit changes (if applicable)

---

## 🔧 Common Commands Reference

### Database (via Supabase MCP)
```typescript
// View current tables
mcp__supabase__list_tables()

// Apply migration
mcp__supabase__apply_migration({
  name: "add_transaction_models",
  query: "CREATE TABLE ..."
})

// Execute SQL
mcp__supabase__execute_sql({
  query: "SELECT * FROM transaction_loops LIMIT 5"
})

// Check migrations
mcp__supabase__list_migrations()
```

### Prisma
```bash
# Generate client (after migrations)
npx prisma generate --schema=../shared/prisma/schema.prisma

# View database
npx prisma studio --schema=../shared/prisma/schema.prisma
```

### Testing
```bash
# Run specific module tests
npm test modules/transactions

# Run with coverage
npm test -- --coverage

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## ⚠️ Critical Reminders

1. **ALWAYS read files before editing** (READ-BEFORE-EDIT mandate)
2. **ALWAYS use Supabase MCP tools** for database operations
3. **ALWAYS filter by organizationId** in queries
4. **ALWAYS validate input with Zod** schemas
5. **ALWAYS create session summary** at the end
6. **ALWAYS check RBAC permissions** before mutations
7. **ALWAYS run tests** before marking session complete

---

**Last Updated:** 2025-10-04
**Version:** 1.0
