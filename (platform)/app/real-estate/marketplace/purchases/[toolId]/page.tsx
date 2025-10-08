import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { getToolPurchaseDetails } from '@/lib/modules/marketplace';

/**
 * Individual Tool Management Page
 *
 * Detailed view and management for a specific purchased tool:
 * - Tool header with name and description
 * - Stats cards (Total Usage, Purchase Date, Price Paid)
 * - Features & Capabilities list
 * - Back button to purchases list
 *
 * @protected - Requires authentication and tool ownership
 * @route /real-estate/marketplace/purchases/[toolId]
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Manage Tool | Strive Platform',
    description: 'Manage your purchased tool settings and view usage details',
  };
}

export default async function ToolManagementPage({
  params,
}: {
  params: { toolId: string };
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

  // Fetch tool purchase details
  const purchase = await getToolPurchaseDetails(params.toolId);

  if (!purchase) {
    notFound();
  }

  const { tool } = purchase;

  // Format values
  const priceLabel = purchase.price_at_purchase === 0
    ? 'FREE'
    : `$${(purchase.price_at_purchase / 100).toFixed(2)}`;

  const purchaseDate = new Date(purchase.purchase_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lastUsedDate = purchase.last_used
    ? new Date(purchase.last_used).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

  // Mock features (in real app, these would come from tool.features field)
  const features = [
    'Full API access and integration',
    'Advanced analytics and reporting',
    'Priority customer support',
    'Unlimited usage and storage',
    'Regular updates and improvements',
    'Custom configuration options',
  ];

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="space-y-6">
        {/* Back Button */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/real-estate/marketplace/purchases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Purchases
          </Link>
        </Button>

        {/* Tool Header */}
        <Card className="glass-strong neon-border-cyan">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl">{tool.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{tool.category}</Badge>
                      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base mt-2">
                  {tool.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={TrendingUp}
            title="Total Usage"
            value={purchase.usage_count.toString()}
            description={`Last used: ${lastUsedDate}`}
          />
          <StatCard
            icon={Calendar}
            title="Purchase Date"
            value={purchaseDate.split(',')[0]}
            description={purchaseDate.split(',').slice(1).join(',')}
          />
          <StatCard
            icon={DollarSign}
            title="Price Paid"
            value={priceLabel}
            description="One-time purchase"
          />
        </div>

        {/* Features & Capabilities */}
        <Card className="glass-strong neon-border-purple">
          <CardHeader>
            <CardTitle>Features & Capabilities</CardTitle>
            <CardDescription>
              What you get with {tool.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="glass neon-border-green">
          <CardHeader>
            <CardTitle>Tool Management</CardTitle>
            <CardDescription>Manage your tool settings and access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/real-estate/marketplace/tools/${tool.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Tool Details
                </Link>
              </Button>
              <Button variant="outline">
                Configure Settings
              </Button>
              <Button variant="outline">
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Info */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Purchased by</span>
              <span className="font-medium">
                {purchase.purchaser.name || purchase.purchaser.email}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Purchase Date</span>
              <span className="font-medium">{purchaseDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{purchase.status}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Price Paid</span>
              <span className="font-medium">{priceLabel}</span>
            </div>
          </CardContent>
        </Card>
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
