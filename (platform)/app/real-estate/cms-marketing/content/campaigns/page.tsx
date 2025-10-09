import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { canAccessContent } from '@/lib/auth/rbac';
import { getCampaigns, getCampaignMetrics } from '@/lib/modules/content/campaigns';
import { CampaignStats } from '@/components/real-estate/content/campaigns/campaign-stats';
import { CampaignList } from '@/components/real-estate/content/campaigns/campaign-list';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Plus, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Campaign Dashboard Page
 *
 * Displays campaign overview with:
 * - Campaign metrics (total, active, completed, draft)
 * - Campaign list with filters
 * - Quick actions (new campaign, email, social post)
 */
export default async function CampaignsPage() {
  const user = await requireAuth();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Check content access permissions
  if (!canAccessContent(currentUser)) {
    throw new Error('Unauthorized: Content access required');
  }

  // Fetch metrics BEFORE return for hero
  const metrics = await getCampaignMetrics();

  // Create stats array for ModuleHeroSection
  const heroStats = [
    {
      label: 'Total Campaigns',
      value: (metrics.total || 0).toString(),
      icon: 'megaphone' as const,
    },
    {
      label: 'Active',
      value: (metrics.active || 0).toString(),
      icon: 'trend' as const,
    },
    {
      label: 'Completed',
      value: (metrics.completed || 0).toString(),
      icon: 'check' as const,
    },
    {
      label: 'Draft',
      value: (metrics.draft || 0).toString(),
      icon: 'clock' as const,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <ModuleHeroSection
        user={currentUser}
        moduleName="Campaigns"
        moduleDescription="Marketing campaigns and automation"
        stats={heroStats}
        showWeather={false}
      />

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <Button variant="outline" asChild className="min-h-[44px]">
          <Link href="/real-estate/cms-marketing/content/campaigns/email/new">
            <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
            Email Campaign
          </Link>
        </Button>

        <Button variant="outline" asChild className="min-h-[44px]">
          <Link href="/real-estate/cms-marketing/content/campaigns/social/new">
            <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
            Social Post
          </Link>
        </Button>

        <Button asChild className="min-h-[44px]">
          <Link href="/real-estate/cms-marketing/content/campaigns/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Tabs section */}
      <div>
        <EnhancedCard glassEffect="medium" neonBorder="cyan" hoverEffect={false}>
          <CardContent className="pt-6">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList aria-label="Filter campaigns by status">
                <TabsTrigger value="all">All Campaigns</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Suspense fallback={<div role="status" aria-live="polite"><span className="sr-only">Loading campaigns...</span><div>Loading campaigns...</div></div>}>
                  <CampaignListWrapper />
                </Suspense>
              </TabsContent>

              <TabsContent value="active">
                <Suspense fallback={<div role="status" aria-live="polite"><span className="sr-only">Loading active campaigns...</span><div>Loading campaigns...</div></div>}>
                  <CampaignListWrapper status="ACTIVE" />
                </Suspense>
              </TabsContent>

              <TabsContent value="draft">
                <Suspense fallback={<div role="status" aria-live="polite"><span className="sr-only">Loading draft campaigns...</span><div>Loading campaigns...</div></div>}>
                  <CampaignListWrapper status="DRAFT" />
                </Suspense>
              </TabsContent>

              <TabsContent value="completed">
                <Suspense fallback={<div role="status" aria-live="polite"><span className="sr-only">Loading completed campaigns...</span><div>Loading campaigns...</div></div>}>
                  <CampaignListWrapper status="COMPLETED" />
                </Suspense>
              </TabsContent>
            </Tabs>
          </CardContent>
        </EnhancedCard>
      </div>
    </div>
  );
}

async function CampaignListWrapper({ status }: { status?: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' } = {}) {
  const campaigns = await getCampaigns(status ? { status } : {});
  return <CampaignList campaigns={campaigns as any} />;
}
