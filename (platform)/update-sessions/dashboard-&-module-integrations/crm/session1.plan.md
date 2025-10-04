# Session 1: Database Foundation & Schema Extensions

## Session Overview
**Goal:** Establish the database foundation for the CRM integration by extending the Prisma schema with all required models and relationships.

**Duration:** 2-3 hours
**Complexity:** High
**Dependencies:** None (Foundation session)

## Objectives

1. ✅ Extend Prisma schema with CRM models (Lead, Contact, Deal, Listing, Activity, Appointment)
2. ✅ Add proper enums for status fields
3. ✅ Create relationships between models
4. ✅ Ensure multi-tenancy with organizationId on all tables
5. ✅ Generate and run migrations
6. ✅ Verify schema changes in database

## Prerequisites

- [x] Existing Prisma schema with customers table
- [x] Supabase database connection configured
- [x] Understanding of multi-tenant architecture
- [x] Access to shared/prisma/schema.prisma

## Database Models to Add

### 1. Lead Model
```prisma
model leads {
  id              String      @id @default(uuid())
  name            String
  email           String?
  phone           String?
  company         String?
  source          LeadSource  @default(WEBSITE)
  status          LeadStatus  @default(NEW_LEAD)
  score           LeadScore   @default(COLD)
  score_value     Int         @default(0)
  budget          Decimal?    @db.Decimal(12, 2)
  timeline        String?
  notes           String?     @db.Text
  tags            String[]    @default([])
  custom_fields   Json?       @db.JsonB

  // Multi-tenancy
  organization_id String
  assigned_to_id  String?

  // Timestamps
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt
  last_contact_at DateTime?

  // Relations
  organizations   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  assigned_to     users?        @relation("LeadAssignedTo", fields: [assigned_to_id], references: [id], onDelete: SetNull)
  activities      activities[]
  deals           deals[]

  @@index([organization_id])
  @@index([assigned_to_id])
  @@index([status])
  @@index([source])
  @@index([score])
  @@index([created_at])
  @@map("leads")
}
```

### 2. Contact Model
```prisma
model contacts {
  id              String        @id @default(uuid())
  name            String
  email           String?
  phone           String?
  company         String?
  position        String?
  type            ContactType   @default(PROSPECT)
  status          ContactStatus @default(ACTIVE)
  notes           String?       @db.Text
  tags            String[]      @default([])
  custom_fields   Json?         @db.JsonB

  // Social & Communication
  linkedin_url    String?
  twitter_url     String?
  preferred_contact_method String? // email, phone, text

  // Multi-tenancy
  organization_id String
  assigned_to_id  String?

  // Timestamps
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt
  last_contact_at DateTime?

  // Relations
  organizations   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  assigned_to     users?        @relation("ContactAssignedTo", fields: [assigned_to_id], references: [id], onDelete: SetNull)
  activities      activities[]
  deals           deals[]
  appointments    appointments[]

  @@index([organization_id])
  @@index([assigned_to_id])
  @@index([type])
  @@index([status])
  @@index([created_at])
  @@map("contacts")
}
```

### 3. Deal Model
```prisma
model deals {
  id                  String     @id @default(uuid())
  title               String
  description         String?    @db.Text
  value               Decimal    @db.Decimal(12, 2)
  stage               DealStage  @default(LEAD)
  status              DealStatus @default(ACTIVE)
  probability         Int        @default(50) // 0-100
  expected_close_date DateTime?
  actual_close_date   DateTime?
  lost_reason         String?
  notes               String?    @db.Text
  tags                String[]   @default([])
  custom_fields       Json?      @db.JsonB

  // Relations
  lead_id             String?
  contact_id          String?
  listing_id          String?

  // Multi-tenancy
  organization_id     String
  assigned_to_id      String?

  // Timestamps
  created_at          DateTime   @default(now())
  updated_at          DateTime   @updatedAt

  // Relations
  organizations       organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  assigned_to         users?        @relation("DealAssignedTo", fields: [assigned_to_id], references: [id], onDelete: SetNull)
  lead                leads?        @relation(fields: [lead_id], references: [id], onDelete: SetNull)
  contact             contacts?     @relation(fields: [contact_id], references: [id], onDelete: SetNull)
  listing             listings?     @relation(fields: [listing_id], references: [id], onDelete: SetNull)
  activities          activities[]

  @@index([organization_id])
  @@index([assigned_to_id])
  @@index([stage])
  @@index([status])
  @@index([expected_close_date])
  @@index([created_at])
  @@map("deals")
}
```

### 4. Listing Model (Real Estate Specific)
```prisma
model listings {
  id              String        @id @default(uuid())
  title           String
  description     String?       @db.Text

  // Property Details
  address         String
  city            String
  state           String
  zip_code        String
  country         String        @default("USA")

  // Property Specs
  property_type   PropertyType  @default(RESIDENTIAL)
  bedrooms        Int?
  bathrooms       Decimal?      @db.Decimal(3, 1) // 2.5 bathrooms
  square_feet     Int?
  lot_size        Decimal?      @db.Decimal(10, 2)
  year_built      Int?

  // Pricing
  price           Decimal       @db.Decimal(12, 2)
  price_per_sqft  Decimal?      @db.Decimal(10, 2)

  // Listing Status
  status          ListingStatus @default(ACTIVE)
  mls_number      String?
  listing_date    DateTime?
  expiration_date DateTime?

  // Media
  images          String[]      @default([]) // URLs to images
  virtual_tour_url String?

  // Additional Info
  features        String[]      @default([]) // pool, garage, etc.
  notes           String?       @db.Text
  tags            String[]      @default([])
  custom_fields   Json?         @db.JsonB

  // Multi-tenancy
  organization_id String
  assigned_to_id  String?       // Listing agent

  // Timestamps
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  // Relations
  organizations   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  assigned_to     users?        @relation("ListingAgent", fields: [assigned_to_id], references: [id], onDelete: SetNull)
  deals           deals[]
  activities      activities[]

  @@index([organization_id])
  @@index([assigned_to_id])
  @@index([status])
  @@index([city])
  @@index([state])
  @@index([property_type])
  @@index([created_at])
  @@map("listings")
}
```

### 5. Activity Model (Activity Tracking)
```prisma
model activities {
  id              String       @id @default(uuid())
  type            ActivityType
  title           String
  description     String?      @db.Text
  outcome         String?
  duration_minutes Int?

  // Relations
  lead_id         String?
  contact_id      String?
  deal_id         String?
  listing_id      String?

  // Multi-tenancy
  organization_id String
  created_by_id   String

  // Timestamps
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt
  completed_at    DateTime?

  // Relations
  organizations   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  created_by      users         @relation("ActivityCreatedBy", fields: [created_by_id], references: [id], onDelete: Cascade)
  lead            leads?        @relation(fields: [lead_id], references: [id], onDelete: SetNull)
  contact         contacts?     @relation(fields: [contact_id], references: [id], onDelete: SetNull)
  deal            deals?        @relation(fields: [deal_id], references: [id], onDelete: SetNull)
  listing         listings?     @relation(fields: [listing_id], references: [id], onDelete: SetNull)

  @@index([organization_id])
  @@index([created_by_id])
  @@index([type])
  @@index([lead_id])
  @@index([contact_id])
  @@index([deal_id])
  @@index([created_at])
  @@map("activities")
}
```

### 6. Enums
```prisma
enum LeadSource {
  WEBSITE
  REFERRAL
  GOOGLE_ADS
  SOCIAL_MEDIA
  COLD_CALL
  EMAIL_CAMPAIGN
  EVENT
  PARTNER
  OTHER
}

enum LeadStatus {
  NEW_LEAD
  IN_CONTACT
  QUALIFIED
  UNQUALIFIED
  CONVERTED
  LOST
}

enum LeadScore {
  HOT
  WARM
  COLD
}

enum ContactType {
  PROSPECT
  CLIENT
  PAST_CLIENT
  PARTNER
  VENDOR
}

enum ContactStatus {
  ACTIVE
  INACTIVE
  DO_NOT_CONTACT
}

enum DealStage {
  LEAD
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  CLOSING
  CLOSED_WON
  CLOSED_LOST
}

enum DealStatus {
  ACTIVE
  WON
  LOST
  ABANDONED
}

enum PropertyType {
  RESIDENTIAL
  COMMERCIAL
  LAND
  MULTI_FAMILY
  CONDO
  TOWNHOUSE
  LUXURY
}

enum ListingStatus {
  ACTIVE
  PENDING
  SOLD
  EXPIRED
  WITHDRAWN
  CONTINGENT
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  TASK
  NOTE
  SHOWING
  OPEN_HOUSE
  FOLLOW_UP
}
```

## Step-by-Step Implementation

### Step 1: Update Prisma Schema
**File:** `shared/prisma/schema.prisma`

1. Add all enums at the top of the schema file (after existing enums)
2. Add all models in the models section
3. Update existing User model to add new relations

**User Model Updates:**
```prisma
model users {
  // ... existing fields ...

  // CRM Relations
  assigned_leads      leads[]       @relation("LeadAssignedTo")
  assigned_contacts   contacts[]    @relation("ContactAssignedTo")
  assigned_deals      deals[]       @relation("DealAssignedTo")
  assigned_listings   listings[]    @relation("ListingAgent")
  created_activities  activities[]  @relation("ActivityCreatedBy")
  appointments        appointments[]

  // ... rest of model ...
}
```

### Step 2: Validate Schema

**Using Supabase MCP Tools:**

First, let's verify the schema is valid by checking current database structure:

```typescript
// Use Supabase MCP: list_tables
// This will show current tables in the database
```

**Tool to use:** `mcp__supabase__list_tables`
**Parameters:** `{ "schemas": ["public"] }`

### Step 3: Create Migration Using Supabase MCP

**IMPORTANT: Use Supabase MCP `apply_migration` tool instead of Prisma CLI**

For each model (leads, contacts, deals, listings, activities), create migrations using the `mcp__supabase__apply_migration` tool:

**Example for Leads table:**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_leads_table",
  "query": `
    -- Create LeadSource enum
    CREATE TYPE "LeadSource" AS ENUM (
      'WEBSITE', 'REFERRAL', 'GOOGLE_ADS', 'SOCIAL_MEDIA',
      'COLD_CALL', 'EMAIL_CAMPAIGN', 'EVENT', 'PARTNER', 'OTHER'
    );

    -- Create LeadStatus enum
    CREATE TYPE "LeadStatus" AS ENUM (
      'NEW_LEAD', 'IN_CONTACT', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST'
    );

    -- Create LeadScore enum
    CREATE TYPE "LeadScore" AS ENUM ('HOT', 'WARM', 'COLD');

    -- Create leads table
    CREATE TABLE leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      company VARCHAR(255),
      source "LeadSource" DEFAULT 'WEBSITE',
      status "LeadStatus" DEFAULT 'NEW_LEAD',
      score "LeadScore" DEFAULT 'COLD',
      score_value INTEGER DEFAULT 0,
      budget DECIMAL(12, 2),
      timeline VARCHAR(200),
      notes TEXT,
      tags TEXT[] DEFAULT '{}',
      custom_fields JSONB,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_contact_at TIMESTAMPTZ
    );

    -- Create indexes
    CREATE INDEX idx_leads_organization_id ON leads(organization_id);
    CREATE INDEX idx_leads_assigned_to_id ON leads(assigned_to_id);
    CREATE INDEX idx_leads_status ON leads(status);
    CREATE INDEX idx_leads_source ON leads(source);
    CREATE INDEX idx_leads_score ON leads(score);
    CREATE INDEX idx_leads_created_at ON leads(created_at);
  `
}
```

**Repeat for other tables:** contacts, deals, listings, activities (use similar migration approach)

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
// ✅ leads
// ✅ contacts
// ✅ deals
// ✅ listings
// ✅ activities

// Tool: mcp__supabase__execute_sql
// Query to verify table structure:
{
  "query": `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('leads', 'contacts', 'deals', 'listings', 'activities')
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
  "name": "add_crm_rls_policies",
  "query": `
    -- Enable RLS on CRM tables
    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

    -- RLS Policy for leads (tenant isolation)
    CREATE POLICY "tenant_isolation_leads" ON leads
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_leads_insert" ON leads
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for contacts
    CREATE POLICY "tenant_isolation_contacts" ON contacts
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_contacts_insert" ON contacts
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for deals
    CREATE POLICY "tenant_isolation_deals" ON deals
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_deals_insert" ON deals
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for listings
    CREATE POLICY "tenant_isolation_listings" ON listings
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_listings_insert" ON listings
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for activities
    CREATE POLICY "tenant_isolation_activities" ON activities
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_activities_insert" ON activities
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- Indexes for performance
    CREATE INDEX idx_leads_org_status ON leads(organization_id, status);
    CREATE INDEX idx_contacts_org_type ON contacts(organization_id, type);
    CREATE INDEX idx_deals_org_stage ON deals(organization_id, stage);
    CREATE INDEX idx_listings_org_status ON listings(organization_id, status);
    CREATE INDEX idx_activities_org_type ON activities(organization_id, type);
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
**Expected:** All new tables listed (leads, contacts, deals, listings, activities)

### Test 2: Migration Success

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__list_migrations
// Check migration history
```
**Expected:** All CRM migrations listed and applied

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
    AND table_name IN ('leads', 'contacts', 'deals', 'listings', 'activities')
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
    WHERE tablename IN ('leads', 'contacts', 'deals', 'listings', 'activities')
    ORDER BY tablename, policyname;
  `
}
```
**Expected:** Tenant isolation policies for all CRM tables

### Test 6: Insert Test Data (Optional)

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    INSERT INTO leads (
      id, name, email, phone, source, status, score, organization_id, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'Test Lead',
      'test@example.com',
      '555-1234',
      'WEBSITE',
      'NEW_LEAD',
      'WARM',
      '[your-org-id]',
      NOW(),
      NOW()
    )
    RETURNING *;
  `
}
```
**Expected:** Test lead created successfully

## Success Criteria

- [x] All 5 new models added to schema
- [x] All enums defined correctly
- [x] All relationships established
- [x] organizationId field on all tables (multi-tenancy)
- [x] Proper indexes created
- [x] Migration runs successfully
- [x] Prisma client generates without errors
- [x] RLS policies enabled on all tables
- [x] Can view tables in Prisma Studio
- [x] TypeScript types available for all models

## Files Modified

- ✅ `shared/prisma/schema.prisma` - Extended with CRM models
- ✅ `shared/prisma/migrations/[timestamp]_add_crm_models/migration.sql` - Auto-generated
- ✅ `shared/prisma/migrations/[timestamp]_add_crm_rls_policies/migration.sql` - Manual RLS policies

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing organizationId
**Problem:** Forgetting to add organization_id to a model
**Solution:** Every CRM model MUST have organization_id for multi-tenancy

### ❌ Pitfall 2: Missing Indexes
**Problem:** Slow queries on filtered fields
**Solution:** Add indexes on commonly queried fields (status, type, dates, organization_id)

### ❌ Pitfall 3: Incorrect Enum Values
**Problem:** Using wrong enum values in code
**Solution:** Import enums from @prisma/client, not hardcoded strings

### ❌ Pitfall 4: Forgetting RLS Policies
**Problem:** Data leakage between organizations
**Solution:** ALWAYS enable RLS and create policies before inserting data

### ❌ Pitfall 5: Breaking Existing Relations
**Problem:** Adding relations breaks existing code
**Solution:** Use optional relations (?) when extending User model

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 2: Leads Module - Backend & API**
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
    DROP TABLE IF EXISTS activities CASCADE;
    DROP TABLE IF EXISTS listings CASCADE;
    DROP TABLE IF EXISTS deals CASCADE;
    DROP TABLE IF EXISTS contacts CASCADE;
    DROP TABLE IF EXISTS leads CASCADE;

    -- Drop enums
    DROP TYPE IF EXISTS "LeadSource";
    DROP TYPE IF EXISTS "LeadStatus";
    DROP TYPE IF EXISTS "LeadScore";
    DROP TYPE IF EXISTS "ContactType";
    DROP TYPE IF EXISTS "ContactStatus";
    DROP TYPE IF EXISTS "DealStage";
    DROP TYPE IF EXISTS "DealStatus";
    DROP TYPE IF EXISTS "PropertyType";
    DROP TYPE IF EXISTS "ListingStatus";
    DROP TYPE IF EXISTS "ActivityType";
  `
}
```

**Method 2: Check Migration History and Revert**
```typescript
// First, list migrations
// Tool: mcp__supabase__list_migrations

// Then manually drop specific tables if needed
// Tool: mcp__supabase__execute_sql
{
  "query": "DROP TABLE [table_name] CASCADE;"
}
```

**After Rollback:**
```bash
# Regenerate Prisma client to reflect current database state
npx prisma generate --schema=shared/prisma/schema.prisma
```

---

**Session 1 Complete:** ✅ Database foundation established, ready for module development
