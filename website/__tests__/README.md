# Test Suite Documentation

## Quick Start

```bash
# 1. Set up test database (see Database Setup below)
# 2. Install dependencies
npm install

# 3. Run tests
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm run test:coverage    # With coverage report

# 4. Run specific test suites
npm test -- crm          # Run CRM tests
npm test -- integration  # Run integration tests
npm test -- components   # Run component tests
```

---

## Database Setup

### Option 1: Existing Supabase Database (Quick Start)

**⚠️ WARNING:** This will clean your database during tests. Only use for development databases.

```bash
# 1. Copy your existing .env to .env.test
cp .env .env.test

# 2. Ensure NODE_ENV is set to test
echo 'NODE_ENV="test"' >> .env.test

# 3. Run tests
npm test
```

### Option 2: Local PostgreSQL (Recommended)

```bash
# 1. Install PostgreSQL
brew install postgresql@15              # macOS
# OR
sudo apt-get install postgresql-15      # Linux
# OR
choco install postgresql15              # Windows

# 2. Start PostgreSQL service
brew services start postgresql@15       # macOS
sudo systemctl start postgresql         # Linux
# Windows: PostgreSQL service starts automatically

# 3. Create test database
createdb strive_test

# 4. Update .env.test with local connection
cat > .env.test << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/strive_test?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/strive_test?schema=public"

# Copy other env vars from .env
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="test-anon-key"
SUPABASE_SERVICE_ROLE_KEY="test-service-role-key"
NODE_ENV="test"
EOF

# 5. Run migrations
npx prisma migrate deploy
npx prisma generate

# 6. Verify connection
npm test -- __tests__/utils/test-helpers.test.ts
```

### Option 3: Separate Supabase Test Project (Isolated)

```bash
# 1. Create new Supabase project
# Go to: https://supabase.com/dashboard
# Click: "New Project"
# Name: "strive-tech-test"

# 2. Get connection strings
# Navigate to: Project Settings → Database
# Copy: Connection string (Transaction pooler)

# 3. Update .env.test
DATABASE_URL="postgresql://postgres.[TEST-PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[TEST-PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.aws.neon.tech:5432/postgres"

# Get API keys from: Project Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://[TEST-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-test-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-test-service-role-key"

# 4. Run migrations
npx prisma migrate deploy
npx prisma generate

# 5. Run tests
npm test
```

---

## Test Structure

```
__tests__/
├── unit/                      # Unit tests (isolated functions/components)
│   ├── lib/modules/          # Server Actions tests
│   │   ├── auth/             # Authentication tests
│   │   ├── crm/              # CRM module tests
│   │   ├── projects/         # Project management tests
│   │   ├── tasks/            # Task management tests
│   │   ├── notifications/    # Notification tests
│   │   └── attachments/      # File attachment tests
│   └── components/           # Component tests
│       ├── ui/               # shadcn/ui components
│       ├── features/         # Feature-specific components
│       └── shared/           # Shared components
├── integration/              # Integration tests (multiple systems)
│   ├── flows/               # User flow tests (e2e workflows)
│   └── database/            # Database integration tests
├── fixtures/                # Test data
│   ├── users.ts            # User fixtures
│   ├── organizations.ts    # Organization fixtures
│   └── projects.ts         # Project & task fixtures
└── utils/                   # Test utilities
    ├── test-helpers.ts     # Database helpers, cleanup functions
    └── mock-factories.ts   # Data factories using Faker.js
```

---

## Writing Tests

### Test Template (AAA Pattern)

```typescript
import { testPrisma, cleanDatabase, createTestOrgWithUser } from '@/__tests__/utils/test-helpers';

describe('Feature Name', () => {
  beforeEach(async () => {
    await cleanDatabase(); // Clean database before each test
  });

  it('should do something specific', async () => {
    // ARRANGE - Set up test data
    const { organization, user } = await createTestOrgWithUser();

    // ACT - Execute the function under test
    const result = await functionUnderTest(input);

    // ASSERT - Verify the result
    expect(result).toBeDefined();
    expect(result.id).toBe(expectedId);
  });
});
```

### Server Action Tests

```typescript
import { createCustomer } from '@/lib/modules/crm/actions';
import { CustomerStatus, CustomerSource } from '@prisma/client';

// Mock Supabase auth
jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClientWithAuth: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      })),
    },
  })),
}));

describe('createCustomer', () => {
  it('should create customer successfully', async () => {
    const { organization } = await createTestOrgWithUser();

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      status: CustomerStatus.LEAD,
      source: CustomerSource.WEBSITE,
      tags: [],
      organizationId: organization.id,
    };

    const customer = await createCustomer(input);

    expect(customer).toBeDefined();
    expect(customer.name).toBe('John Doe');

    // Verify in database
    const dbCustomer = await testPrisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(dbCustomer?.name).toBe('John Doe');
  });
});
```

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });
});
```

---

## Coverage Requirements

**Minimum Coverage: 80%** (enforced by Jest)

### Coverage Breakdown
- **Server Actions:** 100% required
- **Components:** 85%+ recommended
- **Utils/Helpers:** 90%+ recommended
- **Overall:** 80%+ minimum

### Check Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

---

## Best Practices

### 1. Test Isolation
- Always clean database in `beforeEach`
- Don't depend on test execution order
- Each test should be independent

### 2. Descriptive Test Names
```typescript
✅ GOOD: it('should create customer with valid email')
❌ BAD:  it('test1')
```

### 3. One Assertion Focus per Test
```typescript
✅ GOOD: Test one behavior per test case
❌ BAD:  Test multiple unrelated behaviors in one test
```

### 4. Mock External Dependencies
- Mock Supabase Auth
- Mock Supabase Storage
- Mock AI providers (OpenRouter, Groq)
- Mock Stripe API

### 5. Use Test Helpers
```typescript
// Use helpers for common setup
const { organization, user } = await createTestOrgWithUser();
const customer = await createTestCustomer(organization.id);

// Don't manually create test data repeatedly
```

### 6. Test Error Cases
```typescript
it('should throw error for invalid email', async () => {
  const invalidInput = { email: 'not-an-email' };
  await expect(createCustomer(invalidInput)).rejects.toThrow();
});
```

---

## Troubleshooting

### Database Connection Failed
**Error:** `Can't reach database server at localhost:5432`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env.test`
3. Ensure database exists: `psql -l | grep strive_test`
4. Run migrations: `npx prisma migrate deploy`

### Prisma Client Not Found
**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
npm test
```

### Tests Timing Out
**Error:** `Exceeded timeout of 5000ms`

**Solution:**
1. Check for missing `await` keywords
2. Increase timeout in specific test:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Coverage Below 80%
**Error:** `Jest: Coverage threshold not met`

**Solution:**
1. Run: `npm run test:coverage`
2. Open: `coverage/index.html`
3. Identify uncovered lines (marked in red)
4. Write tests for uncovered code
5. Focus on Server Actions first (must be 100%)

### Mock Not Working
**Error:** `Mock function not called as expected`

**Solution:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset specific mock
mockFunction.mockReset();
mockFunction.mockResolvedValue(newValue);
```

---

## CI/CD Integration

Tests run automatically on:
- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main` or `develop`

**Pre-commit hooks** (via Husky):
- ESLint (zero warnings)
- TypeScript check (zero errors)
- Jest tests (all passing)
- Coverage check (80%+ required)

**Branch protection:**
- Requires passing tests
- Requires 80%+ coverage
- Requires 1 approval
- Blocks merge if checks fail

---

## Commands Reference

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.ts

# Run tests matching pattern
npm test -- --testNamePattern="customer"

# Run only unit tests
npm test -- __tests__/unit

# Run only integration tests
npm test -- __tests__/integration

# Update snapshots
npm test -- -u

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

---

**Last Updated:** October 2, 2025
**Test Suite Version:** 1.0.0
**Target Coverage:** 80%+ (100% for Server Actions)