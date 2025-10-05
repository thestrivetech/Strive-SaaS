# REID Intelligence Dashboard Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the REID (Real Estate Intelligence Dashboard) into the Strive SaaS Platform, maintaining pixel-perfect UI design while adapting it to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- Admin access to platform repository
- Understanding of multi-tenant RLS and RBAC patterns

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add REID Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// REID Intelligence Dashboard Tables
model NeighborhoodInsight {
  id             String   @id @default(cuid())
  areaCode       String   // ZIP code or school district
  areaType       String   // 'zip' or 'school_district'
  
  // Market Metrics (JSON structure)
  marketMetrics  Json     // { medianPrice, daysOnMarket, inventory, priceChange }
  
  // Demographics (JSON structure)  
  demographics   Json     // { medianAge, medianIncome, households, commuteTime }
  
  // Amenities & Quality of Life (JSON structure)
  amenities      Json     // { schoolRating, walkScore, bikeScore, crimeIndex, parkProximity }
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  alerts         MarketAlert[]
  
  @@unique([areaCode, organizationId])
  @@map("neighborhood_insights")
}

model MarketAlert {
  id             String   @id @default(cuid())
  insightId      String
  insight        NeighborhoodInsight @relation(fields: [insightId], references: [id])
  
  alertType      AlertType
  threshold      Json     // Alert condition (e.g., { priceChange: ">10%" })
  isActive       Boolean  @default(true)
  lastTriggered  DateTime?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("market_alerts")
}

model AINeighborhoodReport {
  id             String   @id @default(cuid())
  areaCode       String
  reportContent  String   // AI-generated neighborhood profile
  reportData     Json     // Structured data used in report
  pdfUrl         String?  // Supabase Storage URL
  
  createdAt      DateTime @default(now())
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  requestedBy    String
  requester      User     @relation(fields: [requestedBy], references: [id])
  
  @@map("ai_neighborhood_reports")
}

model ROIAnalysis {
  id             String   @id @default(cuid())
  propertyAddress String
  areaCode       String
  
  // Investment Parameters
  purchasePrice  Decimal
  downPayment    Decimal
  loanAmount     Decimal
  interestRate   Decimal
  loanTerm       Int      // years
  
  // Income & Expenses
  monthlyRent    Decimal
  monthlyExpenses Json    // { insurance, taxes, maintenance, management }
  
  // Calculated Results
  capRate        Decimal  // Cap rate percentage
  cashOnCash     Decimal  // Cash-on-cash return
  monthlyFlow    Decimal  // Monthly cash flow
  yearOneROI     Decimal  // First year ROI
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("roi_analyses")
}

enum AlertType {
  PRICE_CHANGE
  INVENTORY_DROP  
  MARKET_TREND
  DEMOGRAPHIC_SHIFT
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // REID relations
  neighborhoodInsights   NeighborhoodInsight[]
  marketAlerts          MarketAlert[]
  neighborhoodReports   AINeighborhoodReport[]
  roiAnalyses           ROIAnalysis[]
}

model Organization {
  // ... existing fields
  
  // REID relations  
  neighborhoodInsights   NeighborhoodInsight[]
  marketAlerts          MarketAlert[]
  neighborhoodReports   AINeighborhoodReport[]
  roiAnalyses           ROIAnalysis[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-reid-intelligence
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create REID Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/intelligence/{dashboard,heatmap,demographics,schools,trends,roi,reports,alerts,export}
```

#### 2.2 Copy and Adapt Components
Create `components/features/intelligence/` directory:

```bash
mkdir -p components/features/intelligence/{heatmap,demographics,amenities,trends,roi,reports,alerts,export,shared}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/intelligence/{insights,reports,roi,alerts}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Intelligence Module
Following platform module patterns:

```typescript
// lib/modules/intelligence/insights/index.ts
export const NeighborhoodInsightSchema = z.object({
  areaCode: z.string().min(1).max(20),
  areaType: z.enum(['zip', 'school_district']),
  marketMetrics: z.object({
    medianPrice: z.number().positive(),
    daysOnMarket: z.number().int().positive(),
    inventory: z.number().int().nonnegative(),
    priceChange: z.number()
  }),
  demographics: z.object({
    medianAge: z.number().positive(),
    medianIncome: z.number().positive(),
    households: z.number().int().positive(),
    commuteTime: z.number().positive()
  }),
  amenities: z.object({
    schoolRating: z.number().min(1).max(10),
    walkScore: z.number().min(0).max(100),
    bikeScore: z.number().min(0).max(100),
    crimeIndex: z.number().min(0).max(100),
    parkProximity: z.number().positive()
  }),
  organizationId: z.string().uuid(),
});

export async function createNeighborhoodInsight(input: NeighborhoodInsightInput) {
  const session = await requireAuth();
  
  if (!canAccessIntelligence(session.user)) {
    throw new Error('Unauthorized: Intelligence access required');
  }
  
  if (!canAccessFeature(session.user, 'intelligence')) {
    throw new Error('Upgrade required: Intelligence features not available');
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
      ...(filters?.areaCode && { areaCode: filters.areaCode }),
      ...(filters?.areaType && { areaType: filters.areaType }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      alerts: {
        where: { isActive: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}
```

#### 3.2 Create ROI Analysis Module
```typescript
// lib/modules/intelligence/roi/index.ts
export const ROIAnalysisSchema = z.object({
  propertyAddress: z.string().min(1),
  areaCode: z.string().min(1),
  purchasePrice: z.number().positive(),
  downPayment: z.number().positive(),
  interestRate: z.number().positive(),
  loanTerm: z.number().int().positive(),
  monthlyRent: z.number().positive(),
  monthlyExpenses: z.object({
    insurance: z.number().nonnegative(),
    taxes: z.number().nonnegative(),
    maintenance: z.number().nonnegative(),
    management: z.number().nonnegative()
  }),
  organizationId: z.string().uuid(),
});

export async function calculateROI(input: ROIAnalysisInput) {
  const session = await requireAuth();
  
  if (!canAccessIntelligence(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = ROIAnalysisSchema.parse(input);
  
  // Calculate investment metrics
  const loanAmount = validated.purchasePrice - validated.downPayment;
  const monthlyExpensesTotal = Object.values(validated.monthlyExpenses).reduce((sum, val) => sum + val, 0);
  const monthlyIncome = validated.monthlyRent;
  const monthlyFlow = monthlyIncome - monthlyExpensesTotal;
  const yearlyFlow = monthlyFlow * 12;
  const capRate = (yearlyFlow / validated.purchasePrice) * 100;
  const cashOnCash = (yearlyFlow / validated.downPayment) * 100;

  return await prisma.rOIAnalysis.create({
    data: {
      ...validated,
      loanAmount,
      capRate,
      cashOnCash,
      monthlyFlow,
      yearOneROI: cashOnCash, // Simplified for first year
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    }
  });
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Intelligence Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessIntelligence(user: User): boolean {
  // Must be Employee with Member+ org role
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  
  return isEmployee && hasOrgAccess;
}

export function canGenerateAIReports(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canExportData(user: User): boolean {
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
  return canAccessIntelligence(user) && hasOrgAccess;
}
```

#### 4.2 Update Subscription Tier Features
```typescript
// lib/auth/rbac.ts
const TIER_FEATURES = {
  FREE: ['dashboard', 'profile'],
  STARTER: ['dashboard', 'profile', 'crm', 'projects'],
  GROWTH: ['dashboard', 'profile', 'crm', 'projects', 'intelligence-basic'], // Basic market insights
  ELITE: ['dashboard', 'profile', 'crm', 'projects', 'intelligence-full'], // Full intelligence suite
};

export function getIntelligenceLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { insights: 0, reports: 0, alerts: 0 },
    STARTER: { insights: 0, reports: 0, alerts: 0 },
    GROWTH: { insights: 25, reports: 5, alerts: 10 }, // Per month
    ELITE: { insights: -1, reports: -1, alerts: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Phase 5: UI Component Migration

#### 5.1 Create Main Dashboard Layout
Create `app/(platform)/intelligence/dashboard/page.tsx`:
```tsx
import { Suspense } from 'react'
import { IntelligenceHeader } from '@/components/features/intelligence/header'
import { HeatmapModule } from '@/components/features/intelligence/heatmap'
import { DemographicsModule } from '@/components/features/intelligence/demographics'
import { Skeleton } from '@/components/ui/skeleton'

export default function IntelligenceDashboard() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header with glassmorphic design */}
      <IntelligenceHeader />
      
      {/* Main dashboard grid */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="xl:col-span-1">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <AreaSelector />
            </Suspense>
          </div>
          
          {/* Main Content - Visualizations */}
          <div className="xl:col-span-2 space-y-6">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <HeatmapModule />
            </Suspense>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <DemographicsModule />
              </Suspense>
              
              <Suspense fallback={<Skeleton className="h-64" />}>
                <AmenitiesModule />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.2 Create Heatmap Component (Maintaining Exact Design)
Create `components/features/intelligence/heatmap/HeatmapModule.tsx`:
```tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Map, Layers, TrendingUp } from 'lucide-react'

// Maintain exact REID color scheme
const HEATMAP_COLORS = {
  low: '#1e293b',    // slate-800
  medium: '#0891b2',  // cyan-600  
  high: '#06b6d4',    // cyan-500
  highest: '#22d3ee'  // cyan-400
}

export function HeatmapModule() {
  const mapRef = useRef(null)
  
  return (
    <Card className="backdrop-blur-lg bg-slate-900/90 border-cyan-500/20 shadow-lg shadow-cyan-500/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cyan-100">
            <Map className="w-5 h-5 text-cyan-400" />
            Market Heatmap
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Layers className="w-4 h-4 mr-2" />
              Layers
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Metrics
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-96 w-full overflow-hidden rounded-b-lg">
          <MapContainer
            center={[37.7749, -122.4194]} // San Francisco
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* Heatmap overlay would go here */}
            <HeatmapLayer />
          </MapContainer>
          
          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="backdrop-blur-lg bg-slate-900/80 border border-cyan-500/30 rounded-lg p-3">
              <div className="text-xs text-cyan-100 font-medium mb-2">
                Median Home Price
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: HEATMAP_COLORS.low }}
                  />
                  <span className="text-slate-300">$500K</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: HEATMAP_COLORS.medium }}
                  />
                  <span className="text-slate-300">$1M</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: HEATMAP_COLORS.high }}
                  />
                  <span className="text-slate-300">$1.5M</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: HEATMAP_COLORS.highest }}
                  />
                  <span className="text-slate-300">$2M+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HeatmapLayer() {
  const map = useMap()
  
  useEffect(() => {
    // Add custom heatmap data visualization
    // This would integrate with actual neighborhood insight data
    
    return () => {
      // Cleanup
    }
  }, [map])
  
  return null
}
```

#### 5.3 Create Demographics Module
Create `components/features/intelligence/demographics/DemographicsModule.tsx`:
```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, DollarSign, Clock, Home } from 'lucide-react'
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell 
} from 'recharts'

// Maintain exact REID design colors
const COLORS = ['#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444']

const demographicData = [
  { name: 'Age 25-34', value: 28, fill: '#06b6d4' },
  { name: 'Age 35-44', value: 24, fill: '#8b5cf6' },
  { name: 'Age 45-54', value: 22, fill: '#22c55e' },
  { name: 'Age 55-64', value: 16, fill: '#f59e0b' },
  { name: 'Age 65+', value: 10, fill: '#ef4444' },
]

export function DemographicsModule() {
  return (
    <Card className="backdrop-blur-lg bg-slate-900/90 border-cyan-500/20 shadow-lg shadow-cyan-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-100">
          <Users className="w-5 h-5 text-cyan-400" />
          Demographics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">Median Income</span>
            </div>
            <div className="text-2xl font-bold text-white">$95,400</div>
            <Progress value={65} className="h-1 bg-slate-800" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">Households</span>
            </div>
            <div className="text-2xl font-bold text-white">12,847</div>
            <Progress value={42} className="h-1 bg-slate-800" />
          </div>
        </div>

        {/* Age Distribution Chart */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Age Distribution</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {demographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {demographicData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-slate-300">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Intelligence API
Create `app/api/v1/intelligence/insights/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createNeighborhoodInsight, getNeighborhoodInsights } from '@/lib/modules/intelligence/insights'
import { canAccessIntelligence, canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessIntelligence(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      areaCode: searchParams.get('areaCode'),
      areaType: searchParams.get('areaType'),
    }

    const insights = await getNeighborhoodInsights(filters)
    return NextResponse.json({ insights })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessIntelligence(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!canAccessFeature(session.user, 'intelligence-basic')) {
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

#### 6.2 Create ROI Analysis API
Create `app/api/v1/intelligence/roi/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { calculateROI } from '@/lib/modules/intelligence/roi'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessIntelligence(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const analysis = await calculateROI({
      ...data,
      organizationId: session.user.organizationId
    })

    return NextResponse.json({ analysis }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'ROI calculation failed' }, { status: 500 })
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
    name: 'Intelligence',
    href: '/intelligence/dashboard',
    icon: Brain,
    children: [
      { name: 'Dashboard', href: '/intelligence/dashboard' },
      { name: 'Heatmap', href: '/intelligence/heatmap' },
      { name: 'Demographics', href: '/intelligence/demographics' },
      { name: 'Schools & Amenities', href: '/intelligence/schools' },
      { name: 'Market Trends', href: '/intelligence/trends' },
      { name: 'ROI Simulator', href: '/intelligence/roi' },
      { name: 'AI Reports', href: '/intelligence/reports' },
      { name: 'Alerts', href: '/intelligence/alerts' },
    ]
  }
]
```

### Phase 8: Testing & Quality Assurance

#### 8.1 Create Intelligence Tests
Create `__tests__/modules/intelligence/insights.test.ts`:
```typescript
import { createNeighborhoodInsight } from '@/lib/modules/intelligence/insights'
import { calculateROI } from '@/lib/modules/intelligence/roi'

describe('Intelligence Module', () => {
  it('should create neighborhood insight for current org only', async () => {
    const insight = await createNeighborhoodInsight({
      areaCode: '94110',
      areaType: 'zip',
      marketMetrics: {
        medianPrice: 1200000,
        daysOnMarket: 25,
        inventory: 45,
        priceChange: 5.2
      },
      demographics: {
        medianAge: 34,
        medianIncome: 95400,
        households: 12847,
        commuteTime: 28
      },
      amenities: {
        schoolRating: 7,
        walkScore: 85,
        bikeScore: 72,
        crimeIndex: 35,
        parkProximity: 0.3
      },
      organizationId: 'org-123'
    })

    expect(insight.organizationId).toBe('org-123')
  })

  it('should calculate ROI metrics correctly', async () => {
    const analysis = await calculateROI({
      propertyAddress: '123 Main St',
      areaCode: '94110',
      purchasePrice: 1000000,
      downPayment: 200000,
      interestRate: 6.5,
      loanTerm: 30,
      monthlyRent: 4500,
      monthlyExpenses: {
        insurance: 200,
        taxes: 800,
        maintenance: 300,
        management: 225
      },
      organizationId: 'org-123'
    })

    expect(analysis.capRate).toBeGreaterThan(0)
    expect(analysis.cashOnCash).toBeGreaterThan(0)
    expect(analysis.organizationId).toBe('org-123')
  })
})
```

### Phase 9: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all intelligence tables
- [ ] RBAC permissions working for intelligence access
- [ ] Subscription tier limits enforced
- [ ] Heatmap visualization matches original design exactly
- [ ] Demographics charts render with proper colors and styling
- [ ] ROI calculator produces accurate results
- [ ] AI report generation functional (when integrated)
- [ ] Market alerts system working
- [ ] Export functionality operational
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements to Maintain:**
- **Dark Theme**: `bg-slate-950` base with `bg-slate-900/90` cards
- **Glassmorphic Cards**: `backdrop-blur-lg bg-slate-900/90 border-cyan-500/20 shadow-lg shadow-cyan-500/10`
- **Neon Accent Colors**: Cyan (#06b6d4), Purple (#8b5cf6), Green (#22c55e)
- **Map Styling**: CartoDB dark tiles with custom heatmap overlays
- **Typography**: Inter font family with cyan/purple text accents
- **Interactive Elements**: Hover effects with color transitions

**Component Styling Patterns:**
```css
/* Intelligence card styling */
.intelligence-card {
  @apply backdrop-blur-lg bg-slate-900/90 border-cyan-500/20 shadow-lg shadow-cyan-500/10;
}

/* Metric highlights */
.metric-value {
  @apply text-2xl font-bold text-white;
}

/* Chart colors */
.chart-primary { color: #06b6d4; }
.chart-secondary { color: #8b5cf6; }
.chart-accent { color: #22c55e; }
```

This integration maintains the exact visual design and functionality of REID while adapting it to the Strive platform's multi-tenant security model.