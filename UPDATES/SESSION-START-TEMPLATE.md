# Session Start Template

**Copy this entire prompt into Claude Code. Just change the session number.**

---

## 📋 AGENT INVOCATION TEMPLATE

```markdown
Execute deployment readiness session following Claude agent best practices.

---

## SESSION TO EXECUTE


**Session File:** Read UPDATES/session-[3.4]-*.md

---

MUST READ: 1. `.claude/agents/single-agent-usage-guide.md` - Agent best practices

## AGENT TASK

**READ FIRST:**
1. `UPDATES/session-[3.4]-*.md` - Complete session requirements
2. `(platform)/CLAUDE.md` - Platform-specific rules

**EXECUTE:**
Follow ALL instructions in the session file exactly:
- Read all "Requirements" sections
- Execute all tasks in order
- Run all verification commands
- Provide complete command outputs (not summaries)

---

## 🔒 MANDATORY REQUIREMENTS

### Database Workflow (99% Token Savings)

**✅ ALWAYS use local documentation:**
```bash
cd (platform)

# Read these files (500 tokens total):
cat prisma/SCHEMA-QUICK-REF.md    # Model names
cat prisma/SCHEMA-MODELS.md       # Field details
cat prisma/SCHEMA-ENUMS.md        # Enum values
```

**❌ NEVER use MCP tools:**
```
MCP list_tables: 18,000-21,000 tokens (wasteful!)
```

### Security Requirements (EVERY Session)

**Multi-Tenancy:**
- Filter ALL queries by `organizationId`
- Use `setTenantContext()` before Prisma queries
- Verify RLS policies active

**RBAC:**
- Check BOTH GlobalRole AND OrganizationRole
- Validate permissions in all Server Actions
- Test different user roles

**Subscription Tiers:**
- Validate feature access against tier (FREE/CUSTOM/STARTER/GROWTH/ELITE/ENTERPRISE)
- Show upgrade prompts for insufficient tiers

**Input Validation:**
- Use Zod schemas for ALL user input
- Validate before processing

---

## 🧪 VERIFICATION (REQUIRED)

**Every session MUST verify:**

```bash
cd (platform)

# TypeScript check
npx tsc --noEmit
# Expected: No errors found

# Linting
npm run lint
# Expected: Zero errors (warnings OK unless session fixes them)

# Build
npm run build
# Expected: Successful build

# Tests (if applicable)
npm test
# Expected: All tests passing
```

**Manual Testing:**
- Test all functionality modified
- Verify multi-tenancy isolation
- Check RBAC permissions
- Test on mobile viewport (if UI changes)

---

## 📊 SUCCESS CRITERIA

**DO NOT report success unless:**

✅ All requirements from session file completed
✅ ALL verification commands executed
✅ Command outputs provided (not summaries)
✅ Zero TypeScript errors
✅ Zero ESLint errors (unless session allows warnings)
✅ Build succeeds
✅ Tests passing (if applicable)
✅ Manual testing completed
✅ No functionality regression
✅ Security requirements met

---

## 📝 REQUIRED REPORT FORMAT

Provide this EXACT format:

```markdown
## ✅ EXECUTION REPORT

**Session:** [session number and name]
**Status:** COMPLETE / BLOCKED

### Files Modified
- path/to/file1.ts - [line count] - [what changed]
- path/to/file2.tsx - [line count] - [what changed]
[Complete list]

### Changes Summary
[Detailed description of what was changed and why]

### Verification Results

**TypeScript Check:**
```
npx tsc --noEmit
[PASTE ACTUAL COMMAND OUTPUT]
```

**ESLint:**
```
npm run lint
[PASTE ACTUAL COMMAND OUTPUT]
```

**Build:**
```
npm run build
[PASTE ACTUAL COMMAND OUTPUT - INCLUDING BUNDLE SIZES]
```

**Tests:** (if applicable)
```
npm test
[PASTE ACTUAL COMMAND OUTPUT]
```

**Manual Testing:**
- [Test scenario 1]: ✅ PASS / ❌ FAIL
- [Test scenario 2]: ✅ PASS / ❌ FAIL
[All scenarios from session file]

### Security Verification
- Multi-tenancy: ✅ organizationId filtering verified
- RBAC: ✅ Permission checks in place
- Input validation: ✅ Zod schemas used
- Tier validation: ✅ Feature gates working
[All applicable security checks]

### Issues Found
[List any issues, blockers, or deviations]
OR
NONE - All requirements met successfully

### Database Changes (if applicable)
- Models added/modified: [list]
- Migrations created: [list]
- RLS policies added: [list]

### Next Steps
[What should be done next based on phase plan]
```

---

## 🚨 CRITICAL RULES

**Blocking Language:**
- You MUST complete ALL requirements before reporting success
- You MUST provide actual command outputs (not "passed" or "succeeded")
- You MUST test manually all modified functionality
- You MUST verify security requirements

**If Blocked:**
- Report exact error messages
- Explain what was attempted
- Suggest alternative approaches
- DO NOT report success if blocked

**File Size Limits:**
- Respect 500-line limit per file (ESLint enforced)
- Split into smaller files if needed
- Document file structure changes

**Pattern Consistency:**
- Follow existing code patterns in the project
- Match naming conventions
- Use established component structures
- Reference similar implementations

---

## 🔧 PROJECT CONTEXT

**Location:** `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)`

**Tech Stack:**
- Next.js 15 + React 19 + TypeScript
- Prisma ORM + Supabase PostgreSQL
- Server Actions (no API routes unless needed)
- shadcn/ui components

**Architecture:**
- Server Components by default
- Client Components only when needed
- Server Actions in `lib/modules/*/actions.ts`
- Queries in `lib/modules/*/queries.ts`
- Schemas in `lib/modules/*/schemas.ts`

---

## 📚 REFERENCE DOCUMENTATION

**Available in project:**
- `(platform)/CLAUDE.md` - Platform rules and patterns
- `(platform)/AUTH-ONBOARDING-GUIDE.md` - Auth implementation
- `(platform)/prisma/SCHEMA-*.md` - Database schema docs
- `(platform)/lib/database/docs/` - Complete database guides
- `.claude/agents/single-agent-usage-guide.md` - Agent best practices

---

## ⚡ EXECUTION

BEGIN SESSION NOW.

Read the session file and execute all requirements.
Provide complete EXECUTION REPORT when done.
```

---

## 🎯 HOW TO USE THIS TEMPLATE

### Step 1: Copy Template
Copy the entire "AGENT INVOCATION TEMPLATE" section above (everything in the code block)

### Step 2: Edit Session Number
Change this line:
```
**Session Number:** [CHANGE THIS: e.g., 1.1, 2.1, 3.5, etc.]
```

To (for example):
```
**Session Number:** 1.1
```

### Step 3: Paste into Claude Code
Paste the entire edited template into Claude Code as your prompt

### Step 4: Agent Executes
The agent will:
1. Read the session file automatically
2. Execute all requirements
3. Run all verification commands
4. Provide complete execution report

---

## 📖 EXAMPLES

### Example 1: Starting Session 1.1
```markdown
**Session Number:** 1.1
**Session File:** Read UPDATES/session-1.1-fix-server-action-build-errors.md
```

### Example 2: Starting Session 2.1
```markdown
**Session Number:** 2.1
**Session File:** Read UPDATES/session-2.1-implement-supabase-auth.md
```

### Example 3: Starting Session 3.5
```markdown
**Session Number:** 3.5
**Session File:** Read UPDATES/session-3.5-implement-schemas-migrations.md
```

---

## 🚨 IMPORTANT NOTES

**What This Template Does:**
- ✅ Includes all Claude agent best practices
- ✅ Enforces verification requirements
- ✅ Uses blocking language
- ✅ Requires proof (command outputs)
- ✅ Includes security checks
- ✅ Provides clear success criteria
- ✅ Follows 99% token-efficient database workflow

**What You Need to Do:**
- ✅ Change session number
- ✅ Copy/paste into Claude Code
- ✅ Review agent's execution report
- ✅ Verify all checks passed
- ✅ Move to next session

**The agent will handle:**
- ✅ Reading the session file
- ✅ Understanding requirements
- ✅ Executing tasks
- ✅ Running verifications
- ✅ Providing detailed report


Begin the session now! 
---