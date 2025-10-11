# AI-HUB Module - Single Agent Session Prompt

**Session-based development using strive-agent-universal**

Use this prompt at the beginning of each session. Replace `{SESSION_NUMBER}` with current session (1-8).

---

## 📋 SESSION START PROMPT

```
I'm starting Session {7} of the AI-HUB Module integration.

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
   - Production database usage (real Prisma queries)

3. **Platform-Specific Standards**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md

   Focus on:
   - Multi-industry architecture (Industry > Module > Page)
   - Dual-role RBAC system
   - 6-tier subscription enforcement
   - Security mandates (AI model configs, multi-tenancy)
   - Production database patterns (Prisma + RLS)

4. **Session Plan**:
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\docs\development\update-sessions\active\dashboard-&-module-integrations\AI-HUB-Module\session-{SESSION_NUMBER}.plan.md

5. **Dashboard Modernization Guide** (dashboard already complete):
   C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\docs\development\update-sessions\active\dashboard-&-module-integrations\AI-HUB-Module\DASHBOARD-MODERNIZATION-UPDATE.md

   NOTE: AI-HUB dashboard completed in Phase 4 (Oct 2025)
   - 243 lines, production-ready futuristic UI
   - Glass morphism effects with neon borders (cyan, purple, green, orange)
   - Follow established patterns for new AI-HUB pages
   - Personalized greeting, stats cards, feature cards patterns documented

---

## STEP 2: LAUNCH DEVELOPMENT AGENT

Use the strive-agent-universal agent for implementation:

Task strive-agent-universal "
AI-HUB Module (NeuroFlow Hub) - Session {SESSION_NUMBER}

## Context Files Already Read
You can reference patterns from:
- single-agent-usage-guide.md (orchestration patterns)
- Root CLAUDE.md (tri-fold architecture, database workflow)
- Platform CLAUDE.md (multi-industry structure, security requirements)
- session-{SESSION_NUMBER}.plan.md (objectives and requirements)
- DASHBOARD-MODERNIZATION-UPDATE.md (design system, completed dashboard)
- AI-HUB-ARCHITECTURE.md (unified control center architecture)
- prisma/AI-HUB-SCHEMA-DECISION.md (schema decisions from Session 1)

## Session Objectives
[Copy objectives from session plan]

## Requirements

Database:
✅ PRODUCTION DATABASE ACTIVE - Using real Prisma queries
- AI-HUB schema complete: 9 models added in Session 1 (ai_agents, agent_teams, automation_workflows, etc.)
- Read prisma/SCHEMA-QUICK-REF.md for model reference (99% token savings vs MCP)
- Read prisma/AI-HUB-SCHEMA-DECISION.md for AI-HUB architecture decisions
- Use Prisma client: Import from @prisma/client
- Multi-tenancy: ALWAYS filter by organizationId
- RLS policies: Pending (Session 2) - use application-level filtering for now

Security (Platform-Specific):
- Dual-role RBAC: Check BOTH GlobalRole AND OrganizationRole
- Multi-tenancy: Filter ALL queries by organizationId
- AI model security: Secure API keys, rate limiting
- Workflow permissions: Validate org ownership before execution
- Agent configurations: Isolate per organization
- Integration credentials: Encrypt in database (JSON encrypted field)
- Subscription tiers: AI Hub requires GROWTH tier minimum (ELITE for advanced)
- Input validation: Use Zod schemas for ALL user input
- Token tracking: Monitor AI usage for billing

Architecture:
- Route structure: app/real-estate/ai-hub/ (AI-HUB module)
- Follow Industry > Module > Page hierarchy from platform CLAUDE.md
- Components in components/real-estate/ai-hub/
- Backend logic in lib/modules/ai-hub/
- File size limit: 500 lines max (hard ESLint block)

UI/UX (NeuroFlow Hub Design):
- Follow MODULE-DASHBOARD-GUIDE.md patterns (see DASHBOARD-MODERNIZATION-UPDATE.md)
- Futuristic theme: Electric Blue (#00D2FF), Cyber Green (#39FF14), Neon Violet (#8B5CF6)
- Glass morphism (.glass, .glass-strong) with electric/neon borders
- Cyber grid backgrounds (.cyber-grid)
- Agent avatars with status rings and neon glows
- Workflow canvas with React Flow (drag-and-drop nodes)
- Real-time execution monitoring (WebSocket integration)
- Reference: AI-HUB dashboard (243 lines, Phase 4 complete)
- Quality standards: TypeScript 0 errors, ESLint 0 warnings, <500 lines
- Accessibility: WCAG AA, responsive mobile-first

Implementation:
1. Create TodoWrite list FIRST (granular tasks with activeForm)
2. Read existing files before editing (READ-BEFORE-EDIT mandate)
3. Follow session plan implementation steps
4. Use Prisma queries with proper organizationId filtering
5. Test as you build (TypeScript, linting, functionality)
6. Verify security requirements (RBAC, organizationId, tier validation)

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
- Database Queries: [models queried, organizationId filtering confirmed]

BLOCKING: DO NOT report complete without verification command outputs.
"

---

## STEP 3: MONITOR AGENT EXECUTION

As the agent works, verify quality in real-time:

### ✅ Positive Indicators
- Agent creates TodoWrite list BEFORE coding
- Agent reads files before editing them
- Agent uses Prisma queries with proper organizationId filtering
- Agent includes organizationId filters in ALL queries
- Agent checks BOTH GlobalRole AND OrganizationRole
- Agent provides actual command outputs in reports
- Agent stays within 500-line file limit
- Agent follows NeuroFlow futuristic design (electric blue, cyber green, glass effects)

### 🚨 Warning Signs (Intervene Immediately)
- Skips TodoWrite tool
- Creates files without reading existing patterns
- Queries without organizationId filter (data leak risk!)
- Uses raw SQL instead of Prisma (bypasses RLS)
- Only checks GlobalRole (missing OrganizationRole)
- Reports success without verification outputs
- Creates files >500 lines
- Hardcodes API keys or references .env.local values directly
- Ignores NeuroFlow design system (electric colors, glass morphism)

### 🛑 Critical Failures (Stop and Redirect)
- Reports complete without verification commands
- Creates duplicate functionality (didn't search for existing)
- Bypasses security checks (no RBAC validation)
- Commits security violations (exposes secrets, missing validation)
- Breaks multi-tenancy (cross-org data access possible)
- Creates database schema changes without migration workflow

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
- [ ] Database queries use organizationId filtering

### Security Validation
- [ ] All queries filter by organizationId (multi-tenancy)
- [ ] Workflow executions validate org ownership
- [ ] AI model API keys secured (never exposed to client)
- [ ] Server Actions validate with Zod schemas
- [ ] RBAC checks both GlobalRole AND OrganizationRole
- [ ] Integration credentials encrypted
- [ ] No secrets exposed in code
- [ ] No references to .env.local file content

### Architecture Validation
- [ ] Routes in correct directories (app/real-estate/ai-hub/)
- [ ] Components properly organized (components/real-estate/ai-hub/)
- [ ] Backend logic in lib/modules/
- [ ] No files exceed 500 lines (unless it goes into lib/data)
- [ ] Follows Industry > Module > Page hierarchy
- [ ] Platform design system applied (electric colors, glass effects)

### Follow-Up Verification (If Needed)
If agent report lacks detail or you need additional verification:

Task strive-agent-universal "
VERIFICATION TASK: Confirm Session {SESSION_NUMBER} completion

Execute and provide outputs:
- cd (platform)
- npx tsc --noEmit | head -30
- npm run lint | grep -E '(error|warning)'
- npm test -- ai-hub
- npm run build 2>&1 | tail -20

Security checks:
- Grep for organizationId filters: grep -r 'prisma\\..*\\.findMany' app/real-estate/ai-hub/ lib/modules/ai-hub/
- Verify RBAC checks: grep -r 'requireAuth' app/real-estate/ai-hub/
- Check file sizes: find app/real-estate/ai-hub/ -name '*.tsx' -exec wc -l {} + | sort -rn | head -10

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
7. **Database Usage** - Models queried, organizationId filtering confirmed
8. **Issues & Resolutions** - Problems encountered and how solved
9. **Next Session Readiness** - What's ready, any blockers
10. **Overall Progress** - Percentage complete for full integration

---

## 🔑 INTEGRATION-SPECIFIC REMINDERS

### Route Structure (AI-HUB / NeuroFlow Hub)
```
app/real-estate/ai-hub/
├── dashboard/           # AI Hub main dashboard (✅ Phase 4 complete)
├── workflows/           # Workflow builder & management
│   ├── page.tsx        # Workflow list
│   ├── builder/        # Visual workflow builder (React Flow)
│   ├── [id]/           # Workflow detail/edit
│   └── templates/      # Workflow templates marketplace
├── agents/              # AI Agent laboratory
│   ├── page.tsx        # Agent list
│   ├── builder/        # Agent configuration builder
│   ├── [id]/           # Agent detail/settings
│   └── marketplace/    # Agent templates
├── teams/               # Agent team orchestration
│   ├── page.tsx        # Team list
│   ├── builder/        # Team builder
│   └── [id]/           # Team detail
├── executions/          # Execution monitoring
│   ├── page.tsx        # Execution history
│   ├── live/           # Live execution monitoring (WebSocket)
│   └── [id]/           # Execution detail
├── integrations/        # External integrations
│   ├── page.tsx        # Integration list
│   ├── connect/        # Connect new integration
│   └── [id]/           # Integration settings
└── analytics/           # AI Hub analytics
    ├── page.tsx        # Analytics dashboard
    └── reports/        # Custom reports
```

### AI-HUB Workflow Pattern
```typescript
// Workflow must be owned by organization
interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Json;              // React Flow nodes
  edges: Json;              // React Flow connections
  variables?: Json;         // Workflow variables
  isActive: boolean;
  organizationId: string;   // Multi-tenancy
  userId: string;           // Creator
  executionCount: number;
  lastExecuted?: Date;
}

// Workflow access validation
export async function getWorkflow(workflowId: string) {
  const session = await requireAuth();

  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      organizationId: session.user.organizationId  // Critical!
    }
  });

  if (!workflow) throw new Error('Workflow not found');
  return workflow;
}

// AI Agent execution with security
export async function executeAgent(agentId: string, task: string) {
  const session = await requireAuth();

  // Validate tier access (GROWTH or ELITE required)
  if (!canAccessFeature(session.user, 'ai-hub')) {
    throw new Error('Upgrade required: AI Hub features not available');
  }

  const agent = await prisma.aIAgent.findFirst({
    where: {
      id: agentId,
      organizationId: session.user.organizationId
    }
  });

  if (!agent) throw new Error('Agent not found');

  // Track usage for billing
  await trackAIUsage(session.user.organizationId, {
    agentId,
    tokensUsed: 0, // Updated after execution
    cost: 0        // Updated after execution
  });

  // Execute agent...
}
```

### Database Models (AI-HUB Specific)
✅ PRODUCTION SCHEMA - Available in Prisma client (Session 1 complete):
- automation_workflows - AI automation workflow definitions
- workflow_executions - Execution records (both transaction & AI workflows)
- ai_agents - AI agent configurations
- agent_executions - Agent execution records
- agent_teams - Team configurations
- team_members - Team membership
- team_executions - Team execution records
- integrations - External integrations
- workflow_templates - Template marketplace

📖 **Full schema details:** `prisma/AI-HUB-SCHEMA-DECISION.md`

### API Routes
```
app/api/v1/
├── ai-hub/
│   ├── workflows/
│   │   ├── crud/            # Workflow CRUD
│   │   ├── execute/         # Workflow execution
│   │   └── templates/       # Template management
│   ├── agents/
│   │   ├── crud/            # Agent CRUD
│   │   ├── execute/         # Agent execution
│   │   └── marketplace/     # Agent templates
│   ├── teams/
│   │   ├── crud/            # Team CRUD
│   │   └── execute/         # Team execution
│   ├── integrations/
│   │   ├── connect/         # Connect integration
│   │   └── test/            # Test connection
│   └── analytics/
│       └── usage/           # Usage analytics
└── webhooks/
    └── ai-providers/        # AI provider webhooks (usage tracking)
```

### Design System
```css
USE PLATFORM DESIGN 

/* Glass morphism classes */
.glass              /* Standard glass effect */
.glass-strong       /* Strong blur glass effect */

/* Neon borders */
.neon-border-cyan   /* Cyan electric border */
.neon-border-purple /* Purple neon border */
.neon-border-green  /* Green cyber border */
.neon-border-orange /* Orange action border */

/* Cyber backgrounds */
.cyber-grid         /* Cyber grid pattern */
.electric-pulse     /* Pulsing animation */

/* Agent status indicators */
.agent-avatar       /* Agent avatar with status ring */
.agent-avatar.active /* Active agent (green glow) */
.agent-avatar.busy   /* Busy agent (yellow pulse) */
.agent-avatar.offline /* Offline agent (gray) */
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
✅ NeuroFlow design system applied (electric colors, glass effects, cyber grid)
✅ Database queries use proper organizationId filtering
✅ Session summary created with all required sections
✅ Ready to proceed to next session

---

**Now begin Session {SESSION_NUMBER}!**
```

---

## 💡 QUICK TIPS

**Database Development:**
- Schema complete: 9 AI-HUB models ready (Session 1)
- Use Prisma client: Import models from @prisma/client
- Multi-tenancy: ALWAYS filter by organizationId
- RLS pending: Use application-level filtering until Session 2
- Schema docs: Read prisma/SCHEMA-QUICK-REF.md (99% token savings)

**Token Efficiency:**
- Local schema docs: ~500 tokens vs MCP list_tables: ~18,000 tokens
- **Savings per session: 15k-20k tokens**

**Quality Patterns:**
- TodoWrite first, then code
- Read before edit
- Verify incrementally
- Include command outputs
- Follow NeuroFlow design system

**Common Issues:**
- Missing organizationId → Data leak
- Single-role RBAC → Incomplete auth
- Exposed API keys → Security breach
- Files >500 lines → ESLint block
- Missing glass effects → Design inconsistency
- Raw SQL queries → Bypasses RLS/security

---

**Version:** 1.1 - Single Agent Orchestration | Last Updated: 2025-10-10
**Changes:** Updated for production database (Session 1 complete)
