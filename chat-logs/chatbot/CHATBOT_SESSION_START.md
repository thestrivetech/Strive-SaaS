# Chatbot Integration Session Start

**Goal:** Quick context load and systematic integration workflow

---

## 1. Read Core Files (3 min)

```bash
# Required files:
1. CLAUDE.md                              # Dev rules (if not already familiar)
2. CHATBOT-INTEGRATION-GUIDE.md           # Complete integration plan
3. chat-logs/chatbot/QUICK_STATUS.md      # One-page current status
4. chat-logs/chatbot/Session[3].md        # Current session plan
```

**From QUICK_STATUS.md - Current Progress:**
- Session 1: ✅ Complete (Phases 1-5)
- Current: Session 2 (Phases 6-8)
- Files migrated: 32/32 (100%)
- Next: Phase 6 - Database Integration

**Session Files Reference:**
- `session2.md` - Detailed Session 2 log
- `Session1_Summary.md` - Session 1 recap
- `Session2.md` - Current session plan
- `QUICK_STATUS.md` - Quick reference

---

## 2. Quick Status Check

```
📊 Integration Status:
- Session: 2 of 2 - Database, Testing, Cleanup
- Progress: 62.5% (5/8 phases complete)
- Today's Focus: [Phase 6, 7, or 8]

🎯 Session Goals (from Session2.md):
- Phase 6: Add Prisma schema, migration, update RAG service
- Phase 7: Type checks, build, functional testing
- Phase 8: Remove old files, documentation, commit

📁 Key Locations:
- Module: app/lib/modules/chatbot/
- Routes: app/app/(chatbot)/{full,widget}
- API: app/api/chat/route.ts
- Subdomain: chatbot.strivetech.ai
```

---

## 3. Create To-Do List

**Use TodoWrite tool to track current phase tasks**

Example for Phase 6 (Database):
```
Task 1: Add Conversation model to Prisma schema
├─ Edit app/prisma/schema.prisma
├─ Add Conversation model definition
└─ Verify: npx prisma validate

Task 2: Generate Prisma client and create migration
├─ npx prisma generate
├─ npx prisma migrate dev --name add_chatbot_conversations
└─ Verify: npx prisma migrate status

Task 3: Update RAG service
├─ Edit app/lib/modules/chatbot/services/rag-service.ts
├─ Add storeConversation function with Prisma
└─ Verify: npx tsc --noEmit
```

---

## 4. Execute Phase

### Quick Checks - moved to /archive
```bash
# Verify backups exist (from Session 1)
ls chatbot-backup && ls app-backup

# Check current structure
ls app/lib/modules/chatbot/
ls "app/app/(chatbot)/"

# During phase - follow Session[N].md exactly
# Update TodoWrite after each task

# Phase-specific verification
npx prisma validate               # Phase 6: Schema valid
npx tsc --noEmit                  # Phase 7: No type errors
npm run build                     # Phase 7: Build succeeds
ls chatbot 2>/dev/null            # Phase 8: Old folder removed
```

---

## 5. Testing & Verification

### Quick Tests
```bash
# Type check
npx tsc --noEmit

# Linting
npm run lint

# Build test
npm run build

# Dev server
npm run dev

# Test chatbot routes (subdomain structure)
# ✅ http://localhost:3000/      → Redirects to /full
# ✅ http://localhost:3000/full  → Full-page chatbot
# ✅ http://localhost:3000/widget → Widget mode

# API test (requires GROQ_API_KEY)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"sessionId":"test","industry":"strive"}'
```

### Phase Completion Checklist
- [ ] TodoWrite tasks completed
- [ ] Tests passing (type check, lint, build)
- [ ] Chatbot routes load correctly
- [ ] No console errors
- [ ] Session summary created
- [ ] Ready for next phase

---

## 6. Quick Fixes & Troubleshooting

```bash
# Type errors → Regenerate Prisma client
npx prisma generate
rm -rf .next
npx tsc --noEmit

# Module errors → Clear cache
rm -rf .next node_modules/.cache
npm run dev

# Import errors → Check new patterns
grep -r "from '@/types/" app/lib/modules/chatbot  # Should be 0
grep -r "from '@/lib/modules/chatbot/types/" app/lib/modules/chatbot  # ✅

# Routes not loading → Check middleware
grep -A 5 "isChatbotSite" app/middleware.ts

# Database errors → Check migrations
npx prisma migrate status
npx prisma studio  # Visual database check

# Rollback if needed (backup from Session 1)
git checkout chatbot-integration-backup
# Or: cp -r chatbot-backup chatbot
```

---

## 7. Session End Workflow

```bash
# 1. Verify completion
npm run build && npx tsc --noEmit && npm run lint

# 2. Create session summary
# → Update Session[N]_Summary.md with results

# 3. Commit if phase complete
git add -A
git status  # Review changes
git commit -m "feat: [phase description]"

# 4. Update QUICK_STATUS.md for next session
```

---

## 📚 Documentation Hierarchy

**For Quick Reference:**
1. `QUICK_STATUS.md` - Current state (1 page)

**For Current Session:**
2. `Session[n].md` - Detailed plan for Phases 6-8

**For Context:**
3. `Session[n]_Summary.md` - What was completed
4. `CHATBOT-INTEGRATION-GUIDE.md` - Complete guide and updated

**For Next Session**
5. `Session[n+1].md` - Created with next sessions plan and remaining tasks

---

**Workflow:** Read status → Create todos → Execute phase → Test → Document → Next phase
