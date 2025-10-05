# Tool & Dashboard Marketplace - Session Start Prompt

## 📋 Quick Start

**Copy and paste this prompt to Claude to begin any session:**

---

## Session Initialization Prompt

```
I'm working on the Tool & Dashboard Marketplace integration for the Strive-SaaS platform.

PROJECT CONTEXT:
- Location: (platform)/ directory
- Tech Stack: Next.js 15, React 19, TypeScript, Prisma, Supabase
- Architecture: Multi-tenant SaaS with RLS and RBAC
- Integration Guide: tool-marketplace-integration-plan.md

CURRENT SESSION: [SESSION NUMBER - e.g., "Session 1", "Session 2", etc.]

INSTRUCTIONS:
1. Read the session plan file: session-[NUMBER].plan.md
2. Follow the step-by-step implementation exactly as documented
3. Use Supabase MCP tools for all database operations (migrations, queries)
4. Maintain multi-tenancy with organizationId on all relevant tables
5. Implement RBAC checks in all Server Actions
6. Follow the exact UI design patterns from the integration guide
7. Add proper error handling and validation
8. Include testing as specified in the session plan

CRITICAL RULES:
- READ files before editing (mandatory)
- Use EDIT tool for existing files, WRITE only for new files
- Never exceed 500 lines per file (hard limit)
- Always validate input with Zod
- Enforce RLS on multi-tenant tables
- Check RBAC permissions in all actions
- Use Supabase MCP tools for migrations (NOT Prisma CLI)

Please confirm you're ready to begin [SESSION NAME] and summarize the objectives.
```

---

## Session-Specific Prompts

### Session 1: Database Foundation
```
Starting Session 1: Database Foundation & Marketplace Schema

OBJECTIVES:
- Extend Prisma schema with 7 marketplace models
- Create enums for categories, tiers, bundle types, statuses
- Apply migrations using Supabase MCP tools
- Enable RLS policies on multi-tenant tables
- Generate Prisma client with new types

REMINDER: Use mcp__supabase__apply_migration for ALL database changes.

Ready to begin?
```

### Session 2: Backend & Schemas
```
Starting Session 2: Marketplace Module - Backend & Schemas

PREREQUISITES: Session 1 complete (database schema in place)

OBJECTIVES:
- Create lib/modules/marketplace/ module structure
- Implement Zod validation schemas for all operations
- Build query functions with proper filtering
- Create Server Actions for CRUD operations
- Add RBAC permissions for marketplace
- Implement shopping cart sub-module

REMINDER: All queries must use withTenantContext() for multi-tenancy.

Ready to begin?
```

### Session 3: Marketplace UI
```
Starting Session 3: Marketplace UI - Tool Grid & Filters

PREREQUISITES: Session 2 complete (backend module ready)

OBJECTIVES:
- Create main marketplace page with exact UI design
- Build tool grid with responsive cards
- Implement filter sidebar with categories and tiers
- Add search functionality
- Create tool cards with pricing display
- Implement "Add to Cart" functionality

REMINDER: Match the exact color scheme and layout from integration guide.

Ready to begin?
```

### Session 4: Shopping Cart
```
Starting Session 4: Shopping Cart & Checkout

PREREQUISITES: Session 3 complete (marketplace UI ready)

OBJECTIVES:
- Create shopping cart panel component
- Implement add/remove cart items
- Build checkout flow with confirmation modal
- Add cart persistence (database-backed)
- Create cart badge for navigation
- Implement checkout process

REMINDER: Cart should persist across page refreshes using shopping_carts table.

Ready to begin?
```

### Session 5: Tool Bundles
```
Starting Session 5: Tool Bundles & Special Offers

PREREQUISITES: Session 4 complete (cart & checkout ready)

OBJECTIVES:
- Create bundle display components
- Implement bundle detail pages
- Build bundle purchase flow
- Add savings calculations
- Create popular bundle badges
- Implement bundle to cart functionality

REMINDER: Bundles should show clear value proposition with savings percentages.

Ready to begin?
```

### Session 6: Reviews & Ratings
```
Starting Session 6: Reviews & Ratings System

PREREQUISITES: Session 5 complete (bundles implemented)

OBJECTIVES:
- Create star rating component
- Build review submission form
- Display reviews with user info
- Implement rating distribution chart
- Calculate average ratings
- Restrict reviews to purchased tools only

REMINDER: Only users who purchased a tool can review it.

Ready to begin?
```

### Session 7: Purchased Tools Dashboard
```
Starting Session 7: Purchased Tools Dashboard & Management

PREREQUISITES: Session 6 complete (reviews system ready)

OBJECTIVES:
- Create purchased tools dashboard page
- Implement tool usage tracking
- Build team access management
- Add usage analytics and insights
- Create purchase history view
- Implement tool search/filtering

REMINDER: Dashboard should show per-organization purchases with proper isolation.

Ready to begin?
```

### Session 8: Testing & Deployment
```
Starting Session 8: Testing, Optimization & Final Integration

PREREQUISITES: Sessions 1-7 complete (all features implemented)

OBJECTIVES:
- Write comprehensive unit tests
- Create integration tests for flows
- Implement E2E tests with Playwright
- Add performance optimization (caching)
- Implement SEO metadata
- Final navigation integration
- Create deployment checklist

REMINDER: Minimum 80% test coverage required before deployment.

Ready to begin?
```

---

## Progress Tracking Template

Use this to track your progress through sessions:

```
TOOL MARKETPLACE PROGRESS TRACKER

✅ = Completed | 🔄 = In Progress | ⏸️ = Paused | ❌ = Blocked

Session 1: Database Foundation                    [ ]
Session 2: Backend & Schemas                       [ ]
Session 3: Marketplace UI                          [ ]
Session 4: Shopping Cart & Checkout                [ ]
Session 5: Tool Bundles                            [ ]
Session 6: Reviews & Ratings                       [ ]
Session 7: Purchased Tools Dashboard               [ ]
Session 8: Testing & Deployment                    [ ]

Current Session: _______
Blockers: _______
Next Steps: _______
```

---

## Common Issues & Quick Fixes

### Issue 1: Supabase MCP Tool Not Found
```
Error: mcp__supabase__apply_migration not available

Fix: Ensure Supabase MCP server is configured in claude_desktop_config.json
```

### Issue 2: RLS Policy Errors
```
Error: RLS policy violation

Fix: Ensure app.current_org_id is set before queries:
await prisma.$executeRaw`SET app.current_org_id = ${orgId};`
```

### Issue 3: File Size Limit Exceeded
```
Error: File exceeds 500 lines

Fix: Extract logic into separate files/modules
- Create utility functions
- Split components
- Move types to separate file
```

### Issue 4: Multi-Tenancy Not Working
```
Error: Data leak between organizations

Fix: Always use withTenantContext() wrapper and include organizationId in queries
```

### Issue 5: RBAC Permission Denied
```
Error: Unauthorized access

Fix: Add proper RBAC checks:
- requireAuth() at start of Server Actions
- canAccessMarketplace(user) check
- canPurchaseTools(user) for purchases
```

---

## Verification Commands

After each session, run these commands to verify:

```bash
# Type check
npx tsc --noEmit

# Lint check
npm run lint

# Test (when applicable)
npm test

# Build check
npm run build

# Database verification (via Supabase MCP)
# Use: mcp__supabase__list_tables
# Use: mcp__supabase__execute_sql with verification queries
```

---

## File Locations Reference

```
Database Schema:
- shared/prisma/schema.prisma

Backend Module:
- lib/modules/marketplace/index.ts
- lib/modules/marketplace/schemas.ts
- lib/modules/marketplace/queries.ts
- lib/modules/marketplace/actions.ts
- lib/modules/marketplace/cart/

Frontend Pages:
- app/real-estate/marketplace/page.tsx
- app/real-estate/marketplace/bundles/[bundleId]/page.tsx
- app/real-estate/marketplace/tools/[toolId]/page.tsx
- app/real-estate/marketplace/purchases/page.tsx
- app/real-estate/marketplace/cart/page.tsx

Components:
- components/real-estate/marketplace/grid/
- components/real-estate/marketplace/filters/
- components/real-estate/marketplace/cart/
- components/real-estate/marketplace/bundles/
- components/real-estate/marketplace/reviews/
- components/real-estate/marketplace/purchases/

Tests:
- __tests__/modules/marketplace/
- e2e/marketplace/

RBAC:
- lib/auth/rbac.ts (add marketplace permissions)
```

---

## Success Criteria Checklist

Before marking a session complete:

- [ ] All objectives from session plan achieved
- [ ] All files created/modified as specified
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Multi-tenancy verified
- [ ] RBAC permissions tested
- [ ] Success criteria from session plan met
- [ ] Common pitfalls avoided
- [ ] Tests written (where applicable)
- [ ] Documentation updated

---

## Contact & Support

**Integration Guide:** `tool-marketplace-integration-plan.md`
**Session Plans:** `session-[1-8].plan.md`
**Platform Standards:** `(platform)/CLAUDE.md`
**Repository Rules:** `CLAUDE.md` (root)

**Remember:** Always read the session plan file BEFORE starting implementation!

---

## 🚀 Ready to Build!

Copy the appropriate session prompt above and let's build an amazing Tool & Dashboard Marketplace! 🎉
