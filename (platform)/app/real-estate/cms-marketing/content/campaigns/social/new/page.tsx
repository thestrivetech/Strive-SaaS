import { requireAuth } from '@/lib/auth/middleware';
import { canManageCampaigns } from '@/lib/auth/rbac';
import { SocialPostScheduler } from '@/components/real-estate/content/campaigns/social-post-scheduler';
import { redirect } from 'next/navigation';

/**
 * Social Post Scheduler Page
 *
 * Allows users to create and schedule social media posts with:
 * - Multi-platform support (Facebook, Twitter, Instagram, LinkedIn)
 * - Media attachments
 * - Character count limits
 * - Scheduling options
 * - Post preview
 */
export default async function NewSocialPostPage({
  searchParams,
}: {
  searchParams: { campaignId?: string };
}) {
  const user = await requireAuth();

  // Check campaign management permissions (GROWTH+ tier required)
  if (!canManageCampaigns(user)) {
    redirect('/real-estate/cms-marketing/content/campaigns?error=upgrade_required');
  }

  return (
    <div>
      <SocialPostScheduler
        campaignId={searchParams.campaignId}
        organizationId={user.organizationId}
      />
    </div>
  );
}
