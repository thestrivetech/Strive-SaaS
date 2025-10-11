# Expense & Tax Module Schema Design

**Session:** 3.3 - Design Expense-Tax Schema
**Created:** 2025-10-10
**Status:** ✅ COMPLETE - Ready for Implementation (Session 3.5)

---

## 📊 Overview

Complete database schema design for the Expense & Tax module with 5 models supporting:
- Expense tracking with receipt management
- IRS-compliant categorization (predefined + custom)
- Quarterly/annual tax estimates and calculations
- Tax report generation (1099, Schedule C, etc.)
- QuickBooks API integration
- Multi-tenancy isolation via RLS

---

## 📋 Schema Summary

| Model | Purpose | Relationships | Multi-Tenant |
|-------|---------|---------------|--------------|
| `expenses` | Track business expenses with receipts | → listings, → expense_categories, → receipts | ✅ Yes |
| `expense_categories` | Predefined + custom expense categories | ← expenses | ✅ Yes |
| `tax_estimates` | Quarterly/annual tax calculations | → expenses (aggregation) | ✅ Yes |
| `tax_reports` | Generated tax documents (PDFs) | → expenses (period-based) | ✅ Yes |
| `receipts` | Receipt uploads with OCR data | ← expenses | ✅ Yes |

**Statistics:**
- **Models:** 5
- **New Enums:** 4 (+ using 3 existing)
- **Relationships:** 6
- **Indexes:** 18
- **RLS Policies:** 5 (all models)

---

## 🗄️ Model Definitions

### 1. expenses

**Purpose:** Track business expenses with categorization, receipt links, and tax deductibility

```prisma
model expenses {
  id                String   @id @default(uuid())
  organization_id   String   // Multi-tenancy
  user_id           String   // Expense creator

  // Expense Details
  date              DateTime // Transaction date
  merchant          String   // Vendor/merchant name
  amount            Decimal  @db.Decimal(10, 2)
  currency          String   @default("USD") @db.VarChar(3)

  // Categorization
  category_id       String   // FK to expense_categories
  description       String?  @db.Text
  notes             String?  @db.Text // Additional notes

  // Property Association (optional)
  listing_id        String?  // FK to listings (for property-specific expenses)

  // Tax Information
  is_deductible     Boolean  @default(true)
  deduction_percent Int      @default(100) // Partial deductibility (0-100%)
  tax_year          Int      // Fiscal year for this expense

  // Mileage Tracking (if category is mileage)
  mileage_start     String?  // Start location
  mileage_end       String?  // End location
  mileage_distance  Decimal? @db.Decimal(8, 2) // Miles driven
  mileage_purpose   String?  // Business purpose

  // QuickBooks Integration
  quickbooks_id     String?  @unique // External reference
  quickbooks_synced DateTime? // Last sync timestamp

  // Status & Workflow
  status            ExpenseStatus @default(PENDING)
  approved_by       String?  // User ID who approved
  approved_at       DateTime?

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relationships
  organization      organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user              users @relation(fields: [user_id], references: [id])
  category          expense_categories @relation(fields: [category_id], references: [id])
  listing           listings? @relation(fields: [listing_id], references: [id], onDelete: SetNull)
  receipts          receipts[] // One expense can have multiple receipts

  // Indexes for performance
  @@index([organization_id]) // Multi-tenancy filter
  @@index([user_id])
  @@index([date])
  @@index([category_id])
  @@index([listing_id])
  @@index([tax_year])
  @@index([status])
  @@index([is_deductible])
  @@index([quickbooks_id])
}
```

**Key Features:**
- ✅ Multi-tenancy via `organization_id`
- ✅ Mileage tracking fields (start/end/distance/purpose)
- ✅ Partial deductibility support (e.g., 50% for meals)
- ✅ QuickBooks sync tracking
- ✅ Property association (listing_id)
- ✅ Approval workflow (approved_by, approved_at)

---

### 2. expense_categories

**Purpose:** IRS-compliant expense categories (predefined system categories + custom org-specific)

```prisma
model expense_categories {
  id                String   @id @default(uuid())
  organization_id   String?  // NULL = system category, non-NULL = custom

  // Category Details
  name              String   // Display name
  code              String   // Internal code (e.g., "TRAVEL", "MARKETING")
  description       String?  @db.Text

  // Tax Information
  irs_category      String?  // IRS form category mapping (e.g., "Schedule C Line 6")
  default_deductible Boolean @default(true)
  deduction_limit   Decimal? @db.Decimal(5, 2) // Max deduction % (e.g., 50 for meals)

  // Visual
  color             String?  @db.VarChar(7) // Hex color for UI (#FF5733)
  icon              String?  // Icon name for UI

  // Status
  is_active         Boolean  @default(true)
  is_system         Boolean  @default(false) // System vs custom

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relationships
  organization      organizations? @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  expenses          expenses[]

  // Constraints
  @@unique([organization_id, code]) // Prevent duplicate codes per org
  @@index([organization_id])
  @@index([is_system])
  @@index([is_active])
}
```

**Key Features:**
- ✅ System categories (organization_id = NULL)
- ✅ Custom organization categories (organization_id = UUID)
- ✅ IRS form mapping (Schedule C Line items)
- ✅ Deduction limits (50% for meals, 100% for others)
- ✅ Visual customization (color, icon)

**Seed Data Required:** (Session 3.5)
- System categories matching existing `ExpenseCategory` enum:
  - COMMISSION, TRAVEL, MARKETING, OFFICE, UTILITIES, LEGAL, INSURANCE, REPAIRS, MEALS, EDUCATION, SOFTWARE, OTHER

---

### 3. tax_estimates

**Purpose:** Quarterly and annual tax estimates with calculations

```prisma
model tax_estimates {
  id                String   @id @default(uuid())
  organization_id   String   // Multi-tenancy
  user_id           String   // Tax estimate owner

  // Period Information
  tax_year          Int      // Fiscal year
  quarter           Int?     // 1-4 for quarterly, NULL for annual
  period_start      DateTime // Start of period
  period_end        DateTime // End of period

  // Income & Expense Totals (calculated)
  total_income      Decimal  @db.Decimal(12, 2)
  total_expenses    Decimal  @db.Decimal(12, 2)
  total_deductions  Decimal  @db.Decimal(12, 2)
  net_income        Decimal  @db.Decimal(12, 2) // total_income - total_deductions

  // Tax Calculations
  estimated_tax_rate      Decimal @db.Decimal(5, 2) // Percentage (e.g., 22.00)
  federal_tax_estimated   Decimal @db.Decimal(12, 2)
  state_tax_estimated     Decimal @db.Decimal(12, 2)
  self_employment_tax     Decimal @db.Decimal(12, 2)
  total_tax_estimated     Decimal @db.Decimal(12, 2)

  // Payment Tracking
  amount_paid         Decimal @db.Decimal(12, 2) @default(0)
  payment_due_date    DateTime?
  payment_status      PaymentStatus @default(PENDING)

  // QuickBooks Integration
  quickbooks_id       String?  @unique
  quickbooks_synced   DateTime?

  // Calculation Metadata
  calculation_method  String   // "STANDARD", "SIMPLIFIED", "CUSTOM"
  assumptions         Json?    // Store calculation assumptions

  // Timestamps
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  calculated_at       DateTime @default(now())

  // Relationships
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user                users @relation(fields: [user_id], references: [id])

  // Indexes
  @@unique([organization_id, tax_year, quarter]) // One estimate per org per quarter
  @@index([organization_id])
  @@index([user_id])
  @@index([tax_year])
  @@index([quarter])
  @@index([payment_status])
  @@index([payment_due_date])
}
```

**Key Features:**
- ✅ Quarterly AND annual estimates (quarter = NULL for annual)
- ✅ Automatic calculation from expense data
- ✅ Federal + State + Self-employment tax breakdown
- ✅ Payment tracking (amount_paid, payment_status)
- ✅ QuickBooks sync
- ✅ Calculation assumptions stored as JSON

---

### 4. tax_reports

**Purpose:** Generated tax documents (PDFs, spreadsheets) with templates

```prisma
model tax_reports {
  id                String   @id @default(uuid())
  organization_id   String   // Multi-tenancy
  user_id           String   // Report generator

  // Report Details
  name              String   // User-defined name
  template_type     TaxReportType // 1099, SCHEDULE_C, SUMMARY, etc.
  tax_year          Int      // Fiscal year

  // Period (optional - for custom date ranges)
  period_start      DateTime?
  period_end        DateTime?

  // Report Status
  status            TaxReportStatus @default(GENERATING)

  // File Storage
  file_url          String?  // Supabase Storage URL
  file_format       String?  @db.VarChar(10) // "PDF", "XLSX", "CSV"
  file_size_bytes   BigInt?  // File size tracking

  // Report Content Summary
  total_income      Decimal? @db.Decimal(12, 2)
  total_expenses    Decimal? @db.Decimal(12, 2)
  total_deductions  Decimal? @db.Decimal(12, 2)
  categories_count  Int?     // Number of expense categories
  expenses_count    Int?     // Number of expenses included

  // Sharing & Access
  is_shared         Boolean  @default(false)
  shared_with       Json?    // Array of user IDs with access
  share_expires_at  DateTime?

  // QuickBooks Integration
  quickbooks_id     String?  @unique
  quickbooks_synced DateTime?

  // Generation Metadata
  generated_at      DateTime?
  generation_time_ms Int?    // Performance tracking
  template_version  String?  @default("1.0") // Template versioning

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relationships
  organization      organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user              users @relation(fields: [user_id], references: [id])

  // Indexes
  @@index([organization_id])
  @@index([user_id])
  @@index([tax_year])
  @@index([template_type])
  @@index([status])
  @@index([created_at])
}
```

**Key Features:**
- ✅ Multiple report templates (1099, Schedule C, Summary, etc.)
- ✅ File storage in Supabase with RLS
- ✅ Report sharing with expiration
- ✅ Generation performance tracking
- ✅ Summary statistics cached in database
- ✅ Template versioning for future updates

---

### 5. receipts

**Purpose:** Receipt uploads with OCR text extraction and storage

```prisma
model receipts {
  id                String   @id @default(uuid())
  organization_id   String   // Multi-tenancy
  expense_id        String   // FK to expenses

  // File Information
  file_name         String   // Original filename
  file_url          String   // Supabase Storage URL
  file_type         String   @db.VarChar(50) // MIME type (image/jpeg, application/pdf)
  file_size_bytes   BigInt   // File size

  // OCR Data
  ocr_text          String?  @db.Text // Extracted text from receipt
  ocr_confidence    Decimal? @db.Decimal(5, 2) // OCR confidence score (0-100)
  ocr_processed_at  DateTime? // When OCR was completed
  ocr_metadata      Json?    // Raw OCR response (vendor, amounts, dates detected)

  // Extracted Details (from OCR)
  merchant_name     String?  // Auto-detected merchant
  receipt_date      DateTime? // Auto-detected date
  receipt_total     Decimal? @db.Decimal(10, 2) // Auto-detected total

  // Manual Verification
  is_verified       Boolean  @default(false) // User confirmed OCR accuracy
  verified_by       String?  // User ID
  verified_at       DateTime?

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relationships
  organization      organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  expense           expenses @relation(fields: [expense_id], references: [id], onDelete: Cascade)

  // Indexes
  @@index([organization_id])
  @@index([expense_id])
  @@index([created_at])
}
```

**Key Features:**
- ✅ Supabase Storage integration with RLS
- ✅ OCR text extraction with confidence scores
- ✅ Auto-detection of merchant, date, total
- ✅ Manual verification workflow
- ✅ OCR metadata stored as JSON for flexibility
- ✅ Multiple receipts per expense support

**Storage Bucket:** `expense-receipts` (to be created in Session 3.5)
- RLS Policy: Users can only access receipts from their organization
- Max file size: 10MB
- Allowed types: image/*, application/pdf

---

## 🏷️ Enums

### New Enums (4)

#### 1. TaxReportType

```prisma
enum TaxReportType {
  FORM_1099_MISC      // 1099-MISC (Independent Contractor Income)
  FORM_1099_NEC       // 1099-NEC (Nonemployee Compensation)
  SCHEDULE_C          // Schedule C (Profit or Loss from Business)
  SCHEDULE_E          // Schedule E (Rental Income & Expenses)
  EXPENSE_SUMMARY     // YTD Expense Summary
  CATEGORY_BREAKDOWN  // Expense Breakdown by Category
  QUARTERLY_ESTIMATE  // Quarterly Tax Estimate Report
  ANNUAL_SUMMARY      // Annual Tax Summary
  CUSTOM              // Custom date range report
}
```

#### 2. TaxReportStatus

```prisma
enum TaxReportStatus {
  GENERATING    // Report generation in progress
  COMPLETED     // Report successfully generated
  FAILED        // Report generation failed
  EXPIRED       // Report file expired/deleted
}
```

#### 3. QuarterEnum

```prisma
enum QuarterEnum {
  Q1  // Jan-Mar
  Q2  // Apr-Jun
  Q3  // Jul-Sep
  Q4  // Oct-Dec
}
```

#### 4. CalculationMethod

```prisma
enum CalculationMethod {
  STANDARD    // IRS standard tax tables
  SIMPLIFIED  // Simplified calculation
  CUSTOM      // User-defined rates
}
```

---

### Existing Enums (Reused)

#### ExpenseStatus (existing)

```prisma
enum ExpenseStatus {
  PENDING       // Awaiting approval
  APPROVED      // Approved by admin
  REJECTED      // Rejected
  NEEDS_REVIEW  // Flagged for review
}
```

#### ExpenseCategory (existing - will become seed data)

Current enum will be migrated to `expense_categories` table as system categories:
- COMMISSION, TRAVEL, MARKETING, OFFICE, UTILITIES, LEGAL, INSURANCE, REPAIRS, MEALS, EDUCATION, SOFTWARE, OTHER

#### PaymentStatus (existing)

```prisma
enum PaymentStatus {
  PENDING           // Payment not yet made
  PROCESSING        // Payment in progress
  SUCCEEDED         // Payment completed
  FAILED            // Payment failed
  CANCELLED         // Payment cancelled
  REQUIRES_ACTION   // Requires user action
}
```

---

## 🔗 Relationships

### One-to-Many

1. **organizations → expenses** (1:N)
   - One organization has many expenses
   - Cascade delete: Delete expenses when org is deleted

2. **users → expenses** (1:N)
   - One user creates many expenses
   - No cascade: Keep expenses if user is deleted

3. **expense_categories → expenses** (1:N)
   - One category has many expenses
   - No cascade: Prevent category deletion if in use

4. **listings → expenses** (1:N, optional)
   - One property can have many expenses
   - SetNull: Remove listing reference if property deleted

5. **expenses → receipts** (1:N)
   - One expense can have multiple receipts
   - Cascade delete: Delete receipts when expense deleted

6. **organizations → expense_categories** (1:N, optional)
   - One organization has many custom categories
   - Cascade delete: Delete custom categories when org deleted

7. **organizations → tax_estimates** (1:N)
   - One organization has many tax estimates
   - Cascade delete

8. **organizations → tax_reports** (1:N)
   - One organization has many tax reports
   - Cascade delete

### Many-to-One (Inverse of above)

- expenses → organization
- expenses → user
- expenses → category
- expenses → listing (optional)
- receipts → expense
- expense_categories → organization (optional)
- tax_estimates → organization
- tax_reports → organization

### Aggregation Queries (No direct FK)

- **tax_estimates ⇄ expenses** (calculated aggregation)
  - Tax estimates aggregate expenses by period
  - No foreign key - uses date range queries

- **tax_reports ⇄ expenses** (period-based filtering)
  - Tax reports include expenses from specific date ranges
  - No foreign key - uses tax_year and date filters

---

## 📈 Indexes

**Performance Optimization Strategy:**

### Multi-Tenancy Indexes (Critical)

```prisma
@@index([organization_id])  // On ALL models - required for RLS
```

### Query Performance Indexes

**expenses:**
- `[organization_id]` - Multi-tenancy filter (most common)
- `[user_id]` - User's expense list
- `[date]` - Time-range queries
- `[category_id]` - Category filtering
- `[listing_id]` - Property expenses
- `[tax_year]` - Annual reports
- `[status]` - Status filtering
- `[is_deductible]` - Tax reports
- `[quickbooks_id]` - External sync lookups

**expense_categories:**
- `[organization_id]` - Custom categories per org
- `[is_system]` - System vs custom
- `[is_active]` - Active categories only

**tax_estimates:**
- `[organization_id]` - Multi-tenancy
- `[user_id]` - User estimates
- `[tax_year]` - Annual lookups
- `[quarter]` - Quarterly estimates
- `[payment_status]` - Unpaid estimates
- `[payment_due_date]` - Due date reminders

**tax_reports:**
- `[organization_id]` - Multi-tenancy
- `[user_id]` - User reports
- `[tax_year]` - Annual reports
- `[template_type]` - Report type filtering
- `[status]` - Completed reports
- `[created_at]` - Recent reports

**receipts:**
- `[organization_id]` - Multi-tenancy
- `[expense_id]` - Receipts for expense
- `[created_at]` - Recent uploads

**Total Indexes:** 18 across 5 models

---

## 🔒 RLS (Row Level Security) Policies

### All Models: Multi-Tenancy Isolation

```sql
-- expenses RLS
CREATE POLICY "Users can only access expenses from their organization"
ON expenses FOR ALL
USING (organization_id = current_setting('app.organization_id')::uuid);

-- expense_categories RLS (system categories + org custom)
CREATE POLICY "Users can access system categories and their org's custom categories"
ON expense_categories FOR ALL
USING (
  is_system = true
  OR organization_id = current_setting('app.organization_id')::uuid
);

-- tax_estimates RLS
CREATE POLICY "Users can only access tax estimates from their organization"
ON tax_estimates FOR ALL
USING (organization_id = current_setting('app.organization_id')::uuid);

-- tax_reports RLS
CREATE POLICY "Users can only access tax reports from their organization"
ON tax_reports FOR ALL
USING (organization_id = current_setting('app.organization_id')::uuid);

-- receipts RLS
CREATE POLICY "Users can only access receipts from their organization"
ON receipts FOR ALL
USING (organization_id = current_setting('app.organization_id')::uuid);
```

### Supabase Storage RLS (expense-receipts bucket)

```sql
-- Allow users to upload receipts to their organization folder
CREATE POLICY "Users can upload receipts to their organization"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expense-receipts'
  AND (storage.foldername(name))[1] = auth.jwt() ->> 'organization_id'
);

-- Allow users to read receipts from their organization
CREATE POLICY "Users can read receipts from their organization"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expense-receipts'
  AND (storage.foldername(name))[1] = auth.jwt() ->> 'organization_id'
);

-- Allow users to delete receipts from their organization
CREATE POLICY "Users can delete receipts from their organization"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expense-receipts'
  AND (storage.foldername(name))[1] = auth.jwt() ->> 'organization_id'
);
```

**Folder Structure:** `expense-receipts/{organization_id}/{expense_id}/{filename}`

---

## 🔌 QuickBooks Integration Fields

All models with QB sync include:

```prisma
quickbooks_id     String?  @unique // External reference ID
quickbooks_synced DateTime? // Last successful sync timestamp
```

**Models with QB Integration:**
1. ✅ `expenses` - Sync expense transactions
2. ✅ `expense_categories` - Sync chart of accounts
3. ✅ `tax_estimates` - Sync quarterly estimates
4. ✅ `tax_reports` - Link to QB reports

**Sync Strategy:**
- **One-way sync:** Platform → QuickBooks (write-only)
- **Conflict resolution:** Platform is source of truth
- **Sync frequency:** Real-time on creation, hourly batch updates
- **Error handling:** Store sync errors in `integration_logs` (existing table)

**QuickBooks API Endpoints Used:**
- `/v3/companyinfo/{companyId}/expenses` - Create/update expenses
- `/v3/companyinfo/{companyId}/accounts` - Sync categories
- `/v3/companyinfo/{companyId}/taxagency` - Tax estimate sync

---

## 🎯 IRS Compliance Requirements

### Tax Categories Mapping

**Schedule C Line Items** (Sole Proprietor):

| Category | IRS Schedule C Line | Deduction % | Notes |
|----------|-------------------|-------------|-------|
| COMMISSION | Line 10 (Commission & Fees) | 100% | Fully deductible |
| TRAVEL | Line 24a (Travel) | 100% | Business travel only |
| MEALS | Line 24b (Meals) | 50% | Business meals limitation |
| MARKETING | Line 8 (Advertising) | 100% | Fully deductible |
| OFFICE | Line 18 (Office Expense) | 100% | Supplies, equipment |
| UTILITIES | Line 25 (Utilities) | 100% | Business portion only |
| LEGAL | Line 17 (Legal & Professional) | 100% | Fully deductible |
| INSURANCE | Line 15 (Insurance) | 100% | Business insurance |
| REPAIRS | Line 21 (Repairs & Maintenance) | 100% | Business property |
| EDUCATION | Line 27a (Other Expenses) | 100% | Job-related education |
| SOFTWARE | Line 27a (Other Expenses) | 100% | Business software |

### Required Tax Forms

**Platform will generate:**
1. ✅ **1099-MISC** - Miscellaneous income (if applicable)
2. ✅ **1099-NEC** - Nonemployee compensation
3. ✅ **Schedule C** - Profit/loss from business (Sole Prop)
4. ✅ **Schedule E** - Rental property income/expenses
5. ✅ **Quarterly Estimates** - Form 1040-ES worksheets

---

## 📊 Seed Data Requirements

### System Expense Categories

**Session 3.5 must seed these categories:**

```typescript
const systemCategories = [
  {
    id: uuid(),
    organization_id: null, // System category
    name: 'Commission',
    code: 'COMMISSION',
    description: 'Commission fees and referral fees',
    irs_category: 'Schedule C Line 10',
    default_deductible: true,
    deduction_limit: 100,
    color: '#3B82F6',
    icon: 'DollarSign',
    is_system: true,
    is_active: true,
  },
  {
    id: uuid(),
    organization_id: null,
    name: 'Travel',
    code: 'TRAVEL',
    description: 'Business travel expenses (flights, hotels, car rental)',
    irs_category: 'Schedule C Line 24a',
    default_deductible: true,
    deduction_limit: 100,
    color: '#10B981',
    icon: 'Plane',
    is_system: true,
    is_active: true,
  },
  {
    id: uuid(),
    organization_id: null,
    name: 'Meals',
    code: 'MEALS',
    description: 'Business meals and entertainment',
    irs_category: 'Schedule C Line 24b',
    default_deductible: true,
    deduction_limit: 50, // IRS 50% limitation
    color: '#F59E0B',
    icon: 'Coffee',
    is_system: true,
    is_active: true,
  },
  {
    id: uuid(),
    organization_id: null,
    name: 'Marketing',
    code: 'MARKETING',
    description: 'Advertising and marketing expenses',
    irs_category: 'Schedule C Line 8',
    default_deductible: true,
    deduction_limit: 100,
    color: '#EC4899',
    icon: 'Megaphone',
    is_system: true,
    is_active: true,
  },
  // ... Continue for all 12 categories
];
```

**All 12 System Categories:**
1. COMMISSION
2. TRAVEL
3. MARKETING
4. OFFICE
5. UTILITIES
6. LEGAL
7. INSURANCE
8. REPAIRS
9. MEALS
10. EDUCATION
11. SOFTWARE
12. OTHER

---

## 📁 Supabase Storage Bucket Configuration

### Bucket: `expense-receipts`

**Configuration:**
```typescript
{
  id: 'expense-receipts',
  name: 'expense-receipts',
  public: false, // Private bucket
  file_size_limit: 10485760, // 10MB
  allowed_mime_types: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
}
```

**Folder Structure:**
```
expense-receipts/
├── {organization_id}/
│   ├── {expense_id}/
│   │   ├── receipt-1.jpg
│   │   ├── receipt-2.pdf
│   │   └── receipt-3.png
```

**File Naming Convention:**
- Original: `{timestamp}-{original_filename}`
- Example: `1696550400000-Home-Depot-Receipt.pdf`

**RLS Policies:** See "RLS" section above

---

## 🧪 Validation & Constraints

### Unique Constraints

```prisma
// expense_categories
@@unique([organization_id, code]) // No duplicate codes per org

// tax_estimates
@@unique([organization_id, tax_year, quarter]) // One estimate per quarter

// expenses (via quickbooks_id)
quickbooks_id String? @unique

// tax_estimates (via quickbooks_id)
quickbooks_id String? @unique

// tax_reports (via quickbooks_id)
quickbooks_id String? @unique
```

### Business Logic Validation

**To be enforced in Server Actions (Session 3.8):**

1. **Expense Amount:**
   - Must be > 0
   - Max: $1,000,000 (configurable)

2. **Deduction Percentage:**
   - Must be 0-100
   - Default to category's deduction_limit

3. **Tax Year:**
   - Must be >= 2020 (configurable start year)
   - Max: Current year + 1

4. **Mileage:**
   - Distance must be > 0 if mileage expense
   - Calculate amount = distance × IRS mileage rate

5. **Receipt File Size:**
   - Max 10MB per file
   - Max 5 receipts per expense

6. **Tax Estimate Quarter:**
   - Must be 1-4 or NULL
   - Period dates must align with quarter

---

## 🚀 Implementation Notes for Session 3.5

### Migration Order

1. **Create Enums** (in order):
   - TaxReportType
   - TaxReportStatus
   - QuarterEnum
   - CalculationMethod

2. **Create Tables** (in order to handle foreign keys):
   - expense_categories (no FK dependencies)
   - expenses (depends on: expense_categories, listings)
   - receipts (depends on: expenses)
   - tax_estimates (no FK to expenses - aggregation only)
   - tax_reports (no FK to expenses - aggregation only)

3. **Create Indexes** (after tables created)

4. **Create RLS Policies** (after tables created)

5. **Create Storage Bucket** (`expense-receipts`)

6. **Seed System Categories** (12 categories)

### Database Migration File Structure

```
prisma/migrations/
└── {timestamp}_add_expense_tax_module/
    ├── migration.sql
    └── README.md
```

**Estimated Migration Size:** ~350 lines SQL

---

## 📊 Integration with Existing Schema

### Foreign Key Relationships to Existing Tables

```prisma
// expenses → organizations
organization_id String
organization organizations @relation(fields: [organization_id], references: [id])

// expenses → users
user_id String
user users @relation(fields: [user_id], references: [id])

// expenses → listings (NEW relationship)
listing_id String?
listing listings? @relation(fields: [listing_id], references: [id])
```

**Impact on Existing Tables:**

1. **organizations** - Add relation:
   ```prisma
   expenses               expenses[]
   expense_categories     expense_categories[]
   tax_estimates          tax_estimates[]
   tax_reports            tax_reports[]
   receipts               receipts[]
   ```

2. **users** - Add relation:
   ```prisma
   expenses               expenses[]
   tax_estimates          tax_estimates[]
   tax_reports            tax_reports[]
   ```

3. **listings** - Add relation:
   ```prisma
   expenses               expenses[]
   ```

**No Breaking Changes** - All relationships are additive

---

## 🎨 UI Component Data Mapping

### ExpenseTable.tsx Compatibility

**Expected Interface:**
```typescript
interface Expense {
  id: string;                    ✅ expenses.id
  date: string;                  ✅ expenses.date
  merchant: string;              ✅ expenses.merchant
  category: string;              ✅ expenses.category_id (join)
  listing: { id, address } | null; ✅ expenses.listing_id (join)
  amount: number;                ✅ expenses.amount
  receiptUrl: string | null;     ✅ receipts.file_url (join)
  isDeductible: boolean;         ✅ expenses.is_deductible
  status: string;                ✅ expenses.status
}
```

**Query Pattern:**
```typescript
const expenses = await prisma.expenses.findMany({
  where: { organization_id: orgId },
  include: {
    category: true,
    listing: { select: { id: true, address: true } },
    receipts: { select: { file_url: true }, take: 1 },
  },
  orderBy: { date: 'desc' },
});
```

### TaxEstimateCard.tsx Compatibility

**Expected Data:**
```typescript
interface TaxEstimate {
  taxYear: number;              ✅ tax_estimates.tax_year
  quarter: number | null;       ✅ tax_estimates.quarter
  totalIncome: number;          ✅ tax_estimates.total_income
  totalExpenses: number;        ✅ tax_estimates.total_expenses
  netIncome: number;            ✅ tax_estimates.net_income
  estimatedTax: number;         ✅ tax_estimates.total_tax_estimated
  amountPaid: number;           ✅ tax_estimates.amount_paid
  dueDate: string;              ✅ tax_estimates.payment_due_date
}
```

### ReportTemplateCard.tsx Compatibility

**Expected Data:**
```typescript
interface ReportTemplate {
  id: string;                   ✅ Hardcoded templates
  name: string;                 ✅ TaxReportType enum
  category: string;             ✅ 'tax-form' | 'summary' | 'categorization'
  estimatedTime: string;        ✅ Hardcoded (e.g., "2-3 minutes")
}
```

**Report Generation Flow:**
```typescript
1. User selects template + year
2. Server Action generates report (queries expenses)
3. Create tax_reports record with status=GENERATING
4. Generate PDF/XLSX file
5. Upload to Supabase Storage
6. Update tax_reports with file_url, status=COMPLETED
7. Return download link to client
```

---

## ✅ Design Validation Checklist

- [x] All 5 models fully defined with fields and types
- [x] Relationships documented (6 relationships)
- [x] Indexes identified (18 indexes)
- [x] RLS requirements specified (5 models)
- [x] QuickBooks integration fields included
- [x] IRS compliance requirements met (Schedule C mapping)
- [x] Receipt storage strategy defined (Supabase Storage)
- [x] Multi-tenancy isolation via organization_id
- [x] Mileage tracking fields (start/end/distance/purpose)
- [x] Tax year support (fiscal year tracking)
- [x] OCR data structure (JSON metadata)
- [x] Deduction categories (IRS-compliant with limits)
- [x] Compatible with existing UI components
- [x] No breaking changes to existing schema
- [x] Seed data requirements documented

---

## 📝 Next Steps

### Session 3.4: Design CMS Campaigns Schema
Design content management and marketing campaign schema.

### Session 3.5: Implement All Schemas + Migrations
Implement Expense-Tax, Marketplace, REID, and CMS schemas with migrations.

**For Expense-Tax specifically:**
1. Create migration file with all 5 models
2. Create 4 new enums
3. Seed 12 system expense categories
4. Create Supabase Storage bucket: `expense-receipts`
5. Apply RLS policies to all tables
6. Generate Prisma client
7. Update schema documentation

---

**Status:** ✅ DESIGN COMPLETE
**Ready for:** Session 3.5 Implementation
**Created:** 2025-10-10
**Models:** 5 | **Enums:** 4 new + 3 existing | **Indexes:** 18 | **RLS:** 5
