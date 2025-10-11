# Quick Start Guide - Deployment Sessions

**Get started in 60 seconds**

---

## 🚀 Starting Your First Session

### Step 1: Copy the Template (10 seconds)

Open `SESSION-START-TEMPLATE.md` and copy this entire block:

```markdown
Execute deployment readiness session following Claude agent best practices.

---

## SESSION TO EXECUTE

**Session Number:** [CHANGE THIS: e.g., 1.1, 2.1, 3.5, etc.]

**Session File:** Read UPDATES/session-[SESSION-NUMBER]-*.md

---

## AGENT TASK

**READ FIRST:**
1. `.claude/agents/single-agent-usage-guide.md` - Agent best practices
2. `UPDATES/session-[SESSION-NUMBER]-*.md` - Complete session requirements
3. `(platform)/CLAUDE.md` - Platform-specific rules

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

### Step 2: Edit Session Number (5 seconds)

Change line 7 from:
```
**Session Number:** [CHANGE THIS: e.g., 1.1, 2.1, 3.5, etc.]
```

To (for your first session):
```
**Session Number:** 1.1
```

---

### Step 3: Paste into Claude Code (5 seconds)

Paste the entire edited prompt into Claude Code

---

### Step 4: Agent Executes (automatic)

The agent will:
- ✅ Read session file
- ✅ Execute all tasks
- ✅ Run verifications
- ✅ Provide detailed report

---

## 📋 Session Execution Order

### Phase 1: Critical Blockers (START HERE)
1. **Session 1.1** - Fix server action build errors (1 hour)
2. **Session 1.2** - Fix ESLint errors (2-3 hours)

### Phase 2: MVP Deployment
3. **Session 2.1** - Implement Supabase authentication (4 hours)
4. **Session 2.2** - Disable incomplete modules (1 hour)
5. **Session 2.3** - Fix test suite (2 hours)
6. **Session 2.4** - Pre-deployment verification (1-2 hours)
7. **DEPLOY TO VERCEL**

### Phase 3: Full Feature Set (Optional)
8. **Session 3.1** - Design Marketplace schema (2 hours)
9. **Session 3.2** - Design REID schema (2 hours)
10. **Session 3.3** - Design Expense-Tax schema (1.5 hours)
11. **Session 3.4** - Design CMS Campaigns schema (1.5 hours)
12. **Session 3.5** - Implement all schemas + migrations (2 hours)
13. **Session 3.6** - Update Marketplace providers (2 hours)
14. **Session 3.7** - Update REID providers (2 hours)
15. **Session 3.8** - Update Expense-Tax providers (1.5 hours)
16. **Session 3.9** - Update CMS Campaign providers (1.5 hours)
17. **Session 3.10** - Comprehensive testing (2-3 hours)
18. **DEPLOY TO VERCEL**

### Phase 4: Quality & Optimization (Optional)
19. **Session 4.1** - Fix ESLint warnings (4-6 hours)
20. **Session 4.2** - Complete module consolidation (2-4 hours)
21. **Session 4.3** - Restore server-only protection (1-2 hours)
22. **Session 4.4** - Update database documentation (1 hour)

---

## ✅ After Each Session

### Review Agent Report
1. Check "Status" - Should be COMPLETE
2. Review "Files Modified" - Understand what changed
3. Check "Verification Results" - All should show success
4. Review "Issues Found" - Should be NONE

### If Session Blocked
1. Read error messages carefully
2. Try agent's suggested alternatives
3. Consult session file for failure recovery
4. Ask for help if stuck

### Move to Next Session
1. Mark current session as complete
2. Read next session overview
3. Copy template, edit session number
4. Paste and execute

---

## 🎯 Complete Example: Session 1.1

### Your Prompt (copy this exactly):

```markdown
Execute deployment readiness session following Claude agent best practices.

---

## SESSION TO EXECUTE

**Session Number:** 1.1

**Session File:** Read UPDATES/session-1.1-fix-server-action-build-errors.md

[... rest of template ...]
```

### Expected Agent Response:

```markdown
## ✅ EXECUTION REPORT

**Session:** 1.1 - Fix Server Action Build Errors
**Status:** COMPLETE

### Files Modified
- (platform)/lib/modules/transactions/milestones/calculator.ts - 327 lines - Made 3 functions async

### Changes Summary
Fixed 3 synchronous functions in 'use server' file by making them async:
- getMilestonesForType() - Now returns Promise<Milestone[]>
- getCurrentMilestone() - Now returns Promise<Milestone | null>
- getNextMilestone() - Now returns Promise<Milestone | null>

All calling code updated to use await.

### Verification Results

**TypeScript Check:**
```
npx tsc --noEmit
✓ No errors found
```

**ESLint:**
```
npm run lint
✓ No ESLint errors
⚠ 1,326 warnings (expected - will fix in Phase 4)
```

**Build:**
```
npm run build
✓ Build completed successfully
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         120 kB
├ ○ /real-estate/crm/contacts           8.1 kB         135 kB
...
```

### Issues Found
NONE - All requirements met successfully

### Next Steps
Proceed to Session 1.2 - Fix ESLint Errors
```

---

## 🔥 Pro Tips

### Tip 1: Keep Template Handy
Save the template in a text file for quick access

### Tip 2: Track Progress
Use the checklist in `UPDATES/README.md` to mark completed sessions

### Tip 3: Review Before Moving On
Don't rush - verify each session's changes before proceeding

### Tip 4: Read Session Files
For complex sessions, read the full session file first to understand scope

### Tip 5: Parallel Sessions (Advanced)
Some sessions can run in parallel if you're experienced - see README.md

---

## 🚨 Common Mistakes to Avoid

❌ **Don't skip verification** - Always review agent's command outputs
❌ **Don't skip sessions** - They build on each other
❌ **Don't modify template** - Use it exactly as provided (except session number)
❌ **Don't rush** - Quality over speed
❌ **Don't skip Phase 1** - Must complete before others

---

## 📞 Need Help?

**If stuck:**
1. Re-read the session file carefully
2. Check `(platform)/CLAUDE.md` for patterns
3. Review `.claude/agents/single-agent-usage-guide.md`
4. Ask agent to try alternative approach

**Common issues:**
- Build fails → Check Phase 1 completed
- Tests fail → Check fixtures match schema
- Auth doesn't work → Review AUTH-ONBOARDING-GUIDE.md
- Database errors → Check RLS policies active

---

**Happy deploying! 🚀**

Start with Session 1.1 and work your way through.
Each session builds toward production-ready deployment.
