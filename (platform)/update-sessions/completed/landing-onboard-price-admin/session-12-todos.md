# Session 12: Testing, QA & Final Integration - Task List

## Phase 1: Test Infrastructure Setup
- [ ] Install missing test dependencies (Playwright, jest-axe, lighthouse)
- [ ] Create E2E test directory structure
- [ ] Verify Jest configuration for coverage targets
- [ ] Create test utilities and helpers

## Phase 2: Unit Tests - Onboarding Wizard
- [ ] Create __tests__/components/onboarding/wizard.test.tsx
- [ ] Test initial render and step progression
- [ ] Test form validation (org name, required fields)
- [ ] Test plan pre-selection from URL params
- [ ] Test navigation (next, back, step indicators)
- [ ] Verify 70%+ coverage for onboarding components

## Phase 3: Integration Tests - Admin API
- [ ] Verify existing __tests__/api/admin/users.test.ts
- [ ] Add suspend user test cases
- [ ] Add RBAC authorization tests (non-admin rejection)
- [ ] Add input validation tests (Zod schema)
- [ ] Add audit log creation verification
- [ ] Verify 100% coverage for admin API routes

## Phase 4: E2E Tests - Critical Journeys
- [ ] Create e2e/ directory
- [ ] Install and configure Playwright
- [ ] Create e2e/onboarding-flow.spec.ts
- [ ] Test pricing → onboarding → dashboard flow
- [ ] Test validation errors and error handling
- [ ] Test navigation (back button, step retention)
- [ ] Create e2e/admin-dashboard.spec.ts (admin user journey)

## Phase 5: Performance Testing
- [ ] Install lighthouse and chrome-launcher
- [ ] Create __tests__/performance/lighthouse.test.ts
- [ ] Test landing page performance (>90 score)
- [ ] Test pricing page performance (>90 score)
- [ ] Test admin dashboard performance (>85 score)
- [ ] Verify Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

## Phase 6: Accessibility Testing
- [ ] Install jest-axe
- [ ] Create __tests__/accessibility/wcag.test.tsx
- [ ] Test HeroSection accessibility (0 violations)
- [ ] Test PricingTiers accessibility (0 violations)
- [ ] Test OrgDetailsForm accessibility (0 violations)
- [ ] Verify all form inputs have labels
- [ ] Verify keyboard navigation
- [ ] Verify ARIA attributes

## Phase 7: Security Audit
- [ ] Create SECURITY-AUDIT.md checklist
- [ ] Verify RBAC on all admin routes
- [ ] Verify Zod validation on all inputs
- [ ] Verify organizationId filters in queries
- [ ] Verify Stripe webhook signature validation
- [ ] Verify no secrets in code (.env.local only)
- [ ] Run npm audit for vulnerabilities
- [ ] Verify RLS policies enabled

## Phase 8: Integration Verification
- [ ] Create INTEGRATION-CHECKLIST.md
- [ ] Test landing → onboarding flow
- [ ] Test onboarding → dashboard flow
- [ ] Test admin → user management
- [ ] Test admin → organization management
- [ ] Test payment → subscription activation
- [ ] Test navigation and routing (middleware, RBAC)
- [ ] Test data flow (metrics, audit logs, feature flags)

## Phase 9: Cross-Browser Testing
- [ ] Create BROWSER-TESTING.md matrix
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Test on Mobile Safari (iOS)
- [ ] Test on Mobile Chrome (Android)
- [ ] Verify responsive layouts
- [ ] Verify animations and interactions

## Phase 10: Documentation & Go-Live
- [ ] Create GO-LIVE-CHECKLIST.md
- [ ] Verify all tests passing (80%+ coverage)
- [ ] Verify TypeScript compilation (0 errors)
- [ ] Verify ESLint (0 warnings)
- [ ] Verify build success
- [ ] Document environment variables
- [ ] Document deployment steps
- [ ] Create session summary report

## Phase 11: Final Verification
- [ ] Run complete test suite: npm test -- --coverage
- [ ] Run TypeScript check: npx tsc --noEmit
- [ ] Run linting: npm run lint
- [ ] Run build: npm run build
- [ ] Verify coverage report (>80% overall)
- [ ] Verify critical paths (100% coverage)
- [ ] Create execution report with all command outputs

## Success Criteria (BLOCKING)
- [ ] All tests passing (unit, integration, E2E)
- [ ] Test coverage >80% overall
- [ ] Test coverage 100% for auth, RBAC, admin actions
- [ ] Lighthouse scores >90 (landing, pricing)
- [ ] 0 accessibility violations (WCAG 2.1 AA)
- [ ] 0 security vulnerabilities (npm audit)
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] Build successful
- [ ] All checklists 100% complete
- [ ] Execution report with verification outputs

---

**Status:** Ready to begin
**Estimated Duration:** 4-5 hours
**Dependencies:** Sessions 1-11 complete
