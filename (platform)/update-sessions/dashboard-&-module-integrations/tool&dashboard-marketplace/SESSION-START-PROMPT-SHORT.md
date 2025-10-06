# Tool & Dashboard Marketplace Integration - Session Start Prompt

Use this prompt at the beginning of each session. Replace `{SESSION_NUMBER}` with the current session number (1-8).

---

## 📋 Session Start Prompt

```
I'm starting Session {SESSION_NUMBER} of the Tool & Dashboard Marketplace integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\tool&dashboard-marketplace\session-{SESSION_NUMBER}.plan.md
   - Understand the objectives, requirements, and implementation steps
   - Note all dependencies and prerequisites
   - ALL implementation details are in the session plan - refer to it throughout

3. **Create Comprehensive Todo List:**
   - Use the TodoWrite tool to create an in-depth todo list with:
     * Specific, granular tasks from the session plan
     * Proper status (pending/in_progress/completed)
     * Active form descriptions for in-progress items
     * Include verification steps (type check, tests, manual validation)
   - DO NOT proceed without creating the todo list

4. **Important Reminders:**
   - ALWAYS read files before editing them (READ-BEFORE-EDIT MANDATE)
   - Maintain multi-tenancy (organizationId on all queries)
   - Enforce RBAC permissions on all Server Actions
   - Use Supabase MCP tools for all database operations
   - Validate all input with Zod schemas
   - Add proper error handling and loading states
   - Ensure mobile responsiveness
   - Cart must persist across page refreshes (database-backed)
   - Reviews restricted to purchased tools only

5. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead

6. **Session End Requirements (MANDATORY):**
   DO NOT report session complete without:
   - Creating session summary file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\tool&dashboard-marketplace\session-{SESSION_NUMBER}-summary.md
   - Including:
     * Session objectives (completed/partial/not started)
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features added
     * Issues encountered and resolutions
     * Verification performed (include command outputs as proof)
     * Next steps / what's ready for next session
     * Overall progress percentage for marketplace integration

Let's begin Session {SESSION_NUMBER}!
```

---

## ✅ Session Completion Checklist

Before marking a session as complete, ensure:

- [ ] All objectives from session plan completed
- [ ] All files created/modified as specified
- [ ] Multi-tenancy enforced (organizationId checks)
- [ ] RBAC permissions added and tested
- [ ] Input validation with Zod implemented
- [ ] Shopping cart persistence verified (Sessions 4+)
- [ ] Review restrictions tested (Session 6+)
- [ ] Error handling added
- [ ] Code follows platform standards (CLAUDE.md)
- [ ] Session summary file created with verification proof
- [ ] Ready to proceed to next session

---

## 🚨 Top 5 Common Pitfalls to Avoid

1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't forget organizationId** - Every marketplace model needs multi-tenancy
3. **Don't skip RBAC checks** - Every Server Action needs permission validation
4. **Don't use Prisma CLI directly** - Use Supabase MCP tools instead
5. **Don't skip cart persistence** - Cart must survive page refreshes (database-backed)

---

**Integration Guide:** `tool-marketplace-integration-plan.md`
**Session Plans:** `session-[1-8].plan.md` (read these for complete implementation details)
**Platform Standards:** `(platform)/CLAUDE.md`

---
