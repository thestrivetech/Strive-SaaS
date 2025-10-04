# Testing Guide - Platform

**Complete testing documentation for the Strive Tech SaaS Platform**

---

## 📋 Table of Contents

- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run CI test suite (linting, type-check, tests)
npm run test:ci

# Run specific test file
npm test -- button.test.tsx

# Run tests matching pattern
npm test -- auth

# Run tests in a specific directory
npm test -- __tests__/lib/auth/

# Run only tests that changed
npm run test:quick
```

### Watch Mode Shortcuts

When in watch mode (`npm run test:watch`), press:
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by test file name pattern
- `t` - Filter by test name pattern
- `q` - Quit watch mode
- `Enter` - Trigger test run

### CI/CD Testing

```bash
# Run complete CI test suite
npm run test:ci

# This runs:
# 1. ESLint (no warnings/errors)
# 2. TypeScript type check (no type errors)
# 3. Jest tests with coverage (80%+ required)
# 4. Coverage validation
```

---

## ✍️ Writing Tests

### Test Structure

```
__tests__/
├── unit/                     # Unit tests (fast, isolated)
│   └── lib/modules/         # Module unit tests
├── integration/             # Integration tests (slower, database)
│   ├── auth-flow.test.ts
│   └── crm-workflow.test.ts
├── components/              # Component tests
│   ├── ui/                  # shadcn/ui components
│   └── (platform)/         # Platform-specific components
├── lib/                     # Utility tests
│   ├── auth/
│   ├── security/
│   └── performance/
├── database/                # Database-specific tests
├── utils/                   # Test utilities (mock factories, helpers)
└── fixtures/                # Test data fixtures
```

### Test Types

#### 1. Unit Tests (Fast, Isolated)

**Purpose:** Test individual functions/modules in isolation
**Location:** `__tests__/unit/` or co-located with source
**Uses:** Mocks for all dependencies

```typescript
import { prismaMock, mockUser, resetMocks } from '@/lib/test';
import { createCustomer } from '@/lib/modules/crm/actions';

describe('CRM Actions - createCustomer', () => {
  beforeEach(() => resetMocks());

  it('should create customer with valid data', async () => {
    const mockData = mockUser({ email: 'test@example.com' });
    prismaMock.customer.create.mockResolvedValue(mockData);

    const result = await createCustomer({ name: 'Test', email: 'test@example.com' });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('test@example.com');
  });
});
```

#### 2. Integration Tests (Slower, Real Database)

**Purpose:** Test complete workflows with real database
**Location:** `__tests__/integration/`
**Uses:** Real Prisma client (testPrisma)

```typescript
import { testPrisma, cleanDatabase, createTestUser } from '@/lib/test';

describe('User Integration Tests', () => {
  beforeAll(async () => await testPrisma.$connect());
  afterAll(async () => await testPrisma.$disconnect());
  beforeEach(async () => await cleanDatabase());

  it('should persist user to database', async () => {
    const user = await createTestUser({ email: 'test@example.com' });
    const found = await testPrisma.user.findUnique({ where: { id: user.id } });

    expect(found).toBeDefined();
    expect(found?.email).toBe('test@example.com');
  });
});
```

#### 3. Component Tests (UI)

**Purpose:** Test React component rendering and interactions
**Location:** `__tests__/components/`
**Uses:** @testing-library/react

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText('Click Me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🛠 Test Utilities

All test utilities are available from a single import:

```typescript
import {
  // Mocks
  prismaMock,
  mockSupabaseClient,
  resetMocks,

  // Auth Helpers
  mockAuthenticatedUser,
  mockUnauthenticatedUser,

  // Mock Factories (Faker-based)
  mockUser,
  mockOrganization,
  mockCustomer,
  mockProject,
  mockTask,

  // Database Helpers (Integration Tests)
  testPrisma,
  cleanDatabase,
  createTestUser,
  createTestOrganization,
  createTestCustomer,

  // Fixtures (Predefined Data)
  testUsers,

  // Utilities
  generateTestId,
  waitForAsync,
  measureExecutionTime,
} from '@/lib/test';
```

### Mock Factories

Generate realistic test data using Faker.js:

```typescript
import { mockUser, mockCustomer, mockMany } from '@/lib/test';

// Generate single mock user
const user = mockUser({
  email: 'custom@example.com',
  role: 'ADMIN',
});

// Generate multiple items
const customers = mockMany(mockCustomer, 5, { organizationId: 'org-123' });
```

### Database Helpers

For integration tests with real database:

```typescript
import {
  testPrisma,
  cleanDatabase,
  createTestUser,
  createTestOrgWithUser,
} from '@/lib/test';

// Clean all tables before test
await cleanDatabase();

// Create test data
const { organization, user, membership } = await createTestOrgWithUser();

// Use real Prisma client
const users = await testPrisma.user.findMany();
```

### Auth Mocking

Mock authentication states:

```typescript
import { mockAuthenticatedUser, mockUnauthenticatedUser } from '@/lib/test';

// Mock logged-in user
const user = mockAuthenticatedUser({
  id: 'user-123',
  email: 'test@example.com',
  role: 'EMPLOYEE',
  organizationId: 'org-123',
});

// Mock logged-out state
mockUnauthenticatedUser();
```

---

## 📊 Coverage Requirements

### Minimum Coverage Thresholds

| Category | Target | Enforced |
|----------|--------|----------|
| **Server Actions** | 100% | ✅ Critical |
| **API Routes** | 100% | ✅ Critical |
| **Auth & RBAC** | 100% | ✅ Critical |
| **Business Logic** | 90% | ✅ Important |
| **Components** | 70% | ✅ Standard |
| **Overall** | 80% | ✅ **BLOCKS COMMIT** |

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# View in browser (after running coverage)
open coverage/lcov-report/index.html  # Mac
start coverage/lcov-report/index.html # Windows
xdg-open coverage/lcov-report/index.html # Linux
```

### Coverage is enforced in:
- ✅ `jest.config.ts` - 80% minimum threshold
- ✅ `scripts/test-ci.sh` - CI/CD pipeline
- ✅ Pre-commit hooks (if configured)

---

## 💡 Best Practices

### DO ✅

1. **Test behavior, not implementation**
   ```typescript
   // ✅ Good - tests behavior
   expect(screen.getByText('Welcome')).toBeInTheDocument();

   // ❌ Bad - tests implementation
   expect(component.state.showWelcome).toBe(true);
   ```

2. **Use descriptive test names**
   ```typescript
   // ✅ Good
   it('should redirect to login when user is not authenticated', () => {});

   // ❌ Bad
   it('test auth', () => {});
   ```

3. **Reset mocks between tests**
   ```typescript
   beforeEach(() => {
     resetMocks(); // Clean slate for each test
   });
   ```

4. **Test edge cases and errors**
   ```typescript
   it('should handle empty email gracefully', () => {});
   it('should throw error for invalid input', () => {});
   ```

5. **Use test utilities**
   ```typescript
   // ✅ Good - use utilities
   const user = mockUser({ email: 'test@example.com' });

   // ❌ Bad - manual object creation
   const user = { id: '1', email: 'test@example.com', ... };
   ```

### DON'T ❌

1. **Don't share state between tests**
   ```typescript
   // ❌ Bad - shared state
   let user;
   beforeAll(() => { user = createUser(); });

   // ✅ Good - isolated
   beforeEach(() => { user = createUser(); });
   ```

2. **Don't mock too much**
   ```typescript
   // ❌ Bad - over-mocking
   jest.mock('@/lib/utils');
   jest.mock('@/lib/auth');
   jest.mock('everything');

   // ✅ Good - mock only external dependencies
   jest.mock('@/lib/database/prisma');
   ```

3. **Don't test implementation details**
   ```typescript
   // ❌ Bad
   expect(component.handleClick).toHaveBeenCalled();

   // ✅ Good
   expect(mockOnClick).toHaveBeenCalled();
   ```

4. **Don't skip error cases**
   ```typescript
   // Always test both success and failure paths
   it('should succeed with valid data', () => {});
   it('should fail with invalid data', () => {});
   ```

5. **Don't ignore flaky tests**
   - Fix flaky tests immediately
   - Don't use `it.skip()` to hide problems
   - Investigate and resolve root cause

---

## 📚 Examples

### Example 1: Server Action Test

See: `__tests__/lib/modules/crm/actions.test.ts`

### Example 2: Component Test

See: `__tests__/components/ui/button.test.tsx`

### Example 3: Integration Test

See: `__tests__/integration/crm-workflow.test.ts`

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Tests Fail with "Cannot find module"

**Solution:** Check `tsconfig.json` paths and `jest.config.ts` moduleNameMapper

#### 2. "Prisma Client Not Generated"

**Solution:**
```bash
npx prisma generate --schema=../shared/prisma/schema.prisma
```

#### 3. Tests Timeout

**Solution:** Increase timeout or use async/await properly

```typescript
it('slow test', async () => {}, 10000); // 10 second timeout
```

#### 4. Database Tests Fail

**Solution:**
```typescript
beforeEach(async () => {
  await cleanDatabase();
});
```

---

## 🎯 Quick Reference

```bash
# Development
npm run test:watch              # Watch mode
npm test -- filename           # Run specific file

# Coverage
npm run test:coverage          # Generate report

# CI/CD
npm run test:ci                # Full CI suite
```

**Coverage Target:** 80% minimum (enforced)
**Test Framework:** Jest + Testing Library

---

**Last Updated:** 2025-01-04
**Session:** 5 - Testing Infrastructure
