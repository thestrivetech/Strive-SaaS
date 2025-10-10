# Session 10: Main Dashboard Assembly & Routing

## Session Overview
**Goal:** Assemble all REID components into the main dashboard page and configure routing within the platform.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 9 (All components complete)

## Objectives

1. ✅ Create main REID dashboard page
2. ✅ Configure routing structure
3. ✅ Implement dashboard layout with all 8 modules
4. ✅ Add navigation integration
5. ✅ Create individual module pages
6. ✅ Add breadcrumbs and navigation
7. ✅ Implement loading and error states

## Route Structure

```
app/real-estate/reid/
├── dashboard/
│   └── page.tsx            # Main REID dashboard
├── heatmap/
│   └── page.tsx            # Dedicated heatmap page
├── demographics/
│   └── page.tsx            # Demographics analysis
├── schools/
│   └── page.tsx            # Schools & amenities
├── trends/
│   └── page.tsx            # Trends analysis
├── roi/
│   └── page.tsx            # ROI simulator
├── ai-profiles/
│   └── page.tsx            # AI profiles
├── alerts/
│   └── page.tsx            # Alerts management
├── reports/
│   └── page.tsx            # Reports & export
└── layout.tsx              # REID layout wrapper
```

## Implementation Steps

### Step 1: Create REID Layout

#### File: `app/real-estate/reid/layout.tsx`
```tsx
import { ReactNode } from 'react';

interface REIDLayoutProps {
  children: ReactNode;
}

export default function REIDLayout({ children }: REIDLayoutProps) {
  return (
    <div className="reid-theme min-h-screen">
      {children}
    </div>
  );
}
```

### Step 2: Create Main Dashboard Page

#### File: `app/real-estate/reid/dashboard/page.tsx`
```tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { MarketHeatmap } from '@/components/real-estate/reid/maps/MarketHeatmap';
import { DemographicsPanel } from '@/components/real-estate/reid/analytics/DemographicsPanel';
import { TrendsChart } from '@/components/real-estate/reid/charts/TrendsChart';
import { ROISimulator } from '@/components/real-estate/reid/analytics/ROISimulator';
import { AlertsPanel } from '@/components/real-estate/reid/alerts/AlertsPanel';
import { ChartSkeleton, MetricCardSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'REID Dashboard | Strive Platform',
  description: 'Real Estate Intelligence Dashboard - Market analytics, demographics, and investment tools'
};

export default function REIDDashboard() {
  return (
    <div className="min-h-screen reid-theme">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                REID Dashboard
              </h1>
              <p className="text-sm text-slate-400">
                Real Estate Intelligence & Analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Maps & Demographics */}
          <div className="xl:col-span-2 space-y-6">
            <Suspense fallback={<ChartSkeleton />}>
              <MarketHeatmap />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <DemographicsPanel />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <TrendsChart />
            </Suspense>
          </div>

          {/* Middle Column - ROI & Analytics */}
          <div className="xl:col-span-1 space-y-6">
            <Suspense fallback={<MetricCardSkeleton />}>
              <ROISimulator />
            </Suspense>
          </div>

          {/* Right Column - Alerts & AI */}
          <div className="xl:col-span-1 space-y-6">
            <Suspense fallback={<ChartSkeleton />}>
              <AlertsPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create Individual Module Pages

#### File: `app/real-estate/reid/heatmap/page.tsx`
```tsx
import { Suspense } from 'react';
import { MarketHeatmap } from '@/components/real-estate/reid/maps/MarketHeatmap';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';

export default function HeatmapPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Market Heatmap</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <MarketHeatmap />
      </Suspense>
    </div>
  );
}
```

#### File: `app/real-estate/reid/alerts/page.tsx`
```tsx
import { Suspense } from 'react';
import { AlertsPanel } from '@/components/real-estate/reid/alerts/AlertsPanel';
import { AlertTriggersList } from '@/components/real-estate/reid/alerts/AlertTriggersList';
import { ChartSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';

export default function AlertsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Property Alerts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <AlertsPanel />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <AlertTriggersList />
        </Suspense>
      </div>
    </div>
  );
}
```

#### File: `app/real-estate/reid/roi/page.tsx`
```tsx
import { Suspense } from 'react';
import { ROISimulator } from '@/components/real-estate/reid/analytics/ROISimulator';
import { MetricCardSkeleton } from '@/components/real-estate/reid/shared/REIDSkeleton';

export default function ROIPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">ROI Investment Simulator</h1>
      <Suspense fallback={<MetricCardSkeleton />}>
        <ROISimulator />
      </Suspense>
    </div>
  );
}
```

### Step 4: Update Navigation

#### File: `components/shared/navigation/Sidebar.tsx` (update existing)
```tsx
// Add to existing navigation items
const navigationItems = [
  // ... existing items
  {
    name: 'REID Dashboard',
    href: '/real-estate/reid/dashboard',
    icon: BarChart3,
    badge: 'ELITE',
    children: [
      { name: 'Dashboard', href: '/real-estate/reid/dashboard' },
      { name: 'Market Heatmap', href: '/real-estate/reid/heatmap' },
      { name: 'Demographics', href: '/real-estate/reid/demographics' },
      { name: 'Trends Analysis', href: '/real-estate/reid/trends' },
      { name: 'ROI Simulator', href: '/real-estate/reid/roi' },
      { name: 'AI Profiles', href: '/real-estate/reid/ai-profiles' },
      { name: 'Alerts', href: '/real-estate/reid/alerts' },
      { name: 'Reports', href: '/real-estate/reid/reports' },
    ]
  }
];
```

### Step 5: Add Middleware Protection

#### File: `middleware.ts` (update existing)
```typescript
// Add REID routes to protected paths
export async function middleware(req: NextRequest) {
  const session = await getSession(req);

  // REID Dashboard - Elite tier only
  if (req.nextUrl.pathname.startsWith('/real-estate/reid')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (!canAccessREID(session.user)) {
      return NextResponse.redirect(new URL('/real-estate/dashboard', req.url));
    }

    if (!canAccessFeature(session.user, 'reid-full')) {
      // Redirect to upgrade page
      return NextResponse.redirect(new URL('/settings/billing?upgrade=reid', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/real-estate/reid/:path*',
    // ... other protected routes
  ]
};
```

### Step 6: Create Breadcrumb Component

#### File: `components/real-estate/reid/shared/REIDBreadcrumb.tsx`
```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function REIDBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return { href, label };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
      <Link href="/real-estate/dashboard" className="hover:text-cyan-400">
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-white font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-cyan-400">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
```

## Testing & Validation

### Test 1: Routing
```bash
# Verify all routes are accessible
# /real-estate/reid/dashboard
# /real-estate/reid/heatmap
# /real-estate/reid/alerts
# etc.
```

### Test 2: Access Control
```typescript
// Test that REID routes redirect non-Elite users
// Test that unauthenticated users redirect to login
```

### Test 3: Dashboard Layout
```bash
# Verify 8 modules load correctly
# Test responsive grid layout
# Verify dark theme applied
```

## Success Criteria

- [x] Main dashboard page assembled
- [x] All 8 modules integrated
- [x] Routing structure configured
- [x] Navigation updated
- [x] Middleware protection in place
- [x] Breadcrumbs functional
- [x] Loading states implemented
- [x] Mobile responsive layout

## Files Created

- ✅ `app/real-estate/reid/layout.tsx`
- ✅ `app/real-estate/reid/dashboard/page.tsx`
- ✅ `app/real-estate/reid/heatmap/page.tsx`
- ✅ `app/real-estate/reid/alerts/page.tsx`
- ✅ `app/real-estate/reid/roi/page.tsx`
- ✅ `components/real-estate/reid/shared/REIDBreadcrumb.tsx`

## Files Modified

- ✅ `components/shared/navigation/Sidebar.tsx`
- ✅ `middleware.ts`

## Next Steps

1. ✅ Proceed to **Session 11: Testing & Quality Assurance**
2. ✅ Dashboard fully assembled
3. ✅ Ready for comprehensive testing
4. ✅ All features integrated

---

**Session 10 Complete:** ✅ Main dashboard assembly and routing configured
