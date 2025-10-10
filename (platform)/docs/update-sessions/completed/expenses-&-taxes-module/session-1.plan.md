# Session 1: Database Foundation & Schema Extensions

## Session Overview
**Goal:** Establish the database foundation for the Expenses & Taxes integration by extending the Prisma schema with all required models and relationships.

**Duration:** 2-3 hours
**Complexity:** High
**Dependencies:** None (Foundation session)

## Objectives

1. ✅ Extend Prisma schema with Expense Management models (Expense, ExpenseCategory, TaxEstimate, ExpenseReport, Receipt)
2. ✅ Add proper enums for status and category fields
3. ✅ Create relationships between models
4. ✅ Ensure multi-tenancy with organizationId on all tables
5. ✅ Generate and run migrations using Supabase MCP
6. ✅ Verify schema changes in database

## Prerequisites

- [x] Existing Prisma schema setup
- [x] Supabase database connection configured
- [x] Understanding of multi-tenant architecture
- [x] Access to shared/prisma/schema.prisma
- [x] Expenses & Taxes integration plan read and understood

## Database Models to Add

### 1. Expense Model
```prisma
model expenses {
  id              String         @id @default(uuid())
  date            DateTime
  merchant        String
  category        ExpenseCategory
  amount          Decimal        @db.Decimal(12, 2) // Amount in dollars

  // Optional fields
  property_id     String?
  property        properties?    @relation(fields: [property_id], references: [id], onDelete: SetNull)
  notes           String?        @db.Text

  // Tax information
  is_deductible   Boolean        @default(true)
  tax_category    String?

  // Receipt management
  receipt_url     String?
  receipt_name    String?
  receipt_type    String?        // image/pdf

  // Processing status
  status          ExpenseStatus  @default(PENDING)
  reviewed_at     DateTime?
  reviewed_by_id  String?
  reviewer        users?         @relation("ExpenseReviewer", fields: [reviewed_by_id], references: [id], onDelete: SetNull)

  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization    organizations  @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by_id   String
  creator         users          @relation("ExpenseCreator", fields: [created_by_id], references: [id], onDelete: Cascade)
  receipt         receipts?

  @@index([organization_id])
  @@index([created_by_id])
  @@index([category])
  @@index([status])
  @@index([date])
  @@index([is_deductible])
  @@map("expenses")
}
```

### 2. ExpenseCategory Model
```prisma
model expense_categories {
  id              String         @id @default(uuid())
  name            String
  description     String?
  is_deductible   Boolean        @default(true)
  tax_code        String?

  // Category configuration
  is_active       Boolean        @default(true)
  sort_order      Int            @default(0)

  // System vs custom categories
  is_system       Boolean        @default(false)

  created_at      DateTime       @default(now())
  updated_at      DateTime       @updatedAt

  // Multi-tenant isolation (nullable for system categories)
  organization_id String?
  organization    organizations? @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@unique([name, organization_id])
  @@index([organization_id])
  @@index([is_active])
  @@map("expense_categories")
}
```

### 3. TaxEstimate Model
```prisma
model tax_estimates {
  id                  String        @id @default(uuid())
  year                Int
  quarter             Int?          // 1-4 for quarterly estimates

  // Income information
  total_income        Decimal       @db.Decimal(12, 2)
  business_income     Decimal       @db.Decimal(12, 2)
  other_income        Decimal       @db.Decimal(12, 2)

  // Deduction information
  total_deductions    Decimal       @db.Decimal(12, 2)
  business_deductions Decimal       @db.Decimal(12, 2)
  standard_deduction  Decimal       @db.Decimal(12, 2)

  // Tax calculations
  taxable_income      Decimal       @db.Decimal(12, 2)
  estimated_tax       Decimal       @db.Decimal(12, 2)
  tax_rate            Float         // Effective tax rate

  // Payment tracking
  paid_amount         Decimal       @db.Decimal(12, 2) @default(0)
  due_date            DateTime?
  is_paid             Boolean       @default(false)

  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt

  // Multi-tenant isolation
  organization_id     String
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by_id       String
  creator             users         @relation("TaxEstimateCreator", fields: [created_by_id], references: [id], onDelete: Cascade)

  @@unique([year, quarter, organization_id])
  @@index([organization_id])
  @@index([year])
  @@map("tax_estimates")
}
```

### 4. ExpenseReport Model
```prisma
model expense_reports {
  id                  String        @id @default(uuid())
  name                String
  report_type         ReportType

  // Date range
  start_date          DateTime
  end_date            DateTime

  // Filters
  categories          String[]      @default([]) // Category IDs to include
  properties          String[]      @default([]) // Property IDs to include
  merchants           String[]      @default([]) // Specific merchants

  // Report data (cached)
  report_data         Json          @db.JsonB
  total_expenses      Decimal       @db.Decimal(12, 2)
  total_deductible    Decimal       @db.Decimal(12, 2)

  // File generation
  pdf_url             String?       // Generated PDF URL
  csv_url             String?       // Generated CSV URL

  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt

  // Multi-tenant isolation
  organization_id     String
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by_id       String
  creator             users         @relation("ExpenseReportCreator", fields: [created_by_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([created_by_id])
  @@index([report_type])
  @@map("expense_reports")
}
```

### 5. Receipt Model
```prisma
model receipts {
  id              String    @id @default(uuid())
  expense_id      String    @unique
  expense         expenses  @relation(fields: [expense_id], references: [id], onDelete: Cascade)

  // File information
  original_name   String
  file_name       String    // Stored filename
  file_url        String    // Supabase Storage URL
  file_size       Int
  mime_type       String

  // OCR/Processing results
  extracted_data  Json?     @db.JsonB // OCR extracted text and data
  processed_at    DateTime?

  uploaded_at     DateTime  @default(now())

  @@index([expense_id])
  @@map("receipts")
}
```

### 6. Enums
```prisma
enum ExpenseCategory {
  COMMISSION
  TRAVEL
  MARKETING
  OFFICE
  UTILITIES
  LEGAL
  INSURANCE
  REPAIRS
  MEALS
  EDUCATION
  SOFTWARE
  OTHER
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
  NEEDS_REVIEW
}

enum ReportType {
  MONTHLY
  QUARTERLY
  YEARLY
  CUSTOM
  TAX_SUMMARY
}
```

## Step-by-Step Implementation

### Step 1: Update Prisma Schema
**File:** `shared/prisma/schema.prisma`

1. Add all enums at the top of the schema file (after existing enums)
2. Add all models in the models section
3. Update existing User and Organization models to add new relations

**User Model Updates:**
```prisma
model users {
  // ... existing fields ...

  // Expense Management Relations
  created_expenses        expenses[]         @relation("ExpenseCreator")
  reviewed_expenses       expenses[]         @relation("ExpenseReviewer")
  created_tax_estimates   tax_estimates[]    @relation("TaxEstimateCreator")
  created_expense_reports expense_reports[]  @relation("ExpenseReportCreator")

  // ... rest of model ...
}
```

**Organization Model Updates:**
```prisma
model organizations {
  // ... existing fields ...

  // Expense Management Relations
  expenses                expenses[]
  expense_categories      expense_categories[]
  tax_estimates           tax_estimates[]
  expense_reports         expense_reports[]

  // ... rest of model ...
}
```

### Step 2: Validate Schema

**Using Supabase MCP Tools:**

First, verify the schema is valid by checking current database structure:

```typescript
// Use Supabase MCP: list_tables
// This will show current tables in the database
```

**Tool to use:** `mcp__supabase__list_tables`
**Parameters:** `{ "schemas": ["public"] }`

### Step 3: Create Migration Using Supabase MCP

**IMPORTANT: Use Supabase MCP `apply_migration` tool instead of Prisma CLI**

For each model, create migrations using the `mcp__supabase__apply_migration` tool:

**Example for Expenses table:**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_expenses_table",
  "query": `
    -- Create ExpenseCategory enum
    CREATE TYPE "ExpenseCategory" AS ENUM (
      'COMMISSION', 'TRAVEL', 'MARKETING', 'OFFICE', 'UTILITIES',
      'LEGAL', 'INSURANCE', 'REPAIRS', 'MEALS', 'EDUCATION', 'SOFTWARE', 'OTHER'
    );

    -- Create ExpenseStatus enum
    CREATE TYPE "ExpenseStatus" AS ENUM (
      'PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW'
    );

    -- Create ReportType enum
    CREATE TYPE "ReportType" AS ENUM (
      'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM', 'TAX_SUMMARY'
    );

    -- Create expenses table
    CREATE TABLE expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date TIMESTAMPTZ NOT NULL,
      merchant VARCHAR(255) NOT NULL,
      category "ExpenseCategory" NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
      notes TEXT,
      is_deductible BOOLEAN DEFAULT true,
      tax_category VARCHAR(100),
      receipt_url TEXT,
      receipt_name VARCHAR(255),
      receipt_type VARCHAR(50),
      status "ExpenseStatus" DEFAULT 'PENDING',
      reviewed_at TIMESTAMPTZ,
      reviewed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX idx_expenses_organization_id ON expenses(organization_id);
    CREATE INDEX idx_expenses_created_by_id ON expenses(created_by_id);
    CREATE INDEX idx_expenses_category ON expenses(category);
    CREATE INDEX idx_expenses_status ON expenses(status);
    CREATE INDEX idx_expenses_date ON expenses(date);
    CREATE INDEX idx_expenses_is_deductible ON expenses(is_deductible);
  `
}
```

**Repeat for other tables:** expense_categories, tax_estimates, expense_reports, receipts

### Step 4: Generate Prisma Client

After applying migrations via Supabase MCP, generate the Prisma client locally:

```bash
cd C:\Users\zochr\Desktop\GitHub\Strive-SaaS
npx prisma generate --schema=shared/prisma/schema.prisma
```

**Note:** This command only generates TypeScript types locally, it doesn't modify the database.

### Step 5: Verify in Database

**Using Supabase MCP:**

```typescript
// Tool: mcp__supabase__list_tables
// Verify all tables exist:
// ✅ expenses
// ✅ expense_categories
// ✅ tax_estimates
// ✅ expense_reports
// ✅ receipts

// Tool: mcp__supabase__execute_sql
// Query to verify table structure:
{
  "query": `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('expenses', 'expense_categories', 'tax_estimates', 'expense_reports', 'receipts')
    ORDER BY table_name, ordinal_position;
  `
}
```

### Step 6: Add RLS Policies Using Supabase MCP

**Use `mcp__supabase__apply_migration` tool for RLS policies:**

```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "add_expense_rls_policies",
  "query": `
    -- Enable RLS on Expense Management tables
    ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
    ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tax_estimates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;
    ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

    -- RLS Policy for expenses (tenant isolation)
    CREATE POLICY "tenant_isolation_expenses" ON expenses
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_expenses_insert" ON expenses
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for expense_categories
    CREATE POLICY "tenant_isolation_expense_categories" ON expense_categories
      USING (organization_id = current_setting('app.current_org_id')::uuid OR organization_id IS NULL);

    CREATE POLICY "tenant_isolation_expense_categories_insert" ON expense_categories
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for tax_estimates
    CREATE POLICY "tenant_isolation_tax_estimates" ON tax_estimates
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_tax_estimates_insert" ON tax_estimates
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for expense_reports
    CREATE POLICY "tenant_isolation_expense_reports" ON expense_reports
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_expense_reports_insert" ON expense_reports
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for receipts (via expense relationship)
    CREATE POLICY "tenant_isolation_receipts" ON receipts
      USING (
        EXISTS (
          SELECT 1 FROM expenses
          WHERE expenses.id = receipts.expense_id
          AND expenses.organization_id = current_setting('app.current_org_id')::uuid
        )
      );

    -- Indexes for performance
    CREATE INDEX idx_expenses_org_category ON expenses(organization_id, category);
    CREATE INDEX idx_expenses_org_date ON expenses(organization_id, date);
    CREATE INDEX idx_tax_estimates_org_year ON tax_estimates(organization_id, year);
    CREATE INDEX idx_expense_reports_org_type ON expense_reports(organization_id, report_type);
  `
}
```

## Testing & Validation

### Test 1: Schema Validation

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__list_tables
// Verify schema is applied
{
  "schemas": ["public"]
}
```
**Expected:** All new tables listed (expenses, expense_categories, tax_estimates, expense_reports, receipts)

### Test 2: Migration Success

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__list_migrations
// Check migration history
```
**Expected:** All Expense Management migrations listed and applied

### Test 3: Type Generation

```bash
npx prisma generate --schema=shared/prisma/schema.prisma
```
**Expected:** Types generated in node_modules/@prisma/client

**Note:** This only generates local TypeScript types, doesn't modify database

### Test 4: Database Inspection

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__execute_sql
// Query to inspect table structure
{
  "query": `
    SELECT
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name IN ('expenses', 'expense_categories', 'tax_estimates', 'expense_reports', 'receipts')
    ORDER BY table_name, ordinal_position;
  `
}
```
**Expected:** All new tables with correct columns visible

### Test 5: Verify RLS Policies

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__execute_sql
// Check RLS policies are enabled
{
  "query": `
    SELECT
      tablename,
      policyname,
      cmd,
      qual
    FROM pg_policies
    WHERE tablename IN ('expenses', 'expense_categories', 'tax_estimates', 'expense_reports', 'receipts')
    ORDER BY tablename, policyname;
  `
}
```
**Expected:** Tenant isolation policies for all Expense Management tables

### Test 6: Insert Test Data (Optional)

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    INSERT INTO expenses (
      id, date, merchant, category, amount, is_deductible, status, organization_id, created_by_id, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      NOW(),
      'Test Merchant',
      'OFFICE',
      12500,
      true,
      'PENDING',
      '[your-org-id]',
      '[your-user-id]',
      NOW(),
      NOW()
    )
    RETURNING *;
  `
}
```
**Expected:** Test expense created successfully

## Success Criteria

- [x] All 5 new models added to schema
- [x] All enums defined correctly
- [x] All relationships established
- [x] organizationId field on all tables (multi-tenancy)
- [x] Proper indexes created
- [x] Migration runs successfully
- [x] Prisma client generates without errors
- [x] RLS policies enabled on all tables
- [x] Can view tables in database
- [x] TypeScript types available for all models

## Files Modified

- ✅ `shared/prisma/schema.prisma` - Extended with Expense Management models
- ✅ Database migrations applied via Supabase MCP

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing organizationId
**Problem:** Forgetting to add organization_id to a model
**Solution:** Every expense model MUST have organization_id for multi-tenancy (except receipts which inherit via expense relationship)

### ❌ Pitfall 2: Missing Indexes
**Problem:** Slow queries on filtered fields
**Solution:** Add indexes on commonly queried fields (category, status, date, organization_id)

### ❌ Pitfall 3: Incorrect Enum Values
**Problem:** Using wrong enum values in code
**Solution:** Import enums from @prisma/client, not hardcoded strings

### ❌ Pitfall 4: Forgetting RLS Policies
**Problem:** Data leakage between organizations
**Solution:** ALWAYS enable RLS and create policies before inserting data

### ❌ Pitfall 5: Breaking Existing Relations
**Problem:** Adding relations breaks existing code
**Solution:** Use optional relations (?) when extending User/Organization models

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 2: Expense Module - Backend & API**
2. ✅ Database foundation is ready
3. ✅ Can start implementing business logic modules
4. ✅ Schema is extensible for future features

## Rollback Plan

If issues arise, rollback using Supabase MCP:

**Method 1: Drop Tables**
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    -- Drop tables in reverse order (to handle foreign keys)
    DROP TABLE IF EXISTS receipts CASCADE;
    DROP TABLE IF EXISTS expense_reports CASCADE;
    DROP TABLE IF EXISTS tax_estimates CASCADE;
    DROP TABLE IF EXISTS expenses CASCADE;
    DROP TABLE IF EXISTS expense_categories CASCADE;

    -- Drop enums
    DROP TYPE IF EXISTS "ExpenseCategory";
    DROP TYPE IF EXISTS "ExpenseStatus";
    DROP TYPE IF EXISTS "ReportType";
  `
}
```

**After Rollback:**
```bash
# Regenerate Prisma client to reflect current database state
npx prisma generate --schema=shared/prisma/schema.prisma
```

---

**Session 1 Complete:** ✅ Database foundation established, ready for module development
