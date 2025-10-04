import EmailCampaignList from "@/components/marketing/campaigns/EmailCampaignList";

export default function EmailCampaigns() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Email Campaigns</h1>
        <p className="text-muted-foreground mt-1">
          Create, schedule, and track your email marketing campaigns
        </p>
      </div>
      <EmailCampaignList />
    </div>
  );
}
