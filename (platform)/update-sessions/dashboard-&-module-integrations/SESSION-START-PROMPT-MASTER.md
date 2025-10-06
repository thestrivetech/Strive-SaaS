# Master Session Coordination Prompt - Multi-Agent Integration

**Version:** 2.0
**Purpose:** Coordinate 7 parallel agents to continue all module integrations
**Usage:** Change `{CURRENT_SESSION}` below, paste entire prompt to Claude

---

## 🚀 SESSION INITIALIZATION

```
I'm starting integration work for Session {2}.

CONTEXT:
This is a coordinated multi-agent session to advance 7 module integrations in parallel.
Each module has its own session plans, and we're currently on Session {2}.

YOUR TASK - PHASE 1: READ CONTEXT & PREPARE
Read these files for context (DO NOT summarize them to me - just read and understand):

1. Agent Best Practices:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\.claude\agents\claude-orchestration-master-guide.md
   - Follow all patterns for parallel agent execution
   - Use verification requirements and blocking language
   - Apply efficiency best practices

2. Project Memory (optional - you may already have this loaded):
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md & C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Repository structure and standards
   - Tri-fold architecture understanding

3. Repository Overview for (project):
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\README.md
   - Project setup and structure

YOUR TASK - PHASE 2: UPDATE SESSION NUMBERS
Before launching agents, update session numbers in all 7 integration start prompts:

CRITICAL: Update ONLY the "SESSION-START-PROMPT.md" files (NOT the -SHORT.md versions)

Update these files by replacing the CURRENT session number with {}:
1. (platform)/update-sessions/dashboard-&-module-integrations/AI-Garage-&-shop/SESSION-START-PROMPT.md
2. (platform)/update-sessions/dashboard-&-module-integrations/cms&marketing-module/SESSION-START-PROMPT.md
3. (platform)/update-sessions/dashboard-&-module-integrations/expenses-&-taxes-module/SESSION-START-PROMPT.md
4. (platform)/update-sessions/dashboard-&-module-integrations/landing-onboard-price-admin/SESSION-START-PROMPT.md
5. (platform)/update-sessions/dashboard-&-module-integrations/main-dash/SESSION-START-PROMPT.md
6. (platform)/update-sessions/dashboard-&-module-integrations/REIDashboard/SESSION-START-PROMPT.md
7. (platform)/update-sessions/dashboard-&-module-integrations/tool&dashboard-marketplace/SESSION-START-PROMPT.md

How to update each file:
- Read the current file
- Find the template section that says `{SESSION_NUMBER}` placeholder
- The actual session numbers appear in file paths and prompts
- Update OLD session number → {CURRENT_SESSION}
- Save the file

Example: If current session is 4 and file shows session-3.plan.md, change to session-{CURRENT_SESSION}.plan.md

After updates, confirm:
"✅ Updated all 7 SESSION-START-PROMPT.md files to Session {2}"

YOUR TASK - PHASE 3: LAUNCH 7 PARALLEL AGENTS
Launch 7 strive-dev agents IN PARALLEL (single message, 7 Task tool calls).

Each agent receives:
- The updated SESSION-START-PROMPT.md content for their module
- Their specific session-{CURRENT_SESSION}.plan.md file path to read
- Clear instruction to follow the prompt exactly

AGENT ASSIGNMENTS:
- Agent 1 (strive-dev-1): AI Garage & Shop
- Agent 2 (strive-dev-2): CMS & Marketing
- Agent 3 (strive-dev-3): Expenses & Taxes
- Agent 4 (strive-dev-4): Landing/Admin/Pricing/Onboarding
- Agent 5 (strive-dev-5): Main Dashboard
- Agent 6 (strive-dev-6): REID Dashboard
- Agent 7 (strive-dev-7): Tool & Dashboard Marketplace

AGENT TASK TEMPLATE (customize per agent):
```
You are working on the [MODULE_NAME] integration - Session {CURRENT_SESSION}.

INSTRUCTIONS:
1. Read your session start prompt:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\[MODULE_DIR]\SESSION-START-PROMPT.md

2. Follow the prompt EXACTLY as written
   - It will instruct you to read CLAUDE.md files
   - It will instruct you to read your session plan
   - It will give you important reminders
   - It will require you to create a session summary at the end of the session once you've finished everything and validated

3. Read your session plan:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\[MODULE_DIR]\session-{CURRENT_SESSION}.plan.md
   - Understand ALL objectives and requirements
   - Note all dependencies and prerequisites
   - Identify all implementation steps

4. MANDATORY - CREATE IN-DEPTH TODO LIST (BEFORE starting work):
   Use the TodoWrite tool to create a comprehensive todo list with,
   You're just creating your own to-do list to follow, not an actual file:

   Required Details:
   - Break down the session plan into specific, granular tasks
   - Each task should be actionable (not vague like "implement feature")
   - Include proper status: pending/in_progress/completed
   - Use active form for in-progress items ("Creating X", "Implementing Y")

   Your todo list MUST include tasks for:
   - Reading/analyzing existing code
   - Creating new files (list specific files from session plan)
   - Modifying existing files (list specific files)
   - Database operations (if applicable)
   - Testing implementations
   - Validating security/RBAC/multi-tenancy
   - Running verification commands
   - Creating session summary
   - Any module-specific tasks from session plan

   Example Good Todo:
   ✅ "Create lib/modules/expenses/actions.ts with RBAC-protected server actions"
   ✅ "Update shared/prisma/schema.prisma - add Expense model with RLS"
   ✅ "Verify: Run npx tsc --noEmit - expect 0 errors"

   Example Bad Todo:
   ❌ "Work on backend"
   ❌ "Fix stuff"
   ❌ "Implement features"

   DO NOT proceed with implementation until TodoWrite list is created.

CRITICAL REQUIREMENTS:
- Complete ALL objectives in the session plan (no partial work)
- Create session summary at end: session-{2}-summary.md
- Include verification proof (command outputs) in summary
- DO NOT report success without completing the full session plan
- If you cannot complete the session, report specific blockers

VERIFICATION REQUIRED:
In your session summary, include:
- All files created (full paths)
- All files modified (full paths)
- TypeScript check output: npx tsc --noEmit (if code changes)
- Verification commands relevant to your module

BLOCKING:
- DO NOT start implementation without creating TodoWrite list first
- DO NOT report "Session {1} complete" unless session summary file exists
- DO NOT skip objectives from session plan
- DO NOT skip verification commands
- DO NOT use vague todos ("fix stuff", "implement features")

Report back when Session {1} is complete with summary file path.
```

MODULE DIRECTORIES:
1. AI-Garage-&-shop (10 sessions total)
2. cms&marketing-module (8 sessions total)
3. expenses-&-taxes-module (10 sessions total)
4. landing-onboard-price-admin (12 sessions total)
5. main-dash (7 sessions total)
6. REIDashboard (12 sessions total)
7. tool&dashboard-marketplace (8 sessions total)

PARALLEL EXECUTION REQUIREMENTS (from claude-orchestration-master-guide.md):
✅ All scopes non-overlapping (each module has separate directories)
✅ Each agent has exact deliverable: 1 session completion + 1 summary file
✅ Agents cannot ask questions (everything in session plan)
✅ Forcing language: "Complete ALL objectives"
✅ Validation: Each agent must verify their work
✅ Immediate validation: Check each agent report as it completes
✅ Repair strategy: If agent fails, deploy repair agent immediately

YOUR TASK - PHASE 4: MONITOR & VALIDATE
As each agent reports completion:

1. Verify agent created TodoWrite list BEFORE implementation
   - If skipped, note this as process violation

2. Verify session summary file exists

3. Check summary includes:
   - ✅ All objectives marked complete
   - ✅ Files created/modified listed
   - ✅ Verification command outputs included
   - ✅ Next steps documented

4. If agent reports issues or incomplete work:
   - Note specific blockers
   - Assess if repair agent needed
   - Track for my review

YOUR TASK - PHASE 5: FINAL REPORT
After all 7 agents complete (or report blockers), provide:

COMPLETION SUMMARY:
✅ Session {1} Progress:
- AI Garage: [COMPLETE/BLOCKED: reason]
- CMS & Marketing: [COMPLETE/BLOCKED: reason]
- Expenses & Taxes: [COMPLETE/BLOCKED: reason]
- Landing/Admin: [COMPLETE/BLOCKED: reason]
- Main Dashboard: [COMPLETE/BLOCKED: reason]
- REID Dashboard: [COMPLETE/BLOCKED: reason]
- Tool Marketplace: [COMPLETE/BLOCKED: reason]

Session Summary Files Created:
[List all 7 summary file paths]

Issues Requiring Attention:
[List any blockers, errors, or incomplete work]

Ready for Session {CURRENT_SESSION + 1}:
[List which modules are ready vs blocked]

AGENT-USAGE-GUIDE.md Updates Needed:
[If you noticed any improvements to agent best practices during this session]

---

EXECUTION CHECKLIST (for you to follow):
□ Phase 1: Read context files (AGENT-USAGE-GUIDE.md, CLAUDE.md, README.md)
□ Phase 2: Update all 7 SESSION-START-PROMPT.md files to Session {CURRENT_SESSION}
□ Phase 3: Launch 7 parallel agents with mandatory TodoWrite requirement
□ Phase 4: Validate each agent created TodoWrite list + session summary
□ Phase 5: Provide final completion summary

Let's begin Session {2} integration work!
```

---








---

## 📋 USAGE INSTRUCTIONS

**For User (You):**
1. Change `{CURRENT_SESSION}` to actual session number (e.g., 3, 4, 5...)
2. Copy the entire prompt above (inside the code block)
3. Paste to Claude
4. Claude will handle the rest

**What Claude Will Do:**
1. Read context files for understanding
2. Update session numbers in all 7 integration prompts
3. Launch 7 agents in parallel (each MUST create TodoWrite list first)
4. Monitor progress and validate each agent's work
5. Ensure all agents created in-depth todo lists before implementing
6. Provide comprehensive completion summary
7. Flag any improvements needed to AGENT-USAGE-GUIDE.md

**Expected Duration:**
- Phase 1-2: 5-10 minutes (reading + updating files)
- Phase 3-4: 20-60 minutes (parallel agent execution + validation)
- Phase 5: 5 minutes (final report)
- **Total:** ~30-75 minutes depending on session complexity

**Expected Output:**
- 7 in-depth TodoWrite lists (created by agents before implementation)
- 7 session summary files (one per module)
- Final completion report showing progress across all modules
- Any blockers or issues flagged for review
- Process violations noted (if any agent skipped TodoWrite)

---

## 🔧 MAINTENANCE

**When to Update This Prompt:**
- Session count changes for any module
- New module added to integration queue
- Agent usage patterns evolve
- New best practices discovered

**Version History:**
- v2.0 (2025-10-05): Multi-agent coordination with parallel execution
- v1.0 (2025-10-04): Initial master prompt

---

**Last Updated:** 2025-10-05
**Modules Covered:** 7 active integrations
**Agent Pool:** strive-dev-1 through strive-dev-10
