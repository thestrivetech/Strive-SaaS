import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Agent {
  name: string;
  avatar?: string;
  deals: number;
  revenue: string;
  conversion: number;
  rank: number;
}

interface AgentLeaderboardProps {
  agents: Agent[];
}

export function AgentLeaderboard({ agents }: AgentLeaderboardProps) {
  return (
    <Card data-testid="card-agent-leaderboard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => {
            const initials = agent.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={agent.name}
                className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                data-testid={`row-agent-${agent.rank}`}
              >
                <div className="text-lg font-bold text-muted-foreground w-6">
                  {agent.rank}
                </div>
                <Avatar>
                  <AvatarImage src={agent.avatar} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{agent.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{agent.deals} deals</span>
                    <span>•</span>
                    <span>{agent.revenue}</span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    agent.rank === 1
                      ? "bg-gold/10 text-gold border-gold/20"
                      : ""
                  }
                >
                  {agent.conversion}%
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
