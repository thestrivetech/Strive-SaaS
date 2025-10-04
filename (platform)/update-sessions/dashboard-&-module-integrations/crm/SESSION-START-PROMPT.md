# CRM Integration - Session Start Prompt Template

Use this prompt at the beginning of each session. Simply replace `{SESSION_NUMBER}` with the current session number (1-10).

---

## 📋 Session Start Prompt

```
I'm starting Session {SESSION_NUMBER} of the CRM integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\crm\session{SESSION_NUMBER}.plan.md
   - Understand the objectives, requirements, and implementation steps
   - Note all dependencies and prerequisites

3. **Create Detailed Todo List:**
   - Break down the session plan into actionable todo items
   - Use the TodoWrite tool to create an in-depth todo list with:
     * Specific, granular tasks (not vague descriptions)
     * Proper status (pending/in_progress/completed)
     * Active form descriptions for in-progress items
   - Include todos for:
     * Reading/analyzing existing code
     * Creating new files
     * Modifying existing files
     * Testing implementations
     * Validating security/RBAC/multi-tenancy
     * Any additional tasks from the session plan

4. **Important Reminders:**
   - ALWAYS read files before editing them
   - Follow the READ-BEFORE-EDIT MANDATE from CLAUDE.md
   - Maintain multi-tenancy (organizationId on all queries)
   - Enforce RBAC permissions on all Server Actions
   - Use Supabase MCP tools for all database operations (schema changes, migrations, queries)
   - Validate all input with Zod schemas
   - Add proper error handling and loading states
   - Ensure mobile responsiveness

5. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead

6. **Session End Requirements:**
   When the session is complete, create a session summary file:
   - File path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\crm\session{SESSION_NUMBER}-summary.md
   - Include:
     * Session objectives (completed/partial/not started)
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features added
     * Any issues encountered and how they were resolved
     * Testing performed
     * Next steps / what's ready for next session
     * Overall progress percentage for the entire CRM integration

Let's begin Session {SESSION_NUMBER}!
```

---

## 🔢 Quick Reference by Session

### Session 1: Database Foundation
**Focus:** Schema extensions, migrations, RLS policies
**Key Tools:** Supabase MCP (apply_migration, list_tables)
**Estimated Time:** 2-3 hours

### Session 2: Leads Module - Backend
**Focus:** Schemas, queries, actions, RBAC
**Key Files:** lib/modules/leads/*
**Estimated Time:** 3-4 hours

### Session 3: Leads Module - UI
**Focus:** Components, pages, forms
**Key Files:** components/(platform)/crm/leads/*, app/(platform)/crm/leads/*
**Estimated Time:** 4-5 hours

### Session 4: Contacts Module
**Focus:** Backend + UI, communication tracking
**Key Files:** lib/modules/contacts/*, components/contacts/*
**Estimated Time:** 3-4 hours

### Session 5: Deals Pipeline
**Focus:** Kanban board, drag-and-drop
**Key Files:** lib/modules/deals/*, components/deals/*
**Estimated Time:** 4-5 hours

### Session 6: Listings Module
**Focus:** Property management, search
**Key Files:** lib/modules/listings/*, components/listings/*
**Estimated Time:** 3-4 hours

### Session 7: Calendar & Appointments
**Focus:** Scheduling, calendar views
**Key Files:** lib/modules/appointments/*, components/calendar/*
**Estimated Time:** 3-4 hours

### Session 8: Analytics & Reporting
**Focus:** KPIs, charts, metrics
**Key Files:** lib/modules/analytics/*, components/analytics/*
**Estimated Time:** 3-4 hours

### Session 9: CRM Dashboard Integration
**Focus:** Unified dashboard, navigation
**Key Files:** app/(platform)/crm/dashboard/*, components/crm/dashboard/*
**Estimated Time:** 2-3 hours

### Session 10: Testing & Go-Live
**Focus:** Testing, optimization, deployment
**Key Files:** __tests__/*, error boundaries, documentation
**Estimated Time:** 4-6 hours

---

## 📝 Example Usage

**Starting Session 1:**
```
I'm starting Session 1 of the CRM integration project.

Please follow these steps to begin:
[... rest of prompt with {SESSION_NUMBER} replaced with 1 ...]
```

**Starting Session 5:**
```
I'm starting Session 5 of the CRM integration project.

Please follow these steps to begin:
[... rest of prompt with {SESSION_NUMBER} replaced with 5 ...]
```

---

## ✅ Session Completion Checklist

Before marking a session as complete, ensure:

- [ ] All objectives from session plan completed
- [ ] All files created/modified as specified
- [ ] Multi-tenancy enforced (organizationId checks)
- [ ] RBAC permissions added and tested
- [ ] Input validation with Zod implemented
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Code follows platform standards (CLAUDE.md)
- [ ] Session summary file created
- [ ] Ready to proceed to next session

---

## 🚨 Common Pitfalls to Avoid

1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't forget organizationId** - Every CRM model needs multi-tenancy
3. **Don't skip RBAC checks** - Every Server Action needs permission validation
4. **Don't use Prisma CLI directly** - Use Supabase MCP tools instead
5. **Don't create duplicate code** - Check if components/modules already exist
6. **Don't forget revalidatePath** - Call after mutations for fresh data
7. **Don't skip error handling** - Wrap database calls in try/catch
8. **Don't hardcode values** - Use environment variables and configs

---

## 📊 Progress Tracking

Keep track of overall CRM integration progress:

- Session 1: Database Foundation (✅/⏳/❌)
- Session 2: Leads Backend (✅/⏳/❌)
- Session 3: Leads UI (✅/⏳/❌)
- Session 4: Contacts Module (✅/⏳/❌)
- Session 5: Deals Pipeline (✅/⏳/❌)
- Session 6: Listings Module (✅/⏳/❌)
- Session 7: Calendar & Appointments (✅/⏳/❌)
- Session 8: Analytics & Reporting (✅/⏳/❌)
- Session 9: CRM Dashboard (✅/⏳/❌)
- Session 10: Testing & Go-Live (✅/⏳/❌)

**Overall Progress:** X/10 sessions complete

---

**Note:** This template ensures consistency across all sessions and helps maintain the high quality standards defined in the platform's CLAUDE.md files.
