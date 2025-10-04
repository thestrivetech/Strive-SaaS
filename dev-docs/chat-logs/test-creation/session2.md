# Test Suite Implementation - Session 2 Action Plan

**Session:** 2 of 5
**Focus:** Complete Server Action Tests + Integration Tests
**Prerequisites:** Session 1 infrastructure + 30 existing tests
**Duration:** 7-9 hours | **Goal:** 85+ tests, 60%+ coverage

---

## 📋 Deliverables

**Server Actions (55 tests):**
- Auth: 10 tests
- Projects: 12 tests
- Tasks: 15 tests
- Attachments: 10 tests
- Organization: 8 tests

**Integration (20 tests):**
- User flows: 10 tests
- Database: 10 tests

**Total:** ~70 new tests → 100 total tests

---

## 🚀 IMMEDIATE SETUP (15 minutes)

### 1. Fix Dependencies
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 2. Run Database Migrations
```bash
# Automated
./__tests__/setup-fresh-test-db.sh

# OR Manual
npx prisma migrate deploy
npx prisma generate
```

### 3. Verify Existing Tests Pass
```bash
npm test
# Expected: 30 tests pass in ~2-3s
```

---

## 📝 TEST WRITING GUIDE

**Template Pattern** (use existing tests as reference):
- Copy structure from `__tests__/unit/lib/modules/crm/actions.test.ts`
- Follow AAA pattern: Arrange → Act → Assert
- Clean database in `beforeEach`
- Mock Supabase auth & external services
- Use test helpers from `test-helpers.ts`

**Key Mocking Pattern:**
```typescript
// Supabase auth
jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClientWithAuth: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'user-id', email: 'test@example.com' } },
      })),
    },
  })),
}));

// Organization queries
jest.mock('@/lib/modules/organization/queries', () => ({
  getUserOrganizations: jest.fn(() =>
    Promise.resolve([{ organizationId: 'org-id', role: 'OWNER' }])
  ),
}));

// Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
```

---

## 🧪 PHASE 2: SERVER ACTION TESTS (7 hours)

### 2.1 Auth Actions (10 tests, 1.5h)
**File:** `__tests__/unit/lib/modules/auth/actions.test.ts`

**Functions to test:**
- `signUp()` - Create user in Supabase + DB
- `signIn()` - Authenticate credentials
- `signOut()` - Clear session
- `getCurrentUser()` - Fetch user with orgs
- `requireAuth()` - Redirect if unauthenticated
- `requireRole()` - Check role permissions

**Key tests:**
1. signUp: creates user, validates email, handles errors (3 tests)
2. signIn: valid/invalid credentials, creates missing user (3 tests)
3. signOut: clears session (1 test)
4. getCurrentUser: returns user or null (2 tests)
5. requireAuth/requireRole: returns or redirects (3 tests)

**Special considerations:**
- Mock `redirect()` from `next/navigation`
- Test admin bypass in `requireRole()`

---

### 2.2 Project Actions (12 tests, 1.5h)
**File:** `__tests__/unit/lib/modules/projects/actions.test.ts`

**Functions:** `createProject()`, `updateProject()`, `deleteProject()`

**Key tests:**
1. **createProject (5):**
   - Creates successfully with all fields
   - Validates required: name, orgId, managerId
   - Links to customer if provided
   - Validates dueDate > startDate
   - Creates activity log

2. **updateProject (4):**
   - Updates fields
   - Status transitions (PLANNING → IN_PROGRESS → COMPLETED)
   - Progress percentage (0-100)
   - Prevents unauthorized update

3. **deleteProject (3):**
   - Deletes successfully
   - Cascades to tasks
   - Prevents unauthorized delete

**Reference:** Similar to CRM tests pattern

---

### 2.3 Task Actions (15 tests, 2h)
**File:** `__tests__/unit/lib/modules/tasks/actions.test.ts`

**Functions:** `createTask()`, `updateTask()`, `deleteTask()`, `bulkUpdateTasks()`

**Key tests:**
1. **createTask (5):**
   - Creates with all fields
   - Assigns to user
   - Default status: TODO
   - Validates priority (LOW/MEDIUM/HIGH/URGENT)
   - Supports subtasks (parentTaskId)

2. **updateTask (5):**
   - Updates fields
   - Status progression (TODO → IN_PROGRESS → DONE)
   - Reassigns user
   - Updates due date
   - Tracks actualHours vs estimatedHours

3. **bulkUpdateTasks (3):**
   - Updates multiple tasks
   - Handles partial failures
   - Returns updated count

4. **deleteTask (2):**
   - Deletes task
   - Handles subtasks (cascade or set null)

---

### 2.4 Attachment Actions (10 tests, 1.5h)
**File:** `__tests__/unit/lib/modules/attachments/actions.test.ts`

**Functions:** `uploadAttachment()`, `deleteAttachment()`, `getAttachments()`

**Special:** Mock Supabase Storage
```typescript
const mockUpload = jest.fn();
const mockRemove = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://storage.example.com/file.pdf' }
        })),
      })),
    },
  })),
}));
```

**Key tests:**
1. **uploadAttachment (5):**
   - Uploads successfully
   - Validates file type (whitelist: pdf, doc, jpg, png)
   - Validates file size (max 10MB)
   - Handles Supabase errors
   - Generates unique filenames

2. **deleteAttachment (3):**
   - Deletes from storage
   - Deletes DB record
   - Handles missing files gracefully

3. **getAttachments (2):**
   - Lists by entity
   - Respects organization boundaries

---

### 2.5 Organization Actions (8 tests, 1h)
**File:** `__tests__/unit/lib/modules/organization/actions.test.ts`

**Functions:** `createOrganization()`, `updateOrganization()`, member management

**Key tests:**
1. **createOrganization (3):**
   - Creates successfully
   - Generates unique slug (handle duplicates)
   - Sets creator as OWNER

2. **updateOrganization (2):**
   - Updates fields
   - Prevents slug conflicts

3. **Member Management (3):**
   - Adds member with role
   - Updates member role
   - Removes member (prevents last owner)

---

## 🔗 PHASE 3: INTEGRATION TESTS (3 hours)

### 3.1 User Flow Tests (10 tests, 2h)

**File 1:** `__tests__/integration/flows/crm-lifecycle.test.ts`

**Main test: Complete customer lifecycle (1 comprehensive test)**
```typescript
it('should complete full customer lifecycle', async () => {
  // 1. Create org + users
  // 2. Create customer (LEAD)
  // 3. Convert to PROSPECT
  // 4. Create project
  // 5. Convert to ACTIVE
  // 6. Create tasks
  // 7. Work on tasks (TODO → IN_PROGRESS → DONE)
  // 8. Update project progress
  // 9. Complete project
  // 10. Verify final state
});
```

**Additional tests (9):**
- Project with tasks workflow
- Task status progression
- Customer with multiple projects
- Subtasks workflow
- Bulk operations
- Notification triggers
- Activity logging
- File attachments
- Project completion

**File 2:** `__tests__/integration/flows/multi-tenant.test.ts`

**Multi-tenant isolation (5 tests):**
- Prevent cross-org data access
- Enforce RLS-like behavior
- Organization member permissions
- Shared resources isolation
- Cascade deletes stay within org

---

### 3.2 Database Tests (10 tests, 1h)

**File 1:** `__tests__/integration/database/transactions.test.ts`

**Prisma transactions (5 tests):**
- Commits all on success
- Rolls back all on error
- Handles concurrent transactions
- Prevents deadlocks
- Maintains ACID properties

**File 2:** `__tests__/integration/database/cascade.test.ts`

**Cascade deletes (5 tests):**
- Organization → all related data
- Customer → Projects → Tasks
- Project → Tasks → Attachments
- User → Activity logs (not orphan data)
- Selective cascades verification

---

## ✅ SUCCESS CRITERIA

**Code Quality:**
- [ ] All 100 tests pass (100% success rate)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Consistent patterns with existing tests

**Coverage:**
- [ ] Overall: 60%+
- [ ] Server Actions: 90%+
- [ ] Each module: 80%+

**Test Quality:**
- [ ] AAA pattern followed
- [ ] Database cleaned between tests
- [ ] Clear, descriptive names
- [ ] Edge cases covered
- [ ] Error paths tested

---

## 🔍 VERIFICATION

### After Each Module
```bash
npm test -- <module-name>
npm run test:coverage -- <module-name>
```

### Final Check
```bash
npm test
npm run test:coverage
open coverage/index.html
```

### Expected Output
```
Test Suites: 10 passed, 10 total
Tests:       100 passed, 100 total
Time:        5-10s
Coverage:    60%+ all metrics
```

---

## 🚨 QUICK TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Tests timeout | Add timeout param: `it('test', async () => {...}, 10000)` |
| DB connection fails | `npx prisma migrate deploy && npx prisma generate` |
| Mock not working | `jest.clearAllMocks()` in `beforeEach` |
| Coverage low | Run `npm run test:coverage`, open HTML, write tests for red lines |

---

## 📊 SESSION 2 CHECKLIST

**Pre-Session:**
- [ ] Fix confbox dependency
- [ ] Run database migrations
- [ ] Verify 30 tests pass

**Test Writing:**
- [ ] Auth actions (10)
- [ ] Project actions (12)
- [ ] Task actions (15)
- [ ] Attachment actions (10)
- [ ] Organization actions (8)
- [ ] CRM lifecycle (10)
- [ ] Multi-tenant (5)
- [ ] Database (10)

**Quality:**
- [ ] All tests pass
- [ ] 60%+ coverage
- [ ] No errors/warnings

**Documentation:**
- [ ] Session 2 summary created

---

## 📁 FILES TO CREATE

1. `__tests__/unit/lib/modules/auth/actions.test.ts`
2. `__tests__/unit/lib/modules/projects/actions.test.ts`
3. `__tests__/unit/lib/modules/tasks/actions.test.ts`
4. `__tests__/unit/lib/modules/attachments/actions.test.ts`
5. `__tests__/unit/lib/modules/organization/actions.test.ts`
6. `__tests__/integration/flows/crm-lifecycle.test.ts`
7. `__tests__/integration/flows/multi-tenant.test.ts`
8. `__tests__/integration/database/transactions.test.ts`
9. `__tests__/integration/database/cascade.test.ts`
10. `chat-logs/test-creation/session2_summary.md`

---

## ⏭️ SESSIONS 3-5 PREVIEW

**Session 3:** Component Tests
- UI components (25 tests)
- Feature components (20 tests)
- Target: 75%+ coverage

**Session 4:** Coverage Achievement
- Fill gaps to 80%+
- Performance optimization
- Quality improvements

**Session 5:** CI/CD
- GitHub Actions
- Pre-commit hooks
- Branch protection
- Final polish

---

**Ready to Begin!** 🚀

Start with immediate setup, then write tests module by module. Use `crm/actions.test.ts` and `notifications/actions.test.ts` as templates. Good luck!
