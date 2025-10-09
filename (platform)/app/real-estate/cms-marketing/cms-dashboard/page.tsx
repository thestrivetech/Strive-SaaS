import { Suspense } from 'react';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardDescription } from '@/components/ui/card';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Megaphone,
  FileText,
  BarChart3,
  Image,
  Eye,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  getCMSDashboardStats,
  getRecentContent,
  getRecentCampaigns,
} from '@/lib/modules/cms-marketing/dashboard-queries';
import { formatDistanceToNow } from 'date-fns';

/**
 * CMS & Marketing Module Dashboard
 *
 * Main dashboard for Content Management & Marketing features
 * - Overview statistics
 * - Navigation to key features
 * - Recent activity
 * - Quick actions
 *
 * @protected - Requires authentication
 */
export default async function CMSMarketingDashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Fetch stats for ModuleHeroSection
  const dashboardStats = await getCMSDashboardStats();

  // Create stats array for hero
  const stats = [
    {
      label: 'Total Content',
      value: dashboardStats.totalContent.toString(),
      icon: 'file' as const,
    },
    {
      label: 'Published',
      value: dashboardStats.publishedContent.toString(),
      icon: 'check' as const,
    },
    {
      label: 'Active Campaigns',
      value: dashboardStats.activeCampaigns.toString(),
      icon: 'trend' as const,
    },
    {
      label: 'Total Views',
      value: dashboardStats.totalViews.toLocaleString(),
      icon: 'eye' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <ModuleHeroSection
        user={user}
        moduleName="CMS & Marketing"
        moduleDescription="Manage your content and marketing campaigns"
        stats={stats}
        showWeather={false}
      />

      {/* Overview Stats */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Feature Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard
          icon={FileText}
          title="Content Library"
          description="Create and manage blog posts, pages, and articles"
          href="/real-estate/cms-marketing/content"
          stats="Manage all content"
        />
        <FeatureCard
          icon={Megaphone}
          title="Campaigns"
          description="Launch and track marketing campaigns"
          href="/real-estate/cms-marketing/content/campaigns"
          stats="Email & social media"
        />
        <FeatureCard
          icon={BarChart3}
          title="Analytics"
          description="View content performance and campaign metrics"
          href="/real-estate/cms-marketing/analytics"
          stats="Track engagement"
        />
        <FeatureCard
          icon={Image}
          title="Media Library"
          description="Manage images, videos, and files"
          href="/real-estate/cms-marketing/content"
          stats="Coming soon"
          badge="Coming Soon"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<ActivityLoadingSkeleton title="Recent Content" />}>
          <RecentContentSection />
        </Suspense>
        <Suspense fallback={<ActivityLoadingSkeleton title="Recent Campaigns" />}>
          <RecentCampaignsSection />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <EnhancedCard glassEffect="medium" neonBorder="orange" hoverEffect={true}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/real-estate/cms-marketing/content/editor">
                Create New Content
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/real-estate/cms-marketing/content/campaigns/new">
                Start Campaign
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/real-estate/cms-marketing/analytics">
                View Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}

// Server Component: Fetch and display dashboard stats
async function DashboardStats() {
  const stats = await getCMSDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={FileText}
        title="Total Content"
        value={stats.totalContent.toLocaleString()}
        description="All content items"
      />
      <StatCard
        icon={CheckCircle2}
        title="Published"
        value={stats.publishedContent.toLocaleString()}
        description="Live content"
        trend="positive"
      />
      <StatCard
        icon={TrendingUp}
        title="Active Campaigns"
        value={stats.activeCampaigns.toLocaleString()}
        description="Running campaigns"
      />
      <StatCard
        icon={Eye}
        title="Total Views"
        value={stats.totalViews.toLocaleString()}
        description="Content views"
        trend="positive"
      />
    </div>
  );
}

// Server Component: Recent content activity
async function RecentContentSection() {
  const recentContent = await getRecentContent();

  return (
    <EnhancedCard glassEffect="strong" neonBorder="green" hoverEffect={true}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Content</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/real-estate/cms-marketing/content">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentContent.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No content yet</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/real-estate/cms-marketing/content/editor">
                Create your first content
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentContent.map((item) => (
              <Link
                key={item.id}
                href={`/real-estate/cms-marketing/content/editor/${item.id}`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{item.type.toLowerCase()}</span>
                      <span>•</span>
                      <span className={getStatusColor(item.status)}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}

// Server Component: Recent campaigns activity
async function RecentCampaignsSection() {
  const recentCampaigns = await getRecentCampaigns();

  return (
    <EnhancedCard glassEffect="strong" neonBorder="green" hoverEffect={true}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Campaigns</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/real-estate/cms-marketing/content/campaigns">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No campaigns yet</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/real-estate/cms-marketing/content/campaigns/new">
                Create your first campaign
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/real-estate/cms-marketing/content/campaigns`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{campaign.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{campaign.type.toLowerCase()}</span>
                      <span>•</span>
                      <span className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}

// Helper Components

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
  trend?: 'positive' | 'negative';
}

function StatCard({ icon: Icon, title, value, description }: StatCardProps) {
  return (
    <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </EnhancedCard>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  stats: string;
  badge?: string;
}

function FeatureCard({ icon: Icon, title, description, href, stats, badge }: FeatureCardProps) {
  return (
    <EnhancedCard glassEffect="medium" neonBorder="cyan" hoverEffect={true}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {badge && (
                <span className="text-xs text-muted-foreground mt-1 inline-block">
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{stats}</span>
          {!badge && (
            <Button asChild variant="ghost" size="sm">
              <Link href={href}>
                Go to {title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </EnhancedCard>
  );
}

// Loading Skeletons

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActivityLoadingSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg border">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility Functions

function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PUBLISHED: 'text-green-600',
    DRAFT: 'text-yellow-600',
    ARCHIVED: 'text-gray-600',
    ACTIVE: 'text-green-600',
    PAUSED: 'text-yellow-600',
    COMPLETED: 'text-blue-600',
  };

  return statusColors[status] || 'text-muted-foreground';
}
