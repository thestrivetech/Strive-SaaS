# Chatbot Integration Session Start

**Goal:** Quick context load and systematic integration workflow

---

## 1. Read Core Files (3 min)

```bash
# Required files:
1. CLAUDE.md                              # Dev rules (if not already familiar)
2. CHATBOT-INTEGRATION-GUIDE.md           # Complete integration plan
3. chat-logs/chatbot/Session[N].md        # Current session plan (if exists)
```

**From CHATBOT-INTEGRATION-GUIDE.md - Current Status:**
- Phase [N]: [Phase Name] ([X]% complete)
- Files migrated: [X] of 37
- Import paths updated: Yes/No

**Critical Fixes Required (Phase 1):**
- 🔴 useChat.ts (523 lines) - Must split to < 500 lines
- 🔴 Missing Zod validation in API route
- 🔴 Add 'server-only' to rag-service.ts

---

## 2. Quick Status Check

```
📊 Integration Status:
- Current Phase: [N] of 8 - [Phase Name]
- Files Migrated: [X]/37
- Today's Focus: [Main objective]

🎯 Session Goals:
1. [Specific task from integration guide]
2. [Next task]
3. [Additional task if time]

📁 Working Directory:
- Source: chatbot/
- Target: app/lib/modules/chatbot/
```

---

## 3. Create To-Do List

**Use TodoWrite tool to track tasks from CHATBOT-INTEGRATION-GUIDE.md**

Example structure for current phase:
```
Task 1: [Main task]
├─ [Subtask 1]
├─ [Subtask 2]
└─ Verify: [Test command]

Task 2: [Next task]
├─ [Subtask 1]
└─ Verify: [Test command]
```

---

## 4. Execute Phase

### Quick Checks
```bash
# Before starting
ls chatbot-backup || echo "Create backup first!"
env | grep GROQ || echo "Set environment variables!"

# During phase - follow CHATBOT-INTEGRATION-GUIDE.md exactly
# Update TodoWrite after each task

# Phase verification (examples)
wc -l chatbot/hooks/useChat.ts  # Phase 1: < 500 lines
ls app/lib/modules/chatbot/     # Phase 2: Structure exists
find app/lib/modules/chatbot -type f | wc -l  # Phase 3: File count
```

---

## 5. Testing & Verification

### Quick Tests
```bash
# Type check
npx tsc --noEmit

# Dev server
npm run dev
# Test at: http://localhost:3000/chatbot/full

# API test
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"sessionId":"test"}'
```

### Phase Completion
- [ ] TodoWrite tasks completed
- [ ] Tests passing
- [ ] Chatbot functional
- [ ] Ready for next phase

---

## 6. Quick Fixes

```bash
# Module errors → Clear cache
rm -rf .next && npm run dev

# Import errors → Check patterns
grep -r "from '\.\./types/" app/lib/modules/chatbot

# Rollback if needed
cp -r chatbot-backup chatbot
```

---

**Workflow:** Read files → Check status → Create todos → Execute phase → Test → Move to next phase