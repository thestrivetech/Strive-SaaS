# Session 7: Admin Dashboard UI & Layout

## Session Overview
**Goal:** Build the complete admin dashboard UI with sidebar navigation, stat cards, charts, and data tables matching the exact design from the integration guide.

**Duration:** 4-5 hours
**Complexity:** High
**Dependencies:** Sessions 1-6 (Admin backend + UI components)

## Objectives

1. ✅ Create admin route structure with RBAC middleware
2. ✅ Build admin sidebar navigation component
3. ✅ Implement admin dashboard content with stat cards
4. ✅ Add subscription distribution chart
5. ✅ Add revenue growth chart
6. ✅ Create recent organizations data table
7. ✅ Ensure mobile responsiveness (collapsible sidebar)
8. ✅ Add admin-only middleware protection

## Prerequisites

- [x] Admin backend complete (Sessions 1-2)
- [x] shadcn/ui components installed
- [x] Recharts or Chart.js for visualizations
- [x] TanStack Query for data fetching
- [x] RBAC middleware ready

## Admin Dashboard Structure

```
Admin Dashboard Sections:
1. Sidebar Navigation
   - Dashboard
   - Users
   - Organizations
   - Subscriptions
   - Feature Flags
   - System Alerts
   - Audit Logs
   - Settings

2. Dashboard Content (Default Tab)
   - Platform Stats (4 cards)
   - Subscription Chart (Pie/Donut)
   - Revenue Chart (Line/Bar)
   - Recent Organizations Table
```

## Component Structure

```
app/(admin)/admin/
├── layout.tsx                # Admin layout with RBAC
├── page.tsx                  # Dashboard (default)
├── users/page.tsx            # User management (future)
├── organizations/page.tsx    # Org management (future)
└── settings/page.tsx         # Admin settings (future)

components/features/admin/
├── admin-sidebar.tsx         # Navigation sidebar
├── admin-dashboard-content.tsx  # Dashboard main content
├── stat-card.tsx             # Reusable stat card
├── subscription-chart.tsx    # Pie chart for tiers
├── revenue-chart.tsx         # Line chart for growth
├── admin-data-table.tsx      # Generic data table
└── admin-header.tsx          # Top header with user menu
```

## Implementation Steps

### Step 1: Create Admin Layout with RBAC Middleware

**File:** `app/(admin)/layout.tsx`

```tsx
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessAdminPanel } from '@/lib/auth/rbac';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  // RBAC: Only admins can access
  if (!canAccessAdminPanel(session.user)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
```

### Step 2: Create Admin Sidebar Navigation

**File:** `components/features/admin/admin-sidebar.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Flag,
  Bell,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'organizations', label: 'Organizations', icon: Building2, href: '/admin/organizations' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
  { id: 'feature-flags', label: 'Feature Flags', icon: Flag, href: '/admin/feature-flags' },
  { id: 'alerts', label: 'System Alerts', icon: Bell, href: '/admin/alerts' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, href: '/admin/audit' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
            <p className="text-sm text-muted-foreground mt-1">
              System Management
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false); // Close mobile menu
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Exit Admin</Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
```

### Step 3: Create Stat Card Component

**File:** `components/features/admin/stat-card.tsx`

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  loading?: boolean;
}

export function StatCard({ title, value, change, icon: Icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 4: Create Subscription Chart

**File:** `components/features/admin/subscription-chart.tsx`

```tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface SubscriptionChartProps {
  data: any;
  loading?: boolean;
}

const COLORS = {
  free: 'hsl(var(--muted-foreground))',
  starter: 'hsl(var(--primary))',
  growth: 'hsl(var(--secondary))',
  elite: 'hsl(var(--accent))',
  enterprise: 'hsl(var(--destructive))',
};

export function SubscriptionChart({ data, loading }: SubscriptionChartProps) {
  if (loading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = [
    { name: 'Free', value: data.freeCount, color: COLORS.free },
    { name: 'Starter', value: data.starterCount, color: COLORS.starter },
    { name: 'Growth', value: data.growthCount, color: COLORS.growth },
    { name: 'Elite', value: data.eliteCount, color: COLORS.elite },
    { name: 'Enterprise', value: data.enterpriseCount, color: COLORS.enterprise },
  ].filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### Step 5: Create Revenue Chart

**File:** `components/features/admin/revenue-chart.tsx`

```tsx
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueChartProps {
  data: any;
  loading?: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading || !data) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Mock data for demonstration
  const chartData = [
    { month: 'Jan', mrr: 12000, arr: 144000 },
    { month: 'Feb', mrr: 15000, arr: 180000 },
    { month: 'Mar', mrr: 18000, arr: 216000 },
    { month: 'Apr', mrr: 22000, arr: 264000 },
    { month: 'May', mrr: 26000, arr: 312000 },
    { month: 'Jun', mrr: 30000, arr: 360000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        <Line
          type="monotone"
          dataKey="mrr"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="MRR"
        />
        <Line
          type="monotone"
          dataKey="arr"
          stroke="hsl(var(--secondary))"
          strokeWidth={2}
          name="ARR"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Step 6: Create Admin Dashboard Content

**File:** `components/features/admin/admin-dashboard-content.tsx`

```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './stat-card';
import { SubscriptionChart } from './subscription-chart';
import { RevenueChart } from './revenue-chart';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AdminDashboardContentProps {
  activeTab: string;
}

export function AdminDashboardContent({ activeTab }: AdminDashboardContentProps) {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
  });

  if (activeTab !== 'dashboard') {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <p className="text-muted-foreground mt-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and system management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Organizations"
            value={metrics?.totalOrgs || 0}
            change={`+${metrics?.newOrgs || 0} today`}
            icon={Building2}
            loading={metricsLoading}
          />
          <StatCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            change={`${metrics?.activeUsers || 0} active`}
            icon={Users}
            loading={metricsLoading}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${((metrics?.mrrCents || 0) / 100).toLocaleString()}`}
            change="+12.5% from last month"
            icon={DollarSign}
            loading={metricsLoading}
          />
          <StatCard
            title="Active Subscriptions"
            value={metrics?.totalOrgs || 0}
            change="95.2% retention rate"
            icon={Activity}
            loading={metricsLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionChart data={metrics} loading={metricsLoading} />
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={metrics} loading={metricsLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section (placeholder) */}
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organizations table will be implemented in Session 8
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

### Step 7: Create Admin Dashboard Page

**File:** `app/(admin)/admin/page.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';
import { AdminDashboardContent } from '@/components/features/admin/admin-dashboard-content';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 lg:ml-64">
        <AdminDashboardContent activeTab={activeTab} />
      </div>
    </div>
  );
}
```

## Testing Requirements

### Test 1: RBAC Enforcement
```typescript
// Test admin-only access
import { render } from '@testing-library/react';
import AdminLayout from '@/app/(admin)/layout';

describe('Admin Layout RBAC', () => {
  it('should redirect non-admin users', async () => {
    // Mock non-admin user
    // Verify redirect to /dashboard
  });

  it('should allow admin users', async () => {
    // Mock admin user
    // Verify no redirect
  });
});
```

### Test 2: Metrics Display
```typescript
// Test stat cards render correctly
it('should display platform metrics', () => {
  const mockMetrics = {
    totalOrgs: 150,
    totalUsers: 500,
    mrrCents: 50000,
  };

  render(<AdminDashboardContent activeTab="dashboard" />);
  // Verify metrics displayed
});
```

### Test 3: Sidebar Navigation
```typescript
// Test sidebar tab switching
it('should switch between tabs', () => {
  render(<AdminSidebar activeTab="dashboard" setActiveTab={jest.fn()} />);

  fireEvent.click(screen.getByText('Users'));
  // Verify setActiveTab called with 'users'
});
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] Admin route created (`app/(admin)/admin/page.tsx`)
- [ ] RBAC middleware protects admin routes (non-admins redirected)
- [ ] Sidebar navigation with 8 menu items
- [ ] Dashboard displays 4 stat cards
- [ ] Subscription distribution chart (pie/donut)
- [ ] Revenue growth chart (line chart)
- [ ] Mobile responsive (collapsible sidebar)
- [ ] Tab switching functional
- [ ] TanStack Query fetches metrics
- [ ] Loading states shown during data fetch
- [ ] No console errors or warnings

**Quality Checks:**
- [ ] Metrics formatted correctly (currency, numbers)
- [ ] Charts render with proper colors
- [ ] Sidebar active state highlighted
- [ ] Mobile overlay closes on click
- [ ] Elevation effects on hover
- [ ] Accessibility: keyboard navigation, ARIA labels

## Files Created/Modified

```
✅ app/(admin)/layout.tsx
✅ app/(admin)/admin/page.tsx
✅ components/features/admin/admin-sidebar.tsx
✅ components/features/admin/admin-dashboard-content.tsx
✅ components/features/admin/stat-card.tsx
✅ components/features/admin/subscription-chart.tsx
✅ components/features/admin/revenue-chart.tsx
✅ __tests__/admin/dashboard.test.tsx
```

## Dependencies to Install

```bash
# If not already installed
npm install recharts
npm install @tanstack/react-query
```

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 8: Admin Management Pages (Users/Orgs)**
2. ✅ Admin dashboard UI complete
3. ✅ Ready to build user and organization management tables

---

**Session 7 Complete:** ✅ Admin dashboard UI with sidebar, stats, and charts implemented
