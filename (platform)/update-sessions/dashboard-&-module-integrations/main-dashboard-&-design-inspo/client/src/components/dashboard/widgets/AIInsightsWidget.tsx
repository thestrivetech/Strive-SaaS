import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateAIInsight } from "@/lib/openai";
import { useDashboardKPIs } from "@/hooks/use-dashboard";
import { Lightbulb, Send, Loader2 } from "lucide-react";

interface Insight {
  id: string;
  content: string;
  timestamp: string;
  type: "insight" | "suggestion";
}

const defaultInsights: Insight[] = [
  {
    id: "1",
    content: "Your conversion rate is performing 23% above your monthly target. Top performing lead source: LinkedIn Ads",
    timestamp: "2 minutes ago",
    type: "insight"
  },
  {
    id: "2", 
    content: "💡 Suggestion: Schedule a follow-up call with Marcus Rivera - he's shown high engagement with your property listings in the last 48 hours.",
    timestamp: "5 minutes ago",
    type: "suggestion"
  }
];

export function AIInsightsWidget() {
  const [insights, setInsights] = useState<Insight[]>(defaultInsights);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: kpis } = useDashboardKPIs();

  const handleAskAI = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const context = {
        kpis: kpis?.map(kpi => ({ name: kpi.name, value: kpi.value, change: kpi.change })),
        timestamp: new Date().toISOString()
      };

      const response = await generateAIInsight({ query, context });
      
      const newInsight: Insight = {
        id: Date.now().toString(),
        content: response.insight,
        timestamp: "Just now",
        type: "insight"
      };

      setInsights(prev => [newInsight, ...prev]);
      setQuery("");
    } catch (error) {
      console.error("Failed to generate AI insight:", error);
      // Add error insight
      const errorInsight: Insight = {
        id: Date.now().toString(),
        content: "Sorry, I'm having trouble analyzing your data right now. Please try again later.",
        timestamp: "Just now",
        type: "insight"
      };
      setInsights(prev => [errorInsight, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 widget-hover neon-border-purple"
      data-testid="ai-insights-widget"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="w-2 h-2 rounded-full bg-accent"
        />
        Ask Sai
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
          AI
        </span>
      </h3>
      
      <div className="space-y-4 mb-4 max-h-48 overflow-y-auto">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3"
            data-testid={`ai-insight-${insight.id}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1 glass rounded-lg p-3">
              <p className="text-sm">
                {insight.type === "suggestion" && !insight.content.includes("💡") && (
                  <span className="text-accent font-medium">💡 Suggestion: </span>
                )}
                {insight.content}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{insight.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask me anything about your metrics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1 glass bg-transparent border-accent/30 focus:border-accent placeholder:text-muted-foreground"
          data-testid="ai-query-input"
        />
        <Button
          onClick={handleAskAI}
          disabled={!query.trim() || isLoading}
          className="px-4 py-2 bg-accent text-accent-foreground font-medium hover:bg-accent/90 neon-purple"
          data-testid="ai-submit-button"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}
