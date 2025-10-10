import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getToolBundleById, getPurchasedBundles } from '@/lib/modules/marketplace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Star,
  Check,
  ArrowLeft,
  TrendingDown,
  CheckCircle2,
  Gift,
  Zap,
} from 'lucide-react';
import { AddBundleToCartButton } from '@/components/real-estate/marketplace/bundles/AddBundleToCartButton';

interface BundleDetailPageProps {
  params: {
    bundleId: string;
  };
}

export async function generateMetadata({ params }: BundleDetailPageProps): Promise<Metadata> {
  const bundle = await getToolBundleById(params.bundleId);

  if (!bundle) {
    return {
      title: 'Bundle Not Found | Strive Platform',
    };
  }

  return {
    title: `${bundle.name} | Tool Bundle | Strive Platform`,
    description: bundle.description || 'View bundle details and included tools',
  };
}

export default async function BundleDetailPage({ params }: BundleDetailPageProps) {
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

  // Fetch bundle and purchases
  const [bundle, purchases] = await Promise.all([
    getToolBundleById(params.bundleId),
    getPurchasedBundles().catch(() => []),
  ]);

  if (!bundle) {
    notFound();
  }

  const isPurchased = purchases.some((p: any) => p.bundle_id === bundle.id);
  const toolsList = bundle.tools || [];

  // Calculate savings
  const originalPrice = bundle.original_price || 0;
  const bundlePrice = bundle.bundle_price;
  const savings = originalPrice - bundlePrice;
  const savingsPercent = originalPrice > 0
    ? Math.round((savings / originalPrice) * 100)
    : 0;

  // Calculate total value (sum of individual tool prices)
  const totalValue = toolsList.reduce((sum: number, item: any) => sum + item.tool.price, 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/real-estate/marketplace/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bundle Header */}
          <Card className={`glass-strong ${bundle.is_popular ? 'neon-border-orange' : 'neon-border-purple'}`}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-full bg-purple-500">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge className={
                        bundle.bundle_type === 'STARTER' ? 'bg-blue-500 text-white' :
                        bundle.bundle_type === 'PROFESSIONAL' ? 'bg-purple-500 text-white' :
                        bundle.bundle_type === 'ENTERPRISE' ? 'bg-orange-500 text-white' :
                        'bg-green-500 text-white'
                      }>
                        {bundle.bundle_type}
                      </Badge>
                    </div>
                    {bundle.is_popular && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl mb-2">{bundle.name}</CardTitle>
                  <CardDescription className="text-base">
                    {bundle.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Included Tools */}
          <Card className="glass neon-border-green">
            <CardHeader>
              <CardTitle>What&apos;s Included</CardTitle>
              <CardDescription>
                {toolsList.length} professional tool{toolsList.length !== 1 ? 's' : ''} in this bundle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {toolsList.map((bundleTool: any, index: number) => (
                  <div key={bundleTool.tool.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <h4 className="font-semibold text-lg">{bundleTool.tool.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">
                          {bundleTool.tool.description || 'Professional tool for your business'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-muted-foreground">Individual price</p>
                        <p className="text-lg font-semibold">
                          ${(bundleTool.tool.price / 100).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Value vs Bundle Price */}
              <Separator className="my-6" />
              <div className="space-y-3 bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total individual value:</span>
                  <span className="font-medium">${(totalValue / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-green-600">
                  <span>Bundle price:</span>
                  <span>${(bundlePrice / 100).toFixed(0)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between items-center text-base font-semibold text-green-700">
                    <span>You save:</span>
                    <span>${(savings / 100).toFixed(0)} ({savingsPercent}%)</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bundle Benefits */}
          <Card className="glass neon-border-cyan">
            <CardHeader>
              <CardTitle>Bundle Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Best Value</h4>
                    <p className="text-sm text-muted-foreground">
                      Save {savingsPercent}% compared to buying individually
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Lifetime Access</h4>
                    <p className="text-sm text-muted-foreground">
                      One-time purchase, use forever
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Free Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Get all future updates at no extra cost
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Get help faster with bundle purchase
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Purchase Card - Right column */}
        <div className="lg:col-span-1">
          <Card className="glass-strong neon-border-purple sticky top-8">
            <CardHeader>
              <CardTitle>Purchase Bundle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="space-y-3">
                {originalPrice > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Regular price:</span>
                    <span className="line-through text-muted-foreground">
                      ${(originalPrice / 100).toFixed(0)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Bundle price:</span>
                  <span className="text-3xl font-bold text-green-600">
                    ${(bundlePrice / 100).toFixed(0)}
                  </span>
                </div>

                {savingsPercent > 0 && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-600">
                      Save {savingsPercent}% (${(savings / 100).toFixed(0)})
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Purchase Button */}
              {isPurchased ? (
                <div className="space-y-3">
                  <Button disabled className="w-full bg-green-100 text-green-800 cursor-not-allowed">
                    <Check className="w-4 h-4 mr-2" />
                    Already Purchased
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    You own this bundle. All tools are available in your organization.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AddBundleToCartButton
                    bundleId={bundle.id}
                    isPurchased={isPurchased}
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    All tools will be added to your organization after purchase
                  </p>
                </div>
              )}

              <Separator />

              {/* Quick Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tools included:</span>
                  <span className="font-medium">{toolsList.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total value:</span>
                  <span className="font-medium">${(totalValue / 100).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-green-600">
                  <span className="font-medium">Your savings:</span>
                  <span className="font-bold">${(savings / 100).toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
