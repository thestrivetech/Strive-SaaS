'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { updateCampaignStatus, deleteCampaign } from '@/lib/modules/content/campaigns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  start_date?: Date | null;
  end_date?: Date | null;
  created_at: Date;
  creator: {
    id: string;
    name: string | null;
  };
  _count: {
    emails: number;
    social_posts: number;
  };
}

interface CampaignListProps {
  campaigns: Campaign[];
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  PLANNING: 'bg-blue-500',
  ACTIVE: 'bg-green-500',
  PAUSED: 'bg-yellow-500',
  COMPLETED: 'bg-purple-500',
  CANCELLED: 'bg-red-500',
};

const TYPE_LABELS: Record<string, string> = {
  CONTENT_MARKETING: 'Content',
  EMAIL_MARKETING: 'Email',
  SOCIAL_MEDIA: 'Social',
  PAID_ADVERTISING: 'Paid Ads',
  SEO_CAMPAIGN: 'SEO',
  LEAD_GENERATION: 'Lead Gen',
  BRAND_AWARENESS: 'Branding',
  PRODUCT_LAUNCH: 'Launch',
};

export function CampaignList({ campaigns }: CampaignListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateCampaignStatus(id, newStatus);
      toast({
        title: 'Status updated',
        description: 'Campaign status has been updated successfully',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCampaign(id);
      toast({
        title: 'Campaign deleted',
        description: 'Campaign has been deleted successfully',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete campaign',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No campaigns yet</p>
        <Button asChild>
          <Link href="/real-estate/cms-marketing/content/campaigns/new">
            Create your first campaign
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/real-estate/cms-marketing/content/campaigns/${campaign.id}`}
                  className="hover:underline"
                >
                  {campaign.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {TYPE_LABELS[campaign.type] || campaign.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[campaign.status]}>
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {campaign._count.emails} emails, {campaign._count.social_posts} posts
                </div>
              </TableCell>
              <TableCell>
                {campaign.start_date
                  ? format(new Date(campaign.start_date), 'MMM dd, yyyy')
                  : '—'}
              </TableCell>
              <TableCell>
                <div className="text-sm">{campaign.creator.name || 'Unknown'}</div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/real-estate/cms-marketing/content/campaigns/${campaign.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/real-estate/cms-marketing/content/campaigns/${campaign.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {campaign.status === 'ACTIVE' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'PAUSED')}>
                        Pause Campaign
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'PAUSED' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}>
                        Resume Campaign
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'DRAFT' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}>
                        Activate Campaign
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(campaign.id)}
                      disabled={deletingId === campaign.id}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      {deletingId === campaign.id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
