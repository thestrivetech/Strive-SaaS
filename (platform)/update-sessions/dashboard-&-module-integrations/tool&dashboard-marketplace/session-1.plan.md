# Session 1: Database Foundation & Marketplace Schema

## Session Overview
**Goal:** Establish the database foundation for the Tool & Dashboard Marketplace by extending the Prisma schema with all required models and relationships.

**Duration:** 2-3 hours
**Complexity:** High
**Dependencies:** None (Foundation session)

## Objectives

1. ✅ Extend Prisma schema with Marketplace models (MarketplaceTool, ToolPurchase, ToolBundle, BundlePurchase, ToolReview, ShoppingCart)
2. ✅ Add proper enums for categories, tiers, and statuses
3. ✅ Create relationships between models
4. ✅ Ensure multi-tenancy with organizationId on all tables
5. ✅ Generate and run migrations using Supabase MCP
6. ✅ Verify schema changes in database

## Prerequisites

- [x] Existing Prisma schema with User and Organization tables
- [x] Supabase database connection configured
- [x] Understanding of multi-tenant architecture
- [x] Access to shared/prisma/schema.prisma

## Database Models to Add

### 1. MarketplaceTool Model
```prisma
model marketplace_tools {
  id              String      @id @default(uuid())
  name            String
  description     String      @db.Text
  category        ToolCategory
  tier            ToolTier
  price           Int         // Price in cents
  is_active       Boolean     @default(true)

  // Features and capabilities
  features        String[]    @default([])
  capabilities    String[]    @default([])
  integrations    String[]    @default([])

  // Usage tracking
  purchase_count  Int         @default(0)
  rating          Decimal?    @db.Decimal(3, 2) // 0.00 to 5.00

  // Metadata
  icon            String?     // Icon name or image URL
  tags            String[]    @default([])

  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  // Relations
  purchases       tool_purchases[]
  reviews         tool_reviews[]
  bundles         bundle_tools[]

  @@index([category])
  @@index([tier])
  @@index([is_active])
  @@map("marketplace_tools")
}
```

### 2. ToolPurchase Model
```prisma
model tool_purchases {
  id                 String          @id @default(uuid())
  tool_id            String
  tool               marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade)

  // Purchase details
  price_at_purchase  Int             // Price when purchased (in cents)
  purchase_date      DateTime        @default(now())
  status             PurchaseStatus  @default(ACTIVE)

  // Usage tracking
  last_used          DateTime?
  usage_count        Int             @default(0)

  // Multi-tenant isolation
  organization_id    String
  organization       organizations   @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  purchased_by       String
  purchaser          users           @relation("ToolPurchases", fields: [purchased_by], references: [id], onDelete: Cascade)

  @@unique([tool_id, organization_id])
  @@index([organization_id])
  @@index([purchased_by])
  @@index([status])
  @@map("tool_purchases")
}
```

### 3. ToolBundle Model
```prisma
model tool_bundles {
  id              String      @id @default(uuid())
  name            String
  description     String      @db.Text
  bundle_type     BundleType
  original_price  Int         // Sum of individual tool prices
  bundle_price    Int         // Discounted bundle price
  discount        Decimal     @db.Decimal(5, 2) // Discount percentage

  // Bundle metadata
  is_active       Boolean     @default(true)
  is_popular      Boolean     @default(false)

  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  // Relations
  tools           bundle_tools[]
  purchases       bundle_purchases[]

  @@index([bundle_type])
  @@index([is_active])
  @@map("tool_bundles")
}
```

### 4. BundleTool Model (Junction Table)
```prisma
model bundle_tools {
  id        String            @id @default(uuid())
  bundle_id String
  bundle    tool_bundles      @relation(fields: [bundle_id], references: [id], onDelete: Cascade)
  tool_id   String
  tool      marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade)

  @@unique([bundle_id, tool_id])
  @@map("bundle_tools")
}
```

### 5. BundlePurchase Model
```prisma
model bundle_purchases {
  id                 String        @id @default(uuid())
  bundle_id          String
  bundle             tool_bundles  @relation(fields: [bundle_id], references: [id], onDelete: Cascade)

  price_at_purchase  Int           // Bundle price when purchased
  purchase_date      DateTime      @default(now())
  status             PurchaseStatus @default(ACTIVE)

  // Multi-tenant isolation
  organization_id    String
  organization       organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  purchased_by       String
  purchaser          users         @relation("BundlePurchases", fields: [purchased_by], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([purchased_by])
  @@index([status])
  @@map("bundle_purchases")
}
```

### 6. ToolReview Model
```prisma
model tool_reviews {
  id              String            @id @default(uuid())
  tool_id         String
  tool            marketplace_tools @relation(fields: [tool_id], references: [id], onDelete: Cascade)

  rating          Int               // 1-5 stars
  review          String?           @db.Text

  created_at      DateTime          @default(now())

  // Multi-tenant isolation
  organization_id String
  organization    organizations     @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  reviewer_id     String
  reviewer        users             @relation("ToolReviews", fields: [reviewer_id], references: [id], onDelete: Cascade)

  @@unique([tool_id, reviewer_id])
  @@index([tool_id])
  @@index([organization_id])
  @@map("tool_reviews")
}
```

### 7. ShoppingCart Model
```prisma
model shopping_carts {
  id              String        @id @default(uuid())

  // Cart contents (stored as JSON for flexibility)
  tools           Json          @default("[]") @db.JsonB // Array of tool IDs
  bundles         Json          @default("[]") @db.JsonB // Array of bundle IDs
  total_price     Int           @default(0)   // Total price in cents

  // Cart metadata
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization    organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  user_id         String        @unique
  user            users         @relation("ShoppingCart", fields: [user_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@map("shopping_carts")
}
```

### 8. Enums
```prisma
enum ToolCategory {
  FOUNDATION
  GROWTH
  ELITE
  CUSTOM
  ADVANCED
  INTEGRATION
}

enum ToolTier {
  T1   // $100 tools
  T2   // $200 tools
  T3   // $300 tools
}

enum BundleType {
  STARTER_PACK
  GROWTH_PACK
  ELITE_PACK
  CUSTOM_PACK
}

enum PurchaseStatus {
  ACTIVE
  CANCELLED
  REFUNDED
  EXPIRED
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

  // Tool Marketplace Relations
  tool_purchases      tool_purchases[]     @relation("ToolPurchases")
  bundle_purchases    bundle_purchases[]   @relation("BundlePurchases")
  tool_reviews        tool_reviews[]       @relation("ToolReviews")
  shopping_cart       shopping_carts?      @relation("ShoppingCart")

  // ... rest of model ...
}
```

**Organization Model Updates:**
```prisma
model organizations {
  // ... existing fields ...

  // Tool Marketplace Relations
  tool_purchases      tool_purchases[]
  bundle_purchases    bundle_purchases[]
  tool_reviews        tool_reviews[]
  shopping_carts      shopping_carts[]

  // ... rest of model ...
}
```

### Step 2: Create Migration Using Supabase MCP

**IMPORTANT: Use Supabase MCP `apply_migration` tool instead of Prisma CLI**

**Migration 1: Create Enums**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_marketplace_enums",
  "query": `
    -- Create ToolCategory enum
    CREATE TYPE "ToolCategory" AS ENUM (
      'FOUNDATION', 'GROWTH', 'ELITE', 'CUSTOM', 'ADVANCED', 'INTEGRATION'
    );

    -- Create ToolTier enum
    CREATE TYPE "ToolTier" AS ENUM ('T1', 'T2', 'T3');

    -- Create BundleType enum
    CREATE TYPE "BundleType" AS ENUM (
      'STARTER_PACK', 'GROWTH_PACK', 'ELITE_PACK', 'CUSTOM_PACK'
    );

    -- Create PurchaseStatus enum
    CREATE TYPE "PurchaseStatus" AS ENUM (
      'ACTIVE', 'CANCELLED', 'REFUNDED', 'EXPIRED'
    );
  `
}
```

**Migration 2: Create marketplace_tools Table**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_marketplace_tools_table",
  "query": `
    CREATE TABLE marketplace_tools (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category "ToolCategory" NOT NULL,
      tier "ToolTier" NOT NULL,
      price INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT true,
      features TEXT[] DEFAULT '{}',
      capabilities TEXT[] DEFAULT '{}',
      integrations TEXT[] DEFAULT '{}',
      purchase_count INTEGER DEFAULT 0,
      rating DECIMAL(3, 2),
      icon VARCHAR(255),
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_marketplace_tools_category ON marketplace_tools(category);
    CREATE INDEX idx_marketplace_tools_tier ON marketplace_tools(tier);
    CREATE INDEX idx_marketplace_tools_is_active ON marketplace_tools(is_active);
  `
}
```

**Migration 3: Create tool_purchases Table**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_tool_purchases_table",
  "query": `
    CREATE TABLE tool_purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID NOT NULL REFERENCES marketplace_tools(id) ON DELETE CASCADE,
      price_at_purchase INTEGER NOT NULL,
      purchase_date TIMESTAMPTZ DEFAULT NOW(),
      status "PurchaseStatus" DEFAULT 'ACTIVE',
      last_used TIMESTAMPTZ,
      usage_count INTEGER DEFAULT 0,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      purchased_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(tool_id, organization_id)
    );

    -- Create indexes
    CREATE INDEX idx_tool_purchases_organization_id ON tool_purchases(organization_id);
    CREATE INDEX idx_tool_purchases_purchased_by ON tool_purchases(purchased_by);
    CREATE INDEX idx_tool_purchases_status ON tool_purchases(status);
  `
}
```

**Migration 4: Create tool_bundles and bundle_tools Tables**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_bundles_tables",
  "query": `
    -- Create tool_bundles table
    CREATE TABLE tool_bundles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      bundle_type "BundleType" NOT NULL,
      original_price INTEGER NOT NULL,
      bundle_price INTEGER NOT NULL,
      discount DECIMAL(5, 2) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      is_popular BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create bundle_tools junction table
    CREATE TABLE bundle_tools (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bundle_id UUID NOT NULL REFERENCES tool_bundles(id) ON DELETE CASCADE,
      tool_id UUID NOT NULL REFERENCES marketplace_tools(id) ON DELETE CASCADE,
      UNIQUE(bundle_id, tool_id)
    );

    -- Create indexes
    CREATE INDEX idx_tool_bundles_bundle_type ON tool_bundles(bundle_type);
    CREATE INDEX idx_tool_bundles_is_active ON tool_bundles(is_active);
  `
}
```

**Migration 5: Create bundle_purchases Table**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_bundle_purchases_table",
  "query": `
    CREATE TABLE bundle_purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bundle_id UUID NOT NULL REFERENCES tool_bundles(id) ON DELETE CASCADE,
      price_at_purchase INTEGER NOT NULL,
      purchase_date TIMESTAMPTZ DEFAULT NOW(),
      status "PurchaseStatus" DEFAULT 'ACTIVE',
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      purchased_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX idx_bundle_purchases_organization_id ON bundle_purchases(organization_id);
    CREATE INDEX idx_bundle_purchases_purchased_by ON bundle_purchases(purchased_by);
    CREATE INDEX idx_bundle_purchases_status ON bundle_purchases(status);
  `
}
```

**Migration 6: Create tool_reviews Table**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_tool_reviews_table",
  "query": `
    CREATE TABLE tool_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID NOT NULL REFERENCES marketplace_tools(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(tool_id, reviewer_id)
    );

    -- Create indexes
    CREATE INDEX idx_tool_reviews_tool_id ON tool_reviews(tool_id);
    CREATE INDEX idx_tool_reviews_organization_id ON tool_reviews(organization_id);
  `
}
```

**Migration 7: Create shopping_carts Table**
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_shopping_carts_table",
  "query": `
    CREATE TABLE shopping_carts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tools JSONB DEFAULT '[]',
      bundles JSONB DEFAULT '[]',
      total_price INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX idx_shopping_carts_organization_id ON shopping_carts(organization_id);
  `
}
```

### Step 3: Add RLS Policies Using Supabase MCP

**Use `mcp__supabase__apply_migration` tool for RLS policies:**

```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "add_marketplace_rls_policies",
  "query": `
    -- Enable RLS on Marketplace tables
    ALTER TABLE tool_purchases ENABLE ROW LEVEL SECURITY;
    ALTER TABLE bundle_purchases ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;

    -- Note: marketplace_tools and tool_bundles are read-only for all, no RLS needed

    -- RLS Policy for tool_purchases (tenant isolation)
    CREATE POLICY "tenant_isolation_tool_purchases" ON tool_purchases
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_tool_purchases_insert" ON tool_purchases
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for bundle_purchases
    CREATE POLICY "tenant_isolation_bundle_purchases" ON bundle_purchases
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_bundle_purchases_insert" ON bundle_purchases
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for tool_reviews
    CREATE POLICY "tenant_isolation_tool_reviews" ON tool_reviews
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_tool_reviews_insert" ON tool_reviews
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- RLS Policy for shopping_carts
    CREATE POLICY "tenant_isolation_shopping_carts" ON shopping_carts
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_shopping_carts_insert" ON shopping_carts
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- Composite indexes for performance
    CREATE INDEX idx_tool_purchases_org_status ON tool_purchases(organization_id, status);
    CREATE INDEX idx_bundle_purchases_org_status ON bundle_purchases(organization_id, status);
  `
}
```

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
// ✅ marketplace_tools
// ✅ tool_purchases
// ✅ tool_bundles
// ✅ bundle_tools
// ✅ bundle_purchases
// ✅ tool_reviews
// ✅ shopping_carts

// Tool: mcp__supabase__execute_sql
// Query to verify table structure:
{
  "query": `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN (
      'marketplace_tools', 'tool_purchases', 'tool_bundles',
      'bundle_tools', 'bundle_purchases', 'tool_reviews', 'shopping_carts'
    )
    ORDER BY table_name, ordinal_position;
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
**Expected:** All new marketplace tables listed

### Test 2: Migration Success

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__list_migrations
// Check migration history
```
**Expected:** All marketplace migrations listed and applied

### Test 3: Type Generation

```bash
npx prisma generate --schema=shared/prisma/schema.prisma
```
**Expected:** Types generated in node_modules/@prisma/client

### Test 4: Verify RLS Policies

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
    WHERE tablename IN (
      'tool_purchases', 'bundle_purchases', 'tool_reviews', 'shopping_carts'
    )
    ORDER BY tablename, policyname;
  `
}
```
**Expected:** Tenant isolation policies for all marketplace tables

## Success Criteria

- [x] All 7 new models added to schema
- [x] All enums defined correctly
- [x] All relationships established
- [x] organizationId field on multi-tenant tables
- [x] Proper indexes created
- [x] Migrations run successfully via Supabase MCP
- [x] Prisma client generates without errors
- [x] RLS policies enabled on multi-tenant tables
- [x] TypeScript types available for all models

## Files Modified

- ✅ `shared/prisma/schema.prisma` - Extended with Marketplace models

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing organizationId
**Problem:** Forgetting to add organization_id to multi-tenant models
**Solution:** tool_purchases, bundle_purchases, tool_reviews, shopping_carts MUST have organization_id

### ❌ Pitfall 2: Missing Indexes
**Problem:** Slow queries on filtered fields
**Solution:** Add indexes on commonly queried fields (category, tier, status, organization_id)

### ❌ Pitfall 3: Incorrect Enum Values
**Problem:** Using wrong enum values in code
**Solution:** Import enums from @prisma/client, not hardcoded strings

### ❌ Pitfall 4: Forgetting RLS Policies
**Problem:** Data leakage between organizations
**Solution:** ALWAYS enable RLS on multi-tenant tables (purchases, reviews, carts)

### ❌ Pitfall 5: marketplace_tools Not Multi-tenant
**Problem:** marketplace_tools is a global catalog, not per-organization
**Solution:** NO organization_id on marketplace_tools (it's shared), but purchases ARE per-org

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 2: Marketplace Module - Backend & Schemas**
2. ✅ Database foundation is ready
3. ✅ Can start implementing business logic modules
4. ✅ Schema is extensible for future features

## Rollback Plan

If issues arise, rollback using Supabase MCP:

```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    -- Drop tables in reverse order (to handle foreign keys)
    DROP TABLE IF EXISTS shopping_carts CASCADE;
    DROP TABLE IF EXISTS tool_reviews CASCADE;
    DROP TABLE IF EXISTS bundle_purchases CASCADE;
    DROP TABLE IF EXISTS bundle_tools CASCADE;
    DROP TABLE IF EXISTS tool_bundles CASCADE;
    DROP TABLE IF EXISTS tool_purchases CASCADE;
    DROP TABLE IF EXISTS marketplace_tools CASCADE;

    -- Drop enums
    DROP TYPE IF EXISTS "ToolCategory";
    DROP TYPE IF EXISTS "ToolTier";
    DROP TYPE IF EXISTS "BundleType";
    DROP TYPE IF EXISTS "PurchaseStatus";
  `
}
```

**After Rollback:**
```bash
# Regenerate Prisma client to reflect current database state
npx prisma generate --schema=shared/prisma/schema.prisma
```

---

**Session 1 Complete:** ✅ Marketplace database foundation established, ready for module development
