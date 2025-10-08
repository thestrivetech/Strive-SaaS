import { CampaignListSkeleton } from '@/components/real-estate/content/shared/content-skeleton';

/**
 * Campaigns Page Loading State
 *
 * Displayed while campaigns list is being fetched
 */
export default function CampaignsLoading() {
  return <CampaignListSkeleton />;
}
