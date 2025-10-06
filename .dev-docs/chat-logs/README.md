# Chat Logs - Session Management

This directory tracks all development sessions with comprehensive reports and seamless handoffs.

---

## 📋 Quick Reference

### Start New Session

**Regular Development:**
```bash
Read in order:
1. SESSION_START.md (this directory)
2. CLAUDE.md (project root)
3. docs/APP_BUILD_PLAN.md
4. docs/README.md
5. Session[N-1].md (previous session)
```
**Time:** 5 minutes → Ready to code

**Migration Work (Web→Next.js):**
```bash
Read in order:
1. old-site-updates/MIGRATION_SESSION_START.md
2. app/MIGRATION_SESSIONS.md
3. old-site-updates/session[N-1].md (previous session)
4. app/SINGLE_APP_MIGRATION_PLAN.md (skim structure)
```
**Time:** 5 minutes → Ready to convert

### End Current Session

**Regular Development:**
```bash
Follow: SESSION_END.md (this directory)
Create: Session[N].md (this directory)
Update: docs/APP_BUILD_PLAN.md
```
**Time:** 15 minutes → Perfect handoff

**Migration Work:**
```bash
Follow: old-site-updates/MIGRATION_SESSION_END.md
Update: app/MIGRATION_SESSIONS.md (session entry)
Create: old-site-updates/session[N].md (full session log)
Update: app/SINGLE_APP_MIGRATION_PLAN.md (if needed)
```
**Time:** 15-20 minutes → Migration progress tracked

---

## 📁 Directory Structure

```
chat-logs/
├── SESSION_START.md           # Quick start guide
├── SESSION_END.md             # Quick end guide
├── Session1.md                # First session report
├── Session2.md                # Second session report
├── Session[N].md              # Latest session
├── errors/                    # Error logs and fixes
└── old-site-updates/          # Legacy migration logs
```

---

## 🎯 Session Workflow

```
START (5 min)
  ↓
Read SESSION_START.md
Read CLAUDE.md (rules)
Read Session[N-1].md (context)
  ↓
CODE (main work)
  ↓
END (15 min)
  ↓
Follow SESSION_END.md
Create Session[N].md
Update APP_BUILD_PLAN.md
  ↓
NEXT SESSION READY
```

---

## 📊 Session Numbering

- **Session 1:** Foundation & setup
- **Session 2:** Dashboard backend
- **Session 3:** Auth & organization backend
- **Session 4:** Team UI & CRM start
- **Session 5:** CRM CRUD & Projects
- **Session N:** Current session

Next session number = Last session + 1

---

## ✅ Quality Standards

Every session report must have:
- Completed tasks with file paths
- Files created/modified with line counts
- Key architectural decisions
- Known issues with impact
- Next session priorities

This ensures **zero context loss** between sessions.

---

## 🔗 Related Documentation

- **Development Rules:** `/CLAUDE.md`
- **Project Plan:** `/docs/APP_BUILD_PLAN.md`
- **Database Schema:** `/app/prisma/schema.prisma`