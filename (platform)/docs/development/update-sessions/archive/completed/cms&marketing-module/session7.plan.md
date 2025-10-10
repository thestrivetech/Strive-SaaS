# Session 7: Navigation & Dashboard Integration

## Session Overview
**Goal:** Integrate ContentPilot into the platform navigation, create main dashboard, and ensure seamless navigation flow.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-6

## Objectives

1. ✅ Update platform navigation with ContentPilot
2. ✅ Create ContentPilot main dashboard
3. ✅ Add quick actions and shortcuts
4. ✅ Implement breadcrumb navigation
5. ✅ Add notifications for content
6. ✅ Create sidebar integration
7. ✅ Update role-based navigation
8. ✅ Add feature tour/onboarding

## Implementation Steps

### 1. Update Platform Navigation

**Update:** `components/shared/navigation/sidebar.tsx`

```typescript
// Add ContentPilot navigation items
const navigationItems = [
  // ... existing items

  {
    name: 'ContentPilot',
    href: '/content',
    icon: FileText,
    badge: 'New',
    children: [
      { name: 'Dashboard', href: '/content/dashboard' },
      { name: 'Content Editor', href: '/content/editor' },
      { name: 'Media Library', href: '/content/library' },
      { name: 'Campaigns', href: '/content/campaigns' },
      { name: 'Analytics', href: '/content/analytics' },
      { name: 'Settings', href: '/content/settings' },
    ],
    requiredPermission: 'content:access',
    requiredTier: 'GROWTH', // Content available from Growth tier
  },
];
```

### 2. ContentPilot Main Dashboard

**File:** `app/real-estate/content/dashboard/page.tsx`

```typescript
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/middleware';
import { ContentOverview } from '@/components/real-estate/content/dashboard/content-overview';
import { RecentContent } from '@/components/real-estate/content/dashboard/recent-content';
import { ContentCalendar } from '@/components/real-estate/content/dashboard/content-calendar';
import { CampaignSummary } from '@/components/real-estate/content/dashboard/campaign-summary';
import { QuickActions } from '@/components/real-estate/content/dashboard/quick-actions';
import { ContentStats } from '@/components/real-estate/content/dashboard/content-stats';

export default async function ContentDashboard() {
  await requireAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ContentPilot Dashboard</h1>
        <p className="text-muted-foreground">
          Content management and marketing automation
        </p>
      </div>

      {/* Quick Actions */}
      <Suspense fallback={<div>Loading...</div>}>
        <QuickActions />
      </Suspense>

      {/* Overview Stats */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <ContentOverview />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Content & Campaigns */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<div>Loading content...</div>}>
            <RecentContent />
          </Suspense>

          <Suspense fallback={<div>Loading campaigns...</div>}>
            <CampaignSummary />
          </Suspense>
        </div>

        {/* Right Column - Calendar & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Suspense fallback={<div>Loading calendar...</div>}>
            <ContentCalendar />
          </Suspense>

          <Suspense fallback={<div>Loading stats...</div>}>
            <ContentStats />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### 3. Content Overview Component

**File:** `components/real-estate/content/dashboard/content-overview.tsx`

```typescript
import { getContentStats } from '@/lib/modules/content/content';
import { getCampaignMetrics } from '@/lib/modules/content/analytics/campaign-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Send, Eye, TrendingUp } from 'lucide-react';

export async function ContentOverview() {
  const [stats, campaigns] = await Promise.all([
    getContentStats(),
    getCampaignMetrics(),
  ]);

  const metrics = [
    {
      title: 'Total Content',
      value: stats.total,
      icon: FileText,
      trend: `${stats.published} published`,
      color: 'text-blue-600',
    },
    {
      title: 'Active Campaigns',
      value: campaigns.campaigns.filter(c => c.status === 'ACTIVE').length,
      icon: Send,
      trend: `${campaigns.totals.impressions.toLocaleString()} impressions`,
      color: 'text-green-600',
    },
    {
      title: 'Total Views',
      value: campaigns.totals.clicks.toLocaleString(),
      icon: Eye,
      trend: `${campaigns.metrics.ctr}% CTR`,
      color: 'text-purple-600',
    },
    {
      title: 'Campaign ROI',
      value: `${campaigns.metrics.roi}%`,
      icon: TrendingUp,
      trend: `$${campaigns.totals.revenue.toLocaleString()} revenue`,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

### 4. Quick Actions Component

**File:** `components/real-estate/content/dashboard/quick-actions.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image, Send, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      title: 'New Article',
      description: 'Create a new article or blog post',
      icon: FileText,
      href: '/content/editor/new?type=ARTICLE',
      color: 'bg-blue-500',
    },
    {
      title: 'Upload Media',
      description: 'Add images or videos to library',
      icon: Image,
      href: '/content/library',
      color: 'bg-purple-500',
    },
    {
      title: 'Email Campaign',
      description: 'Create a new email campaign',
      icon: Send,
      href: '/content/campaigns/email/new',
      color: 'bg-green-500',
    },
    {
      title: 'Schedule Post',
      description: 'Schedule social media posts',
      icon: Calendar,
      href: '/content/campaigns/social/new',
      color: 'bg-orange-500',
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: TrendingUp,
      href: '/content/analytics',
      color: 'bg-pink-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex flex-col items-start gap-2 p-4 hover:bg-muted"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. Recent Content Component

**File:** `components/real-estate/content/dashboard/recent-content.tsx`

```typescript
import { getContentItems } from '@/lib/modules/content/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export async function RecentContent() {
  const content = await getContentItems({ limit: 5 });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Content</CardTitle>
        <Link
          href="/content/editor"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {content.map((item) => (
            <Link
              key={item.id}
              href={`/content/editor/${item.id}`}
              className="block group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium group-hover:text-primary truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.type.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{item.viewCount} views</div>
                  <div className="text-xs">{item._count.comments} comments</div>
                </div>
              </div>
            </Link>
          ))}

          {content.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No content yet. Create your first article!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 6. Content Calendar Component

**File:** `components/real-estate/content/dashboard/content-calendar.tsx`

```typescript
import { getContentItems } from '@/lib/modules/content/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export async function ContentCalendar() {
  const scheduledContent = await getContentItems({
    status: 'SCHEDULED',
    limit: 10,
  });

  const scheduledDates = scheduledContent
    .filter(item => item.scheduledFor)
    .map(item => new Date(item.scheduledFor!));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={scheduledDates[0]}
          className="rounded-md border"
        />

        {scheduledContent.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm">Upcoming:</h4>
            {scheduledContent.slice(0, 3).map(item => (
              <div key={item.id} className="text-sm">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.scheduledFor!), 'MMM d, h:mm a')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 7. Update RBAC for Navigation

**Update:** `lib/auth/rbac.ts`

```typescript
// Add to navigation permission checks
export function canAccessContentNav(user: User): boolean {
  // Check both permission and tier
  return canAccessContent(user) && canAccessFeature(user, 'content');
}

// Update sidebar navigation filtering
export function filterNavigationByPermissions(nav: NavigationItem[], user: User) {
  return nav.filter(item => {
    // Check tier requirements
    if (item.requiredTier && !hasRequiredTier(user, item.requiredTier)) {
      return false;
    }

    // Check permissions
    if (item.requiredPermission) {
      const [resource, action] = item.requiredPermission.split(':');
      if (resource === 'content' && !canAccessContent(user)) {
        return false;
      }
    }

    // Filter children
    if (item.children) {
      item.children = filterNavigationByPermissions(item.children, user);
    }

    return true;
  });
}

function hasRequiredTier(user: User, requiredTier: SubscriptionTier): boolean {
  const tierOrder = ['FREE', 'STARTER', 'GROWTH', 'ELITE'];
  const userTierIndex = tierOrder.indexOf(user.subscriptionTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
}
```

### 8. Breadcrumb Navigation

**File:** `components/real-estate/content/shared/breadcrumb-nav.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { href, label };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
```

### 9. Feature Tour Component

**File:** `components/real-estate/content/shared/feature-tour.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Welcome to ContentPilot!',
    description: 'Your all-in-one content management and marketing automation platform.',
    image: '/tour/dashboard.png',
  },
  {
    title: 'Create Amazing Content',
    description: 'Use our rich text editor with SEO tools to create engaging content.',
    image: '/tour/editor.png',
  },
  {
    title: 'Manage Your Media',
    description: 'Upload and organize images, videos, and documents in one place.',
    image: '/tour/library.png',
  },
  {
    title: 'Run Campaigns',
    description: 'Create email and social media campaigns to reach your audience.',
    image: '/tour/campaigns.png',
  },
  {
    title: 'Track Performance',
    description: 'Analyze your content performance with detailed analytics.',
    image: '/tour/analytics.png',
  },
];

export function FeatureTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem('contentpilot-tour-completed');
    if (!tourCompleted) {
      setOpen(true);
    }
  }, []);

  function handleComplete() {
    localStorage.setItem('contentpilot-tour-completed', 'true');
    setOpen(false);
  }

  function handleNext() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  }

  function handlePrev() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  const currentStep = TOUR_STEPS[step];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {/* Placeholder for tour image */}
          <p className="text-muted-foreground">Tour Step {step + 1}</p>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Skip
            </Button>

            {step > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            <Button size="sm" onClick={handleNext}>
              {step < TOUR_STEPS.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Success Criteria

- [x] ContentPilot added to navigation
- [x] Main dashboard functional
- [x] Quick actions working
- [x] Breadcrumb navigation implemented
- [x] Role-based navigation filtering
- [x] Feature tour for onboarding
- [x] All links navigating correctly
- [x] Mobile responsive navigation

## Files Created/Modified

- ✅ `components/shared/navigation/sidebar.tsx` (updated)
- ✅ `app/real-estate/content/dashboard/page.tsx`
- ✅ `components/real-estate/content/dashboard/*` (5 files)
- ✅ `components/real-estate/content/shared/*` (2 files)
- ✅ `lib/auth/rbac.ts` (updated)

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 8: Testing, Polish & Go-Live**
2. ✅ Navigation integration complete
3. ✅ Ready for final testing

---

**Session 7 Complete:** ✅ Navigation and dashboard integration
