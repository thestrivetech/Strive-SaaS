import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Zap, Brain, Plus, Settings, Grid3x3 } from 'lucide-react';
import Link from 'next/link';
import { ConversationList } from '@/components/real-estate/ai-hub/conversation-list';
import { UsageStats } from '@/components/real-estate/ai-hub/usage-stats';
import { FeaturedTools } from '@/components/real-estate/ai-hub/featured-tools';

/**
 * AI Hub Dashboard Page
 *
 * Main dashboard for AI Hub module
 * Displays AI tools, automation status, and analytics
 *
 * @protected - Requires authentication
 * @status - Active (Mock Data)
 */
export default async function AIHubDashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Helper function for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user.name?.split(' ')[0] || 'User';

  // Initialize with empty conversations (will load from database when available)
  const conversations: Array<{
    id: string;
    title: string;
    summary?: string;
    status: 'ACTIVE' | 'ARCHIVED';
    last_message_at: Date;
    message_count: number;
  }> = [];

  const dashboardData = {
    usageStats: {
      conversationsThisMonth: 0,
      tokensUsedThisMonth: 0,
      mostUsedFeatures: [],
      usageTrends: []
    },
    featuredTools: []
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-cyan mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="inline-block">{getGreeting()},</span>{' '}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-2">
              AI Hub
            </h2>
            <p className="text-muted-foreground">
              AI-powered tools and automation for real estate professionals
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/real-estate/ai-hub/assistant">
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                AI Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Usage Stats Section */}
      <UsageStats
        conversationsThisMonth={dashboardData.usageStats.conversationsThisMonth}
        tokensUsedThisMonth={dashboardData.usageStats.tokensUsedThisMonth}
        mostUsedFeatures={dashboardData.usageStats.mostUsedFeatures}
        usageTrends={dashboardData.usageStats.usageTrends}
      />

      {/* Two-Column Layout: Conversation List + Featured Tools */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation List (2/3 width) */}
        <div className="lg:col-span-2">
          <ConversationList conversations={conversations} />
        </div>

        {/* Featured Tools (1/3 width) */}
        <div className="lg:col-span-1">
          <FeaturedTools tools={dashboardData.featuredTools} />
        </div>
      </div>

      {/* AI Module Quick Links */}
      <Card className="glass neon-border-purple">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            AI Modules
          </CardTitle>
          <CardDescription>
            Access specialized AI tools and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/real-estate/ai-hub/assistant">
              <div className="group p-4 rounded-lg border bg-card hover:bg-accent/50 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">AI Assistant (Sai)</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Intelligent chatbot for customer support
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/real-estate/ai-hub/automation">
              <div className="group p-4 rounded-lg border bg-card hover:bg-accent/50 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">Smart Automation</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Automated workflows and task management
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/real-estate/ai-hub/analytics">
              <div className="group p-4 rounded-lg border bg-card hover:bg-accent/50 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">AI Analytics</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Predictive insights and optimization
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/real-estate/ai-hub/content">
              <div className="group p-4 rounded-lg border bg-card hover:bg-accent/50 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">Content Generation</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      AI-powered content creation tools
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
