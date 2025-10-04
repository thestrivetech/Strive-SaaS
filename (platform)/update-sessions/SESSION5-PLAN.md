# Session 5: Testing Infrastructure - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** Session 1 ✅, Session 2 ✅
**Parallel Safe:** Yes (can run with Session 4)

---

## 🎯 Session Objectives

Establish comprehensive testing infrastructure with 80%+ code coverage requirement, including unit tests, integration tests, and example test patterns for Server Actions, components, and business logic.

**What Exists:**
- ✅ Jest configured in `jest.config.ts`
- ✅ `jest.setup.ts` for test setup
- ✅ `__tests__/` directory created
- ✅ Auth system (Session 2)
- ✅ Database with Prisma

**What's Missing:**
- ❌ Comprehensive test structure
- ❌ Test utilities and helpers
- ❌ Mock factories
- ❌ Server Action test examples
- ❌ Component test examples
- ❌ Integration test setup
- ❌ Coverage enforcement
- ❌ CI/CD test configuration

---

## 📋 Task Breakdown

### Phase 1: Test Infrastructure Setup (45 minutes)

**Directory:** `__tests__/` and `lib/test/`

#### File 1: Create `lib/test/setup.ts`
- [ ] Common test setup utilities
- [ ] Database test helpers
- [ ] Mock Supabase client
- [ ] Mock Prisma client
- [ ] Test user factory
- [ ] Test organization factory

**Implementation:**
```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

export function resetMocks() {
  mockReset(prismaMock);
}

// Mock Supabase
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(),
};

// Test user factory
export function createTestUser(overrides?: Partial<User>) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'EMPLOYEE',
    organizationId: 'test-org-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Test organization factory
export function createTestOrganization(overrides?: Partial<Organization>) {
  return {
    id: 'test-org-id',
    name: 'Test Organization',
    industry: 'SHARED',
    subscriptionTier: 'GROWTH',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

**Success Criteria:**
- [ ] Mock utilities created
- [ ] Factory functions work
- [ ] Easy to use in tests
- [ ] Type-safe

---

#### File 2: Update `jest.setup.ts`
- [ ] Read current setup file
- [ ] Add global test utilities
- [ ] Mock Next.js modules
- [ ] Configure test environment
- [ ] Add custom matchers if needed

**Add to `jest.setup.ts`:**
```typescript
import '@testing-library/jest-dom';
import { resetMocks } from './lib/test/setup';

// Reset mocks before each test
beforeEach(() => {
  resetMocks();
});

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
};
```

**Success Criteria:**
- [ ] Mocks configured globally
- [ ] Environment vars mocked
- [ ] Next.js modules mocked
- [ ] Clean test environment

---

### Phase 2: Server Action Tests (45 minutes)

**Directory:** `__tests__/lib/modules/`

#### File 1: `__tests__/lib/modules/crm/actions.test.ts`
- [ ] Test createCustomer() success
- [ ] Test createCustomer() validation errors
- [ ] Test createCustomer() auth failure
- [ ] Test createCustomer() org isolation
- [ ] Test updateCustomer() success
- [ ] Test deleteCustomer() with permissions
- [ ] Mock Prisma responses
- [ ] Mock auth helpers

**Example Test:**
```typescript
import { createCustomer } from '@/lib/modules/crm/actions';
import { prismaMock } from '@/lib/test/setup';
import { getCurrentUser } from '@/lib/auth/server';

jest.mock('@/lib/auth/server');
jest.mock('@/lib/database/prisma', () => ({
  prisma: prismaMock,
}));

describe('CRM Actions', () => {
  const mockUser = {
    id: 'user-1',
    organizationId: 'org-1',
    role: 'EMPLOYEE',
  };

  beforeEach(() => {
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
  });

  it('should create customer with valid data', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      organizationId: 'org-1',
    };

    prismaMock.customer.create.mockResolvedValue(mockCustomer);

    const result = await createCustomer({
      name: 'John Doe',
      email: 'john@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCustomer);
    expect(prismaMock.customer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: 'org-1',
      }),
    });
  });

  it('should fail with validation error', async () => {
    const result = await createCustomer({
      name: '', // Invalid
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should enforce organization isolation', async () => {
    const mockCustomer = { id: 'customer-1', organizationId: 'org-1' };
    prismaMock.customer.create.mockResolvedValue(mockCustomer);

    await createCustomer({ name: 'Test', email: 'test@example.com' });

    expect(prismaMock.customer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: mockUser.organizationId,
      }),
    });
  });
});
```

**Coverage Target:** 90%+ for all Server Actions

**Success Criteria:**
- [ ] All Server Actions tested
- [ ] Auth checks verified
- [ ] Validation tested
- [ ] Org isolation verified
- [ ] Mocks working correctly

---

#### File 2: `__tests__/lib/modules/projects/actions.test.ts`
- [ ] Test createProject()
- [ ] Test updateProject()
- [ ] Test deleteProject()
- [ ] Test assignProjectMember()
- [ ] Test permission checks
- [ ] Mock all dependencies

**Coverage Target:** 90%+

---

### Phase 3: Component Tests (45 minutes)

**Directory:** `__tests__/components/`

#### File 1: `__tests__/components/ui/button.test.tsx`
- [ ] Test button renders
- [ ] Test variants (default, destructive, outline, etc.)
- [ ] Test sizes (sm, md, lg)
- [ ] Test click handlers
- [ ] Test disabled state
- [ ] Test loading state

**Example Test:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('disables when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

**Coverage Target:** 70%+ for UI components

---

#### File 2: `__tests__/components/(platform)/navigation/sidebar-nav.test.tsx`
- [ ] Test sidebar renders
- [ ] Test nav items display based on role
- [ ] Test permission filtering
- [ ] Test active route highlighting
- [ ] Mock getCurrentUser
- [ ] Mock hasPermission

**Coverage Target:** 80%+

---

#### File 3: `__tests__/components/(platform)/crm/customer-list.test.tsx`
- [ ] Test customer list renders
- [ ] Test data fetching
- [ ] Test loading state
- [ ] Test empty state
- [ ] Test error state
- [ ] Mock queries

**Coverage Target:** 80%+

---

### Phase 4: Integration Tests (30 minutes)

**Directory:** `__tests__/integration/`

#### File 1: `__tests__/integration/auth-flow.test.ts`
- [ ] Test complete login flow
- [ ] Test logout flow
- [ ] Test session persistence
- [ ] Test redirect to protected routes
- [ ] Mock Supabase entirely

**Example:**
```typescript
import { authMiddleware } from '@/lib/auth/middleware';
import { NextRequest } from 'next/server';

describe('Auth Flow Integration', () => {
  it('redirects unauthenticated users to login', async () => {
    const request = new NextRequest('http://localhost:3000/dashboard');

    // Mock no user session
    jest.mock('@supabase/ssr', () => ({
      createServerClient: () => ({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      }),
    }));

    const response = await authMiddleware(request);

    expect(response.status).toBe(307); // Redirect
    expect(response.headers.get('location')).toContain('/login');
  });
});
```

**Coverage Target:** 70%+

---

#### File 2: `__tests__/integration/crm-workflow.test.ts`
- [ ] Test create customer → view → edit → delete
- [ ] Test multi-step workflows
- [ ] Test data persistence
- [ ] Test error recovery

**Coverage Target:** 70%+

---

### Phase 5: Coverage Enforcement (30 minutes)

#### File 1: Update `jest.config.ts`
- [ ] Read current config
- [ ] Set coverage thresholds
- [ ] Configure coverage paths
- [ ] Exclude test files from coverage
- [ ] Set reporters

**Update `jest.config.ts`:**
```typescript
const config: Config = {
  // ... existing config

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // ... rest of config
};
```

**Success Criteria:**
- [ ] 80% minimum coverage enforced
- [ ] Fails CI if below threshold
- [ ] Excludes test files
- [ ] Generates reports

---

#### File 2: Create `scripts/test-ci.sh`
- [ ] CI test script
- [ ] Run linter first
- [ ] Run type check
- [ ] Run tests with coverage
- [ ] Fail on any error

**Create script:**
```bash
#!/bin/bash

set -e # Exit on any error

echo "Running linter..."
npm run lint

echo "Running type check..."
npx tsc --noEmit

echo "Running tests with coverage..."
npm test -- --coverage --watchAll=false

echo "All checks passed!"
```

**Make executable:** `chmod +x scripts/test-ci.sh`

**Success Criteria:**
- [ ] CI script created
- [ ] Runs all checks
- [ ] Exits on failure
- [ ] Used in CI/CD

---

### Phase 6: Documentation & Examples (30 minutes)

#### File 1: Create `__tests__/README.md`
- [ ] Testing guide for team
- [ ] How to write tests
- [ ] How to run tests
- [ ] Coverage requirements
- [ ] Examples and patterns

**Content:**
```markdown
# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- sidebar-nav

# Watch mode
npm test -- --watch
```

## Writing Tests

### Server Actions
- Always mock Prisma client
- Always mock auth helpers
- Test validation
- Test permissions
- Test org isolation

### Components
- Use @testing-library/react
- Test user interactions
- Test different states
- Mock external dependencies

### Coverage Requirements
- Server Actions: 90%+
- Business Logic: 90%+
- Components: 70%+
- Overall: 80%+ (enforced)

## Examples
See `__tests__/lib/modules/crm/actions.test.ts` for Server Action example.
See `__tests__/components/ui/button.test.tsx` for component example.
```

**Success Criteria:**
- [ ] Guide created
- [ ] Examples included
- [ ] Clear instructions
- [ ] Team reference

---

## 📊 Files to Create/Update

### Test Infrastructure (3 files)
```
lib/test/
├── setup.ts               # ✅ Create (mocks & factories)
├── utils.ts               # ✅ Create (test utilities)
└── index.ts               # ✅ Create (exports)
```

### Jest Configuration (2 files)
```
jest.config.ts             # 🔄 Update (coverage thresholds)
jest.setup.ts              # 🔄 Update (global mocks)
```

### Server Action Tests (3+ files)
```
__tests__/lib/modules/
├── crm/
│   ├── actions.test.ts    # ✅ Create
│   └── queries.test.ts    # ✅ Create
└── projects/
    └── actions.test.ts    # ✅ Create
```

### Component Tests (5+ files)
```
__tests__/components/
├── ui/
│   └── button.test.tsx    # ✅ Create
├── (platform)/
│   ├── navigation/
│   │   └── sidebar-nav.test.tsx  # ✅ Create
│   └── crm/
│       └── customer-list.test.tsx # ✅ Create
```

### Integration Tests (2 files)
```
__tests__/integration/
├── auth-flow.test.ts      # ✅ Create
└── crm-workflow.test.ts   # ✅ Create
```

### Scripts & Docs (3 files)
```
scripts/
└── test-ci.sh             # ✅ Create (CI script)

__tests__/
└── README.md              # ✅ Create (testing guide)
```

**Total:** ~20 files (18 new, 2 updates)

---

## 🎯 Success Criteria

**MANDATORY:**
- [ ] Test infrastructure complete
- [ ] Mock factories working
- [ ] Server Action tests ≥ 90% coverage
- [ ] Component tests ≥ 70% coverage
- [ ] Integration tests created
- [ ] Overall coverage ≥ 80% (enforced)
- [ ] CI script functional
- [ ] Testing guide documented
- [ ] All tests passing
- [ ] TypeScript compiles: 0 errors
- [ ] Linter passes: 0 warnings

**Quality Checks:**
- [ ] Tests are deterministic (no flaky tests)
- [ ] Mocks properly reset between tests
- [ ] No warnings in test output
- [ ] Fast test execution (< 30s for full suite)
- [ ] Clear error messages when tests fail

---

## 🔗 Integration Points

### With CI/CD
```yaml
# .github/workflows/test.yml
- name: Run tests
  run: ./scripts/test-ci.sh

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### With Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm test -- --coverage --watchAll=false"
    }
  }
}
```

### With Development Workflow
```bash
# Test-Driven Development
1. Write failing test
2. Implement feature
3. Test passes
4. Refactor
5. Commit
```

---

## 📝 Implementation Notes

### Mock Strategy
```
Database: Mock Prisma client
Auth: Mock Supabase & auth helpers
Next.js: Mock navigation, headers, cookies
External APIs: Mock fetch/axios
File system: Mock fs operations
```

### Test Organization
```
__tests__/
├── unit/              # Fast, isolated tests
├── integration/       # Multiple components
├── e2e/              # Full user flows (Playwright)
└── lib/test/         # Test utilities
```

### Coverage Exclusions
```
Exclude from coverage:
- Config files (*.config.ts)
- Type definitions (*.d.ts)
- Test files (__tests__/*)
- Generated code (.next/*)
- Stories (*.stories.tsx)
```

---

## 🚀 Quick Start Commands

```bash
# Install test dependencies (if needed)
npm install -D @testing-library/react @testing-library/jest-dom jest-mock-extended

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run CI script
./scripts/test-ci.sh

# Update snapshots (if using)
npm test -- -u
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ **Session 1:** Working app structure
- ✅ **Session 2:** Auth system to test
- ✅ Jest configured
- ✅ Prisma models

**Can run parallel with:**
- ✅ **Session 4** (Security) - Independent work

**Blocks (must complete before):**
- **SESSION6** (Deployment) - Tests must pass

**Enables:**
- Quality assurance
- Confident refactoring
- CI/CD integration
- Team contribution safety
- Production readiness

---

## 📖 Reference Files

**Must read before starting:**
- `jest.config.ts` - Current Jest config
- `jest.setup.ts` - Test setup
- `lib/modules/crm/actions.ts` - Example to test
- Testing Library docs

**Testing Patterns:**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)

---

## ⚠️ Testing Best Practices

**DO:**
- ✅ Test behavior, not implementation
- ✅ Mock external dependencies
- ✅ Use descriptive test names
- ✅ Keep tests simple and focused
- ✅ Test edge cases and errors
- ✅ Reset mocks between tests

**DON'T:**
- ❌ Test internal implementation details
- ❌ Share state between tests
- ❌ Write flaky tests
- ❌ Skip error cases
- ❌ Mock too much (test real code when possible)
- ❌ Ignore failing tests

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🟢 Important - Quality assurance foundation
