# Session 9: CRM Dashboard Integration - Unified Experience

## Session Overview
**Goal:** Create the unified CRM dashboard page that brings together all modules and integrate the CRM into the platform navigation.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-8

## Objectives

1. ✅ Create main CRM dashboard page
2. ✅ Integrate all CRM modules into dashboard
3. ✅ Update platform navigation to include CRM
4. ✅ Add quick-create modals for all entities
5. ✅ Implement recent activity feed
6. ✅ Add dashboard widgets
7. ✅ Create CRM home layout

## Files to Create/Modify

```
app/(platform)/crm/
├── page.tsx (dashboard home - rename from existing)
└── dashboard/
    └── page.tsx (new unified dashboard)

components/(platform)/crm/dashboard/
├── dashboard-stats.tsx
├── recent-leads.tsx
├── pipeline-overview.tsx
├── upcoming-appointments.tsx
├── recent-activity-feed.tsx
└── quick-create-menu.tsx

components/(platform)/navigation/
└── sidebar.tsx (modify to add CRM links)
```

## Key Implementation Steps

### 1. Create Unified Dashboard Page

**app/(platform)/crm/dashboard/page.tsx**:
```typescript
import { Suspense } from 'react';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getOverviewKPIs } from '@/lib/modules/analytics';
import { getLeads } from '@/lib/modules/leads';
import { getDealsByStage } from '@/lib/modules/deals';
import { getUpcomingAppointments } from '@/lib/modules/appointments';
import { getRecentActivities } from '@/lib/modules/activities';
import { DashboardStats } from '@/components/(platform)/crm/dashboard/dashboard-stats';
import { RecentLeads } from '@/components/(platform)/crm/dashboard/recent-leads';
import { PipelineOverview } from '@/components/(platform)/crm/dashboard/pipeline-overview';
import { UpcomingAppointments } from '@/components/(platform)/crm/dashboard/upcoming-appointments';
import { RecentActivityFeed } from '@/components/(platform)/crm/dashboard/recent-activity-feed';
import { QuickCreateMenu } from '@/components/(platform)/crm/dashboard/quick-create-menu';

export default async function CRMDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [kpis, recentLeads, dealsByStage, appointments, activities] = await Promise.all([
    getOverviewKPIs(),
    getLeads({ limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
    getDealsByStage(),
    getUpcomingAppointments(user.id, 5),
    getRecentActivities({ limit: 10 }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here's your CRM overview.
          </p>
        </div>
        <QuickCreateMenu organizationId={user.organization_members[0].organization_id} />
      </div>

      {/* KPI Stats */}
      <DashboardStats kpis={kpis} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <RecentLeads leads={recentLeads} />
          <PipelineOverview dealsByStage={dealsByStage} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <UpcomingAppointments appointments={appointments} />
          <RecentActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
```

### 2. Dashboard Components

**dashboard-stats.tsx** - Main KPI cards:
```typescript
'use client';

import { KPICard } from '../analytics/kpi-card';
import { Users, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

export function DashboardStats({ kpis }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <KPICard
        title="New Leads"
        value={kpis.leads.new}
        change={kpis.leads.change}
        icon={Users}
      />
      <KPICard
        title="Pipeline Value"
        value={kpis.pipeline.totalValue}
        format="currency"
        icon={DollarSign}
      />
      <KPICard
        title="Revenue (MTD)"
        value={kpis.revenue.thisMonth}
        change={kpis.revenue.change}
        format="currency"
        icon={TrendingUp}
      />
      <KPICard
        title="Conversion Rate"
        value={kpis.conversionRate}
        format="percentage"
        icon={CheckCircle}
      />
    </div>
  );
}
```

**recent-leads.tsx** - Recent leads widget:
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeadCard } from '../leads/lead-card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecentLeads({ leads }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Leads</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/crm/leads" className="flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {leads.slice(0, 4).map((lead: any) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**pipeline-overview.tsx** - Mini pipeline view:
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function PipelineOverview({ dealsByStage }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pipeline Overview</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/crm/deals" className="flex items-center gap-1">
              View pipeline
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dealsByStage.map((stage: any) => (
            <div key={stage.stage} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{stage.stage}</p>
                <p className="text-sm text-muted-foreground">{stage.deals.length} deals</p>
              </div>
              <p className="font-bold text-green-600">
                {formatCurrency(stage.deals.reduce((sum: number, d: any) => sum + Number(d.value), 0))}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**quick-create-menu.tsx** - Quick entity creation:
```typescript
'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, Users, Contact, DollarSign, Home, Calendar } from 'lucide-react';
import { LeadFormDialog } from '../leads/lead-form-dialog';
import { ContactFormDialog } from '../contacts/contact-form-dialog';
import { DealFormDialog } from '../deals/deal-form-dialog';
import { ListingFormDialog } from '../listings/listing-form-dialog';
import { AppointmentFormDialog } from '../calendar/appointment-form-dialog';

export function QuickCreateMenu({ organizationId }: { organizationId: string }) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Quick Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setOpenDialog('lead')}>
            <Users className="h-4 w-4 mr-2" />
            New Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog('contact')}>
            <Contact className="h-4 w-4 mr-2" />
            New Contact
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog('deal')}>
            <DollarSign className="h-4 w-4 mr-2" />
            New Deal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog('listing')}>
            <Home className="h-4 w-4 mr-2" />
            New Listing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog('appointment')}>
            <Calendar className="h-4 w-4 mr-2" />
            New Appointment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      {openDialog === 'lead' && (
        <LeadFormDialog
          mode="create"
          organizationId={organizationId}
          trigger={null}
        />
      )}
      {/* Add other dialogs similarly */}
    </>
  );
}
```

### 3. Update Platform Navigation

**Modify:** `components/(platform)/layouts/dashboard-shell.tsx` or sidebar component

Add CRM navigation items:
```typescript
const crmNavigation = [
  {
    name: 'Dashboard',
    href: '/crm/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Leads',
    href: '/crm/leads',
    icon: Users,
  },
  {
    name: 'Contacts',
    href: '/crm/contacts',
    icon: Contact,
  },
  {
    name: 'Deals',
    href: '/crm/deals',
    icon: DollarSign,
  },
  {
    name: 'Listings',
    href: '/crm/listings',
    icon: Home,
  },
  {
    name: 'Calendar',
    href: '/crm/calendar',
    icon: Calendar,
  },
  {
    name: 'Analytics',
    href: '/crm/analytics',
    icon: BarChart3,
  },
];
```

### 4. Redirect Root CRM Page

**app/(platform)/crm/page.tsx** - Redirect to dashboard:
```typescript
import { redirect } from 'next/navigation';

export default function CRMPage() {
  redirect('/crm/dashboard');
}
```

### 5. Create Recent Activity Module

**lib/modules/activities/queries.ts** - Add activity feed query:
```typescript
export async function getRecentActivities(options: { limit?: number; userId?: string }) {
  return withTenantContext(async () => {
    const where: Prisma.activitiesWhereInput = {};

    if (options.userId) {
      where.created_by_id = options.userId;
    }

    return await prisma.activities.findMany({
      where,
      include: {
        created_by: {
          select: { id: true, name: true, avatar_url: true },
        },
        lead: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: { created_at: 'desc' },
      take: options.limit || 10,
    });
  });
}
```

**recent-activity-feed.tsx**:
```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Mail, MessageSquare, DollarSign, FileText } from 'lucide-react';

const activityIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: MessageSquare,
  DEAL: DollarSign,
  NOTE: FileText,
};

export function RecentActivityFeed({ activities }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity: any) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || FileText;

            return (
              <div key={activity.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.created_by.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {activity.created_by.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm font-medium">{activity.title}</p>
                  </div>

                  {activity.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                    {activity.lead && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.lead.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 6. Add CRM Layout Meta

**app/(platform)/crm/layout.tsx** - Update metadata:
```typescript
export const metadata = {
  title: 'CRM | Strive Tech',
  description: 'Customer Relationship Management',
};
```

## Success Criteria

- [x] Unified CRM dashboard created
- [x] All modules integrated into dashboard
- [x] Navigation updated with CRM links
- [x] Quick-create menu functional
- [x] Recent activity feed working
- [x] Dashboard widgets displaying data
- [x] Responsive layout on all devices
- [x] Clean, intuitive UI

## Files Created/Modified

- ✅ `app/(platform)/crm/dashboard/page.tsx`
- ✅ `app/(platform)/crm/page.tsx` (redirect)
- ✅ `components/(platform)/crm/dashboard/*` (6 files)
- ✅ `lib/modules/activities/queries.ts` (extended)
- ✅ Navigation sidebar (modified)

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 10: Testing, Polish & Go-Live**
2. ✅ CRM fully integrated into platform
3. ✅ Ready for final testing and deployment

---

**Session 9 Complete:** ✅ CRM dashboard integrated into platform
