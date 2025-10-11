# Expense Module Schema Reference

**Purpose:** Quick reference for correct schema field names
**Last Updated:** 2025-10-10

---

## ❌ OLD (Incorrect) → ✅ NEW (Correct)

### Field Names

| OLD (Wrong) | NEW (Correct) | Type | Notes |
|-------------|---------------|------|-------|
| `created_by_id` | `user_id` | string | User who created expense |
| `category` | `category_id` | string (UUID) | FK to expense_categories |
| `tax_category` | ❌ REMOVED | - | Field doesn't exist |
| `receipt_url` | ❌ REMOVED | - | Receipts in separate table |
| `receipt_name` | ❌ REMOVED | - | Receipts in separate table |
| `receipt_type` | ❌ REMOVED | - | Receipts in separate table |
| `reviewed_at` | ❌ REMOVED | - | Field doesn't exist |
| `year` | `tax_year` | number | Tax year for expense |

### Relations

| OLD (Wrong) | NEW (Correct) | Type | Notes |
|-------------|---------------|------|-------|
| `creator` | `user` | users | Expense creator relation |
| `receipt` | `receipts` | receipts[] | 1-to-many relation |
| ❌ N/A | `category` | expense_categories | Category relation |
| ❌ N/A | `approver` | users? | Optional approver |

### Table Names

| OLD (Wrong) | NEW (Correct) | Purpose |
|-------------|---------------|---------|
| `expense_reports` | `tax_reports` | Tax report generation |

---

## 🗂️ Correct Schema Structure

### expenses Table

```typescript
{
  id: string;
  organization_id: string;
  user_id: string;              // ← NOT created_by_id
  date: DateTime;
  merchant: string;
  amount: Decimal;
  currency: string;             // Default: "USD"
  category_id: string;          // ← FK, NOT category string
  description: string | null;
  notes: string | null;
  listing_id: string | null;
  is_deductible: boolean;       // Default: true
  deduction_percent: number;    // Default: 100
  tax_year: number;             // ← NOT year
  mileage_start: string | null;
  mileage_end: string | null;
  mileage_distance: Decimal | null;
  mileage_purpose: string | null;
  quickbooks_id: string | null;
  quickbooks_synced: DateTime | null;
  status: ExpenseStatus;        // Default: PENDING
  approved_by: string | null;
  approved_at: DateTime | null;
  created_at: DateTime;
  updated_at: DateTime;

  // Relations
  organization: organizations;
  user: users;                  // ← NOT creator
  category: expense_categories;
  listing: listings | null;
  approver: users | null;
  receipts: receipts[];         // ← 1-to-many
}
```

### expense_categories Table

```typescript
{
  id: string;
  organization_id: string | null; // NULL = system category
  name: string;
  code: string;                   // Unique identifier
  description: string | null;
  irs_category: string | null;    // IRS form line reference
  default_deductible: boolean;
  deduction_limit: Decimal | null; // e.g., 50 for meals
  color: string | null;            // Hex color
  icon: string | null;             // Icon name
  is_active: boolean;
  is_system: boolean;              // True for platform-provided
  created_at: DateTime;
  updated_at: DateTime;

  // Relations
  organization: organizations | null;
  expenses: expenses[];
}
```

### receipts Table

```typescript
{
  id: string;
  organization_id: string;
  expense_id: string;              // FK to expenses
  file_name: string;
  file_url: string;                // Supabase Storage URL
  file_type: string;               // MIME type
  file_size_bytes: bigint;
  ocr_text: string | null;         // Extracted text
  ocr_confidence: Decimal | null;  // 0-100
  ocr_processed_at: DateTime | null;
  ocr_metadata: Json | null;
  merchant_name: string | null;    // OCR extracted
  receipt_date: DateTime | null;   // OCR extracted
  receipt_total: Decimal | null;   // OCR extracted
  is_verified: boolean;
  verified_by: string | null;
  verified_at: DateTime | null;
  created_at: DateTime;
  updated_at: DateTime;

  // Relations
  organization: organizations;
  expense: expenses;
  verifier: users | null;
}
```

### tax_reports Table

```typescript
{
  id: string;
  organization_id: string;
  user_id: string;                 // ← NOT created_by_id
  name: string;
  template_type: TaxReportType;    // FORM_1099_MISC, SCHEDULE_C, etc.
  tax_year: number;
  period_start: DateTime | null;
  period_end: DateTime | null;
  status: TaxReportStatus;         // GENERATING, COMPLETED, FAILED
  file_url: string | null;
  file_format: string | null;
  file_size_bytes: bigint | null;
  total_income: Decimal | null;
  total_expenses: Decimal | null;
  total_deductions: Decimal | null;
  categories_count: number | null;
  expenses_count: number | null;
  is_shared: boolean;
  shared_with: Json | null;
  share_expires_at: DateTime | null;
  quickbooks_id: string | null;
  quickbooks_synced: DateTime | null;
  generated_at: DateTime | null;
  generation_time_ms: number | null;
  template_version: string;
  created_at: DateTime;
  updated_at: DateTime;

  // Relations
  organization: organizations;
  user: users;                     // ← NOT creator
}
```

### tax_estimates Table

```typescript
{
  id: string;
  organization_id: string;
  user_id: string;                 // ← NOT created_by_id
  tax_year: number;                // ← NOT year
  quarter: number | null;          // 1-4 or null for annual
  period_start: DateTime;
  period_end: DateTime;
  total_income: Decimal;
  total_expenses: Decimal;
  total_deductions: Decimal;
  net_income: Decimal;
  estimated_tax_rate: Decimal;
  federal_tax_estimated: Decimal;
  state_tax_estimated: Decimal;
  self_employment_tax: Decimal;
  total_tax_estimated: Decimal;
  amount_paid: Decimal;
  payment_due_date: DateTime | null;
  payment_status: PaymentStatus;   // PENDING, SUCCEEDED, etc.
  quickbooks_id: string | null;
  quickbooks_synced: DateTime | null;
  calculation_method: string;      // "STANDARD", "SIMPLIFIED", etc.
  assumptions: Json | null;
  created_at: DateTime;
  updated_at: DateTime;
  calculated_at: DateTime;

  // Relations
  organization: organizations;
  user: users;                     // ← NOT creator
}
```

---

## 🔧 Common Code Patterns

### Creating an Expense

```typescript
// ✅ CORRECT
const expense = await prisma.expenses.create({
  data: {
    date: new Date(),
    merchant: "Office Depot",
    category_id: categoryId,        // UUID from expense_categories
    amount: 99.99,
    description: "Office supplies",
    notes: "Printer paper and pens",
    is_deductible: true,
    deduction_percent: 100,
    tax_year: new Date().getFullYear(),
    status: 'PENDING',
    organization_id: user.organizationId,
    user_id: user.id,               // NOT created_by_id
  },
  include: {
    user: true,                     // NOT creator
    category: true,
    receipts: true,                 // NOT receipt
  },
});

// ❌ WRONG
const expense = await prisma.expenses.create({
  data: {
    category: "OFFICE",             // Wrong: should be category_id
    created_by_id: user.id,         // Wrong: should be user_id
    receipt_url: url,               // Wrong: receipts in separate table
    tax_category: "deductible",     // Wrong: field doesn't exist
  },
  include: {
    creator: true,                  // Wrong: should be user
    receipt: true,                  // Wrong: should be receipts (plural)
  },
});
```

### Uploading a Receipt

```typescript
// ✅ CORRECT
const receipt = await prisma.receipts.create({
  data: {
    expense_id: expenseId,
    organization_id: orgId,
    file_name: "receipt-2024-10-10.pdf",
    file_url: storageUrl,
    file_type: "application/pdf",
    file_size_bytes: fileSize,
  },
});

// ❌ WRONG
await prisma.expenses.update({
  where: { id: expenseId },
  data: {
    receipt_url: url,               // Field doesn't exist
    receipt_name: name,             // Field doesn't exist
  },
});
```

### Generating a Tax Report

```typescript
// ✅ CORRECT
const report = await prisma.tax_reports.create({
  data: {
    organization_id: orgId,
    user_id: userId,                // NOT created_by_id
    name: "2024 Schedule C",
    template_type: "SCHEDULE_C",
    tax_year: 2024,
    status: "GENERATING",
  },
  include: {
    user: true,                     // NOT creator
  },
});

// ❌ WRONG
const report = await prisma.expense_reports.create({ // Wrong table
  data: {
    created_by_id: userId,          // Wrong field
  },
  include: {
    creator: true,                  // Wrong relation
  },
});
```

### Creating Tax Estimate

```typescript
// ✅ CORRECT
const estimate = await prisma.tax_estimates.create({
  data: {
    organization_id: orgId,
    user_id: userId,                // NOT created_by_id
    tax_year: 2024,                 // NOT year
    quarter: 1,
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-03-31'),
    total_income: 50000,
    total_expenses: 12000,
    // ... other fields
  },
  include: {
    user: true,                     // NOT creator
  },
});

// ❌ WRONG
const estimate = await prisma.tax_estimates.create({
  data: {
    created_by_id: userId,          // Wrong field
    year: 2024,                     // Wrong field (use tax_year)
  },
  include: {
    creator: true,                  // Wrong relation
  },
});
```

---

## 📚 Enums Reference

### ExpenseStatus
```typescript
enum ExpenseStatus {
  PENDING       // Awaiting review
  APPROVED      // Approved for deduction
  REJECTED      // Rejected/not deductible
  NEEDS_REVIEW  // Flagged for additional review
}
```

### TaxReportType
```typescript
enum TaxReportType {
  FORM_1099_MISC        // 1099-MISC form
  FORM_1099_NEC         // 1099-NEC form
  SCHEDULE_C            // Schedule C (Sole Proprietor)
  SCHEDULE_E            // Schedule E (Rental)
  EXPENSE_SUMMARY       // Custom expense summary
  CATEGORY_BREAKDOWN    // Category breakdown report
  QUARTERLY_ESTIMATE    // Quarterly tax estimate
  ANNUAL_SUMMARY        // Annual summary
  CUSTOM                // Custom report type
}
```

### TaxReportStatus
```typescript
enum TaxReportStatus {
  GENERATING   // Report is being generated
  COMPLETED    // Report ready for download
  FAILED       // Generation failed
  EXPIRED      // Report URL expired
}
```

---

## 🔍 Quick Lookup

**Need to find a user who created an expense?**
```typescript
expense.user  // ← NOT expense.creator
```

**Need to get expense category details?**
```typescript
expense.category  // ← Category relation (expense_categories)
// NOT: expense.category as string
```

**Need to access receipts?**
```typescript
expense.receipts  // ← Array of receipts (1-to-many)
// NOT: expense.receipt_url
```

**Need to filter by tax year?**
```typescript
where: { tax_year: 2024 }  // ← NOT year: 2024
```

**Need to query tax reports?**
```typescript
prisma.tax_reports  // ← NOT expense_reports
```

---

## ✅ Validation Checklist

Before writing expense-related code, verify:

- [ ] Using `user_id` (not `created_by_id`)
- [ ] Using `category_id` UUID (not `category` string)
- [ ] Using `user` relation (not `creator`)
- [ ] Using `receipts[]` array (not `receipt_url`)
- [ ] Using `tax_year` (not `year`)
- [ ] Using `tax_reports` table (not `expense_reports`)
- [ ] Including proper relations in queries
- [ ] Validating with Zod schemas

---

**Last Verified:** 2025-10-10 (Session: Expense-Tax Schema Fixes)
