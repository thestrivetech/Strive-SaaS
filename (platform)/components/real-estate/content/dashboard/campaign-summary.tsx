import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, ArrowRight } from 'lucide-react';
import { getRecentCampaigns } from '@/lib/modules/cms-marketing/dashboard-queries';
import { formatDistanceToNow } from 'date-fns';

/**
 * Campaign Summary Component
 *
 * Displays active and recent campaigns with key metrics
 * Server component - fetches data directly
 *
 * @param organizationId - Current organization ID
 */
interface CampaignSummaryProps {
  organizationId: string;
}

export async function CampaignSummary({ organizationId }: CampaignSummaryProps) {
  const recentCampaigns = await getRecentCampaigns();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Campaigns</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/real-estate/cms-marketing/content/campaigns" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
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
                href={`/real-estate/cms-marketing/content/campaigns/${campaign.id}`}
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{campaign.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{campaign.type.toLowerCase()}</span>
                      <span>•</span>
                      <Badge
                        variant={getCampaignStatusVariant(campaign.status)}
                        className="text-xs"
                      >
                        {campaign.status}
                      </Badge>
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
    </Card>
  );
}

function getCampaignStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'DRAFT':
      return 'secondary';
    case 'PAUSED':
      return 'outline';
    case 'COMPLETED':
      return 'outline';
    default:
      return 'secondary';
  }
}
