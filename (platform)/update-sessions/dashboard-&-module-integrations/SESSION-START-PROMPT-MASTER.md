# Master Session Start Prompt - All Module Integrations

**Version:** 1.0
**Last Updated:** 2025-10-05
**Purpose:** Unified entry point for all module integration sessions

---

## 📋 Quick Start Guide

This master prompt provides a consolidated workflow for starting any module integration session across all 9 modules in the Strive SaaS platform.

---

## 🎯 Available Modules

### ✅ Completed Reference Modules (Use as Examples)
1. **CRM Module** - Customer Relationship Management
   - Location: `crm-module/`
   - Sessions: 10
   - Status: ✅ Integrated (Reference Implementation)

2. **Transaction Workspace** - Real Estate Transaction Management
   - Location: `transaction-workspace-&-modules/`
   - Sessions: 10
   - Status: ✅ Integrated (Reference Implementation)

### 🚀 Ready for Integration Modules
3. **AI Garage & Shop** - AI Agent Marketplace
   - Location: `AI-Garage-&-shop/`
   - Sessions: 8
   - Start: [SESSION-START-PROMPT.md](AI-Garage-&-shop/SESSION-START-PROMPT.md)

4. **Landing/Admin/Pricing/Onboarding** - Public & Admin Pages
   - Location: `landing-onboard-price-admin/`
   - Sessions: 3 (expandable to 12)
   - Start: [SESSION-START-PROMPT.md](landing-onboard-price-admin/SESSION-START-PROMPT.md)

5. **CMS & Marketing** - Content Management System
   - Location: `cms&marketing-module/`
   - Sessions: 8
   - Start: [SESSION-START-PROMPT.md](cms&marketing-module/SESSION-START-PROMPT.md)

6. **Expenses & Taxes** - Financial Management
   - Location: `expenses-&-taxes-module/`
   - Sessions: 10
   - Start: [SESSION-START-PROMPT.md](expenses-&-taxes-module/SESSION-START-PROMPT.md)

7. **Main Dashboard** - Central Hub Dashboard
   - Location: `main-dash/`
   - Sessions: 7
   - Start: [SESSION-START-PROMPT.md](main-dash/SESSION-START-PROMPT.md)

8. **REID Dashboard** - Real Estate Intelligence Dashboard
   - Location: `REIDashboard/`
   - Sessions: 12
   - Start: [SESSION-START-PROMPT.md](REIDashboard/SESSION-START-PROMPT.md)

9. **Tool Marketplace** - Tool & Dashboard Marketplace
   - Location: `tool&dashboard-marketplace/`
   - Sessions: 8
   - Start: [SESSION-START-PROMPT.md](tool&dashboard-marketplace/SESSION-START-PROMPT.md)

---

## 🚀 Universal Session Start Template

Use this template at the beginning of **EVERY** session. Replace variables with your specific values:

```markdown
I'm starting Session {SESSION_NUMBER} of the {MODULE_NAME} integration project.

Please follow these steps to begin:

1. **Read Development Rules:**
   - Root CLAUDE.md: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\CLAUDE.md
   - Platform CLAUDE.md: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\CLAUDE.md
   - Understand and follow all rules, security requirements, and architectural patterns

2. **Read Session Plan:**
   - Session plan: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\{MODULE_DIR}\session-{SESSION_NUMBER}.plan.md
   - Understand objectives, requirements, and implementation steps
   - Note all dependencies and prerequisites

3. **Create Detailed Todo List:**
   - Use TodoWrite tool to create granular tasks
   - Include specific tasks for:
     * Reading/analyzing existing code
     * Creating new files
     * Modifying existing files
     * Testing implementations
     * Validating security/RBAC/multi-tenancy
     * Additional tasks from session plan

4. **Important Reminders:**
   - ✅ ALWAYS read files before editing (READ-BEFORE-EDIT MANDATE)
   - ✅ Maintain multi-tenancy (organizationId on ALL queries)
   - ✅ Enforce RBAC permissions on ALL Server Actions
   - ✅ Use Supabase MCP tools for database operations (NOT Prisma CLI)
   - ✅ Validate input with Zod schemas
   - ✅ Add proper error handling and loading states
   - ✅ Ensure mobile responsiveness

5. **Database Operations (CRITICAL):**
   - Schema changes: Use `mcp__supabase__apply_migration` tool
   - Queries: Use `mcp__supabase__execute_sql` tool
   - Inspections: Use `mcp__supabase__list_tables` tool
   - ❌ DO NOT use `npx prisma` commands directly

6. **Session End Requirements:**
   When complete, create session summary:
   - Path: C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(platform)\update-sessions\dashboard-&-module-integrations\{MODULE_DIR}\session-{SESSION_NUMBER}-summary.md
   - Include:
     * Objectives completion status
     * Files created (full list with paths)
     * Files modified (full list with paths)
     * Key implementations and features
     * Issues encountered and resolutions
     * Testing performed
     * Next steps
     * Overall progress percentage

Let's begin Session {SESSION_NUMBER} of {MODULE_NAME}!
```

---

## 🔧 Module-Specific Variables

### AI Garage & Shop
- `{MODULE_NAME}`: AI Garage & Shop
- `{MODULE_DIR}`: AI-Garage-&-shop
- `{SESSION_NUMBER}`: 1-8

### Landing/Admin/Pricing/Onboarding
- `{MODULE_NAME}`: Landing/Admin/Pricing/Onboarding
- `{MODULE_DIR}`: landing-onboard-price-admin
- `{SESSION_NUMBER}`: 1-12

### CMS & Marketing
- `{MODULE_NAME}`: CMS & Marketing
- `{MODULE_DIR}`: cms&marketing-module
- `{SESSION_NUMBER}`: 1-8

### Expenses & Taxes
- `{MODULE_NAME}`: Expenses & Taxes
- `{MODULE_DIR}`: expenses-&-taxes-module
- `{SESSION_NUMBER}`: 1-10

### Main Dashboard
- `{MODULE_NAME}`: Main Dashboard
- `{MODULE_DIR}`: main-dash
- `{SESSION_NUMBER}`: 1-7

### REID Dashboard
- `{MODULE_NAME}`: REID Dashboard
- `{MODULE_DIR}`: REIDashboard
- `{SESSION_NUMBER}`: 1-12

### Tool Marketplace
- `{MODULE_NAME}`: Tool Marketplace
- `{MODULE_DIR}`: tool&dashboard-marketplace
- `{SESSION_NUMBER}`: 1-8

---

## ✅ Universal Pre-Session Checklist

Before starting ANY session:

- [ ] Read root CLAUDE.md (repository standards)
- [ ] Read platform CLAUDE.md (platform-specific rules)
- [ ] Read module SESSION-START-PROMPT.md (module-specific guidance)
- [ ] Read current session plan file
- [ ] Understand previous session completion (if not Session 1)
- [ ] Create TodoWrite list with all tasks
- [ ] Have Supabase MCP tools ready
- [ ] Know the session objectives
- [ ] Understand completion criteria

---

## ✅ Universal Session Completion Checklist

Before marking ANY session as complete:

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

---

## 🚨 Universal Pitfalls to Avoid

### Database & Architecture
1. ❌ Don't use Prisma CLI - Use Supabase MCP tools
2. ❌ Don't forget organizationId - Every model needs multi-tenancy
3. ❌ Don't skip RLS policies - Database-level security is critical
4. ❌ Don't bypass RBAC - Every Server Action needs permission validation

### Code Quality
5. ❌ Don't skip reading files - Always Read before Edit
6. ❌ Don't create duplicates - Check if components/modules exist
7. ❌ Don't hardcode values - Use environment variables
8. ❌ Don't skip error handling - Wrap database calls in try/catch

### Development Workflow
9. ❌ Don't forget revalidatePath - Call after mutations
10. ❌ Don't commit secrets - Never commit .env files
11. ❌ Don't skip tests - Maintain 80%+ coverage
12. ❌ Don't ignore file size limits - Keep files under 500 lines

---

## 📊 Module Integration Progress Tracker

Track overall platform integration progress:

| Module | Sessions | Status | Progress |
|--------|----------|--------|----------|
| CRM | 10/10 | ✅ Complete | 100% |
| Transactions | 10/10 | ✅ Complete | 100% |
| AI Garage | 0/8 | 📋 Planned | 0% |
| Landing/Admin | 0/3+ | 📋 Planned | 0% |
| CMS & Marketing | 0/8 | 📋 Planned | 0% |
| Expenses & Taxes | 0/10 | 📋 Planned | 0% |
| Main Dashboard | 0/7 | 📋 Planned | 0% |
| REID Dashboard | 0/12 | 📋 Planned | 0% |
| Tool Marketplace | 0/8 | 📋 Planned | 0% |

**Overall Platform Completion:** 20/76 sessions (26%)

---

## 🎓 Best Practices (From Successful CRM/Transaction Integrations)

### 1. Database First
- Define schema in Session 1
- Apply migrations via Supabase MCP
- Test RLS policies immediately
- Verify multi-tenancy isolation

### 2. Backend Before Frontend
- Build module structure (schemas, queries, actions)
- Create API routes with proper auth
- Test with curl/Postman before UI
- Ensure RBAC works correctly

### 3. Component Hierarchy
- Shared components first
- Feature-specific components second
- Page composition last
- Test responsive design throughout

### 4. Incremental Testing
- Test after each major component
- Don't wait until the end
- Fix issues immediately
- Maintain 80%+ coverage

### 5. Security Throughout
- RLS policies from Session 1
- RBAC checks in every action
- Input validation with Zod
- Never expose secrets

---

## 🔗 Quick Reference Links

### Documentation
- [Root CLAUDE.md](../../CLAUDE.md) - Repository standards
- [Platform CLAUDE.md](../../(platform)/CLAUDE.md) - Platform-specific rules
- [Agent Usage Guide](../../.claude/agents/AGENT-USAGE-GUIDE.md) - Agent patterns

### Reference Implementations
- [CRM Module](crm-module/) - Complete integration example
- [Transaction Module](transaction-workspace-&-modules/) - Complete integration example

### Module Session Plans
- [AI Garage](AI-Garage-&-shop/)
- [Landing/Admin](landing-onboard-price-admin/)
- [CMS & Marketing](cms&marketing-module/)
- [Expenses & Taxes](expenses-&-taxes-module/)
- [Main Dashboard](main-dash/)
- [REID Dashboard](REIDashboard/)
- [Tool Marketplace](tool&dashboard-marketplace/)

---

## 🎯 Getting Started

### For New Developers:
1. Read this master prompt
2. Study CRM module (reference implementation)
3. Choose a module to integrate
4. Read module's SESSION-START-PROMPT.md
5. Start with Session 1

### For Continuing Work:
1. Check progress tracker above
2. Read last session's summary
3. Use session start template
4. Continue from next session

---

## 📞 Support & Questions

When stuck:
1. Check module SESSION-START-PROMPT.md for module-specific guidance
2. Review CRM/Transaction modules for examples
3. Refer to CLAUDE.md for platform standards
4. Check Agent Usage Guide for multi-agent patterns

---

**Last Updated:** 2025-10-05
**Version:** 1.0
**Modules Covered:** 9 (2 complete, 7 planned)
**Total Sessions:** 76 across all modules
