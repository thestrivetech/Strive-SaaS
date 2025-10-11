# Session 2.3: Fix Test Suite (CRM + Transactions)

**Phase:** 2 - MVP Deployment
**Priority:** 🟡 HIGH
**Estimated Time:** 2 hours
**Agent:** `strive-agent-universal`

---

## 🎯 OBJECTIVE

Fix TypeScript errors in test files and ensure CRM + Transactions modules have passing tests with 80%+ coverage.

**Current State:**
- ❌ 28 TypeScript errors in test files
- ❌ Test fixtures outdated (reference old mock data)
- ❌ Integration tests may be broken

**Target State:**
- ✅ Zero TypeScript errors in tests
- ✅ CRM tests passing (80%+ coverage)
- ✅ Transactions tests passing (80%+ coverage)
- ✅ Fixtures aligned with current schema

---

## 📋 TASK FOR AGENT

```markdown
FIX TEST SUITE for MVP modules (CRM + Transactions) in (platform) project

**Context:**
Test suite references old mock data structures and has TypeScript errors.
Need to update fixtures to match current Prisma schema and ensure tests pass.

**Requirements:**

1. **Find All Test Errors:**
   ```bash
   cd (platform)

   # Run tests to see errors
   npm test 2>&1 | tee test-errors.txt

   # TypeScript check on test files
   npx tsc --noEmit | grep -i test

   # List all test files
   find __tests__ -name "*.test.ts" -o -name "*.test.tsx"
   ```

2. **Review Current Schema:**

   **Read FIRST (99% token savings):**
   ```bash
   # DO NOT use MCP list_tables tool (18k tokens!)
   # Read local documentation instead:

   cat prisma/SCHEMA-QUICK-REF.md      # Model names
   cat prisma/SCHEMA-MODELS.md         # Model fields
   cat prisma/SCHEMA-ENUMS.md          # Enum values
   ```

   **Key Models for Tests:**
   - User, Organization, OrganizationMember (Core)
   - Contact, Lead, Customer, Deal (CRM)
   - Task, Milestone, Listing, Activity (Transactions)

3. **Update Test Fixtures:**

   **Location:** `__tests__/fixtures/` or `lib/test/fixtures/`

   **Pattern - Old Fixtures (Mock Data):**
   ```typescript
   // ❌ OLD: References mock provider types
   export const mockContact = {
     id: '1',
     name: 'Test Contact',
     // ... mock fields
   };
   ```

   **Pattern - New Fixtures (Schema-Aligned):**
   ```typescript
   // ✅ NEW: Matches Prisma schema exactly
   import { Contact } from '@prisma/client';

   export const testContact: Partial<Contact> = {
     id: 'contact-test-1',
     organization_id: 'org-test-1',
     full_name: 'Test Contact',
     email: 'test@example.com',
     phone: '+1234567890',
     status: 'ACTIVE',
     type: 'PROSPECT',
     created_at: new Date(),
     updated_at: new Date(),
   };
   ```

   **Update Fixtures For:**
   - Contacts
   - Leads
   - Customers
   - Deals
   - Tasks
   - Milestones
   - Listings
   - Activities

4. **Fix TypeScript Errors in Tests:**

   **Common Errors:**

   **Error: Type mismatch**
   ```typescript
   // ❌ WRONG:
   const contact = mockContactProvider.findById('1');
   // Type error: mockContactProvider doesn't exist

   // ✅ FIX:
   const contact = await prisma.contact.findUnique({
     where: { id: 'contact-test-1' }
   });
   ```

   **Error: Missing fields**
   ```typescript
   // ❌ WRONG:
   const contact = { name: 'Test' }; // Missing required fields

   // ✅ FIX:
   const contact = {
     id: 'test-1',
     organization_id: 'org-1',
     full_name: 'Test',
     // ... all required fields
   };
   ```

   **Error: Enum values**
   ```typescript
   // ❌ WRONG:
   status: 'active' // Wrong enum value

   // ✅ FIX:
   status: 'ACTIVE' // Correct enum from schema
   ```

5. **Update Test Database Setup:**

   **Pattern - Test Database:**
   ```typescript
   // __tests__/setup.ts
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient({
     datasourceUrl: process.env.TEST_DATABASE_URL,
   });

   beforeAll(async () => {
     // Clear test database
     await prisma.$executeRaw`TRUNCATE TABLE contacts CASCADE`;
     // ... other tables
   });

   afterEach(async () => {
     // Clean up after each test
     await prisma.contact.deleteMany();
     // ... other tables
   });

   afterAll(async () => {
     await prisma.$disconnect();
   });
   ```

6. **Focus on MVP Module Tests:**

   **CRM Module Tests:**
   ```bash
   npm test -- lib/modules/crm          # All CRM tests
   npm test -- lib/modules/crm/contacts # Contact tests
   npm test -- lib/modules/crm/leads    # Lead tests
   npm test -- lib/modules/crm/customers # Customer tests
   npm test -- lib/modules/crm/deals    # Deal tests
   ```

   **Transactions Module Tests:**
   ```bash
   npm test -- lib/modules/transactions
   npm test -- lib/modules/transactions/tasks
   npm test -- lib/modules/transactions/milestones
   ```

7. **Coverage Requirements:**
   ```bash
   # Run with coverage
   npm test -- --coverage --collectCoverageFrom='lib/modules/crm/**/*.{ts,tsx}'
   npm test -- --coverage --collectCoverageFrom='lib/modules/transactions/**/*.{ts,tsx}'

   # MUST achieve:
   # - Statements: 80%+
   # - Branches: 80%+
   # - Functions: 80%+
   # - Lines: 80%+
   ```

8. **Verification (REQUIRED):**
   ```bash
   cd (platform)

   # TypeScript check
   npx tsc --noEmit

   # All tests
   npm test

   # CRM tests specifically
   npm test -- lib/modules/crm

   # Transactions tests specifically
   npm test -- lib/modules/transactions

   # Coverage report
   npm test -- --coverage

   # Build (ensure tests don't break build)
   npm run build
   ```

**DO NOT report success unless:**
- Zero TypeScript errors in test files
- All CRM module tests passing
- All Transactions module tests passing
- 80%+ code coverage for both modules
- Test fixtures match current schema
- No test database errors
- Build succeeds after test fixes

**Return Format:**
## ✅ EXECUTION REPORT

**Test Files Fixed:** [count]
- __tests__/lib/modules/crm/contacts.test.ts - Fixed [count] errors
- __tests__/lib/modules/crm/leads.test.ts - Fixed [count] errors
- [complete list]

**Fixtures Updated:**
- testContact - Aligned with Contact schema
- testLead - Aligned with Lead schema
- testCustomer - Aligned with Customer schema
- [complete list]

**Test Results:**
```
[Paste ACTUAL test outputs]

CRM Module Tests:
Test Suites: X passed, X total
Tests: X passed, X total
Coverage:
  Statements: X%
  Branches: X%
  Functions: X%
  Lines: X%

Transactions Module Tests:
Test Suites: X passed, X total
Tests: X passed, X total
Coverage:
  Statements: X%
  Branches: X%
  Functions: X%
  Lines: X%
```

**Verification Results:**
```
npx tsc --noEmit:
[output - should show ZERO errors]

npm test:
[summary - all tests passing]

npm run build:
[output - successful build]
```

**Issues Found:** NONE / [list any remaining issues]
```

---

## 🔒 SECURITY REQUIREMENTS

**Test Database:**
- Use separate test database (TEST_DATABASE_URL)
- Never run tests against production database
- Clear test data between tests

**Test Data:**
- Use mock organizationIds consistently
- Don't commit real user data to tests
- Use realistic but fake data (emails, names, etc.)

---

## 🧪 VERIFICATION CHECKLIST

Agent must provide proof of:
- [ ] TypeScript check passes
- [ ] All CRM tests passing
- [ ] All Transactions tests passing
- [ ] 80%+ coverage achieved
- [ ] Build succeeds
- [ ] Test output shows detailed results

---

## 📊 SUCCESS CRITERIA

✅ **SESSION COMPLETE when:**
- Zero TypeScript errors in test files
- CRM module: All tests passing + 80%+ coverage
- Transactions module: All tests passing + 80%+ coverage
- Fixtures updated to match schema
- Build succeeds
- Agent provides complete verification outputs

---

## 🚨 COMMON PITFALLS

**Avoid:**
- ❌ Skipping tests instead of fixing them
- ❌ Using production database for tests
- ❌ Hardcoding test IDs that conflict
- ❌ Not cleaning up test data between tests
- ❌ Mock data not matching schema

**Best Practices:**
- ✅ Use TEST_DATABASE_URL environment variable
- ✅ Clear database before/after each test
- ✅ Use Prisma types for test data
- ✅ Follow schema exactly (fields, enums, relationships)
- ✅ Test both success and error cases

---

## 🚨 FAILURE RECOVERY

**If agent reports issues:**

**Issue: Test database connection fails**
→ Check TEST_DATABASE_URL is set
→ Verify test database exists
→ Run prisma migrate on test DB

**Issue: Type errors persist**
→ Regenerate Prisma client: `npx prisma generate`
→ Check test imports match schema types
→ Verify @prisma/client version

**Issue: Tests fail after schema update**
→ Re-read SCHEMA-MODELS.md for current fields
→ Update fixtures to match exactly
→ Check enum values are correct (uppercase)

**Issue: Coverage below 80%**
→ Identify uncovered code: `npm test -- --coverage --verbose`
→ Add tests for uncovered branches
→ Test error handling paths

**Max attempts:** 3 (tests can be tricky)

---

## 📚 DATABASE WORKFLOW (TOKEN EFFICIENT)

**✅ ALWAYS: Read local docs**
```bash
cat prisma/SCHEMA-QUICK-REF.md   # 100 tokens
cat prisma/SCHEMA-MODELS.md      # 300 tokens
cat prisma/SCHEMA-ENUMS.md       # 100 tokens
# Total: ~500 tokens
```

**❌ NEVER: Use MCP list_tables**
```
MCP list_tables call: 18,000-21,000 tokens
Savings: 97-99% reduction by using local docs!
```

---

**Created:** 2025-10-10
**Dependencies:** Phase 1 complete
**Next Session:** 2.4 - Pre-deployment Verification
