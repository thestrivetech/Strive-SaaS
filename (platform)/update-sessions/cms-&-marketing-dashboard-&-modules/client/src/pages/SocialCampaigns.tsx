import SocialCampaignList from "@/components/marketing/campaigns/SocialCampaignList";

export default function SocialCampaigns() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Social Media Campaigns</h1>
        <p className="text-muted-foreground mt-1">
          Schedule and manage your social media presence across platforms
        </p>
      </div>
      <SocialCampaignList />
    </div>
  );
}
