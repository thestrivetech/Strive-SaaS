# Chatbot Integration Session End

**Goal:** Document progress and prepare next phase (10 minutes)

---

## 1. Create Session Summary

**File:** `chat-logs/chatbot/Session[N]_Summary.md`

### Template:

```markdown
# Session [N] Summary - Phase [X]: [Phase Name]

**Date:** [date] | **Progress:** Phase [X]/8 | **Files:** [Y]/37 migrated

## Completed This Session
- ✅ [Major task 1]
- ✅ [Major task 2]
- ⚠️ [Any issues]

## Files Changed
**Migrated ([X] files):**
- `chatbot/[path]` → `app/[new-path]`
[List key files]

**Modified ([X] files):**
- `[file]` - [what changed]

## Testing Results
- ✅ File sizes compliant
- ✅ Validation working
- ✅ Chatbot functional
- ⚠️ [Any issues]

## Next Phase: [X+1] - [Name]
- Focus: [Main objective]
- Files to migrate: [X remaining]
- Estimated time: [X hours]
```

---

## 2. Create Next Phase Plan

**File:** `chat-logs/chatbot/Session[N+1].md`

### Template:

```markdown
# Session [N+1] - Phase [X]: [Phase Name]

**Goal:** [Phase objective from guide]
**Status:** [X]/37 files migrated | [X]/3 fixes complete
**Time:** ~[X] hours

## Tasks from CHATBOT-INTEGRATION-GUIDE.md
1. [Task 1] - Files: [list]
2. [Task 2] - Files: [list]
3. [Task 3] - Files: [list]

## Key Commands
```bash
# Migration
cp chatbot/[file] app/[destination]

# Verification
wc -l [file]  # Check size
grep [pattern] [file]  # Check imports
npm run dev  # Test functionality
```

## Success Criteria
- [ ] Files migrated
- [ ] Imports updated
- [ ] Tests passing
- [ ] Chatbot works
```

---

## 3. Handoff Checklist

### Quick Checks
- [ ] TodoWrite tasks completed
- [ ] Tests passing: `npx tsc --noEmit`
- [ ] Chatbot works: `/chatbot/full`
- [ ] Session summary created
- [ ] Next session plan created

### Quick Status
```
Phase [X]/8: [XX]% complete
Files: [X]/37 migrated
Next: Phase [X+1] - [name]
```

---

**Ready for next session.** Use `CHATBOT_SESSION_START.md` to continue.