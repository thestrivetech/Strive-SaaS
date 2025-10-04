# Session 11: Production Configuration & Host-Based Routing

**Branch:** feature/single-app-migration
**Prerequisites:** Session 10 complete (website migration 97% complete)
**Estimated Time:** 2 hours
**Status:** ⚠️ PARTIAL COMPLETION (2025-09-30)

**Note:** Session 11 was redirected from "Admin Analytics Dashboard Implementation" to "Production Configuration" based on user guidance from `fix.md`. The HostDependent architecture was implemented to solve the "parallel pages" build error. Admin Analytics Dashboard moved to future session (Session 13+) after build is stable.

---

## 🎯 Primary Goals

1. Create admin layout with role-based authentication
2. Implement analytics dashboard page with data visualization
3. Implement performance dashboard page with Web Vitals metrics
4. Add source filtering (website/saas/all) and timeframe selection
5. Test admin authentication and data retrieval

---

## 📋 Session Prerequisites Check

- [ ] Session 10 is complete (chatbot-sai converted, analytics architecture documented)
- [ ] Public analytics API routes exist (`/api/analytics/*`)
- [ ] Admin analytics API routes exist (`/api/admin/analytics/*`)
- [ ] Database has PageView, UserSession, AnalyticsEvent, WebVitalsMetric models
- [ ] Website analytics tracker is sending data with `source: 'website'`
- [ ] Dev server running without errors
- [ ] Branch checked out (main or new feature branch)

---

## 🚀 SESSION 11 START PROMPT

```
I need to implement Phase 5 of the analytics migration: Admin Dashboard UI pages.

Please read the following files in order:
1. /Users/grant/Documents/GitHub/Strive-SaaS/CLAUDE.md - Project rules
2. /Users/grant/Documents/GitHub/Strive-SaaS/chat-logs/analytics-migration-progress.md - Analytics architecture
3. /Users/grant/Documents/GitHub/Strive-SaaS/app/MIGRATION_SESSIONS.md (Session 10) - Latest session details
4. /Users/grant/Documents/GitHub/Strive-SaaS/chat-logs/old-site-updates/session11.md - This file

Create admin dashboard pages for analytics and performance monitoring with:
- Role-based authentication (ADMIN only)
- Source filtering (website/saas/all)
- Timeframe selection (1d/7d/30d/90d)
- Real-time data updates
- Charts and visualizations

Follow the detailed plan in session11.md.
```

---

## Part 1: Admin Layout with Authentication (45 min)

### Step 1.1: Create Admin Layout (20 min)

**File:** `app/(platform)/admin/layout.tsx`

**Requirements:**
- Server Component (no "use client")
- Check authentication with Supabase
- Verify user role is ADMIN
- Redirect non-admin users to /dashboard
- Add admin navigation sidebar
- Include breadcrumbs for navigation

**Implementation:**
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminNav from '@/components/admin/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Check if user is admin
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminNav />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

**Styling:** Use platform dashboard styles (consistent with existing dashboard)

---

### Step 1.2: Create Admin Navigation Component (25 min)

**File:** `app/components/admin/admin-nav.tsx`

**Requirements:**
- Server Component or Client Component (if needs active state)
- Navigation links: Dashboard, Analytics, Performance, Settings
- Active state indication
- User info display
- Logout button

**Features:**
- Link to `/admin` (overview)
- Link to `/admin/analytics` (analytics dashboard)
- Link to `/admin/performance` (performance dashboard)
- Back to main dashboard link
- User avatar/name
- Admin badge

---

## Part 2: Analytics Dashboard Page (90 min)

### Step 2.1: Create Analytics Dashboard Layout (15 min)

**File:** `app/(platform)/admin/analytics/page.tsx`

**Requirements:**
- Client Component ("use client" - needs state for filters)
- Import data fetching from admin API
- State management for filters and data
- Loading states
- Error handling

**Basic Structure:**
```typescript
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AnalyticsSummary from '@/components/admin/analytics-summary';
import TopPages from '@/components/admin/top-pages';
import TrafficSources from '@/components/admin/traffic-sources';
import DeviceBreakdown from '@/components/admin/device-breakdown';

export default function AnalyticsDashboard() {
  const [source, setSource] = useState<'all' | 'website' | 'saas'>('all');
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [source, timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/analytics/dashboard?source=${source}&timeframe=${timeframe}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Unified analytics for website and SaaS application
          </p>
        </div>
        <div className="flex gap-4">
          {/* Source filter */}
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website Only</SelectItem>
              <SelectItem value="saas">SaaS App Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Timeframe filter */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dashboard content */}
      {loading ? (
        <div>Loading...</div>
      ) : data ? (
        <>
          <AnalyticsSummary data={data.summary} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopPages pages={data.topPages} />
            <TrafficSources sources={data.trafficSources} />
          </div>
          <DeviceBreakdown devices={data.deviceBreakdown} />
        </>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
}
```

---

### Step 2.2: Create Analytics Summary Component (20 min)

**File:** `app/components/admin/analytics-summary.tsx`

**Requirements:**
- Display 4 key metrics in cards:
  - Total Page Views
  - Unique Sessions
  - Average Session Duration
  - Bounce Rate
- Show trend indicators (up/down from previous period)
- Use Card components from shadcn/ui

**Design:**
- 4 cards in a grid (2x2 on mobile, 1x4 on desktop)
- Large number for metric value
- Small text for metric name
- Icon for each metric (Eye, Users, Clock, TrendingDown)
- Color coding: green for good, red for bad

---

### Step 2.3: Create Top Pages Component (15 min)

**File:** `app/components/admin/top-pages.tsx`

**Requirements:**
- Display table of top 10 pages by views
- Columns: Page path, Page title, View count
- Sortable by view count
- Click to view details (future enhancement)

**Data Structure:**
```typescript
interface TopPage {
  path: string;
  title: string;
  views: number;
}
```

---

### Step 2.4: Create Traffic Sources Component (15 min)

**File:** `app/components/admin/traffic-sources.tsx`

**Requirements:**
- Display pie chart or bar chart of traffic sources
- Show: Direct, Organic Search, Referral, Social, Email, Paid
- Percentage breakdown
- Total visits per source

**Chart Library:** Use recharts (already in dependencies) or shadcn charts

---

### Step 2.5: Create Device Breakdown Component (15 min)

**File:** `app/components/admin/device-breakdown.tsx`

**Requirements:**
- Display bar chart of device types
- Show: Desktop, Mobile, Tablet
- Percentage and count for each
- Responsive design

---

### Step 2.6: Add Real-time Indicator (10 min)

**File:** Update `app/(platform)/admin/analytics/page.tsx`

**Requirements:**
- Add polling for real-time updates (every 30 seconds)
- Display "Live" indicator when data is fresh
- Show last updated timestamp
- Option to pause auto-refresh

**Implementation:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (!paused) {
      fetchAnalytics();
    }
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [paused, source, timeframe]);
```

---

## Part 3: Performance Dashboard Page (60 min)

### Step 3.1: Create Performance Dashboard Layout (15 min)

**File:** `app/(platform)/admin/performance/page.tsx`

**Requirements:**
- Client Component ("use client")
- Similar filter UI as analytics dashboard
- Fetch from `/api/admin/analytics/performance`
- Display Core Web Vitals metrics

**Metrics to Display:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

---

### Step 3.2: Create Web Vitals Metric Cards (20 min)

**File:** `app/components/admin/web-vitals-cards.tsx`

**Requirements:**
- Display 5 metric cards (LCP, FID, CLS, FCP, TTFB)
- Show average value
- Show rating (Good/Needs Improvement/Poor)
- Color coding: green/yellow/red
- Show count of each rating category
- Progress bar for rating distribution

**Rating Thresholds (Core Web Vitals):**
- **LCP:** Good < 2.5s, Needs Improvement < 4s, Poor >= 4s
- **FID:** Good < 100ms, Needs Improvement < 300ms, Poor >= 300ms
- **CLS:** Good < 0.1, Needs Improvement < 0.25, Poor >= 0.25
- **FCP:** Good < 1.8s, Needs Improvement < 3s, Poor >= 3s
- **TTFB:** Good < 800ms, Needs Improvement < 1800ms, Poor >= 1800ms

---

### Step 3.3: Create Performance Insights Component (15 min)

**File:** `app/components/admin/performance-insights.tsx`

**Requirements:**
- Display recommendations based on metrics
- Show pages with poor performance
- Suggest optimizations
- Link to detailed page-level analysis

**Example Insights:**
- "12% of pages have poor LCP - consider image optimization"
- "FID is excellent across all pages - great job!"
- "3 pages have high CLS - check for layout shifts"

---

### Step 3.4: Create Performance Score Component (10 min)

**File:** `app/components/admin/performance-score.tsx`

**Requirements:**
- Calculate overall performance score (0-100)
- Display as large circular progress indicator
- Color gradient: red → yellow → green
- Show breakdown by metric

**Score Calculation:**
```typescript
// Weight each metric
const weights = {
  LCP: 0.25,
  FID: 0.25,
  CLS: 0.25,
  FCP: 0.15,
  TTFB: 0.10,
};

// Convert rating to score (good=100, needs improvement=50, poor=0)
// Calculate weighted average
```

---

## Part 4: Testing & Polish (30 min)

### Step 4.1: Manual Testing (15 min)

**Test Checklist:**
- [ ] Non-admin user cannot access `/admin/*` routes (redirects to /dashboard)
- [ ] Admin user can access all admin pages
- [ ] Source filter works (all/website/saas)
- [ ] Timeframe filter works (1d/7d/30d/90d)
- [ ] Analytics data displays correctly
- [ ] Performance metrics display correctly
- [ ] Real-time updates work (if implemented)
- [ ] Charts render properly
- [ ] Mobile responsive design works
- [ ] Navigation between admin pages works

---

### Step 4.2: Edge Cases (10 min)

**Test Scenarios:**
- [ ] No data available (empty state)
- [ ] API error handling (network failure)
- [ ] Loading states display correctly
- [ ] Large numbers format correctly (1,234,567)
- [ ] Percentages round correctly
- [ ] Session timeout redirects to login

---

### Step 4.3: Polish & Refinement (5 min)

- [ ] Add loading skeletons
- [ ] Add empty state illustrations
- [ ] Add tooltips for metrics
- [ ] Add export button (CSV/PDF) - optional
- [ ] Add date range picker - optional
- [ ] Add comparison mode (compare time periods) - optional

---

## ✅ Success Criteria

### Must Have:
- [ ] Admin layout created with role-based auth
- [ ] Analytics dashboard displays all 4 key metrics
- [ ] Top pages, traffic sources, device breakdown charts
- [ ] Performance dashboard displays all 5 Web Vitals
- [ ] Source filter works (all/website/saas)
- [ ] Timeframe filter works (1d/7d/30d/90d)
- [ ] Non-admin users redirected
- [ ] Zero TypeScript errors in new code
- [ ] Mobile responsive design

### Nice to Have:
- [ ] Real-time updates (polling)
- [ ] Export functionality
- [ ] Performance insights/recommendations
- [ ] Comparison mode
- [ ] Page-level drill-down

---

## 📊 Expected Files Structure After Session

```
app/
├── (platform)/
│   └── admin/
│       ├── layout.tsx                    # Admin layout with auth
│       ├── page.tsx                      # Admin overview (optional)
│       ├── analytics/
│       │   └── page.tsx                  # Analytics dashboard
│       └── performance/
│           └── page.tsx                  # Performance dashboard
│
components/
├── admin/
│   ├── admin-nav.tsx                     # Admin navigation sidebar
│   ├── analytics-summary.tsx            # 4 key metrics cards
│   ├── top-pages.tsx                     # Top pages table
│   ├── traffic-sources.tsx              # Traffic sources chart
│   ├── device-breakdown.tsx             # Device breakdown chart
│   ├── web-vitals-cards.tsx             # Web Vitals metric cards
│   ├── performance-insights.tsx         # Performance recommendations
│   └── performance-score.tsx            # Overall performance score
```

---

## ⚠️ Important Notes

### Authentication:
- Use Supabase server-side auth in layout.tsx (Server Component)
- Check user role from database (not from JWT - can be tampered)
- Always verify role on every admin page load

### API Integration:
- **Endpoint:** `/api/admin/analytics/dashboard?source={source}&timeframe={timeframe}`
- **Response:** See analytics-migration-progress.md for full schema
- **Error handling:** Display user-friendly message, log to console

### Data Source Field:
- **Values:** `"website"`, `"saas"`, or `null` (for all)
- **Query param:** `?source=all` means no filter, returns both
- **Query param:** `?source=website` filters to website only
- **Query param:** `?source=saas` filters to SaaS app only

### Performance:
- Use React Query or SWR for data fetching (optional, if already in dependencies)
- Implement loading skeletons for better UX
- Cache API responses (stale-while-revalidate strategy)
- Consider server-side rendering for initial data (RSC pattern)

### Security:
- All admin API routes already have auth middleware
- Double-check role verification in layout.tsx
- Never expose sensitive data in client-side code
- Use environment variables for API URLs (if needed)

---

## 🐛 Potential Issues & Solutions

### Issue 1: "Cannot find module '@/components/admin/...'"
**Solution:** Create the components directory first: `mkdir -p app/components/admin`

### Issue 2: TypeScript error on Prisma user.role
**Solution:** Ensure Prisma schema has `role` field on User model:
```prisma
model User {
  id    String @id @default(uuid())
  role  String @default("USER") // "USER" | "ADMIN"
  // ... other fields
}
```

### Issue 3: API returns 403 Forbidden
**Solution:**
1. Verify user is logged in (check Supabase session)
2. Verify user has ADMIN role in database
3. Check middleware.ts has admin route protection

### Issue 4: Charts not rendering
**Solution:**
1. Install recharts if not already: `npm install recharts`
2. Import Chart components correctly
3. Ensure data format matches chart expectations

### Issue 5: Real-time updates cause memory leak
**Solution:** Clean up intervals in useEffect return function

---

## 🎯 Time Breakdown

| Task | Estimated Time |
|------|---------------|
| Admin layout & auth | 45 min |
| Analytics dashboard | 90 min |
| Performance dashboard | 60 min |
| Testing & polish | 30 min |
| **Total** | **3-4 hours** |

---

## 📚 Reference Documentation

**Must Read Before Starting:**
1. `chat-logs/analytics-migration-progress.md` - API routes, database schema, architecture
2. `app/MIGRATION_SESSIONS.md` (Session 10) - Analytics architecture diagrams
3. `app/(platform)/dashboard/page.tsx` - Example of platform dashboard layout
4. `app/middleware.ts` - Auth middleware and admin route protection

**API Endpoints:**
- `/api/admin/analytics/dashboard` - Aggregated analytics data
- `/api/admin/analytics/realtime` - Real-time activity (last 30 min)
- `/api/admin/analytics/performance` - Web Vitals metrics

**Prisma Models:**
- PageView - Page view tracking
- UserSession - Session tracking
- AnalyticsEvent - Event tracking
- WebVitalsMetric - Core Web Vitals

---

## 🎊 Session 11 Goals

**Primary Deliverable:** Fully functional admin analytics and performance dashboards with role-based authentication, source filtering, and timeframe selection.

**Secondary Goals:**
- Beautiful, responsive UI matching platform design
- Real-time or near-real-time data updates
- Clear visualizations (charts, graphs, metrics cards)
- Performance insights and recommendations

**Success Metric:** Admin users can view unified analytics from both website and SaaS app in a single dashboard interface.

---

**Ready to start? Copy the SESSION 11 START PROMPT above and let's build the admin dashboards!**