'use client';

import { useState, useEffect } from 'react';
import { aiProfilesProvider, type MockAIProfile } from '@/lib/data';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { ProfileCard } from './ProfileCard';
import { MetricCard } from '../shared/MetricCard';
import { Brain, TrendingUp, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function AIProfilesClient() {
  const [profiles, setProfiles] = useState<MockAIProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<MockAIProfile[]>([]);
  const [loading, setLoading] = useState(true);
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
      const [profilesData, statsData] = await Promise.all([
        aiProfilesProvider.findAll(),
        aiProfilesProvider.getStats(),
      ]);
      setProfiles(profilesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load AI profiles:', error);
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
    try {
      if (currentStatus === 'active') {
        await aiProfilesProvider.archive(id);
      } else {
        await aiProfilesProvider.unarchive(id);
      }
      await loadData();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading AI profiles...</div>;
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
      {filteredProfiles.length === 0 ? (
        <REIDCard>
          <REIDCardContent>
            <div className="text-center py-12 text-slate-400">
              No profiles found matching your filters.
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
