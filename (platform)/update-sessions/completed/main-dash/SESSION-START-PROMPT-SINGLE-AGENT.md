# Main Dashboard - Single Agent Session Prompt

**Session-based development using strive-agent-universal**

Use this prompt at the beginning of each session. Replace `{SESSION_NUMBER}` with current session (1-12).

---

## 📋 SESSION START PROMPT

```
I'm starting Session {5} of the Main Dashboard integration.

## STEP 1: READ ESSENTIAL DOCUMENTATION

Read these files in order (ALWAYS at session start):

1. **Agent Orchestration Guide** (token-efficient patterns):
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\.claude\agents\single-agent-usage-guide.md

   Focus on:
   - ⚡ QUICK REFERENCE section (database workflow, security, routes)
   - Database orchestration patterns (99% token savings)
   - Platform security requirements checklist
   - Verification format expectations

2. **Root Development Standards**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md

   Focus on:
   - Tri-fold architecture overview
   - Read-before-edit mandate
   - Database workflow (NEVER use MCP list_tables)
   - Shared Prisma schema paths

3. **Platform-Specific Standards**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md

   Focus on:
   - Multi-industry architecture (Industry > Module > Page)
   - Dual-role RBAC system
   - 6-tier subscription enforcement
   - Security mandates (document encryption, multi-tenancy)

4. **Session Plan**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\main-dash\session-{SESSION_NUMBER}.plan.md

---

## STEP 2: LAUNCH DEVELOPMENT AGENT

Use the strive-agent-universal agent for implementation:

Task strive-agent-universal "
Main Dashboard - Session {SESSION_NUMBER}

## Context Files Already Read
You can reference patterns from:
- single-agent-usage-guide.md (orchestration patterns)
- Root CLAUDE.md (tri-fold architecture, database workflow)
- Platform CLAUDE.md (multi-industry structure, security requirements)
- session-{SESSION_NUMBER}.plan.md (objectives and requirements)

## Session Objectives
[Copy objectives from session plan]

## Requirements

Database:
- Read shared/prisma/SCHEMA-QUICK-REF.md for model reference (NEVER use MCP list_tables)
- Read shared/prisma/SCHEMA-MODELS.md for field details if needed
- Use shared schema path: --schema=../shared/prisma/schema.prisma
- For schema changes: Use npm run db:migrate
- After schema changes: Run npm run db:docs

Security (Platform-Specific):
- Dual-role RBAC: Check BOTH GlobalRole AND OrganizationRole
- Multi-tenancy: Filter ALL queries by organizationId
- Dashboard data: Aggregate across user's organization only
- Subscription tiers: Validate feature access per tier
- Input validation: Use Zod schemas for ALL user input
- Widget permissions: Validate user can access requested data

Architecture:
- Route structure: app/real-estate/dashboard/ (industry main dashboard)
- Follow Industry > Module > Page hierarchy from platform CLAUDE.md
- Components in components/features/dashboard/ and components/shared/
- Backend logic in lib/modules/dashboard/ and lib/modules/analytics/
- File size limit: 500 lines max (hard ESLint block)

UI/UX:
- Clean professional design system
- Elevation: var(--elevate-1), var(--elevate-2)
- Primary color: hsl(240 100% 27%)
- Use hover-elevate class for interactions
- Mobile-first responsive (Tailwind breakpoints)
- Light/dark mode support
- Dashboard widgets must be draggable/customizable

Implementation:
1. Create TodoWrite list FIRST (granular tasks with activeForm)
2. Read existing files before editing (READ-BEFORE-EDIT mandate)
3. Follow session plan implementation steps
4. Test as you build (TypeScript, linting, functionality)
5. Verify security requirements (RBAC, organizationId, tier validation)

Verification (Include command outputs in report):
- cd (platform)
- TypeScript: npx tsc --noEmit
- Linting: npm run lint
- Tests: npm test -- [relevant path]
- Build: npm run build

Report Format:
Provide ✅ EXECUTION REPORT with:
- Project: (platform)
- Files Modified: [list with line counts]
- Verification Results: [actual command outputs, not just 'passed']
- Changes Summary: [what was implemented]
- Issues Found: NONE / [detailed list with resolutions]

BLOCKING: DO NOT report complete without verification command outputs.
"

---

## STEP 3: MONITOR AGENT EXECUTION

As the agent works, verify quality in real-time:

### ✅ Positive Indicators
- Agent creates TodoWrite list BEFORE coding
- Agent reads files before editing them
- Agent uses local schema docs (not MCP list_tables)
- Agent includes organizationId filters in queries
- Agent checks BOTH GlobalRole AND OrganizationRole
- Agent provides actual command outputs in reports
- Agent stays within 500-line file limit

### 🚨 Warning Signs (Intervene Immediately)
- Skips TodoWrite tool
- Creates files without reading existing patterns
- Uses MCP list_tables for schema inspection (18k token waste!)
- Queries without organizationId filter (data leak risk!)
- Only checks GlobalRole (missing OrganizationRole)
- Reports success without verification outputs
- Creates files >500 lines
- Hardcodes secrets or references .env.local values directly

### 🛑 Critical Failures (Stop and Redirect)
- Reports complete without verification commands
- Creates duplicate functionality (didn't search for existing)
- Bypasses security checks (no RBAC validation)
- Commits security violations (exposes secrets, missing validation)
- Breaks multi-tenancy (cross-org data access possible)

### Intervention Pattern
If agent deviates from requirements:

Task strive-agent-universal "
CORRECTION NEEDED: [Specific issue]

Problem: [What went wrong]
Expected: [What should have been done per CLAUDE.md or usage guide]

Please:
1. Review [relevant section from CLAUDE.md or usage guide]
2. Fix [specific files/code]
3. Re-verify with [specific commands]
4. Provide updated EXECUTION REPORT

Reference: [Quote exact requirement from documentation]
"

---

## STEP 4: VALIDATE COMPLETION

After agent reports complete, independently verify:

### Agent Report Checklist
- [ ] ✅ EXECUTION REPORT provided
- [ ] TodoWrite list created before implementation
- [ ] All session objectives marked complete
- [ ] Files modified list provided with line counts
- [ ] Verification command outputs included (not just "passed")
- [ ] TypeScript: 0 errors (actual output shown)
- [ ] Linting: 0 warnings (actual output shown)
- [ ] Tests: All passing (actual output shown)
- [ ] Build: Successful (actual output shown)

### Security Validation
- [ ] All queries filter by organizationId (multi-tenancy)
- [ ] Dashboard aggregations scope to user's organization
- [ ] Server Actions validate with Zod schemas
- [ ] RBAC checks both GlobalRole AND OrganizationRole
- [ ] No secrets exposed in code
- [ ] No references to .env.local file content

### Architecture Validation
- [ ] Routes in correct directories (app/real-estate/dashboard/)
- [ ] Components properly organized (components/features/dashboard/)
- [ ] Backend logic in lib/modules/
- [ ] No files exceed 500 lines
- [ ] Follows Industry > Module > Page hierarchy

### Follow-Up Verification (If Needed)
If agent report lacks detail or you need additional verification:

Task strive-agent-universal "
VERIFICATION TASK: Confirm Session {SESSION_NUMBER} completion

Execute and provide outputs:
- cd (platform)
- npx tsc --noEmit | head -30
- npm run lint | grep -E '(error|warning)'
- npm test -- dashboard
- npm run build 2>&1 | tail -20

Security checks:
- Grep for organizationId filters: grep -r 'prisma\\..*\\.findMany' app/real-estate/dashboard/ lib/modules/dashboard/
- Verify RBAC checks: grep -r 'requireAuth' app/real-estate/dashboard/
- Check file sizes: find app/real-estate/dashboard/ -name '*.tsx' -exec wc -l {} + | sort -rn | head -10

Provide complete outputs and confirm all checks pass.
"

---

## STEP 5: CREATE SESSION SUMMARY

After validation, create summary document:

File: session-{SESSION_NUMBER}-summary.md

Required sections:
1. **Session Objectives** - List with ✅ COMPLETE or 🚧 PARTIAL status
2. **Files Created** - Full paths with purpose
3. **Files Modified** - Full paths with changes summary
4. **Key Implementations** - Features added, components built
5. **Security Implementation** - RBAC checks, multi-tenancy, validation
6. **Testing** - What was tested, coverage achieved
7. **Issues & Resolutions** - Problems encountered and how solved
8. **Next Session Readiness** - What's ready, any blockers
9. **Overall Progress** - Percentage complete for full integration

---

## 🔑 INTEGRATION-SPECIFIC REMINDERS

### Route Structure (Main Dashboard)
```
app/real-estate/dashboard/
├── page.tsx              # Main dashboard page (industry overview)
├── layout.tsx            # Dashboard layout wrapper
├── loading.tsx           # Loading state
├── error.tsx             # Error boundary
└── widgets/              # Dashboard widget components
    ├── metrics-widget.tsx
    ├── activity-widget.tsx
    ├── quick-actions-widget.tsx
    └── analytics-widget.tsx
```

### Dashboard Widget Pattern
```typescript
// Each widget should be self-contained
interface DashboardWidget {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  organizationId: string;  // Multi-tenancy
  userId: string;          // Personalization
}

// Widget data MUST filter by org
export async function getWidgetData(widgetId: string) {
  const session = await requireAuth();

  return prisma.widgetData.findMany({
    where: {
      widgetId,
      organizationId: session.user.organizationId  // Critical!
    }
  });
}
```

### Database Models (Dashboard-Specific)
Refer to shared/prisma/SCHEMA-QUICK-REF.md for:
- DashboardWidget - User widget configurations
- DashboardMetrics - Cached metrics data
- ActivityFeed - User/org activity stream
- QuickAction - User quick action buttons
- UserDashboard - User dashboard preferences

### API Routes
```
app/api/v1/
├── dashboard/
│   ├── widgets/         # Widget CRUD
│   ├── metrics/         # Metrics aggregation
│   ├── activity/        # Activity feed
│   └── customize/       # Dashboard customization
```

---

## 🎯 SUCCESS CRITERIA

Session is complete when:

✅ All objectives from session plan achieved
✅ Agent provided EXECUTION REPORT with verification outputs
✅ 0 TypeScript errors
✅ 0 ESLint warnings
✅ All tests passing
✅ Build successful
✅ Security requirements met (RBAC, multi-tenancy, validation)
✅ Architecture standards followed (routes, components, file sizes)
✅ Session summary created with all required sections
✅ Ready to proceed to next session

---

**Now begin Session {SESSION_NUMBER}!**
```

---

## 💡 QUICK TIPS

**Token Efficiency:**
- Local schema docs: ~500 tokens vs MCP list_tables: ~18,000 tokens
- **Savings per session: 15k-20k tokens**

**Quality Patterns:**
- TodoWrite first, then code
- Read before edit
- Verify incrementally
- Include command outputs

**Common Issues:**
- Missing organizationId → Data leak
- Single-role RBAC → Incomplete auth
- MCP list_tables → Token waste
- Files >500 lines → ESLint block

---

**Version:** 1.0 - Single Agent Orchestration | Last Updated: 2025-10-06
