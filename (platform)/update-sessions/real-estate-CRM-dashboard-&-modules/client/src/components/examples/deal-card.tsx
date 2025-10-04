import { DealCard } from "../crm/deals/deal-card";
import agentAvatar from "@assets/generated_images/Female_agent_professional_headshot_0351dc22.png";

export default function DealCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
      <DealCard
        id="1"
        propertyAddress="1234 Luxury Lane, Beverly Hills, CA"
        clientName="Sarah Johnson"
        value="$849,000"
        stage="Showing"
        daysInStage={3}
        nextAction="Property showing scheduled"
        nextActionDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
        agentAvatar={agentAvatar}
      />
      <DealCard
        id="2"
        propertyAddress="567 Downtown Plaza, San Francisco, CA"
        clientName="David Martinez"
        value="$625,000"
        stage="Offer"
        daysInStage={5}
        nextAction="Review counteroffer"
        nextActionDate={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
      />
      <DealCard
        id="3"
        propertyAddress="890 Suburban Drive, Austin, TX"
        clientName="Emily Rodriguez"
        value="$475,000"
        stage="Under Contract"
        daysInStage={12}
        nextAction="Home inspection"
        nextActionDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
      />
    </div>
  );
}
