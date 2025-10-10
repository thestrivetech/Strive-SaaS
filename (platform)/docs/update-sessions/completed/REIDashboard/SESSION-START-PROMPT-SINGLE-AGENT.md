# REI Dashboard (Real Estate Intelligence) - Single Agent Session Prompt

**Session-based development using strive-agent-universal**

Use this prompt at the beginning of each session. Replace `{SESSION_NUMBER}` with current session (1-12).

---

## 📋 SESSION START PROMPT

```
I'm starting Session {12} of the REI Dashboard integration.

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
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\REIDashboard\session-{SESSION_NUMBER}.plan.md

---

## STEP 2: LAUNCH DEVELOPMENT AGENT

Use the strive-agent-universal agent for implementation:

Task strive-agent-universal "
REI Dashboard - Session {SESSION_NUMBER}

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
- Market data: Validate organization subscription for data access
- Property alerts: Scope to user's organization and criteria
- Subscription tiers: REI Intelligence requires GROWTH tier minimum
- Input validation: Use Zod schemas for ALL user input
- Location data privacy: Anonymize sensitive address data

Architecture:
- Route structure: app/real-estate/rei-analytics/ (REI Analytics module)
- Follow Industry > Module > Page hierarchy from platform CLAUDE.md
- Components in components/real-estate/rei-analytics/
- Backend logic in lib/modules/rei-analytics/
- File size limit: 500 lines max (hard ESLint block)

UI/UX:
- Clean professional design system
- Elevation: var(--elevate-1), var(--elevate-2)
- Primary color: hsl(240 100% 27%)
- Use hover-elevate class for interactions
- Mobile-first responsive (Tailwind breakpoints)
- Light/dark mode support
- Interactive maps with markers
- Data visualization charts

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
- [ ] Market data access validated by subscription tier
- [ ] Server Actions validate with Zod schemas
- [ ] RBAC checks both GlobalRole AND OrganizationRole
- [ ] Location data properly anonymized
- [ ] No secrets exposed in code
- [ ] No references to .env.local file content

### Architecture Validation
- [ ] Routes in correct directories (app/real-estate/rei-analytics/)
- [ ] Components properly organized (components/real-estate/rei-analytics/)
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
- npm test -- rei
- npm run build 2>&1 | tail -20

Security checks:
- Grep for organizationId filters: grep -r 'prisma\\..*\\.findMany' app/real-estate/rei-analytics/ lib/modules/rei-analytics/
- Verify RBAC checks: grep -r 'requireAuth' app/real-estate/rei-analytics/
- Check file sizes: find app/real-estate/rei-analytics/ -name '*.tsx' -exec wc -l {} + | sort -rn | head -10

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

### Route Structure (REI Dashboard)
```
app/real-estate/rei-analytics/
├── dashboard/           # REI main dashboard
├── market-reports/      # Market intelligence
│   ├── page.tsx        # Report list
│   ├── [id]/           # Report detail
│   └── generate/       # Generate custom report
├── neighborhood/        # Neighborhood insights
│   ├── page.tsx        # Neighborhood search
│   └── [id]/           # Neighborhood detail
├── alerts/              # Property alerts
│   ├── page.tsx        # Alert list
│   ├── [id]/           # Alert detail
│   └── create/         # Create alert
└── analytics/           # Advanced analytics
    ├── trends/         # Market trends
    ├── comparisons/    # Comparative analysis
    └── forecasts/      # Market forecasts
```

### Market Data Pattern
```typescript
// Market data must be organization-scoped
interface MarketReport {
  id: string;
  reportType: ReidReportType;
  areaId: string;
  organizationId: string;   // Multi-tenancy
  userId: string;           // Creator
  generatedAt: Date;
  data: any;                // Report data
}

// Market data access validation
export async function getMarketReport(reportId: string) {
  const session = await requireAuth();

  // Validate subscription tier
  if (!['GROWTH', 'ELITE', 'ENTERPRISE'].includes(session.user.subscriptionTier)) {
    throw new Error('REI Intelligence requires GROWTH tier or higher');
  }

  const report = await prisma.marketReport.findFirst({
    where: {
      id: reportId,
      organizationId: session.user.organizationId  // Critical!
    }
  });

  if (!report) throw new Error('Report not found');
  return report;
}
```

### Database Models (REI-Specific)
Refer to shared/prisma/SCHEMA-QUICK-REF.md for:
- MarketReport - Market intelligence reports
- NeighborhoodInsight - Neighborhood data
- PropertyAlert - Property alerts/notifications
- AlertTrigger - Alert criteria

### API Routes
```
app/api/v1/
├── rei/
│   ├── reports/         # Market reports
│   ├── neighborhoods/   # Neighborhood data
│   ├── alerts/          # Alert management
│   └── analytics/       # Advanced analytics
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
- Missing tier validation → Unauthorized access

---

**Version:** 1.0 - Single Agent Orchestration | Last Updated: 2025-10-06
