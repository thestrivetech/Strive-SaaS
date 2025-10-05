# REID Dashboard Integration - Session Start Prompt Template

Use this prompt at the beginning of each session. Simply replace `{SESSION_NUMBER}` with the current session number (1-12).

---

## 📋 Session Start Prompt

```
I'm starting Session {SESSION_NUMBER} of the REID Dashboard integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Read the root CLAUDE.md file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Read the platform-specific CLAUDE.md at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all development rules, security requirements, and architectural patterns

2. **Read Integration Guide:**
   - Read the REID integration plan at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\REIDashboard\reid-dashboard-integration-plan.md
   - Understand the dark theme design specifications
   - Note the 8 core modules and their requirements

3. **Read Session Plan:**
   - Read the session plan file at: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\REIDashboard\session-{SESSION_NUMBER}.plan.md
   - Understand the objectives, requirements, and implementation steps
   - Note all dependencies and prerequisites

4. **Create Detailed Todo List:**
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
     * Database operations (via Supabase MCP tools)
     * Dark theme preservation
     * Any additional tasks from the session plan

5. **Important Reminders:**
   - ALWAYS read files before editing them (READ-BEFORE-EDIT MANDATE)
   - Follow the READ-BEFORE-EDIT MANDATE from CLAUDE.md
   - Maintain multi-tenancy (organizationId on all queries)
   - Enforce RBAC permissions on all Server Actions
   - Preserve REID dark theme (--reid-* CSS variables)
   - Use Supabase MCP tools for all database operations
   - Validate all input with Zod schemas
   - Add proper error handling and loading states
   - Ensure mobile responsiveness
   - Maintain 500-line file size limit

6. **REID-Specific Requirements:**
   - Dark Theme: Use reid-theme CSS variables (#0f172a background, #06b6d4 cyan accent)
   - Neon Accents: Apply cyan/purple glow effects on hover
   - Data Density: Grid layouts for comprehensive information display
   - Typography: Inter for UI, Fira Code for metrics
   - Elite Tier: AI features require Elite subscription
   - Growth Tier: Limited to 50 insights, 10 alerts, 5 reports/month
   - RLS: All REID tables must have tenant isolation policies

7. **Database Operations:**
   - For schema changes: Use Supabase MCP `apply_migration` tool
   - For queries: Use Supabase MCP `execute_sql` tool
   - For inspections: Use Supabase MCP `list_tables` tool
   - DO NOT use prisma CLI commands directly - use MCP tools instead
   - After migrations: Run `npx prisma generate --schema=shared/prisma/schema.prisma` locally

8. **Session End Requirements:**
   When the session is complete, create a session summary file:
   - File path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\REIDashboard\session-{SESSION_NUMBER}-summary.md
   - Include:
     * Session objectives (completed/partial/not started)
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features added
     * Any issues encountered and how they were resolved
     * Testing performed
     * Dark theme verification
     * RBAC/multi-tenancy checks performed
     * Next steps / what's ready for next session
     * Overall progress percentage for REID integration

Let's begin Session {SESSION_NUMBER} of the REID Dashboard integration!
```

---

## ✅ Session Completion Checklist

Before marking a session as complete, ensure:

### Code Quality
- [ ] All objectives from session plan completed
- [ ] All files created/modified as specified
- [ ] READ-BEFORE-EDIT mandate followed
- [ ] File size limits maintained (<500 lines)
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] Zero linting warnings (`npm run lint`)

### Security & Architecture
- [ ] Multi-tenancy enforced (organizationId checks)
- [ ] RBAC permissions added and tested
- [ ] Input validation with Zod implemented
- [ ] Tier limits enforced (GROWTH vs ELITE)
- [ ] No secrets exposed to client
- [ ] Error handling added

### REID-Specific
- [ ] Dark theme preserved (--reid-* variables)
- [ ] Neon accents on interactive elements
- [ ] Typography correct (Inter UI, Fira Code data)
- [ ] Mobile responsive design
- [ ] Leaflet SSR compatibility (if Session 7)
- [ ] Charts dark-themed (if Session 8)

### Database (if applicable)
- [ ] Supabase MCP tools used for migrations
- [ ] RLS policies enabled on new tables
- [ ] Indexes created for performance
- [ ] Prisma client regenerated locally

### Testing
- [ ] Unit tests added (if applicable)
- [ ] Component tests added (if applicable)
- [ ] Integration tests added (if applicable)
- [ ] Manual testing performed

### Documentation
- [ ] Code comments for complex logic
- [ ] Session summary file created
- [ ] Ready to proceed to next session

---

## 🚨 Common Pitfalls to Avoid

### General
1. **Don't skip reading existing files** - Always use Read tool before Edit
2. **Don't forget organizationId** - Every REID model needs multi-tenancy
3. **Don't skip RBAC checks** - Every Server Action needs permission validation
4. **Don't use Prisma CLI directly** - Use Supabase MCP tools instead
5. **Don't create duplicate code** - Check if components/modules already exist
6. **Don't forget revalidatePath** - Call after mutations for fresh data
7. **Don't skip error handling** - Wrap database calls in try/catch
8. **Don't hardcode values** - Use environment variables and configs

### REID-Specific
1. **Don't break dark theme** - Always use --reid-* CSS variables
2. **Don't mix theme styles** - REID has its own design system
3. **Don't forget tier limits** - GROWTH has monthly caps, ELITE unlimited
4. **Don't skip AI tier checks** - AI features require Elite subscription
5. **Don't use light map tiles** - Use dark CartoDB tiles for heatmap
6. **Don't forget Fira Code** - Metric values use monospace font
7. **Don't skip RLS on new tables** - All REID tables need tenant isolation
8. **Don't hardcode API keys** - Use environment variables for OpenRouter/Groq

### Database
1. **Don't bypass RLS** - Never use SUPABASE_SERVICE_ROLE_KEY on client
2. **Don't skip migrations** - Always use Supabase MCP apply_migration
3. **Don't forget indexes** - Add indexes on commonly queried fields
4. **Don't skip validation** - Verify schema changes with list_tables
5. **Don't forget relationships** - Update User/Organization models for relations

---

## 📊 Session Progress Tracker

Track completion across all sessions:

- [ ] Session 1: Database Foundation & REID Schema
- [ ] Session 2: REID Module Structure & Core Services
- [ ] Session 3: Reports & Export Module
- [ ] Session 4: User Preferences & Dashboard Customization
- [ ] Session 5: Dark Theme UI Components & Styling
- [ ] Session 6: AI Profile Generation & Insights Analysis
- [ ] Session 7: Market Heatmap & Interactive Maps
- [ ] Session 8: Analytics Charts & ROI Simulator
- [ ] Session 9: Alerts Management UI
- [ ] Session 10: Main Dashboard Assembly & Routing
- [ ] Session 11: Testing & Quality Assurance
- [ ] Session 12: Documentation & Deployment Preparation

---

## 🔗 Quick Reference Links

### Documentation
- [Integration Plan](./reid-dashboard-integration-plan.md) - Full REID specifications
- [Root CLAUDE.md](../../../CLAUDE.md) - Repository-wide standards
- [Platform CLAUDE.md](../../CLAUDE.md) - Platform-specific rules

### Key Files (Created in Sessions)
- Database Schema: `shared/prisma/schema.prisma`
- REID Module: `lib/modules/reid/`
- UI Components: `components/real-estate/reid/`
- Dashboard Page: `app/real-estate/reid/dashboard/page.tsx`
- API Routes: `app/api/v1/reid/`
- Global Styles: `app/globals.css` (--reid-* variables)

### Supabase MCP Tools
- `mcp__supabase__apply_migration` - Apply database migrations
- `mcp__supabase__execute_sql` - Run SQL queries
- `mcp__supabase__list_tables` - List database tables
- `mcp__supabase__list_migrations` - Check migration history

---

## 💡 Pro Tips

1. **Start each session fresh** - Re-read session plan, don't rely on memory
2. **Verify before implementing** - Check if files/components already exist
3. **Test incrementally** - Don't wait until end of session to test
4. **Preserve dark theme** - Always preview changes in dark mode
5. **Check tier limits** - Verify GROWTH caps, ELITE unlimited
6. **Use MCP tools** - They handle RLS context automatically
7. **Follow patterns** - Reference CRM module for similar patterns
8. **Document as you go** - Update session summary incrementally

---

**Remember:** REID is a premium, Elite-tier feature with a distinctive dark theme and professional design. Every component should reflect the high-quality, data-dense interface specified in the integration guide.
