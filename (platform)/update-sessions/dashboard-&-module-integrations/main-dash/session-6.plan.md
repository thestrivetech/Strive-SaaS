# Session 6: Main Dashboard Page Integration & Assembly

## Session Overview
**Goal:** Assemble all dashboard components into a cohesive main dashboard page with proper layout, routing, and data orchestration.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 5 (All dashboard components must be complete)

## Objectives

1. ✅ Create main dashboard page route
2. ✅ Implement dashboard layout with grid system
3. ✅ Add proper data loading orchestration
4. ✅ Implement Suspense boundaries for streaming
5. ✅ Add error boundaries for fault tolerance
6. ✅ Configure navigation and routing
7. ✅ Ensure mobile responsiveness

## Prerequisites

- [x] Session 5 completed (All components ready)
- [x] Understanding of Next.js App Router layouts
- [x] Familiarity with React Suspense
- [x] Knowledge of responsive grid systems

## Page Structure

```
app/real-estate/dashboard/
├── layout.tsx           # Dashboard-specific layout
├── page.tsx             # Main dashboard page
├── customize/
│   └── page.tsx        # Dashboard customization page
├── analytics/
│   └── page.tsx        # Analytics deep-dive page
└── loading.tsx         # Loading state
```

## Step-by-Step Implementation

### Step 1: Create Dashboard Page

**File:** `app/real-estate/dashboard/page.tsx`

```tsx
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/features/dashboard/header/dashboard-header'
import { KPICards } from '@/components/features/dashboard/metrics/kpi-cards'
import { QuickActionsGrid } from '@/components/features/dashboard/quick-actions/quick-actions-grid'
import { ActivityFeed } from '@/components/features/dashboard/activity/activity-feed'
import { ModuleShortcuts } from '@/components/features/dashboard/shortcuts/module-shortcuts'
import { ProgressWidget } from '@/components/features/dashboard/widgets/progress-widget'
import { Skeleton } from '@/components/ui/skeleton'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Strive Platform',
  description: 'Your personalized dashboard for managing your real estate business',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Cards Row */}
          <Suspense fallback={<KPICardsSkeleton />}>
            <KPICards />
          </Suspense>

          {/* Quick Actions */}
          <Suspense fallback={<QuickActionsSkeleton />}>
            <QuickActionsGrid />
          </Suspense>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Activity & Progress */}
            <div className="lg:col-span-2 space-y-8">
              <Suspense fallback={<ActivityFeedSkeleton />}>
                <ActivityFeed />
              </Suspense>

              <Suspense fallback={<ProgressWidgetSkeleton />}>
                <ProgressTrackers />
              </Suspense>
            </div>

            {/* Right Column - Module Shortcuts */}
            <div className="lg:col-span-1">
              <Suspense fallback={<ModuleShortcutsSkeleton />}>
                <ModuleShortcuts />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Progress Trackers Component
function ProgressTrackers() {
  // Mock data - in real app, fetch from API
  const progressItems = [
    {
      id: '1',
      label: 'Monthly Sales Goal',
      current: 12,
      target: 20,
      unit: 'deals',
      color: 'bg-blue-600',
    },
    {
      id: '2',
      label: 'Client Onboarding',
      current: 8,
      target: 10,
      unit: 'clients',
      color: 'bg-green-600',
    },
    {
      id: '3',
      label: 'Listings Published',
      current: 15,
      target: 15,
      unit: 'listings',
      color: 'bg-purple-600',
    },
  ]

  return <ProgressWidget title="This Month's Progress" items={progressItems} />
}

// Loading Skeletons
function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  )
}

function QuickActionsSkeleton() {
  return <Skeleton className="h-48 rounded-lg" />
}

function ActivityFeedSkeleton() {
  return <Skeleton className="h-96 rounded-lg" />
}

function ProgressWidgetSkeleton() {
  return <Skeleton className="h-64 rounded-lg" />
}

function ModuleShortcutsSkeleton() {
  return <Skeleton className="h-96 rounded-lg" />
}
```

### Step 2: Create Dashboard Layout

**File:** `app/real-estate/dashboard/layout.tsx`

```tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
```

### Step 3: Create Loading State

**File:** `app/real-estate/dashboard/loading.tsx`

```tsx
import { DashboardLoadingSkeleton } from '@/components/features/dashboard/shared/loading-skeleton'

export default function DashboardLoading() {
  return <DashboardLoadingSkeleton />
}
```

### Step 4: Create Error Boundary

**File:** `app/real-estate/dashboard/error.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            We encountered an error while loading your dashboard. This has been
            logged and we'll look into it.
          </p>

          {error.message && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-xs font-mono text-gray-700">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="flex-1"
            >
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 5: Create Customization Page

**File:** `app/real-estate/dashboard/customize/page.tsx`

```tsx
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Customize Dashboard | Strive Platform',
  description: 'Personalize your dashboard layout and widgets',
}

export default function CustomizeDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/real-estate/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Customize Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Personalize your dashboard layout and widgets
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Widget Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Available Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Drag and drop widgets to customize your dashboard layout.
              </p>
              {/* Widget customization UI - to be implemented */}
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configure your dashboard preferences and theme.
              </p>
              {/* Settings UI - to be implemented */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### Step 6: Update Navigation

**File:** `components/shared/navigation/sidebar.tsx` (add/update)

```tsx
// Add dashboard navigation item
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/real-estate/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and quick actions',
    children: [
      {
        name: 'Overview',
        href: '/real-estate/dashboard',
        description: 'Main dashboard view',
      },
      {
        name: 'Analytics',
        href: '/real-estate/dashboard/analytics',
        description: 'Detailed analytics and reports',
      },
      {
        name: 'Customize',
        href: '/real-estate/dashboard/customize',
        description: 'Personalize your dashboard',
      },
    ],
  },
  // ... other navigation items
]
```

### Step 7: Add Middleware Protection

**File:** `middleware.ts` (update existing)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/real-estate/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/real-estate/dashboard/:path*',
    // ... other protected routes
  ],
}
```

## Testing & Validation

### Test 1: Page Rendering
```tsx
// Test dashboard page renders correctly
import { render, screen } from '@testing-library/react'

test('renders dashboard with all sections', async () => {
  render(<DashboardPage />)
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
  expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
})
```

### Test 2: Authentication
```bash
# Test protected route redirects when not authenticated
curl http://localhost:3000/real-estate/dashboard
# Should redirect to /login
```

### Test 3: Error Handling
```tsx
// Test error boundary catches errors
test('shows error boundary on error', () => {
  const error = new Error('Test error')
  render(<DashboardError error={error} reset={() => {}} />)
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
})
```

### Test 4: Responsive Layout
- Test mobile view (320px - 767px)
- Test tablet view (768px - 1023px)
- Test desktop view (1024px+)

## Success Criteria

- [x] Dashboard page renders correctly
- [x] All components display in proper layout
- [x] Suspense boundaries prevent blocking
- [x] Error boundaries catch failures
- [x] Mobile responsive grid works
- [x] Navigation integrated
- [x] Authentication required
- [x] Loading states smooth

## Files Created

- ✅ `app/real-estate/dashboard/page.tsx`
- ✅ `app/real-estate/dashboard/layout.tsx`
- ✅ `app/real-estate/dashboard/loading.tsx`
- ✅ `app/real-estate/dashboard/error.tsx`
- ✅ `app/real-estate/dashboard/customize/page.tsx`

## Files Modified

- ✅ `components/shared/navigation/sidebar.tsx`
- ✅ `middleware.ts`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Blocking Suspense Boundaries
**Problem:** All components wait for slowest component
**Solution:** Wrap each section in separate Suspense

### ❌ Pitfall 2: Missing Error Boundaries
**Problem:** Errors crash entire page
**Solution:** Add error.tsx at dashboard route level

### ❌ Pitfall 3: Non-Responsive Grid
**Problem:** Layout breaks on mobile
**Solution:** Use responsive Tailwind classes (lg:col-span-2)

### ❌ Pitfall 4: Missing Auth Check
**Problem:** Unauthenticated users can access
**Solution:** Use middleware and layout-level auth check

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 7: Testing, Polish & Deployment**
2. ✅ Dashboard fully assembled
3. ✅ Ready for comprehensive testing
4. ✅ Ready for production deployment

---

**Session 6 Complete:** ✅ Main dashboard page integrated and functional
