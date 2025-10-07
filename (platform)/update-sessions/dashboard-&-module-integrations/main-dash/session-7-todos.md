# Session 7: Testing, Polish & Production Readiness - Task List

## Phase 1: Module Unit Tests (Priority 1)
- [ ] 1.1 Create __tests__/modules/dashboard/metrics.test.ts
  - Test createDashboardMetric with org isolation
  - Test getDashboardMetrics filters by organizationId
  - Test system metrics (null org) are included
  - Test updateDashboardMetric validates ownership
  - Test deleteDashboardMetric validates ownership
- [ ] 1.2 Create __tests__/modules/dashboard/activities.test.ts
  - Test recordActivity with org isolation
  - Test getRecentActivities respects limit
  - Test getRecentActivities sorts by timestamp DESC
  - Test markActivityAsRead validates ownership
  - Test archiveActivity validates ownership
- [ ] 1.3 Create __tests__/modules/dashboard/widgets.test.ts
  - Test createDashboardWidget with org isolation
  - Test getDashboardWidgets filters by organizationId
  - Test updateDashboardWidget validates ownership
  - Test deleteDashboardWidget validates ownership
  - Test getWidgetsByType filters correctly
- [ ] 1.4 Create __tests__/modules/dashboard/quick-actions.test.ts
  - Test createQuickAction with org isolation
  - Test getQuickActions filters by organizationId
  - Test executeQuickAction validates ownership
  - Test updateQuickAction validates ownership
  - Test deleteQuickAction validates ownership

## Phase 2: Component Tests (Priority 2)
- [ ] 2.1 Create __tests__/components/dashboard/kpi-cards.test.tsx
  - Test loading skeleton display
  - Test metrics display after loading
  - Test error message on fetch failure
  - Test empty state rendering
- [ ] 2.2 Create __tests__/components/dashboard/activity-feed.test.tsx
  - Test activity list rendering
  - Test mark as read functionality
  - Test filtering by type
  - Test pagination
- [ ] 2.3 Create __tests__/components/dashboard/quick-actions-grid.test.tsx
  - Test quick actions rendering
  - Test action execution
  - Test empty state
- [ ] 2.4 Create __tests__/components/dashboard/module-shortcuts.test.tsx
  - Test shortcuts rendering
  - Test navigation on click

## Phase 3: API Route Tests (Priority 3)
- [ ] 3.1 Create __tests__/api/dashboard/metrics.test.ts
  - Test GET /api/v1/dashboard/metrics returns metrics
  - Test POST /api/v1/dashboard/metrics creates metric
  - Test auth required for all endpoints
- [ ] 3.2 Create __tests__/api/dashboard/activities.test.ts
  - Test GET /api/v1/dashboard/activities returns activities
  - Test POST /api/v1/dashboard/activities records activity
  - Test PATCH /api/v1/dashboard/activities/:id marks as read

## Phase 4: Performance Optimization (Priority 4)
- [ ] 4.1 Create lib/performance/dashboard-cache.ts
  - Implement React.cache for request deduplication
  - Implement unstable_cache for server-side caching
  - Add cache revalidation tags
- [ ] 4.2 Optimize expensive metric calculations
  - Cache metric calculations (5 min revalidation)
  - Add proper cache tags for invalidation
- [ ] 4.3 Bundle size analysis
  - Run bundle analyzer
  - Identify optimization opportunities

## Phase 5: Accessibility Audit (Priority 5)
- [ ] 5.1 Keyboard navigation audit
  - Verify tab order is logical
  - Ensure focus indicators are visible
  - Check no keyboard traps exist
- [ ] 5.2 Screen reader support
  - Add ARIA labels to interactive elements
  - Add ARIA live regions for dynamic content
  - Verify semantic HTML usage
- [ ] 5.3 Color contrast check
  - Run axe DevTools
  - Verify WCAG AA compliance (4.5:1)
- [ ] 5.4 Form accessibility
  - Verify all inputs have labels
  - Check error messages are associated

## Phase 6: Production Checklist (Priority 6)
- [ ] 6.1 Create DEPLOYMENT-CHECKLIST.md
  - Database section
  - Code quality section
  - Security section
  - Performance section
  - Environment section
  - Deployment steps
  - Post-deployment monitoring
  - Rollback plan

## Phase 7: Verification & Reporting (FINAL)
- [ ] 7.1 Run all verification commands
  - TypeScript: npx tsc --noEmit
  - Linting: npm run lint
  - Unit tests: npm test -- --coverage
  - Build: npm run build
- [ ] 7.2 Collect verification outputs
- [ ] 7.3 Generate execution report with proof

## Blocking Requirements
- All tests MUST verify organizationId isolation (CRITICAL for security)
- Test coverage MUST be >= 80% overall
- All verification commands MUST pass (zero errors/warnings)
- Include actual command outputs in report (not just "passed")

## Notes
- Read existing test patterns in __tests__/lib/auth/guards.test.tsx
- Follow jest.config.ts setup
- Mock Prisma client properly
- Use @testing-library/react for component tests
- Keep test files under 500 lines
