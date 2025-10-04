# Session 4 Plan: Comprehensive Test Suite Implementation
**Strive Tech SaaS Platform - Automated Testing & CI/CD**

**Created:** October 2, 2025
**Estimated Duration:** 8-12 hours
**Session Type:** Test Infrastructure & Coverage
**Target:** 80%+ test coverage with automated CI/CD

---

## 📋 Session Overview

### Objective
Implement a comprehensive automated test suite for the Strive Tech SaaS platform to achieve 80%+ code coverage, ensure production quality, and enable continuous integration/deployment.

### Context
- **Session 2:** Deployed database infrastructure (RLS, Storage, Notifications)
- **Session 3:** Created integration test scripts (1,228 lines) for manual testing
- **Session 4:** Build automated Jest test suite with CI/CD integration

### Success Criteria
- ✅ 80%+ test coverage across codebase
- ✅ All Server Actions have unit tests
- ✅ All critical user flows have integration tests
- ✅ Test database properly configured
- ✅ CI/CD pipeline operational
- ✅ Zero test failures on main branch
- ✅ Tests run in < 2 minutes

---

## 🎯 Phase 1: Test Infrastructure Setup (2 hours)

### Task 1.1: Configure Test Database (30 min)

**Objective:** Set up isolated test database to avoid polluting development data

**Option A: Local PostgreSQL (Recommended for Fast Tests)**

```bash
# 1. Install PostgreSQL locally (if not already installed)
brew install postgresql@15  # macOS
# or
sudo apt-get install postgresql-15  # Linux

# 2. Create test database
createdb strive_test

# 3. Create test user
psql -d strive_test -c "CREATE USER test_user WITH PASSWORD 'test_password';"
psql -d strive_test -c "GRANT ALL PRIVILEGES ON DATABASE strive_test TO test_user;"
```

**Option B: Separate Supabase Project (Easier Setup)**

```bash
# 1. Create new Supabase project: "strive-tech-test"
# 2. Copy connection string
# 3. Add to .env.test
```

**Create `.env.test`:**

```bash
# Test Database (Local PostgreSQL)
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/strive_test"
DIRECT_URL="postgresql://test_user:test_password@localhost:5432/strive_test"

# OR Test Database (Supabase)
# DATABASE_URL="postgresql://postgres:[password]@db.[test-project].supabase.co:5432/postgres"
# DIRECT_URL="postgresql://postgres:[password]@db.[test-project].supabase.co:5432/postgres"

# Test Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[test-project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-test-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-test-service-role-key"

# Test Mode Flag
NODE_ENV="test"

# Other test env vars
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GROQ_API_KEY="test-key-or-real-key"
OPENAI_API_KEY="test-key-or-real-key"
```

**Apply Schema to Test Database:**

```bash
# Run Prisma migrations
cd app
export DATABASE_URL="postgresql://test_user:test_password@localhost:5432/strive_test"
npx prisma migrate deploy
npx prisma generate
```

**Verification:**
```bash
# Verify tables exist
psql -d strive_test -c "\dt"
# Should show all Prisma tables
```

---

### Task 1.2: Configure Jest for Next.js 15 (45 min)

**Install Dependencies:**

```bash
cd app
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest \
  ts-node \
  dotenv
```

**Create `jest.config.ts`:**

```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const config: Config = {
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },

  // Coverage
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/(web)/**', // Exclude legacy site
  ],

  // Coverage thresholds (ENFORCED)
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/dist/',
    '/(web)/',
  ],

  // Transform
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
      },
    }],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Verbose output
  verbose: true,

  // Max workers (parallel tests)
  maxWorkers: '50%',

  // Test timeout
  testTimeout: 10000,
};

export default createJestConfig(config);
```

**Create `jest.setup.ts`:**

```typescript
import '@testing-library/jest-dom';
import { loadEnvConfig } from '@next/env';
import dotenv from 'dotenv';

// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  loadEnvConfig(process.cwd());
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(), // Suppress console.error in tests
  warn: jest.fn(),  // Suppress console.warn in tests
};
```

**Update `package.json` Scripts:**

```json
{
  "scripts": {
    "test": "jest --env=jsdom",
    "test:watch": "jest --watch --env=jsdom",
    "test:coverage": "jest --coverage --env=jsdom",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration"
  }
}
```

**Verification:**

```bash
npm test -- --version
# Should show Jest version

npm test -- --listTests
# Should find 0 tests initially
```

---

### Task 1.3: Create Test Directory Structure (15 min)

**Create Directories:**

```bash
cd app
mkdir -p __tests__/{unit,integration,fixtures,utils}
mkdir -p __tests__/unit/{lib,components,app}
mkdir -p __tests__/integration/{api,flows}
```

**Expected Structure:**

```
app/
├── __tests__/
│   ├── unit/                    # Unit tests
│   │   ├── lib/                 # Server Actions, utilities
│   │   │   ├── modules/
│   │   │   │   ├── crm/
│   │   │   │   │   ├── actions.test.ts
│   │   │   │   │   ├── queries.test.ts
│   │   │   │   │   └── schemas.test.ts
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   └── notifications/
│   │   │   └── auth/
│   │   ├── components/          # Component tests
│   │   │   ├── ui/
│   │   │   ├── features/
│   │   │   └── shared/
│   │   └── app/                 # Route tests
│   ├── integration/             # Integration tests
│   │   ├── api/                 # API route tests
│   │   ├── flows/               # User flow tests
│   │   │   ├── auth.test.ts
│   │   │   ├── crm.test.ts
│   │   │   └── projects.test.ts
│   │   └── database/            # Database integration
│   ├── fixtures/                # Test data
│   │   ├── users.ts
│   │   ├── organizations.ts
│   │   ├── customers.ts
│   │   └── projects.ts
│   └── utils/                   # Test utilities
│       ├── test-helpers.ts
│       ├── test-database.ts
│       └── mock-factories.ts
```

**Create `.gitignore` Entry:**

```bash
echo "" >> .gitignore
echo "# Test files" >> .gitignore
echo "__tests__/coverage/" >> .gitignore
echo ".env.test" >> .gitignore
```

---

### Task 1.4: Create Test Utilities & Helpers (30 min)

**Create `__tests__/utils/test-helpers.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';

// Test Prisma client (uses test database)
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Clean database between tests
export async function cleanDatabase() {
  const tables = [
    'notifications',
    'attachments',
    'activity_logs',
    'tasks',
    'projects',
    'customers',
    'ai_conversations',
    'organization_members',
    'users',
    'organizations',
  ];

  for (const table of tables) {
    await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

// Create test organization
export async function createTestOrganization(name = 'Test Org') {
  return await testPrisma.organization.create({
    data: {
      name,
      subdomain: name.toLowerCase().replace(/\s/g, '-'),
      tier: 'TIER_1',
    },
  });
}

// Create test user
export async function createTestUser(
  orgId: string,
  email = 'test@example.com',
  role: 'OWNER' | 'ADMIN' | 'USER' = 'USER'
) {
  const user = await testPrisma.user.create({
    data: {
      email,
      name: 'Test User',
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
    },
  });

  await testPrisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: orgId,
      role,
    },
  });

  return user;
}

// Wait for async operations
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock file upload
export function createMockFile(
  name = 'test.pdf',
  type = 'application/pdf',
  size = 1024
): File {
  const blob = new Blob(['test content'], { type });
  return new File([blob], name, { type });
}
```

**Create `__tests__/utils/mock-factories.ts`:**

```typescript
import { faker } from '@faker-js/faker';

export const mockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: 'USER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockOrganization = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  subdomain: faker.internet.domainWord(),
  tier: 'TIER_1' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockCustomer = (orgId: string, overrides = {}) => ({
  id: faker.string.uuid(),
  organizationId: orgId,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  company: faker.company.name(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockProject = (orgId: string, managerId: string, overrides = {}) => ({
  id: faker.string.uuid(),
  organizationId: orgId,
  projectManagerId: managerId,
  name: faker.company.catchPhrase(),
  description: faker.lorem.paragraph(),
  status: 'ACTIVE' as const,
  startDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockTask = (projectId: string, assignedTo: string, overrides = {}) => ({
  id: faker.string.uuid(),
  projectId,
  assignedTo,
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  dueDate: faker.date.future(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

**Create `__tests__/fixtures/users.ts`:**

```typescript
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'ADMIN' as const,
  },
  user: {
    email: 'user@test.com',
    name: 'Regular User',
    role: 'USER' as const,
  },
  owner: {
    email: 'owner@test.com',
    name: 'Org Owner',
    role: 'USER' as const, // OWNER is in org_members
  },
};

export const testOrganizations = {
  org1: {
    name: 'Test Organization 1',
    subdomain: 'test-org-1',
    tier: 'TIER_1' as const,
  },
  org2: {
    name: 'Test Organization 2',
    subdomain: 'test-org-2',
    tier: 'TIER_2' as const,
  },
};
```

**Install Additional Dependencies:**

```bash
npm install --save-dev @faker-js/faker
```

---

## 🎯 Phase 2: Unit Tests - Server Actions (3 hours)

### Task 2.1: Test CRM Actions (45 min)

**Create `__tests__/unit/lib/modules/crm/actions.test.ts`:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/lib/modules/crm/actions';
import {
  testPrisma,
  cleanDatabase,
  createTestOrganization,
  createTestUser,
} from '@/__tests__/utils/test-helpers';

describe('CRM Actions', () => {
  let testOrg: any;
  let testUser: any;

  beforeEach(async () => {
    await cleanDatabase();
    testOrg = await createTestOrganization('Test CRM Org');
    testUser = await createTestUser(testOrg.id, 'crm@test.com', 'USER');
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0100',
        company: 'Acme Corp',
        organizationId: testOrg.id,
      };

      const result = await createCustomer(customerData);

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.organizationId).toBe(testOrg.id);

      // Verify in database
      const dbCustomer = await testPrisma.customer.findUnique({
        where: { id: result.id },
      });
      expect(dbCustomer).toBeDefined();
      expect(dbCustomer?.name).toBe('John Doe');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',  // Empty name
        email: 'invalid-email',  // Invalid email
        organizationId: testOrg.id,
      };

      await expect(createCustomer(invalidData as any)).rejects.toThrow();
    });

    it('should prevent duplicate emails in same organization', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        organizationId: testOrg.id,
      };

      await createCustomer(customerData);

      // Try to create duplicate
      await expect(createCustomer(customerData)).rejects.toThrow();
    });

    it('should allow same email in different organizations', async () => {
      const org2 = await createTestOrganization('Test Org 2');

      const customer1 = await createCustomer({
        name: 'John Doe',
        email: 'same@example.com',
        organizationId: testOrg.id,
      });

      const customer2 = await createCustomer({
        name: 'Jane Doe',
        email: 'same@example.com',
        organizationId: org2.id,
      });

      expect(customer1.id).not.toBe(customer2.id);
      expect(customer1.email).toBe(customer2.email);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer fields', async () => {
      const customer = await createCustomer({
        name: 'John Doe',
        email: 'john@example.com',
        organizationId: testOrg.id,
      });

      const updated = await updateCustomer({
        id: customer.id,
        name: 'Jane Doe',
        phone: '555-0200',
      });

      expect(updated.name).toBe('Jane Doe');
      expect(updated.phone).toBe('555-0200');
      expect(updated.email).toBe('john@example.com'); // Unchanged
    });

    it('should reject invalid customer ID', async () => {
      await expect(
        updateCustomer({
          id: 'non-existent-id',
          name: 'Updated Name',
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer and related data', async () => {
      const customer = await createCustomer({
        name: 'To Delete',
        email: 'delete@example.com',
        organizationId: testOrg.id,
      });

      await deleteCustomer(customer.id);

      const deleted = await testPrisma.customer.findUnique({
        where: { id: customer.id },
      });

      expect(deleted).toBeNull();
    });

    it('should cascade delete related projects', async () => {
      const customer = await createCustomer({
        name: 'Customer with Projects',
        email: 'projects@example.com',
        organizationId: testOrg.id,
      });

      const project = await testPrisma.project.create({
        data: {
          name: 'Test Project',
          organizationId: testOrg.id,
          projectManagerId: testUser.id,
          customerId: customer.id,
        },
      });

      await deleteCustomer(customer.id);

      const deletedProject = await testPrisma.project.findUnique({
        where: { id: project.id },
      });

      expect(deletedProject).toBeNull(); // Cascade delete
    });
  });
});
```

**Run Tests:**

```bash
npm test -- __tests__/unit/lib/modules/crm
```

**Expected Output:**
```
 PASS  __tests__/unit/lib/modules/crm/actions.test.ts
  CRM Actions
    createCustomer
      ✓ should create a customer successfully (50ms)
      ✓ should validate required fields (10ms)
      ✓ should prevent duplicate emails in same organization (15ms)
      ✓ should allow same email in different organizations (20ms)
    updateCustomer
      ✓ should update customer fields (15ms)
      ✓ should reject invalid customer ID (10ms)
    deleteCustomer
      ✓ should delete customer and related data (15ms)
      ✓ should cascade delete related projects (20ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

---

### Task 2.2: Test Notification Actions (45 min)

**Create `__tests__/unit/lib/modules/notifications/actions.test.ts`:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createNotification,
  markAsRead,
  deleteNotification,
} from '@/lib/modules/notifications/actions';
import {
  testPrisma,
  cleanDatabase,
  createTestOrganization,
  createTestUser,
} from '@/__tests__/utils/test-helpers';

describe('Notification Actions', () => {
  let testOrg: any;
  let testUser: any;

  beforeEach(async () => {
    await cleanDatabase();
    testOrg = await createTestOrganization();
    testUser = await createTestUser(testOrg.id);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('createNotification', () => {
    it('should create notification with required fields', async () => {
      const notification = await createNotification({
        userId: testUser.id,
        organizationId: testOrg.id,
        type: 'INFO',
        title: 'Test Notification',
        message: 'This is a test',
      });

      expect(notification.id).toBeDefined();
      expect(notification.type).toBe('INFO');
      expect(notification.read).toBe(false);
    });

    it('should create notification with optional fields', async () => {
      const notification = await createNotification({
        userId: testUser.id,
        organizationId: testOrg.id,
        type: 'SUCCESS',
        title: 'Task Complete',
        message: 'Your task is done',
        actionUrl: '/tasks/123',
        entityType: 'task',
        entityId: 'task-123',
      });

      expect(notification.actionUrl).toBe('/tasks/123');
      expect(notification.entityType).toBe('task');
      expect(notification.entityId).toBe('task-123');
    });

    it('should validate notification type', async () => {
      await expect(
        createNotification({
          userId: testUser.id,
          organizationId: testOrg.id,
          type: 'INVALID_TYPE' as any,
          title: 'Test',
          message: 'Test',
        })
      ).rejects.toThrow();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await createNotification({
        userId: testUser.id,
        organizationId: testOrg.id,
        type: 'INFO',
        title: 'Test',
        message: 'Test',
      });

      expect(notification.read).toBe(false);

      const updated = await markAsRead(notification.id);

      expect(updated.read).toBe(true);
    });

    it('should be idempotent', async () => {
      const notification = await createNotification({
        userId: testUser.id,
        organizationId: testOrg.id,
        type: 'INFO',
        title: 'Test',
        message: 'Test',
      });

      await markAsRead(notification.id);
      const secondUpdate = await markAsRead(notification.id);

      expect(secondUpdate.read).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const notification = await createNotification({
        userId: testUser.id,
        organizationId: testOrg.id,
        type: 'INFO',
        title: 'Test',
        message: 'Test',
      });

      await deleteNotification(notification.id);

      const deleted = await testPrisma.notification.findUnique({
        where: { id: notification.id },
      });

      expect(deleted).toBeNull();
    });
  });
});
```

---

### Task 2.3: Test Project Actions (45 min)

Similar structure for:
- `__tests__/unit/lib/modules/projects/actions.test.ts`
- `__tests__/unit/lib/modules/tasks/actions.test.ts`
- `__tests__/unit/lib/modules/attachments/actions.test.ts`

---

### Task 2.4: Test Authentication Actions (45 min)

**Create `__tests__/unit/lib/auth/actions.test.ts`:**

```typescript
// Test signup, login, logout, session management
```

---

## 🎯 Phase 3: Integration Tests (2 hours)

### Task 3.1: User Flow Tests (60 min)

**Create `__tests__/integration/flows/crm.test.ts`:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  testPrisma,
  cleanDatabase,
  createTestOrganization,
  createTestUser,
} from '@/__tests__/utils/test-helpers';

describe('CRM User Flow', () => {
  let testOrg: any;
  let testUser: any;

  beforeEach(async () => {
    await cleanDatabase();
    testOrg = await createTestOrganization();
    testUser = await createTestUser(testOrg.id, 'user@test.com', 'USER');
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should complete full customer lifecycle', async () => {
    // 1. Create customer
    const customer = await testPrisma.customer.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        organizationId: testOrg.id,
      },
    });

    // 2. Create project for customer
    const project = await testPrisma.project.create({
      data: {
        name: 'Website Redesign',
        organizationId: testOrg.id,
        projectManagerId: testUser.id,
        customerId: customer.id,
      },
    });

    // 3. Add tasks to project
    const task1 = await testPrisma.task.create({
      data: {
        title: 'Design mockups',
        projectId: project.id,
        assignedTo: testUser.id,
        status: 'TODO',
      },
    });

    // 4. Update task status
    await testPrisma.task.update({
      where: { id: task1.id },
      data: { status: 'IN_PROGRESS' },
    });

    // 5. Complete task
    await testPrisma.task.update({
      where: { id: task1.id },
      data: { status: 'DONE' },
    });

    // 6. Verify full data structure
    const fullCustomer = await testPrisma.customer.findUnique({
      where: { id: customer.id },
      include: {
        projects: {
          include: {
            tasks: true,
          },
        },
      },
    });

    expect(fullCustomer).toBeDefined();
    expect(fullCustomer?.projects).toHaveLength(1);
    expect(fullCustomer?.projects[0].tasks).toHaveLength(1);
    expect(fullCustomer?.projects[0].tasks[0].status).toBe('DONE');
  });

  it('should prevent cross-organization data access', async () => {
    // Create second organization
    const org2 = await createTestOrganization('Org 2');
    const user2 = await createTestUser(org2.id, 'user2@test.com');

    // User 1 creates customer in Org 1
    const customer1 = await testPrisma.customer.create({
      data: {
        name: 'Customer 1',
        email: 'customer1@test.com',
        organizationId: testOrg.id,
      },
    });

    // User 2 should not see Org 1 customers
    const org2Customers = await testPrisma.customer.findMany({
      where: { organizationId: org2.id },
    });

    expect(org2Customers).toHaveLength(0);
    expect(org2Customers.find(c => c.id === customer1.id)).toBeUndefined();
  });
});
```

---

### Task 3.2: Database Integration Tests (60 min)

**Create `__tests__/integration/database/rls.test.ts`:**

```typescript
// Test RLS policies with different user roles
// Test multi-tenant isolation
// Test cascade deletes
```

**Create `__tests__/integration/database/transactions.test.ts`:**

```typescript
// Test Prisma transactions
// Test rollback on error
// Test concurrent updates
```

---

## 🎯 Phase 4: Component Tests (1.5 hours)

### Task 4.1: UI Component Tests (45 min)

**Create `__tests__/unit/components/ui/button.test.tsx`:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });

  it('should apply variant styles', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('destructive');
  });
});
```

---

### Task 4.2: Feature Component Tests (45 min)

Test key feature components:
- `__tests__/unit/components/features/notification-dropdown.test.tsx`
- `__tests__/unit/components/features/customer-table.test.tsx`
- `__tests__/unit/components/features/project-card.test.tsx`

---

## 🎯 Phase 5: Coverage & Quality (1.5 hours)

### Task 5.1: Achieve 80% Coverage (60 min)

**Run Coverage Report:**

```bash
npm run test:coverage
```

**Identify Gaps:**

```bash
# Generate HTML coverage report
npm run test:coverage -- --coverageDirectory=coverage

# Open in browser
open coverage/index.html  # macOS
# or
xdg-open coverage/index.html  # Linux
```

**Focus on:**
- Server Actions (must be 100% covered)
- Critical user flows
- Database operations
- Auth logic

**Write Tests for Uncovered Code:**

Prioritize:
1. High-risk areas (auth, payments, data deletion)
2. Business logic
3. Error handling
4. Edge cases

---

### Task 5.2: Add Test Documentation (30 min)

**Create `__tests__/README.md`:**

```markdown
# Test Suite Documentation
**Strive Tech SaaS Platform**

## Quick Start

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific suite
npm test -- __tests__/unit/lib/modules/crm

# Run integration tests only
npm test -- __tests__/integration
\`\`\`

## Test Database Setup

1. Create test database: \`createdb strive_test\`
2. Apply migrations: \`npx prisma migrate deploy\`
3. Copy \`.env.test.example\` to \`.env.test\`

## Writing Tests

### Unit Tests
- Test single functions/components in isolation
- Mock external dependencies
- Fast execution (<10ms per test)

### Integration Tests
- Test multiple components working together
- Use test database
- Test user flows end-to-end

### Coverage Requirements
- Minimum 80% coverage required
- Server Actions must be 100% covered
- PRs with <80% coverage will be blocked

## Best Practices

1. **AAA Pattern:** Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Descriptive test names:** "should [expected behavior] when [condition]"
4. **Clean up:** Use beforeEach/afterEach
5. **Avoid test interdependence:** Each test should run independently

## Troubleshooting

### Tests failing with database errors
- Check \`.env.test\` has correct DATABASE_URL
- Run \`npx prisma migrate deploy\` to apply schema

### Timeout errors
- Increase timeout in \`jest.config.ts\`
- Check for infinite loops or missing awaits

### Mock errors
- Verify mocks in \`jest.setup.ts\`
- Clear mocks with \`jest.clearAllMocks()\`
```

---

## 🎯 Phase 6: CI/CD Integration (1 hour)

### Task 6.1: GitHub Actions Workflow (30 min)

**Create `.github/workflows/test.yml`:**

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: strive_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        working-directory: app
        run: npm ci

      - name: Generate Prisma Client
        working-directory: app
        run: npx prisma generate

      - name: Run database migrations
        working-directory: app
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/strive_test
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: app
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/strive_test
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
          NODE_ENV: test
        run: npm run test:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./app/coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Check coverage threshold
        working-directory: app
        run: |
          COVERAGE=$(node -p "Math.floor(require('./coverage/coverage-summary.json').total.lines.pct)")
          echo "Coverage: $COVERAGE%"
          if [ $COVERAGE -lt 80 ]; then
            echo "❌ Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
          echo "✅ Coverage $COVERAGE% meets 80% threshold"
```

**Add GitHub Secrets:**

1. Go to GitHub → Settings → Secrets
2. Add:
   - `TEST_SUPABASE_URL`
   - `TEST_SUPABASE_ANON_KEY`
   - `TEST_SUPABASE_SERVICE_ROLE_KEY`

---

### Task 6.2: Pre-commit Hook (15 min)

**Install Husky:**

```bash
npm install --save-dev husky lint-staged
npx husky install
```

**Create `.husky/pre-commit`:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting and type check
npm run lint
npm run type-check

# Run tests related to staged files
npm test -- --bail --findRelatedTests $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' | tr '\n' ' ')
```

**Update `package.json`:**

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

---

### Task 6.3: Branch Protection Rules (15 min)

**Configure in GitHub:**

1. Settings → Branches → Branch protection rules
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - ✅ test (GitHub Actions)
     - ✅ codecov/project
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

---

## 📊 Session Deliverables Checklist

### Infrastructure
- [ ] Test database configured (local or Supabase)
- [ ] Jest configured for Next.js 15
- [ ] Test directory structure created
- [ ] Test utilities and helpers created
- [ ] Mock factories implemented

### Unit Tests (80+ tests)
- [ ] CRM actions (8 tests)
- [ ] Notification actions (7 tests)
- [ ] Project actions (10 tests)
- [ ] Task actions (10 tests)
- [ ] Attachment actions (6 tests)
- [ ] Auth actions (10 tests)
- [ ] UI components (20 tests)
- [ ] Feature components (15 tests)

### Integration Tests (20+ tests)
- [ ] CRM user flow (5 tests)
- [ ] Project lifecycle (5 tests)
- [ ] RLS policies (5 tests)
- [ ] Database transactions (5 tests)

### Quality & Coverage
- [ ] 80%+ overall coverage achieved
- [ ] 100% coverage on Server Actions
- [ ] Coverage report generated
- [ ] All tests passing
- [ ] Test documentation created

### CI/CD
- [ ] GitHub Actions workflow created
- [ ] Secrets configured
- [ ] Pre-commit hooks installed
- [ ] Branch protection rules configured
- [ ] Codecov integration (optional)

### Documentation
- [ ] Test README created
- [ ] Test writing guide documented
- [ ] Troubleshooting section added
- [ ] Session 4 summary created

---

## 🎯 Success Metrics

**Code Quality:**
- ✅ 80%+ test coverage
- ✅ Zero test failures
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors

**Performance:**
- ✅ Tests run in < 2 minutes
- ✅ CI/CD pipeline < 5 minutes
- ✅ Unit tests < 10ms each

**Coverage Breakdown:**
- Server Actions: 100%
- Components: 85%+
- Utils/Helpers: 90%+
- Overall: 80%+

---

## 🔧 Troubleshooting Guide

### Common Issues

#### 1. Database Connection Errors

**Error:** `Can't reach database server`

**Solution:**
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Verify DATABASE_URL
echo $DATABASE_URL

# Restart PostgreSQL
brew services restart postgresql@15
```

#### 2. Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

#### 3. Tests Timeout

**Error:** `Exceeded timeout of 5000 ms`

**Solution:**
```typescript
// Increase timeout in jest.config.ts
testTimeout: 30000,  // 30 seconds

// Or per-test
it('slow test', async () => {
  // ...
}, 30000);
```

#### 4. Mock Not Working

**Error:** `Module not mocked`

**Solution:**
```typescript
// Check jest.setup.ts has correct mock path
// Ensure mock is before imports
jest.mock('@/lib/supabase/client');
```

---

## 📈 Next Steps After Session 4

### Immediate (Same Day)
1. Commit all test files
2. Push to GitHub
3. Verify CI/CD pipeline runs
4. Create Session 4 summary document

### Short-term (1 Week)
1. Monitor test failures
2. Fix flaky tests
3. Improve coverage on low-coverage areas
4. Add E2E tests with Playwright (optional)

### Long-term (1 Month)
1. Set up visual regression testing
2. Add performance testing
3. Implement load testing
4. Create security testing suite

---

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)
- [GitHub Actions](https://docs.github.com/en/actions)

### Tools
- [Jest](https://jestjs.io/) - Test runner
- [Testing Library](https://testing-library.com/) - Component testing
- [Faker.js](https://fakerjs.dev/) - Test data generation
- [Codecov](https://codecov.io/) - Coverage reporting

---

## ✅ Pre-Session Checklist

Before starting Session 4:

- [ ] Session 3 complete (database verified)
- [ ] Development environment clean (no failing builds)
- [ ] Git working directory clean (commit all changes)
- [ ] .env files backed up
- [ ] 8-12 hours blocked for focused work
- [ ] PostgreSQL installed (for local testing)
- [ ] GitHub repository access confirmed

---

**Session 4 Plan Created:** October 2, 2025
**Estimated Duration:** 8-12 hours
**Difficulty:** Moderate
**Prerequisites:** Session 3 complete, PostgreSQL installed
**Target Outcome:** 80%+ test coverage with automated CI/CD

---

*This comprehensive plan provides step-by-step instructions to build a production-grade test suite. Follow each phase sequentially for best results.*
