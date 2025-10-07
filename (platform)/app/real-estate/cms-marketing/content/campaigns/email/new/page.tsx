import { requireAuth } from '@/lib/auth/middleware';
import { canManageCampaigns } from '@/lib/auth/rbac';
import { EmailCampaignBuilder } from '@/components/real-estate/content/campaigns/email-campaign-builder';
import { redirect } from 'next/navigation';

/**
 * Email Campaign Builder Page
 *
 * Allows users to create and schedule email campaigns with:
 * - Rich text email content
 * - Sender information
 * - Scheduling options
 * - Email preview
 */
export default async function NewEmailCampaignPage({
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
      <EmailCampaignBuilder
        campaignId={searchParams.campaignId}
        organizationId={user.organizationId}
      />
    </div>
  );
}
