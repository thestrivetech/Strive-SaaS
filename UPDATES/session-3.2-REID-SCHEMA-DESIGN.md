# Session 3.2: REID Analytics Schema Design

**Phase:** 3 - Full Feature Set
**Status:** DESIGN COMPLETE
**Date:** 2025-10-10
**Author:** Claude (Sonnet 4.5)

---

## 📋 OVERVIEW

This document provides a comprehensive schema design for the REID (Real Estate Intelligence Dashboard) Analytics module. The schema includes 7 models designed for market data analysis, demographics, schools, ROI simulations, alerts, reports, and AI-generated profiles.

**Key Design Principles:**
- Multi-tenancy isolation via `organization_id`
- Geographic indexing for fast location-based queries
- Time-series data support for trend analysis
- External API integration fields (MLS, Census, etc.)
- JSON fields for flexible, complex nested data
- Subscription tier gating (GROWTH+ tier required)

---

## 🗄️ MODEL DESIGNS

### 1. reid_market_data

**Purpose:** Track market trends, pricing, and inventory levels by geographic region over time.

```prisma
model reid_market_data {
  id                  String   @id @default(uuid())
  organization_id     String

  // Geographic Fields
  area_type           AreaType  // ZIP, NEIGHBORHOOD, COUNTY, MSA, SCHOOL_DISTRICT
  zip_code            String?   @db.VarChar(10)
  city                String?   @db.VarChar(100)
  state               String?   @db.VarChar(2)   // Two-letter state code
  county              String?   @db.VarChar(100)
  neighborhood        String?   @db.VarChar(200)
  msa_code            String?   @db.VarChar(10)  // Metropolitan Statistical Area
  school_district_id  String?   // FK to reid_schools

  // Time-Series Fields
  report_date         DateTime  @db.Date
  period_type         String    @db.VarChar(20)  // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY

  // Pricing Metrics
  median_price        Decimal?  @db.Decimal(12, 2)
  avg_price           Decimal?  @db.Decimal(12, 2)
  min_price           Decimal?  @db.Decimal(12, 2)
  max_price           Decimal?  @db.Decimal(12, 2)
  price_per_sqft      Decimal?  @db.Decimal(10, 2)
  price_change_pct    Float?    // Month-over-month % change

  // Inventory Metrics
  active_listings     Int?
  new_listings        Int?
  sold_listings       Int?
  pending_listings    Int?
  expired_listings    Int?
  inventory_months    Float?    // Months of supply

  // Market Activity Metrics
  days_on_market      Int?      // Median DOM
  sale_to_list_ratio  Float?    // Sale price / list price
  absorption_rate     Float?    // Rate properties are selling
  turnover_rate       Float?    // Ownership turnover

  // External Data Source
  data_source         String?   @db.VarChar(100)  // MLS, Zillow, Redfin, etc.
  external_id         String?   @db.VarChar(255)
  api_response        Json?     @db.JsonB  // Raw API response

  // Metadata
  is_verified         Boolean   @default(false)
  confidence_score    Float?    // Data quality 0-1
  notes               String?   @db.Text
  created_at          DateTime  @default(now()) @db.Timestamp(6)
  updated_at          DateTime  @updatedAt @db.Timestamp(6)

  // Relations
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Indexes
  @@index([organization_id, area_type, zip_code, report_date])
  @@index([organization_id, city, state, report_date])
  @@index([report_date])
  @@index([area_type, zip_code])
  @@unique([organization_id, area_type, zip_code, city, state, county, report_date, period_type])
}
```

**Design Rationale:**
- **Geographic flexibility:** Supports multiple area types (ZIP, neighborhood, county, MSA)
- **Time-series support:** `report_date` + `period_type` enable trend analysis
- **Comprehensive metrics:** Pricing, inventory, and market activity data
- **Data quality:** `confidence_score` and `is_verified` for data integrity
- **External integration:** `data_source`, `external_id`, `api_response` for MLS/API data
- **Unique constraint:** Prevents duplicate data for same area/date/period combination

---

### 2. reid_demographics

**Purpose:** Store demographic data (population, income, age, education) for geographic areas.

```prisma
model reid_demographics {
  id                  String   @id @default(uuid())
  organization_id     String

  // Geographic Fields
  area_type           AreaType  // ZIP, NEIGHBORHOOD, COUNTY, MSA, SCHOOL_DISTRICT
  zip_code            String?   @db.VarChar(10)
  city                String?   @db.VarChar(100)
  state               String?   @db.VarChar(2)
  county              String?   @db.VarChar(100)
  neighborhood        String?   @db.VarChar(200)

  // Time-Series
  report_year         Int       // Census year (e.g., 2020)

  // Population Metrics
  total_population    Int?
  population_density  Float?    // Per square mile
  population_growth   Float?    // % change from previous period
  households          Int?
  avg_household_size  Float?

  // Age Distribution (JSON for flexibility)
  age_distribution    Json?     @db.JsonB  // { "0-17": 25%, "18-34": 30%, ... }
  median_age          Float?

  // Income Metrics
  median_income       Decimal?  @db.Decimal(12, 2)
  avg_income          Decimal?  @db.Decimal(12, 2)
  income_distribution Json?     @db.JsonB  // { "<25k": 10%, "25k-50k": 20%, ... }
  poverty_rate        Float?    // Percentage

  // Education Metrics
  education_levels    Json?     @db.JsonB  // { "high_school": 30%, "bachelor": 25%, ... }
  high_school_rate    Float?    // % with HS diploma
  college_rate        Float?    // % with bachelor's

  // Employment Metrics
  employment_rate     Float?
  unemployment_rate   Float?
  labor_force_size    Int?
  top_industries      Json?     @db.JsonB  // Array of top 5 industries

  // Housing Metrics
  homeownership_rate  Float?
  renter_rate         Float?
  median_home_value   Decimal?  @db.Decimal(12, 2)
  median_rent         Decimal?  @db.Decimal(10, 2)

  // Diversity Metrics
  diversity_index     Float?    // Simpson's Diversity Index
  ethnic_distribution Json?     @db.JsonB  // { "white": 60%, "hispanic": 20%, ... }

  // External Data Source
  data_source         String?   @db.VarChar(100)  // Census, ACS, etc.
  external_id         String?   @db.VarChar(255)
  api_response        Json?     @db.JsonB

  // Metadata
  is_verified         Boolean   @default(false)
  confidence_score    Float?
  notes               String?   @db.Text
  created_at          DateTime  @default(now()) @db.Timestamp(6)
  updated_at          DateTime  @updatedAt @db.Timestamp(6)

  // Relations
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Indexes
  @@index([organization_id, area_type, zip_code, report_year])
  @@index([organization_id, city, state, report_year])
  @@index([report_year])
  @@unique([organization_id, area_type, zip_code, city, state, county, report_year])
}
```

**Design Rationale:**
- **JSON fields:** Flexible storage for distributions (age, income, education)
- **Census alignment:** `report_year` matches Census data release cycles
- **Comprehensive demographics:** Population, income, education, employment, housing
- **Diversity metrics:** Support for demographic diversity analysis
- **External integration:** Census Bureau API, American Community Survey

---

### 3. reid_schools

**Purpose:** Store school data (ratings, test scores, proximity) for property analysis.

```prisma
model reid_schools {
  id                  String   @id @default(uuid())
  organization_id     String

  // School Identification
  name                String    @db.VarChar(200)
  school_type         String    @db.VarChar(50)   // ELEMENTARY, MIDDLE, HIGH, CHARTER, PRIVATE
  district_name       String?   @db.VarChar(200)
  district_id         String?   @db.VarChar(100)

  // Geographic Fields
  address             String    @db.VarChar(500)
  city                String    @db.VarChar(100)
  state               String    @db.VarChar(2)
  zip_code            String    @db.VarChar(10)
  county              String?   @db.VarChar(100)
  latitude            Decimal?  @db.Decimal(10, 8)
  longitude           Decimal?  @db.Decimal(11, 8)

  // School Metrics
  rating_overall      Float?    // 1-10 scale
  rating_source       String?   @db.VarChar(100)  // GreatSchools, Niche, etc.
  test_scores         Json?     @db.JsonB  // { "math": 85, "reading": 90, ... }
  state_ranking       Int?
  national_ranking    Int?

  // School Demographics
  total_students      Int?
  student_teacher_ratio Float?
  diversity_score     Float?
  low_income_pct      Float?    // % low-income students

  // Performance Metrics
  graduation_rate     Float?
  college_readiness   Float?
  advanced_placement  Boolean   @default(false)
  extracurriculars    Json?     @db.JsonB  // Array of programs offered

  // Boundary Information
  boundary_geojson    Json?     @db.JsonB  // GeoJSON polygon for school zone
  serves_grades       String?   @db.VarChar(50)  // "K-5", "6-8", "9-12"

  // External Data Source
  data_source         String?   @db.VarChar(100)  // GreatSchools, Niche, State DOE
  external_id         String?   @db.VarChar(255)
  nces_id             String?   @db.VarChar(50)   // National Center for Education Statistics
  api_response        Json?     @db.JsonB

  // Metadata
  is_active           Boolean   @default(true)
  is_verified         Boolean   @default(false)
  confidence_score    Float?
  last_updated        DateTime? @db.Timestamp(6)
  notes               String?   @db.Text
  created_at          DateTime  @default(now()) @db.Timestamp(6)
  updated_at          DateTime  @updatedAt @db.Timestamp(6)

  // Relations
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  // Indexes
  @@index([organization_id, zip_code, school_type])
  @@index([organization_id, city, state])
  @@index([district_id])
  @@index([latitude, longitude])  // For proximity searches
  @@index([rating_overall])
}
```

**Design Rationale:**
- **Geospatial support:** `latitude`, `longitude` for proximity searches
- **Rating flexibility:** Multiple rating sources (GreatSchools, Niche)
- **Boundary data:** GeoJSON for school zone visualization
- **Comprehensive metrics:** Test scores, rankings, demographics
- **NCES integration:** National standard school identifiers

---

### 4. reid_roi_simulations

**Purpose:** Store ROI simulation results for investment property analysis.

```prisma
model reid_roi_simulations {
  id                  String   @id @default(uuid())
  organization_id     String
  user_id             String    // User who created the simulation

  // Simulation Metadata
  name                String    @db.VarChar(200)
  description         String?   @db.Text
  property_address    String?   @db.VarChar(500)
  zip_code            String?   @db.VarChar(10)
  city                String?   @db.VarChar(100)
  state               String?   @db.VarChar(2)

  // Input Parameters (JSON for flexibility)
  inputs              Json      @db.JsonB  // Purchase price, down payment, loan details, etc.
  /* Example inputs structure:
  {
    "purchase_price": 500000,
    "down_payment_pct": 20,
    "loan_term_years": 30,
    "interest_rate": 6.5,
    "property_type": "single_family",
    "rental_income_monthly": 2500,
    "expenses": {
      "property_tax": 6000,
      "insurance": 1500,
      "hoa": 0,
      "maintenance": 2000,
      "vacancy_rate": 5
    },
    "appreciation_rate": 3.5,
    "holding_period_years": 10
  }
  */

  // Output Results (JSON for flexibility)
  results             Json      @db.JsonB  // ROI, cash flow, IRR, etc.
  /* Example results structure:
  {
    "total_roi": 45.2,
    "annual_roi": 4.52,
    "cash_on_cash_return": 8.5,
    "cap_rate": 6.2,
    "irr": 7.8,
    "net_present_value": 125000,
    "monthly_cash_flow": 450,
    "annual_cash_flow": 5400,
    "year_by_year": [
      { "year": 1, "cash_flow": 5400, "property_value": 517500 },
      ...
    ],
    "total_equity": 225000,
    "break_even_year": 3
  }
  */

  // Scenario Analysis
  scenario_type       String?   @db.VarChar(50)  // BASE, OPTIMISTIC, PESSIMISTIC, CUSTOM
  parent_simulation_id String? // FK to compare scenarios

  // Market Data Integration
  market_data_id      String?   // FK to reid_market_data
  demographics_id     String?   // FK to reid_demographics

  // Sharing & Collaboration
  is_shared           Boolean   @default(false)
  shared_with_users   String[]  @default([])     // Array of user IDs
  is_template         Boolean   @default(false)
  template_category   String?   @db.VarChar(100)

  // Metadata
  calculation_version String?   @db.VarChar(20)  // Algorithm version for reproducibility
  tags                String[]  @default([])
  notes               String?   @db.Text
  created_at          DateTime  @default(now()) @db.Timestamp(6)
  updated_at          DateTime  @updatedAt @db.Timestamp(6)
  last_viewed_at      DateTime? @db.Timestamp(6)

  // Relations
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user                users @relation(fields: [user_id], references: [id], onDelete: Cascade)
  parent_simulation   reid_roi_simulations? @relation("SimulationScenarios", fields: [parent_simulation_id], references: [id])
  child_scenarios     reid_roi_simulations[] @relation("SimulationScenarios")

  // Indexes
  @@index([organization_id, user_id])
  @@index([organization_id, zip_code])
  @@index([created_at])
  @@index([is_template, template_category])
  @@index([parent_simulation_id])
}
```

**Design Rationale:**
- **Flexible JSON:** `inputs` and `results` accommodate various calculation models
- **Scenario comparison:** `parent_simulation_id` enables what-if analysis
- **Collaboration:** `is_shared`, `shared_with_users` for team analysis
- **Template library:** `is_template` enables reusable simulation templates
- **Versioning:** `calculation_version` for algorithm reproducibility

---

### 5. reid_alerts

**Purpose:** Automated alerts for market conditions, price changes, and investment opportunities.

```prisma
model reid_alerts {
  id                  String    @id @default(uuid())
  organization_id     String
  user_id             String?   // Optional: organization-wide or user-specific

  // Alert Configuration
  name                String    @db.VarChar(200)
  description         String?   @db.Text
  alert_type          AlertType // Existing enum: PRICE_DROP, PRICE_INCREASE, NEW_LISTING, SOLD, etc.
  is_active           Boolean   @default(true)

  // Geographic Criteria
  area_type           AreaType?
  zip_codes           String[]  @default([])
  cities              String[]  @default([])
  states              String[]  @default([])
  counties            String[]  @default([])
  neighborhoods       String[]  @default([])

  // Alert Conditions (JSON for flexibility)
  conditions          Json      @db.JsonB
  /* Example conditions:
  {
    "price_change_pct": { "operator": ">=", "value": 10 },
    "price_range": { "min": 300000, "max": 500000 },
    "property_types": ["RESIDENTIAL", "CONDO"],
    "days_on_market": { "operator": "<=", "value": 30 },
    "price_per_sqft": { "operator": "<=", "value": 250 },
    "inventory_change_pct": { "operator": ">=", "value": 15 },
    "market_trend": "DECLINING"
  }
  */

  // Alert Frequency & Delivery
  frequency           AlertFrequency  // Existing enum: IMMEDIATE, DAILY, WEEKLY, MONTHLY
  delivery_channels   String[]  @default([])  // EMAIL, IN_APP, SMS, WEBHOOK
  last_triggered_at   DateTime? @db.Timestamp(6)
  trigger_count       Int       @default(0)

  // Advanced Settings
  priority            Priority  @default(MEDIUM)  // Existing enum
  auto_disable_after  Int?      // Days to auto-disable if no triggers
  max_triggers_per_day Int?     // Rate limiting
  require_verification Boolean  @default(false)  // Wait for data verification

  // Notification Settings
  email_addresses     String[]  @default([])
  webhook_url         String?   @db.VarChar(500)
  notification_template String? @db.Text

  // Metadata
  tags                String[]  @default([])
  notes               String?   @db.Text
  created_at          DateTime  @default(now()) @db.Timestamp(6)
  updated_at          DateTime  @updatedAt @db.Timestamp(6)

  // Relations
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user                users? @relation(fields: [user_id], references: [id], onDelete: Cascade)

  // Indexes
  @@index([organization_id, is_active])
  @@index([user_id, is_active])
  @@index([alert_type, is_active])
  @@index([last_triggered_at])
}
```

**Design Rationale:**
- **Flexible conditions:** JSON-based conditions for complex alert logic
- **Multi-channel delivery:** Email, in-app, SMS, webhook support
- **Rate limiting:** `max_triggers_per_day` prevents alert fatigue
- **Geographic targeting:** Multiple geographic filter options
- **Shared alerts:** `user_id` nullable for organization-wide alerts

---

### 6. reid_reports

**Purpose:** Store generated market analysis reports (PDF exports, custom reports).

```prisma
model reid_reports {
  id                  String    @id @default(uuid())
  organization_id     String
  user_id             String    // Report creator

  // Report Metadata
  name                String    @db.VarChar(200)
  description         String?   @db.Text
  report_type         ReidReportType  // Existing enum: NEIGHBORHOOD_ANALYSIS, MARKET_OVERVIEW, etc.
  status              ContentStatus   @default(DRAFT)  // Existing enum

  // Geographic Scope
  area_type           AreaType?
  zip_codes           String[]  @default([])
  cities              String[]  @default([])
  states              String[]  @default([])
  counties            String[]  @default([])

  // Report Configuration
  date_range_start    DateTime? @db.Date
  date_range_end      DateTime? @db.Date
  configuration       Json?     @db.JsonB  // Report-specific settings
  /* Example configuration:
  {
    "include_demographics": true,
    "include_schools": true,
    "include_market_trends": true,
    "include_roi_analysis": false,
    "chart_types": ["line", "bar", "heatmap"],
    "comparison_periods": ["year_over_year", "quarter_over_quarter"],
    "custom_sections": [...]
  }
  */

  // Report Data (JSON for flexibility)
  data                Json?     @db.JsonB  // Compiled report data
  insights            Json?     @db.JsonB  // AI-generated insights
  /* Example insights:
  {
    "key_findings": [
      "Median price increased 15% YoY",
      "Inventory down 25% from last year"
    ],
    "investment_opportunities": [...],
    "risk_factors": [...],
    "market_outlook": "Seller's market with strong demand"
  }
  */

  // File Storage
  file_path           String?   @db.VarChar(500)  // Supabase Storage path
  file_size           Int?      // Bytes
  file_format         String?   @db.VarChar(20)   // PDF, XLSX, CSV, JSON

  // Sharing & Access
  is_public           Boolean   @default(false)
  shared_with_users   String[]  @default([])
  public_url          String?   @unique @db.VarChar(500)
  expires_at          DateTime? @db.Timestamp(6)

  // Template & Scheduling
  is_template         Boolean   @default(false)
  template_id         String?   // FK for reports generated from templates
  schedule            Json?     @db.JsonB  // Auto-generation schedule
  /* Example schedule:
  {
    "frequency": "MONTHLY",
    "day_of_month": 1,
    "time": "09:00",
    "timezone": "America/New_York",
    "next_run": "2025-11-01T09:00:00Z"
  }
  */

  // Analytics
  view_count          Int       @default(0)
  download_count      Int       @default(0)
  last_viewed_at      DateTime? @db.Timestamp(6)

  // Metadata
  tags                String[]  @default([])
  notes               String?   @db.Text
  generated_at        DateTime? @db.Timestamp(6)
  created_at          DateTime  @default(now()) @db.Timestamp(6)
  updated_at          DateTime  @updatedAt @db.Timestamp(6)

  // Relations
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user                users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  // Indexes
  @@index([organization_id, report_type, status])
  @@index([user_id, created_at])
  @@index([is_template])
  @@index([generated_at])
}
```

**Design Rationale:**
- **Report templates:** `is_template` enables reusable report configurations
- **Scheduled reports:** `schedule` JSON for automated report generation
- **File storage:** `file_path` for Supabase Storage integration
- **AI insights:** `insights` JSON for AI-generated analysis
- **Sharing:** Public URLs with expiration for external sharing

---

### 7. reid_ai_profiles

**Purpose:** AI-generated property and neighborhood profiles for intelligent recommendations.

```prisma
model reid_ai_profiles {
  id                  String    @id @default(uuid())
  organization_id     String
  user_id             String?   // Optional: creator

  // Profile Type & Target
  profile_type        String    @db.VarChar(50)  // PROPERTY, NEIGHBORHOOD, MARKET_SEGMENT
  target_type         String?   @db.VarChar(50)  // SINGLE_FAMILY, CONDO, INVESTMENT, etc.

  // Geographic Identification
  address             String?   @db.VarChar(500)
  zip_code            String?   @db.VarChar(10)
  city                String?   @db.VarChar(100)
  state               String?   @db.VarChar(2)
  county              String?   @db.VarChar(100)
  neighborhood        String?   @db.VarChar(200)
  latitude            Decimal?  @db.Decimal(10, 8)
  longitude           Decimal?  @db.Decimal(11, 8)

  // AI-Generated Content
  summary             String    @db.Text  // 2-3 sentence overview
  detailed_analysis   String    @db.Text  // Full AI-generated analysis
  strengths           Json      @db.JsonB  // Array of strength points
  weaknesses          Json      @db.JsonB  // Array of weakness points
  opportunities       Json      @db.JsonB  // Investment opportunities

  // AI Scores & Ratings
  overall_score       Float?    // 0-100 composite score
  investment_score    Float?    // 0-100 investment attractiveness
  lifestyle_score     Float?    // 0-100 lifestyle fit
  growth_potential    Float?    // 0-100 future appreciation potential
  risk_score          Float?    // 0-100 investment risk

  // Key Metrics (JSON for flexibility)
  metrics             Json?     @db.JsonB
  /* Example metrics:
  {
    "walkability_score": 85,
    "transit_score": 70,
    "bike_score": 60,
    "crime_index": "LOW",
    "school_rating_avg": 8.5,
    "price_appreciation_3yr": 15.2,
    "rental_yield": 5.5,
    "days_on_market_avg": 25,
    "price_vs_market": "5% below average"
  }
  */

  // Recommendations
  recommendations     Json?     @db.JsonB
  /* Example recommendations:
  {
    "ideal_buyer_persona": "First-time homebuyer, young professional",
    "best_use_case": "Primary residence",
    "timing_recommendation": "Good time to buy",
    "comparable_areas": ["Downtown", "Midtown"],
    "alternative_properties": [...]
  }
  */

  // Data Sources & AI Model
  data_sources        String[]  @default([])  // Market data, demographics, schools used
  ai_model            AIModel   @default(KIMIK2)  // Existing enum
  model_version       String?   @db.VarChar(50)
  confidence_score    Float?    // 0-1 AI confidence

  // Metadata
  is_public           Boolean   @default(false)
  is_verified         Boolean   @default(false)  // Human-reviewed
  verified_by         String?   // User ID who verified
  verified_at         DateTime? @db.Timestamp(6)

  // Analytics
  view_count          Int       @default(0)
  last_viewed_at      DateTime? @db.Timestamp(6)

  // Cache & Refresh
  expires_at          DateTime? @db.Timestamp(6)  // Profile freshness
  last_refreshed_at   DateTime? @db.Timestamp(6)

  // Metadata
  tags                String[]  @default([])
  notes               String?   @db.Text
  created_at          DateTime  @default(now()) @db.Timestamp(6)
  updated_at          DateTime  @updatedAt @db.Timestamp(6)

  // Relations
  organization        organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  user                users? @relation(fields: [user_id], references: [id], onDelete: SetNull)

  // Indexes
  @@index([organization_id, profile_type])
  @@index([zip_code, profile_type])
  @@index([city, state])
  @@index([latitude, longitude])
  @@index([overall_score])
  @@index([created_at])
}
```

**Design Rationale:**
- **AI-powered:** Uses KimiK2 (or other models) for intelligent analysis
- **Multi-dimensional scoring:** Overall, investment, lifestyle, growth, risk scores
- **Recommendations:** AI-generated buyer personas and use case recommendations
- **Cache management:** `expires_at` for profile freshness control
- **Human verification:** `is_verified` flag for quality assurance

---

## 📍 GEOGRAPHIC INDEXING STRATEGY

### Composite Indexes

All models with geographic data include these index patterns:

```sql
-- Organization + Geographic + Time-Series
@@index([organization_id, area_type, zip_code, report_date])
@@index([organization_id, city, state, report_date])

-- Pure Geographic (for cross-org data sources)
@@index([zip_code])
@@index([city, state])
@@index([county])

-- Geospatial (for proximity queries)
@@index([latitude, longitude])
```

### PostGIS Integration (Future Enhancement)

For advanced geospatial queries, consider PostGIS extension:

```sql
-- Add geospatial column (migration)
ALTER TABLE reid_schools ADD COLUMN location geography(POINT,4326);

-- Create GiST index for fast proximity searches
CREATE INDEX idx_reid_schools_location ON reid_schools USING GIST(location);

-- Example proximity query
SELECT * FROM reid_schools
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(-122.419, 37.775), 4326)::geography,
  5000  -- 5km radius
);
```

**Note:** PostGIS requires migration to enable - not included in initial schema.

---

## 🔒 ROW LEVEL SECURITY (RLS) POLICIES

### Multi-Tenancy Isolation

All 7 models MUST have RLS policies enabled:

```sql
-- Example RLS policy for reid_market_data
ALTER TABLE reid_market_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only view data from their organization
CREATE POLICY "reid_market_data_select_policy" ON reid_market_data
  FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Policy 2: Users can only insert data for their organization
CREATE POLICY "reid_market_data_insert_policy" ON reid_market_data
  FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id')::uuid);

-- Policy 3: Users can only update their own organization's data
CREATE POLICY "reid_market_data_update_policy" ON reid_market_data
  FOR UPDATE
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Policy 4: Users can only delete their own organization's data
CREATE POLICY "reid_market_data_delete_policy" ON reid_market_data
  FOR DELETE
  USING (organization_id = current_setting('app.current_organization_id')::uuid);
```

**Apply this pattern to all 7 REID models.**

### User-Scoped RLS (for user-specific data)

For models with `user_id` field (alerts, simulations, reports, profiles):

```sql
-- Additional policy: Users can only manage their own data
CREATE POLICY "reid_alerts_user_scope_policy" ON reid_alerts
  FOR ALL
  USING (
    user_id = current_setting('app.current_user_id')::uuid
    OR user_id IS NULL  -- Organization-wide alerts
  );
```

---

## 🎯 SUBSCRIPTION TIER GATING

### Feature Access Matrix

| Feature | FREE | STARTER | GROWTH | ELITE | ENTERPRISE |
|---------|------|---------|--------|-------|------------|
| Market Data (basic) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Demographics | ❌ | ❌ | ✅ | ✅ | ✅ |
| Schools Data | ❌ | ❌ | ✅ | ✅ | ✅ |
| ROI Simulations (limited) | ❌ | ❌ | 5/month | Unlimited | Unlimited |
| Alerts (limited) | ❌ | ❌ | 3 active | 20 active | Unlimited |
| Reports (basic) | ❌ | ❌ | ✅ | ✅ | ✅ |
| AI Profiles (limited) | ❌ | ❌ | 10/month | 100/month | Unlimited |
| Scheduled Reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| Custom Templates | ❌ | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | ❌ | ✅ |

### Implementation Pattern

```typescript
// lib/modules/reid/rbac.ts
import { SubscriptionTier } from '@prisma/client';

export function canAccessREID(tier: SubscriptionTier): boolean {
  return ['GROWTH', 'ELITE', 'ENTERPRISE'].includes(tier);
}

export function getROISimulationLimit(tier: SubscriptionTier): number {
  const limits = {
    FREE: 0,
    CUSTOM: 0,
    STARTER: 0,
    GROWTH: 5,
    ELITE: -1,  // Unlimited
    ENTERPRISE: -1,
  };
  return limits[tier];
}

export function getActiveAlertLimit(tier: SubscriptionTier): number {
  const limits = {
    FREE: 0,
    CUSTOM: 0,
    STARTER: 0,
    GROWTH: 3,
    ELITE: 20,
    ENTERPRISE: -1,  // Unlimited
  };
  return limits[tier];
}

export function canScheduleReports(tier: SubscriptionTier): boolean {
  return ['ELITE', 'ENTERPRISE'].includes(tier);
}
```

---

## 🔌 EXTERNAL API INTEGRATION FIELDS

### Data Source Tracking

All models include standardized external API fields:

```typescript
interface ExternalDataIntegration {
  data_source: string;      // "MLS", "Census", "GreatSchools", "Zillow", etc.
  external_id: string;      // External system's unique identifier
  api_response: Json;       // Raw API response (JSONB)
  confidence_score: number; // Data quality 0-1
  is_verified: boolean;     // Manual verification flag
}
```

### Recommended Data Sources

| Model | Primary Sources | Secondary Sources |
|-------|----------------|-------------------|
| reid_market_data | MLS, Zillow, Redfin | Realtor.com, Trulia |
| reid_demographics | Census Bureau ACS | ESRI, PolicyMap |
| reid_schools | GreatSchools, Niche | State Dept of Education, SchoolDigger |
| reid_roi_simulations | Internal calculations | Market data + Demographics |
| reid_alerts | Internal triggers | Market data monitoring |
| reid_reports | Internal compilation | All data sources |
| reid_ai_profiles | KimiK2 AI + all data | OpenAI, Claude |

---

## 🧪 DATA VALIDATION RULES

### Zod Schemas (for implementation in Session 3.5)

```typescript
// lib/modules/reid/schemas.ts
import { z } from 'zod';

export const MarketDataSchema = z.object({
  organization_id: z.string().uuid(),
  area_type: z.enum(['ZIP', 'NEIGHBORHOOD', 'COUNTY', 'MSA', 'SCHOOL_DISTRICT']),
  zip_code: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  report_date: z.date(),
  period_type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  median_price: z.number().positive().optional(),
  // ... other fields
});

export const ROISimulationSchema = z.object({
  organization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  inputs: z.object({
    purchase_price: z.number().positive(),
    down_payment_pct: z.number().min(0).max(100),
    loan_term_years: z.number().positive(),
    interest_rate: z.number().positive(),
    // ... other inputs
  }),
});

// ... other schemas
```

---

## 📊 PERFORMANCE CONSIDERATIONS

### Query Optimization

1. **Always use organization_id filter:**
   ```typescript
   const data = await prisma.reid_market_data.findMany({
     where: { organization_id: orgId }  // REQUIRED
   });
   ```

2. **Pagination for large datasets:**
   ```typescript
   const data = await prisma.reid_schools.findMany({
     where: { organization_id: orgId, state: 'CA' },
     take: 50,
     skip: page * 50,
   });
   ```

3. **Selective field retrieval:**
   ```typescript
   const data = await prisma.reid_demographics.findMany({
     where: { organization_id: orgId },
     select: {
       id: true,
       zip_code: true,
       median_income: true,
       // Don't fetch large JSON fields unless needed
     },
   });
   ```

### Caching Strategy

1. **AI Profiles:** Cache for 7 days (`expires_at` field)
2. **Market Data:** Cache daily snapshots, refresh nightly
3. **Demographics:** Cache Census data for 1 year (updates annually)
4. **Schools:** Cache for 90 days (ratings update quarterly)

---

## 🚀 MIGRATION STRATEGY (for Session 3.5)

### Step 1: Create Migration

```bash
cd (platform)
npm run db:migrate -- --name add-reid-analytics-schema
```

### Step 2: Add Models to Prisma Schema

Copy all 7 model definitions to `prisma/schema.prisma`

### Step 3: Apply Migration

```bash
npx prisma migrate dev
npx prisma generate
```

### Step 4: Create RLS Policies

```sql
-- Execute RLS policies for all 7 tables
-- (See "Row Level Security" section above)
```

### Step 5: Update Schema Documentation

```bash
npm run db:docs
```

### Step 6: Verify

```bash
npx tsc --noEmit  # TypeScript check
npm run lint      # Linting
npm test          # Tests
```

---

## 📝 CURRENT STATE (What Already Exists)

### Existing Tables Referenced in Code

The REID module (`lib/modules/reid/`) currently references these database tables:

1. **`neighborhood_insights`** - Consolidated neighborhood data
   - Used by: `lib/modules/reid/insights/queries.ts`, `insights/actions.ts`
   - Fields include: `area_name`, `area_code`, `area_type`, `organization_id`, `median_price`, `price_change`, `days_on_market`, `school_rating`, `walk_score`, `bike_score`, `crime_index`, `rent_yield`, `appreciation_rate`, `investment_grade`, etc.
   - Relations: `creator` (users), `alerts`

2. **`property_alerts`** - Market alerts system
   - Used by: `lib/modules/reid/alerts/queries.ts`, `alerts/actions.ts`
   - Fields include: `name`, `alert_type`, `organization_id`, `is_active`, etc.
   - Relations: `creator` (users), `triggers` (alert_triggers)

3. **`alert_triggers`** - Alert activation history
   - Used by: `lib/modules/reid/alerts/queries.ts`, `alerts/actions.ts`
   - Relations: `alert` (property_alerts)

4. **`market_reports`** - Generated reports
   - Used by: `lib/modules/reid/reports/queries.ts`, `reports/actions.ts`
   - Fields include: `name`, `report_type`, `organization_id`, `is_public`, `share_token`, `created_at`, etc.
   - Relations: `creator` (users)

5. **`user_preferences`** - User REID preferences
   - Used by: `lib/modules/reid/preferences/queries.ts`
   - Not specifically a REID table, but referenced by the module

### Mapping: Designed Schema → Existing Code

| Designed Model | Existing Table | Status |
|----------------|----------------|--------|
| reid_market_data | `neighborhood_insights` | **CONSOLIDATED** - Market data merged into insights |
| reid_demographics | `neighborhood_insights` | **CONSOLIDATED** - Demographics merged into insights |
| reid_schools | `neighborhood_insights` | **CONSOLIDATED** - School data merged into insights |
| reid_roi_simulations | ❌ Not implemented | **MISSING** - Need to create |
| reid_alerts | `property_alerts` | **RENAME** - Use `property_alerts` instead |
| reid_reports | `market_reports` | **RENAME** - Use `market_reports` instead |
| reid_ai_profiles | ❌ Not implemented | **MISSING** - Need to create |
| ❌ Not in design | `alert_triggers` | **ADD** - Required relation table |

### Key Differences

**CONSOLIDATION CHOICE:**
- Original design: Separate tables for market_data, demographics, schools (normalized)
- Existing code: Single `neighborhood_insights` table (denormalized)
- **Advantage of consolidation:** Simpler queries, no complex joins
- **Trade-off:** Larger table, some data redundancy

**TABLE NAMING:**
- Original design: `reid_*` prefix for all tables
- Existing code: Mixed naming (`neighborhood_insights`, `property_alerts`, `market_reports`)
- **Decision for Session 3.5:** Use existing table names to match current code

### Implementation Notes for Session 3.5

**KEEP EXISTING:**
1. `neighborhood_insights` (consolidated market + demographics + schools)
2. `property_alerts` (alerts system)
3. `alert_triggers` (alert history)
4. `market_reports` (reports system)

**ADD NEW:**
1. `reid_roi_simulations` (ROI calculator)
2. `reid_ai_profiles` (AI-generated property profiles)

**Total Tables:** 6 (4 existing + 2 new)

---

## ✅ SUCCESS CRITERIA CHECKLIST

- [x] 7 models fully designed with fields, types, relationships
- [x] Geographic search indexes defined
- [x] Multi-tenancy RLS requirements specified
- [x] External data source integration planned
- [x] Design validated against existing schema patterns
- [x] Subscription tier gating defined
- [x] Performance optimization strategy documented
- [x] Migration strategy outlined
- [x] **Current state documented** (4 existing tables identified)
- [x] **Mapping provided** (designed schema → existing code)

---

## 📝 NEXT STEPS

**Session 3.3:** Design Expense-Tax Schema
**Session 3.4:** Design CMS-Campaigns Schema
**Session 3.5:** Implement schemas + migrations
  - **Keep:** `neighborhood_insights`, `property_alerts`, `alert_triggers`, `market_reports`
  - **Add:** `reid_roi_simulations`, `reid_ai_profiles`
  - **Update:** Module providers to use real database (already partially done)

**Session 3.6-3.9:** Update remaining module providers
**Session 3.10:** Comprehensive testing

---

## 📚 REFERENCES

- Existing Schema: `(platform)/prisma/schema.prisma`
- Schema Models: `(platform)/prisma/SCHEMA-MODELS.md`
- Schema Enums: `(platform)/prisma/SCHEMA-ENUMS.md`
- RLS Policies: `(platform)/lib/database/docs/RLS-POLICIES.md`
- Platform CLAUDE.md: `(platform)/CLAUDE.md`
- **Existing REID Module:** `(platform)/lib/modules/reid/` (insights, alerts, reports, preferences, ai)

---

**Design Status:** ✅ COMPLETE
**Ready for Implementation:** Session 3.5
**Estimated Schema Size:**
- Original design: ~700 lines (7 models)
- Revised for implementation: ~300 lines (2 new models)
- Existing models: 4 tables already referenced in code
