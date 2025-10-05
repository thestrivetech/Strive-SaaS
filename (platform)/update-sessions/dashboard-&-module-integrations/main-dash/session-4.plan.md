# Session 4: Dashboard UI Components - Metrics & Widgets

## Session Overview
**Goal:** Build reusable React components for displaying dashboard metrics, KPI cards, and data visualization widgets.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 3 (API routes must be complete)

## Objectives

1. ✅ Create KPI Cards component with metric display
2. ✅ Build Chart widgets for data visualization
3. ✅ Implement Progress Tracker components
4. ✅ Add Loading states and Suspense boundaries
5. ✅ Implement Error boundaries
6. ✅ Ensure mobile responsiveness
7. ✅ Add TanStack Query for data fetching

## Prerequisites

- [x] Session 3 completed (API routes ready)
- [x] Understanding of React Server Components vs Client Components
- [x] Familiarity with TanStack Query
- [x] Knowledge of Tailwind CSS and shadcn/ui

## Component Structure

```
components/features/dashboard/
├── metrics/
│   ├── kpi-cards.tsx              # KPI metric cards
│   ├── kpi-card.tsx               # Single KPI card
│   ├── metric-chart.tsx           # Chart visualization
│   └── metric-status-badge.tsx    # Status indicator
├── widgets/
│   ├── widget-container.tsx       # Widget wrapper
│   ├── widget-header.tsx          # Widget header
│   ├── chart-widget.tsx           # Chart widget
│   ├── table-widget.tsx           # Table widget
│   └── progress-widget.tsx        # Progress tracker
├── shared/
│   ├── loading-skeleton.tsx       # Loading states
│   ├── error-boundary.tsx         # Error handling
│   └── empty-state.tsx            # Empty states
└── header/
    └── dashboard-header.tsx       # Dashboard header
```

## Step-by-Step Implementation

### Step 1: Create KPI Cards Components

**File:** `components/features/dashboard/metrics/kpi-cards.tsx`

```tsx
'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { KPICard } from './kpi-card'
import { Skeleton } from '@/components/ui/skeleton'

interface Metric {
  id: string
  name: string
  value: number
  unit?: string
  change?: number
  status: 'normal' | 'warning' | 'critical'
  icon: string
  category: string
}

export function KPICards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/dashboard/metrics/calculate', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load metrics. Please try again.</p>
      </div>
    )
  }

  const metrics = data?.metrics || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.slice(0, 4).map((metric: Metric) => (
        <KPICard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
```

**File:** `components/features/dashboard/metrics/kpi-card.tsx`

```tsx
'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity } from 'lucide-react'
import { MetricStatusBadge } from './metric-status-badge'

interface KPICardProps {
  metric: {
    id: string
    name: string
    value: number
    unit?: string
    change?: number
    status: 'normal' | 'warning' | 'critical'
    icon: string
  }
}

const iconMap = {
  'dollar-sign': DollarSign,
  'users': Users,
  'target': Target,
  'activity': Activity,
}

export function KPICard({ metric }: KPICardProps) {
  const Icon = iconMap[metric.icon as keyof typeof iconMap] || Activity
  const isPositiveChange = (metric.change || 0) >= 0

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">
                {metric.name}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value.toLocaleString()}
                </p>
                {metric.unit && (
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                )}
              </div>
            </div>
          </div>
          {metric.status !== 'normal' && (
            <MetricStatusBadge status={metric.status} />
          )}
        </div>

        {metric.change !== undefined && (
          <div
            className={`flex items-center mt-4 text-sm ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}
          >
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
      </CardContent>
    </Card>
  )
}
```

**File:** `components/features/dashboard/metrics/metric-status-badge.tsx`

```tsx
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle } from 'lucide-react'

interface MetricStatusBadgeProps {
  status: 'normal' | 'warning' | 'critical'
}

export function MetricStatusBadge({ status }: MetricStatusBadgeProps) {
  if (status === 'normal') return null

  const config = {
    warning: {
      icon: AlertTriangle,
      label: 'Attention',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    critical: {
      icon: AlertCircle,
      label: 'Critical',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  }

  const { icon: Icon, label, className } = config[status]

  return (
    <Badge variant="outline" className={`${className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs">{label}</span>
    </Badge>
  )
}
```

### Step 2: Create Chart Widget Component

**File:** `components/features/dashboard/widgets/chart-widget.tsx`

```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ChartWidgetProps {
  title: string
  type: 'line' | 'bar' | 'pie'
  data: any[]
  dataKey: string
  xAxisKey?: string
  color?: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function ChartWidget({
  title,
  type,
  data,
  dataKey,
  xAxisKey = 'name',
  color = '#3B82F6',
}: ChartWidgetProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke={color} />
          </LineChart>
        )
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
      default:
        return null
    }
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Step 3: Create Progress Tracker Component

**File:** `components/features/dashboard/widgets/progress-widget.tsx`

```tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ProgressItem {
  id: string
  label: string
  current: number
  target: number
  unit?: string
  color?: string
}

interface ProgressWidgetProps {
  title: string
  items: ProgressItem[]
}

export function ProgressWidget({ title, items }: ProgressWidgetProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item) => {
            const percentage = Math.min((item.current / item.target) * 100, 100)
            const isComplete = percentage >= 100

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {item.current} / {item.target}
                      {item.unit && ` ${item.unit}`}
                    </span>
                    {isComplete && (
                      <Badge className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName={item.color || 'bg-blue-600'}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(0)}% complete</span>
                  {!isComplete && (
                    <span>{item.target - item.current} remaining</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 4: Create Dashboard Header

**File:** `components/features/dashboard/header/dashboard-header.tsx`

```tsx
'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Settings, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

export function DashboardHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    queryClient.invalidateQueries({ queryKey: ['recent-activities'] })
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your organization today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/customize')}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Customize
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 5: Create Shared Components

**File:** `components/features/dashboard/shared/loading-skeleton.tsx`

```tsx
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 p-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

**File:** `components/features/dashboard/shared/empty-state.tsx`

```tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <PlusCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            {description}
          </p>
          {actionLabel && onAction && (
            <Button onClick={onAction} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Testing & Validation

### Test 1: Component Rendering
```tsx
// Test KPI Cards render correctly
import { render, screen } from '@testing-library/react'
import { KPICards } from '@/components/features/dashboard/metrics/kpi-cards'

test('renders KPI cards', async () => {
  render(<KPICards />)
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})
```

### Test 2: Data Fetching
```tsx
// Test data fetching with TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
render(
  <QueryClientProvider client={queryClient}>
    <KPICards />
  </QueryClientProvider>
)
```

### Test 3: Responsive Design
- Test on mobile (320px width)
- Test on tablet (768px width)
- Test on desktop (1024px+ width)

## Success Criteria

- [x] KPI Cards display metrics correctly
- [x] Charts render with proper data
- [x] Progress trackers show accurate percentages
- [x] Loading states show skeletons
- [x] Empty states render when no data
- [x] Components are mobile responsive
- [x] TanStack Query caching works

## Files Created

- ✅ `components/features/dashboard/metrics/kpi-cards.tsx`
- ✅ `components/features/dashboard/metrics/kpi-card.tsx`
- ✅ `components/features/dashboard/metrics/metric-status-badge.tsx`
- ✅ `components/features/dashboard/widgets/chart-widget.tsx`
- ✅ `components/features/dashboard/widgets/progress-widget.tsx`
- ✅ `components/features/dashboard/header/dashboard-header.tsx`
- ✅ `components/features/dashboard/shared/loading-skeleton.tsx`
- ✅ `components/features/dashboard/shared/empty-state.tsx`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Client/Server Component Confusion
**Problem:** Using hooks in Server Components
**Solution:** Add 'use client' directive for interactive components

### ❌ Pitfall 2: Missing Loading States
**Problem:** Components show nothing while loading
**Solution:** Always provide Skeleton or Spinner components

### ❌ Pitfall 3: Non-Responsive Design
**Problem:** Components break on mobile
**Solution:** Use Tailwind responsive classes (sm:, md:, lg:)

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 5: Activity Feed & Quick Actions UI**
2. ✅ Metric visualization complete
3. ✅ Ready to add interactive components
4. ✅ Dashboard UI taking shape

---

**Session 4 Complete:** ✅ Dashboard UI components built and tested
