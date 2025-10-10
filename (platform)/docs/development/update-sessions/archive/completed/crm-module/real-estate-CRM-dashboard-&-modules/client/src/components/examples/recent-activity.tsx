import { RecentActivity } from "../crm/dashboard/recent-activity";
import agentAvatar from "@assets/generated_images/Female_agent_professional_headshot_0351dc22.png";

export default function RecentActivityExample() {
  const mockActivities = [
    {
      id: "1",
      type: "call" as const,
      title: "Call with Sarah Johnson",
      description: "Discussed property requirements for Beverly Hills area",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      agentName: "Mike Chen",
      agentAvatar,
    },
    {
      id: "2",
      type: "email" as const,
      title: "Sent listing to David Martinez",
      description: "567 Downtown Plaza - $625K condo in San Francisco",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      agentName: "Lisa Wang",
    },
    {
      id: "3",
      type: "meeting" as const,
      title: "Property showing scheduled",
      description: "890 Suburban Drive with Emily Rodriguez",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      agentName: "Mike Chen",
      agentAvatar,
    },
    {
      id: "4",
      type: "deal" as const,
      title: "Deal moved to Under Contract",
      description: "456 Oak Street - Michael Chen's purchase",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      agentName: "Lisa Wang",
    },
    {
      id: "5",
      type: "note" as const,
      title: "Added notes to lead",
      description: "Updated buyer preferences for Anna Thompson",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      agentName: "Mike Chen",
    },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <RecentActivity activities={mockActivities} />
    </div>
  );
}
