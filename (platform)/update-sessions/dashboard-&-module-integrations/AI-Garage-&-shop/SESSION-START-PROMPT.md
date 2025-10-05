# AI Garage & Shop Integration - Session Start Prompt Template

Use this prompt at the beginning of each session. Simply replace `{SESSION_NUMBER}` with the current session number (1-10).

---

## 📋 Session Start Prompt

```
I'm starting Session {SESSION_NUMBER} of the AI Garage & Shop integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\AI-Garage-&-shop\session-{SESSION_NUMBER}.plan.md
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
   - Preserve holographic/futuristic UI design from integration plan

5. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead

6. **UI Design Requirements:**
   - Preserve holographic glass morphism design
   - Use aurora gradients (cyan, violet, emerald)
   - Maintain dark-mode-first aesthetic
   - Implement magnetic hover effects
   - Add backdrop blur effects
   - Use gradient text for headings

7. **Session End Requirements:**
   When the session is complete, create a session summary file:
   - File path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\AI-Garage-&-shop\session-{SESSION_NUMBER}-summary.md
   - Include:
     * Session objectives (completed/partial/not started)
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features added
     * Any issues encountered and how they were resolved
     * Testing performed
     * Next steps / what's ready for next session
     * Overall progress percentage for AI Garage integration

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
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Holographic UI design preserved
- [ ] Code follows platform standards (CLAUDE.md)
- [ ] Session summary file created
- [ ] Ready to proceed to next session

---

## 🚨 Common Pitfalls to Avoid

1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't forget organizationId** - Every AI Garage model needs multi-tenancy
3. **Don't skip RBAC checks** - Every Server Action needs permission validation
4. **Don't use Prisma CLI directly** - Use Supabase MCP tools instead
5. **Don't create duplicate code** - Check if components/modules already exist
6. **Don't forget revalidatePath** - Call after mutations for fresh data
7. **Don't skip error handling** - Wrap database calls in try/catch
8. **Don't hardcode values** - Use environment variables and configs
9. **Don't break holographic UI** - Preserve glass morphism and aurora effects
10. **Don't forget subscription limits** - Enforce tier-based access to AI Garage

---

## 🎨 Holographic UI Design Reference

**Key CSS Classes:**
```css
.glass-card              /* Glass morphism background */
.aurora-gradient         /* Animated gradient background */
.magnetic-hover          /* Hover scale and transform effect */
.holo-border            /* Holographic border animation */
```

**Color Palette:**
- Primary: Cyan (#06b6d4, #22d3ee)
- Secondary: Violet (#8b5cf6, #a855f7)
- Success: Emerald (#10b981, #34d399)
- Background: Slate (#020617, #0f172a, #1e293b)

**Typography:**
```typescript
// Gradient text for headings
className="bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent"
```

---

## 🔐 AI Garage Security Checklist

- [ ] All tables have RLS policies enabled
- [ ] System templates (is_system=true) accessible across orgs
- [ ] User templates (is_public=false) isolated to organization
- [ ] Public templates (is_public=true) readable by all
- [ ] Order assignment restricted to org members
- [ ] Cost calculations server-side only
- [ ] Subscription tier limits enforced
- [ ] API keys for AI models in .env.local only

---
