import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { EnhancedCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { getExecutionMetrics } from '@/lib/modules/ai-hub/analytics/queries';
import { BarChart3, TrendingUp, Coins, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics | AI Hub',
  description: 'AI Hub analytics and performance metrics',
};

export default async function AnalyticsPage() {
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
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSectionWrapper user={user} />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <MetricsSection />
      </Suspense>
    </div>
  );
}

async function HeroSectionWrapper({ user }: { user: any }) {
  const metrics = await getExecutionMetrics(30);
  const successRateRounded = Math.round(metrics.successRate);
  const tokensInK = (metrics.totalTokens / 1000).toFixed(1);
  const costFormatted = metrics.totalCost.toFixed(2);

  const stats = [
    {
      label: 'Executions (30d)',
      value: metrics.totalExecutions.toString(),
      icon: 'tasks' as const,
    },
    {
      label: 'Success Rate',
      value: `${successRateRounded}%`,
      icon: 'trend' as const,
    },
    {
      label: 'Tokens Used',
      value: tokensInK + 'K',
      icon: 'projects' as const,
    },
    {
      label: 'Total Cost',
      value: `$${costFormatted}`,
      icon: 'revenue' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="AI Hub Analytics"
      moduleDescription="Track performance, usage, and costs across all AI automation"
      stats={stats}
    />
  );
}

async function MetricsSection() {
  const metrics = await getExecutionMetrics(30);
  const costFormatted = metrics.totalCost.toFixed(2);
  const avgCost = metrics.totalExecutions > 0 ? (metrics.totalCost / metrics.totalExecutions).toFixed(3) : '0.00';

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle>Execution Overview</CardTitle>
          </div>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
              <span className="text-sm">Total Executions</span>
              <span className="text-lg font-bold text-primary">{metrics.totalExecutions}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
              <span className="text-sm">Completed</span>
              <span className="text-lg font-bold text-green-500">{metrics.completed}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10">
              <span className="text-sm">Failed</span>
              <span className="text-lg font-bold text-red-500">{metrics.failed}</span>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>

      <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={true}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <CardTitle>Usage & Costs</CardTitle>
          </div>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Tokens</span>
              </div>
              <div className="text-2xl font-bold text-primary">{metrics.totalTokens.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Total Cost</span>
              </div>
              <div className="text-2xl font-bold text-orange-500">${costFormatted}</div>
            </div>
            <div className="p-3 rounded-lg border text-center">
              <div className="text-xs text-muted-foreground mb-1">Avg Cost per Execution</div>
              <div className="text-lg font-semibold">${avgCost}</div>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}