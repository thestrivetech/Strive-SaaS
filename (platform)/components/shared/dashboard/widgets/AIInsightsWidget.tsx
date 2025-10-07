'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lightbulb, Send, Loader2, Sparkles } from 'lucide-react';

interface AIInsightsWidgetProps {
  organizationId?: string;
}

interface Insight {
  id: string;
  content: string;
  timestamp: string;
  type: 'insight' | 'suggestion' | 'alert';
}

// Mock insights - will be replaced with real AI in Phase 5
const defaultInsights: Insight[] = [
  {
    id: '1',
    content:
      'Your conversion rate is performing 23% above your monthly target. Top performing lead source: LinkedIn Ads.',
    timestamp: '2 minutes ago',
    type: 'insight',
  },
  {
    id: '2',
    content:
      'Schedule a follow-up call with Marcus Rivera - high engagement with property listings in the last 48 hours.',
    timestamp: '5 minutes ago',
    type: 'suggestion',
  },
  {
    id: '3',
    content:
      '3 deals are approaching their closing deadline. Consider prioritizing these transactions.',
    timestamp: '15 minutes ago',
    type: 'alert',
  },
];

export function AIInsightsWidget({ organizationId }: AIInsightsWidgetProps) {
  const [insights, setInsights] = useState<Insight[]>(defaultInsights);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);

    // Mock AI response - will be replaced with real API call in Phase 5
    setTimeout(() => {
      const newInsight: Insight = {
        id: Date.now().toString(),
        content: `Based on your question "${query}", I suggest focusing on your top 5 leads with the highest engagement scores. This could improve your conversion rate by 15%.`,
        timestamp: 'Just now',
        type: 'insight',
      };

      setInsights((prev) => [newInsight, ...prev.slice(0, 4)]);
      setQuery('');
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return '💡';
      case 'alert':
        return '⚠️';
      default:
        return '✨';
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-6 widget-hover h-full neon-border-purple">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          className="w-2 h-2 rounded-full bg-purple-400"
        />
        Ask Sai
        <span className="ml-auto">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </span>
      </h3>

      {/* Insights Feed */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">{getInsightIcon(insight.type)}</span>
            </div>
            <div className="flex-1 glass rounded-lg p-3 hover:bg-white/5 transition-colors">
              <p className="text-sm text-white leading-relaxed">{insight.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{insight.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Query Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything about your metrics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 glass bg-transparent border-purple-400/30 focus:border-purple-400 placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleAskAI}
            disabled={!query.trim() || isLoading}
            className="px-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2">
          {['Top leads', 'Revenue forecast', 'Deal insights'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="text-xs px-3 py-1 rounded-full glass hover:bg-purple-500/20 text-muted-foreground hover:text-purple-400 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* AI Status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-400"
          />
          <span>AI Assistant Online - Powered by Sai</span>
        </div>
      </div>
    </div>
  );
}
