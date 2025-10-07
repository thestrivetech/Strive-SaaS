import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getDashboardStats } from '@/lib/modules/dashboard/queries';
import { getDashboardMetrics } from '@/lib/modules/dashboard/metrics/queries';
import { getDashboardWidgets } from '@/lib/modules/dashboard/widgets/queries';
import { getRecentActivities } from '@/lib/modules/dashboard/activities/queries';
import { getQuickActions } from '@/lib/modules/dashboard/quick-actions/queries';
import { DashboardContent } from '@/components/shared/dashboard/DashboardContent';
import { DashboardGrid } from '@/components/shared/dashboard/DashboardGrid';
import { HeroSection } from '@/components/shared/dashboard/HeroSection';
import { HeroSkeleton, GridSkeleton } from '@/components/shared/dashboard/skeletons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Settings,
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
    <DashboardContent user={user} organizationId={organizationId}>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
    </DashboardContent>
  );
}

/**
 * Hero Section Wrapper - Server Component for data fetching
 */
async function HeroSectionWrapper({
  organizationId,
  user,
}: {
  organizationId: string;
  user: UserWithOrganization;
}) {
  const stats = await getDashboardStats(organizationId);
  return <HeroSection user={user} stats={stats} />;
}


/**
 * KPI Cards Section
 * Displays key performance indicators with data from dashboard stats
 */
async function KPICardsSection({ organizationId }: { organizationId: string }) {
  const stats = await getDashboardStats(organizationId);

  const kpis = [
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      description: 'Monthly recurring',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Customers',
      value: stats.customers.toString(),
      description: 'Total customers',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      description: `${stats.projects} total projects`,
      icon: FolderKanban,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Task Completion',
      value: `${stats.taskCompletionRate}%`,
      description: `${stats.completedTasks}/${stats.tasks} tasks`,
      icon: CheckCircle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
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
      target_url: '/real-estate/workspace',
      color: 'green',
    },
    {
      name: 'New Transaction',
      description: 'Create a transaction',
      icon: 'FolderKanban',
      target_url: '/real-estate/workspace',
      color: 'purple',
    },
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayActions.slice(0, 3).map((action, index) => {
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
    </Card>
  );
}

/**
 * Activity Feed Section
 * Displays recent activity across the organization
 */
async function ActivityFeedSection({ organizationId }: { organizationId: string }) {
  const activities = await getRecentActivities(10);

  return (
    <Card>
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
            {activities.map((activity) => (
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
    </Card>
  );
}

/**
 * Metrics Section
 * Displays custom dashboard metrics
 */
async function MetricsSection({ organizationId }: { organizationId: string }) {
  const metrics = await getDashboardMetrics();

  return (
    <Card>
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
            {metrics.slice(0, 4).map((metric) => (
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
    </Card>
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
    <Card>
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
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Custom Widgets</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {widgets.length} widget(s) configured
        </p>
      </CardContent>
    </Card>
  );
}

// Loading Skeletons
function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

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
