# Session 9: Testing & Quality Assurance - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3-4 hours
**Dependencies:** All previous sessions (1-8)
**Parallel Safe:** No (tests all systems)

---

## 🎯 Session Objectives

Comprehensive testing of the entire industry-as-plugin architecture, including integration tests, E2E tests, performance testing, security audits, and ensuring 80%+ code coverage across all new code.

**What Should Exist (if previous sessions complete):**
- ✅ Industry infrastructure (lib/industries/)
- ✅ Industry routes (app/(platform)/industries/)
- ✅ Industry management UI
- ✅ Middleware with industry context
- ✅ Real estate and healthcare implementations
- ✅ Industry tools system

**What's Missing:**
- ❌ Integration tests for industry system
- ❌ E2E tests for user workflows
- ❌ Performance benchmarks
- ❌ Security audit
- ❌ Coverage reports and gaps filled

---

## 📋 Task Breakdown

### Phase 1: Integration Tests (1.5 hours)

**Directory:** `__tests__/integration/industries/`

#### File 1: `industry-enablement-flow.test.ts`
- [ ] Test complete flow: Enable industry → Access dashboard → Disable industry
- [ ] Setup: Create test organization
- [ ] Step 1: Enable healthcare industry
  - Call `enableIndustry()` action
  - Verify database record created
  - Verify organization.industry updated if first
- [ ] Step 2: Access industry dashboard
  - Navigate to `/industries/healthcare/dashboard`
  - Verify page loads
  - Verify industry data displayed
- [ ] Step 3: Disable industry
  - Call `disableIndustry()` action
  - Verify access denied after disable
  - Verify redirect to settings
- [ ] Cleanup: Remove test data

**Success Criteria:**
- Complete workflow tested
- Database assertions
- Route access verified
- Proper cleanup

---

#### File 2: `industry-switching.test.ts`
- [ ] Test switching between multiple enabled industries
- [ ] Setup: Enable both healthcare and real estate
- [ ] Test navigation between industries
- [ ] Test industry context updates
- [ ] Test data isolation (healthcare data ≠ real estate data)
- [ ] Test industry switcher component
- [ ] Verify middleware sets correct headers

**Success Criteria:**
- Multi-industry support verified
- Context switching works
- Data isolation confirmed

---

#### File 3: `industry-tool-integration.test.ts`
- [ ] Test installing industry-specific tool
- [ ] Setup: Enable real estate industry
- [ ] Install "Property Alerts" tool
  - Verify compatibility check
  - Verify tool config created
  - Verify tool accessible
- [ ] Configure tool settings
  - Update tool configuration
  - Verify settings persisted
- [ ] Use tool functionality
  - Create property alert
  - Verify alert created
- [ ] Uninstall tool
  - Verify cleanup

**Success Criteria:**
- Tool installation workflow works
- Configuration persists
- Tool functionality operational
- Clean uninstall

---

#### File 4: `industry-crm-override.test.ts`
- [ ] Test industry-specific CRM extensions
- [ ] Create real estate customer with property fields
  - priceRange, buyerType, preferredLocations
  - Verify customFields stored correctly
- [ ] Create healthcare patient with medical fields
  - MRN, dateOfBirth, insuranceProvider
  - Verify HIPAA audit log created
- [ ] Test filtering by industry-specific fields
- [ ] Test industry-specific queries

**Success Criteria:**
- Industry overrides functional
- Custom fields stored properly
- Queries filter correctly

---

#### File 5: `hipaa-compliance.test.ts`
- [ ] Test HIPAA audit logging
  - Access patient record
  - Verify audit log entry created
  - Verify timestamp, userId, action logged
- [ ] Test patient consent tracking
  - Create patient with consent
  - Verify consent date recorded
  - Test consent expiration
- [ ] Test soft delete enforcement
  - Delete patient
  - Verify deletedAt set
  - Verify data still in database
  - Verify excluded from queries
- [ ] Test data retention
  - Create old records
  - Run retention check
  - Verify 7-year rule enforced

**Success Criteria:**
- All HIPAA requirements met
- Audit logs comprehensive
- Soft deletes enforced
- Retention policy works

---

### Phase 2: E2E Tests (Playwright) (1 hour)

**Directory:** `e2e/industries/`

#### File 1: `industry-enablement.spec.ts`
- [ ] Test user enables industry from settings
  - Login as admin
  - Navigate to /settings/industries
  - Click "Enable" on Healthcare
  - Confirm dialog
  - Verify success toast
  - Verify industry appears in sidebar
  - Click industry link
  - Verify dashboard loads

**Success Criteria:**
- Full UI workflow tested
- Visual assertions
- Navigation verified

---

#### File 2: `industry-dashboard.spec.ts`
- [ ] Test industry dashboard displays correctly
  - Navigate to healthcare dashboard
  - Verify metrics widgets render
  - Verify appointments calendar visible
  - Verify patient stats chart displayed
  - Test switching to real estate
  - Verify different widgets load

**Success Criteria:**
- Dashboard renders
- Industry-specific widgets show
- Context switching works

---

#### File 3: `industry-customer-crud.spec.ts`
- [ ] Test creating real estate customer
  - Navigate to /industries/real-estate/crm
  - Click "Create Customer"
  - Fill form with property preferences
  - Submit form
  - Verify success
  - Verify customer appears in list
- [ ] Test updating customer
- [ ] Test deleting customer

**Success Criteria:**
- CRUD operations functional
- Forms work correctly
- Data persists

---

### Phase 3: Performance Testing (45 minutes)

**Directory:** `__tests__/performance/`

#### File 1: `middleware-performance.test.ts`
- [ ] Benchmark middleware industry detection
  - Time 1000 requests
  - Verify < 50ms average latency
  - Verify caching works
- [ ] Test database query count
  - Track queries per request
  - Verify N+1 problems avoided
  - Verify max 3 queries per industry check

**Benchmarks:**
- Industry detection: < 10ms
- Access validation: < 30ms
- Total middleware overhead: < 50ms

---

#### File 2: `industry-route-performance.test.ts`
- [ ] Benchmark industry dashboard load time
  - Measure time to render
  - Target: < 2.5s LCP
  - Verify FID < 100ms
- [ ] Test with 1000 customers
  - Pagination works
  - Load time acceptable
  - No memory leaks

**Benchmarks:**
- Dashboard load: < 2.5s
- Customer list (100 items): < 1s
- Tool page load: < 2s

---

### Phase 4: Security Audit (30 minutes)

**Directory:** `__tests__/security/`

#### File 1: `industry-access-control.test.ts`
- [ ] Test unauthorized industry access blocked
  - User without industry enabled
  - Attempt to access /industries/healthcare
  - Verify redirect to settings
  - Verify error message
- [ ] Test cross-organization data leakage
  - Org A enables healthcare
  - Org B enables healthcare
  - Org A user tries to access Org B data
  - Verify 403 or redirect
  - Verify no data returned
- [ ] Test role-based permissions
  - VIEWER role cannot enable industries
  - ADMIN role can enable industries
  - OWNER role can configure industries

**Security Requirements:**
- Multi-tenancy enforced everywhere
- RBAC prevents unauthorized actions
- No data leakage between orgs
- SQL injection prevented (Prisma ORM)
- XSS prevented (React escaping)

---

#### File 2: `hipaa-security.test.ts`
- [ ] Test PHI not exposed in URLs
  - Verify patient IDs used (not names)
  - Verify no PHI in query strings
- [ ] Test audit logging cannot be disabled
  - Attempt to bypass logging
  - Verify all PHI access logged
- [ ] Test soft delete enforcement
  - Attempt hard delete via Prisma
  - Verify prevented
  - Verify only soft delete allowed

---

### Phase 5: Coverage Analysis & Gap Filling (45 minutes)

#### Task 1: Generate coverage report
- [ ] Run: `npm test -- --coverage`
- [ ] Analyze report
- [ ] Identify files below 80%
- [ ] Prioritize critical paths

#### Task 2: Fill coverage gaps
- [ ] Add missing unit tests
- [ ] Add missing edge case tests
- [ ] Add error handling tests
- [ ] Target: 80%+ on all new code

**Files likely needing more coverage:**
- Industry registry functions
- Tool manager lifecycle hooks
- Middleware industry detection
- HIPAA compliance features
- Server Actions error paths

---

### Phase 6: Regression Testing (30 minutes)

#### File 1: `existing-functionality.test.ts`
- [ ] Test base CRM still works
  - Create customer without industry
  - Verify works as before
- [ ] Test base projects still work
- [ ] Test base tasks still work
- [ ] Test base dashboard still works
- [ ] Test base settings still work

**Success Criteria:**
- No existing functionality broken
- Industry system is additive
- Backwards compatible

---

## 📊 Files to Create

### Integration Tests (5 files)
```
__tests__/integration/industries/
├── industry-enablement-flow.test.ts
├── industry-switching.test.ts
├── industry-tool-integration.test.ts
├── industry-crm-override.test.ts
└── hipaa-compliance.test.ts
```

### E2E Tests (3 files)
```
e2e/industries/
├── industry-enablement.spec.ts
├── industry-dashboard.spec.ts
└── industry-customer-crud.spec.ts
```

### Performance Tests (2 files)
```
__tests__/performance/
├── middleware-performance.test.ts
└── industry-route-performance.test.ts
```

### Security Tests (2 files)
```
__tests__/security/
├── industry-access-control.test.ts
└── hipaa-security.test.ts
```

**Total:** 12 new test files

---

## 🎯 Success Criteria

- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Performance benchmarks met
- [ ] Security audit passes
- [ ] Code coverage ≥ 80% on all new code
- [ ] No regressions in existing functionality
- [ ] HIPAA compliance verified
- [ ] Multi-tenancy enforced
- [ ] All test files properly documented
- [ ] CI/CD pipeline updated

---

## 🔗 Test Infrastructure Setup

### Jest Configuration Updates
```javascript
// jest.config.js
module.exports = {
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/e2e/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'components/**/*.tsx',
    'app/**/*.tsx',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Playwright Configuration
```typescript
// playwright.config.ts
export default {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
};
```

---

## 📝 Implementation Notes

### Test Data Setup
```typescript
// __tests__/helpers/test-data.ts
export async function createTestOrganization() {
  return await prisma.organization.create({
    data: {
      name: 'Test Org',
      slug: 'test-org',
      industry: null,
    },
  });
}

export async function enableTestIndustry(orgId: string, industry: Industry) {
  return await prisma.organizationToolConfig.create({
    data: {
      organizationId: orgId,
      industry,
      enabled: true,
      toolId: 'core',
    },
  });
}

export async function cleanupTestData() {
  await prisma.organizationToolConfig.deleteMany({
    where: { organizationId: { startsWith: 'test-' } },
  });
  await prisma.organization.deleteMany({
    where: { slug: { startsWith: 'test-' } },
  });
}
```

### Mocking Strategies
```typescript
// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    customer: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/industries/healthcare',
}));
```

---

## 🚀 Quick Start Commands

```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific integration tests
npm test -- __tests__/integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm test -- __tests__/performance

# Run security tests
npm test -- __tests__/security

# Generate coverage report
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

---

## 🔄 Dependencies

**Requires:**
- ✅ Session 1-8: All functionality implemented

**Blocks:**
- SESSION10: Documentation needs test results

**Enables:**
- Production deployment
- Confidence in stability
- Security certification
- Performance guarantees

---

## 📖 Reference Files

**Read before starting:**
- Existing test files for patterns
- Jest documentation
- Playwright documentation
- Testing Library best practices
- HIPAA compliance requirements

---

**Last Updated:** 2025-10-03
**Status:** ⏸️ Ready to Execute
