'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, getInitials } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';
import type { AgentPerformance } from '@/lib/modules/analytics';

/**
 * Agent Leaderboard Component
 *
 * Displays top performing agents ranked by revenue
 * Shows medals for top 3 performers
 *
 * @example
 * ```tsx
 * <AgentLeaderboard agents={agentPerformanceData} />
 * ```
 */

interface AgentLeaderboardProps {
  agents: AgentPerformance[];
}

export function AgentLeaderboard({ agents }: AgentLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No performance data available
          </p>
        ) : (
          agents.map((agent, index) => (
            <div key={agent.user.id} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8">
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                {index === 2 && <Medal className="h-5 w-5 text-orange-600" />}
                {index > 2 && <span className="text-sm text-muted-foreground">{index + 1}</span>}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarImage src={agent.user.avatar_url || undefined} alt={agent.user.name || undefined} />
                <AvatarFallback>
                  {getInitials(agent.user.name || agent.user.email)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{agent.user.name || agent.user.email}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{agent.metrics.dealsWon} won</span>
                  <span>•</span>
                  <span>{agent.metrics.winRate.toFixed(1)}% win rate</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatCurrency(agent.metrics.revenue)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
