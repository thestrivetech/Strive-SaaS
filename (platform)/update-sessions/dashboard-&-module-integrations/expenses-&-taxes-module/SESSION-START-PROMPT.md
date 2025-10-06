# Expenses & Taxes Integration - Session Start Prompt Template

Use this prompt at the beginning of each session. Simply replace `{SESSION_NUMBER}` with the current session number (1-10).

---

## 📋 Session Start Prompt

```
I'm starting Session 3 of the Expenses & Taxes integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Integration Guide:**
   - Read the integration plan at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\expenses-&-taxes-module\expenses-taxes-integration-plan.md
   - Understand the UI design requirements and module architecture

3. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\expenses-&-taxes-module\session-3.plan.md
   - Understand the objectives, requirements, and implementation steps
   - Note all dependencies and prerequisites

4. **Create Detailed Todo List:**
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

5. **Important Reminders:**
   - ALWAYS read files before editing them
   - Follow the READ-BEFORE-EDIT MANDATE from CLAUDE.md
   - Maintain multi-tenancy (organizationId on all queries)
   - Enforce RBAC permissions on all Server Actions
   - Use Supabase MCP tools for all database operations (schema changes, migrations, queries)
   - Validate all input with Zod schemas
   - Add proper error handling and loading states
   - Ensure mobile responsiveness
   - Match UI design from integration plan (pixel-perfect where specified)

6. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead
   - After migrations: Run `npx prisma generate --schema=../shared/prisma/schema.prisma` locally

7. **Module Architecture:**
   - Follow module self-containment pattern
   - Structure: actions.ts, queries.ts, schemas.ts, index.ts
   - No cross-module imports (only shared types from @prisma/client)
   - Export only public API in index.ts

8. **UI Component Guidelines:**
   - Server Components by default
   - "use client" only when necessary (hooks, state, interactivity)
   - Use Suspense for async data
   - Implement loading skeletons
   - Add error boundaries
   - Match color scheme from integration plan:
     * Background: #F9FAFB
     * Cards: White with shadows
     * Success: #10B981
     * Warning: #EF4444
     * Primary text: #374151

9. **Testing Requirements:**
   - Write tests for all Server Actions
   - Test RBAC enforcement
   - Verify multi-tenancy isolation
   - Test file upload/validation (Session 3+)
   - Ensure 80%+ code coverage

10. **Session End Requirements:**
    When the session is complete, create a session summary file:
    - File path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\expenses-&-taxes-module\session-3-summary.md
    - Include:
      * Session objectives (completed/partial/not started)
      * Files created (full list with paths)
      * Files modified (full list with paths)
      * Key implementations and features added
      * Any issues encountered and how they were resolved
      * Testing performed (manual and automated)
      * Screenshots or UI validation (for UI sessions)
      * Next steps / what's ready for next session
      * Overall progress percentage for the entire Expenses & Taxes integration

Let's begin Session 3!
```

---

## ✅ Session Completion Checklist

Before marking a session as complete, ensure:

### General (All Sessions)
- [ ] All objectives from session plan completed
- [ ] All files created/modified as specified
- [ ] Multi-tenancy enforced (organizationId checks)
- [ ] RBAC permissions added and tested
- [ ] Input validation with Zod implemented
- [ ] Error handling added
- [ ] Code follows platform standards (CLAUDE.md)
- [ ] Session summary file created
- [ ] Ready to proceed to next session

### Backend Sessions (1-4)
- [ ] Database schema updated correctly
- [ ] RLS policies enabled and tested
- [ ] Server Actions protected with RBAC
- [ ] Zod schemas validate all input
- [ ] API routes functional
- [ ] Multi-tenancy verified with test data
- [ ] Prisma client regenerated

### Frontend Sessions (5-9)
- [ ] Components match UI design
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Mobile responsive
- [ ] TanStack Query integration working
- [ ] Forms validated with React Hook Form + Zod
- [ ] Accessibility (ARIA labels, keyboard nav)

### Final Session (10)
- [ ] All tests passing (80%+ coverage)
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Documentation written
- [ ] Deployment checklist verified
- [ ] No TypeScript errors
- [ ] No ESLint warnings

---

## 🚨 Common Pitfalls to Avoid

### Database & Backend (Sessions 1-4)
1. **Don't skip RLS policies** - Enable RLS before inserting data
2. **Don't forget organizationId** - Every expense model needs it
3. **Don't skip RBAC checks** - Every Server Action needs permission validation
4. **Don't use Prisma CLI directly** - Use Supabase MCP tools instead
5. **Don't forget revalidatePath** - Call after mutations for fresh data
6. **Don't hardcode values** - Use environment variables and configs
7. **Don't expose secrets** - Check .env.local, never commit it

### UI & Frontend (Sessions 5-9)
1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't create duplicate components** - Check if components already exist
3. **Don't use "use client" everywhere** - Only when hooks/state needed
4. **Don't forget Suspense** - Wrap async components properly
5. **Don't hardcode colors** - Use Tailwind classes from design guide
6. **Don't skip mobile testing** - Test responsive breakpoints
7. **Don't forget accessibility** - Add ARIA labels, keyboard support

### File Operations (Session 3)
1. **Don't skip file validation** - Check MIME type and size
2. **Don't store without org isolation** - Use org-id in storage path
3. **Don't forget cleanup** - Delete from storage before DB delete
4. **Don't bypass Supabase Storage** - Use MCP tools for storage operations

### Testing (Session 3)
1. **Don't skip tests** - Write tests as you code, not after
2. **Don't test only happy paths** - Test errors, edge cases, RBAC
3. **Don't ignore coverage** - 80% minimum required
4. **Don't skip manual testing** - Test full user flows

---

## 📚 Quick Reference

### Session Breakdown
- **Session 3:** Database schema (Expense, ExpenseCategory, TaxEstimate, ExpenseReport, Receipt)
- **Session 3:** Expense module backend (Server Actions, queries, API routes)
- **Session 3:** Categories & receipts (CRUD, Supabase Storage upload)
- **Session 3:** Tax estimates & reports (calculations, report generation)
- **Session 3:** Dashboard UI (KPI cards, summary display)
- **Session 3:** Expense table & modal (CRUD UI, receipt upload)
- **Session 3:** Tax & charts UI (tax calculator, category breakdown)
- **Session 3:** Analytics & reports pages (trends, report generation UI)
- **Session 3:** Settings page (category management, preferences)
- **Session 3:** Testing, polish, documentation (production-ready)

### Key Files by Session

**Session 3:**
- `shared/prisma/schema.prisma` (add models)
- Database migrations via Supabase MCP

**Session 3:**
- `lib/modules/expenses/expenses/*.ts`
- `lib/modules/expenses/summary/*.ts`
- `app/api/v1/expenses/route.ts`
- `lib/auth/rbac.ts` (add permissions)

**Session 3:**
- `lib/modules/expenses/categories/*.ts`
- `lib/modules/expenses/receipts/*.ts`
- `app/api/v1/expenses/categories/route.ts`
- `app/api/v1/expenses/receipts/route.ts`

**Session 3:**
- `lib/modules/expenses/tax-estimates/*.ts`
- `lib/modules/expenses/reports/*.ts`
- `app/api/v1/expenses/tax-estimate/route.ts`
- `app/api/v1/expenses/reports/route.ts`

**Session 3:**
- `app/real-estate/expenses/page.tsx`
- `components/real-estate/expenses/dashboard/*.tsx`

**Session 3:**
- `components/real-estate/expenses/tables/*.tsx`
- `components/real-estate/expenses/forms/*.tsx`

**Session 3:**
- `components/real-estate/expenses/tax/*.tsx`
- `components/real-estate/expenses/charts/*.tsx`

**Session 3:**
- `app/real-estate/expenses/analytics/page.tsx`
- `app/real-estate/expenses/reports/page.tsx`
- `components/real-estate/expenses/analytics/*.tsx`
- `components/real-estate/expenses/reports/*.tsx`

**Session 3:**
- `app/real-estate/expenses/settings/page.tsx`
- `components/real-estate/expenses/settings/*.tsx`

**Session 3:**
- `__tests__/modules/expenses/*.test.ts`
- `docs/expenses-taxes/*.md`

---

## 🎯 Module Overview

**Total Sessions:** 10
**Estimated Time:** 25-30 hours total
**Complexity:** Medium-High

**Features Delivered:**
- Complete expense tracking system
- Receipt upload and management
- Tax estimate calculations
- Expense reports and exports
- Analytics and visualizations
- Custom categories
- Multi-tenant with RBAC
- Mobile-responsive UI

**Integration Points:**
- Supabase Database (PostgreSQL)
- Supabase Storage (Receipts)
- Prisma ORM
- TanStack Query
- React Hook Form + Zod
- Recharts (visualizations)

---

**Ready to begin? Use the session start prompt above, replacing {SESSION_NUMBER} with your current session (1-10).**
