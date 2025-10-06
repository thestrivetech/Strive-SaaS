import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Wrench, LayoutDashboard, Package } from 'lucide-react';

/**
 * Marketplace Dashboard Page
 *
 * Main dashboard for Tool & Dashboard Marketplace
 * Allows users to browse, purchase, and manage installed tools
 *
 * @protected - Requires authentication
 * @future - Will display available tools, installed tools, and recommendations
 */
export default async function MarketplaceDashboardPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8" />
            Tool Marketplace
          </h1>
          <p className="text-muted-foreground">
            Browse and install tools to enhance your real estate business
          </p>
        </div>
      </div>

      {/* Coming Soon - Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <CardTitle>Tools</CardTitle>
            </div>
            <CardDescription>
              Browse available tools to add functionality to your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon - explore and install third-party integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <CardTitle>Dashboards</CardTitle>
            </div>
            <CardDescription>
              Install custom dashboards tailored to your workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon - add specialized views and analytics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Installed</CardTitle>
            </div>
            <CardDescription>
              Manage your installed tools and dashboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon - view and configure installed items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Future Implementation Areas */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
          <CardDescription>
            This module is under development. Upcoming features include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Browse available tools and dashboards</li>
            <li>Install tools with one-click integration</li>
            <li>Subscription-based tool access (FREE, CUSTOM tiers)</li>
            <li>Custom dashboard creation and installation</li>
            <li>Tool configuration and management</li>
            <li>Usage analytics and recommendations</li>
            <li>Developer API for third-party tool submission</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
