import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getDashboardMetrics } from '@/lib/modules/dashboard/metrics/queries';
import { getDashboardWidgets } from '@/lib/modules/dashboard/widgets/queries';
import { getRecentActivities } from '@/lib/modules/dashboard/activities/queries';
import { getQuickActions } from '@/lib/modules/dashboard/quick-actions/queries';
import { getOverviewKPIs } from '@/lib/modules/analytics';
import { DashboardGrid } from '@/components/shared/dashboard/DashboardGrid';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { HeroSkeleton, GridSkeleton } from '@/components/shared/dashboard/skeletons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';

export const metadata: Metadata = {
  title: 'Dashboard | Strive Platform',
  description: 'Your personalized dashboard for managing your real estate business',
};

/**
 * Main Platform Dashboard
 *
 * Real Estate Industry Dashboard - Entry point for the platform
 * Displays KPIs, quick actions, recent activity, and module shortcuts
 *
 * @protected - Requires authentication at layout level
 */
export default async function DashboardPage() {
  // ⚠️ TEMPORARY: Skip auth on localhost for presentation
  const isLocalhost = typeof window === 'undefined' &&
    (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local');

  let user: UserWithOrganization | null = null;
  let organizationId: string | null = null;

  if (!isLocalhost) {
    await requireAuth();
    user = await getCurrentUser();

    if (!user) {
      redirect('/login');
    }

    organizationId = user.organization_members[0]?.organization_id;

    if (!organizationId) {
      redirect('/onboarding/organization');
    }
  } else {
    // Mock user for localhost
    user = {
      id: 'demo-user',
      clerk_user_id: null,
      email: 'demo@strivetech.ai',
      name: 'Demo User',
      avatar_url: null,
      role: 'USER' as const,
      subscription_tier: 'STARTER' as const,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      organization_members: [],
    };
    organizationId = 'demo-org';
  }

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSectionWrapper organizationId={organizationId} user={user} />
      </Suspense>

      {/* Dashboard Widget Grid - New Drag-and-Drop System */}
      <Suspense fallback={<DashboardGridSkeleton />}>
        <DashboardGridSection organizationId={organizationId} />
      </Suspense>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Quick Actions Grid */}
          <Suspense fallback={<QuickActionsSkeleton />}>
            <QuickActionsSection organizationId={organizationId} />
          </Suspense>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Activity Feed & Metrics */}
            <div className="lg:col-span-2 space-y-8">
              <Suspense fallback={<ActivityFeedSkeleton />}>
                <ActivityFeedSection organizationId={organizationId} />
              </Suspense>

              <Suspense fallback={<MetricsSkeleton />}>
                <MetricsSection organizationId={organizationId} />
              </Suspense>
            </div>

            {/* Right Column - Module Shortcuts & Widgets */}
            <div className="lg:col-span-1 space-y-8">
              <Suspense fallback={<ModuleShortcutsSkeleton />}>
                <ModuleShortcutsSection />
              </Suspense>

              <Suspense fallback={<WidgetsSkeleton />}>
                <WidgetsSection organizationId={organizationId} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hero Section Wrapper - Server Component for data fetching
 */
async function HeroSectionWrapper({ user }: { organizationId?: string; user: any }) {
  const kpis = await getOverviewKPIs();

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${(kpis.revenue.thisMonth / 1000).toFixed(1)}K`,
      change: kpis.revenue.change,
      changeType: 'percentage' as const,
      icon: 'revenue' as const,
    },
    {
      label: 'Active Projects',
      value: ((kpis.pipeline as any).activeDealCount || (kpis.pipeline as any).activeDeals || 0).toString(),
      icon: 'projects' as const,
    },
    {
      label: 'Total Customers',
      value: kpis.leads.total.toString(),
      change: kpis.leads.change,
      changeType: 'count' as const,
      icon: 'customers' as const,
    },
    {
      label: 'Task Completion',
      value: `${kpis.conversionRate}%`,
      icon: 'tasks' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="User Dashboard"
      moduleDescription="Your personalized platform overview"
      stats={stats}
    />
  );
}


/**
 * Quick Actions Section
 * Displays frequently used actions for quick access
 */
async function QuickActionsSection({ organizationId }: { organizationId: string }) {
  const actions = await getQuickActions();

  const defaultActions = [
    {
      name: 'New Contact',
      description: 'Add a contact to CRM',
      icon: 'Users',
      target_url: '/real-estate/crm/contacts',
      color: 'blue',
    },
    {
      name: 'New Transaction',
      description: 'Start a transaction loop',
      icon: 'FileText',
      target_url: '/real-estate/workspace/workspace-dashboard',
      color: 'green',
    },
    {
      name: 'New Project',
      description: 'Create a project',
      icon: 'FolderKanban',
      target_url: '/real-estate/workspace/listings',
      color: 'purple',
    },
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayActions.slice(0, 3).map((action: any, index: number) => {
            // Icon mapping
            const iconMap: Record<string, any> = {
              Users,
              FileText,
              FolderKanban,
              Activity,
            };
            const Icon = iconMap[action.icon] || Activity;

            return (
              <Link
                key={action.target_url || index}
                href={action.target_url || '#'}
              >
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Icon className={`h-6 w-6 mb-2 text-${action.color}-600`} />
                  <h3 className="font-semibold text-sm">{action.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </EnhancedCard>
  );
}

/**
 * Activity Feed Section
 * Displays recent activity across the organization
 */
async function ActivityFeedSection({ organizationId }: { organizationId: string }) {
  const activities = await getRecentActivities(10);

  return (
    <EnhancedCard glassEffect="strong" neonBorder="green" hoverEffect={true}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Link href="/real-estate/activity">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.user?.name || 'System'}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.created_at).toLocaleDateString()} at{' '}
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}

/**
 * Metrics Section
 * Displays custom dashboard metrics
 */
async function MetricsSection({ organizationId }: { organizationId: string }) {
  const metrics = await getDashboardMetrics();

  return (
    <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No metrics configured
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.slice(0, 4).map((metric: any) => (
              <div
                key={metric.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {metric.name}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {metric.cached_value !== null && metric.cached_value !== undefined
                    ? metric.cached_value.toLocaleString()
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.category}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}

/**
 * Module Shortcuts Section
 * Quick links to major platform modules
 */
function ModuleShortcutsSection() {
  const modules = [
    {
      name: 'CRM',
      description: 'Manage contacts & leads',
      href: '/real-estate/crm',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      name: 'Workspace',
      description: 'Transaction management',
      href: '/real-estate/workspace',
      icon: FileText,
      color: 'text-green-600',
    },
    {
      name: 'AI Hub',
      description: 'AI tools & automation',
      href: '/real-estate/ai-hub',
      icon: LayoutDashboard,
      color: 'text-purple-600',
    },
  ];

  return (
    <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={true}>
      <CardHeader>
        <CardTitle>Quick Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${module.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {module.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </EnhancedCard>
  );
}

/**
 * Widgets Section
 * Displays custom dashboard widgets
 */
async function WidgetsSection({ organizationId }: { organizationId: string }) {
  const widgets = await getDashboardWidgets();

  if (widgets.length === 0) {
    return null;
  }

  return (
    <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
      <CardHeader>
        <CardTitle>Custom Widgets</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {widgets.length} widget(s) configured
        </p>
      </CardContent>
    </EnhancedCard>
  );
}

// Loading Skeletons
function QuickActionsSkeleton() {
  return <Skeleton className="h-48 rounded-lg" />;
}

function ActivityFeedSkeleton() {
  return <Skeleton className="h-96 rounded-lg" />;
}

function MetricsSkeleton() {
  return <Skeleton className="h-64 rounded-lg" />;
}

function ModuleShortcutsSkeleton() {
  return <Skeleton className="h-64 rounded-lg" />;
}

function WidgetsSkeleton() {
  return <Skeleton className="h-48 rounded-lg" />;
}

/**
 * Dashboard Grid Section - Client Component Wrapper
 * Renders the drag-and-drop widget grid
 */
function DashboardGridSection({ organizationId }: { organizationId: string }) {
  return <DashboardGrid organizationId={organizationId} />;
}

function DashboardGridSkeleton() {
  return <GridSkeleton />;
}
