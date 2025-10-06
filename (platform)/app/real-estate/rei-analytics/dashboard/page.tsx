import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

/**
 * REI Analytics Dashboard
 *
 * Real Estate Investment Analytics & Intelligence
 *
 * Future features:
 * - Market analytics
 * - Property performance metrics
 * - Investment portfolio analysis
 * - Trend forecasting
 * - Comparative market analysis
 *
 * @protected - Requires authentication
 */
export default async function REIAnalyticsDashboardPage() {
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">REI Analytics</h1>
        <p className="text-muted-foreground">
          Real Estate Investment Intelligence & Market Analytics
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Coming Soon</CardTitle>
          <CardDescription className="text-base mt-2">
            Advanced real estate investment analytics and market intelligence tools are currently in development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Market Trends</h3>
              <p className="text-sm text-muted-foreground">
                Real-time market analysis and forecasting
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Investment Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Portfolio performance and ROI tracking
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Comparative Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Property and market comparisons
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future features */}
      <div className="text-center text-sm text-muted-foreground py-8">
        Check back soon for advanced analytics features
      </div>
    </div>
  );
}
