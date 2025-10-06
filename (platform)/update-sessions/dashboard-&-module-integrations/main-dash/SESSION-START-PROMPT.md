# Main Dashboard Integration - Session Start Prompt Template

Use this prompt at the beginning of each session. Simply replace `{SESSION_NUMBER}` with the current session number (1-7).

---

## 📋 Session Start Prompt

```
I'm starting Session 3 of the Main Dashboard integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\main-dash\session-3.plan.md
   - Understand the objectives, requirements, and implementation steps
   - Note all dependencies and prerequisites

3. **Review Integration Guide:**
   - Read the main dashboard integration plan at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\main-dash\main-dashboard-integration-plan.md
   - Understand the overall architecture and design principles
   - Note UI/UX requirements and component patterns

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
   - Follow clean dashboard design principles

6. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead

7. **Dashboard-Specific Guidelines:**
   - Use Server Components by default, Client Components only when needed
   - Implement TanStack Query for data fetching in client components
   - Add Suspense boundaries for streaming UI
   - Ensure all metrics calculations are cached (5-minute TTL)
   - Activity feed should auto-refresh every minute
   - All widgets should have configurable refresh rates
   - Follow the clean, professional UI design from the integration plan

8. **Component Standards:**
   - KPI Cards: Display metrics with trend indicators
   - Charts: Use Recharts for visualizations
   - Activity Feed: Real-time updates with filtering
   - Quick Actions: Track usage and execute properly
   - Module Shortcuts: Navigate to correct routes
   - Loading States: Always provide skeletons
   - Error States: User-friendly error messages

9. **Session End Requirements:**
   When the session is complete, create a session summary file:
   - File path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\main-dash\session-3-summary.md
   - Include:
     * Session objectives (completed/partial/not started)
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features added
     * Any issues encountered and how they were resolved
     * Testing performed
     * Next steps / what's ready for next session
     * Overall progress percentage for the entire Main Dashboard integration

Let's begin Session 3!
```

---

## ✅ Session Completion Checklist

Before marking a session as complete, ensure:

### General Requirements
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

### Dashboard-Specific Requirements
- [ ] Metrics calculations cached properly
- [ ] Activity feed updates in real-time
- [ ] Quick actions execute correctly
- [ ] Navigation works across all shortcuts
- [ ] Charts render with proper data
- [ ] KPI cards display trends accurately
- [ ] Widget refresh rates configurable
- [ ] Dashboard theme settings work
- [ ] Customization saves user preferences

### Testing Requirements (Session 3 only)
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Lighthouse score > 90

---

## 🚨 Common Pitfalls to Avoid

### General
1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't forget organizationId** - Every dashboard model needs multi-tenancy
3. **Don't skip RBAC checks** - Every Server Action needs permission validation
4. **Don't use Prisma CLI directly** - Use Supabase MCP tools instead
5. **Don't create duplicate code** - Check if components/modules already exist
6. **Don't forget revalidatePath** - Call after mutations for fresh data
7. **Don't skip error handling** - Wrap database calls in try/catch
8. **Don't hardcode values** - Use environment variables and configs

### Dashboard-Specific
9. **Don't block rendering** - Use Suspense for each section independently
10. **Don't skip caching** - Metrics should be cached (300s default)
11. **Don't forget loading states** - Every component needs skeleton UI
12. **Don't use 'use client' everywhere** - Server Components by default
13. **Don't skip mobile testing** - Test on 320px, 768px, 1024px widths
14. **Don't forget accessibility** - Add ARIA labels, semantic HTML
15. **Don't skip performance profiling** - Use React DevTools Profiler

---

## 📊 Session Progress Tracking

### Session 3: Database Foundation
- Database models: DashboardWidget, UserDashboard, ActivityFeed, QuickAction, DashboardMetric
- Enums: WidgetType, DashboardTheme, LayoutDensity, ActivityType, ActivitySeverity, ActionType, MetricCategory
- RLS policies enabled
- Prisma client generated

### Session 3: Backend Module Logic
- Module structure created
- Zod schemas for all entities
- Server Actions with RBAC
- Metrics calculation engine
- Activity tracking system
- Public API exports

### Session 3: API Routes
- RESTful endpoints created
- Metrics CRUD operations
- Activities CRUD operations
- Quick actions execution
- Error handling middleware
- Proper HTTP status codes

### Session 3: Dashboard UI - Metrics
- KPI Cards component
- Chart widgets (Line, Bar, Pie)
- Progress trackers
- Metric status badges
- Dashboard header
- Loading skeletons
- Empty states

### Session 3: Dashboard UI - Activities
- Activity feed with filtering
- Activity item actions (read, archive)
- Quick actions grid
- Quick action execution
- Module shortcuts navigation
- Real-time updates

### Session 3: Page Integration
- Main dashboard page assembled
- Dashboard layout created
- Suspense boundaries
- Error boundaries
- Navigation integration
- Middleware protection
- Customization page

### Session 3: Testing & Polish
- Unit tests (80%+ coverage)
- Integration tests
- E2E tests (Playwright)
- Performance optimization
- Accessibility audit
- Production checklist
- Documentation

---

## 🎯 Quick Reference: Session Responsibilities

| Session | Focus Area | Key Deliverables |
|---------|-----------|------------------|
| 1 | Database | Schema, migrations, RLS policies |
| 2 | Backend | Modules, schemas, actions, queries |
| 3 | API | RESTful routes, error handling |
| 4 | UI - Metrics | KPI cards, charts, progress widgets |
| 5 | UI - Activities | Activity feed, quick actions, shortcuts |
| 6 | Integration | Page assembly, layout, navigation |
| 7 | Testing | Tests, optimization, production readiness |

---

## 🔗 Related Documentation

- **Main Dashboard Integration Plan:** `main-dashboard-integration-plan.md`
- **CRM Module Example:** `../crm-module/`
- **Platform Standards:** `(platform)/CLAUDE.md`
- **Root Standards:** `CLAUDE.md`
- **Deployment Checklist:** Created in Session 3

---

## 💡 Tips for Success

1. **Start Clean:** Always check current state before beginning
2. **Read First:** Use Read tool before any Edit operation
3. **Test Early:** Write tests as you build features
4. **Think Mobile:** Design mobile-first, then scale up
5. **Cache Smart:** Expensive calculations should be cached
6. **Stream UI:** Use Suspense to avoid blocking renders
7. **Handle Errors:** Always provide user-friendly error messages
8. **Document Progress:** Keep session summaries detailed
9. **Follow Patterns:** Reference CRM module for consistency
10. **Validate Security:** Check RBAC and multi-tenancy every time

---

**Good luck with your session! Remember to create a detailed todo list before starting implementation.** 🚀
