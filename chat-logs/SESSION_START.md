# Session Start - Quick Context Load

**Goal:** Full context in 5 minutes (~12K tokens)

> **📦 For Migration Sessions:** Use [`MIGRATION_SESSION_START.md`](MIGRATION_SESSION_START.md) instead - optimized for web→Next.js conversion workflow.

---

## 1. Read Core Files (5 min)

```bash
# Must read in order (all files):
1. CLAUDE.md                    # Dev rules (~1.8K tokens)
2. docs/APP_BUILD_PLAN.md       # Project status (~2.8K tokens)
3. docs/README.md               # Tech stack & architecture (~4.2K tokens)
4. chat-logs/Session11.md    # Current session (~3K tokens)
```

**From CLAUDE.md - Critical Rules:**
- Server Components default | "use client" only when needed
- Module pattern: `lib/modules/[feature]/` (schemas, queries, actions)
- File limits: 200 (UI), 300 (logic), 500 (hard - data only)
- Edit existing files first | NO cross-module imports | Zod always
- NO files in root directory | Multi-tenancy via organizationId

**From APP_BUILD_PLAN.md - Project Status:**
- Current phase & completion %
- What's completed vs in-progress
- Deferred tasks

**From docs/README.md - Architecture:**
- Tech stack (Next.js 15.5.4, React 19.1.0, Prisma 6.16.2)
- Project structure (app/ directory layout)
- Subscription tiers (Free, T1, T2, T3/Enterprise)
- Security requirements & testing standards

---

## 2. Confirm Session Context

After reading all 4 files, confirm understanding:

```
✅ Session [N] Initialized

📊 Status:
- Phase [N]: [Feature] ([NN]% complete)
- Last Session: [One-line summary]
- Tech Stack: Next.js 15.5.4 + React 19 + Prisma 6.16.2

🎯 Today's Goals:
1. [Priority 1 from Session[N].md]
2. [Priority 2]
3. [Stretch goal]

📁 Files to Reference:
- [Relevant module from last session]
- [Component directory if creating UI]

🐛 Known Issues to Avoid:
- [Issue from previous session]
- [Legacy errors: XX non-blocking]
```

---

## 3. Create Detailed To-Do List

**Use TodoWrite tool to track all tasks from Session[11].md**

Break down today's goals into actionable tasks:
- Each priority → Multiple specific tasks
- Mark status: pending/in_progress/completed
- Update as you work (mark completed immediately)
- Keep ONE task in_progress at a time

**Example:**
```
Priority 1: Complete CRM CRUD
├─ Build customer detail page
├─ Create EditCustomerDialog component
├─ Add DeleteCustomerDialog
└─ Connect dropdown menu actions
```

---

## 4. Execute Tasks

Work through to-do list systematically:
- Use next.js best practices and project context to think through each task completion
- Complete the task
- Mark as completed immediately
- Move to next task

---

## 5. Development Workflow

Throughout development:
```bash
# Verify environment still works
npm run dev                  # Should run without errors

# Check module structure
ls app/lib/modules/         # Confirm existing modules
```

**Remember:** Update to-do list in real-time as you progress.

---

## 6. Test & Debug (After completing all tasks)

### Verify To-Do List Complete
- [ ] All tasks marked as completed
- [ ] No in_progress tasks remaining
- [ ] Session objectives achieved

### Type Check & Fix Errors
```bash
npx tsc --noEmit
```
- Fix any TypeScript errors in NEW code
- Legacy errors (web/) are acceptable
- Document blocking vs non-blocking issues

### Manual Testing
- Test all new features end-to-end
- Verify CRUD operations work
- Check error handling
- Confirm multi-tenancy enforcement

### Review Changes
```bash
git status
```
- Review all changed files
- Ensure no accidental modifications

---

**Benefit:** Complete understanding, tracked progress, tested code, ready for summary