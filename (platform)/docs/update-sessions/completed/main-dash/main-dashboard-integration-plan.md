# Main User Dashboard (DashFlow) Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the Main User Dashboard (DashFlow) into the Strive SaaS Platform as the primary landing page for returning users and newly signed up and onboarded users and central navigation hub, preserving clean design principles while adapting to the platform's multi-tenant architecture.

## Prerequisites
- Existing Strive SaaS Platform setup (Next.js 15, Prisma, Supabase)
- DashFlow code imported into repository
- Understanding of multi-tenant RLS and RBAC patterns

## UI Design Analysis (Inferred from Platform Standards)
**Design Theme:**
- **Clean & Professional**: Minimal, modern design with clear information hierarchy
- **Color Palette**: 
  - Primary: Blue (#3B82F6) for primary actions
  - Success: Green (#10B981) for positive metrics
  - Warning: Orange (#F59E0B) for attention items
  - Background: Clean white/light gray theme
- **Layout**: Grid-based dashboard with modular widget system
- **Typography**: Clear, readable fonts with emphasis on data presentation

**Key Visual Elements:**
- Central KPI cards with key metrics
- Quick action buttons for common tasks
- Recent activity feeds
- Module shortcuts and navigation
- Progress trackers and status indicators
- Responsive grid layout

## Integration Steps

### Phase 1: Database Schema Integration

#### 1.1 Add Dashboard Tables to Prisma Schema
Add to existing `prisma/schema.prisma`:

```prisma
// Main Dashboard Module Tables
model DashboardWidget {
  id             String   @id @default(cuid())
  name           String
  type           WidgetType
  
  // Widget Configuration
  config         Json     // Widget-specific settings
  position       Json     // Grid position and size
  dataSource     String?  // Data source identifier
  refreshRate    Int      @default(300) // Refresh interval in seconds
  
  // Display Settings
  isVisible      Boolean  @default(true)
  title          String?  // Custom title override
  chartType      String?  // For data visualization widgets
  
  // Access Control
  permissions    String[] // Required permissions to view
  
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

model UserDashboard {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  
  // Layout Configuration
  layout         Json     // Dashboard layout configuration
  widgets        String[] // Widget IDs in display order
  
  // Preferences
  theme          DashboardTheme @default(LIGHT)
  density        LayoutDensity @default(NORMAL)
  autoRefresh    Boolean  @default(true)
  
  // Customization
  quickActions   String[] // Quick action button IDs
  pinnedModules  String[] // Pinned module shortcuts
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("user_dashboards")
}

model ActivityFeed {
  id             String   @id @default(cuid())
  title          String
  description    String?
  type           ActivityType
  
  // Activity Details
  entityType     String   // e.g., 'workflow', 'expense', 'project'
  entityId       String   // ID of the related entity
  action         String   // e.g., 'created', 'updated', 'completed'
  
  // Activity Data
  metadata       Json?    // Additional activity context
  severity       ActivitySeverity @default(INFO)
  
  // Display Options
  isRead         Boolean  @default(false)
  isPinned       Boolean  @default(false)
  isArchived     Boolean  @default(false)
  
  createdAt      DateTime @default(now())
  
  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  // Relations
  userId         String?  // User who triggered the activity
  user           User?    @relation(fields: [userId], references: [id])
  
  @@map("activity_feeds")
}

model QuickAction {
  id             String   @id @default(cuid())
  name           String
  description    String?
  icon           String   // Icon identifier
  
  // Action Configuration
  actionType     ActionType
  targetUrl      String?  // For navigation actions
  apiEndpoint    String?  // For API actions
  formConfig     Json?    // For form actions
  
  // Display Settings
  color          String   @default("blue")
  isEnabled      Boolean  @default(true)
  sortOrder      Int      @default(0)
  
  // Access Control
  requiredRole   String[] // Required roles to see action
  requiredTier   String[] // Required subscription tiers
  
  // Usage Tracking
  usageCount     Int      @default(0)
  lastUsed       DateTime?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation (nullable for system actions)
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String?
  creator        User?    @relation(fields: [createdBy], references: [id])
  
  @@map("quick_actions")
}

model DashboardMetric {
  id             String   @id @default(cuid())
  name           String
  category       MetricCategory
  
  // Metric Configuration
  query          Json     // Database query or calculation logic
  unit           String?  // Unit of measurement (%, $, count, etc.)
  format         String   @default("number") // number, currency, percentage
  
  // Thresholds & Alerts
  targetValue    Float?   // Target/goal value
  warningThreshold Float? // Warning threshold
  criticalThreshold Float? // Critical threshold
  
  // Display Settings
  chartType      String?  // line, bar, pie, gauge
  color          String   @default("blue")
  icon           String?
  
  // Access Control
  permissions    String[] // Required permissions
  
  // Refresh Settings
  refreshRate    Int      @default(300) // Seconds
  lastCalculated DateTime?
  cachedValue    Float?   // Cached metric value
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Multi-tenant isolation (nullable for system metrics)
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  // Relations
  createdBy      String?
  creator        User?    @relation(fields: [createdBy], references: [id])
  
  @@map("dashboard_metrics")
}

enum WidgetType {
  KPI_CARD
  CHART
  TABLE
  ACTIVITY_FEED
  QUICK_ACTIONS
  MODULE_SHORTCUTS
  PROGRESS_TRACKER
  NOTIFICATION_PANEL
  CALENDAR
  WEATHER
}

enum DashboardTheme {
  LIGHT
  DARK
  AUTO
}

enum LayoutDensity {
  COMPACT
  NORMAL
  SPACIOUS
}

enum ActivityType {
  USER_ACTION
  SYSTEM_EVENT
  WORKFLOW_UPDATE
  DATA_CHANGE
  SECURITY_EVENT
  INTEGRATION_EVENT
}

enum ActivitySeverity {
  INFO
  SUCCESS
  WARNING
  ERROR
  CRITICAL
}

enum ActionType {
  NAVIGATION
  API_CALL
  MODAL_FORM
  EXTERNAL_LINK
  WORKFLOW_TRIGGER
}

enum MetricCategory {
  FINANCIAL
  OPERATIONAL
  MARKETING
  SALES
  PRODUCTIVITY
  SYSTEM
  CUSTOM
}
```

#### 1.2 Update User and Organization Relations
Add to existing models:
```prisma
model User {
  // ... existing fields
  
  // Dashboard relations
  dashboardWidgets  DashboardWidget[]
  userDashboard     UserDashboard?
  activities        ActivityFeed[]
  quickActions      QuickAction[]
  dashboardMetrics  DashboardMetric[]
}

model Organization {
  // ... existing fields
  
  // Dashboard relations
  dashboardWidgets  DashboardWidget[]
  activities        ActivityFeed[]
  quickActions      QuickAction[]
  dashboardMetrics  DashboardMetric[]
}
```

#### 1.3 Run Database Migration
```bash
npx prisma migrate dev --name add-main-dashboard
npx prisma generate
```

### Phase 2: File Structure Setup

#### 2.1 Create Dashboard Route Structure
```bash
# From platform root
mkdir -p app/\(platform\)/dashboard/{overview,customize,widgets,analytics}
```

#### 2.2 Copy and Adapt Components
Create `components/features/dashboard/` directory:

```bash
mkdir -p components/features/dashboard/{
  widgets,
  metrics,
  activity,
  quick-actions,
  customization,
  shared
}
```

#### 2.3 Create API Route Structure
```bash
mkdir -p app/api/v1/dashboard/{widgets,metrics,activities,actions}
```

### Phase 3: Module Architecture Integration

#### 3.1 Create Dashboard Module
Following platform module patterns:

```typescript
// lib/modules/dashboard/metrics/index.ts
export const DashboardMetricSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.nativeEnum(MetricCategory),
  query: z.any(),
  unit: z.string().optional(),
  format: z.string().default("number"),
  chartType: z.string().optional(),
  organizationId: z.string().uuid().optional(),
});

export async function calculateMetrics(organizationId: string) {
  const session = await requireAuth();
  
  // Get all active metrics for the organization
  const metrics = await prisma.dashboardMetric.findMany({
    where: {
      OR: [
        { organizationId: organizationId },
        { organizationId: null } // System metrics
      ]
    }
  });

  const calculatedMetrics = [];

  for (const metric of metrics) {
    try {
      const value = await calculateMetricValue(metric, organizationId);
      
      // Update cached value
      await prisma.dashboardMetric.update({
        where: { id: metric.id },
        data: {
          cachedValue: value,
          lastCalculated: new Date()
        }
      });

      calculatedMetrics.push({
        ...metric,
        value,
        status: getMetricStatus(value, metric)
      });
    } catch (error) {
      console.error(`Failed to calculate metric ${metric.name}:`, error);
    }
  }

  return calculatedMetrics;
}

async function calculateMetricValue(metric: any, organizationId: string): Promise<number> {
  // This would implement the actual metric calculation based on the query
  // For example, calculating total expenses, workflow completion rates, etc.
  
  switch (metric.category) {
    case 'FINANCIAL':
      return await calculateFinancialMetric(metric.query, organizationId);
    case 'OPERATIONAL':
      return await calculateOperationalMetric(metric.query, organizationId);
    case 'PRODUCTIVITY':
      return await calculateProductivityMetric(metric.query, organizationId);
    default:
      return 0;
  }
}

function getMetricStatus(value: number, metric: any): 'normal' | 'warning' | 'critical' {
  if (metric.criticalThreshold && value >= metric.criticalThreshold) {
    return 'critical';
  }
  if (metric.warningThreshold && value >= metric.warningThreshold) {
    return 'warning';
  }
  return 'normal';
}

export async function recordActivity(input: ActivityInput) {
  const session = await requireAuth();

  return await prisma.activityFeed.create({
    data: {
      ...input,
      organizationId: session.user.organizationId,
      userId: session.user.id
    }
  });
}

export async function getRecentActivities(limit: number = 20) {
  const session = await requireAuth();

  return await prisma.activityFeed.findMany({
    where: {
      organizationId: session.user.organizationId,
      isArchived: false
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}
```

### Phase 4: RBAC & Feature Access Integration

#### 4.1 Add Dashboard Permissions
Update `lib/auth/rbac.ts`:
```typescript
export function canAccessDashboard(user: User): boolean {
  // All authenticated users can access basic dashboard
  return true;
}

export function canCustomizeDashboard(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canViewOrganizationMetrics(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canManageWidgets(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}
```

### Phase 5: UI Component Recreation

#### 5.1 Create Main Dashboard Page
Create `app/(platform)/dashboard/page.tsx`:
```tsx
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/features/dashboard/header'
import { KPICards } from '@/components/features/dashboard/metrics/kpi-cards'
import { QuickActions } from '@/components/features/dashboard/quick-actions/quick-actions-grid'
import { ActivityFeed } from '@/components/features/dashboard/activity/activity-feed'
import { ModuleShortcuts } from '@/components/features/dashboard/shortcuts/module-shortcuts'
import { ProgressTrackers } from '@/components/features/dashboard/widgets/progress-trackers'
import { Skeleton } from '@/components/ui/skeleton'

export default function MainDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Cards Row */}
          <Suspense fallback={<Skeleton className="h-32" />}>
            <KPICards />
          </Suspense>
          
          {/* Quick Actions */}
          <Suspense fallback={<Skeleton className="h-48" />}>
            <QuickActions />
          </Suspense>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Activity & Progress */}
            <div className="lg:col-span-2 space-y-8">
              <Suspense fallback={<Skeleton className="h-96" />}>
                <ActivityFeed />
              </Suspense>
              
              <Suspense fallback={<Skeleton className="h-64" />}>
                <ProgressTrackers />
              </Suspense>
            </div>
            
            {/* Right Column - Module Shortcuts */}
            <div className="lg:col-span-1">
              <Suspense fallback={<Skeleton className="h-96" />}>
                <ModuleShortcuts />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 5.2 Create KPI Cards Component
Create `components/features/dashboard/metrics/KPICards.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface Metric {
  id: string
  name: string
  value: number
  unit: string
  change: number
  status: 'normal' | 'warning' | 'critical'
  icon: string
}

export function KPICards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/metrics')
      return response.json()
    }
  })

  const getIcon = (iconName: string) => {
    const icons = {
      'dollar-sign': DollarSign,
      'users': Users,
      'target': Target,
      'activity': Activity,
    }
    return icons[iconName as keyof typeof icons] || Activity
  }

  const getStatusColor = (status: string) => {
    const colors = {
      normal: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    }
    return colors[status as keyof typeof colors] || colors.normal
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics?.metrics?.map((metric: Metric) => {
        const Icon = getIcon(metric.icon)
        const isPositiveChange = metric.change >= 0
        
        return (
          <Card key={metric.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value.toLocaleString()}
                        {metric.unit && <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {metric.change !== undefined && (
                <div className={`flex items-center mt-4 text-sm ${
                  isPositiveChange ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositiveChange ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  <span>
                    {Math.abs(metric.change).toFixed(1)}% from last month
                  </span>
                </div>
              )}
              
              {metric.status !== 'normal' && (
                <div className={`mt-2 text-xs ${getStatusColor(metric.status)}`}>
                  {metric.status === 'warning' ? '⚠️ Attention needed' : '🚨 Critical level'}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
```

#### 5.3 Create Quick Actions Grid
Create `components/features/dashboard/quick-actions/QuickActionsGrid.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Users, Zap, Calculator, Building, Bot } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  name: string
  description: string
  icon: string
  actionType: string
  targetUrl?: string
  color: string
}

export function QuickActionsGrid() {
  const router = useRouter()
  
  const { data: actions, isLoading } = useQuery({
    queryKey: ['quick-actions'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/actions')
      return response.json()
    }
  })

  const executeActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const response = await fetch(`/api/v1/dashboard/actions/${actionId}/execute`, {
        method: 'POST'
      })
      return response.json()
    }
  })

  const getIcon = (iconName: string) => {
    const icons = {
      'plus': Plus,
      'file-text': FileText,
      'users': Users,
      'zap': Zap,
      'calculator': Calculator,
      'building': Building,
      'bot': Bot,
    }
    return icons[iconName as keyof typeof icons] || Plus
  }

  const getButtonColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600 text-white',
      green: 'bg-green-500 hover:bg-green-600 text-white',
      purple: 'bg-purple-500 hover:bg-purple-600 text-white',
      orange: 'bg-orange-500 hover:bg-orange-600 text-white',
      gray: 'bg-gray-500 hover:bg-gray-600 text-white',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const handleActionClick = (action: QuickAction) => {
    if (action.actionType === 'NAVIGATION' && action.targetUrl) {
      router.push(action.targetUrl)
    } else if (action.actionType === 'API_CALL') {
      executeActionMutation.mutate(action.id)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {actions?.actions?.map((action: QuickAction) => {
            const Icon = getIcon(action.icon)
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`h-20 flex flex-col items-center justify-center gap-2 p-4 ${getButtonColor(action.color)}`}
                onClick={() => handleActionClick(action)}
                disabled={executeActionMutation.isPending}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.name}
                </span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 5.4 Create Activity Feed Component
Create `components/features/dashboard/activity/ActivityFeed.tsx`:
```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

interface Activity {
  id: string
  title: string
  description: string
  type: string
  severity: string
  createdAt: string
  user?: {
    name: string
    image?: string
  }
}

export function ActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/activities')
      return response.json()
    }
  })

  const getSeverityColor = (severity: string) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      CRITICAL: 'bg-red-200 text-red-900',
    }
    return colors[severity as keyof typeof colors] || colors.INFO
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      USER_ACTION: '👤',
      SYSTEM_EVENT: '⚙️',
      WORKFLOW_UPDATE: '🔄',
      DATA_CHANGE: '📊',
      SECURITY_EVENT: '🔒',
      INTEGRATION_EVENT: '🔗',
    }
    return icons[type as keyof typeof icons] || '📝'
  }

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📋 Recent Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activities?.activities?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display.</p>
            </div>
          ) : (
            activities?.activities?.map((activity: Activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  {activity.user?.image ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.user.image} />
                      <AvatarFallback>{activity.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                      {getTypeIcon(activity.type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <Badge variant="secondary" className={`text-xs ${getSeverityColor(activity.severity)}`}>
                      {activity.severity.toLowerCase()}
                    </Badge>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-gray-600 mb-1">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {activity.user?.name && (
                      <span>by {activity.user.name}</span>
                    )}
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Phase 6: API Route Implementation

#### 6.1 Create Dashboard Metrics API
Create `app/api/v1/dashboard/metrics/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { calculateMetrics } from '@/lib/modules/dashboard/metrics'
import { canAccessDashboard } from '@/lib/auth/rbac'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !canAccessDashboard(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const metrics = await calculateMetrics(session.user.organizationId)
    return NextResponse.json({ metrics })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
```

#### 6.2 Create Activities API
Create `app/api/v1/dashboard/activities/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getRecentActivities } from '@/lib/modules/dashboard/metrics'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const activities = await getRecentActivities(20)
    return NextResponse.json({ activities })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
```

### Phase 7: Navigation Integration

#### 7.1 Update Platform Sidebar
Update `components/shared/layouts/sidebar.tsx`:
```typescript
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    children: [
      { name: 'Overview', href: '/dashboard' },
      { name: 'Analytics', href: '/dashboard/analytics' },
      { name: 'Customize', href: '/dashboard/customize' },
    ]
  },
  // ... other existing items
]
```

### Phase 8: Go-Live Checklist

- [ ] Database migrations applied successfully
- [ ] RLS policies enabled on all dashboard tables
- [ ] RBAC permissions working for dashboard access
- [ ] KPI cards displaying organization metrics correctly
- [ ] Quick actions grid with navigation working
- [ ] Activity feed showing recent organizational activities
- [ ] Module shortcuts providing navigation to other platform sections
- [ ] Progress trackers displaying relevant completion metrics
- [ ] Dashboard customization features operational
- [ ] All API endpoints protected and functional
- [ ] Navigation integrated with platform sidebar
- [ ] Mobile responsiveness maintained
- [ ] Error boundaries and loading states in place
- [ ] Tests passing with required coverage

## UI Design Preservation Notes

**Critical Design Elements:**
- **Clean Professional Layout**: Grid-based dashboard with clear information hierarchy
- **KPI Cards**: Prominent metrics display with trend indicators
- **Quick Actions**: Easy access to common tasks with icon buttons
- **Activity Feed**: Chronological feed of organizational activities
- **Module Shortcuts**: Navigation to other platform features
- **Responsive Design**: Adaptive grid layouts for all screen sizes

**Component Styling Patterns:**
```css
/* Dashboard card styling */
.dashboard-card {
  @apply bg-white shadow-sm hover:shadow-md transition-shadow;
}

/* KPI metric styling */
.kpi-value {
  @apply text-2xl font-bold text-gray-900;
}

/* Quick action buttons */
.quick-action-btn {
  @apply h-20 flex flex-col items-center justify-center gap-2;
}

/* Activity item styling */
.activity-item {
  @apply flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50;
}
```

This integration creates a comprehensive main dashboard that serves as the central hub for user navigation and activity monitoring while preserving clean, professional design standards and integrating seamlessly with the Strive platform's multi-tenant architecture.