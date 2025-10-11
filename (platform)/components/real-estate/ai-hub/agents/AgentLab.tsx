import { getAgents, getAgentStats } from '@/lib/modules/ai-hub/agents/queries';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentCard } from './AgentCard';
import { Bot, Plus, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { EnhancedUser } from '@/lib/auth/types';

interface AgentLabProps {
  user: EnhancedUser;
}

export async function AgentLab({ user }: AgentLabProps) {
  // Fetch agents and stats
  const [agents, stats] = await Promise.all([
    getAgents(user.organizationId),
    getAgentStats(user.organizationId),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <ModuleHeroSection
        user={user._raw}
        moduleName="AI Agents Lab"
        moduleDescription="Create, configure, and manage intelligent AI agents for automated workflows"
        stats={[
          { label: 'Total Agents', value: stats.totalAgents, icon: 'projects' as const },
          { label: 'Active Agents', value: stats.activeAgents, icon: 'tasks' as const },
          { label: 'Total Executions', value: stats.totalExecutions, icon: 'trend' as const },
          { label: 'Avg Success Rate', value: `${stats.avgSuccessRate.toFixed(1)}%`, icon: 'check' as const },
        ]}
      />

      {/* Controls Section */}
      <EnhancedCard glassEffect="medium" neonBorder="cyan" className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-cyan-400" />
              <CardTitle className="text-white">Agent Library</CardTitle>
            </div>
            <Link href="/real-estate/ai-hub/agents/new">
              <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search agents..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Status Filter */}
            <Select defaultValue="all">
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="IDLE">Idle</SelectItem>
                <SelectItem value="BUSY">Busy</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select defaultValue="created_at">
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Recently Created</SelectItem>
                <SelectItem value="updated_at">Recently Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="execution_count">Most Executions</SelectItem>
                <SelectItem value="success_rate">Success Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Agent Cards Grid */}
      {agents.length === 0 ? (
        <EnhancedCard glassEffect="medium" neonBorder="purple" className="p-12 text-center">
          <Bot className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Agents Yet</h3>
          <p className="text-slate-400 mb-6">
            Create your first AI agent to start automating workflows
          </p>
          <Link href="/real-estate/ai-hub/agents/new">
            <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600">
              <Plus className="w-4 h-4 mr-2" />
              Create First Agent
            </Button>
          </Link>
        </EnhancedCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} organizationId={user.organizationId} />
          ))}
        </div>
      )}
    </div>
  );
}
