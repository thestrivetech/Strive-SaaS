# Session 6: Expense Table & Add Expense Modal - Implementation Checklist

## Phase 1: Backend Module - Expense CRUD ⏳ ACTIVE

### 1.1 Create Expense Schemas
- [ ] Create `lib/modules/expenses/expenses/schemas.ts`
  - [ ] ExpenseSchema (Zod validation for create/update)
  - [ ] ExpenseFilterSchema (for table filtering)
  - [ ] Export TypeScript types

### 1.2 Create Expense Queries
- [ ] Create `lib/modules/expenses/expenses/queries.ts`
  - [ ] getExpenses() - with pagination and filtering
  - [ ] getExpenseById() - single expense fetch
  - [ ] Include organizationId filtering (multi-tenancy)

### 1.3 Create Expense Actions
- [ ] Create `lib/modules/expenses/expenses/actions.ts`
  - [ ] createExpense() - Server Action with RBAC
  - [ ] updateExpense() - Server Action with RBAC
  - [ ] deleteExpense() - Server Action with RBAC
  - [ ] All actions require auth and org validation

### 1.4 Create Public API
- [ ] Create `lib/modules/expenses/expenses/index.ts`
  - [ ] Export actions (create, update, delete)
  - [ ] Export queries (get, getById)
  - [ ] Export schemas
  - [ ] Export types

### 1.5 Update Module Index
- [ ] Update `lib/modules/expenses/index.ts`
  - [ ] Add expense CRUD exports

## Phase 2: Receipt Upload Module

### 2.1 Create Receipt Actions
- [ ] Create `lib/modules/expenses/receipts/actions.ts`
  - [ ] uploadReceipt() - Supabase Storage upload
  - [ ] deleteReceipt() - Remove from storage
  - [ ] generateSignedUrl() - Secure access

### 2.2 Create Receipt Schemas
- [ ] Create `lib/modules/expenses/receipts/schemas.ts`
  - [ ] ReceiptUploadSchema
  - [ ] File validation (size, type)

### 2.3 Create Public API
- [ ] Create `lib/modules/expenses/receipts/index.ts`
  - [ ] Export upload/delete actions

## Phase 3: Table Components

### 3.1 Create Expense Table
- [ ] Create `components/real-estate/expense-tax/tables/ExpenseTable.tsx`
  - [ ] Client component with TanStack Query
  - [ ] Category filter dropdown
  - [ ] Add Expense button
  - [ ] Table header with columns
  - [ ] Loading skeleton
  - [ ] Empty state
  - [ ] Error state

### 3.2 Create Table Row
- [ ] Create `components/real-estate/expense-tax/tables/ExpenseTableRow.tsx`
  - [ ] Display: date, merchant, category, property, amount
  - [ ] Currency formatting (Intl.NumberFormat)
  - [ ] Date formatting (Intl.DateTimeFormat)
  - [ ] Row actions dropdown (edit, view receipt, delete)
  - [ ] Delete confirmation
  - [ ] Loading state during mutations

## Phase 4: Form Components

### 4.1 Create Add Expense Modal
- [ ] Create `components/real-estate/expense-tax/forms/AddExpenseModal.tsx`
  - [ ] Dialog component (shadcn/ui)
  - [ ] React Hook Form + Zod validation
  - [ ] Form fields: date, merchant, category, amount, notes, isDeductible
  - [ ] Submit handler calling createExpense
  - [ ] Success/error toast notifications
  - [ ] Loading state during submission

### 4.2 Create Receipt Upload Component
- [ ] Create `components/real-estate/expense-tax/forms/ReceiptUpload.tsx`
  - [ ] File input with drag-and-drop
  - [ ] Image/PDF preview
  - [ ] File size validation (max 10MB)
  - [ ] Accepted types: image/*, .pdf
  - [ ] Remove file functionality

## Phase 5: Integration

### 5.1 Update Dashboard Page
- [ ] Update `app/real-estate/expense-tax/dashboard/page.tsx`
  - [ ] Import ExpenseTable
  - [ ] Add Suspense boundary
  - [ ] Place below ExpenseKPIs

## Phase 6: Testing & Verification

### 6.1 TypeScript Check
- [ ] Run `npx tsc --noEmit`
- [ ] Fix all type errors

### 6.2 Linting
- [ ] Run `npm run lint`
- [ ] Fix errors (warnings acceptable)

### 6.3 Build Check
- [ ] Run `npm run build`
- [ ] Ensure zero errors

### 6.4 Manual Testing
- [ ] Test category filtering
- [ ] Test add expense (with receipt)
- [ ] Test add expense (without receipt)
- [ ] Test delete expense
- [ ] Test mobile responsiveness
- [ ] Verify multi-tenancy (org isolation)

## Phase 7: Security Checklist

- [ ] All queries filter by organizationId
- [ ] RBAC checks in Server Actions (requireAuth)
- [ ] Input validated with Zod schemas
- [ ] Amount validation (no negative values)
- [ ] Receipt storage uses Supabase Storage
- [ ] No secrets exposed in code
- [ ] File size limits enforced (<500 lines per file)

## Session Objectives (from plan)

1. ✅ Create Expense Table component with all columns
2. ✅ Implement category filtering and sorting
3. ✅ Add row actions (edit, delete, view receipt)
4. ✅ Create Add Expense Modal with form
5. ✅ Implement receipt upload in modal
6. ✅ Add form validation with React Hook Form + Zod
7. ✅ Integrate with Server Actions for mutations

---

**BLOCKING:** DO NOT mark session complete without:
1. Actual verification command outputs (not just "passed")
2. Security checklist confirmed
3. All session objectives marked complete
4. Zero TypeScript errors
5. Zero ESLint errors (warnings acceptable if pre-existing)
