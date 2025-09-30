# Migration Session Start - Quick Context Load

**Goal:** Full migration context in 5 minutes, then execute with tracked progress

---

## 1. Read Core Files (5 min)

```bash
# Must read in order:
1. CLAUDE.md (project root)                           # Dev rules (~2 min)
2. app/MIGRATION_SESSIONS.md                          # Session tracker (~2 min)
3. app/SINGLE_APP_MIGRATION_PLAN.md                   # Plan overview (~2 min)
4. chat-logs/old-site-updates/session13.md           # Current session plan (~1 min)
```

**From CLAUDE.md:**
- Server Components default | "use client" only when needed
- File limits: 200 (UI), 300 (logic), 500 (hard - data exception)
- Multi-tenancy via organizationId

**From MIGRATION_SESSIONS.md:**
- Sessions complete (✅) vs partial (🟡)
- Current deliverables
- Known blockers

**From Current Session Plan (session[13].md):**
- Session goals and objectives
- **Critical blockers** from previous session
- Exact next steps and priorities

---

## 2. Create Todo List (5 min)

**IMMEDIATELY use TodoWrite tool to create detailed task list:**

```typescript
// Example from Session 5:
[
  { content: "Fix dev server (clear cache and test)", status: "pending", activeForm: "Fixing dev server" },
  { content: "Convert contact page to Next.js", status: "pending", activeForm: "Converting contact page" },
  { content: "Test all web pages (home, about, contact)", status: "pending", activeForm: "Testing all web pages" },
  { content: "Test platform routes (regression test)", status: "pending", activeForm: "Testing platform routes" },
  { content: "Delete old source files", status: "pending", activeForm: "Deleting old source files" },
  { content: "Update documentation", status: "pending", activeForm: "Updating documentation" },
  { content: "Commit changes", status: "pending", activeForm: "Committing changes" }
]
```

**Why this matters:**
- Tracks progress visibly for user
- Prevents forgetting critical steps
- Makes it easy to pause/resume
- Ensures all objectives are met

---

## 3. Session Workflow (Execute)

```
1. Mark first task as "in_progress"
2. Execute task (fix blocker, convert file, etc.)
3. Mark task as "completed" IMMEDIATELY after finishing
4. Move to next task (mark as "in_progress")
5. Repeat until all tasks complete
```

**Key Rules:**
- ✅ ONE task "in_progress" at a time
- ✅ Mark "completed" immediately (don't batch)
- ✅ Fix blockers BEFORE converting
- ✅ Test each page after conversion
- ❌ DON'T commit to GitHub (user will do this)

---

## 4. Testing & Bug Fixes (After all tasks complete)

**Regression Testing:**
```bash
# Manual browser testing
- [ ] All converted pages load without errors
- [ ] Navigation between pages works
- [ ] Interactive features work (forms, modals, etc.)
- [ ] Platform routes still work (no regression)
- [ ] Dev server runs without errors

# TypeScript check (new files only)
npx tsc --noEmit
```

**If bugs/errors discovered:**
1. Add bug fix task to TodoWrite
2. Mark as "in_progress"
3. Fix the issue
4. Mark as "completed"
5. Re-test affected areas

---

## 5. Session Complete - Move to Documentation

Once all tasks complete and testing passes:
- Follow **MIGRATION_SESSION_END.md** for documentation steps
- Create session summary report
- Create next session chat log
- Update all documentation

---

## 6. Conversion Patterns (Reference)

**Wouter → Next.js:**
```typescript
// REMOVE
import { Link, useLocation } from 'wouter';
const [, setLocation] = useLocation();

// ADD
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
const pathname = usePathname();
const router = useRouter();
```

**"use client" when:**
- useState/useEffect/hooks
- onClick/onChange events
- Browser APIs (window, localStorage)
- Forms with React Hook Form

---

## 7. Common Issues (Reference)

**Dev Server Won't Start:**
- `rm -rf app/.next && npm run dev`
- Try without Turbopack: `next dev`
- Check Prisma client: `npx prisma generate`

**TypeScript Errors:**
- **IGNORE** errors in `web/client/src/` (to be deleted)
- **CHECK** only errors in `app/(web)/` and `app/components/web/`

---

**Context loaded! Create TodoWrite list and begin execution.**