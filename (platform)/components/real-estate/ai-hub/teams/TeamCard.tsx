'use client';

import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Play, Settings, Network } from 'lucide-react';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';

type TeamWithDetails = Prisma.agent_teamsGetPayload<{
  include: {
    members: {
      include: {
        agent: {
          select: { id: true; name: true; avatar: true; status: true };
        };
      };
    };
    creator: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    _count: {
      select: { members: true; executions: true };
    };
  };
}>;

interface TeamCardProps {
  team: TeamWithDetails;
  organizationId: string;
}

export function TeamCard({ team, organizationId }: TeamCardProps) {
  // Structure badge colors
  const structureColors = {
    HIERARCHICAL: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    COLLABORATIVE: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    PIPELINE: 'bg-green-500/20 text-green-400 border-green-500/50',
    DEMOCRATIC: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  };

  const successRate = team.success_rate || 0;
  const executionCount = team.execution_count || 0;
  const memberCount = team._count?.members || 0;

  return (
    <EnhancedCard glassEffect="strong" neonBorder="purple" hoverEffect={true} className="rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          {/* Team Icon */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Team Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-lg truncate">{team.name}</CardTitle>
            <p className="text-slate-400 text-sm line-clamp-2">{team.description || 'No description'}</p>
          </div>
        </div>

        {/* Structure Badge */}
        <div className="flex items-center gap-2 mt-3">
          <Badge className={`${structureColors[team.structure]} border text-xs`}>
            {team.structure.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
            {memberCount} Agents
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Agent Avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-slate-900">
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-xs">
                  {member.agent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            {memberCount > 4 && (
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                <span className="text-xs text-slate-400">+{memberCount - 4}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-slate-500">Team Members</span>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">{successRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Success Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-400">{executionCount}</div>
            <div className="text-xs text-slate-500">Executions</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/real-estate/ai-hub/teams/${team.id}`} className="flex-1">
            <Button
              className="w-full bg-slate-800 hover:bg-slate-700 text-purple-400 border border-purple-500/50"
              size="sm"
            >
              <Network className="w-3 h-3 mr-1" />
              Board
            </Button>
          </Link>

          <Link href={`/real-estate/ai-hub/teams/${team.id}/edit`} className="flex-1">
            <Button
              className="w-full bg-slate-800 hover:bg-slate-700 text-pink-400 border border-pink-500/50"
              size="sm"
            >
              <Settings className="w-3 h-3 mr-1" />
              Config
            </Button>
          </Link>
        </div>

        {/* Execute Button */}
        <Link href={`/real-estate/ai-hub/teams/${team.id}/execute`}>
          <Button
            variant="outline"
            className="w-full border-slate-700 hover:border-green-500/50 text-green-400 hover:bg-green-500/10"
            size="sm"
          >
            <Play className="w-3 h-3 mr-1" />
            Execute Team Task
          </Button>
        </Link>
      </CardContent>
    </EnhancedCard>
  );
}
