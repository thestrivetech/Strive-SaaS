import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle2, TrendingUp, Eye } from 'lucide-react';
import { getCMSDashboardStats } from '@/lib/modules/cms-marketing/dashboard-queries';

/**
 * Content Overview Stats Component
 *
 * Displays key metrics for the ContentPilot-CMS module:
 * - Total content items
 * - Published content
 * - Active campaigns
 * - Total views
 *
 * @param organizationId - Current organization ID (for multi-tenancy)
 */
interface ContentOverviewProps {
  organizationId: string;
}

export async function ContentOverview({ organizationId }: ContentOverviewProps) {
  const stats = await getCMSDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={FileText}
        title="Total Content"
        value={stats.totalContent.toLocaleString()}
        description="All content items"
        color="text-blue-600"
      />
      <StatCard
        icon={CheckCircle2}
        title="Published"
        value={stats.publishedContent.toLocaleString()}
        description="Live content"
        color="text-green-600"
      />
      <StatCard
        icon={TrendingUp}
        title="Active Campaigns"
        value={stats.activeCampaigns.toLocaleString()}
        description="Running campaigns"
        color="text-purple-600"
      />
      <StatCard
        icon={Eye}
        title="Total Views"
        value={stats.totalViews.toLocaleString()}
        description="Content views"
        color="text-orange-600"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
  color?: string;
}

function StatCard({ icon: Icon, title, value, description, color = 'text-muted-foreground' }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
