import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import type { UserWithOrganization } from '@/lib/auth/user-helpers';
import { EnhancedCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Store,
  Package,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { MarketplaceGrid } from '@/components/real-estate/marketplace/grid/MarketplaceGrid';
import { BundleGrid } from '@/components/real-estate/marketplace/bundles/BundleGrid';
import { ShoppingCartPanel } from '@/components/real-estate/marketplace/cart/ShoppingCartPanel';
import { getShoppingCart } from '@/lib/modules/marketplace';

/**
 * Marketplace Dashboard Page
 *
 * Complete dashboard for Tool Marketplace module with:
 * - Personalized hero section with greeting
 * - Stats cards showing marketplace metrics (mock data)
 * - Featured tools grid with pricing
 * - Active subscriptions section
 * - Popular tools widget
 * - Quick actions
 *
 * Business Model:
 * - FREE tier: View marketplace only
 * - CUSTOM tier: Pay-per-use marketplace access
 * - STARTER+: Included tools based on tier
 * - Developer API for third-party submissions (future)
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/marketplace/dashboard
 */
export const metadata: Metadata = {
  title: 'Tool Marketplace Dashboard | Strive Platform',
  description: 'Discover and manage third-party tools and integrations',
};

// Mock Data for demonstration
const MOCK_SUBSCRIPTIONS = [
  {
    id: '1',
    toolName: 'Email Automation Pro',
    renewalDate: '2025-11-08',
    price: 29,
    status: 'active',
  },
  {
    id: '2',
    toolName: 'Analytics Pro',
    renewalDate: '2025-10-25',
    price: 79,
    status: 'active',
  },
  {
    id: '3',
    toolName: 'CRM Sync Hub',
    renewalDate: '2025-11-15',
    price: 39,
    status: 'active',
  },
  {
    id: '4',
    toolName: 'Report Builder Plus',
    renewalDate: '2025-10-20',
    price: 59,
    status: 'expiring_soon',
  },
];

const MOCK_POPULAR_TOOLS = [
  { name: 'Email Automation Pro', installs: 1247 },
  { name: 'DocuSign Integration', installs: 892 },
  { name: 'Analytics Pro', installs: 756 },
  { name: 'CRM Sync Hub', installs: 634 },
  { name: 'SMS Gateway', installs: 521 },
];

export default async function MarketplaceDashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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

  // Get cart data for checking what's in cart
  const cart = await getShoppingCart(user.id).catch(() => null);
  const cartBundleIds = (cart?.bundles as string[]) || [];

  const activeTab = (searchParams.tab as string) || 'tools';

  return (
    <div className="space-y-6">
      {/* Hero Section with KPIs */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSectionWrapper user={user} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - 3/4 width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs for Tools and Bundles */}
          <Tabs defaultValue={activeTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Individual Tools
              </TabsTrigger>
              <TabsTrigger value="bundles" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Bundles & Packages
              </TabsTrigger>
            </TabsList>

            {/* Individual Tools Tab */}
            <TabsContent value="tools" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Featured Tools</h3>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/real-estate/marketplace/browse">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Suspense fallback={<div className="text-center py-12">Loading tools...</div>}>
                  <MarketplaceGrid searchParams={searchParams} />
                </Suspense>
              </div>
            </TabsContent>

            {/* Bundles Tab */}
            <TabsContent value="bundles" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Tool Bundles & Packages</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Save big with curated bundles of professional tools
                    </p>
                  </div>
                </div>
                <Suspense fallback={<div className="text-center py-12">Loading bundles...</div>}>
                  <BundleGrid cartBundleIds={cartBundleIds} />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>

          {/* Active Subscriptions Section */}
          <EnhancedCard glassEffect="strong" neonBorder="green" hoverEffect={true}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Subscriptions</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/real-estate/marketplace/subscriptions">
                    Manage All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>Your active tool subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_SUBSCRIPTIONS.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No active subscriptions</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/real-estate/marketplace/browse">
                      Browse tools to get started
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {MOCK_SUBSCRIPTIONS.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              )}
            </CardContent>
          </EnhancedCard>

          {/* Popular Tools Widget */}
          <EnhancedCard glassEffect="strong" neonBorder="orange" hoverEffect={true}>
            <CardHeader>
              <CardTitle>Popular Tools</CardTitle>
              <CardDescription>Most installed by real estate professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_POPULAR_TOOLS.map((tool, index) => (
                  <div
                    key={tool.name}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <p className="font-medium">{tool.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{tool.installs.toLocaleString()} installs</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </EnhancedCard>

          {/* Quick Actions */}
          <EnhancedCard glassEffect="medium" neonBorder="purple" hoverEffect={true}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common marketplace tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href="/real-estate/marketplace/browse">
                    Browse Tools
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/real-estate/marketplace/subscriptions">
                    Manage Subscriptions
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/real-estate/marketplace/usage">
                    View Usage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Shopping Cart Panel - Right column (always visible) */}
        <div className="lg:col-span-1">
          <ShoppingCartPanel userId={user.id} />
        </div>
      </div>
    </div>
  );
}

/**
 * Hero Section Wrapper
 * Passes marketplace stats to ModuleHeroSection
 */
async function HeroSectionWrapper({ user }: { user: UserWithOrganization }) {
  const stats = [
    {
      label: 'Available Tools',
      value: '47',
      icon: 'projects' as const,
    },
    {
      label: 'Active Subscriptions',
      value: '8',
      icon: 'tasks' as const,
    },
    {
      label: 'Total Savings',
      value: '$340/mo',
      icon: 'revenue' as const,
    },
    {
      label: 'Popular Tools',
      value: '12',
      icon: 'customers' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="Tool Marketplace"
      moduleDescription="Discover and manage third-party tools and integrations"
      stats={stats}
    />
  );
}

// Helper Components

interface SubscriptionCardProps {
  subscription: {
    id: string;
    toolName: string;
    renewalDate: string;
    price: number;
    status: string;
  };
}

function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const isExpiringSoon = subscription.status === 'expiring_soon';

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isExpiringSoon ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
            {isExpiringSoon ? (
              <Clock className="h-4 w-4 text-yellow-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div>
            <p className="font-medium">{subscription.toolName}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>Renews {new Date(subscription.renewalDate).toLocaleDateString()}</span>
              <span>•</span>
              <span>${subscription.price}/mo</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isExpiringSoon && (
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
            Expiring Soon
          </span>
        )}
        <Button asChild variant="ghost" size="sm">
          <Link href={`/real-estate/marketplace/subscriptions/${subscription.id}`}>
            Manage
          </Link>
        </Button>
      </div>
    </div>
  );
}
