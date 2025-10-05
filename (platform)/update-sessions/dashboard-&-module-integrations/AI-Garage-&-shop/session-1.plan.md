# Session 1: Database Foundation & AI Garage Schema

## Session Overview
**Goal:** Establish the database foundation for AI Garage & Shop by extending the Prisma schema with all required models, relationships, and RLS policies.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** None (Foundation session)

## Objectives

1. ✅ Extend Prisma schema with AI Garage models (CustomAgentOrder, AgentTemplate, ToolBlueprint, etc.)
2. ✅ Add proper enums for AI Garage fields
3. ✅ Create relationships between models
4. ✅ Ensure multi-tenancy with organizationId on all tables
5. ✅ Generate and run migrations using Supabase MCP tools
6. ✅ Add RLS policies for tenant isolation
7. ✅ Verify schema changes in database

## Prerequisites

- [x] Existing Prisma schema with User and Organization models
- [x] Supabase database connection configured
- [x] Understanding of multi-tenant architecture
- [x] Access to shared/prisma/schema.prisma
- [x] Supabase MCP tools available

## Database Models to Add

### 1. CustomAgentOrder Model
```prisma
model custom_agent_orders {
  id              String        @id @default(uuid())
  title           String        @db.VarChar(100)
  description     String        @db.Text
  requirements    Json          @db.JsonB
  use_case        String        @db.VarChar(200)
  complexity      ComplexityLevel
  estimated_hours Int?
  estimated_cost  Decimal?      @db.Decimal(12, 2)

  // Status tracking
  status          OrderStatus   @default(DRAFT)
  priority        OrderPriority @default(NORMAL)
  submitted_at    DateTime?
  started_at      DateTime?
  completed_at    DateTime?
  delivered_at    DateTime?

  // Progress tracking
  progress        Int           @default(0) // 0-100
  current_stage   String?       @db.VarChar(50)

  // Configuration
  agent_config    Json          @db.JsonB
  tools_config    Json          @db.JsonB

  // Multi-tenancy
  organization_id String
  created_by_id   String
  assigned_to_id  String?

  // Timestamps
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  // Relations
  organizations   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator         users         @relation("OrderCreator", fields: [created_by_id], references: [id], onDelete: Cascade)
  assignee        users?        @relation("OrderAssignee", fields: [assigned_to_id], references: [id], onDelete: SetNull)
  milestones      order_milestones[]
  build_logs      build_logs[]

  @@index([organization_id])
  @@index([created_by_id])
  @@index([assigned_to_id])
  @@index([status])
  @@index([complexity])
  @@index([created_at])
  @@map("custom_agent_orders")
}
```

### 2. AgentTemplate Model
```prisma
model agent_templates {
  id                String        @id @default(uuid())
  name              String        @db.VarChar(100)
  description       String        @db.Text
  category          AgentCategory
  avatar            String?       @db.VarChar(500)

  // Configuration preset
  personality_config Json         @db.JsonB
  model_config       Json         @db.JsonB
  tools_config       Json         @db.JsonB
  memory_config      Json         @db.JsonB

  // Template metadata
  tags              String[]      @default([])
  features          String[]      @default([])
  use_cases         String[]      @default([])

  // Usage and ratings
  usage_count       Int           @default(0)
  rating            Decimal?      @db.Decimal(3, 2)
  is_popular        Boolean       @default(false)

  // Visibility
  is_public         Boolean       @default(false)
  is_system         Boolean       @default(false)

  // Multi-tenancy (nullable for system templates)
  organization_id   String?
  created_by_id     String?

  // Timestamps
  created_at        DateTime      @default(now())
  updated_at        DateTime      @updatedAt

  // Relations
  organizations     organizations? @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator           users?         @relation("TemplateCreator", fields: [created_by_id], references: [id], onDelete: SetNull)
  reviews           template_reviews[]

  @@index([organization_id])
  @@index([created_by_id])
  @@index([category])
  @@index([is_public])
  @@index([is_system])
  @@map("agent_templates")
}
```

### 3. ToolBlueprint Model
```prisma
model tool_blueprints {
  id              String        @id @default(uuid())
  name            String        @db.VarChar(100)
  description     String        @db.Text
  category        ToolCategory

  // Visual programming components
  components      Json          @db.JsonB
  connections     Json          @db.JsonB
  configuration   Json          @db.JsonB

  // Blueprint metadata
  version         String        @db.VarChar(20) @default("1.0.0")
  tags            String[]      @default([])
  complexity      ComplexityLevel

  // Usage tracking
  usage_count     Int           @default(0)
  is_public       Boolean       @default(false)

  // Multi-tenancy
  organization_id String
  created_by_id   String

  // Timestamps
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt

  // Relations
  organizations   organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator         users         @relation("BlueprintCreator", fields: [created_by_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([created_by_id])
  @@index([category])
  @@index([is_public])
  @@map("tool_blueprints")
}
```

### 4. OrderMilestone Model
```prisma
model order_milestones {
  id              String              @id @default(uuid())
  order_id        String

  name            String              @db.VarChar(100)
  description     String?             @db.Text
  stage           String              @db.VarChar(50)
  due_date        DateTime?
  completed_at    DateTime?
  is_completed    Boolean             @default(false)

  sort_order      Int                 @default(0)
  created_at      DateTime            @default(now())

  // Relations
  order           custom_agent_orders @relation(fields: [order_id], references: [id], onDelete: Cascade)

  @@index([order_id])
  @@index([stage])
  @@map("order_milestones")
}
```

### 5. BuildLog Model
```prisma
model build_logs {
  id              String              @id @default(uuid())
  order_id        String

  stage           String              @db.VarChar(50)
  message         String              @db.Text
  details         Json?               @db.JsonB
  log_level       LogLevel            @default(INFO)

  created_at      DateTime            @default(now())

  // Relations
  order           custom_agent_orders @relation(fields: [order_id], references: [id], onDelete: Cascade)

  @@index([order_id])
  @@index([log_level])
  @@index([created_at])
  @@map("build_logs")
}
```

### 6. TemplateReview Model
```prisma
model template_reviews {
  id              String         @id @default(uuid())
  template_id     String

  rating          Int            // 1-5 stars
  review          String?        @db.Text

  // Multi-tenancy
  organization_id String
  reviewer_id     String

  created_at      DateTime       @default(now())

  // Relations
  template        agent_templates @relation(fields: [template_id], references: [id], onDelete: Cascade)
  organizations   organizations   @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  reviewer        users           @relation("TemplateReviewer", fields: [reviewer_id], references: [id], onDelete: Cascade)

  @@unique([template_id, reviewer_id])
  @@index([template_id])
  @@index([organization_id])
  @@map("template_reviews")
}
```

### 7. ProjectShowcase Model
```prisma
model project_showcases {
  id              String           @id @default(uuid())
  title           String           @db.VarChar(100)
  description     String           @db.Text
  category        ShowcaseCategory

  // Project details
  image_url       String?          @db.VarChar(500)
  demo_url        String?          @db.VarChar(500)
  features        String[]         @default([])
  technologies    String[]         @default([])

  // Metrics
  views           Int              @default(0)
  likes           Int              @default(0)
  is_public       Boolean          @default(false)
  is_featured     Boolean          @default(false)

  // Multi-tenancy
  organization_id String
  created_by_id   String

  // Timestamps
  created_at      DateTime         @default(now())
  updated_at      DateTime         @updatedAt

  // Relations
  organizations   organizations    @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  creator         users            @relation("ShowcaseCreator", fields: [created_by_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([created_by_id])
  @@index([category])
  @@index([is_public])
  @@index([is_featured])
  @@map("project_showcases")
}
```

### 8. Enums
```prisma
enum ComplexityLevel {
  SIMPLE       // 1-8 hours
  MODERATE     // 8-24 hours
  COMPLEX      // 24-72 hours
  ENTERPRISE   // 72+ hours
}

enum OrderStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  IN_PROGRESS
  TESTING
  COMPLETED
  DELIVERED
  CANCELLED
  REJECTED
}

enum OrderPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum AgentCategory {
  SALES
  SUPPORT
  ANALYSIS
  CONTENT
  AUTOMATION
  RESEARCH
}

enum ToolCategory {
  AUTOMATION
  ANALYTICS
  INTEGRATION
  UI
  API
  WORKFLOW
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}

enum ShowcaseCategory {
  AI_AGENT
  AUTOMATION_TOOL
  INTEGRATION
  WORKFLOW
  CUSTOM_SOLUTION
}
```

## Step-by-Step Implementation

### Step 1: Update Prisma Schema

**File:** `shared/prisma/schema.prisma`

1. Add all enums after existing enums
2. Add all models in the models section
3. Update existing User and Organization models to add new relations

**User Model Updates:**
```prisma
model users {
  // ... existing fields ...

  // AI Garage Relations
  agent_orders        custom_agent_orders[]  @relation("OrderCreator")
  assigned_builds     custom_agent_orders[]  @relation("OrderAssignee")
  agent_templates     agent_templates[]      @relation("TemplateCreator")
  tool_blueprints     tool_blueprints[]      @relation("BlueprintCreator")
  template_reviews    template_reviews[]     @relation("TemplateReviewer")
  project_showcases   project_showcases[]    @relation("ShowcaseCreator")

  // ... rest of model ...
}
```

**Organization Model Updates:**
```prisma
model organizations {
  // ... existing fields ...

  // AI Garage Relations
  agent_orders        custom_agent_orders[]
  agent_templates     agent_templates[]
  tool_blueprints     tool_blueprints[]
  template_reviews    template_reviews[]
  project_showcases   project_showcases[]

  // ... rest of model ...
}
```

### Step 2: Create Migrations Using Supabase MCP

**IMPORTANT: Use Supabase MCP `apply_migration` tool instead of Prisma CLI**

#### Migration 1: Create Enums

**Tool:** `mcp__supabase__apply_migration`
**Parameters:**
```typescript
{
  "name": "create_ai_garage_enums",
  "query": `
    -- Create ComplexityLevel enum
    CREATE TYPE "ComplexityLevel" AS ENUM (
      'SIMPLE', 'MODERATE', 'COMPLEX', 'ENTERPRISE'
    );

    -- Create OrderStatus enum
    CREATE TYPE "OrderStatus" AS ENUM (
      'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'IN_PROGRESS',
      'TESTING', 'COMPLETED', 'DELIVERED', 'CANCELLED', 'REJECTED'
    );

    -- Create OrderPriority enum
    CREATE TYPE "OrderPriority" AS ENUM (
      'LOW', 'NORMAL', 'HIGH', 'URGENT'
    );

    -- Create AgentCategory enum
    CREATE TYPE "AgentCategory" AS ENUM (
      'SALES', 'SUPPORT', 'ANALYSIS', 'CONTENT', 'AUTOMATION', 'RESEARCH'
    );

    -- Create ToolCategory enum
    CREATE TYPE "ToolCategory" AS ENUM (
      'AUTOMATION', 'ANALYTICS', 'INTEGRATION', 'UI', 'API', 'WORKFLOW'
    );

    -- Create LogLevel enum
    CREATE TYPE "LogLevel" AS ENUM (
      'DEBUG', 'INFO', 'WARN', 'ERROR'
    );

    -- Create ShowcaseCategory enum
    CREATE TYPE "ShowcaseCategory" AS ENUM (
      'AI_AGENT', 'AUTOMATION_TOOL', 'INTEGRATION', 'WORKFLOW', 'CUSTOM_SOLUTION'
    );
  `
}
```

#### Migration 2: Create CustomAgentOrder Table

**Tool:** `mcp__supabase__apply_migration`
**Parameters:**
```typescript
{
  "name": "create_custom_agent_orders_table",
  "query": `
    CREATE TABLE custom_agent_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      requirements JSONB NOT NULL,
      use_case VARCHAR(200) NOT NULL,
      complexity "ComplexityLevel" NOT NULL,
      estimated_hours INTEGER,
      estimated_cost DECIMAL(12, 2),
      status "OrderStatus" DEFAULT 'DRAFT',
      priority "OrderPriority" DEFAULT 'NORMAL',
      submitted_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      progress INTEGER DEFAULT 0,
      current_stage VARCHAR(50),
      agent_config JSONB NOT NULL,
      tools_config JSONB NOT NULL,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_orders_organization_id ON custom_agent_orders(organization_id);
    CREATE INDEX idx_orders_created_by_id ON custom_agent_orders(created_by_id);
    CREATE INDEX idx_orders_assigned_to_id ON custom_agent_orders(assigned_to_id);
    CREATE INDEX idx_orders_status ON custom_agent_orders(status);
    CREATE INDEX idx_orders_complexity ON custom_agent_orders(complexity);
    CREATE INDEX idx_orders_created_at ON custom_agent_orders(created_at);
  `
}
```

#### Migration 3: Create AgentTemplate Table

**Tool:** `mcp__supabase__apply_migration`
**Parameters:**
```typescript
{
  "name": "create_agent_templates_table",
  "query": `
    CREATE TABLE agent_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      category "AgentCategory" NOT NULL,
      avatar VARCHAR(500),
      personality_config JSONB NOT NULL,
      model_config JSONB NOT NULL,
      tools_config JSONB NOT NULL,
      memory_config JSONB NOT NULL,
      tags TEXT[] DEFAULT '{}',
      features TEXT[] DEFAULT '{}',
      use_cases TEXT[] DEFAULT '{}',
      usage_count INTEGER DEFAULT 0,
      rating DECIMAL(3, 2),
      is_popular BOOLEAN DEFAULT false,
      is_public BOOLEAN DEFAULT false,
      is_system BOOLEAN DEFAULT false,
      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_templates_organization_id ON agent_templates(organization_id);
    CREATE INDEX idx_templates_created_by_id ON agent_templates(created_by_id);
    CREATE INDEX idx_templates_category ON agent_templates(category);
    CREATE INDEX idx_templates_is_public ON agent_templates(is_public);
    CREATE INDEX idx_templates_is_system ON agent_templates(is_system);
  `
}
```

#### Migration 4: Create ToolBlueprint Table

**Tool:** `mcp__supabase__apply_migration`
**Parameters:**
```typescript
{
  "name": "create_tool_blueprints_table",
  "query": `
    CREATE TABLE tool_blueprints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      category "ToolCategory" NOT NULL,
      components JSONB NOT NULL,
      connections JSONB NOT NULL,
      configuration JSONB NOT NULL,
      version VARCHAR(20) DEFAULT '1.0.0',
      tags TEXT[] DEFAULT '{}',
      complexity "ComplexityLevel" NOT NULL,
      usage_count INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT false,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_blueprints_organization_id ON tool_blueprints(organization_id);
    CREATE INDEX idx_blueprints_created_by_id ON tool_blueprints(created_by_id);
    CREATE INDEX idx_blueprints_category ON tool_blueprints(category);
    CREATE INDEX idx_blueprints_is_public ON tool_blueprints(is_public);
  `
}
```

#### Migration 5: Create Supporting Tables

**Tool:** `mcp__supabase__apply_migration`
**Parameters:**
```typescript
{
  "name": "create_ai_garage_supporting_tables",
  "query": `
    -- Order Milestones
    CREATE TABLE order_milestones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES custom_agent_orders(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      stage VARCHAR(50) NOT NULL,
      due_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      is_completed BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_milestones_order_id ON order_milestones(order_id);
    CREATE INDEX idx_milestones_stage ON order_milestones(stage);

    -- Build Logs
    CREATE TABLE build_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES custom_agent_orders(id) ON DELETE CASCADE,
      stage VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      details JSONB,
      log_level "LogLevel" DEFAULT 'INFO',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_logs_order_id ON build_logs(order_id);
    CREATE INDEX idx_logs_log_level ON build_logs(log_level);
    CREATE INDEX idx_logs_created_at ON build_logs(created_at);

    -- Template Reviews
    CREATE TABLE template_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id UUID NOT NULL REFERENCES agent_templates(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      review TEXT,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(template_id, reviewer_id)
    );
    CREATE INDEX idx_reviews_template_id ON template_reviews(template_id);
    CREATE INDEX idx_reviews_organization_id ON template_reviews(organization_id);

    -- Project Showcases
    CREATE TABLE project_showcases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      category "ShowcaseCategory" NOT NULL,
      image_url VARCHAR(500),
      demo_url VARCHAR(500),
      features TEXT[] DEFAULT '{}',
      technologies TEXT[] DEFAULT '{}',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT false,
      is_featured BOOLEAN DEFAULT false,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX idx_showcases_organization_id ON project_showcases(organization_id);
    CREATE INDEX idx_showcases_created_by_id ON project_showcases(created_by_id);
    CREATE INDEX idx_showcases_category ON project_showcases(category);
    CREATE INDEX idx_showcases_is_public ON project_showcases(is_public);
    CREATE INDEX idx_showcases_is_featured ON project_showcases(is_featured);
  `
}
```

### Step 3: Add RLS Policies

**Tool:** `mcp__supabase__apply_migration`
**Parameters:**
```typescript
{
  "name": "add_ai_garage_rls_policies",
  "query": `
    -- Enable RLS on all AI Garage tables
    ALTER TABLE custom_agent_orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tool_blueprints ENABLE ROW LEVEL SECURITY;
    ALTER TABLE order_milestones ENABLE ROW LEVEL SECURITY;
    ALTER TABLE build_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE project_showcases ENABLE ROW LEVEL SECURITY;

    -- CustomAgentOrder RLS Policies
    CREATE POLICY "tenant_isolation_orders" ON custom_agent_orders
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_orders_insert" ON custom_agent_orders
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- AgentTemplate RLS Policies (allow public templates + org templates)
    CREATE POLICY "template_access" ON agent_templates
      USING (
        is_public = true OR
        is_system = true OR
        organization_id = current_setting('app.current_org_id')::uuid
      );

    CREATE POLICY "template_insert" ON agent_templates
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- ToolBlueprint RLS Policies
    CREATE POLICY "tenant_isolation_blueprints" ON tool_blueprints
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_blueprints_insert" ON tool_blueprints
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- OrderMilestone RLS Policies (via order)
    CREATE POLICY "milestone_access" ON order_milestones
      USING (
        EXISTS (
          SELECT 1 FROM custom_agent_orders
          WHERE custom_agent_orders.id = order_milestones.order_id
          AND custom_agent_orders.organization_id = current_setting('app.current_org_id')::uuid
        )
      );

    -- BuildLog RLS Policies (via order)
    CREATE POLICY "build_log_access" ON build_logs
      USING (
        EXISTS (
          SELECT 1 FROM custom_agent_orders
          WHERE custom_agent_orders.id = build_logs.order_id
          AND custom_agent_orders.organization_id = current_setting('app.current_org_id')::uuid
        )
      );

    -- TemplateReview RLS Policies
    CREATE POLICY "tenant_isolation_reviews" ON template_reviews
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_reviews_insert" ON template_reviews
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- ProjectShowcase RLS Policies (allow public + org showcases)
    CREATE POLICY "showcase_access" ON project_showcases
      USING (
        is_public = true OR
        organization_id = current_setting('app.current_org_id')::uuid
      );

    CREATE POLICY "showcase_insert" ON project_showcases
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);
  `
}
```

### Step 4: Generate Prisma Client

After applying migrations via Supabase MCP, generate the Prisma client locally:

```bash
cd C:\Users\zochr\Desktop\GitHub\Strive-SaaS
npx prisma generate --schema=shared/prisma/schema.prisma
```

**Note:** This only generates TypeScript types locally, doesn't modify database.

### Step 5: Verify in Database

**Using Supabase MCP:**

```typescript
// Tool: mcp__supabase__list_tables
// Verify all tables exist:
// ✅ custom_agent_orders
// ✅ agent_templates
// ✅ tool_blueprints
// ✅ order_milestones
// ✅ build_logs
// ✅ template_reviews
// ✅ project_showcases

// Tool: mcp__supabase__execute_sql
// Query to verify table structure:
{
  "query": `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN (
      'custom_agent_orders', 'agent_templates', 'tool_blueprints',
      'order_milestones', 'build_logs', 'template_reviews', 'project_showcases'
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
**Expected:** All new tables listed

### Test 2: Migration Success

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__list_migrations
// Check migration history
```
**Expected:** All AI Garage migrations listed and applied

### Test 3: Type Generation

```bash
npx prisma generate --schema=shared/prisma/schema.prisma
```
**Expected:** Types generated in node_modules/@prisma/client

### Test 4: Verify RLS Policies

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    SELECT
      tablename,
      policyname,
      cmd,
      qual
    FROM pg_policies
    WHERE tablename IN (
      'custom_agent_orders', 'agent_templates', 'tool_blueprints',
      'order_milestones', 'build_logs', 'template_reviews', 'project_showcases'
    )
    ORDER BY tablename, policyname;
  `
}
```
**Expected:** Tenant isolation policies for all tables

## Success Criteria

- [x] All 7 new models added to schema
- [x] All enums defined correctly
- [x] All relationships established
- [x] organizationId field on all tables (multi-tenancy)
- [x] Proper indexes created
- [x] Migrations applied successfully via Supabase MCP
- [x] Prisma client generates without errors
- [x] RLS policies enabled on all tables
- [x] TypeScript types available for all models

## Files Modified

- ✅ `shared/prisma/schema.prisma` - Extended with AI Garage models

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing organizationId
**Problem:** Forgetting to add organization_id to a model
**Solution:** Every AI Garage model MUST have organization_id for multi-tenancy

### ❌ Pitfall 2: Missing Indexes
**Problem:** Slow queries on filtered fields
**Solution:** Add indexes on commonly queried fields (status, category, dates, organization_id)

### ❌ Pitfall 3: Incorrect Enum Values
**Problem:** Using wrong enum values in code
**Solution:** Import enums from @prisma/client, not hardcoded strings

### ❌ Pitfall 4: Forgetting RLS Policies
**Problem:** Data leakage between organizations
**Solution:** ALWAYS enable RLS and create policies before inserting data

### ❌ Pitfall 5: Public Template Access
**Problem:** System templates not accessible across orgs
**Solution:** Use is_system flag and proper RLS policies for public/system templates

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 2: Agent Orders Module - Backend & API**
2. ✅ Database foundation is ready
3. ✅ Can start implementing business logic modules
4. ✅ Schema is extensible for future features

## Rollback Plan

If issues arise, rollback using Supabase MCP:

```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    -- Drop tables in reverse order
    DROP TABLE IF EXISTS project_showcases CASCADE;
    DROP TABLE IF EXISTS template_reviews CASCADE;
    DROP TABLE IF EXISTS build_logs CASCADE;
    DROP TABLE IF EXISTS order_milestones CASCADE;
    DROP TABLE IF EXISTS tool_blueprints CASCADE;
    DROP TABLE IF EXISTS agent_templates CASCADE;
    DROP TABLE IF EXISTS custom_agent_orders CASCADE;

    -- Drop enums
    DROP TYPE IF EXISTS "ComplexityLevel";
    DROP TYPE IF EXISTS "OrderStatus";
    DROP TYPE IF EXISTS "OrderPriority";
    DROP TYPE IF EXISTS "AgentCategory";
    DROP TYPE IF EXISTS "ToolCategory";
    DROP TYPE IF EXISTS "LogLevel";
    DROP TYPE IF EXISTS "ShowcaseCategory";
  `
}
```

**After Rollback:**
```bash
npx prisma generate --schema=shared/prisma/schema.prisma
```

---

**Session 1 Complete:** ✅ Database foundation established, ready for module development
