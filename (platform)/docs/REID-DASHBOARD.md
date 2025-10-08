# REID (Real Estate Intelligence Dashboard) - Documentation

## Overview

The REID Dashboard is a comprehensive real estate analytics platform integrated into Strive SaaS, providing market intelligence, demographic analysis, investment tools, and AI-powered insights for real estate professionals.

**Status:** Production Ready (Session 12 Complete)
**Module Location:** `app/real-estate/rei-analytics/`
**Backend Logic:** `lib/modules/rei-analytics/`

## Features

### 1. Market Heatmap
- Interactive Leaflet-based map with dark CartoDB tiles
- Visualization layers: Price, Inventory, Trends
- Area selection and detailed metrics display
- Real-time market data updates
- Geographic boundary visualization

### 2. Demographics Analysis
- Population demographics breakdown
- Income and age distribution
- Household statistics
- Commute time analysis
- Education level insights

### 3. Market Trends
- Historical price trends
- Inventory level tracking
- Days on market analysis
- Multiple chart types (line, area, bar)
- Year-over-year comparisons

### 4. ROI Investment Simulator
- Purchase price modeling
- Down payment calculations
- Rental income projections
- Cap rate and cash-on-cash return calculations
- Multi-year holding period analysis
- Appreciation forecasting

### 5. AI-Powered Profiles (Elite Tier Only)
- Neighborhood profile generation
- Comparative area analysis
- Investment recommendations
- Market forecast insights
- Natural language summaries

### 6. Property Alerts
- Price change monitoring
- Inventory level alerts
- Market trend notifications
- Email and SMS notifications
- Configurable frequency (Immediate, Daily, Weekly, Monthly)
- Custom threshold settings

### 7. Market Reports
- Neighborhood analysis reports
- Market overview reports
- Comparative studies
- Investment analysis reports
- PDF and CSV export
- Shareable report links

### 8. User Preferences
- Dashboard layout customization
- Theme preferences (dark/light)
- Chart type preferences
- Notification settings
- Data format preferences

## Architecture

### Database Schema

**Primary Tables:**
```
neighborhood_insights - Market and demographic data
property_alerts       - Alert configurations
alert_triggers        - Alert event history
market_reports        - Generated reports
user_preferences      - User customization
```

**Related Enums:**
```
AreaType          - ZIP, SCHOOL_DISTRICT, NEIGHBORHOOD, COUNTY, MSA
AlertType         - PRICE_DROP, PRICE_INCREASE, NEW_LISTING, SOLD, etc.
AlertFrequency    - IMMEDIATE, DAILY, WEEKLY, MONTHLY
AlertSeverity     - LOW, MEDIUM, HIGH, CRITICAL
ReidReportType    - NEIGHBORHOOD_ANALYSIS, MARKET_OVERVIEW, etc.
```

### Module Structure
```
lib/modules/rei-analytics/
├── insights/     - Neighborhood data management
├── alerts/       - Alert system
├── reports/      - Report generation
├── preferences/  - User preferences
├── ai/          - AI profile generation
├── actions.ts   - Server Actions
├── queries.ts   - Data queries
├── schemas.ts   - Zod validation
└── index.ts     - Public API
```

### UI Components
```
components/real-estate/rei-analytics/
├── maps/         - Leaflet integration
├── charts/       - Recharts visualizations
├── analytics/    - Analysis components
├── alerts/       - Alert management UI
├── reports/      - Report generation UI
└── shared/       - Reusable components
```

### Route Structure
```
app/real-estate/rei-analytics/
├── dashboard/    - Main dashboard page
├── heatmap/      - Market heatmap view
├── demographics/ - Demographics analysis
├── trends/       - Trends analysis
├── roi/          - ROI simulator
├── ai-profiles/  - AI-generated profiles
├── alerts/       - Alert management
└── reports/      - Report center
```

## Access Control

### Subscription Tier Requirements

| Tier | REID Access | Limits |
|------|-------------|--------|
| FREE | No Access | - |
| STARTER | No Access | - |
| GROWTH | Basic Features | 50 insights, 10 alerts, 5 reports/month |
| ELITE | Full Access + AI | Unlimited insights, alerts, reports |

**GROWTH Tier Features:**
- Market heatmap (basic)
- Demographics analysis
- Market trends
- ROI simulator
- Property alerts (10 max)
- Reports (5/month)

**ELITE Tier Features (Additional):**
- AI-powered neighborhood profiles
- Comparative analysis with AI insights
- Investment recommendations
- Unlimited alerts and reports
- Advanced analytics

### Role Requirements

**Global Roles:**
- ADMIN - Full REID access
- MODERATOR - Read-only REID access
- EMPLOYEE - Full REID access based on org role
- USER - No REID access (client-only role)

**Organization Roles:**
- OWNER - Full REID management
- ADMIN - Full REID management
- MEMBER - REID usage (no management)
- VIEWER - Read-only REID access

**Permission Check Example:**
```typescript
// Check both global and org roles
const hasREIDAccess =
  ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole) &&
  ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

// Check tier requirement
const hasTierAccess =
  ['GROWTH', 'ELITE'].includes(user.subscriptionTier);

// Check AI features (Elite only)
const hasAIAccess =
  user.subscriptionTier === 'ELITE';
```

## API Endpoints

### Insights

**List Neighborhood Insights**
```http
GET /api/v1/reid/insights
```
Query Parameters:
- `areaCodes` (string[]): Filter by area codes
- `areaType` (enum): ZIP, SCHOOL_DISTRICT, NEIGHBORHOOD
- `minPrice` (number): Minimum median price
- `maxPrice` (number): Maximum median price
- `minWalkScore` (number): Minimum walk score (0-100)

Response:
```json
{
  "insights": [
    {
      "id": "uuid",
      "areaCode": "94110",
      "areaName": "Mission District",
      "medianPrice": 1200000,
      "walkScore": 95,
      "demographics": { ... },
      "amenities": { ... }
    }
  ]
}
```

**Get Specific Insight**
```http
GET /api/v1/reid/insights/[areaCode]
```

**Create Insight**
```http
POST /api/v1/reid/insights
```
Body:
```json
{
  "areaCode": "94110",
  "areaName": "Mission District",
  "areaType": "ZIP",
  "marketData": { ... },
  "demographics": { ... },
  "amenities": { ... }
}
```

**Update Insight**
```http
PUT /api/v1/reid/insights/[id]
```

**Delete Insight**
```http
DELETE /api/v1/reid/insights/[id]
```

### Alerts

**List Alerts**
```http
GET /api/v1/reid/alerts
```

**Create Alert**
```http
POST /api/v1/reid/alerts
```
Body:
```json
{
  "name": "Price Drop Alert",
  "alertType": "PRICE_DROP",
  "areaCodes": ["94110", "94103"],
  "criteria": {
    "threshold": -5,
    "comparison": "percentage"
  },
  "emailEnabled": true,
  "frequency": "DAILY"
}
```

**Update Alert**
```http
PUT /api/v1/reid/alerts/[id]
```

**Delete Alert**
```http
DELETE /api/v1/reid/alerts/[id]
```

**List Alert Triggers**
```http
GET /api/v1/reid/alerts/triggers
```

**Acknowledge Trigger**
```http
POST /api/v1/reid/alerts/triggers/[id]/acknowledge
```

### Reports

**List Reports**
```http
GET /api/v1/reid/reports
```

**Generate Report**
```http
POST /api/v1/reid/reports
```
Body:
```json
{
  "title": "Mission District Analysis",
  "reportType": "NEIGHBORHOOD_ANALYSIS",
  "areaCodes": ["94110"],
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

**Get Report**
```http
GET /api/v1/reid/reports/[id]
```

**Generate PDF**
```http
POST /api/v1/reid/reports/[id]/pdf
```

**Generate CSV**
```http
POST /api/v1/reid/reports/[id]/csv
```

### AI (Elite Only)

**Generate AI Profile**
```http
POST /api/v1/reid/ai/profile
```
Body:
```json
{
  "areaCode": "94110"
}
```

Response:
```json
{
  "profile": "AI-generated neighborhood analysis...",
  "insights": [
    "Strong rental market with 95% occupancy",
    "Median price increased 8% year-over-year",
    "Excellent walkability and transit access"
  ],
  "investmentGrade": "A",
  "recommendations": [
    "Consider multi-family properties for best ROI",
    "Watch for new development projects in Q2 2025"
  ]
}
```

**Analyze Multiple Areas**
```http
POST /api/v1/reid/ai/insights
```
Body:
```json
{
  "areaCodes": ["94110", "94103", "94102"]
}
```

**Get Investment Recommendations**
```http
POST /api/v1/reid/ai/recommendations
```
Body:
```json
{
  "budget": 1500000,
  "investmentType": "rental",
  "riskTolerance": "moderate"
}
```

## Environment Variables

### Required

```bash
# Database (Supabase)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Server-only, NEVER expose to client

# AI Services (for Elite tier features)
OPENROUTER_API_KEY=sk-or-xxx...
GROQ_API_KEY=gsk_xxx...

# Map Services (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1... # Optional, for Mapbox integration
```

### Optional

```bash
# Email Notifications (for alerts)
SENDGRID_API_KEY=SG.xxx...
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=${SENDGRID_API_KEY}

# SMS Notifications (for alerts)
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1xxx...

# Report Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=reid-reports
```

## Testing

### Run Tests

```bash
# Unit tests
npm test modules/reid-analytics

# Component tests
npm test components/real-estate/rei-analytics

# E2E tests
npx playwright test reid-dashboard

# Coverage report
npm test -- --coverage --watchAll=false
```

### Coverage Requirements
- Overall: 80%+
- Modules: 90%+
- API Routes: 100%
- RBAC: 100%

### Test Suites

**Module Tests:**
- `__tests__/modules/reid-analytics/insights.test.ts`
- `__tests__/modules/reid-analytics/alerts.test.ts`
- `__tests__/modules/reid-analytics/reports.test.ts`
- `__tests__/modules/reid-analytics/preferences.test.ts`

**Component Tests:**
- `__tests__/components/rei-analytics/market-heatmap.test.tsx`
- `__tests__/components/rei-analytics/roi-simulator.test.tsx`
- `__tests__/components/rei-analytics/demographics-panel.test.tsx`

**Integration Tests:**
- `__tests__/integration/reid-dashboard.test.ts`
- `__tests__/integration/reid-rbac.test.ts`

## Security

### Multi-Tenancy Isolation

**All queries MUST filter by organizationId:**
```typescript
// Correct - RLS enforced
const insights = await prisma.neighborhoodInsight.findMany({
  where: {
    organizationId: session.user.organizationId
  }
});

// WRONG - Data leak!
const insights = await prisma.neighborhoodInsight.findMany();
```

### RBAC Enforcement

**Check permissions before actions:**
```typescript
import { canAccessREID, canAccessAIFeatures } from '@/lib/auth/rbac';

// Check REID access
if (!canAccessREID(session.user)) {
  throw new Error('Unauthorized: REID access required');
}

// Check AI features (Elite only)
if (!canAccessAIFeatures(session.user)) {
  throw new Error('Upgrade required: Elite tier needed for AI features');
}
```

### Input Validation

**Always validate with Zod:**
```typescript
import { NeighborhoodInsightSchema } from '@/lib/modules/rei-analytics/schemas';

// Validate before processing
const validated = NeighborhoodInsightSchema.parse(userInput);
```

### Tier Limit Enforcement

**Check usage against tier limits:**
```typescript
import { checkREIDUsage, getREIDLimits } from '@/lib/auth/rbac';

const limits = getREIDLimits(user.subscriptionTier);
const usage = await checkREIDUsage(user.organizationId);

if (usage.insights >= limits.insights && limits.insights !== -1) {
  throw new Error('Monthly insight limit reached. Upgrade to Elite for unlimited access.');
}
```

## Performance Optimization

### Chart Lazy Loading

```typescript
// Lazy load heavy chart components
const TrendsChart = dynamic(
  () => import('@/components/real-estate/rei-analytics/charts/trends-chart'),
  { ssr: false, loading: () => <Skeleton className="h-64" /> }
);
```

### Map SSR Compatibility

```typescript
// Leaflet requires client-side rendering
const MarketHeatmap = dynamic(
  () => import('@/components/real-estate/rei-analytics/maps/market-heatmap'),
  { ssr: false, loading: () => <div className="h-96 bg-slate-800 animate-pulse" /> }
);
```

### Data Caching

```typescript
// Use TanStack Query for intelligent caching
const { data: insights, isLoading } = useQuery({
  queryKey: ['neighborhood-insights', filters],
  queryFn: () => fetchInsights(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000  // 30 minutes
});
```

### Bundle Size Optimization

```typescript
// Tree-shake Recharts imports
import { LineChart, Line, XAxis, YAxis } from 'recharts';
// Don't import entire library
// ❌ import * as Recharts from 'recharts';
```

## Troubleshooting

### Map Not Loading

**Issue:** Leaflet map not rendering

**Solution:**
1. Verify Leaflet CSS imported in layout
2. Check dynamic import with `ssr: false`
3. Ensure dark tile layer URL correct
4. Check browser console for tile loading errors

```tsx
// Correct Leaflet integration
import 'leaflet/dist/leaflet.css';

const Map = dynamic(
  () => import('./leaflet-map'),
  { ssr: false }
);
```

### AI Features Not Working

**Issue:** AI profile generation failing

**Solution:**
1. Verify `OPENROUTER_API_KEY` environment variable set
2. Check Elite tier access for user
3. Verify API rate limits not exceeded
4. Check API error responses in Network tab

```typescript
// Debug AI feature access
console.log('Tier:', user.subscriptionTier);
console.log('Has AI Access:', user.subscriptionTier === 'ELITE');
```

### Alerts Not Triggering

**Issue:** Property alerts not sending notifications

**Solution:**
1. Check alert processor cron job running
2. Verify email/SMS credentials configured
3. Check alert criteria logic
4. Review alert trigger logs in database

```bash
# Check alert triggers
npm run check-alerts

# View alert processor logs
npm run alert-logs
```

### Performance Issues

**Issue:** Dashboard loading slowly

**Solution:**
1. Enable Suspense boundaries for streaming
2. Lazy load heavy components (maps, charts)
3. Optimize chart data size (limit data points)
4. Use pagination for large lists
5. Add caching with TanStack Query

```tsx
// Add Suspense for better perceived performance
<Suspense fallback={<DashboardSkeleton />}>
  <REIDDashboard />
</Suspense>
```

## Support

### Documentation
- [Integration Guide](../update-sessions/dashboard-&-module-integrations/REIDashboard/reid-dashboard-integration-plan.md)
- [API Reference](./API-REFERENCE.md)
- [User Guide](./REID-USER-GUIDE.md)
- [Deployment Checklist](../update-sessions/dashboard-&-module-integrations/REIDashboard/DEPLOYMENT-CHECKLIST.md)

### Contact
- Technical Issues: dev@strivetech.ai
- Feature Requests: product@strivetech.ai
- Security Concerns: security@strivetech.ai
- User Support: support@strivetech.ai

---

**Last Updated:** 2025-10-07
**Version:** 1.0 (Session 12 Complete)
**Status:** Production Ready
