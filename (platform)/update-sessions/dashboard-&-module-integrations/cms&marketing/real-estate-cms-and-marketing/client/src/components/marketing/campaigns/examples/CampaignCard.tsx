import CampaignCard from '../CampaignCard';

export default function CampaignCardExample() {
  const emailCampaign = {
    id: "1",
    title: "New Listing: Luxury Downtown Condo",
    status: "active" as const,
    type: "email" as const,
    scheduledDate: "2025-01-15",
    metrics: {
      sends: 1245,
      opens: 425,
      clicks: 87,
    },
  };

  const socialCampaign = {
    id: "2",
    title: "Open House This Weekend",
    status: "scheduled" as const,
    type: "social" as const,
    scheduledDate: "2025-01-20",
    metrics: {
      impressions: 5240,
      engagement: 4.2,
      clicks: 156,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-4xl">
      <CampaignCard
        campaign={emailCampaign}
        onEdit={(id) => console.log("Edit campaign", id)}
        onView={(id) => console.log("View campaign", id)}
      />
      <CampaignCard
        campaign={socialCampaign}
        onEdit={(id) => console.log("Edit campaign", id)}
        onView={(id) => console.log("View campaign", id)}
      />
    </div>
  );
}
