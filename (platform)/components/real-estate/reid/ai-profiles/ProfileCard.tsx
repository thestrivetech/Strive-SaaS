'use client';

import { REIDCard, REIDCardContent } from '../shared/REIDCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, MapPin, TrendingUp, DollarSign, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

// AI Profile UI type (transformed from database record)
export interface AIProfileUI {
  id: string;
  property_address: string;
  city: string;
  state: string;
  recommendation: string;
  ai_score: number;
  estimated_roi: number;
  estimated_cash_flow: number;
  score_breakdown: Record<string, number>;
  insights: string[];
  analysis_date: Date;
  status: string;
}

interface ProfileCardProps {
  profile: AIProfileUI;
  onArchive: () => void;
}

export function ProfileCard({ profile, onArchive }: ProfileCardProps) {
  // Score color coding
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-cyan-400';
    if (score >= 55) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-500/20 border-green-500/50';
    if (score >= 70) return 'bg-cyan-500/20 border-cyan-500/50';
    if (score >= 55) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong-buy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'buy': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'pass': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'strong-buy': return 'Strong Buy';
      case 'buy': return 'Buy';
      case 'hold': return 'Hold';
      case 'pass': return 'Pass';
      default: return rec;
    }
  };

  return (
    <REIDCard className="hover:border-purple-500/50 transition-colors">
      <REIDCardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium text-white truncate">{profile.property_address}</h3>
            </div>
            <Badge className={cn('text-xs font-semibold border', getRecommendationColor(profile.recommendation))}>
              {getRecommendationLabel(profile.recommendation)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onArchive}
            className="text-slate-400 hover:text-white"
          >
            <Archive className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Score */}
        <div className={cn('rounded-lg p-4 border', getScoreBg(profile.ai_score))}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-300">AI Score</span>
            </div>
            <span className={cn('text-2xl font-bold', getScoreColor(profile.ai_score))}>
              {profile.ai_score}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Est. ROI</span>
            </div>
            <div className="text-lg font-bold text-white">{profile.estimated_roi.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Cash Flow</span>
            </div>
            <div className="text-lg font-bold text-white">${profile.estimated_cash_flow.toLocaleString()}</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase">Score Breakdown</h4>
          <div className="space-y-1">
            {Object.entries(profile.score_breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-8 text-right">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Insights */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase">Key Insights</h4>
          <div className="space-y-1">
            {profile.insights.slice(0, 2).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-purple-400 mt-0.5">•</span>
                <span className="line-clamp-2">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span>{new Date(profile.analysis_date).toLocaleDateString()}</span>
          <Badge variant="outline" className={profile.status === 'active' ? 'border-green-500/50 text-green-400' : 'border-slate-500 text-slate-400'}>
            {profile.status}
          </Badge>
        </div>
      </REIDCardContent>
    </REIDCard>
  );
}
