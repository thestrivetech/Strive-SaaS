# Tool & Dashboard Marketplace - Single Agent Session Prompt

**Session-based development using strive-agent-universal**

Use this prompt at the beginning of each session. Replace `{SESSION_NUMBER}` with current session (1-12).

---

## 📋 SESSION START PROMPT

```
I'm starting Session {SESSION_NUMBER} of the Tool & Dashboard Marketplace integration.

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
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\tool&dashboard-marketplace\session-{SESSION_NUMBER}.plan.md

5. **Dashboard Modernization Guide** (dashboard already complete):
   /Users/grant/Documents/GitHub/Strive-SaaS/(platform)/update-sessions/dashboard-&-module-integrations/tool&dashboard-marketplace/DASHBOARD-MODERNIZATION-UPDATE.md

   NOTE: Marketplace dashboard completed in Phase 5B (Oct 2025)
   - 509 lines, production-ready e-commerce UI
   - Follow established patterns for new marketplace pages
   - Tool card, subscription card, pricing badge patterns documented

---

## STEP 2: LAUNCH DEVELOPMENT AGENT

Use the strive-agent-universal agent for implementation:

Task strive-agent-universal "
Tool & Dashboard Marketplace - Session {SESSION_NUMBER}

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
- Tool purchases: Validate payment before access
- Bundle permissions: Validate organization subscription
- Tool configurations: Isolate per organization
- Subscription tiers: Marketplace access varies by tier (CUSTOM for pay-per-use)
- Input validation: Use Zod schemas for ALL user input
- Payment security: Use Stripe webhooks for verification

Architecture:
- Route structure: app/real-estate/marketplace/ (Marketplace module)
- Follow Industry > Module > Page hierarchy from platform CLAUDE.md
- Components in components/real-estate/marketplace/
- Backend logic in lib/modules/marketplace/
- File size limit: 500 lines max (hard ESLint block)

UI/UX:
- Follow MODULE-DASHBOARD-GUIDE.md patterns (see DASHBOARD-MODERNIZATION-UPDATE.md)
- E-commerce style with tool cards, pricing badges, subscription management
- Glass morphism (.glass, .glass-strong) with neon borders (cyan, purple, green, orange)
- Reference: Marketplace dashboard (509 lines, Phase 5B complete)
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
- [ ] Tool purchases validated with payment verification
- [ ] Server Actions validate with Zod schemas
- [ ] RBAC checks both GlobalRole AND OrganizationRole
- [ ] Stripe webhooks properly verified
- [ ] No secrets exposed in code
- [ ] No references to .env.local file content

### Architecture Validation
- [ ] Routes in correct directories (app/real-estate/marketplace/)
- [ ] Components properly organized (components/real-estate/marketplace/)
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
- npm test -- marketplace
- npm run build 2>&1 | tail -20

Security checks:
- Grep for organizationId filters: grep -r 'prisma\\..*\\.findMany' app/real-estate/marketplace/ lib/modules/marketplace/
- Verify RBAC checks: grep -r 'requireAuth' app/real-estate/marketplace/
- Check file sizes: find app/real-estate/marketplace/ -name '*.tsx' -exec wc -l {} + | sort -rn | head -10

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

### Route Structure (Tool & Dashboard Marketplace)
```
app/real-estate/marketplace/
├── dashboard/           # Marketplace main dashboard
├── browse/              # Browse tools
│   ├── page.tsx        # Tool listing
│   ├── [toolId]/       # Tool detail
│   └── category/       # Category browsing
├── bundles/             # Tool bundles
│   ├── page.tsx        # Bundle list
│   └── [bundleId]/     # Bundle detail
├── cart/                # Shopping cart
│   ├── page.tsx        # Cart view
│   └── checkout/       # Checkout flow
├── purchases/           # Purchase history
│   ├── page.tsx        # Purchase list
│   └── [purchaseId]/   # Purchase detail
└── installed/           # Installed tools
    ├── page.tsx        # Installed tool list
    └── [toolId]/       # Tool configuration
```

### Marketplace Tool Pattern
```typescript
// Tool purchase must be organization-scoped
interface ToolPurchase {
  id: string;
  toolId: string;
  organizationId: string;  // Multi-tenancy
  userId: string;          // Purchaser
  purchaseDate: Date;
  amount: number;
  status: PurchaseStatus;
  stripePaymentId?: string;
}

// Tool access validation
export async function hasToolAccess(toolId: string) {
  const session = await requireAuth();

  // Check if tool is included in subscription tier
  const tierTools = getTierTools(session.user.subscriptionTier);
  if (tierTools.includes(toolId)) return true;

  // Check if tool was purchased
  const purchase = await prisma.toolPurchase.findFirst({
    where: {
      toolId,
      organizationId: session.user.organizationId,
      status: 'COMPLETED'
    }
  });

  return !!purchase;
}
```

### Database Models (Marketplace-Specific)
Refer to shared/prisma/SCHEMA-QUICK-REF.md for:
- MarketplaceTool - Available tools
- ToolBlueprint - Tool blueprints
- ToolBundle - Tool bundles
- ToolPurchase - Purchase records
- BundlePurchase - Bundle purchase records
- ToolReview - User reviews
- ShoppingCart - Cart items
- OrganizationToolConfig - Tool configurations

### API Routes
```
app/api/v1/
├── marketplace/
│   ├── tools/           # Tool browsing
│   ├── bundles/         # Bundle management
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Purchase flow
│   ├── purchases/       # Purchase history
│   └── reviews/         # Tool reviews
└── webhooks/
    └── stripe/          # Stripe payment webhooks
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
- Unverified payments → Financial risk

---

**Version:** 1.0 - Single Agent Orchestration | Last Updated: 2025-10-06
