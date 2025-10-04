import { PipelineBoard } from "@/components/crm/deals/pipeline-board";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import agentAvatar from "@assets/generated_images/Female_agent_professional_headshot_0351dc22.png";

export default function Deals() {
  const mockDeals = [
    {
      id: "1",
      propertyAddress: "1234 Luxury Lane, Beverly Hills, CA",
      clientName: "Sarah Johnson",
      value: "$849,000",
      stage: "lead",
      daysInStage: 2,
      nextAction: "Initial contact",
      nextActionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      agentAvatar,
    },
    {
      id: "2",
      propertyAddress: "567 Downtown Plaza, San Francisco, CA",
      clientName: "David Martinez",
      value: "$625,000",
      stage: "qualified",
      daysInStage: 5,
      nextAction: "Budget review",
      nextActionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      propertyAddress: "890 Suburban Drive, Austin, TX",
      clientName: "Emily Rodriguez",
      value: "$475,000",
      stage: "showing",
      daysInStage: 3,
      nextAction: "Property tour",
      nextActionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      propertyAddress: "456 Oak Street, Portland, OR",
      clientName: "Michael Chen",
      value: "$550,000",
      stage: "offer",
      daysInStage: 7,
      nextAction: "Counteroffer review",
      nextActionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "5",
      propertyAddress: "789 Pine Avenue, Seattle, WA",
      clientName: "Lisa Wang",
      value: "$720,000",
      stage: "contract",
      daysInStage: 12,
      nextAction: "Home inspection",
      nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "6",
      propertyAddress: "321 Maple Court, Denver, CO",
      clientName: "Robert Wilson",
      value: "$395,000",
      stage: "closing",
      daysInStage: 18,
      nextAction: "Final walkthrough",
      nextActionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pipeline</h1>
          <p className="text-muted-foreground">
            Drag and drop deals between stages to track progress
          </p>
        </div>
        <Button data-testid="button-add-deal">
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <PipelineBoard
        deals={mockDeals}
        onDealMove={(dealId, newStage) => {
          console.log(`Deal ${dealId} moved to ${newStage}`);
        }}
      />
    </div>
  );
}
