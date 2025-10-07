# Dashboard Components

Complete dashboard UI components with metrics, widgets, and shared utilities for the Strive-SaaS platform.

## Overview

This directory contains all dashboard-related components:
- **Metrics**: KPI cards and status indicators
- **Widgets**: Charts and progress trackers
- **Shared**: Loading states and empty states
- **Header**: Dashboard header with actions

## Components

### Metrics

#### KPICards
Main KPI cards component with TanStack Query integration.

```tsx
import { KPICards } from '@/components/features/dashboard'

export default function DashboardPage() {
  return (
    <div>
      <KPICards />
    </div>
  )
}
```

**Features:**
- TanStack Query for data fetching
- Auto-refresh every 5 minutes
- Loading skeleton while fetching
- Error state handling
- Responsive grid (1 col → 2 col → 4 col)

#### KPICard
Individual KPI card component.

```tsx
import { KPICard } from '@/components/features/dashboard'

const metric = {
  id: '1',
  name: 'Total Revenue',
  value: 125000,
  unit: 'USD',
  change: 12.5,
  status: 'normal',
  icon: 'DollarSign',
  category: 'finance'
}

<KPICard metric={metric} />
```

#### MetricStatusBadge
Status badge for metrics.

```tsx
import { MetricStatusBadge } from '@/components/features/dashboard'

<MetricStatusBadge status="warning" />
```

**Status options:** `'normal' | 'warning' | 'critical'`

### Widgets

#### ChartWidget
Versatile chart component supporting multiple chart types.

```tsx
import { ChartWidget } from '@/components/features/dashboard'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
]

<ChartWidget
  title="Monthly Revenue"
  type="line"
  data={data}
  dataKey="value"
  xAxisKey="name"
  color="#3B82F6"
/>
```

**Chart types:** `'line' | 'bar' | 'pie'`

**Features:**
- Responsive container
- Multiple chart types
- Customizable colors
- Recharts integration

#### ProgressWidget
Progress tracker for goals and targets.

```tsx
import { ProgressWidget } from '@/components/features/dashboard'

const items = [
  {
    id: '1',
    label: 'Q1 Sales Goal',
    current: 75000,
    target: 100000,
    unit: 'USD',
    color: 'blue'
  },
  // ... more items
]

<ProgressWidget title="Goals Progress" items={items} />
```

**Features:**
- Percentage calculation
- Completion badges
- Remaining count display
- Responsive layout

### Shared

#### DashboardLoadingSkeleton
Skeleton loading state matching dashboard layout.

```tsx
import { DashboardLoadingSkeleton } from '@/components/features/dashboard'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

**Features:**
- Matches actual dashboard layout
- Accessible with ARIA labels
- Responsive grid
- Header, KPI cards, and content grid skeletons

#### EmptyState
Empty state for when no data is available.

```tsx
import { EmptyState } from '@/components/features/dashboard'

<EmptyState
  title="No data available"
  description="Start by adding your first item"
  actionLabel="Add Item"
  onAction={() => console.log('Add item clicked')}
/>
```

**Features:**
- Optional action button
- Icon placeholder
- Clean centered design
- Accessible

### Header

#### DashboardHeader
Dashboard header with user greeting and actions.

```tsx
import { DashboardHeader } from '@/components/features/dashboard'

<DashboardHeader userName="John Doe" />
```

**Features:**
- User greeting
- Refresh button (invalidates queries)
- Customize button (navigation)
- Responsive layout
- TanStack Query integration

## Responsive Design

All components use mobile-first responsive design:

```tsx
// KPI Cards
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// Content Grid
grid-cols-1 lg:grid-cols-2

// Header
flex-col sm:flex-row
```

**Breakpoints:**
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px

## TanStack Query Integration

Components using TanStack Query:

### KPICards
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['dashboard-metrics'],
  queryFn: async () => {
    const response = await fetch('/api/v1/dashboard/metrics/calculate')
    return response.json()
  },
  refetchInterval: 300000, // 5 minutes
})
```

### DashboardHeader
```tsx
const queryClient = useQueryClient()

const handleRefresh = () => {
  queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
  queryClient.invalidateQueries({ queryKey: ['recent-activities'] })
}
```

## File Structure

```
components/features/dashboard/
├── index.ts                      # Public API exports
├── README.md                     # This file
├── header/
│   └── dashboard-header.tsx      # Dashboard header (58 lines)
├── metrics/
│   ├── kpi-cards.tsx            # KPI cards grid (59 lines)
│   ├── kpi-card.tsx             # Individual KPI card (77 lines)
│   └── metric-status-badge.tsx  # Status badge (33 lines)
├── widgets/
│   ├── chart-widget.tsx         # Chart component (110 lines)
│   └── progress-widget.tsx      # Progress tracker (71 lines)
└── shared/
    ├── loading-skeleton.tsx     # Loading skeleton (93 lines)
    └── empty-state.tsx          # Empty state (71 lines)
```

**Total:** 9 files, 597 lines (all under 500-line limit)

## Usage Example

Complete dashboard page:

```tsx
import { Suspense } from 'react'
import {
  DashboardHeader,
  KPICards,
  ChartWidget,
  ProgressWidget,
  DashboardLoadingSkeleton,
  EmptyState
} from '@/components/features/dashboard'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <DashboardHeader userName={user.name} />

      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <KPICards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Revenue Trend"
          type="line"
          data={revenueData}
          dataKey="revenue"
          xAxisKey="month"
        />

        <ProgressWidget
          title="Goals Progress"
          items={goalItems}
        />
      </div>
    </div>
  )
}
```

## Testing

All components are fully typed with TypeScript and follow platform standards:

- ✅ TypeScript strict mode
- ✅ Zero TypeScript errors
- ✅ ESLint compliant
- ✅ File size < 500 lines
- ✅ Mobile-first responsive
- ✅ Accessible (ARIA labels, semantic HTML)
- ✅ TanStack Query integration

## Future Enhancements

Planned improvements:
- [ ] Error boundary wrapper
- [ ] Customizable widget layouts
- [ ] Real-time data updates (Supabase Realtime)
- [ ] Widget export functionality
- [ ] Dark mode optimizations
- [ ] Animation transitions (Framer Motion)
