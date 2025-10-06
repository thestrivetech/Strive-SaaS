# Master Session Coordination - Session 3

**Version:** 3.0 (Token Optimized)
**Usage:** Replace `3` with session number, copy to Claude

-------------------------------------------------------------> This CLI command updates all session numbers by 1 -> .\update-session-number.ps1     -> Might need to cd into (platform) or to the scripts folder

## 1. UPDATE SESSION NUMBERS

```powershell
# Run automation script (updates all 14 files in ~1 second)
.\update-session-number.ps1 3
```

---

## 2. LAUNCH 7 PARALLEL AGENTS

Launch in **single message** (7 Task calls):

**Agent Prompt Template:**
```
[MODULE_NAME] - Session 3

1. Read: (platform)/update-sessions/.../[MODULE_DIR]/SESSION-START-PROMPT-SHORT.md
2. Follow ALL instructions exactly (TodoWrite first, session plan, verification)
3. Complete objectives → Create summary: session-3-summary.md
4. Report: summary file path OR specific blockers

BLOCKING: DO NOT report complete without summary file.
```

**Module Assignments:**
- `strive-dev-1`: AI-Garage-&-shop
- `strive-dev-2`: cms&marketing-module
- `strive-dev-3`: expenses-&-taxes-module
- `strive-dev-4`: landing-onboard-price-admin
- `strive-dev-5`: main-dash
- `strive-dev-6`: REIDashboard
- `strive-dev-7`: tool&dashboard-marketplace

---

## 3. VALIDATE EACH AGENT

As agents complete, verify:
- ✅ TodoWrite list created BEFORE implementation
- ✅ Summary file exists at correct path
- ✅ All objectives marked complete
- ✅ Verification proof included (npx tsc --noEmit output)
- ❌ Flag if agent skipped TodoWrite or verification

---

## 4. FINAL REPORT

```
Session 3 Completion Summary:

MODULE STATUS:
✅/❌ AI Garage: [COMPLETE | BLOCKED: reason]
✅/❌ CMS & Marketing: [COMPLETE | BLOCKED: reason]
✅/❌ Expenses & Taxes: [COMPLETE | BLOCKED: reason]
✅/❌ Landing/Admin: [COMPLETE | BLOCKED: reason]
✅/❌ Main Dashboard: [COMPLETE | BLOCKED: reason]
✅/❌ REID Dashboard: [COMPLETE | BLOCKED: reason]
✅/❌ Tool Marketplace: [COMPLETE | BLOCKED: reason]

SUMMARY FILES:
[List all 7 paths to session-{N}-summary.md files]

ISSUES:
[Any blockers, errors, or incomplete work]

NEXT SESSION:
Ready for Session {CURRENT_SESSION + 1}: [List ready modules]
Blocked: [List blocked modules with reasons]
```

---

## 📋 QUICK REFERENCE

**Token Savings vs v2.0:**
- Master prompt: 83% reduction (9,000 → 1,500 tokens)
- Session coordination: 92% total reduction
- Per-agent launch: 90% reduction (use SHORT prompts)

**Scripts:**
- Update sessions: `update-session-number.ps1`
- Module prompts: `SESSION-START-PROMPT-SHORT.md` (10 lines each)

**Documentation:**
- Agent patterns: `.claude/agents/claude-orchestration-master-guide.md`
- Platform rules: `(platform)/CLAUDE.md`
- Script guide: `SESSION-SCRIPTS-README.md`

**Session Counts:**
- AI Garage: 10 sessions
- CMS & Marketing: 8 sessions
- Expenses & Taxes: 10 sessions
- Landing/Admin: 12 sessions
- Main Dashboard: 7 sessions
- REID Dashboard: 12 sessions
- Tool Marketplace: 8 sessions

---

**Version History:**
- v3.0 (2025-10-05): Token optimized (83% reduction), script integration
- v2.0 (2025-10-05): Multi-agent coordination
- v1.0 (2025-10-04): Initial version

**Last Updated:** 2025-10-05