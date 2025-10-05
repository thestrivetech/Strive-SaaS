# Session 1: Database Foundation & REID Schema

## Session Overview
**Goal:** Establish the database foundation for REID Dashboard by extending the Prisma schema with all required models for real estate intelligence analytics.

**Duration:** 2-3 hours
**Complexity:** High
**Dependencies:** None (Foundation session)

## Objectives

1. ✅ Extend Prisma schema with REID models (NeighborhoodInsight, PropertyAlert, AlertTrigger, MarketReport, UserPreference)
2. ✅ Add proper enums for area types, alert types, and report types
3. ✅ Create relationships between REID models and existing models
4. ✅ Ensure multi-tenancy with organizationId on all tables
5. ✅ Apply migrations using Supabase MCP
6. ✅ Enable RLS policies for tenant isolation
7. ✅ Verify schema changes in database

## Prerequisites

- [x] Existing Prisma schema with User and Organization models
- [x] Supabase database connection configured
- [x] Understanding of multi-tenant architecture with RLS
- [x] Access to shared/prisma/schema.prisma
- [x] Supabase MCP tools available

## Database Models to Add

### 1. NeighborhoodInsight Model
```prisma
model neighborhood_insights {
  id             String   @id @default(uuid())
  area_code      String   // Zip code or district identifier
  area_name      String   // Neighborhood name
  area_type      AreaType @default(ZIP)

  // Market Metrics
  market_data    Json     // Market analysis data
  median_price   Decimal? @db.Decimal(12, 2)
  days_on_market Int?
  inventory      Int?
  price_change   Float?   // Percentage change

  // Demographics
  demographics   Json     // Demographic analysis
  median_age     Float?
  median_income  Decimal? @db.Decimal(12, 2)
  households     Int?
  commute_time   Float?   // Average in minutes

  // Amenities & Quality of Life
  amenities      Json     // Amenities data
  school_rating  Float?   // 1-10 scale
  walk_score     Int?     // 0-100
  bike_score     Int?     // 0-100
  crime_index    Float?   // Safety metric
  park_proximity Float?   // Distance in miles

  // Location Data
  latitude       Float?
  longitude      Float?
  boundary       Json?    // GeoJSON polygon

  // Investment Analysis
  roi_analysis       Json?    // ROI calculation data
  rent_yield         Float?
  appreciation_rate  Float?
  investment_grade   String?  // A, B, C, D rating

  // AI-Generated Insights
  ai_profile     String?  // AI-generated profile
  ai_insights    String[] @default([])

  // Data Quality & Freshness
  data_source    String[] @default([])
  last_updated   DateTime @default(now())
  data_quality   Float?   // 0-1 confidence score

  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization    organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by_id  String?
  creator        users?   @relation("InsightCreator", fields: [created_by_id], references: [id], onDelete: SetNull)
  alerts         property_alerts[]

  @@unique([area_code, organization_id])
  @@index([organization_id])
  @@index([area_type])
  @@index([created_at])
  @@map("neighborhood_insights")
}
```

### 2. PropertyAlert Model
```prisma
model property_alerts {
  id             String    @id @default(uuid())
  name           String
  description    String?   @db.Text

  // Alert Configuration
  alert_type     AlertType
  criteria       Json      // Alert criteria and thresholds
  is_active      Boolean   @default(true)

  // Geographical Scope
  area_codes     String[]  @default([])
  radius         Float?    // Radius in miles
  latitude       Float?
  longitude      Float?

  // Notification Settings
  email_enabled  Boolean   @default(true)
  sms_enabled    Boolean   @default(false)
  frequency      AlertFrequency @default(DAILY)

  // Alert History
  last_triggered DateTime?
  trigger_count  Int       @default(0)

  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization    organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by_id  String
  creator        users     @relation("AlertCreator", fields: [created_by_id], references: [id], onDelete: Cascade)
  insights       neighborhood_insights[]
  triggers       alert_triggers[]

  @@index([organization_id])
  @@index([created_by_id])
  @@index([alert_type])
  @@index([is_active])
  @@map("property_alerts")
}
```

### 3. AlertTrigger Model
```prisma
model alert_triggers {
  id             String   @id @default(uuid())
  alert_id       String
  alert          property_alerts @relation(fields: [alert_id], references: [id], onDelete: Cascade)

  // Trigger Details
  triggered_by   Json     // Data that triggered the alert
  message        String   @db.Text
  severity       AlertSeverity @default(MEDIUM)

  // Notification Status
  email_sent     Boolean  @default(false)
  sms_sent       Boolean  @default(false)
  acknowledged   Boolean  @default(false)
  acknowledged_at DateTime?
  acknowledged_by_id String?

  triggered_at   DateTime @default(now())

  @@index([alert_id])
  @@index([severity])
  @@index([acknowledged])
  @@map("alert_triggers")
}
```

### 4. MarketReport Model
```prisma
model market_reports {
  id             String     @id @default(uuid())
  title          String
  description    String?    @db.Text
  report_type    ReportType

  // Report Configuration
  area_codes     String[]   @default([])
  date_range     Json       // Start and end dates
  filters        Json       // Applied filters

  // Report Content
  summary        String?    @db.Text
  insights       Json       // Key insights and findings
  charts         Json       // Chart configurations
  tables         Json       // Table data

  // File Generation
  pdf_url        String?
  csv_url        String?

  // Sharing & Access
  is_public      Boolean    @default(false)
  share_token    String?    @unique

  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt

  // Multi-tenant isolation
  organization_id String
  organization    organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Relations
  created_by_id  String
  creator        users      @relation("ReportCreator", fields: [created_by_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([created_by_id])
  @@index([report_type])
  @@index([created_at])
  @@map("market_reports")
}
```

### 5. UserPreference Model
```prisma
model user_preferences {
  id             String   @id @default(uuid())
  user_id        String   @unique
  user           users    @relation(fields: [user_id], references: [id], onDelete: Cascade)

  // Dashboard Preferences
  default_area_codes String[] @default([])
  dashboard_layout   Json     // Module positions and sizes

  // Display Preferences
  theme          String   @default("dark") // dark/light
  chart_type     String   @default("line")
  map_style      String   @default("dark")

  // Notification Preferences
  email_digest   Boolean  @default(true)
  sms_alerts     Boolean  @default(false)
  digest_frequency String @default("weekly")

  // Data Preferences
  price_format   String   @default("USD")
  area_unit      String   @default("sqft")
  date_format    String   @default("MM/DD/YYYY")

  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  @@map("user_preferences")
}
```

### 6. Required Enums
```prisma
enum AreaType {
  ZIP
  SCHOOL_DISTRICT
  NEIGHBORHOOD
  COUNTY
  MSA
}

enum AlertType {
  PRICE_DROP
  PRICE_INCREASE
  NEW_LISTING
  SOLD
  INVENTORY_CHANGE
  MARKET_TREND
  DEMOGRAPHIC_CHANGE
}

enum AlertFrequency {
  IMMEDIATE
  DAILY
  WEEKLY
  MONTHLY
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ReportType {
  NEIGHBORHOOD_ANALYSIS
  MARKET_OVERVIEW
  COMPARATIVE_STUDY
  INVESTMENT_ANALYSIS
  DEMOGRAPHIC_REPORT
  CUSTOM
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

  // REID Relations
  reid_insights_created  neighborhood_insights[] @relation("InsightCreator")
  reid_alerts_created    property_alerts[]       @relation("AlertCreator")
  reid_reports_created   market_reports[]        @relation("ReportCreator")
  reid_preferences       user_preferences?

  // ... rest of model ...
}
```

**Organization Model Updates:**
```prisma
model organizations {
  // ... existing fields ...

  // REID Relations
  neighborhood_insights  neighborhood_insights[]
  property_alerts        property_alerts[]
  market_reports         market_reports[]

  // ... rest of model ...
}
```

### Step 2: Apply Migrations Using Supabase MCP

**IMPORTANT: Use Supabase MCP `apply_migration` tool instead of Prisma CLI**

#### Migration 1: Create Enums
```typescript
// Tool: mcp__supabase__apply_migration
// Parameters:
{
  "name": "create_reid_enums",
  "query": `
    -- Create AreaType enum
    CREATE TYPE "AreaType" AS ENUM (
      'ZIP', 'SCHOOL_DISTRICT', 'NEIGHBORHOOD', 'COUNTY', 'MSA'
    );

    -- Create AlertType enum
    CREATE TYPE "AlertType" AS ENUM (
      'PRICE_DROP', 'PRICE_INCREASE', 'NEW_LISTING', 'SOLD',
      'INVENTORY_CHANGE', 'MARKET_TREND', 'DEMOGRAPHIC_CHANGE'
    );

    -- Create AlertFrequency enum
    CREATE TYPE "AlertFrequency" AS ENUM (
      'IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY'
    );

    -- Create AlertSeverity enum
    CREATE TYPE "AlertSeverity" AS ENUM (
      'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    );

    -- Create ReportType enum
    CREATE TYPE "ReportType" AS ENUM (
      'NEIGHBORHOOD_ANALYSIS', 'MARKET_OVERVIEW', 'COMPARATIVE_STUDY',
      'INVESTMENT_ANALYSIS', 'DEMOGRAPHIC_REPORT', 'CUSTOM'
    );
  `
}
```

#### Migration 2: Create neighborhood_insights Table
```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "create_neighborhood_insights_table",
  "query": `
    CREATE TABLE neighborhood_insights (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      area_code VARCHAR(50) NOT NULL,
      area_name VARCHAR(255) NOT NULL,
      area_type "AreaType" DEFAULT 'ZIP',

      market_data JSONB,
      median_price DECIMAL(12, 2),
      days_on_market INTEGER,
      inventory INTEGER,
      price_change REAL,

      demographics JSONB,
      median_age REAL,
      median_income DECIMAL(12, 2),
      households INTEGER,
      commute_time REAL,

      amenities JSONB,
      school_rating REAL,
      walk_score INTEGER,
      bike_score INTEGER,
      crime_index REAL,
      park_proximity REAL,

      latitude REAL,
      longitude REAL,
      boundary JSONB,

      roi_analysis JSONB,
      rent_yield REAL,
      appreciation_rate REAL,
      investment_grade VARCHAR(10),

      ai_profile TEXT,
      ai_insights TEXT[] DEFAULT '{}',

      data_source TEXT[] DEFAULT '{}',
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      data_quality REAL,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE UNIQUE INDEX idx_insights_area_org ON neighborhood_insights(area_code, organization_id);
    CREATE INDEX idx_insights_organization_id ON neighborhood_insights(organization_id);
    CREATE INDEX idx_insights_area_type ON neighborhood_insights(area_type);
    CREATE INDEX idx_insights_created_at ON neighborhood_insights(created_at);
  `
}
```

#### Migration 3: Create property_alerts Table
```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "create_property_alerts_table",
  "query": `
    CREATE TABLE property_alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,

      alert_type "AlertType" NOT NULL,
      criteria JSONB NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,

      area_codes TEXT[] DEFAULT '{}',
      radius REAL,
      latitude REAL,
      longitude REAL,

      email_enabled BOOLEAN DEFAULT TRUE,
      sms_enabled BOOLEAN DEFAULT FALSE,
      frequency "AlertFrequency" DEFAULT 'DAILY',

      last_triggered TIMESTAMPTZ,
      trigger_count INTEGER DEFAULT 0,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_alerts_organization_id ON property_alerts(organization_id);
    CREATE INDEX idx_alerts_created_by_id ON property_alerts(created_by_id);
    CREATE INDEX idx_alerts_alert_type ON property_alerts(alert_type);
    CREATE INDEX idx_alerts_is_active ON property_alerts(is_active);
  `
}
```

#### Migration 4: Create alert_triggers Table
```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "create_alert_triggers_table",
  "query": `
    CREATE TABLE alert_triggers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      alert_id UUID NOT NULL REFERENCES property_alerts(id) ON DELETE CASCADE,

      triggered_by JSONB NOT NULL,
      message TEXT NOT NULL,
      severity "AlertSeverity" DEFAULT 'MEDIUM',

      email_sent BOOLEAN DEFAULT FALSE,
      sms_sent BOOLEAN DEFAULT FALSE,
      acknowledged BOOLEAN DEFAULT FALSE,
      acknowledged_at TIMESTAMPTZ,
      acknowledged_by_id UUID,

      triggered_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_triggers_alert_id ON alert_triggers(alert_id);
    CREATE INDEX idx_triggers_severity ON alert_triggers(severity);
    CREATE INDEX idx_triggers_acknowledged ON alert_triggers(acknowledged);
  `
}
```

#### Migration 5: Create market_reports Table
```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "create_market_reports_table",
  "query": `
    CREATE TABLE market_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      report_type "ReportType" NOT NULL,

      area_codes TEXT[] DEFAULT '{}',
      date_range JSONB NOT NULL,
      filters JSONB,

      summary TEXT,
      insights JSONB,
      charts JSONB,
      tables JSONB,

      pdf_url TEXT,
      csv_url TEXT,

      is_public BOOLEAN DEFAULT FALSE,
      share_token VARCHAR(255) UNIQUE,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_reports_organization_id ON market_reports(organization_id);
    CREATE INDEX idx_reports_created_by_id ON market_reports(created_by_id);
    CREATE INDEX idx_reports_report_type ON market_reports(report_type);
    CREATE INDEX idx_reports_created_at ON market_reports(created_at);
  `
}
```

#### Migration 6: Create user_preferences Table
```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "create_user_preferences_table",
  "query": `
    CREATE TABLE user_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      default_area_codes TEXT[] DEFAULT '{}',
      dashboard_layout JSONB,

      theme VARCHAR(50) DEFAULT 'dark',
      chart_type VARCHAR(50) DEFAULT 'line',
      map_style VARCHAR(50) DEFAULT 'dark',

      email_digest BOOLEAN DEFAULT TRUE,
      sms_alerts BOOLEAN DEFAULT FALSE,
      digest_frequency VARCHAR(50) DEFAULT 'weekly',

      price_format VARCHAR(10) DEFAULT 'USD',
      area_unit VARCHAR(10) DEFAULT 'sqft',
      date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE UNIQUE INDEX idx_preferences_user_id ON user_preferences(user_id);
  `
}
```

### Step 3: Enable RLS Policies

```typescript
// Tool: mcp__supabase__apply_migration
{
  "name": "add_reid_rls_policies",
  "query": `
    -- Enable RLS
    ALTER TABLE neighborhood_insights ENABLE ROW LEVEL SECURITY;
    ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE alert_triggers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE market_reports ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

    -- neighborhood_insights policies
    CREATE POLICY "tenant_isolation_neighborhood_insights" ON neighborhood_insights
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_neighborhood_insights_insert" ON neighborhood_insights
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- property_alerts policies
    CREATE POLICY "tenant_isolation_property_alerts" ON property_alerts
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_property_alerts_insert" ON property_alerts
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- alert_triggers policies (inherit from parent alert)
    CREATE POLICY "tenant_isolation_alert_triggers" ON alert_triggers
      USING (
        EXISTS (
          SELECT 1 FROM property_alerts
          WHERE property_alerts.id = alert_triggers.alert_id
          AND property_alerts.organization_id = current_setting('app.current_org_id')::uuid
        )
      );

    -- market_reports policies
    CREATE POLICY "tenant_isolation_market_reports" ON market_reports
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    CREATE POLICY "tenant_isolation_market_reports_insert" ON market_reports
      FOR INSERT
      WITH CHECK (organization_id = current_setting('app.current_org_id')::uuid);

    -- user_preferences policies (user-specific, no org check)
    CREATE POLICY "user_own_preferences" ON user_preferences
      USING (user_id = current_setting('app.current_user_id')::uuid);

    CREATE POLICY "user_own_preferences_insert" ON user_preferences
      FOR INSERT
      WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);
  `
}
```

### Step 4: Generate Prisma Client

```bash
cd C:\Users\zochr\Desktop\GitHub\Strive-SaaS
npx prisma generate --schema=shared/prisma/schema.prisma
```

### Step 5: Verify Database Schema

**Using Supabase MCP:**
```typescript
// Tool: mcp__supabase__list_tables
{
  "schemas": ["public"]
}
```

**Expected:** neighborhood_insights, property_alerts, alert_triggers, market_reports, user_preferences

## Testing & Validation

### Test 1: Schema Validation
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN (
      'neighborhood_insights', 'property_alerts', 'alert_triggers',
      'market_reports', 'user_preferences'
    )
    ORDER BY table_name, ordinal_position;
  `
}
```

### Test 2: Verify RLS Policies
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    SELECT tablename, policyname, cmd, qual
    FROM pg_policies
    WHERE tablename IN (
      'neighborhood_insights', 'property_alerts', 'alert_triggers',
      'market_reports', 'user_preferences'
    )
    ORDER BY tablename, policyname;
  `
}
```

### Test 3: Verify Indexes
```typescript
// Tool: mcp__supabase__execute_sql
{
  "query": `
    SELECT
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE tablename IN (
      'neighborhood_insights', 'property_alerts', 'alert_triggers',
      'market_reports', 'user_preferences'
    )
    ORDER BY tablename, indexname;
  `
}
```

## Success Criteria

- [x] All 5 new REID models added to schema
- [x] All enums defined correctly
- [x] All relationships established
- [x] organizationId field on multi-tenant tables
- [x] Proper indexes created for performance
- [x] Migrations applied successfully
- [x] Prisma client generates without errors
- [x] RLS policies enabled on all tables
- [x] TypeScript types available for all models

## Files Modified

- ✅ `shared/prisma/schema.prisma` - Extended with REID models
- ✅ Database migrations applied via Supabase MCP

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 2: REID Module Structure & Core Services**
2. ✅ Database foundation is ready
3. ✅ Can start implementing REID business logic
4. ✅ Schema supports all REID features (analytics, alerts, reports, AI)

---

**Session 1 Complete:** ✅ REID database foundation established
