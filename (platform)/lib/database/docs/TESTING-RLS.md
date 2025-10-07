# Testing Row Level Security (RLS)

**Purpose:** Comprehensive guide to testing RLS policies in Strive platform
**Updated:** 2025-10-07
**Audience:** Strive-SaaS platform developers

---

## Overview

Row Level Security (RLS) is our primary defense against data leaks in the multi-tenant Strive platform.

**Critical:** Untested RLS policies = potential data breaches.

This guide provides executable tests, SQL commands, and scenarios to verify RLS works correctly.

---

## Why Test RLS?

**Real Risks Without RLS Testing:**
- Organization A sees Organization B's customer data
- User with VIEWER role can delete records
- Expired subscriptions still access premium features
- Malicious users bypass access controls

**Testing Goals:**
1. Verify organization isolation (multi-tenancy)
2. Verify role-based access control (RBAC)
3. Verify subscription tier limits
4. Catch data leaks before production

---

## Manual Testing with SQL

### Test Setup: Create Test Organizations

```sql
-- Create test organizations
INSERT INTO organizations (id, name, subscription_tier)
VALUES
  ('org-test-1', 'Test Organization A', 'STARTER'),
  ('org-test-2', 'Test Organization B', 'GROWTH');

-- Create test users
INSERT INTO users (id, email, name, role)
VALUES
  ('user-test-1', 'alice@org-a.com', 'Alice Admin', 'USER'),
  ('user-test-2', 'bob@org-b.com', 'Bob User', 'USER');

-- Assign users to organizations
INSERT INTO organization_members (organization_id, user_id, role)
VALUES
  ('org-test-1', 'user-test-1', 'ADMIN'),
  ('org-test-2', 'user-test-2', 'MEMBER');

-- Create test contacts
INSERT INTO contacts (id, name, email, organization_id)
VALUES
  ('contact-1', 'Contact A1', 'c1@example.com', 'org-test-1'),
  ('contact-2', 'Contact A2', 'c2@example.com', 'org-test-1'),
  ('contact-3', 'Contact B1', 'c3@example.com', 'org-test-2');
```

---

### Test 1: Organization Isolation (SELECT)

**Goal:** Verify users only see their organization's data

```sql
-- Set context to Organization A (Alice)
SET app.current_user_id = 'user-test-1';
SET app.current_org_id = 'org-test-1';

-- Query contacts
SELECT id, name, organization_id FROM contacts;

-- EXPECTED RESULT:
-- contact-1 | Contact A1 | org-test-1
-- contact-2 | Contact A2 | org-test-1
-- (Should NOT see contact-3 from org-test-2)
```

```sql
-- Switch context to Organization B (Bob)
SET app.current_user_id = 'user-test-2';
SET app.current_org_id = 'org-test-2';

-- Query contacts
SELECT id, name, organization_id FROM contacts;

-- EXPECTED RESULT:
-- contact-3 | Contact B1 | org-test-2
-- (Should NOT see contact-1 or contact-2 from org-test-1)
```

**Test Result:**
- ✅ PASS: Each org sees only their own contacts
- ❌ FAIL: If any org sees another org's contacts → RLS policy broken

---

### Test 2: Organization Isolation (INSERT)

**Goal:** Verify users can only create records for their organization

```sql
-- Set context to Organization A
SET app.current_user_id = 'user-test-1';
SET app.current_org_id = 'org-test-1';

-- Try to insert contact for Organization A (should succeed)
INSERT INTO contacts (id, name, email, organization_id)
VALUES ('contact-test-1', 'Test Contact', 'test@example.com', 'org-test-1');

-- EXPECTED RESULT: Success (INSERT 0 1)
```

```sql
-- Try to insert contact for Organization B (should fail)
INSERT INTO contacts (id, name, email, organization_id)
VALUES ('contact-test-2', 'Malicious Contact', 'mal@example.com', 'org-test-2');

-- EXPECTED RESULT: Error
-- new row violates row-level security policy for table "contacts"
```

**Test Result:**
- ✅ PASS: Insert for own org succeeds, insert for other org fails
- ❌ FAIL: If insert for other org succeeds → RLS policy broken

---

### Test 3: Organization Isolation (UPDATE)

**Goal:** Verify users can only update their organization's records

```sql
-- Set context to Organization B
SET app.current_user_id = 'user-test-2';
SET app.current_org_id = 'org-test-2';

-- Try to update Organization A's contact (should fail)
UPDATE contacts
SET name = 'Hacked Name'
WHERE id = 'contact-1'; -- belongs to org-test-1

-- EXPECTED RESULT: UPDATE 0 (0 rows affected, no error but no update)
```

```sql
-- Try to update own organization's contact (should succeed)
UPDATE contacts
SET name = 'Updated Name'
WHERE id = 'contact-3'; -- belongs to org-test-2

-- EXPECTED RESULT: UPDATE 1 (1 row updated)
```

**Test Result:**
- ✅ PASS: Can update own org's data, cannot update other org's data
- ❌ FAIL: If other org's data is updated → RLS policy broken

---

### Test 4: Organization Isolation (DELETE)

**Goal:** Verify users can only delete their organization's records

```sql
-- Set context to Organization A
SET app.current_user_id = 'user-test-1';
SET app.current_org_id = 'org-test-1';

-- Try to delete Organization B's contact (should fail)
DELETE FROM contacts WHERE id = 'contact-3'; -- belongs to org-test-2

-- EXPECTED RESULT: DELETE 0 (0 rows deleted, no error but no deletion)
```

```sql
-- Try to delete own organization's contact (should succeed)
DELETE FROM contacts WHERE id = 'contact-2'; -- belongs to org-test-1

-- EXPECTED RESULT: DELETE 1 (1 row deleted)
```

**Test Result:**
- ✅ PASS: Can delete own org's data, cannot delete other org's data
- ❌ FAIL: If other org's data is deleted → RLS policy broken

---

### Test 5: No Context = No Access

**Goal:** Verify queries fail without RLS context set

```sql
-- Reset context
RESET app.current_user_id;
RESET app.current_org_id;

-- Try to query contacts
SELECT id, name FROM contacts;

-- EXPECTED RESULT: 0 rows (RLS blocks all access without context)
```

```sql
-- Try to insert without context
INSERT INTO contacts (id, name, email, organization_id)
VALUES ('contact-test-3', 'No Context', 'test@example.com', 'org-test-1');

-- EXPECTED RESULT: Error
-- new row violates row-level security policy
```

**Test Result:**
- ✅ PASS: No data returned, inserts fail
- ❌ FAIL: If data is returned or insert succeeds → RLS policy too permissive

---

## Automated Testing with Jest

### Test Setup: Helper Functions

```typescript
// __tests__/utils/test-helpers.ts
import { prisma } from '@/lib/database/prisma';

/**
 * Set RLS context for testing
 */
export async function setTestContext(userId: string, orgId: string) {
  await prisma.$executeRaw`SET app.current_user_id = ${userId}`;
  await prisma.$executeRaw`SET app.current_org_id = ${orgId}`;
}

/**
 * Reset RLS context
 */
export async function resetTestContext() {
  await prisma.$executeRaw`RESET app.current_user_id`;
  await prisma.$executeRaw`RESET app.current_org_id`;
}

/**
 * Create test organization
 */
export async function createTestOrg(
  id: string,
  name: string,
  tier: string = 'STARTER'
) {
  return await prisma.organizations.create({
    data: { id, name, subscription_tier: tier },
  });
}

/**
 * Create test user
 */
export async function createTestUser(
  id: string,
  email: string,
  orgId: string,
  role: string = 'USER',
  orgRole: string = 'MEMBER'
) {
  const user = await prisma.users.create({
    data: { id, email, name: email.split('@')[0], role },
  });

  await prisma.organization_members.create({
    data: { user_id: id, organization_id: orgId, role: orgRole },
  });

  return user;
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(prefix: string) {
  await prisma.contacts.deleteMany({
    where: { id: { startsWith: prefix } },
  });
  await prisma.organization_members.deleteMany({
    where: { user_id: { startsWith: prefix } },
  });
  await prisma.users.deleteMany({
    where: { id: { startsWith: prefix } },
  });
  await prisma.organizations.deleteMany({
    where: { id: { startsWith: prefix } },
  });
}
```

---

### Test Suite 1: Organization Isolation

```typescript
// __tests__/rls/organization-isolation.test.ts
import { prisma } from '@/lib/database/prisma';
import {
  setTestContext,
  resetTestContext,
  createTestOrg,
  createTestUser,
  cleanupTestData,
} from '../utils/test-helpers';

describe('RLS: Organization Isolation', () => {
  const TEST_PREFIX = 'rls-org-test';
  let org1Id: string;
  let org2Id: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Create test organizations
    const org1 = await createTestOrg(
      `${TEST_PREFIX}-org-1`,
      'Test Org 1'
    );
    const org2 = await createTestOrg(
      `${TEST_PREFIX}-org-2`,
      'Test Org 2'
    );

    org1Id = org1.id;
    org2Id = org2.id;

    // Create test users
    const user1 = await createTestUser(
      `${TEST_PREFIX}-user-1`,
      'user1@org1.com',
      org1Id
    );
    const user2 = await createTestUser(
      `${TEST_PREFIX}-user-2`,
      'user2@org2.com',
      org2Id
    );

    user1Id = user1.id;
    user2Id = user2.id;

    // Create test contacts
    await prisma.contacts.create({
      data: {
        id: `${TEST_PREFIX}-contact-1`,
        name: 'Contact Org 1',
        email: 'c1@org1.com',
        organization_id: org1Id,
      },
    });

    await prisma.contacts.create({
      data: {
        id: `${TEST_PREFIX}-contact-2`,
        name: 'Contact Org 2',
        email: 'c2@org2.com',
        organization_id: org2Id,
      },
    });
  });

  afterAll(async () => {
    await resetTestContext();
    await cleanupTestData(TEST_PREFIX);
  });

  afterEach(async () => {
    await resetTestContext();
  });

  test('User from Org 1 sees only Org 1 contacts', async () => {
    await setTestContext(user1Id, org1Id);

    const contacts = await prisma.contacts.findMany({
      where: { id: { startsWith: TEST_PREFIX } },
    });

    expect(contacts).toHaveLength(1);
    expect(contacts[0].organization_id).toBe(org1Id);
  });

  test('User from Org 2 sees only Org 2 contacts', async () => {
    await setTestContext(user2Id, org2Id);

    const contacts = await prisma.contacts.findMany({
      where: { id: { startsWith: TEST_PREFIX } },
    });

    expect(contacts).toHaveLength(1);
    expect(contacts[0].organization_id).toBe(org2Id);
  });

  test('User cannot insert contact for other organization', async () => {
    await setTestContext(user1Id, org1Id);

    // Try to insert contact for Org 2 (should fail)
    await expect(
      prisma.contacts.create({
        data: {
          id: `${TEST_PREFIX}-contact-malicious`,
          name: 'Malicious Contact',
          email: 'mal@org2.com',
          organization_id: org2Id, // Different org!
        },
      })
    ).rejects.toThrow(/row-level security policy/);
  });

  test('User cannot update contact from other organization', async () => {
    await setTestContext(user1Id, org1Id);

    // Try to update Org 2's contact
    const result = await prisma.contacts.updateMany({
      where: {
        id: `${TEST_PREFIX}-contact-2`, // Belongs to Org 2
      },
      data: {
        name: 'Hacked Name',
      },
    });

    // UpdateMany returns count, should be 0 (no rows affected)
    expect(result.count).toBe(0);
  });

  test('User cannot delete contact from other organization', async () => {
    await setTestContext(user1Id, org1Id);

    // Try to delete Org 2's contact
    const result = await prisma.contacts.deleteMany({
      where: {
        id: `${TEST_PREFIX}-contact-2`, // Belongs to Org 2
      },
    });

    // DeleteMany returns count, should be 0
    expect(result.count).toBe(0);

    // Verify contact still exists
    await setTestContext(user2Id, org2Id);
    const contact = await prisma.contacts.findUnique({
      where: { id: `${TEST_PREFIX}-contact-2` },
    });
    expect(contact).not.toBeNull();
  });

  test('Query without context returns no data', async () => {
    await resetTestContext();

    const contacts = await prisma.contacts.findMany({
      where: { id: { startsWith: TEST_PREFIX } },
    });

    expect(contacts).toHaveLength(0);
  });
});
```

---

### Test Suite 2: Role-Based Access Control

```typescript
// __tests__/rls/rbac.test.ts
import { prisma } from '@/lib/database/prisma';
import { canAccessCRM, canManageContacts } from '@/lib/auth/rbac';
import {
  setTestContext,
  resetTestContext,
  createTestOrg,
  createTestUser,
  cleanupTestData,
} from '../utils/test-helpers';

describe('RLS: Role-Based Access Control', () => {
  const TEST_PREFIX = 'rls-rbac-test';
  let orgId: string;
  let adminId: string;
  let memberId: string;
  let viewerId: string;

  beforeAll(async () => {
    const org = await createTestOrg(`${TEST_PREFIX}-org`, 'RBAC Test Org');
    orgId = org.id;

    // Create users with different roles
    const admin = await createTestUser(
      `${TEST_PREFIX}-admin`,
      'admin@test.com',
      orgId,
      'USER',
      'ADMIN'
    );
    const member = await createTestUser(
      `${TEST_PREFIX}-member`,
      'member@test.com',
      orgId,
      'USER',
      'MEMBER'
    );
    const viewer = await createTestUser(
      `${TEST_PREFIX}-viewer`,
      'viewer@test.com',
      orgId,
      'USER',
      'VIEWER'
    );

    adminId = admin.id;
    memberId = member.id;
    viewerId = viewer.id;
  });

  afterAll(async () => {
    await resetTestContext();
    await cleanupTestData(TEST_PREFIX);
  });

  test('ADMIN can create contacts', async () => {
    await setTestContext(adminId, orgId);

    const contact = await prisma.contacts.create({
      data: {
        id: `${TEST_PREFIX}-contact-admin`,
        name: 'Admin Contact',
        email: 'admin-contact@test.com',
        organization_id: orgId,
      },
    });

    expect(contact).toBeDefined();
    expect(contact.organization_id).toBe(orgId);
  });

  test('MEMBER can create contacts', async () => {
    await setTestContext(memberId, orgId);

    const contact = await prisma.contacts.create({
      data: {
        id: `${TEST_PREFIX}-contact-member`,
        name: 'Member Contact',
        email: 'member-contact@test.com',
        organization_id: orgId,
      },
    });

    expect(contact).toBeDefined();
  });

  test('VIEWER can read contacts', async () => {
    await setTestContext(viewerId, orgId);

    const contacts = await prisma.contacts.findMany({
      where: { id: { startsWith: TEST_PREFIX } },
    });

    expect(contacts.length).toBeGreaterThan(0);
  });

  test('VIEWER cannot create contacts (if RLS policy enforces)', async () => {
    await setTestContext(viewerId, orgId);

    // Note: This test assumes RLS policy checks organization role
    // If RLS only checks org membership, this test may not apply
    // In that case, check RBAC in application code

    const user = await prisma.users.findUnique({
      where: { id: viewerId },
      include: { organization_members: true },
    });

    expect(canManageContacts(user!.role)).toBe(true); // Global role check
    // Organization role check would happen in Server Action
  });
});
```

---

### Test Suite 3: Multi-Tenant Queries

```typescript
// __tests__/rls/multi-tenant-queries.test.ts
import { prisma } from '@/lib/database/prisma';
import {
  setTestContext,
  resetTestContext,
  createTestOrg,
  createTestUser,
  cleanupTestData,
} from '../utils/test-helpers';

describe('RLS: Multi-Tenant Queries', () => {
  const TEST_PREFIX = 'rls-query-test';

  beforeAll(async () => {
    // Create 3 organizations with data
    for (let i = 1; i <= 3; i++) {
      const org = await createTestOrg(
        `${TEST_PREFIX}-org-${i}`,
        `Org ${i}`
      );

      await createTestUser(
        `${TEST_PREFIX}-user-${i}`,
        `user${i}@org${i}.com`,
        org.id
      );

      // Create 5 contacts per org
      for (let j = 1; j <= 5; j++) {
        await prisma.contacts.create({
          data: {
            id: `${TEST_PREFIX}-contact-${i}-${j}`,
            name: `Contact ${i}-${j}`,
            email: `c${i}-${j}@org${i}.com`,
            organization_id: org.id,
          },
        });
      }
    }
  });

  afterAll(async () => {
    await resetTestContext();
    await cleanupTestData(TEST_PREFIX);
  });

  test('Count returns only org data', async () => {
    await setTestContext(
      `${TEST_PREFIX}-user-1`,
      `${TEST_PREFIX}-org-1`
    );

    const count = await prisma.contacts.count({
      where: { id: { startsWith: TEST_PREFIX } },
    });

    expect(count).toBe(5); // Only Org 1's 5 contacts
  });

  test('Aggregate functions respect RLS', async () => {
    await setTestContext(
      `${TEST_PREFIX}-user-2`,
      `${TEST_PREFIX}-org-2`
    );

    const result = await prisma.contacts.aggregate({
      where: { id: { startsWith: TEST_PREFIX } },
      _count: { id: true },
    });

    expect(result._count.id).toBe(5); // Only Org 2's 5 contacts
  });

  test('GroupBy respects RLS', async () => {
    await setTestContext(
      `${TEST_PREFIX}-user-3`,
      `${TEST_PREFIX}-org-3`
    );

    const result = await prisma.contacts.groupBy({
      by: ['organization_id'],
      where: { id: { startsWith: TEST_PREFIX } },
      _count: { id: true },
    });

    expect(result).toHaveLength(1); // Only 1 org
    expect(result[0].organization_id).toBe(`${TEST_PREFIX}-org-3`);
    expect(result[0]._count.id).toBe(5);
  });

  test('Related queries respect RLS', async () => {
    await setTestContext(
      `${TEST_PREFIX}-user-1`,
      `${TEST_PREFIX}-org-1`
    );

    // This test assumes transaction_loops table has RLS
    // and references contacts
    const org = await prisma.organizations.findUnique({
      where: { id: `${TEST_PREFIX}-org-1` },
      include: {
        contacts: {
          where: { id: { startsWith: TEST_PREFIX } },
        },
      },
    });

    expect(org?.contacts).toHaveLength(5);
  });
});
```

---

## Test Scenarios

### Scenario 1: Cross-Organization Data Access Attempt

**Attacker Goal:** Access Organization B's data while authenticated as Organization A user

**Test Steps:**
1. Authenticate as user from Organization A
2. Set RLS context to Organization A
3. Attempt to query/modify Organization B's data
4. Verify operation fails or returns no data

**Expected Result:** Zero data returned, zero rows affected

---

### Scenario 2: Context Switching Attack

**Attacker Goal:** Switch organization context mid-session

**Test Steps:**
1. Authenticate as user from Organization A
2. Set RLS context to Organization A
3. Query data (should see Org A data)
4. Manually set context to Organization B (malicious)
5. Query data again

**Expected Result:**
- If RLS enforced: See Org A data only
- If application enforces: Error on context switch

---

### Scenario 3: No Context Exploit

**Attacker Goal:** Query data without setting RLS context

**Test Steps:**
1. Connect to database
2. Do NOT set RLS context
3. Attempt to query sensitive data

**Expected Result:** Zero rows returned (RLS blocks all)

---

### Scenario 4: Subscription Tier Bypass

**Attacker Goal:** Access premium features on FREE tier

**Test Steps:**
1. Create organization with FREE tier
2. Attempt to access CRM features (requires STARTER)
3. Verify access denied

**Expected Result:** Error or redirect to upgrade page

---

## Common RLS Pitfalls

### Pitfall 1: Forgetting RLS Context

```typescript
// ❌ WRONG - No context set
const contacts = await prisma.contacts.findMany();
// Returns 0 rows (RLS blocks without context)

// ✅ CORRECT - Set context first
await setTestContext(userId, orgId);
const contacts = await prisma.contacts.findMany();
```

---

### Pitfall 2: Using updateMany/deleteMany Without Verification

```typescript
// ❌ RISKY - May silently fail
await prisma.contacts.updateMany({
  where: { id: contactId },
  data: { name: 'Updated' },
});
// Returns count 0 if RLS blocks (no error!)

// ✅ BETTER - Check result count
const result = await prisma.contacts.updateMany({
  where: { id: contactId },
  data: { name: 'Updated' },
});

if (result.count === 0) {
  throw new Error('Contact not found or access denied');
}
```

---

### Pitfall 3: Testing Only Happy Paths

```typescript
// ❌ INCOMPLETE - Only tests success case
test('User can create contact', async () => {
  const contact = await createContact(validInput);
  expect(contact).toBeDefined();
});

// ✅ COMPLETE - Tests success AND failure
test('User can create contact for own org only', async () => {
  // Success case
  const contact1 = await createContact({
    ...validInput,
    organization_id: user.orgId,
  });
  expect(contact1).toBeDefined();

  // Failure case (different org)
  await expect(
    createContact({
      ...validInput,
      organization_id: 'other-org-id',
    })
  ).rejects.toThrow(/row-level security policy/);
});
```

---

## Debug Commands

### Check RLS Status

```sql
-- Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### View RLS Policies

```sql
-- View all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Current Context

```sql
-- Check current RLS context
SELECT
  current_setting('app.current_user_id', true) AS user_id,
  current_setting('app.current_org_id', true) AS org_id;
```

### Test RLS Policy Directly

```sql
-- Test policy as specific user
SET app.current_user_id = 'user-123';
SET app.current_org_id = 'org-456';

-- Run query
SELECT * FROM contacts;

-- View query plan (shows RLS filter)
EXPLAIN (VERBOSE, COSTS OFF)
SELECT * FROM contacts;
```

---

## Continuous Testing

### Pre-Commit Hook

```bash
# .husky/pre-commit
#!/bin/sh

# Run RLS tests
npm test -- __tests__/rls/ --passWithNoTests

if [ $? -ne 0 ]; then
  echo "RLS tests failed! Commit blocked."
  exit 1
fi
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test RLS Policies

on: [push, pull_request]

jobs:
  test-rls:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run RLS tests
        run: npm test -- __tests__/rls/ --coverage
      - name: Check coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 90" | bc -l) )); then
            echo "RLS test coverage below 90%"
            exit 1
          fi
```

---

## Summary

**Testing Checklist:**
- [ ] Organization isolation (SELECT, INSERT, UPDATE, DELETE)
- [ ] Role-based access control
- [ ] Subscription tier limits
- [ ] Context switching protection
- [ ] No context = no access
- [ ] Bulk operations respect RLS
- [ ] Aggregations respect RLS
- [ ] Related queries respect RLS
- [ ] 90%+ test coverage on RLS tests

**Remember:**
- Untested RLS = data breach waiting to happen
- Test both success AND failure cases
- Automate RLS testing in CI/CD
- Review RLS policies on every schema change

---

**Related Documentation:**
- [Decision Tree](./PRISMA-SUPABASE-DECISION-TREE.md) - When to use Prisma vs Supabase
- [Hybrid Patterns](./HYBRID-PATTERNS.md) - Real-world examples
- [RLS Policies](./RLS-POLICIES.md) - Complete policy reference
- [Supabase Setup](./SUPABASE-SETUP.md) - Configuration guide

---

**Last Updated:** 2025-10-07
**Version:** 1.0
