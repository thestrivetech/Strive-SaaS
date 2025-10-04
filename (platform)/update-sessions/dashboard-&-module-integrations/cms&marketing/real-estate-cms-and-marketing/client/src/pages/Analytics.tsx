import CampaignDashboard from "@/components/marketing/analytics/CampaignDashboard";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track performance metrics and insights across all your marketing channels
        </p>
      </div>
      <CampaignDashboard />
    </div>
  );
}
