# Platform Project - Session Start Prompt

**Session:** session[2].md
**Project:** Strive Tech SaaS Platform (app.strivetech.ai)
**Working Directory:** `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)`

---

## =� Session Initialization

Before starting work, Claude should read the following files IN ORDER:

### 1. Project Standards & Architecture (REQUIRED)
```
Read these files to understand development rules and architecture:

1. ../CLAUDE.md - Root repository standards (shared across all projects)
2. ./CLAUDE.md - Platform-specific development rules (multi-tenancy, RBAC, modules)
3. ./PLAN.md - Platform production roadmap
4. ./README.md - Project overview and setup instructions
5. ../README.md - Repository overview (tri-fold structure)

-> Read session current plan: session[2]-plan.md file located here to see this sessions plan: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\SESSION[2]-PLAN.md
```

### 2. Current Project State (ASSESS)
```
Assess the current state by checking:

- ./app/ structure - Verify Next.js App Router conventions
- ./app/layout.tsx - Ensure root layout exists (NOT in app/styling/)
- ./app/page.tsx - Ensure root page exists
- ./app/globals.css - Ensure global styles exist
- ./lib/database/prisma.ts - Verify Prisma client connection to ../shared/prisma/
- ./package.json - Check scripts point to shared Prisma schema
```

### 3. Key Architectural Principles
```
This platform follows:

 Next.js 15 App Router with Server Components as default
 Shared Prisma schema at ../shared/prisma/schema.prisma
 Supabase for auth, storage, realtime (works WITH Prisma)
 Multi-tenant architecture with Row Level Security (RLS)
 RBAC - Dual-role system (global + organization roles)
 Module system (lib/modules/) - self-contained feature modules
 Industry-as-plugin architecture (lib/industries/)
 Tool marketplace (lib/tools/) - shared & industry-specific
 80% test coverage minimum (TDD approach)
 Files under 500 lines (hard limit)
```

---

## <� Session Workflow

### At Session Start:
1. **Read context files** (listed above)
2. **Understand current task** from user
3. **Create todo list** using TodoWrite tool for multi-step tasks
4. **Search for existing code** before creating new files (use Glob/Grep)

### During Session:
1. **Read before editing** - Always use Read tool before Edit/Write
2. **Test-Driven Development** - Write tests BEFORE implementation
3. **Server Components first** - Only add "use client" when absolutely necessary
4. **Validate all inputs** - Use Zod schemas for forms and Server Actions
5. **Update todos** - Mark tasks as in_progress/completed in real-time
6. **Reference line numbers** - Use `file:line` format when mentioning code

### Critical Reminders:
- L NEVER create files in app/styling/ (root files go in app/)
- L NEVER skip Prisma client generation after schema changes
- L NEVER expose SUPABASE_SERVICE_ROLE_KEY to client
- L NEVER create cross-module imports (crm/ � projects/)
- L NEVER bypass RLS - always filter by organizationId
-  ALWAYS run: `npm run lint && npx tsc --noEmit && npm test`

---

## =� Session End Requirements

At the end of this session, create:

**File:** `./update-sessions/session[n]_summary.md` (under 1000 lines)

**Required sections:**
```markdown
# Platform Session [n] Summary

**Date:** [auto-fill]
**Duration:** [estimate]
**Status:**  Complete / � Partial / L Blocked

## Session Goal
[What we planned to accomplish]

## Changes Made
- `app/dashboard/page.tsx:45-67` - Added admin dashboard layout
- `lib/modules/crm/actions.ts:new` - Created customer CRUD actions
- `__tests__/modules/crm/actions.test.ts:new` - Added CRM tests (90% coverage)

## Tests Written - OR UPDATED SINCE THEY ALREADY EXIST!
- Unit tests: [count] new tests
- Integration tests: [count] new tests
- Coverage: [%] (target: 80%+)

## Multi-Tenancy & RBAC
- RLS policies: [enabled/verified on which tables]
- RBAC checks: [which routes/actions protected]
- Organization isolation: [verified/tested]

## Issues Encountered
1. **Issue:** [Description]
   **Resolution:** [How it was fixed]

## Next Steps
[Recommended actions for next session]

## Commands Run
```bash
npm run prisma:generate
npm run lint && npx tsc --noEmit && npm test
npm run build
```

## Verification
- /L Build successful
- /L All tests passing (XX% coverage)
- /L Zero TypeScript errors
- /L Zero ESLint warnings
- /L RLS policies enforced
- /L RBAC working correctly

## Architecture Notes
[Any architectural decisions or patterns used]
```

---

## =� Ready to Start

Now that context is loaded, ask the user:
**"What would you like to work on in this session?"**

Then create a todo list and begin work following TDD and Next.js best practices.
