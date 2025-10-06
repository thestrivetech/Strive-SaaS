# Session 2: REID Module Structure & Core Services - TODO List

## Prerequisites Check
- [ ] Verify Session 1 database schema exists (REID tables in Prisma)
- [ ] Check if Prisma types generated for REID models
- [ ] Understand platform module architecture patterns
- [ ] Review RBAC system implementation

## Phase 1: Analyze Existing Code
- [ ] Read existing rei-analytics module files
  - [ ] Read lib/modules/rei-analytics/actions.ts
  - [ ] Read lib/modules/rei-analytics/queries.ts
  - [ ] Read lib/modules/rei-analytics/schemas.ts
  - [ ] Read lib/modules/rei-analytics/index.ts
- [ ] Check auth/rbac.ts for existing REID permissions
- [ ] Search for any existing REID-related code

## Phase 2: Create Module Structure
- [ ] Create lib/modules/reid/ directory structure
  - [ ] Create insights/ subdirectory
  - [ ] Create alerts/ subdirectory
  - [ ] Create reports/ subdirectory
  - [ ] Create preferences/ subdirectory
  - [ ] Create ai/ subdirectory

## Phase 3: Implement Insights Module
- [ ] Create lib/modules/reid/insights/schemas.ts
  - [ ] Define NeighborhoodInsightSchema with Zod
  - [ ] Define InsightFiltersSchema
  - [ ] Export type definitions
- [ ] Create lib/modules/reid/insights/queries.ts
  - [ ] Implement getNeighborhoodInsights
  - [ ] Implement getNeighborhoodInsightById
  - [ ] Implement getNeighborhoodInsightByAreaCode
  - [ ] Implement getInsightsStats
  - [ ] Add multi-tenancy checks (organizationId)
- [ ] Create lib/modules/reid/insights/actions.ts
  - [ ] Implement createNeighborhoodInsight
  - [ ] Implement updateNeighborhoodInsight
  - [ ] Implement deleteNeighborhoodInsight
  - [ ] Add RBAC permission checks
  - [ ] Add revalidatePath calls
- [ ] Create lib/modules/reid/insights/index.ts
  - [ ] Export public API

## Phase 4: Implement Alerts Module
- [ ] Create lib/modules/reid/alerts/schemas.ts
  - [ ] Define PropertyAlertSchema
  - [ ] Define AlertTriggerSchema
  - [ ] Export type definitions
- [ ] Create lib/modules/reid/alerts/queries.ts
  - [ ] Implement getPropertyAlerts
  - [ ] Implement getPropertyAlertById
  - [ ] Implement getAlertTriggers
  - [ ] Add multi-tenancy checks
- [ ] Create lib/modules/reid/alerts/actions.ts
  - [ ] Implement createPropertyAlert
  - [ ] Implement updatePropertyAlert
  - [ ] Implement deletePropertyAlert
  - [ ] Implement createAlertTrigger
  - [ ] Implement acknowledgeAlertTrigger
  - [ ] Add RBAC checks
- [ ] Create lib/modules/reid/alerts/index.ts
  - [ ] Export public API

## Phase 5: Implement Reports Module (Stub)
- [ ] Create lib/modules/reid/reports/schemas.ts (basic structure)
- [ ] Create lib/modules/reid/reports/queries.ts (basic structure)
- [ ] Create lib/modules/reid/reports/actions.ts (basic structure)
- [ ] Create lib/modules/reid/reports/index.ts

## Phase 6: Implement Preferences Module (Stub)
- [ ] Create lib/modules/reid/preferences/schemas.ts (basic structure)
- [ ] Create lib/modules/reid/preferences/queries.ts (basic structure)
- [ ] Create lib/modules/reid/preferences/actions.ts (basic structure)
- [ ] Create lib/modules/reid/preferences/index.ts

## Phase 7: Implement AI Module (Stub)
- [ ] Create lib/modules/reid/ai/profile-generator.ts (basic structure)
- [ ] Create lib/modules/reid/ai/insights-analyzer.ts (basic structure)
- [ ] Create lib/modules/reid/ai/index.ts

## Phase 8: Update RBAC Permissions
- [ ] Read lib/auth/rbac.ts
- [ ] Add canAccessREID function
- [ ] Add canCreateReports function
- [ ] Add canManageAlerts function
- [ ] Add canAccessAIFeatures function
- [ ] Add getREIDLimits function for tier enforcement
- [ ] Update TIER_FEATURES object

## Phase 9: Create Module Root Export
- [ ] Create lib/modules/reid/index.ts
  - [ ] Export insights module
  - [ ] Export alerts module
  - [ ] Add placeholders for other modules

## Phase 10: Testing & Verification
- [ ] Run TypeScript compilation: npx tsc --noEmit
- [ ] Check for linting errors: npm run lint
- [ ] Verify module structure matches requirements
- [ ] Test RBAC functions work correctly
- [ ] Ensure multi-tenancy is enforced
- [ ] Check all exports are accessible

## Phase 11: Documentation & Summary
- [ ] Create session-2-summary.md
  - [ ] List all files created
  - [ ] List all files modified
  - [ ] Document key implementations
  - [ ] Include verification outputs
  - [ ] Note any issues/blockers
  - [ ] Calculate progress percentage

## Success Criteria
- [ ] All module files created as specified
- [ ] Zero TypeScript errors
- [ ] RBAC permissions implemented
- [ ] Multi-tenancy enforced (organizationId checks)
- [ ] Tier limits defined
- [ ] All Zod schemas created
- [ ] Server Actions with proper validation
- [ ] Module exports configured correctly

## Notes
- Session 1 database schema may need to be completed first
- Use existing platform patterns from CRM/transactions modules
- Ensure all database queries include organizationId
- Follow 500-line file limit
- Use Server Actions pattern for mutations
- Include proper error handling