import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getTransactionAnalytics } from '@/lib/modules/transactions/analytics/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Main Platform Dashboard
 *
 * Landing page showing overview of CRM, Projects, and Transactions
 * Role-based stats display
 *
 * @protected - Requires authentication
 */

export default async function DashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Check if user can access transactions (EMPLOYEE, MODERATOR, SUPER_ADMIN)
  const canAccessTransactions = ['EMPLOYEE', 'MODERATOR', 'SUPER_ADMIN'].includes(
    user.role
  );

  // Fetch transaction stats if user has access
  let transactionStats = null;
  if (canAccessTransactions) {
    try {
      const analytics = await getTransactionAnalytics();
      transactionStats = analytics.overview;
    } catch (error) {
      console.error('Failed to load transaction stats:', error);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening across your organization
          </p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CRM Card */}
        <Link href="/real-estate/crm">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CRM</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Contacts & Leads</div>
              <p className="text-xs text-muted-foreground">
                Manage customer relationships
              </p>
              <Button variant="ghost" size="sm" className="mt-2">
                Go to CRM
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Projects Card */}
        <Link href="/projects">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Project Management</div>
              <p className="text-xs text-muted-foreground">
                Track project progress
              </p>
              <Button variant="ghost" size="sm" className="mt-2">
                Go to Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Transaction Management Card - Only for employees */}
        {canAccessTransactions && transactionStats && (
          <Link href="/real-estate/transactions">
            <Card className="cursor-pointer transition-all hover:shadow-lg border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions
                </CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionStats.activeLoops}</div>
                <p className="text-xs text-muted-foreground">
                  Active Transactions
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Go to Transactions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Dashboard Overview Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overview</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dashboard</div>
            <p className="text-xs text-muted-foreground">
              Organization insights
            </p>
            <Button variant="ghost" size="sm" className="mt-2" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Stats Section - Only for employees */}
      {canAccessTransactions && transactionStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactionStats.totalLoops}</div>
              <p className="text-xs text-muted-foreground">
                All transaction loops
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {transactionStats.activeLoops}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {transactionStats.closedLoops}
              </div>
              <p className="text-xs text-muted-foreground">Successfully closed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Close Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(transactionStats.avgClosingDays)} days
              </div>
              <p className="text-xs text-muted-foreground">Average to close</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/real-estate/crm/contacts">
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold">Add Contact</h3>
                <p className="text-sm text-muted-foreground">
                  Create a new contact in CRM
                </p>
              </CardContent>
            </Card>
          </Link>

          {canAccessTransactions && (
            <Link href="/real-estate/transactions">
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="pt-6">
                  <FileText className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold">New Transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new transaction loop
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/projects">
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="pt-6">
                <FolderKanban className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold">Create Project</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new project
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
