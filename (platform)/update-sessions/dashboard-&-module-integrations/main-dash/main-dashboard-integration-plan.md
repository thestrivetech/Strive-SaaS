# Main Dashboard Hub Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the stunning Main Dashboard Hub into the Strive SaaS Platform as the central entry point after user login/onboarding, preserving the exact "wow factor" design while adapting it to the platform's architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- Admin access to platform repository
- Understanding of multi-tenant RLS and RBAC patterns

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add Dashboard Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// Main Dashboard Hub Tables
model DashboardSettings {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  
  // Layout Configuration
  layout         Json     // Widget positions and sizes (react-grid-layout)
  theme          String   @default("dark") // dark, light
  accentColor    String   @default("cyan") // cyan, purple, green
  
  // Personalization
  favorites      String[] // Favorited modules/tools
  pinnedWidgets  String[] // Always visible widgets
  
  // Preferences
  greeting       Boolean  @default(true) // Show greeting
  weather        Boolean  @default(true) // Show weather widget
  notifications  Boolean  @default(true) // Show notification bell
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("dashboard_settings")
}

model KPIMetric {
  id             String   @id @default(cuid())
  metricType     MetricType
  label          String
  value          Decimal
  previousValue  Decimal?
  changePercent  Decimal?
  timeframe      String   // MTD, YTD, etc.
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  @@map("kpi_metrics")
}

model ActivityFeed {
  id             String   @id @default(cuid())
  type           ActivityType
  title          String
  description    String?
  metadata       Json?    // Additional data (user info, amounts, etc.)
  icon          String?   // Icon name for display
  
  createdAt      DateTime @default(now())
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  userId         String?  // User who triggered the activity
  user           User?    @relation(fields: [userId], references: [id])
  
  @@map("activity_feeds")
}

model DashboardWidget {
  id             String   @id @default(cuid())
  widgetType     WidgetType
  title          String
  configuration  Json     // Widget-specific config
  position       Json     // { x, y, w, h } for grid layout
  isEnabled      Boolean  @default(true)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String
  creator        User     @relation(fields: [createdBy], references: [id])
  
  @@map("dashboard_widgets")
}

model SmartSuggestion {
  id             String   @id @default(cuid())
  suggestionType SuggestionType
  title          String
  description    String
  actionUrl      String?  // Deep link to action
  priority       Int      @default(1) // 1-5, higher = more urgent
  isRead         Boolean  @default(false)
  isDismissed    Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  expiresAt      DateTime?
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Target user
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  
  @@map("smart_suggestions")
}

enum MetricType {
  REVENUE_MTD
  REVENUE_YTD
  NEW_LEADS_TODAY
  DEALS_CLOSED_MTD
  CONVERSION_RATE
  PIPELINE_VALUE
  AGENT_PRODUCTIVITY
  EXPENSES_SAVED
}

enum ActivityType {
  LEAD_CREATED
  DEAL_WON
  DEAL_LOST
  APPOINTMENT_SCHEDULED
  CONTRACT_SIGNED
  PAYMENT_RECEIVED
  USER_REGISTERED
  WORKFLOW_EXECUTED
  REPORT_GENERATED
}

enum WidgetType {
  KPI_RINGS
  LIVE_CHART
  WORLD_MAP
  ACTIVITY_FEED
  AI_INSIGHTS
  SMART_SUGGESTIONS
  WEATHER
  QUICK_ACTIONS
}

enum SuggestionType {
  FOLLOW_UP_LEAD
  SCHEDULE_APPOINTMENT
  UPDATE_PIPELINE
  REVIEW_CONTRACT
  CONTACT_CLIENT
  MARKET_OPPORTUNITY
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // Dashboard relations
  dashboardSettings   DashboardSettings?
  activities          ActivityFeed[]
  widgets             DashboardWidget[]
  suggestions         SmartSuggestion[]
}

model Organization {
  // ... existing fields
  
  // Dashboard relations
  kpiMetrics          KPIMetric[]
  activities          ActivityFeed[]
  widgets             DashboardWidget[]
  suggestions         SmartSuggestion[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-main-dashboard-hub
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create Main Dashboard Route
```bash
# From platform root
mkdir -p app/\(platform\)/dashboard/{widgets,settings}
```

#### 2.2 Copy and Adapt Components
Create main dashboard component structure:

```bash
mkdir -p components/features/dashboard/{
  hero,
  widgets,
  command-palette,
  sidebar,
  particles,
  mobile
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/dashboard/{kpis,activities,settings,suggestions,widgets}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Dashboard Module
Following platform module patterns:

```typescript
// lib/modules/dashboard/settings/index.ts
export const DashboardSettingsSchema = z.object({
  layout: z.any(), // react-grid-layout format
  theme: z.enum(['dark', 'light']),
  accentColor: z.enum(['cyan', 'purple', 'green', 'orange']),
  favorites: z.array(z.string()),
  pinnedWidgets: z.array(z.string()),
  greeting: z.boolean(),
  weather: z.boolean(),
  notifications: z.boolean(),
});

export async function updateDashboardSettings(
  userId: string, 
  input: Partial<DashboardSettingsInput>
) {
  const session = await requireAuth();
  
  if (session.user.id !== userId) {
    throw new Error('Unauthorized: Can only update own settings');
  }

  const validated = DashboardSettingsSchema.partial().parse(input);

  return await prisma.dashboardSettings.upsert({
    where: { userId },
    update: validated,
    create: {
      userId,
      ...validated,
    }
  });
}

export async function getDashboardSettings(userId: string) {
  const session = await requireAuth();
  
  if (session.user.id !== userId) {
    throw new Error('Unauthorized');
  }

  return await prisma.dashboardSettings.findUnique({
    where: { userId }
  });
}
```

#### 3.2 Create KPI Module
```typescript
// lib/modules/dashboard/kpis/index.ts
export async function getKPIMetrics() {
  const session = await requireAuth();

  const metrics = await prisma.kPIMetric.findMany({
    where: {
      organizationId: session.user.organizationId
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Calculate real-time metrics
  const [
    revenueMTD,
    leadsToday, 
    dealsClosedMTD,
    conversionRate
  ] = await Promise.all([
    calculateRevenueMTD(session.user.organizationId),
    calculateLeadsToday(session.user.organizationId),
    calculateDealsClosedMTD(session.user.organizationId),
    calculateConversionRate(session.user.organizationId)
  ]);

  return {
    revenueMTD,
    leadsToday,
    dealsClosedMTD,
    conversionRate,
    historical: metrics
  };
}

async function calculateRevenueMTD(organizationId: string): Promise<KPIData> {
  // Real calculation based on actual data
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  
  const revenue = await prisma.deal.aggregate({
    where: {
      organizationId,
      closedAt: {
        gte: startOfMonth
      },
      status: 'WON'
    },
    _sum: {
      value: true
    }
  });

  const previousMonthRevenue = await prisma.deal.aggregate({
    where: {
      organizationId,
      closedAt: {
        gte: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1),
        lt: startOfMonth
      },
      status: 'WON'
    },
    _sum: {
      value: true
    }
  });

  const current = revenue._sum.value || 0;
  const previous = previousMonthRevenue._sum.value || 0;
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return {
    label: 'Revenue MTD',
    value: current,
    previousValue: previous,
    changePercent: change,
    timeframe: 'MTD',
    type: 'currency'
  };
}
```

### Phase 4: Main Dashboard Layout Creation

#### 4.1 Create Root Dashboard Page
Create `app/(platform)/dashboard/page.tsx`:
```tsx
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { DashboardHero } from '@/components/features/dashboard/hero'
import { DashboardGrid } from '@/components/features/dashboard/widgets/dashboard-grid'
import { CommandPalette } from '@/components/features/dashboard/command-palette'
import { ParticleBackground } from '@/components/features/dashboard/particles'
import { MobileDashboard } from '@/components/features/dashboard/mobile'
import { Sidebar } from '@/components/features/dashboard/sidebar'
import { getDashboardSettings } from '@/lib/modules/dashboard/settings'
import { DashboardSkeleton } from '@/components/features/dashboard/skeleton'

export default async function MainDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Get user's dashboard settings
  const settings = await getDashboardSettings(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Collapsible Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Hero Section */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-slate-800/20" />}>
            <DashboardHero user={session.user} />
          </Suspense>
          
          {/* Dashboard Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardGrid settings={settings} />
            </Suspense>
          </div>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileDashboard user={session.user} />
      </div>
      
      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  )
}
```

#### 4.2 Create Hero Section Component
Create `components/features/dashboard/hero/DashboardHero.tsx`:
```tsx
'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Cloud, 
  Sun, 
  Bell, 
  Search,
  Mic,
  Zap,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface DashboardHeroProps {
  user: {
    id: string
    name: string
    email: string
  }
}

export function DashboardHero({ user }: DashboardHeroProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Dynamic greeting
  useEffect(() => {
    const hour = currentTime.getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [currentTime])

  // Fetch quick stats
  const { data: quickStats } = useQuery({
    queryKey: ['dashboard-quick-stats'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/quick-stats')
      return response.json()
    },
    refetchInterval: 30000 // 30 seconds
  })

  return (
    <div className="relative px-6 py-8">
      {/* Glassmorphic Header Card */}
      <Card className="backdrop-blur-lg bg-slate-900/80 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {/* Left: Greeting & Stats */}
            <div className="space-y-4">
              {/* Animated Greeting */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {greeting}, {user.name?.split(' ')[0]}! ✨
                </h1>
                <div className="flex items-center gap-4 text-slate-300">
                  <span className="text-lg">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  <span className="text-lg font-mono">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </motion.div>

              {/* Quick Stats Carousel */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center gap-6"
              >
                {quickStats && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Revenue MTD</div>
                        <div className="text-lg font-semibold text-white">
                          {formatCurrency(quickStats.revenueMTD)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">New Leads Today</div>
                        <div className="text-lg font-semibold text-white">
                          {formatNumber(quickStats.leadsToday)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Deals Closed</div>
                        <div className="text-lg font-semibold text-white">
                          {formatNumber(quickStats.dealsClosedMTD)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Right: Actions & Weather */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center gap-4"
            >
              {/* Weather Widget */}
              <WeatherWidget />
              
              {/* Command Bar */}
              <Button
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-6"
                onClick={() => {
                  // Open command palette
                  document.dispatchEvent(new KeyboardEvent('keydown', { 
                    key: 'k', 
                    metaKey: true 
                  }))
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Search ⌘K
              </Button>

              {/* Voice Command */}
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                size="icon"
              >
                <Mic className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <Button
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 relative"
                size="icon"
              >
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function WeatherWidget() {
  const { data: weather } = useQuery({
    queryKey: ['weather'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/weather')
      return response.json()
    },
    refetchInterval: 300000 // 5 minutes
  })

  if (!weather) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
      <Sun className="w-4 h-4 text-yellow-400" />
      <span className="text-white font-medium">{weather.temp}°</span>
      <span className="text-slate-400 text-sm">{weather.city}</span>
    </div>
  )
}
```

#### 4.3 Create Dashboard Grid with Widgets
Create `components/features/dashboard/widgets/DashboardGrid.tsx`:
```tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { KPIRingsWidget } from './KPIRingsWidget'
import { LiveChartsWidget } from './LiveChartsWidget'
import { WorldMapWidget } from './WorldMapWidget'
import { ActivityFeedWidget } from './ActivityFeedWidget'
import { AIInsightsWidget } from './AIInsightsWidget'
import { SmartSuggestionsWidget } from './SmartSuggestionsWidget'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const defaultLayouts = {
  lg: [
    { i: 'kpi-rings', x: 0, y: 0, w: 4, h: 2 },
    { i: 'live-charts', x: 4, y: 0, w: 8, h: 4 },
    { i: 'world-map', x: 0, y: 2, w: 4, h: 3 },
    { i: 'activity-feed', x: 8, y: 4, w: 4, h: 4 },
    { i: 'ai-insights', x: 0, y: 5, w: 8, h: 2 },
    { i: 'suggestions', x: 4, y: 2, w: 4, h: 2 },
  ]
}

interface DashboardGridProps {
  settings?: {
    layout?: any
    accentColor?: string
  }
}

export function DashboardGrid({ settings }: DashboardGridProps) {
  const [layouts, setLayouts] = useState(settings?.layout || defaultLayouts)

  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts)
    
    // Save to backend
    fetch('/api/v1/dashboard/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: layouts })
    })
  }

  return (
    <div className="relative">
      <ResponsiveGridLayout
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[24, 24]}
        containerPadding={[0, 0]}
        isDraggable={true}
        isResizable={true}
        className="dashboard-grid"
      >
        {/* KPI Rings Widget */}
        <motion.div
          key="kpi-rings"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <KPIRingsWidget accentColor={settings?.accentColor} />
        </motion.div>

        {/* Live Charts Widget */}
        <motion.div
          key="live-charts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <LiveChartsWidget accentColor={settings?.accentColor} />
        </motion.div>

        {/* World Map Widget */}
        <motion.div
          key="world-map"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <WorldMapWidget />
        </motion.div>

        {/* Activity Feed Widget */}
        <motion.div
          key="activity-feed"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ActivityFeedWidget />
        </motion.div>

        {/* AI Insights Widget */}
        <motion.div
          key="ai-insights"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AIInsightsWidget />
        </motion.div>

        {/* Smart Suggestions Widget */}
        <motion.div
          key="suggestions"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <SmartSuggestionsWidget />
        </motion.div>
      </ResponsiveGridLayout>
    </div>
  )
}
```

#### 4.4 Create KPI Rings Widget
Create `components/features/dashboard/widgets/KPIRingsWidget.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

interface KPIRingsWidgetProps {
  accentColor?: string
}

export function KPIRingsWidget({ accentColor = 'cyan' }: KPIRingsWidgetProps) {
  const { data: kpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/kpis')
      return response.json()
    },
    refetchInterval: 10000 // 10 seconds
  })

  const getAccentColor = (color: string) => {
    const colors = {
      cyan: 'text-cyan-400',
      purple: 'text-purple-400', 
      green: 'text-green-400',
      orange: 'text-orange-400'
    }
    return colors[color as keyof typeof colors] || colors.cyan
  }

  const kpiData = [
    {
      label: 'Conversion Rate',
      value: kpis?.conversionRate || 24,
      target: 30,
      change: +2.1,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      label: 'Pipeline Health',
      value: kpis?.pipelineHealth || 78,
      target: 80,
      change: -0.8,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Agent Productivity',
      value: kpis?.agentProductivity || 92,
      target: 100,
      change: +5.2,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <Card className="h-full backdrop-blur-lg bg-slate-900/90 border-cyan-500/20 shadow-lg shadow-cyan-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className={`w-5 h-5 ${getAccentColor(accentColor)}`} />
          KPI Overview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{kpi.label}</span>
              <div className="flex items-center gap-1">
                {kpi.change > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={`text-xs ${kpi.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Circular Progress Ring */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke="rgb(30 41 59)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke={`url(#gradient-${index})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(kpi.value / 100) * 113.1} 113.1`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">{kpi.value}%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex-1 space-y-1">
                <Progress 
                  value={kpi.value} 
                  className="h-2" 
                  style={{
                    background: 'rgb(30 41 59)'
                  }}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Current</span>
                  <span>Target: {kpi.target}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
```

### Phase 5: API Route Implementation

#### 5.1 Create Dashboard API Routes
Create `app/api/v1/dashboard/kpis/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getKPIMetrics } from '@/lib/modules/dashboard/kpis'
import { canAccessFeature } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const kpis = await getKPIMetrics()
    return NextResponse.json(kpis)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}
```

#### 5.2 Create Activity Feed API
Create `app/api/v1/dashboard/activities/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getRecentActivities } from '@/lib/modules/dashboard/activities'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const activities = await getRecentActivities(limit)
    return NextResponse.json({ activities })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
```

### Phase 6: Navigation Integration

#### 6.1 Update Root Page Redirect
Update `app/page.tsx`:
```typescript
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }
  
  // Redirect to main dashboard hub
  redirect('/dashboard')
}
```

#### 6.2 Update Middleware for Dashboard Protection
Update `middleware.ts`:
```typescript
export async function middleware(request: NextRequest) {
  const session = await getSession(request)
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if onboarding is complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true }
    })
    
    if (!user?.onboardingCompleted) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return NextResponse.next()
}
```

### Phase 7: Testing & Quality Assurance

#### 7.1 Create Dashboard Tests
Create `__tests__/features/dashboard/dashboard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { DashboardHero } from '@/components/features/dashboard/hero'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

function renderWithQueryClient(component: React.ReactElement) {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('Main Dashboard', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com'
  }

  it('should render hero section with user greeting', () => {
    renderWithQueryClient(<DashboardHero user={mockUser} />)
    
    expect(screen.getByText(/Good/)).toBeInTheDocument()
    expect(screen.getByText(/John/)).toBeInTheDocument()
  })

  it('should display real-time clock', () => {
    renderWithQueryClient(<DashboardHero user={mockUser} />)
    
    // Should show current time
    const timeElement = screen.getByText(/\d{1,2}:\d{2}/)
    expect(timeElement).toBeInTheDocument()
  })
})
```

### Phase 8: Go-Live Checklist

- [ ] Database migrations applied successfully  
- [ ] RLS policies enabled on all dashboard tables
- [ ] RBAC permissions working for dashboard access
- [ ] Hero section renders with animated greeting and real-time data
- [ ] KPI widgets display actual metrics with proper color scheme
- [ ] Dashboard grid layout is fully draggable and resizable
- [ ] Command palette opens and functions correctly (⌘K)
- [ ] Weather widget displays current conditions
- [ ] Activity feed shows real-time updates
- [ ] Mobile responsiveness maintained across all widgets
- [ ] Particle background animates smoothly
- [ ] All API endpoints protected and functional
- [ ] Settings persistence working (layout, theme, preferences)
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage
- [ ] Performance optimized (lazy loading, code splitting)

## UI Design Preservation Notes

**Critical Design Elements to Maintain:**
- **Background**: `bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900`
- **Glassmorphic Cards**: `backdrop-blur-lg bg-slate-900/80 border-cyan-500/30 shadow-2xl shadow-cyan-500/20`
- **Neon Text Gradient**: `bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent`
- **Particle Background**: Animated particles with subtle movement
- **Smooth Animations**: Framer Motion entrance animations with stagger delays
- **Interactive Elements**: Hover effects with neon glow and smooth transitions

**Widget Styling Patterns:**
```css
/* Dashboard widget base */
.dashboard-widget {
  @apply h-full backdrop-blur-lg bg-slate-900/90 border-cyan-500/20 shadow-lg shadow-cyan-500/10;
}

/* Hero gradient text */
.hero-gradient-text {
  @apply bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent;
}

/* KPI ring animations */
.kpi-ring {
  @apply transition-all duration-1000;
}

/* Grid layout styling */
.react-grid-item {
  @apply rounded-lg overflow-hidden;
}
```

This integration creates a stunning, futuristic main dashboard that serves as the perfect "wow moment" entry point while maintaining all the advanced functionality and visual appeal of the original design.