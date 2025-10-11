'use client';

import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Zap, Settings, Trash2, Play } from 'lucide-react';
import Link from 'next/link';
import { StatusIndicator } from './StatusIndicator';
import type { Prisma } from '@prisma/client';

type AgentWithDetails = Prisma.ai_agentsGetPayload<{
  include: {
    creator: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    executions: {
      orderBy: { started_at: 'desc' };
      take: 10;
    };
    _count: {
      select: { executions: true };
    };
  };
}>;

interface AgentCardProps {
  agent: AgentWithDetails;
  organizationId: string;
}

export function AgentCard({ agent, organizationId }: AgentCardProps) {
  // Extract provider from model_config
  const modelConfig = agent.model_config as { provider?: string; model?: string };
  const provider = modelConfig?.provider || 'unknown';
  const model = modelConfig?.model || 'N/A';

  // Calculate success rate display
  const successRate = agent.success_rate || 0;
  const executionCount = agent.execution_count || 0;

  // Provider badge colors
  const providerColors = {
    openai: 'bg-green-500/20 text-green-400 border-green-500/50',
    anthropic: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    groq: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    unknown: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  };

  return (
    <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true} className="rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          {/* Avatar with Status Ring */}
          <div className="relative">
            <Avatar className="w-12 h-12">
              {agent.avatar ? (
                <AvatarImage src={agent.avatar} alt={agent.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white">
                  <Bot className="w-6 h-6" />
                </AvatarFallback>
              )}
            </Avatar>
            {/* Status Ring */}
            <StatusIndicator status={agent.status} className="absolute -bottom-1 -right-1" />
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-lg truncate">{agent.name}</CardTitle>
            <p className="text-slate-400 text-sm line-clamp-2">{agent.description || 'No description'}</p>
          </div>
        </div>

        {/* Provider Badge */}
        <div className="flex items-center gap-2 mt-3">
          <Badge className={`${providerColors[provider as keyof typeof providerColors]} border text-xs`}>
            {provider.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
            {model}
          </Badge>
          {agent.is_active && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 border text-xs">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{successRate.toFixed(1)}%</div>
            <div className="text-xs text-slate-500">Success Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-violet-400">{executionCount}</div>
            <div className="text-xs text-slate-500">Executions</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/real-estate/ai-hub/agents/${agent.id}/test`} className="flex-1">
            <Button
              className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/50"
              size="sm"
            >
              <Zap className="w-3 h-3 mr-1" />
              Test
            </Button>
          </Link>

          <Link href={`/real-estate/ai-hub/agents/${agent.id}/edit`} className="flex-1">
            <Button
              className="w-full bg-slate-800 hover:bg-slate-700 text-violet-400 border border-violet-500/50"
              size="sm"
            >
              <Settings className="w-3 h-3 mr-1" />
              Config
            </Button>
          </Link>
        </div>

        {/* Quick Execute Button */}
        <Link href={`/real-estate/ai-hub/agents/${agent.id}`}>
          <Button
            variant="outline"
            className="w-full border-slate-700 hover:border-green-500/50 text-green-400 hover:bg-green-500/10"
            size="sm"
          >
            <Play className="w-3 h-3 mr-1" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </EnhancedCard>
  );
}
