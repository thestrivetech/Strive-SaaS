'use client';

import { useState, useEffect } from 'react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { ProfileCard, type AIProfileUI } from './ProfileCard';
import { MetricCard } from '../shared/MetricCard';
import { Brain, TrendingUp, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getAIProfiles, getAIProfileStats } from '@/lib/modules/reid/ai/queries';

export function AIProfilesClient() {
  const [profiles, setProfiles] = useState<AIProfileUI[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<AIProfileUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, avg_score: 0, strong_buy_count: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, searchQuery, statusFilter, recommendationFilter, scoreFilter]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch profiles and stats in parallel
      const [dbProfiles, dbStats] = await Promise.all([
        getAIProfiles(),
        getAIProfileStats()
      ]);

      // Transform database records to UI format
      const transformedProfiles: AIProfileUI[] = dbProfiles.map((profile) => {
        // Extract recommendation from recommendations JSON
        const recommendations = profile.recommendations as any;
        const recommendation = recommendations?.primary_recommendation || 'hold';

        // Extract metrics from metrics JSON
        const metrics = profile.metrics as any;
        const estimated_roi = metrics?.estimated_roi || 0;
        const estimated_cash_flow = metrics?.estimated_cash_flow || 0;

        // Build score breakdown from individual scores
        const score_breakdown: Record<string, number> = {
          investment: profile.investment_score || 0,
          lifestyle: profile.lifestyle_score || 0,
          growth: profile.growth_potential || 0,
          risk: profile.risk_score || 0,
        };

        // Extract insights from strengths/opportunities
        const strengths = (profile.strengths as any[]) || [];
        const opportunities = (profile.opportunities as any[]) || [];
        const insights = [...strengths.slice(0, 2), ...opportunities.slice(0, 1)];

        // Determine status based on is_verified and expires_at
        let status = 'active';
        if (profile.expires_at && new Date(profile.expires_at) < new Date()) {
          status = 'archived';
        }

        return {
          id: profile.id,
          property_address: profile.address || `${profile.city}, ${profile.state}`,
          city: profile.city || '',
          state: profile.state || '',
          recommendation,
          ai_score: profile.overall_score || 0,
          estimated_roi,
          estimated_cash_flow,
          score_breakdown,
          insights,
          analysis_date: profile.created_at,
          status,
        };
      });

      setProfiles(transformedProfiles);

      // Set stats
      setStats({
        total: dbStats.totalProfiles,
        avg_score: parseFloat(dbStats.avgOverallScore || '0'),
        strong_buy_count: 0, // This would need to be calculated from recommendations
      });
    } catch (err) {
      console.error('Failed to load AI profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...profiles];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Recommendation filter
    if (recommendationFilter !== 'all') {
      filtered = filtered.filter(p => p.recommendation === recommendationFilter);
    }

    // Score filter
    if (scoreFilter !== 'all') {
      const [min, max] = scoreFilter.split('-').map(Number);
      filtered = filtered.filter(p => p.ai_score >= min && (max ? p.ai_score <= max : true));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.property_address.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query)
      );
    }

    setFilteredProfiles(filtered);
  }

  async function handleArchive(id: string, currentStatus: string) {
    // TODO: Implement archive functionality using Server Action
    console.log(`Archive feature - update profile status for ${id}`);
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading AI profiles...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <Button onClick={loadData} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Profiles"
          value={stats.total}
          icon={Brain}
          className="reid-metric"
        />
        <MetricCard
          label="Avg AI Score"
          value={stats.avg_score}
          icon={TrendingUp}
          className="reid-metric"
        />
        <MetricCard
          label="Strong Buys"
          value={stats.strong_buy_count}
          icon={Target}
          className="reid-metric"
        />
      </div>

      {/* Filters */}
      <REIDCard>
        <REIDCardHeader>
          <h3 className="text-lg font-semibold text-white">Filter Profiles</h3>
        </REIDCardHeader>
        <REIDCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search address, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recommendations</SelectItem>
                <SelectItem value="strong-buy">Strong Buy</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="85-100">Excellent (85-100)</SelectItem>
                <SelectItem value="70-84">Good (70-84)</SelectItem>
                <SelectItem value="55-69">Fair (55-69)</SelectItem>
                <SelectItem value="0-54">Poor (0-54)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </REIDCardContent>
      </REIDCard>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <REIDCard>
          <REIDCardContent>
            <div className="text-center py-12 text-slate-400">
              No AI profiles found. Start analyzing properties to generate AI-powered investment profiles.
            </div>
          </REIDCardContent>
        </REIDCard>
      ) : filteredProfiles.length === 0 ? (
        <REIDCard>
          <REIDCardContent>
            <div className="text-center py-12 text-slate-400">
              No profiles found matching your filters. Try adjusting your search criteria.
            </div>
          </REIDCardContent>
        </REIDCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onArchive={() => handleArchive(profile.id, profile.status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
