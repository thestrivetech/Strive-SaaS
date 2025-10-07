import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessContent } from '@/lib/auth/rbac';
import { getCampaigns, getCampaignMetrics } from '@/lib/modules/content/campaigns';
import { CampaignStats } from '@/components/real-estate/content/campaigns/campaign-stats';
import { CampaignList } from '@/components/real-estate/content/campaigns/campaign-list';
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

  // Check content access permissions
  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Marketing campaigns and automation</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/real-estate/cms-marketing/content/campaigns/email/new">
              <Mail className="h-4 w-4 mr-2" />
              Email Campaign
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/real-estate/cms-marketing/content/campaigns/social/new">
              <MessageSquare className="h-4 w-4 mr-2" />
              Social Post
            </Link>
          </Button>

          <Button asChild>
            <Link href="/real-estate/cms-marketing/content/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading metrics...</div>}>
        <CampaignMetrics />
      </Suspense>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Suspense fallback={<div>Loading campaigns...</div>}>
            <CampaignListWrapper />
          </Suspense>
        </TabsContent>

        <TabsContent value="active">
          <Suspense fallback={<div>Loading campaigns...</div>}>
            <CampaignListWrapper status="ACTIVE" />
          </Suspense>
        </TabsContent>

        <TabsContent value="draft">
          <Suspense fallback={<div>Loading campaigns...</div>}>
            <CampaignListWrapper status="DRAFT" />
          </Suspense>
        </TabsContent>

        <TabsContent value="completed">
          <Suspense fallback={<div>Loading campaigns...</div>}>
            <CampaignListWrapper status="COMPLETED" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function CampaignMetrics() {
  const metrics = await getCampaignMetrics();
  return <CampaignStats metrics={metrics} />;
}

async function CampaignListWrapper({ status }: { status?: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' } = {}) {
  const campaigns = await getCampaigns(status ? { status } : {});
  return <CampaignList campaigns={campaigns as any} />;
}
