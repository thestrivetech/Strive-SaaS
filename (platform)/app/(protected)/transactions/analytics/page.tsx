import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getTransactionAnalytics,
  getLoopVelocity,
  getAnalyticsByType,
  getAnalyticsByStatus,
  formatCurrency,
} from '@/lib/modules/transaction-analytics';
import { getOrganizationCompliance, getComplianceStats } from '@/lib/modules/compliance';
import { getRecentActivity } from '@/lib/modules/transaction-activity';
import { BarChart3, TrendingUp, AlertCircle, Activity } from 'lucide-react';

export const metadata = {
  title: 'Analytics | Transaction Management',
  description: 'Transaction analytics and compliance dashboard',
};

async function AnalyticsDashboard() {
  const [analytics, velocity, typeData, statusData, complianceStats] = await Promise.all([
    getTransactionAnalytics(),
    getLoopVelocity({ months: 6 }),
    getAnalyticsByType(),
    getAnalyticsByStatus(),
    getComplianceStats(),
  ]);

  const { overview, documents, tasks, signatures } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Transaction Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Loops</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalLoops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overview.activeLoops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overview.closedLoops}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Days to Close</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.avgClosingDays}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.totalValue)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Compliance Status
          </CardTitle>
          <CardDescription>Organization-wide compliance alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Alerts</div>
              <div className="text-2xl font-bold">{complianceStats.total}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Errors</div>
              <div className="text-2xl font-bold text-red-600">{complianceStats.error}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Warnings</div>
              <div className="text-2xl font-bold text-amber-600">{complianceStats.warning}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Info</div>
              <div className="text-2xl font-bold text-blue-600">{complianceStats.info}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document, Task, Signature Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Documents by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map(stat => (
                <div key={stat.status} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground capitalize">
                    {stat.status.toLowerCase().replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium">{stat._count}</span>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-muted-foreground">No documents yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map(stat => (
                <div key={stat.status} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground capitalize">
                    {stat.status.toLowerCase().replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium">{stat._count}</span>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signatures by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signatures.map(stat => (
                <div key={stat.status} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground capitalize">
                    {stat.status.toLowerCase().replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium">{stat._count}</span>
                </div>
              ))}
              {signatures.length === 0 && (
                <p className="text-sm text-muted-foreground">No signatures yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Types & Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>By Transaction Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typeData.map(item => (
                <div key={item.type} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {item.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statusData.map(item => (
                <div key={item.status} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground capitalize">
                    {item.status.toLowerCase().replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loop Velocity (Last 6 Months) */}
      <Card>
        <CardHeader>
          <CardTitle>Loop Velocity (Last 6 Months)</CardTitle>
          <CardDescription>Loops created per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {velocity.map(point => (
              <div key={point.month} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{point.month}</span>
                <span className="text-sm font-medium">{point.count}</span>
              </div>
            ))}
            {velocity.length === 0 && (
              <p className="text-sm text-muted-foreground">No data for the selected period</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transaction Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and compliance tracking for all transaction loops
        </p>
      </div>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}
