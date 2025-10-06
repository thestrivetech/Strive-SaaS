# Landing/Admin/Pricing/Onboarding Integration - Session Start Prompt Template

Use this prompt at the beginning of each session. Simply replace `{SESSION_NUMBER}` with the current session number (1-12).

---

## 📋 Session Start Prompt

```
I'm starting Session 3 of the Landing/Admin/Pricing/Onboarding integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\landing-onboard-price-admin\session-3.plan.md
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
   - Follow clean, professional UI design from integration guide

5. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead

6. **UI Design Consistency:**
   - Follow the clean professional design system from integration guide
   - Use elevation system: `var(--elevate-1)` and `var(--elevate-2)`
   - Primary color: Blue `hsl(240 100% 27%)`
   - Use `hover-elevate` class for interactions
   - Maintain mobile-first responsive design
   - Support light/dark mode

7. **Session End Requirements:**
   When the session is complete, create a session summary file:
   - File path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\landing-onboard-price-admin\session-3-summary.md
   - Include:
     * Session objectives (completed/partial/not started)
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features added
     * Any issues encountered and how they were resolved
     * Testing performed
     * Next steps / what's ready for next session
     * Overall progress percentage for the entire integration

Let's begin Session 3!
```

---

## ✅ Session Completion Checklist

Before marking a session as complete, ensure:

- [ ] All objectives from session plan completed
- [ ] All files created/modified as specified
- [ ] Multi-tenancy enforced (organizationId checks where applicable)
- [ ] RBAC permissions added and tested (especially for admin routes)
- [ ] Input validation with Zod implemented
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Clean professional UI design maintained
- [ ] Light/dark mode support working
- [ ] Code follows platform standards (CLAUDE.md)
- [ ] Session summary file created
- [ ] Ready to proceed to next session

---

## 🚨 Common Pitfalls to Avoid

1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't forget RBAC checks** - Admin routes need `canAccessAdminPanel()` checks
3. **Don't skip error boundaries** - Wrap async components in error.tsx
4. **Don't hardcode values** - Use environment variables and configs
5. **Don't forget revalidatePath** - Call after mutations for fresh data
6. **Don't skip mobile testing** - All pages must be mobile-responsive
7. **Don't mix route groups** - Keep (public), (admin), and (platform) separate
8. **Don't expose admin APIs** - Protect all admin API routes with RBAC

---

## 🎯 Integration-Specific Notes

**Route Structure:**
- `app/(public)/` - Landing, pricing, onboarding (no auth required initially)
- `app/(admin)/` - Admin dashboard (ADMIN role only)
- `app/(marketing)/` - Marketing pages within app.strivetech.ai

**Admin Access Pattern:**
```typescript
// Every admin page/API must check:
const session = await requireAuth();
if (!canAccessAdminPanel(session.user)) {
  redirect('/dashboard');
}
```

**Database Models (Session 3):**
- AdminActionLog
- OnboardingSession
- PlatformMetrics
- FeatureFlag
- SystemAlert

**API Routes Structure:**
- `app/api/v1/admin/*` - Admin-only endpoints
- `app/api/v1/onboarding/*` - Onboarding flow endpoints
- `app/api/v1/metrics/*` - Platform metrics (admin)

---
