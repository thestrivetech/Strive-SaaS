import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Sparkles, Zap, Brain } from 'lucide-react';

/**
 * AI Hub Dashboard Page
 *
 * Main dashboard for AI Hub module
 * Displays AI tools, automation status, and analytics
 *
 * @protected - Requires authentication
 * @status - Placeholder (Coming Soon)
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

  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Hub - Coming Soon
          </CardTitle>
          <CardDescription>
            AI-powered tools and automation for real estate professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The AI Hub module is currently under development and will include:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Assistant (Sai)</p>
                <p className="text-xs text-muted-foreground">
                  Intelligent chatbot for customer support and automation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Smart Automation</p>
                <p className="text-xs text-muted-foreground">
                  Automated workflows and task management
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Predictive insights and performance optimization
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Content Generation</p>
                <p className="text-xs text-muted-foreground">
                  AI-powered content creation and optimization
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Tasks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
