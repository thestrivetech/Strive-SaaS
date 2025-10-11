import { getTeams, getTeamStats } from '@/lib/modules/ai-hub/teams/queries';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamCard } from './TeamCard';
import { Users, Plus, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { EnhancedUser } from '@/lib/auth/types';

interface TeamsListProps {
  user: EnhancedUser;
}

export async function TeamsList({ user }: TeamsListProps) {
  // Fetch teams and stats
  const [teams, stats] = await Promise.all([
    getTeams(user.organizationId),
    getTeamStats(user.organizationId),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <ModuleHeroSection
        user={user._raw}
        moduleName="Agent Teams"
        moduleDescription="Orchestrate multi-agent teams for collaborative AI workflows"
        stats={[
          { label: 'Total Teams', value: stats.totalTeams, icon: 'projects' as const },
          { label: 'Teams with Members', value: stats.totalTeams, icon: 'tasks' as const },
          { label: 'Total Executions', value: stats.totalExecutions, icon: 'trend' as const },
          { label: 'Avg Success Rate', value: `${stats.avgSuccessRate.toFixed(1)}%`, icon: 'check' as const },
        ]}
      />

      {/* Controls Section */}
      <EnhancedCard glassEffect="medium" neonBorder="purple" className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-white">Team Library</CardTitle>
            </div>
            <Link href="/real-estate/ai-hub/teams/new">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
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
                placeholder="Search teams..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Structure Filter */}
            <Select defaultValue="all">
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Filter by structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Structures</SelectItem>
                <SelectItem value="HIERARCHICAL">Hierarchical</SelectItem>
                <SelectItem value="COLLABORATIVE">Collaborative</SelectItem>
                <SelectItem value="PIPELINE">Pipeline</SelectItem>
                <SelectItem value="DEMOCRATIC">Democratic</SelectItem>
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

      {/* Team Cards Grid */}
      {teams.length === 0 ? (
        <EnhancedCard glassEffect="medium" neonBorder="green" className="p-12 text-center">
          <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Teams Yet</h3>
          <p className="text-slate-400 mb-6">
            Create your first agent team for collaborative workflows
          </p>
          <Link href="/real-estate/ai-hub/teams/new">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Create First Team
            </Button>
          </Link>
        </EnhancedCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} organizationId={user.organizationId} />
          ))}
        </div>
      )}
    </div>
  );
}
