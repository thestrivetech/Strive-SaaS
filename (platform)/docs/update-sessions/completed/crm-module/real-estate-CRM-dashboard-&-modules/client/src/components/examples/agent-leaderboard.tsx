import { AgentLeaderboard } from "../crm/analytics/agent-leaderboard";
import avatar1 from "@assets/generated_images/Female_agent_professional_headshot_0351dc22.png";
import avatar2 from "@assets/generated_images/Male_agent_professional_headshot_a558128b.png";

export default function AgentLeaderboardExample() {
  const agents = [
    {
      name: "Sarah Johnson",
      avatar: avatar1,
      deals: 18,
      revenue: "$1.2M",
      conversion: 42,
      rank: 1,
    },
    {
      name: "Mike Chen",
      avatar: avatar2,
      deals: 15,
      revenue: "$980K",
      conversion: 38,
      rank: 2,
    },
    {
      name: "Lisa Wang",
      deals: 12,
      revenue: "$750K",
      conversion: 35,
      rank: 3,
    },
    {
      name: "David Martinez",
      deals: 10,
      revenue: "$620K",
      conversion: 32,
      rank: 4,
    },
    {
      name: "Emily Rodriguez",
      deals: 9,
      revenue: "$580K",
      conversion: 30,
      rank: 5,
    },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <AgentLeaderboard agents={agents} />
    </div>
  );
}
