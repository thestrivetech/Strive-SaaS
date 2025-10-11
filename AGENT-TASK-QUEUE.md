# Agent Task Queue: REID & Expense/Tax Module Database Integration

**Created:** 2025-10-10
**Project:** (platform)
**Objective:** Connect REID and Expense/Tax module UIs to database with real data

**Agent:** `strive-agent-universal`
**Reference:** `.claude/agents/single-agent-usage-guide.md`

---

## 📋 Task Queue Overview

| # | Task | Est. Time | Status |
|---|------|-----------|--------|
| 1 | Create reid_ai_profiles queries | 15 min | ⏳ Ready |
| 2 | Update AIProfilesClient with real data | 20 min | ⏳ Ready |
| 3 | Update ReportsClient with real data | 15 min | ⏳ Ready |
| 4 | Create neighborhood queries for schools | 15 min | ⏳ Ready |
| 5 | Update SchoolsClient with real data | 20 min | ⏳ Ready |
| 6 | Update Expense/Tax Reports with real data | 20 min | ⏳ Ready |
| 7 | Remove outdated comments | 10 min | ⏳ Ready |
| 8 | Create reid_ai_profiles seed data | 20 min | ⏳ Ready |
| 9 | Create market_reports seed data | 15 min | ⏳ Ready |
| 10 | Create neighborhood_insights seed data | 15 min | ⏳ Ready |
| 11 | Create tax_reports seed data | 15 min | ⏳ Ready |
| 12 | Final verification & testing | 15 min | ⏳ Ready |

**Total Estimated Time:** ~3 hours

---

## 🎯 TASK 1: Create reid_ai_profiles Queries File

### Agent Prompt
```
Create queries file for reid_ai_profiles table in (platform)

Location: lib/modules/reid/ai/queries.ts

Requirements:
- Create Server Actions for reid_ai_profiles CRUD operations
- Implement getAIProfiles(filters?) - fetch all profiles for organization
- Implement getAIProfileById(id) - fetch single profile
- Implement getAIProfileStats() - aggregate stats (total, avg scores, etc.)
- Filter ALL queries by organizationId (multi-tenancy)
- Include RBAC check using canAccessREID(user)
- Use TypeScript strict types
- Export all functions with proper JSDoc comments

Database:
- Read prisma/SCHEMA-MODELS.md for reid_ai_profiles fields (lines 1553-1600)
- Table name: reid_ai_profiles
- Key fields: id, organization_id, profile_type, summary, overall_score, investment_score, recommendations
- Use existing pattern from lib/modules/reid/reports/queries.ts

Security:
- requireAuth() for all functions
- canAccessREID(user) permission check
- Filter by user.organizationId in ALL queries
- No cross-organization data access

Follow patterns from:
- lib/modules/reid/reports/queries.ts (similar structure)
- lib/modules/workspace/core/queries.ts (RBAC pattern)

Verification:
- npx tsc --noEmit (zero errors)
- Confirm all exports work with import test
- File size under 500 lines
```

### Success Criteria
- [ ] File created at correct location
- [ ] All CRUD query functions implemented
- [ ] Multi-tenancy filtering applied
- [ ] RBAC checks included
- [ ] TypeScript compiles with zero errors
- [ ] Exports match expected interface

---

## 🎯 TASK 2: Update AIProfilesClient with Real Data

### Agent Prompt
```
Update AIProfilesClient component to use real reid_ai_profiles database data in (platform)

Location: components/real-estate/reid/ai-profiles/AIProfilesClient.tsx

Current State:
- Component returns empty data (setProfiles([]))
- Has outdated comment: "Placeholder - REID is a skeleton module"
- UI fully built with filters, stats, cards

Requirements:
- Import getAIProfiles and getAIProfileStats from lib/modules/reid/ai/queries
- Replace loadData() function to fetch real data using Server Actions
- Update stats calculation to use getAIProfileStats()
- Replace MockAIProfile type with actual Prisma reid_ai_profiles type
- Keep all existing filter logic (status, recommendation, score)
- Add proper error handling with try/catch
- Add empty state message when no profiles exist
- Maintain existing loading states
- Remove outdated "skeleton module" comment

Data Fetching Pattern:
- Use Server Actions (not client-side fetch)
- Call queries in loadData() function
- Handle loading, error, and empty states
- Apply client-side filters after data fetch

Security:
- Server Actions automatically enforce organizationId filtering
- No additional security checks needed in client

Follow patterns from:
- components/real-estate/reid/reports/ReportsClient.tsx (similar structure)
- components/real-estate/crm/contacts/ContactsClient.tsx (data fetching pattern)

Verification:
- Component compiles with zero TypeScript errors
- Data fetches successfully from database
- Filters work correctly on real data
- Stats display correct aggregations
- Empty state shows when no data
- Loading state displays during fetch
```

### Success Criteria
- [ ] Real data fetched from reid_ai_profiles table
- [ ] Stats calculated from real data
- [ ] Filters work on fetched data
- [ ] Error handling implemented
- [ ] Outdated comments removed
- [ ] Component renders without errors

---

## 🎯 TASK 3: Update ReportsClient with Real Data

### Agent Prompt
```
Update ReportsClient component to use existing market_reports database queries in (platform)

Location: components/real-estate/reid/reports/ReportsClient.tsx

Current State:
- Component returns empty data (setReports([]))
- Has outdated comment: "Placeholder - REID is a skeleton module"
- Queries ALREADY EXIST in lib/modules/reid/reports/queries.ts
- UI fully built with report cards and stats

Requirements:
- Import getMarketReports from lib/modules/reid/reports/queries
- Replace loadReports() function to fetch real data using existing queries
- Replace MockREIDReport type with actual Prisma market_reports type
- Update stats calculations (totalReports, thisMonthReports)
- Add proper error handling with try/catch
- Add empty state message when no reports exist
- Maintain existing download/delete handlers (show "coming soon" toast for now)
- Remove outdated "skeleton module" comment

Data Fetching Pattern:
- Use existing getMarketReports() Server Action
- Call in loadReports() function
- Handle loading, error, and empty states
- No filters needed initially (fetch all for org)

Security:
- getMarketReports() already filters by organizationId
- RBAC already checked in queries file
- No additional security checks needed

Follow patterns from:
- components/real-estate/reid/ai-profiles/AIProfilesClient.tsx (same module)
- components/real-estate/workspace/document-list.tsx (similar data fetching)

Verification:
- Component compiles with zero TypeScript errors
- Data fetches successfully from market_reports table
- Stats calculate correctly from real data
- Empty state shows when no reports
- Loading state displays during fetch
- Download/delete handlers work (show toast)
```

### Success Criteria
- [ ] Real data fetched from market_reports table
- [ ] Stats calculated from real data
- [ ] Error handling implemented
- [ ] Empty state displays correctly
- [ ] Outdated comments removed
- [ ] Component renders without errors

---

## 🎯 TASK 4: Create Neighborhood Insights Queries for Schools

### Agent Prompt
```
Create queries file for neighborhood_insights focusing on schools data in (platform)

Location: lib/modules/reid/insights/queries.ts

Requirements:
- Create Server Actions for neighborhood_insights queries with focus on schools
- Implement getNeighborhoodInsights(filters?) - fetch all insights for organization
- Implement getNeighborhoodInsightById(id) - fetch single insight
- Implement getSchoolsData(filters?) - fetch insights with school_rating data
- Filter ALL queries by organizationId (multi-tenancy)
- Include RBAC check using canAccessREID(user)
- Support filtering by: zip_code, city, state, school_rating range
- Use TypeScript strict types
- Export all functions with proper JSDoc comments

Database:
- Read prisma/SCHEMA-MODELS.md for neighborhood_insights fields (lines 1189-1227)
- Table name: neighborhood_insights
- Key fields: id, organization_id, area_name, zip_code, city, state, school_rating, walk_score, crime_index
- Schools stored as: school_rating field (Float?)

Security:
- requireAuth() for all functions
- canAccessREID(user) permission check
- Filter by user.organizationId in ALL queries
- No cross-organization data access

Query Patterns:
```typescript
// Example: Get schools data with filtering
export async function getSchoolsData(filters?: {
  zipCode?: string;
  city?: string;
  state?: string;
  minSchoolRating?: number;
}) {
  const user = await requireAuth();
  if (!canAccessREID(user)) throw new Error('Unauthorized');

  return await prisma.neighborhood_insights.findMany({
    where: {
      organization_id: user.organizationId,
      school_rating: { not: null }, // Only areas with school data
      ...(filters?.minSchoolRating && {
        school_rating: { gte: filters.minSchoolRating }
      }),
      // Add other filters...
    },
    orderBy: { school_rating: 'desc' }
  });
}
```

Follow patterns from:
- lib/modules/reid/reports/queries.ts (similar structure)
- lib/modules/reid/alerts/queries.ts (filtering patterns)

Verification:
- npx tsc --noEmit (zero errors)
- Confirm all exports work
- File size under 500 lines
```

### Success Criteria
- [ ] File created with school-focused queries
- [ ] Multi-tenancy filtering applied
- [ ] RBAC checks included
- [ ] School rating filtering works
- [ ] TypeScript compiles with zero errors
- [ ] All functions exported correctly

---

## 🎯 TASK 5: Update SchoolsClient with Real Data

### Agent Prompt
```
Update SchoolsClient component to use real neighborhood_insights database data in (platform)

Location: components/real-estate/reid/schools/SchoolsClient.tsx

Current State:
- Component returns empty data (setSchools([]))
- Has outdated comment: "Placeholder - REID is a skeleton module"
- UI fully built with table, filters, comparison dialog

Requirements:
- Import getSchoolsData and getNeighborhoodInsights from lib/modules/reid/insights/queries
- Replace loadSchools() function to fetch real neighborhood insights with school data
- Map neighborhood_insights fields to MockSchool interface:
  - name → area_name
  - rating → school_rating
  - Other fields from neighborhood_insights data
- Update stats calculations (totalSchools, avgRating, topRatedCount)
- Keep all existing filter logic (type, rating, distance, search)
- Add proper error handling with try/catch
- Add empty state message when no schools data exists
- Maintain existing school selection and comparison features
- Remove outdated "skeleton module" comment

Data Mapping:
```typescript
// Map neighborhood_insights to school display format
const schoolsFromInsights = insights.map(insight => ({
  id: insight.id,
  name: insight.area_name,
  district: insight.county || 'Unknown District',
  type: 'PUBLIC', // Default or infer from data
  rating: insight.school_rating || 0,
  test_scores: 85, // Placeholder or calculate from metrics
  student_count: insight.households || 500,
  teacher_ratio: 15, // Default
  grade_levels: 'K-12',
  distance_miles: 0, // Calculate if location data available
  address: insight.area_name,
  city: insight.city || '',
  state: insight.state || '',
  zip_code: insight.zip_code || ''
}));
```

Security:
- Server Actions automatically enforce organizationId filtering
- No additional security checks needed in client

Follow patterns from:
- components/real-estate/reid/ai-profiles/AIProfilesClient.tsx (same module)
- components/real-estate/workspace/listings/page.tsx (table display)

Verification:
- Component compiles with zero TypeScript errors
- Data fetches successfully from neighborhood_insights
- Filters work correctly on real data
- Stats display correct calculations
- School comparison works with real data
- Empty state shows when no data
- Loading state displays during fetch
```

### Success Criteria
- [ ] Real data fetched from neighborhood_insights table
- [ ] Schools mapped from neighborhood data
- [ ] Stats calculated from real data
- [ ] Filters work on fetched data
- [ ] Comparison feature works
- [ ] Outdated comments removed
- [ ] Component renders without errors

---

## 🎯 TASK 6: Update Expense/Tax Reports with Real Data

### Agent Prompt
```
Update Expense/Tax Reports page to use real tax_reports database data in (platform)

Locations:
- app/real-estate/expense-tax/reports/page.tsx
- app/real-estate/expense-tax/reports/report-templates-section.tsx
- app/real-estate/expense-tax/reports/recent-reports-section.tsx

Current State:
- HeroSectionWrapper uses placeholder stats (all zeros)
- RecentReportsSection likely returns empty or mock data
- ReportTemplatesSection exists for report generation UI

Requirements:
1. Create queries file: lib/modules/expense-tax/reports/queries.ts
   - getTaxReports(filters?) - fetch all reports for organization
   - getTaxReportStats() - aggregate stats (total, by year, by status)
   - getTaxReportById(id) - fetch single report
   - Filter by organization_id
   - RBAC check (user can view expense-tax module)

2. Update HeroSectionWrapper (page.tsx):
   - Import getTaxReportStats()
   - Replace placeholder stats with real data:
     - Total Reports → count of all tax_reports
     - {currentYear} Reports → count where tax_year = currentYear
     - Completed → count where status = 'COMPLETED'
     - Shared → count where is_shared = true
   - Add error handling

3. Update RecentReportsSection:
   - Import getTaxReports()
   - Fetch recent reports (orderBy created_at desc, take 10)
   - Display report data in table/cards
   - Add download, share, delete handlers
   - Show empty state when no reports

Database:
- Read prisma/SCHEMA-MODELS.md for tax_reports fields (lines 2506-2564)
- Table name: tax_reports
- Key fields: id, organization_id, name, template_type, tax_year, status, file_url, is_shared
- Enum: TaxReportStatus (GENERATING, COMPLETED, FAILED)
- Enum: TaxReportType (SCHEDULE_E, FORM_1040, etc.)

Security:
- requireAuth() in all queries
- Filter by user.organizationId
- Check subscription tier (Expense/Tax requires STARTER+)
- Validate user can access expense-tax module

Follow patterns from:
- lib/modules/reid/reports/queries.ts (similar report queries)
- lib/modules/workspace/documents/queries.ts (document pattern)

Verification:
- TypeScript compiles (zero errors)
- Stats display real data
- Reports list shows correctly
- Empty state displays when appropriate
- All handlers work (download, share, delete)
```

### Success Criteria
- [ ] Queries file created for tax_reports
- [ ] Real stats displayed in hero section
- [ ] Recent reports fetched from database
- [ ] Error handling implemented
- [ ] Empty states working
- [ ] All components render correctly

---

## 🎯 TASK 7: Remove Outdated Comments

### Agent Prompt
```
Remove all outdated "skeleton module" and "no database tables" comments from REID and Expense/Tax components in (platform)

Target Files:
1. components/real-estate/reid/ai-profiles/AIProfilesClient.tsx
2. components/real-estate/reid/reports/ReportsClient.tsx
3. components/real-estate/reid/schools/SchoolsClient.tsx
4. app/real-estate/expense-tax/reports/page.tsx (if present)
5. Any other REID/Expense components with similar comments

Search Patterns:
- "Placeholder - REID is a skeleton module"
- "no database tables yet"
- "skeleton module"
- "REID module under development"
- "coming soon - REID module"

Requirements:
- Search entire components/real-estate/reid/ directory
- Search app/real-estate/reid/ directory
- Search app/real-estate/expense-tax/ directory
- Remove or update outdated comments
- Keep helpful comments that explain functionality
- Update JSDoc comments if they reference "mock data"

Use grep to find:
```bash
cd (platform)
grep -r "skeleton module" components/real-estate/reid/ app/real-estate/reid/
grep -r "no database tables" components/real-estate/reid/ app/real-estate/reid/
grep -r "Placeholder.*REID" components/real-estate/reid/ app/real-estate/reid/
```

Replace with:
- If explaining data source: "Fetches data from {table_name} database table"
- If explaining feature: Keep if still accurate, remove if outdated
- If TODO/placeholder: Remove entirely (features now implemented)

Verification:
- Grep confirms no outdated comments remain
- TypeScript still compiles
- No functional changes to code
- Only comments modified
```

### Success Criteria
- [ ] All "skeleton module" comments removed
- [ ] All "no database tables" comments removed
- [ ] Helpful comments preserved
- [ ] No functional code changes
- [ ] TypeScript compiles successfully

---

## 🎯 TASK 8: Create reid_ai_profiles Seed Data

### Agent Prompt
```
Create comprehensive seed data script for reid_ai_profiles table in (platform)

Location: prisma/seeds/reid-ai-profiles-seed.ts

Requirements:
Create 15-20 realistic AI profile records with:
- Variety of profile_types: 'neighborhood', 'property', 'market'
- Different locations: Multiple cities, zip codes, states
- Realistic scores: overall_score (65-95), investment_score (60-90), lifestyle_score (70-95)
- Varied recommendations in JSON format
- Mix of verified and unverified profiles
- Different AI models used
- Realistic timestamps (last 6 months)

Data Structure (from schema):
```typescript
{
  id: uuid(),
  organization_id: 'demo-org-id', // Use existing test org
  user_id: 'demo-user-id', // Use existing test user
  profile_type: 'neighborhood',
  address: '123 Main St, Austin, TX 78701',
  zip_code: '78701',
  city: 'Austin',
  state: 'TX',
  summary: 'Vibrant urban neighborhood with excellent walkability...',
  detailed_analysis: 'This area shows strong growth potential with...',
  strengths: ['High walkability', 'Top-rated schools', 'Low crime'],
  weaknesses: ['High property prices', 'Limited parking'],
  opportunities: ['New development projects', 'Transit expansion'],
  overall_score: 87.5,
  investment_score: 82.0,
  lifestyle_score: 91.0,
  growth_potential: 8.5,
  risk_score: 3.2,
  metrics: { median_price: 450000, rent_yield: 4.2 },
  recommendations: [
    { type: 'investment', priority: 'high', text: '...' }
  ],
  data_sources: ['Zillow', 'Census', 'GreatSchools'],
  ai_model: 'KIMIK2',
  confidence_score: 0.89,
  is_verified: true,
  tags: ['family-friendly', 'investment-opportunity'],
  created_at: new Date('2024-08-15')
}
```

Include diverse locations:
- Austin, TX (tech hub)
- Denver, CO (mountain lifestyle)
- Miami, FL (tropical urban)
- Portland, OR (eco-conscious)
- Phoenix, AZ (affordable growth)
- Multiple neighborhoods per city

Script Structure:
```typescript
import { prisma } from '@/lib/database/prisma';

export async function seedREIDAIProfiles() {
  console.log('Seeding reid_ai_profiles...');

  const profiles = [
    // 15-20 profile objects...
  ];

  for (const profile of profiles) {
    await prisma.reid_ai_profiles.create({ data: profile });
  }

  console.log(`✅ Seeded ${profiles.length} AI profiles`);
}
```

Database:
- Read prisma/SCHEMA-MODELS.md lines 1553-1600 for complete field reference
- Use valid organization_id and user_id from existing test data
- Follow Prisma enum types exactly

Verification:
- Script runs without errors
- All 15-20 records created successfully
- Data displays correctly in AIProfilesClient
- Filters work with seeded data
- Stats calculate correctly
```

### Success Criteria
- [ ] Seed script created with 15-20 profiles
- [ ] Diverse locations and profile types
- [ ] Realistic data values
- [ ] Script executes successfully
- [ ] Data appears in UI correctly

---

## 🎯 TASK 9: Create market_reports Seed Data

### Agent Prompt
```
Create comprehensive seed data script for market_reports table in (platform)

Location: prisma/seeds/market-reports-seed.ts

Requirements:
Create 12-15 realistic market report records with:
- Variety of report_types: 'MARKET_OVERVIEW', 'DEMOGRAPHIC_REPORT', 'INVESTMENT_ANALYSIS', 'COMPARATIVE_ANALYSIS'
- Different status values: 'DRAFT', 'PUBLISHED', 'ARCHIVED'
- Multiple area configurations (zip codes, cities, states)
- Date ranges covering different quarters
- Mix of public and private reports
- Realistic view/download counts
- File paths for generated reports
- Mix of template and custom reports

Data Structure (from schema):
```typescript
{
  id: uuid(),
  organization_id: 'demo-org-id',
  user_id: 'demo-user-id',
  name: 'Q3 2024 Austin Market Analysis',
  description: 'Comprehensive analysis of Austin real estate market...',
  report_type: 'MARKET_OVERVIEW',
  status: 'PUBLISHED',
  area_type: 'ZIP_CODE',
  zip_codes: ['78701', '78702', '78703'],
  cities: ['Austin'],
  states: ['TX'],
  date_range_start: new Date('2024-07-01'),
  date_range_end: new Date('2024-09-30'),
  data: {
    median_price: 485000,
    price_change: 5.2,
    inventory: 450,
    days_on_market: 32
  },
  insights: {
    trends: ['Increasing demand', 'Limited inventory'],
    outlook: 'Positive'
  },
  file_path: '/reports/austin-q3-2024.pdf',
  file_format: 'PDF',
  is_public: false,
  view_count: 42,
  download_count: 15,
  tags: ['quarterly', 'austin', 'market-analysis'],
  generated_at: new Date('2024-10-01'),
  created_at: new Date('2024-09-28')
}
```

Include variety:
- Quarterly market overviews (Q1-Q4 2024)
- Demographic reports for different cities
- Investment analysis reports
- Comparative analyses (2+ cities)
- Mix of completed and draft reports
- Different date ranges and areas

Script Structure:
```typescript
import { prisma } from '@/lib/database/prisma';

export async function seedMarketReports() {
  console.log('Seeding market_reports...');

  const reports = [
    // 12-15 report objects...
  ];

  for (const report of reports) {
    await prisma.market_reports.create({ data: report });
  }

  console.log(`✅ Seeded ${reports.length} market reports`);
}
```

Database:
- Read prisma/SCHEMA-MODELS.md lines 1956-2015 for field reference
- Use ReidReportType enum values
- Use valid organization_id and user_id
- Follow JSON structure for data and insights fields

Verification:
- Script runs without errors
- All 12-15 records created successfully
- Data displays correctly in ReportsClient
- Different report types represented
- Stats calculate correctly
```

### Success Criteria
- [ ] Seed script created with 12-15 reports
- [ ] Variety of report types
- [ ] Realistic data values
- [ ] Script executes successfully
- [ ] Data appears in UI correctly

---

## 🎯 TASK 10: Create neighborhood_insights Seed Data for Schools

### Agent Prompt
```
Create comprehensive seed data script for neighborhood_insights table focusing on schools data in (platform)

Location: prisma/seeds/neighborhood-insights-seed.ts

Requirements:
Create 20-25 realistic neighborhood insight records with school ratings:
- Multiple cities across different states
- school_rating values from 5.0 to 10.0 (GreatSchools-style)
- Additional metrics: walk_score, crime_index, median_income
- Variety of area_types: 'ZIP_CODE', 'NEIGHBORHOOD', 'CITY'
- Mix of investment grades: 'A', 'B', 'C'
- Realistic demographic and economic data
- Different school rating distributions

Data Structure (from schema):
```typescript
{
  id: uuid(),
  organization_id: 'demo-org-id',
  area_name: 'Downtown Austin - Zilker',
  area_code: 'ATX-ZLK-001',
  area_type: 'NEIGHBORHOOD',
  zip_code: '78704',
  city: 'Austin',
  state: 'TX',
  county: 'Travis',
  median_price: 650000,
  avg_price: 725000,
  price_per_sqft: 425,
  price_change: 6.2,
  days_on_market: 28,
  inventory: 45,
  median_age: 34.5,
  median_income: 89500,
  households: 8500,
  school_rating: 9.2, // KEY FIELD for schools feature
  walk_score: 87,
  bike_score: 78,
  crime_index: 'LOW',
  park_proximity: 0.5,
  commute_time: 18,
  rent_yield: 4.8,
  appreciation_rate: 5.5,
  investment_grade: 'A',
  data_source: 'Zillow + GreatSchools + Census',
  created_by_id: 'demo-user-id',
  created_at: new Date('2024-09-01')
}
```

Coverage Requirements:
- 5-6 areas per major city (Austin, Denver, Portland, Phoenix, Miami)
- School ratings:
  - 10 areas with rating 8.0+ (excellent)
  - 8 areas with rating 6.0-7.9 (good)
  - 5 areas with rating 5.0-5.9 (fair)
- Mix of urban, suburban, mixed area types
- Varied investment grades based on metrics
- Realistic correlations (high school rating + higher median price)

Script Structure:
```typescript
import { prisma } from '@/lib/database/prisma';

export async function seedNeighborhoodInsights() {
  console.log('Seeding neighborhood_insights...');

  const insights = [
    // 20-25 neighborhood objects...
  ];

  for (const insight of insights) {
    await prisma.neighborhood_insights.create({ data: insight });
  }

  console.log(`✅ Seeded ${insights.length} neighborhood insights`);
}
```

Database:
- Read prisma/SCHEMA-MODELS.md lines 1189-1227 for complete field reference
- school_rating is Float? (nullable, but populate for all records)
- Use AreaType enum: ZIP_CODE, NEIGHBORHOOD, CITY, COUNTY, METRO
- Use valid organization_id and created_by_id

Verification:
- Script runs without errors
- All 20-25 records created successfully
- School ratings populated for all records
- Data displays correctly in SchoolsClient
- Filters work with seeded data
- Stats calculate correctly (avg rating, top rated count)
```

### Success Criteria
- [ ] Seed script created with 20-25 neighborhoods
- [ ] All have school_rating populated
- [ ] Diverse locations and ratings
- [ ] Realistic correlated data
- [ ] Script executes successfully
- [ ] Data appears in SchoolsClient correctly

---

## 🎯 TASK 11: Create tax_reports Seed Data

### Agent Prompt
```
Create comprehensive seed data script for tax_reports table in (platform)

Location: prisma/seeds/tax-reports-seed.ts

Requirements:
Create 10-12 realistic tax report records with:
- Variety of template_types: 'SCHEDULE_E', 'FORM_1040', 'EXPENSE_SUMMARY', 'YEAR_END_TAX'
- Different tax years: 2022, 2023, 2024
- Multiple status values: 'GENERATING', 'COMPLETED', 'FAILED'
- Realistic financial data (income, expenses, deductions)
- Mix of shared and private reports
- File URLs for completed reports
- QuickBooks integration data (some synced, some not)

Data Structure (from schema):
```typescript
{
  id: uuid(),
  organization_id: 'demo-org-id',
  user_id: 'demo-user-id',
  name: 'Schedule E - 2023 Rental Properties',
  template_type: 'SCHEDULE_E',
  tax_year: 2023,
  period_start: new Date('2023-01-01'),
  period_end: new Date('2023-12-31'),
  status: 'COMPLETED',
  file_url: '/tax-reports/schedule-e-2023.pdf',
  file_format: 'PDF',
  file_size_bytes: 245000,
  total_income: 125000.00,
  total_expenses: 48500.00,
  total_deductions: 35200.00,
  categories_count: 8,
  expenses_count: 142,
  is_shared: false,
  shared_with: null,
  quickbooks_synced: new Date('2024-01-15'),
  generated_at: new Date('2024-01-10'),
  generation_time_ms: 4250,
  template_version: '1.0',
  created_at: new Date('2024-01-05')
}
```

Include variety:
- Schedule E for rental income (2+ reports)
- Form 1040 summaries (2+ reports)
- Expense categorization reports
- Year-end tax summaries
- Q1-Q4 quarterly reports for 2024
- Mix of completed and generating states
- Some with QuickBooks sync, some without

Financial Data Ranges:
- total_income: $25,000 - $250,000
- total_expenses: $10,000 - $100,000
- total_deductions: $5,000 - $50,000
- Realistic ratios (expenses < income)

Script Structure:
```typescript
import { prisma } from '@/lib/database/prisma';

export async function seedTaxReports() {
  console.log('Seeding tax_reports...');

  const reports = [
    // 10-12 report objects...
  ];

  for (const report of reports) {
    await prisma.tax_reports.create({ data: report });
  }

  console.log(`✅ Seeded ${reports.length} tax reports`);
}
```

Database:
- Read prisma/SCHEMA-MODELS.md lines 2506-2564 for field reference
- Use TaxReportType enum values
- Use TaxReportStatus enum values
- Use valid organization_id and user_id
- Decimal fields need proper format

Verification:
- Script runs without errors
- All 10-12 records created successfully
- Data displays correctly in Expense/Tax Reports page
- Stats calculate correctly (total, by year, by status)
- Financial data displays properly
```

### Success Criteria
- [ ] Seed script created with 10-12 reports
- [ ] Variety of report types and years
- [ ] Realistic financial data
- [ ] Script executes successfully
- [ ] Data appears in UI correctly

---

## 🎯 TASK 12: Final Verification & Testing

### Agent Prompt
```
Run comprehensive verification across all REID and Expense/Tax changes in (platform)

Location: (platform)/

Verification Commands:
```bash
cd (platform)

# 1. TypeScript Check
npx tsc --noEmit
# Expected: 0 errors

# 2. Linting
npm run lint
# Expected: 0 errors, minimal warnings

# 3. Build Check
npm run build
# Expected: Successful build

# 4. Test Affected Areas
npm test -- reid
npm test -- expense-tax
# Expected: All tests pass

# 5. Seed Data Execution
npx tsx prisma/seeds/reid-ai-profiles-seed.ts
npx tsx prisma/seeds/market-reports-seed.ts
npx tsx prisma/seeds/neighborhood-insights-seed.ts
npx tsx prisma/seeds/tax-reports-seed.ts
# Expected: All seed scripts execute successfully

# 6. Manual UI Testing
# - Navigate to /real-estate/reid/ai-profiles → data loads
# - Navigate to /real-estate/reid/reports → data loads
# - Navigate to /real-estate/reid/schools → data loads
# - Navigate to /real-estate/expense-tax/reports → stats show real data
# - Test filters, sorting, search in each page
# - Verify stats calculations are correct
```

Manual Testing Checklist:
- [ ] REID AI Profiles page loads with real data
- [ ] Filters work correctly (status, recommendation, score)
- [ ] Stats display accurate counts and averages
- [ ] Empty state shows when appropriate
- [ ] REID Reports page loads with real data
- [ ] Report cards display correctly
- [ ] Download/delete actions work (toast messages)
- [ ] REID Schools page loads with real data
- [ ] School comparison feature works
- [ ] Filters work (type, rating, distance)
- [ ] Expense/Tax Reports page shows real stats
- [ ] Recent reports display correctly
- [ ] Report generation UI works

Comprehensive Report:
```markdown
## ✅ FINAL VERIFICATION REPORT

**Project:** (platform)
**Verification Date:** [Date]
**Modules:** REID (AI Profiles, Reports, Schools) + Expense/Tax Reports

### TypeScript Check
```
[paste npx tsc --noEmit output]
```

### Linting
```
[paste npm run lint output]
```

### Build Status
```
[paste npm run build output summary]
```

### Test Results
```
[paste test output]
```

### Seed Data Execution
```
[paste seed script outputs]
```

### Manual Testing Results
- REID AI Profiles: ✅/❌ [details]
- REID Reports: ✅/❌ [details]
- REID Schools: ✅/❌ [details]
- Expense/Tax Reports: ✅/❌ [details]

### Database Verification
- reid_ai_profiles: [count] records
- market_reports: [count] records
- neighborhood_insights: [count] records with school_rating
- tax_reports: [count] records

### Issues Found
[List any issues discovered, or "NONE"]

### Files Modified (Summary)
- Total files changed: [count]
- New files created: [count]
- Queries added: [count]
- Components updated: [count]
- Seed scripts created: [count]

### Completion Status
✅ All tasks completed successfully
✅ All verification checks passed
✅ Production ready for deployment
```
```

### Success Criteria
- [ ] All TypeScript errors resolved
- [ ] Build succeeds
- [ ] All tests pass
- [ ] Seed data populates correctly
- [ ] All UIs display real data
- [ ] Filters and features work
- [ ] Comprehensive report provided

---

## 📊 Progress Tracking

Update this section as tasks are completed:

```
✅ = Complete
🔄 = In Progress
⏳ = Ready
❌ = Blocked

Task 1: ⏳ Create reid_ai_profiles queries
Task 2: ⏳ Update AIProfilesClient
Task 3: ⏳ Update ReportsClient
Task 4: ⏳ Create schools queries
Task 5: ⏳ Update SchoolsClient
Task 6: ⏳ Update Expense/Tax Reports
Task 7: ⏳ Remove outdated comments
Task 8: ⏳ Create AI profiles seed data
Task 9: ⏳ Create reports seed data
Task 10: ⏳ Create schools seed data
Task 11: ⏳ Create tax reports seed data
Task 12: ⏳ Final verification
```

---

## 🎯 Execution Strategy

### Sequential Execution (Recommended)
Tasks should be executed in order (1 → 12) because:
- Tasks 2-3 depend on queries from Task 1
- Task 5 depends on queries from Task 4
- Tasks 8-11 (seed data) depend on queries being created
- Task 12 (verification) requires all previous tasks complete

### Parallel Execution (Alternative)
If using parallel execution:
- Group A: Tasks 1, 4, 6 (query creation)
- Group B: Tasks 2, 3, 5 (client updates) - after Group A
- Group C: Tasks 8, 9, 10, 11 (seed data) - after Group A
- Group D: Task 7 (comments) - anytime
- Group E: Task 12 (verification) - after all others

### Quality Gates
After every 3-4 tasks, run mini-verification:
```bash
npx tsc --noEmit && npm run lint
```

Proceed only if checks pass.

---

## 📝 Notes

- All tasks follow patterns from `.claude/agents/single-agent-usage-guide.md`
- Security requirements enforced: RBAC + Multi-tenancy + Input validation
- Database workflow optimized: Local docs (99% token savings vs MCP)
- Each task includes verification requirements and success criteria
- Agent will provide execution reports after each task

**Ready to delegate tasks one by one to `strive-agent-universal`**
