# Expenses & Taxes Module - Single Agent Session Prompt

**Session-based development using strive-agent-universal**

Use this prompt at the beginning of each session. Replace `{SESSION_NUMBER}` with current session (1-12).

---

## 📋 SESSION START PROMPT

```
I'm starting Session {5} of the Expenses & Taxes Module integration.

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
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\expenses-&-taxes-module\session-{SESSION_NUMBER}.plan.md

5. **Dashboard Modernization Guide** (dashboard already complete):
   /Users/grant/Documents/GitHub/Strive-SaaS/(platform)/update-sessions/dashboard-&-module-integrations/expenses-&-taxes-module/DASHBOARD-MODERNIZATION-UPDATE.md

   NOTE: Expense dashboard enhanced in Phase 5A (Oct 2025)
   - Integrates real components (ExpenseKPIs, TaxEstimateCard, CategoryBreakdown)
   - Follow established patterns for new expense/tax pages

---

## STEP 2: LAUNCH DEVELOPMENT AGENT

Use the strive-agent-universal agent for implementation:

Task strive-agent-universal "
Expenses & Taxes Module - Session {SESSION_NUMBER}

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
- Financial data security: Extra validation for expenses/tax data
- Receipt storage: Use encrypted storage for sensitive documents
- Document encryption: Reference DOCUMENT_ENCRYPTION_KEY from .env.local
- Subscription tiers: Expenses module requires STARTER tier minimum
- Input validation: Use Zod schemas for ALL user input
- Amount validation: Prevent negative values, currency formatting

Architecture:
- Route structure: app/real-estate/expense-tax/ (Expense & Tax module)
- Follow Industry > Module > Page hierarchy from platform CLAUDE.md
- Components in components/real-estate/expense-tax/
- Backend logic in lib/modules/expense-tax/
- File size limit: 500 lines max (hard ESLint block)

UI/UX:
- Follow MODULE-DASHBOARD-GUIDE.md patterns (see DASHBOARD-MODERNIZATION-UPDATE.md)
- Integrates with real components (ExpenseKPIs, TaxEstimateCard, CategoryBreakdown)
- Glass morphism (.glass, .glass-strong) with neon borders (cyan, purple, green, orange)
- Reference: Expense dashboard (136 lines, Phase 5A enhanced)
- Quality standards: TypeScript 0 errors, ESLint 0 warnings, <500 lines
- Accessibility: WCAG AA, responsive mobile-first

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
- [ ] Financial data properly validated and sanitized
- [ ] Receipt storage uses encrypted storage
- [ ] Server Actions validate with Zod schemas
- [ ] RBAC checks both GlobalRole AND OrganizationRole
- [ ] No secrets exposed in code
- [ ] No references to .env.local file content

### Architecture Validation
- [ ] Routes in correct directories (app/real-estate/expense-tax/)
- [ ] Components properly organized (components/real-estate/expense-tax/)
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
- npm test -- expense
- npm run build 2>&1 | tail -20

Security checks:
- Grep for organizationId filters: grep -r 'prisma\\..*\\.findMany' app/real-estate/expense-tax/ lib/modules/expense-tax/
- Verify RBAC checks: grep -r 'requireAuth' app/real-estate/expense-tax/
- Check file sizes: find app/real-estate/expense-tax/ -name '*.tsx' -exec wc -l {} + | sort -rn | head -10

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

### Route Structure (Expenses & Taxes)
```
app/real-estate/expense-tax/
├── dashboard/           # Expense & tax dashboard
├── expenses/            # Expense tracking
│   ├── page.tsx        # Expense list
│   ├── [id]/           # Expense detail
│   ├── new/            # Add expense
│   └── categories/     # Expense categories
├── receipts/            # Receipt management
│   ├── page.tsx        # Receipt library
│   └── upload/         # Receipt upload
├── reports/             # Expense reports
│   ├── page.tsx        # Report list
│   ├── [id]/           # Report detail
│   └── generate/       # Generate report
└── tax-estimates/       # Tax estimation
    ├── page.tsx        # Tax dashboard
    └── [year]/         # Year-specific estimates
```

### Expense Management Pattern
```typescript
// Expense must be owned by organization
interface Expense {
  id: string;
  amount: number;           // Positive values only
  currency: string;         // USD, EUR, etc.
  category: ExpenseCategory;
  organizationId: string;   // Multi-tenancy
  userId: string;           // Creator
  receiptId?: string;       // Receipt reference
  date: Date;
  description: string;
}

// Expense access validation
export async function getExpense(expenseId: string) {
  const session = await requireAuth();

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      organizationId: session.user.organizationId  // Critical!
    }
  });

  if (!expense) throw new Error('Expense not found');
  return expense;
}
```

### Database Models (Expense-Specific)
Refer to shared/prisma/SCHEMA-QUICK-REF.md for:
- Expense - Expense records
- ExpenseCategory - Expense categories
- Receipt - Receipt documents
- ExpenseReport - Expense reports
- TaxEstimate - Tax estimates

### API Routes
```
app/api/v1/
├── expenses/
│   ├── crud/            # Expense CRUD
│   ├── categories/      # Category management
│   └── receipts/        # Receipt upload/management
├── reports/
│   ├── generate/        # Generate reports
│   └── export/          # Export data
└── taxes/
    └── estimates/       # Tax estimation
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
- Unencrypted receipts → Security risk

---

**Version:** 1.0 - Single Agent Orchestration | Last Updated: 2025-10-06
