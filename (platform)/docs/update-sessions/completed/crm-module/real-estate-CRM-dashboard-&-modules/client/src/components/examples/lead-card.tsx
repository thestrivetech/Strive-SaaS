import { LeadCard } from "../crm/leads/lead-card";

export default function LeadCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
      <LeadCard
        id="1"
        name="Sarah Johnson"
        email="sarah.j@email.com"
        phone="(555) 123-4567"
        score="hot"
        source="Website Form"
        createdAt={new Date(Date.now() - 2 * 60 * 60 * 1000)}
        agentName="Mike Chen"
      />
      <LeadCard
        id="2"
        name="David Martinez"
        email="d.martinez@email.com"
        phone="(555) 234-5678"
        score="warm"
        source="Referral"
        createdAt={new Date(Date.now() - 24 * 60 * 60 * 1000)}
        agentName="Lisa Wang"
      />
      <LeadCard
        id="3"
        name="Emily Rodriguez"
        email="emily.rod@email.com"
        phone="(555) 345-6789"
        score="cold"
        source="Google Ads"
        createdAt={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
      />
    </div>
  );
}
