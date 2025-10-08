import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Mail,
  FileSignature,
  BarChart3,
  Link2,
  Megaphone,
  FileText,
  Calendar,
  MessageSquare,
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
const MOCK_STATS = {
  availableTools: 47,
  activeSubscriptions: 8,
  monthlySavings: 340,
  popularTools: 12,
};

const MOCK_FEATURED_TOOLS = [
  {
    id: '1',
    name: 'Email Automation Pro',
    category: 'Marketing',
    description: 'Automate email campaigns and lead nurturing workflows',
    price: 29,
    priceLabel: '$29/mo',
    borderColor: 'neon-border-cyan',
    iconBg: 'bg-cyan-500',
    icon: Mail,
  },
  {
    id: '2',
    name: 'DocuSign Integration',
    category: 'Legal',
    description: 'Digital document signing and contract management',
    price: 49,
    priceLabel: '$49/mo',
    borderColor: 'neon-border-green',
    iconBg: 'bg-green-500',
    icon: FileSignature,
  },
  {
    id: '3',
    name: 'Analytics Pro',
    category: 'Analytics',
    description: 'Advanced analytics and data visualization platform',
    price: 79,
    priceLabel: '$79/mo',
    borderColor: 'neon-border-orange',
    iconBg: 'bg-orange-500',
    icon: BarChart3,
  },
  {
    id: '4',
    name: 'CRM Sync Hub',
    category: 'Integration',
    description: 'Connect and sync data with external CRM systems',
    price: 39,
    priceLabel: '$39/mo',
    borderColor: 'neon-border-purple',
    iconBg: 'bg-purple-500',
    icon: Link2,
  },
  {
    id: '5',
    name: 'Lead Capture Widget',
    category: 'Marketing',
    description: 'Customizable lead capture forms and popups',
    price: 0,
    priceLabel: 'FREE',
    borderColor: 'neon-border-cyan',
    iconBg: 'bg-cyan-500',
    icon: Megaphone,
  },
  {
    id: '6',
    name: 'Report Builder Plus',
    category: 'Analytics',
    description: 'Create custom reports and automated dashboards',
    price: 59,
    priceLabel: '$59/mo',
    borderColor: 'neon-border-green',
    iconBg: 'bg-green-500',
    icon: FileText,
  },
  {
    id: '7',
    name: 'Calendar Sync Pro',
    category: 'Productivity',
    description: 'Sync calendars across platforms and teams',
    price: 19,
    priceLabel: '$19/mo',
    borderColor: 'neon-border-orange',
    iconBg: 'bg-orange-500',
    icon: Calendar,
  },
  {
    id: '8',
    name: 'SMS Gateway',
    category: 'Communication',
    description: 'Send automated SMS notifications and reminders',
    price: 25,
    priceLabel: '$25/mo',
    borderColor: 'neon-border-purple',
    iconBg: 'bg-purple-500',
    icon: MessageSquare,
  },
];

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
  const cartToolIds = (cart?.tools as string[]) || [];
  const cartBundleIds = (cart?.bundles as string[]) || [];

  // Helper function for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user.name?.split(' ')[0] || 'User';
  const activeTab = (searchParams.tab as string) || 'tools';

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content - Left 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hero Section with Personalized Greeting */}
          <div className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-cyan">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="inline-block">{getGreeting()},</span>{' '}
                <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                  {firstName}
                </span>
              </h1>
              <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-2">
                Tool Marketplace
              </h2>
              <p className="text-muted-foreground">
                Discover and manage third-party tools and integrations
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Store}
              title="Available Tools"
              value={MOCK_STATS.availableTools.toString()}
              description="In marketplace"
              borderColor="neon-border-purple"
            />
            <StatCard
              icon={Package}
              title="Active Subscriptions"
              value={MOCK_STATS.activeSubscriptions.toString()}
              description="Your tools"
              borderColor="neon-border-purple"
            />
            <StatCard
              icon={DollarSign}
              title="Total Savings"
              value={`$${MOCK_STATS.monthlySavings}/mo`}
              description="vs individual purchase"
              borderColor="neon-border-purple"
            />
            <StatCard
              icon={TrendingUp}
              title="Popular Tools"
              value={MOCK_STATS.popularTools.toString()}
              description="Trending"
              borderColor="neon-border-purple"
            />
          </div>

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
          <Card className="glass-strong neon-border-green">
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
          </Card>

          {/* Popular Tools Widget */}
          <Card className="glass-strong neon-border-orange">
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
          </Card>

          {/* Quick Actions */}
          <Card className="glass neon-border-purple">
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
          </Card>
        </div>

        {/* Shopping Cart Panel - Right column (always visible) */}
        <div className="lg:col-span-1">
          <ShoppingCartPanel userId={user.id} />
        </div>
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
  borderColor?: string;
}

function StatCard({ icon: Icon, title, value, description, borderColor = 'neon-border-purple' }: StatCardProps) {
  return (
    <Card className={`glass-strong ${borderColor} hover:shadow-lg transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    category: string;
    description: string;
    priceLabel: string;
    borderColor: string;
    iconBg: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Card className={`glass ${tool.borderColor} hover:shadow-md transition-all hover:-translate-y-1`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-full ${tool.iconBg}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {tool.priceLabel}
          </div>
        </div>
        <CardTitle className="text-lg">{tool.name}</CardTitle>
        <CardDescription className="text-xs">{tool.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {tool.description}
        </p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/real-estate/marketplace/tools/${tool.id}`}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

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
