import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Zap, Brain } from 'lucide-react';
import Link from 'next/link';
import { conversationsProvider, automationsProvider, insightsProvider } from '@/lib/data';

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

  // Fetch real data from providers
  const conversations = await conversationsProvider.findMany(organizationId, user.id);
  const automations = await automationsProvider.findMany(organizationId);
  const insights = await insightsProvider.findMany(organizationId);

  // Calculate stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);

  const conversationsThisMonth = conversations.filter(
    c => new Date(c.started_at) >= thisMonth
  ).length;

  const activeAutomations = automations.filter(a => a.status === 'ACTIVE').length;

  const insightsThisWeek = insights.filter(
    i => new Date(i.generated_at) >= thisWeek
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-cyan mb-6">
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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="glass-strong neon-border-purple hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationsThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="glass-strong neon-border-purple hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Tasks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAutomations}</div>
            <p className="text-xs text-muted-foreground">Active automations</p>
          </CardContent>
        </Card>

        <Card className="glass-strong neon-border-purple hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insightsThisWeek}</div>
            <p className="text-xs text-muted-foreground">Generated this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Link href="/real-estate/ai-hub/assistant">
          <Card className="glass neon-border-cyan hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>AI Assistant (Sai)</CardTitle>
                  <span className="text-xs text-muted-foreground">Beta</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intelligent chatbot for customer support and automation
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/real-estate/ai-hub/automation">
          <Card className="glass neon-border-green hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Smart Automation</CardTitle>
                  <span className="text-xs text-muted-foreground">Beta</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated workflows and task management
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/real-estate/ai-hub/analytics">
          <Card className="glass neon-border-orange hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>AI Analytics</CardTitle>
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Predictive insights and performance optimization
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/real-estate/ai-hub/content">
          <Card className="glass neon-border-purple hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Content Generation</CardTitle>
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered content creation and optimization
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent AI Activity Section */}
      <Card className="glass-strong neon-border-green mb-6">
        <CardHeader>
          <CardTitle>Recent AI Activity</CardTitle>
          <CardDescription>Latest AI interactions and automations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Show most recent conversations */}
            {conversations.slice(0, 2).map((conv) => (
              <div key={conv.id} className="flex items-start gap-3 pb-3 border-b">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conv.started_at).toLocaleDateString()} - {conv.message_count} messages
                  </p>
                </div>
              </div>
            ))}
            {/* Show recent insights */}
            {insights.slice(0, 2).map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(insight.generated_at).toLocaleDateString()} - {insight.insight_type}
                  </p>
                </div>
              </div>
            ))}
            {conversations.length === 0 && insights.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent AI activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass neon-border-orange">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with AI tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/real-estate/ai-hub/assistant">
                Start Conversation
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/real-estate/ai-hub/automation">
                Create Automation
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/real-estate/ai-hub/analytics">
                View Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
