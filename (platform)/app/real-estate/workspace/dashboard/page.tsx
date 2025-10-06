import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from '@/components/real-estate/workspace/stats-cards';
import { CreateLoopDialog } from '@/components/real-estate/workspace/create-loop-dialog';
import { getLoopStats } from '@/lib/modules/transactions';
import { getRecentActivity } from '@/lib/modules/transactions/activity';
import { FileText, Users, CheckSquare, Clock, Upload, FileSignature } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Workspace Dashboard | Transaction Management',
  description: 'Overview of your transaction workspace with quick actions and recent activity',
};

async function WorkspaceDashboard() {
  const [stats, recentActivity] = await Promise.all([
    getLoopStats(),
    getRecentActivity(10),
  ]);

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <StatsCards stats={stats} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Start new transactions or explore workspace features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CreateLoopDialog />
            <Link href="/real-estate/workspace/listings">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Browse Listings
              </Button>
            </Link>
            <Link href="/real-estate/workspace/analytics">
              <Button variant="outline" className="w-full">
                <FileSignature className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates across all transaction loops</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b last:border-b-0"
                >
                  <div className="mt-1">
                    {activity.action === 'CREATE' && activity.entityType === 'document' && (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.action === 'CREATE' && activity.entityType === 'party' && (
                      <Users className="h-4 w-4 text-green-600" />
                    )}
                    {activity.action === 'UPDATE' && activity.entityType === 'task' && (
                      <CheckSquare className="h-4 w-4 text-purple-600" />
                    )}
                    {!(
                      (activity.action === 'CREATE' && activity.entityType === 'document') ||
                      (activity.action === 'CREATE' && activity.entityType === 'party') ||
                      (activity.action === 'UPDATE' && activity.entityType === 'task')
                    ) && (
                      <Clock className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.action} {activity.entityType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user.name || activity.user.email} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {activity.entityType === 'loop' && (
                    <Link href={`/real-estate/workspace/${activity.entityId}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity. Create a transaction loop to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/real-estate/workspace/listings">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Property Listings</CardTitle>
              <CardDescription>Browse and manage property listings</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/real-estate/workspace/analytics">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Analytics</CardTitle>
              <CardDescription>View transaction performance and insights</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/real-estate/crm/dashboard">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">CRM</CardTitle>
              <CardDescription>Manage contacts, leads, and deals</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function WorkspaceDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Workspace Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your transaction management workspace
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <WorkspaceDashboard />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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

      {/* Quick actions skeleton */}
      <Skeleton className="h-40 w-full" />

      {/* Recent activity skeleton */}
      <Skeleton className="h-64 w-full" />

      {/* Navigation links skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
