import { StatCard } from "@/components/crm/dashboard/stat-card";
import { RecentActivity } from "@/components/crm/dashboard/recent-activity";
import { AgentLeaderboard } from "@/components/crm/analytics/agent-leaderboard";
import { LeadCard } from "@/components/crm/leads/lead-card";
import { QuickCreateButton } from "@/components/crm/shared/quick-create-modal";
import { Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useLeads } from "@/hooks/use-leads";
import { useActivities } from "@/hooks/use-activities";
import { useAgents } from "@/hooks/use-agents";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: activities = [], isLoading: activitiesLoading } = useActivities(10);
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const [, setLocation] = useLocation();

  const recentLeads = leads.slice(0, 3);
  const topAgents = agents.slice(0, 4).map((agent, index) => ({
    name: agent.name,
    avatar: agent.avatar || undefined,
    deals: agent.deals || 0,
    revenue: agent.revenue ? `$${Number(agent.revenue) / 1000}K` : "$0",
    conversion: agent.conversion ? Number(agent.conversion) : 0,
    rank: index + 1,
  }));

  const mappedActivities = activities.map(activity => ({
    id: activity.id,
    type: activity.type as "call" | "email" | "meeting" | "deal" | "note",
    title: activity.title,
    description: activity.description || "",
    timestamp: new Date(activity.timestamp),
    agentName: activity.agentName || "Unknown",
    agentAvatar: activity.agentAvatar || undefined,
  }));

  const newLeadsChange = 12.5;
  const pipelineChange = 8.2;
  const conversionChange = -2.4;
  const dealsClosedChange = 15.3;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <div 
              onClick={() => setLocation("/leads")} 
              className="cursor-pointer hover-elevate active-elevate-2"
              data-testid="stat-new-leads"
            >
              <StatCard
                title="New Leads"
                value={analytics?.newLeads?.toString() || "0"}
                change={newLeadsChange}
                changeLabel="vs last 24h"
                icon={Users}
              />
            </div>
            <StatCard
              title="Pipeline Value"
              value={analytics?.pipelineValue ? `$${Number(analytics.pipelineValue) / 1000000}M` : "$0"}
              change={pipelineChange}
              changeLabel="vs last month"
              icon={DollarSign}
            />
            <StatCard
              title="Conversion Rate"
              value={analytics?.conversionRate ? `${analytics.conversionRate}%` : "0%"}
              change={conversionChange}
              changeLabel="vs last month"
              icon={TrendingUp}
            />
            <StatCard
              title="Deals Closed"
              value={analytics?.dealsClosed?.toString() || "0"}
              change={dealsClosedChange}
              changeLabel="this month"
              icon={CheckCircle}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Leads</h2>
              <button 
                onClick={() => setLocation("/leads")}
                className="text-sm text-primary hover:underline"
                data-testid="link-view-all-leads"
              >
                View all leads →
              </button>
            </div>
            {leadsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recentLeads.map((lead) => (
                  <LeadCard 
                    key={lead.id} 
                    id={lead.id}
                    name={lead.name}
                    email={lead.email}
                    phone={lead.phone}
                    score={lead.score as "hot" | "warm" | "cold"}
                    source={lead.source}
                    createdAt={new Date(lead.createdAt)}
                    agentName={lead.agentName || undefined}
                    agentAvatar={lead.agentAvatar || undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {activitiesLoading ? (
            <Skeleton className="h-96" />
          ) : (
            <RecentActivity activities={mappedActivities} />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Top Performers</h2>
            <button 
              onClick={() => setLocation("/analytics")}
              className="text-sm text-primary hover:underline"
              data-testid="link-view-analytics"
            >
              View analytics →
            </button>
          </div>
          {agentsLoading ? (
            <Skeleton className="h-96" />
          ) : (
            <AgentLeaderboard agents={topAgents} />
          )}
        </div>
      </div>

      <QuickCreateButton />
    </div>
  );
}
