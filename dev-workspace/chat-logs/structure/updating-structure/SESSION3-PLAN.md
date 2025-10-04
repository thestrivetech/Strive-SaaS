# Session 3: Real Estate Business Logic - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** Session 1 ✅ Complete, Session 2 ✅ Complete
**Parallel Safe:** Yes (can run alongside SESSION7, SESSION8)

---

## 🎯 Session Objectives

Create business logic (actions, queries, schemas) for the real estate industry to support the existing UI components in `components/(platform)/real-estate/`.

**What Exists:**
- ✅ `components/(platform)/real-estate/crm/` - 7 component files
- ✅ `components/(platform)/real-estate/tasks/` - 7 component files
- ✅ `lib/industries/real-estate/config.ts` - Industry configuration
- ✅ `lib/industries/real-estate/types.ts` - Type definitions

**What's Missing:**
- ❌ `lib/industries/real-estate/overrides/crm/` - CRM business logic
- ❌ `lib/industries/real-estate/overrides/tasks/` - Tasks business logic
- ❌ Tests for all overrides

---

## 📋 Task Breakdown

### Phase 1: Real Estate CRM Overrides (1 hour)

**Directory:** `lib/industries/real-estate/overrides/crm/`

#### File 1: `schemas.ts`
- [ ] Import Zod and base Customer types
- [ ] Create `RealEstateCustomerSchema` extending base
- [ ] Add real estate-specific fields:
  - `buyerType` (buyer, seller, both)
  - `priceRange` (min/max)
  - `preferredLocations` (string array)
  - `propertyPreferences` (JSON)
  - `preApprovalAmount` (number, optional)
  - `agentNotes` (text)
- [ ] Create `CreateRealEstateCustomerSchema`
- [ ] Create `UpdateRealEstateCustomerSchema`
- [ ] Create `RealEstateCustomerFiltersSchema`
- [ ] Export all schemas

**Success Criteria:**
- All schemas properly typed with Zod
- Extends base Customer schema
- Validates real estate-specific fields

---

#### File 2: `queries.ts`
- [ ] Import Prisma client and schemas
- [ ] Import 'server-only' at top
- [ ] Create `getRealEstateCustomers()` - list with filters
  - Support buyerType filter
  - Support priceRange filter
  - Support location filter
  - Return Customer + real estate fields
- [ ] Create `getRealEstateCustomerById(id)` - single customer
  - Include related properties (if implemented)
  - Include transaction history
- [ ] Create `getRealEstateCustomerStats(orgId)` - metrics
  - Total buyers
  - Total sellers
  - Average price range
  - Active listings count
- [ ] Create `searchRealEstateCustomers(query)` - search
  - Search by name, email, phone
  - Search by location preferences
  - Search by price range

**Success Criteria:**
- All queries use Prisma ORM
- Multi-tenancy enforced (organizationId filtering)
- Proper error handling
- Type-safe returns

---

#### File 3: `actions.ts`
- [ ] Add `'use server'` directive at top
- [ ] Import schemas, queries, validation utilities
- [ ] Create `createRealEstateCustomer()` - server action
  - Validate with CreateRealEstateCustomerSchema
  - Enforce user auth and org membership
  - Store real estate fields in Customer.customFields (JSON)
  - Return success with new customer ID
- [ ] Create `updateRealEstateCustomer()` - server action
  - Validate with UpdateRealEstateCustomerSchema
  - Verify customer ownership
  - Update real estate fields
  - Return success
- [ ] Create `deleteRealEstateCustomer()` - server action
  - Verify ownership
  - Soft delete (set deletedAt)
  - Return success
- [ ] Create `assignPropertyToCustomer()` - server action
  - Link property to customer
  - Update customer status
- [ ] Create `updateCustomerPreferences()` - server action
  - Update property preferences
  - Update search criteria

**Success Criteria:**
- All actions have 'use server' directive
- Input validation with Zod
- Auth/org checks on every action
- Proper error responses
- Returns type-safe data

---

#### File 4: `index.ts`
- [ ] Export all schemas from `./schemas`
- [ ] Export all queries from `./queries`
- [ ] Export all actions from `./actions`
- [ ] Create public API for real estate CRM

---

### Phase 2: Real Estate Tasks Overrides (1 hour)

**Directory:** `lib/industries/real-estate/overrides/tasks/`

#### File 1: `schemas.ts`
- [ ] Import Zod and base Task types
- [ ] Create `RealEstateTaskSchema` extending base
- [ ] Add real estate-specific fields:
  - `propertyId` (optional reference)
  - `customerId` (reference to buyer/seller)
  - `taskType` (showing, inspection, closing, paperwork)
  - `propertyAddress` (string, optional)
  - `appointmentDate` (DateTime, optional)
  - `documents` (JSON array, optional)
- [ ] Create `CreateRealEstateTaskSchema`
- [ ] Create `UpdateRealEstateTaskSchema`
- [ ] Create `RealEstateTaskFiltersSchema`
- [ ] Export all schemas

**Success Criteria:**
- Extends base Task schema
- Real estate-specific task types defined
- Property/customer linkage supported

---

#### File 2: `queries.ts`
- [ ] Import Prisma client and schemas
- [ ] Import 'server-only' at top
- [ ] Create `getRealEstateTasks()` - list with filters
  - Filter by taskType
  - Filter by propertyId
  - Filter by customerId
  - Filter by appointmentDate range
  - Include customer details
  - Include property details
- [ ] Create `getRealEstateTaskById(id)` - single task
  - Include full customer data
  - Include property data
  - Include attachments
- [ ] Create `getRealEstateTaskStats(orgId)` - metrics
  - Tasks by type
  - Upcoming appointments
  - Overdue tasks
  - Tasks by property
- [ ] Create `getUpcomingAppointments(userId, days)` - calendar
  - Filter by appointment date
  - Group by date
  - Include customer info

**Success Criteria:**
- All queries use Prisma ORM
- Multi-tenancy enforced
- Proper joins for related data
- Type-safe returns

---

#### File 3: `actions.ts`
- [ ] Add `'use server'` directive at top
- [ ] Import schemas, queries, validation utilities
- [ ] Create `createRealEstateTask()` - server action
  - Validate with CreateRealEstateTaskSchema
  - Enforce auth and org membership
  - Store real estate fields in Task.customFields (JSON)
  - Create appointment if appointmentDate provided
  - Send notification to assigned user
  - Return success
- [ ] Create `updateRealEstateTask()` - server action
  - Validate with UpdateRealEstateTaskSchema
  - Verify task ownership
  - Update appointment if date changed
  - Return success
- [ ] Create `deleteRealEstateTask()` - server action
  - Verify ownership
  - Cancel appointment if exists
  - Soft delete
  - Return success
- [ ] Create `linkTaskToProperty()` - server action
  - Associate task with property
  - Update task metadata
- [ ] Create `uploadTaskDocuments()` - server action
  - Handle document uploads
  - Store in Supabase Storage
  - Link to task

**Success Criteria:**
- All actions have 'use server' directive
- Input validation with Zod
- Auth/org checks
- Appointment integration
- Notification triggers

---

#### File 4: `index.ts`
- [ ] Export all schemas from `./schemas`
- [ ] Export all queries from `./queries`
- [ ] Export all actions from `./actions`
- [ ] Create public API for real estate tasks

---

### Phase 3: Testing (30-45 minutes)

**Directory:** `__tests__/lib/industries/real-estate/overrides/`

#### File 1: `crm/actions.test.ts`
- [ ] Test `createRealEstateCustomer()` success
- [ ] Test `createRealEstateCustomer()` validation errors
- [ ] Test `createRealEstateCustomer()` auth failure
- [ ] Test `updateRealEstateCustomer()` success
- [ ] Test `updateRealEstateCustomer()` ownership check
- [ ] Test `deleteRealEstateCustomer()` success
- [ ] Test `assignPropertyToCustomer()` success
- [ ] Mock Prisma client for all tests

**Coverage Target:** 80%+

---

#### File 2: `crm/queries.test.ts`
- [ ] Test `getRealEstateCustomers()` with filters
- [ ] Test `getRealEstateCustomerById()` success
- [ ] Test `getRealEstateCustomerById()` not found
- [ ] Test `getRealEstateCustomerStats()` calculations
- [ ] Test `searchRealEstateCustomers()` results
- [ ] Mock Prisma for all queries

**Coverage Target:** 80%+

---

#### File 3: `tasks/actions.test.ts`
- [ ] Test `createRealEstateTask()` success
- [ ] Test `createRealEstateTask()` with appointment
- [ ] Test `createRealEstateTask()` validation
- [ ] Test `updateRealEstateTask()` success
- [ ] Test `deleteRealEstateTask()` success
- [ ] Test `linkTaskToProperty()` success
- [ ] Mock Prisma client for all tests

**Coverage Target:** 80%+

---

#### File 4: `tasks/queries.test.ts`
- [ ] Test `getRealEstateTasks()` with filters
- [ ] Test `getRealEstateTaskById()` success
- [ ] Test `getRealEstateTaskStats()` calculations
- [ ] Test `getUpcomingAppointments()` date filtering
- [ ] Mock Prisma for all queries

**Coverage Target:** 80%+

---

### Phase 4: Integration & Verification (15 minutes)

- [ ] Run TypeScript compiler: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Run all tests: `npm test -- --coverage`
- [ ] Verify 80%+ coverage achieved
- [ ] Update `lib/industries/real-estate/index.ts` to export overrides
- [ ] Verify no cross-module imports
- [ ] Verify all files under 500 lines

---

## 📊 Files to Create

### Business Logic Files (8 files)
```
lib/industries/real-estate/overrides/
├── crm/
│   ├── schemas.ts          # ✅ Create
│   ├── queries.ts          # ✅ Create
│   ├── actions.ts          # ✅ Create
│   └── index.ts            # ✅ Create
└── tasks/
    ├── schemas.ts          # ✅ Create
    ├── queries.ts          # ✅ Create
    ├── actions.ts          # ✅ Create
    └── index.ts            # ✅ Create
```

### Test Files (4 files)
```
__tests__/lib/industries/real-estate/overrides/
├── crm/
│   ├── actions.test.ts     # ✅ Create
│   └── queries.test.ts     # ✅ Create
└── tasks/
    ├── actions.test.ts     # ✅ Create
    └── queries.test.ts     # ✅ Create
```

**Total:** 12 new files

---

## 🎯 Success Criteria

- [ ] All 8 business logic files created
- [ ] All 4 test files created
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] Test coverage ≥ 80%
- [ ] All files under 500 lines
- [ ] No cross-module imports
- [ ] 'server-only' imported in all queries
- [ ] 'use server' directive in all actions
- [ ] All inputs validated with Zod
- [ ] Multi-tenancy enforced everywhere
- [ ] Proper error handling throughout

---

## 🔗 Integration Points

### With Existing Components
- `components/(platform)/real-estate/crm/create-customer-dialog.tsx` → calls `createRealEstateCustomer()`
- `components/(platform)/real-estate/crm/edit-customer-dialog.tsx` → calls `updateRealEstateCustomer()`
- `components/(platform)/real-estate/crm/delete-customer-dialog.tsx` → calls `deleteRealEstateCustomer()`
- `components/(platform)/real-estate/crm/customer-filters.tsx` → uses `RealEstateCustomerFiltersSchema`
- `components/(platform)/real-estate/tasks/create-task-dialog.tsx` → calls `createRealEstateTask()`
- `components/(platform)/real-estate/tasks/edit-task-dialog.tsx` → calls `updateRealEstateTask()`
- `components/(platform)/real-estate/tasks/task-filters.tsx` → uses `RealEstateTaskFiltersSchema`

### With Base Modules
- Extends `lib/modules/crm/` base functionality
- Extends `lib/modules/tasks/` base functionality
- Uses shared validation from `lib/validation.ts`
- Uses shared types from `@prisma/client`

---

## 📝 Implementation Notes

### Database Storage Strategy
Since Prisma schema doesn't have industry-specific tables yet, store industry-specific fields in JSON columns:
- `Customer.customFields` → Real estate customer data
- `Task.customFields` → Real estate task data

**Example:**
```typescript
await prisma.customer.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    organizationId: orgId,
    customFields: {
      buyerType: "buyer",
      priceRange: { min: 300000, max: 500000 },
      preferredLocations: ["Downtown", "Suburbs"],
      preApprovalAmount: 450000,
    },
  },
});
```

### Multi-Tenancy Pattern
Every query/action MUST filter by organizationId:
```typescript
// ✅ Correct
const customers = await prisma.customer.findMany({
  where: {
    organizationId: user.organizationId,
    // ... other filters
  },
});

// ❌ Wrong - Missing org filter
const customers = await prisma.customer.findMany({
  where: { status: "ACTIVE" },
});
```

### Error Handling Pattern
```typescript
try {
  const data = await schema.parse(input);
  // ... business logic
  return { success: true, data };
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false, error: "Validation failed", details: error.errors };
  }
  return { success: false, error: "Internal server error" };
}
```

---

## 🚀 Quick Start Command

```bash
# Start this session with:
npx tsc --noEmit && npm run lint && npm test -- --coverage
```

**Then create files in this order:**
1. Schemas first (foundation)
2. Queries second (read operations)
3. Actions third (write operations)
4. Tests last (validation)

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ Session 1: `lib/industries/real-estate/` foundation
- ✅ Session 2: `components/(shared)/ui/` structure

**Blocks (must complete before):**
- None (parallel-safe)

**Enables (what this unblocks):**
- SESSION4: Can create routes that use these actions
- SESSION5: Can build management UI with real data
- SESSION9: Can run integration tests

---

## 📖 Reference Files

**Read before starting:**
- `lib/modules/crm/actions.ts` - Base CRM pattern
- `lib/modules/tasks/actions.ts` - Base tasks pattern
- `lib/industries/real-estate/types.ts` - Type definitions
- `lib/industries/real-estate/config.ts` - Industry configuration
- `CLAUDE.md` - Development standards

**Components that will use this:**
- `components/(platform)/real-estate/crm/*.tsx` - All CRM components
- `components/(platform)/real-estate/tasks/*.tsx` - All task components

---

**Last Updated:** 2025-10-03
**Status:** ⏸️ Ready to Execute
