import { Suspense } from 'react';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getDealsByStage, getDealMetrics } from '@/lib/modules/crm/deals';
import { PipelineBoard } from '@/components/real-estate/crm/deals/pipeline-board';
import { DealFormDialog } from '@/components/real-estate/crm/deals/deal-form-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, TrendingUp, BarChart3, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function DealsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        <Suspense>
          <CreateDealButton />
        </Suspense>
      </div>

      <Suspense fallback={<MetricsCardsSkeleton />}>
        <MetricsCards />
      </Suspense>

      <Suspense fallback={<PipelineSkeleton />}>
        <PipelineContent />
      </Suspense>
    </div>
  );
}

async function CreateDealButton() {
  const user = await getCurrentUser();

  if (!user || !user.organization_members || user.organization_members.length === 0) {
    return null;
  }

  const organizationId = user.organization_members[0].organization_id;

  return <DealFormDialog mode="create" organizationId={organizationId} />;
}

async function MetricsCards() {
  const metrics = await getDealMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Pipeline Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.pipelineValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.activeDeals} active deals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Won Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.wonValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.wonDeals} deals won
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Conversion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            Avg Deal Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.averageDealValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per deal average
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function PipelineContent() {
  const dealsByStage = await getDealsByStage();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pipeline Board</h2>
      <PipelineBoard dealsByStage={dealsByStage} />
    </div>
  );
}

function MetricsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-32 animate-pulse" />
            <div className="h-3 bg-muted rounded w-20 mt-2 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-muted rounded w-32 animate-pulse" />
      <div className="flex gap-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80">
            <Card>
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mt-40 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
