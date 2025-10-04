import { KPICard } from "@/components/crm/analytics/kpi-card";
import { AgentLeaderboard } from "@/components/crm/analytics/agent-leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import avatar1 from "@assets/generated_images/Female_agent_professional_headshot_0351dc22.png";
import avatar2 from "@assets/generated_images/Male_agent_professional_headshot_a558128b.png";

export default function Analytics() {
  const topAgents = [
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track performance metrics and gain insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value="$2.4M"
          trend="up"
          trendValue="+12.5%"
          subtitle="vs last month"
        />
        <KPICard
          title="Active Deals"
          value="47"
          trend="up"
          trendValue="+8"
          subtitle="this month"
        />
        <KPICard
          title="Avg Deal Size"
          value="$51K"
          trend="down"
          trendValue="-3.2%"
          subtitle="vs last month"
        />
        <KPICard
          title="Close Rate"
          value="32%"
          trend="neutral"
          trendValue="No change"
          subtitle="this quarter"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Revenue chart placeholder - Ready for chart integration
              </div>
            </CardContent>
          </Card>
        </div>

        <AgentLeaderboard agents={topAgents} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Funnel chart placeholder - Ready for chart integration
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Source chart placeholder - Ready for chart integration
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
