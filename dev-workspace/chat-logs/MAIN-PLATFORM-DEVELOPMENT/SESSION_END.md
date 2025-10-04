# Session End - Quick Report

**Goal:** Complete handoff in 15 minutes

> **📦 For Migration Sessions:** Use [`MIGRATION_SESSION_END.md`](MIGRATION_SESSION_END.md) instead - optimized for tracking web→Next.js conversion progress.

---

## 1. Create Session Summary (45 min)

**File:** `chat-logs/Session15_Summary.md`

### Required Sections (Comprehensive):

```markdown
# Session [N] Summary - [Feature Name]

**Date:** [date] | **Duration:** [hours] | **Phase [X]:** [XX]% → [XX]%

## Starting Context
- What was already complete
- Carry-over tasks from last session

## Session Objectives - ALL COMPLETED ✅
### Priority 1: [Feature]
- Detailed implementation notes
- File created: `path/file.tsx` ([XX] lines)
- Key features implemented

### Priority 2: [Feature]
[Same detail level...]

## Complete File Inventory
**New Files ([X] files):**
- `path/to/file.tsx` - [XX] lines - [Description]

**Modified Files ([X] files):**
- `path/to/file.tsx` - [Changes made]

## Architecture Patterns & Best Practices
1. **[Pattern Name]:** [Why and how]
   ```typescript
   // Code example
   ```

## Security Implementations
- Input validation approach
- Multi-tenancy enforcement
- Activity logging

## Key Learnings & Decisions
**Decision:** [What we chose]
**Rationale:** [Why]
**Trade-off:** [Pros/cons]

## Known Issues & Limitations
- [Non-blocking issue 1] - Impact: Low
- [Deferred feature] - Timeline: Session [X]

## Progress Metrics
- Phase [X]: [XX]% → [XX]% (+[X]%)
- Files created: [X]
- Components created: [X]
- Total new lines: ~[XXX]

## Next Session Preview
1. [Priority 1 task]
2. [Priority 2 task]
3. [Stretch goal]
```

**Goal:** Extremely detailed for future reference

---

## 2. Create Next Session Plan (30 min)

**File:** `chat-logs/Session[N+1].md`

### Required Sections:

```markdown
# Session [N+1] Tasks - [Feature Name]

**Goal:** [One-line objective]
**Starting Point:** Phase [X] - [XX]% Complete
**Estimated Duration:** [X-X] hours

## Current Status (From Session [N])
### ✅ Already Completed
[List major accomplishments]

### 🔧 Carry-Over Tasks
[Tasks deferred from last session]

## Session [N+1] Primary Objectives

### Priority 1: [Feature] (Est: [XX]min)
#### 1. [Task Name]
**File:** `path/to/file.tsx`

**Implementation Requirements:**
- [Requirement 1]
- [Requirement 2]

**Why [Server/Client] Component:**
[Reasoning]

**Estimated Lines:** ~[XX] lines

#### 2. [Next Task]
[Same detail...]

### Priority 2: [Feature] (Est: [XX]min)
[Same structure...]

## Technical Tasks Summary
- Modules to create: [X]
- Components to create: [X]
- Files to modify: [X]

## Testing Checklist
- [ ] Test scenario 1
- [ ] Test scenario 2

## Success Criteria
### Must Complete ✅
- [ ] Criterion 1
- [ ] Criterion 2

### Stretch Goals 🎯
- [ ] Optional feature

## Implementation Order (Recommended)
1. Phase 1: [Task] ([XX] min)
2. Phase 2: [Task] ([XX] min)

**Total Estimated:** [X] hours
```

---

## 3. Handoff Checklist

**Before ending session:**
- [ ] All to-dos marked completed (verified at end of SESSION_START)
- [ ] TypeScript errors fixed (tested at end of SESSION_START)
- [ ] Manual testing complete (done at end of SESSION_START)
- [ ] Session[N]_Summary.md created (detailed)
- [ ] Session[N+1].md created (next steps)
- [ ] Files list verified complete
- [ ] Known issues documented
- [ ] Next priorities are actionable

**Done! Next session has complete context and clear tasks.**