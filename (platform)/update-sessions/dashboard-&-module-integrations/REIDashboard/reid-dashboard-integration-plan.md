# REID (Real Estate Intelligence Dashboard) Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the REID (Real Estate Intelligence Dashboard) into the Strive SaaS Platform, preserving the exact dark-themed UI design and comprehensive real estate analytics while adapting it to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- REID Dashboard code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (From Documentation)
**Design Theme:**
- **Dark Theme**: Modern dark-themed dashboard with professional aesthetics
- **Color Palette**: 
  - Primary: Cyan/purple neon accent colors
  - Background: Dark slate tones
  - Accent: Neon cyan and purple highlights
- **Typography**: Inter font family for primary typography, Fira Code for data
- **Data Density**: Emphasizes comprehensive data visualization
- **Interactive Elements**: Collapsible sidebar, interactive maps, responsive charts

**Key Visual Elements:**
- Eight core modules: Heatmap, Demographics, Schools & Amenities, Comparative Trends, ROI Simulator, AI Profiles, Alerts, and Export
- Interactive Leaflet maps with dark CartoDB tiles
- Recharts data visualizations
- Modular dashboard cards with data-dense layouts
- Responsive design with collapsible navigation

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add REID Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// REID (Real Estate Intelligence Dashboard) Module Tables
model NeighborhoodInsight {
  id             String   @id @default(cuid())
  areaCode       String   // Zip code or school district identifier
  areaName       String   // Neighborhood name
  areaType       AreaType @default(ZIP) // ZIP or SCHOOL_DISTRICT
  
  // Market Metrics
  marketData     Json     // Market analysis data
  medianPrice    Decimal?
  daysOnMarket   Int?
  inventory      Int?
  priceChange    Float?   // Percentage change
  
  // Demographics
  demographics   Json     // Demographic analysis
  medianAge      Float?
  medianIncome   Decimal?
  households     Int?
  commuteTime    Float?   // Average in minutes
  
  // Amenities & Quality of Life
  amenities      Json     // Amenities data
  schoolRating   Float?   // 1-10 scale
  walkScore      Int?     // 0-100
  bikeScore      Int?     // 0-100
  crimeIndex     Float?   // Safety metric
  parkProximity  Float?   // Distance to nearest park in miles
  
  // Location Data
  latitude       Float?
  longitude      Float?
  boundary       Json?    // GeoJSON polygon for area boundary
  
  // Investment Analysis
  roiAnalysis    Json?    // ROI calculation data
  rentYield      Float?
  appreciationRate Float?
  investmentGrade String? // A, B, C, D rating
  
  // AI-Generated Insights
  aiProfile      String?  // AI-generated neighborhood profile
  aiInsights     String[] // Key insights from AI analysis
  
  // Data Quality & Freshness
  dataSource     String[] // Sources of data
  lastUpdated    DateTime @default(now())
  dataQuality    Float?   // 0-1 confidence score
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String?
  creator        User?    @relation(fields: [createdBy], references: [id])
  alerts         PropertyAlert[]
  
  @@unique([areaCode, organizationId])
  @@map("neighborhood_insights")
}

model PropertyAlert {
  id             String   @id @default(cuid())
  name           String
  description    String?
  
  // Alert Configuration
  alertType      AlertType
  criteria       Json     // Alert criteria and thresholds
  isActive       Boolean  @default(true)
  
  // Geographical Scope
  areaCodes      String[] // Area codes to monitor
  radius         Float?   // Radius in miles for location-based alerts
  latitude       Float?
  longitude      Float?
  
  // Notification Settings
  emailEnabled   Boolean  @default(true)
  smsEnabled     Boolean  @default(false)
  frequency      AlertFrequency @default(DAILY)
  
  // Alert History
  lastTriggered  DateTime?
  triggerCount   Int      @default(0)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  insights       NeighborhoodInsight[]
  triggers       AlertTrigger[]
  
  @@map("property_alerts")
}

model AlertTrigger {
  id             String   @id @default(cuid())
  alertId        String
  alert          PropertyAlert @relation(fields: [alertId], references: [id])
  
  // Trigger Details
  triggeredBy    Json     // Data that triggered the alert
  message        String   // Alert message
  severity       AlertSeverity @default(MEDIUM)
  
  // Notification Status
  emailSent      Boolean  @default(false)
  smsSent        Boolean  @default(false)
  acknowledged   Boolean  @default(false)
  acknowledgedAt DateTime?
  acknowledgedBy String?
  
  triggeredAt    DateTime @default(now())
  
  @@map("alert_triggers")
}

model MarketReport {
  id             String   @id @default(cuid())
  title          String
  description    String?
  reportType     ReportType
  
  // Report Configuration
  areaCodes      String[] // Areas covered
  dateRange      Json     // Start and end dates
  filters        Json     // Applied filters
  
  // Report Content
  summary        String?  // Executive summary
  insights       Json     // Key insights and findings
  charts         Json     // Chart configurations and data
  tables         Json     // Table data
  
  // File Generation
  pdfUrl         String?  // Generated PDF URL
  csvUrl         String?  // Raw data CSV URL
  
  // Sharing & Access
  isPublic       Boolean  @default(false)
  shareToken     String?  @unique // For public sharing
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("market_reports")
}

model UserPreference {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  
  // Dashboard Preferences
  defaultAreaCodes String[] // Default areas to show
  dashboardLayout Json     // Module positions and sizes
  
  // Display Preferences
  theme          String   @default("dark") // dark/light
  chartType      String   @default("line") // Default chart type
  mapStyle       String   @default("dark") // Map tile style
  
  // Notification Preferences
  emailDigest    Boolean  @default(true)
  smsAlerts      Boolean  @default(false)
  digestFrequency String  @default("weekly")
  
  // Data Preferences
  priceFormat    String   @default("USD") // Currency format
  areaUnit       String   @default("sqft") // sqft/sqm
  dateFormat     String   @default("MM/DD/YYYY")
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("user_preferences")
}

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

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // REID relations
  neighborhoodInsights NeighborhoodInsight[]
  propertyAlerts       PropertyAlert[]
  marketReports        MarketReport[]
  preferences          UserPreference?
}

model Organization {
  // ... existing fields
  
  // REID relations
  neighborhoodInsights NeighborhoodInsight[]
  propertyAlerts       PropertyAlert[]
  marketReports        MarketReport[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-reid-dashboard
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create REID Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/reid/{dashboard,heatmap,demographics,schools,trends,roi,ai-profiles,alerts,export}
```

#### 2.2 Copy and Adapt Components
Create `components/features/reid/` directory:

```bash
mkdir -p components/features/reid/{
  dashboard,
  maps,
  charts,
  analytics,
  alerts,
  reports,
  shared
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/reid/{insights,alerts,reports,preferences}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create REID Module
Following platform module patterns:

```typescript
// lib/modules/reid/insights/index.ts
export const NeighborhoodInsightSchema = z.object({
  areaCode: z.string().min(1),
  areaName: z.string().min(1),
  areaType: z.nativeEnum(AreaType),
  marketData: z.any(),
  demographics: z.any(),
  amenities: z.any(),
  organizationId: z.string().uuid(),
});

export async function createNeighborhoodInsight(input: NeighborhoodInsightInput) {
  const session = await requireAuth();
  
  if (!canAccessREID(session.user)) {
    throw new Error('Unauthorized: REID access required');
  }
  
  if (!canAccessFeature(session.user, 'reid')) {
    throw new Error('Upgrade required: Real Estate Intelligence features not available');
  }

  const validated = NeighborhoodInsightSchema.parse(input);

  return await prisma.neighborhoodInsight.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    }
  });
}

export async function getNeighborhoodInsights(filters?: InsightFilters) {
  const session = await requireAuth();

  return await prisma.neighborhoodInsight.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters?.areaCodes && { 
        areaCode: { in: filters.areaCodes } 
      }),
      ...(filters?.areaType && { areaType: filters.areaType }),
      ...(filters?.minPrice && {
        medianPrice: { gte: filters.minPrice }
      }),
      ...(filters?.maxPrice && {
        medianPrice: { lte: filters.maxPrice }
      }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: [
      { areaName: 'asc' }
    ]
  });
}

export async function generateAIProfile(areaCode: string) {
  const session = await requireAuth();
  
  const insight = await prisma.neighborhoodInsight.findFirst({
    where: {
      areaCode,
      organizationId: session.user.organizationId
    }
  });

  if (!insight) {
    throw new Error('Neighborhood insight not found');
  }

  // Generate AI profile using market data, demographics, and amenities
  const aiProfile = await generateNeighborhoodProfile({
    marketData: insight.marketData,
    demographics: insight.demographics,
    amenities: insight.amenities,
    areaName: insight.areaName
  });

  // Update insight with AI profile
  return await prisma.neighborhoodInsight.update({
    where: { id: insight.id },
    data: {
      aiProfile: aiProfile.profile,
      aiInsights: aiProfile.insights
    }
  });
}

async function generateNeighborhoodProfile(data: any) {
  // Implement AI profile generation
  // This would integrate with OpenAI/Groq for intelligent analysis
  return {
    profile: `AI-generated neighborhood profile for ${data.areaName}`,
    insights: [
      'Strong market fundamentals',
      'Growing demographics',
      'Excellent amenities'
    ]
  };
}
```

#### 3.2 Create Alert System Module
```typescript
// lib/modules/reid/alerts/index.ts
export const PropertyAlertSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  alertType: z.nativeEnum(AlertType),
  criteria: z.any(),
  areaCodes: z.array(z.string()),
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  frequency: z.nativeEnum(AlertFrequency),
  organizationId: z.string().uuid(),
});

export async function createPropertyAlert(input: PropertyAlertInput) {
  const session = await requireAuth();
  
  if (!canAccessREID(session.user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const validated = PropertyAlertSchema.parse(input);

  return await prisma.propertyAlert.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    }
  });
}

export async function checkAlerts() {
  // This would run on a scheduled basis to check alert conditions
  const activeAlerts = await prisma.propertyAlert.findMany({
    where: { isActive: true },
    include: { insights: true }
  });

  for (const alert of activeAlerts) {
    const shouldTrigger = await evaluateAlertCriteria(alert);
    
    if (shouldTrigger) {
      await triggerAlert(alert);
    }
  }
}

async function evaluateAlertCriteria(alert: any): Promise<boolean> {
  // Implement alert criteria evaluation logic
  // Check current market data against alert thresholds
  return false; // Placeholder
}

async function triggerAlert(alert: any) {
  const trigger = await prisma.alertTrigger.create({
    data: {
      alertId: alert.id,
      triggeredBy: {}, // Current data that triggered alert
      message: `Alert "${alert.name}" has been triggered`,
      severity: 'MEDIUM'
    }
  });

  // Send notifications if enabled
  if (alert.emailEnabled) {
    await sendAlertEmail(alert, trigger);
  }

  if (alert.smsEnabled) {
    await sendAlertSMS(alert, trigger);
  }
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add REID Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessREID(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canCreateReports(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canManageAlerts(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canAccessAIFeatures(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'reid-basic'], // Basic market data
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'reid-full'], // Full analytics + AI
};

export function getREIDLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { insights: 0, alerts: 0, reports: 0, aiProfiles: 0 },
    STARTER: { insights: 0, alerts: 0, reports: 0, aiProfiles: 0 },
    GROWTH: { insights: 50, alerts: 10, reports: 5, aiProfiles: 0 }, // Per month
    ELITE: { insights: -1, alerts: -1, reports: -1, aiProfiles: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Recreation (Dark Professional Theme)

#### 5.1 Add REID Theme CSS
Update `app/globals.css`:

```css
/* REID Dashboard Theme */
:root {
  /* Dark theme colors */
  --reid-background: #0f172a;
  --reid-surface: #1e293b;
  --reid-surface-light: #334155;
  
  /* Neon accents */
  --reid-cyan: #06b6d4;
  --reid-purple: #8b5cf6;
  --reid-cyan-glow: rgba(6, 182, 212, 0.4);
  --reid-purple-glow: rgba(139, 92, 246, 0.4);
  
  /* Data visualization colors */
  --reid-success: #10b981;
  --reid-warning: #f59e0b;
  --reid-error: #ef4444;
  --reid-info: #3b82f6;
}

/* Dark theme base */
.reid-theme {
  background: var(--reid-background);
  color: #e2e8f0;
}

/* Neon accent cards */
.reid-card {
  background: var(--reid-surface);
  border: 1px solid #334155;
  transition: all 0.3s ease;
}

.reid-card:hover {
  border-color: var(--reid-cyan);
  box-shadow: 0 0 20px var(--reid-cyan-glow);
}

/* Data density layout */
.reid-data-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Chart styling */
.reid-chart {
  background: var(--reid-surface);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Map styling */
.reid-map {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #334155;
}

/* Metric card styling */
.reid-metric {
  background: linear-gradient(135deg, var(--reid-surface), var(--reid-surface-light));
  border: 1px solid transparent;
  background-clip: padding-box;
}

.reid-metric-value {
  font-family: 'Fira Code', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: var(--reid-cyan);
}

/* Alert styling */
.reid-alert-high {
  border-left: 4px solid var(--reid-error);
  background: rgba(239, 68, 68, 0.1);
}

.reid-alert-medium {
  border-left: 4px solid var(--reid-warning);
  background: rgba(245, 158, 11, 0.1);
}

.reid-alert-low {
  border-left: 4px solid var(--reid-info);
  background: rgba(59, 130, 246, 0.1);
}
```

#### 5.2 Create Main REID Dashboard
Create `app/(platform)/reid/dashboard/page.tsx`:
```tsx
import { Suspense } from 'react'
import { REIDHeader } from '@/components/features/reid/dashboard/header'
import { MarketHeatmap } from '@/components/features/reid/maps/market-heatmap'
import { DemographicsPanel } from '@/components/features/reid/analytics/demographics-panel'
import { SchoolsAmenities } from '@/components/features/reid/analytics/schools-amenities'
import { TrendsChart } from '@/components/features/reid/charts/trends-chart'
import { ROISimulator } from '@/components/features/reid/analytics/roi-simulator'
import { AIProfiles } from '@/components/features/reid/analytics/ai-profiles'
import { AlertsPanel } from '@/components/features/reid/alerts/alerts-panel'
import { ExportTools } from '@/components/features/reid/reports/export-tools'
import { Skeleton } from '@/components/ui/skeleton'

export default function REIDDashboard() {
  return (
    <div className="min-h-screen reid-theme">
      {/* Header */}
      <REIDHeader />
      
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Eight Core Modules Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Maps & Demographics */}
          <div className="xl:col-span-2 space-y-6">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <MarketHeatmap />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-64" />}>
              <DemographicsPanel />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-64" />}>
              <TrendsChart />
            </Suspense>
          </div>
          
          {/* Middle Column - Schools & ROI */}
          <div className="xl:col-span-1 space-y-6">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <SchoolsAmenities />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-64" />}>
              <ROISimulator />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-48" />}>
              <ExportTools />
            </Suspense>
          </div>
          
          {/* Right Column - AI & Alerts */}
          <div className="xl:col-span-1 space-y-6">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <AIProfiles />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-64" />}>
              <AlertsPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.3 Create Market Heatmap Component
Create `components/features/reid/maps/MarketHeatmap.tsx`:
```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'

// Dynamically import Leaflet to avoid SSR issues
const Map = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-slate-800 rounded-lg animate-pulse" />
  }
)

export function MarketHeatmap() {
  const [mapView, setMapView] = useState<'price' | 'inventory' | 'trend'>('price')
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

  const { data: insights, isLoading } = useQuery({
    queryKey: ['neighborhood-insights'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/insights')
      return response.json()
    }
  })

  const marketData = insights?.insights?.map((insight: any) => ({
    areaCode: insight.areaCode,
    areaName: insight.areaName,
    lat: insight.latitude,
    lng: insight.longitude,
    medianPrice: insight.medianPrice,
    priceChange: insight.priceChange,
    inventory: insight.marketData?.inventory,
    daysOnMarket: insight.daysOnMarket
  })) || []

  return (
    <Card className="reid-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Market Heatmap
          </CardTitle>
          
          <Select value={mapView} onValueChange={(value: any) => setMapView(value)}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="price">Median Price</SelectItem>
              <SelectItem value="inventory">Inventory Levels</SelectItem>
              <SelectItem value="trend">Price Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-96 reid-map">
          {isLoading ? (
            <div className="h-full bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
              <span className="text-slate-400">Loading map data...</span>
            </div>
          ) : (
            <Map
              data={marketData}
              view={mapView}
              onAreaSelect={setSelectedArea}
            />
          )}
        </div>
        
        {selectedArea && (
          <div className="p-4 border-t border-slate-600">
            <SelectedAreaInfo areaCode={selectedArea} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SelectedAreaInfo({ areaCode }: { areaCode: string }) {
  const { data: insight } = useQuery({
    queryKey: ['neighborhood-insight', areaCode],
    queryFn: async () => {
      const response = await fetch(`/api/v1/reid/insights/${areaCode}`)
      return response.json()
    }
  })

  if (!insight) return null

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">{insight.areaName}</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="reid-metric-value">{insight.medianPrice ? `$${(insight.medianPrice / 1000).toFixed(0)}K` : 'N/A'}</div>
          <div className="text-sm text-slate-400">Median Price</div>
        </div>
        
        <div className="text-center">
          <div className="reid-metric-value">{insight.daysOnMarket || 'N/A'}</div>
          <div className="text-sm text-slate-400">Days on Market</div>
        </div>
        
        <div className="text-center">
          <div className={`reid-metric-value flex items-center justify-center gap-1 ${
            insight.priceChange > 0 ? 'text-green-400' : insight.priceChange < 0 ? 'text-red-400' : 'text-cyan-400'
          }`}>
            {insight.priceChange > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : insight.priceChange < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            {insight.priceChange ? `${insight.priceChange.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm text-slate-400">Price Change</div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.4 Create ROI Simulator Component
Create `components/features/reid/analytics/ROISimulator.tsx`:
```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Calculator, DollarSign, TrendingUp } from 'lucide-react'

export function ROISimulator() {
  const [inputs, setInputs] = useState({
    purchasePrice: 500000,
    downPayment: 20,
    interestRate: 6.5,
    monthlyRent: 3500,
    expenses: 1500,
    appreciation: 3.5,
    holdingPeriod: 10
  })

  const [results, setResults] = useState({
    monthlyReturn: 0,
    annualReturn: 0,
    totalReturn: 0,
    cashOnCash: 0,
    capRate: 0
  })

  useEffect(() => {
    calculateROI()
  }, [inputs])

  const calculateROI = () => {
    const downPaymentAmount = inputs.purchasePrice * (inputs.downPayment / 100)
    const loanAmount = inputs.purchasePrice - downPaymentAmount
    const monthlyPayment = calculateMortgagePayment(loanAmount, inputs.interestRate, 30)
    
    const monthlyReturn = inputs.monthlyRent - monthlyPayment - inputs.expenses
    const annualReturn = monthlyReturn * 12
    const cashOnCash = (annualReturn / downPaymentAmount) * 100
    const capRate = ((inputs.monthlyRent * 12 - inputs.expenses * 12) / inputs.purchasePrice) * 100
    
    // Calculate total return over holding period
    const futureValue = inputs.purchasePrice * Math.pow(1 + inputs.appreciation / 100, inputs.holdingPeriod)
    const totalEquity = futureValue - loanAmount + (annualReturn * inputs.holdingPeriod)
    const totalReturn = ((totalEquity - downPaymentAmount) / downPaymentAmount) * 100

    setResults({
      monthlyReturn,
      annualReturn,
      totalReturn,
      cashOnCash,
      capRate
    })
  }

  const calculateMortgagePayment = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / 100 / 12
    const numPayments = years * 12
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  const updateInput = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="reid-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          ROI Simulator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Purchase Price */}
        <div className="space-y-2">
          <Label className="text-slate-300">Purchase Price</Label>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <Input
              type="number"
              value={inputs.purchasePrice}
              onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <Label className="text-slate-300">Down Payment: {inputs.downPayment}%</Label>
          <Slider
            value={[inputs.downPayment]}
            onValueChange={(values) => updateInput('downPayment', values[0])}
            max={50}
            min={5}
            step={5}
            className="w-full"
          />
        </div>

        {/* Monthly Rent */}
        <div className="space-y-2">
          <Label className="text-slate-300">Monthly Rent</Label>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <Input
              type="number"
              value={inputs.monthlyRent}
              onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label className="text-slate-300">Interest Rate: {inputs.interestRate}%</Label>
          <Slider
            value={[inputs.interestRate]}
            onValueChange={(values) => updateInput('interestRate', values[0])}
            max={10}
            min={3}
            step={0.25}
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="pt-4 border-t border-slate-600 space-y-3">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Results
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="reid-metric">
              <div className="p-3 text-center">
                <div className="text-lg font-bold text-green-400">
                  ${results.monthlyReturn.toFixed(0)}
                </div>
                <div className="text-xs text-slate-400">Monthly Cash Flow</div>
              </div>
            </div>
            
            <div className="reid-metric">
              <div className="p-3 text-center">
                <div className="text-lg font-bold text-cyan-400">
                  {results.cashOnCash.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400">Cash-on-Cash</div>
              </div>
            </div>
            
            <div className="reid-metric">
              <div className="p-3 text-center">
                <div className="text-lg font-bold text-purple-400">
                  {results.capRate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400">Cap Rate</div>
              </div>
            </div>
            
            <div className="reid-metric">
              <div className="p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {results.totalReturn.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400">{inputs.holdingPeriod}yr Return</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Insights API
Create `app/api/v1/reid/insights/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createNeighborhoodInsight, getNeighborhoodInsights } from '@/lib/modules/reid/insights'
import { canAccessREID, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessREID(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      areaCodes: searchParams.get('areaCodes')?.split(','),
      areaType: searchParams.get('areaType'),
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    }

    const insights = await getNeighborhoodInsights(filters)
    return NextResponse.json({ insights })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessREID(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'reid')) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const data = await req.json()
    const insight = await createNeighborhoodInsight({
      ...data,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ insight }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create insight' }, { status: 500 })
  }
}
```

#### 6.2 Create AI Profile Generation API
Create `app/api/v1/reid/insights/[areaCode]/ai-profile/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateAIProfile } from '@/lib/modules/reid/insights'

export async function POST(
  req: NextRequest,
  { params }: { params: { areaCode: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessREID(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessAIFeatures(session.user)) {
    return NextResponse.json({ 
      error: 'AI features require Elite subscription',
      upgradeUrl: '/settings/billing'
    }, { status: 402 })
  }

  try {
    const profile = await generateAIProfile(params.areaCode)
    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to generate AI profile',
      details: error.message 
    }, { status: 500 })
  }
}
```

### Phase 7: Navigation Integration

#### 7.1 Update Platform Sidebar
Update `components/shared/layouts/sidebar.tsx`:
```typescript
const navigationItems = [
  // ... existing items
  {
    name: 'REID Dashboard',
    href: '/reid/dashboard',
    icon: Building,
    children: [
      { name: 'Dashboard', href: '/reid/dashboard' },
      { name: 'Market Heatmap', href: '/reid/heatmap' },
      { name: 'Demographics', href: '/reid/demographics' },
      { name: 'Schools & Amenities', href: '/reid/schools' },
      { name: 'Trends Analysis', href: '/reid/trends' },
      { name: 'ROI Simulator', href: '/reid/roi' },
      { name: 'AI Profiles', href: '/reid/ai-profiles' },
      { name: 'Alerts', href: '/reid/alerts' },
      { name: 'Export Tools', href: '/reid/export' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create REID Tests
Create `__tests__/modules/reid/insights.test.ts`:
```typescript
import { createNeighborhoodInsight } from '@/lib/modules/reid/insights'
import { canAccessREID } from '@/lib/auth/rbac'

describe('REID Module', () => {
  it('should create neighborhood insight for current org only', async () => {
    const insight = await createNeighborhoodInsight({
      areaCode: '94110',
      areaName: 'Mission District',
      areaType: 'ZIP',
      marketData: { medianPrice: 1200000 },
      demographics: { medianIncome: 75000 },
      amenities: { schoolRating: 8.5 },
      organizationId: 'org-123'
    })

    expect(insight.organizationId).toBe('org-123')
  })
})
```

### Phase 9: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all REID tables
- [ ] RBAC permissions working for REID access
- [ ] Subscription tier limits enforced
- [ ] Dark theme with neon accents rendering correctly
- [ ] Market heatmap with Leaflet integration functional
- [ ] ROI simulator calculations accurate
- [ ] Demographics panel displaying correctly
- [ ] Schools & amenities data visualization working
- [ ] Trends charts with Recharts library operational
- [ ] AI profile generation (when Elite tier)
- [ ] Property alerts system functional
- [ ] Export tools generating reports
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements from Documentation:**
- **Dark Professional Theme**: Primary background (#0f172a), surface (#1e293b)
- **Neon Accents**: Cyan (#06b6d4) and purple (#8b5cf6) highlights
- **Data Density**: Grid layouts emphasizing comprehensive information display
- **Typography**: Inter for UI, Fira Code for data/metrics
- **Eight Core Modules**: Heatmap, Demographics, Schools, Trends, ROI, AI, Alerts, Export
- **Interactive Maps**: Leaflet with dark CartoDB tiles
- **Professional Aesthetics**: Clean, information-dense layouts suitable for real estate professionals

**Component Styling Patterns:**
```css
/* REID card styling */
.reid-card {
  background: #1e293b;
  border: 1px solid #334155;
  transition: all 0.3s ease;
}

.reid-card:hover {
  border-color: #06b6d4;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
}

/* Metric display */
.reid-metric-value {
  font-family: 'Fira Code', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: #06b6d4;
}

/* Alert severity styling */
.reid-alert-high {
  border-left: 4px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
```

This integration preserves the exact dark, professional design of the REID Dashboard while seamlessly integrating it into the Strive platform's multi-tenant, RBAC architecture with comprehensive real estate intelligence capabilities.