import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Layers, DollarSign } from 'lucide-react';
import { PurchasedToolsList } from '@/components/real-estate/marketplace/purchases/PurchasedToolsList';
import { PurchaseHistory } from '@/components/real-estate/marketplace/purchases/PurchaseHistory';
import {
  getPurchasedToolsWithStats,
  getPurchasedBundles,
} from '@/lib/modules/marketplace';

/**
 * Purchased Tools Dashboard Page
 *
 * Comprehensive dashboard for managing purchased tools with:
 * - Stats overview (Active Tools, Active Bundles, Total Investment)
 * - Tabs for "My Tools" and "Purchase History"
 * - Search and filter functionality
 * - Tool cards with usage stats
 * - Purchase history table view
 * - Individual tool management access
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/marketplace/purchases
 */
export const metadata: Metadata = {
  title: 'Purchased Tools | Strive Platform',
  description: 'Manage your purchased tools and view purchase history',
};

export default async function PurchasedToolsPage() {
  // Require authentication
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Require organization membership
  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Fetch purchased tools and bundles
  const [toolsData, bundlePurchases] = await Promise.all([
    getPurchasedToolsWithStats(),
    getPurchasedBundles(),
  ]);

  const { purchases, totalInvestment, totalCount } = toolsData;

  // Stats for overview cards
  const activeBundlesCount = bundlePurchases.filter(
    (bp: { status: string }) => bp.status === 'ACTIVE'
  ).length;

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-cyan">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
              My Purchased Tools
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage your tools, view usage stats, and track your investments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Package}
            title="Active Tools"
            value={totalCount.toString()}
            description="Individual tools"
          />
          <StatCard
            icon={Layers}
            title="Active Bundles"
            value={activeBundlesCount.toString()}
            description="Tool bundles"
          />
          <StatCard
            icon={DollarSign}
            title="Total Investment"
            value={`$${(totalInvestment / 100).toFixed(2)}`}
            description="Lifetime spending"
          />
        </div>

        {/* Tabs for Tools and History */}
        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="tools">My Tools</TabsTrigger>
            <TabsTrigger value="history">Purchase History</TabsTrigger>
          </TabsList>

          {/* My Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <PurchasedToolsList
              purchases={purchases}
              bundlePurchases={bundlePurchases}
            />
          </TabsContent>

          {/* Purchase History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="glass-strong neon-border-green">
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                <PurchaseHistory
                  toolPurchases={purchases}
                  bundlePurchases={bundlePurchases}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
}

function StatCard({ icon: Icon, title, value, description }: StatCardProps) {
  return (
    <Card className="glass-strong neon-border-purple hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
