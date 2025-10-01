# Session 2 Start Prompt

Copy and paste this prompt to start Session 2:

---

**CONTEXT ESTABLISHMENT:**

Please read the following project documents in this exact order to establish full context:

1. `/Users/grant/Documents/GitHub/Strive-SaaS/CLAUDE.md` - Project standards, architecture rules, and development guidelines
2. `/Users/grant/Documents/GitHub/Strive-SaaS/docs/database/session-logs/session1_summary.md` - Complete summary of Session 1 (database audit and documentation)
3. `/Users/grant/Documents/GitHub/Strive-SaaS/docs/database/session-logs/session2_plan.md` - Detailed implementation plan for this session

**SESSION 2 OBJECTIVE:**

Implement all database configuration fixes identified in Session 1 audit. Execute the tasks in `session2_plan.md` following this structure:

**Phase 1: Critical Fixes (P0 - ~2 hours)**
- Task 1.1: Add Notification Model to Prisma Schema
- Task 1.2: Consolidate Duplicate Prisma Client Files
- Task 1.3: Fix Realtime Table Names (snake_case)
- Task 1.4: Remove Drizzle ORM from Dependencies

**Phase 2: Security & Infrastructure (P1 - ~3 hours)**
- Task 2.1: Implement Row Level Security Policies
- Task 2.2: Setup Supabase Storage Buckets
- Task 2.3: Add Environment Variable Validation

**Phase 3: Enhancements (P2 - ~2 hours)**
- Task 3.1: Improve Supabase Client Setup
- Task 3.2: Add Presence Tracking (Optional)

**IMPORTANT INSTRUCTIONS:**

1. **Follow session2_plan.md exactly** - Each task has detailed steps, code examples, and success criteria
2. **Use TodoWrite tool** to track progress through all tasks
3. **Run verification commands** after each phase checkpoint
4. **Test thoroughly** before marking tasks complete
5. **Document any issues** encountered in session notes

**AFTER COMPLETING ALL TASKS:**

1. **Create session summary:** `/Users/grant/Documents/GitHub/Strive-SaaS/docs/database/session-logs/session2_summary.md`
   - Include: What was completed, issues encountered, solutions found, verification results, time tracking
   - Reference the template structure from `session1_summary.md`

2. **Create next session plan:** `/Users/grant/Documents/GitHub/Strive-SaaS/docs/database/session-logs/session3_plan.md`
   - List any remaining tasks that weren't completed
   - Include any new tasks discovered during implementation
   - Follow the same structure as `session2_plan.md`

3. **Create Session 3 start prompt:** `/Users/grant/Documents/GitHub/Strive-SaaS/docs/database/session-logs/SESSION3_START_PROMPT.md`
   - Follow the same format as this prompt
   - Update document references to include session2_summary.md

**SESSION FLOW:**
This session should follow the same pattern as Session 1:
- Read context → Execute tasks → Track progress → Verify results → Document summary → Plan next session

**Ready to begin?** Start with Phase 1, Task 1.1 from the session2_plan.md.

---

**END OF PROMPT**
