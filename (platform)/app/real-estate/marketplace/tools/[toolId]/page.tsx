import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/auth-helpers';
import {
  getMarketplaceToolById,
  getToolPurchase,
  getUserReviewForTool,
} from '@/lib/modules/marketplace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingDistribution } from '@/components/real-estate/marketplace/reviews/RatingDistribution';
import { ReviewList } from '@/components/real-estate/marketplace/reviews/ReviewList';
import { ReviewForm } from '@/components/real-estate/marketplace/reviews/ReviewForm';
import { StarRating } from '@/components/real-estate/marketplace/reviews/StarRating';
import {
  ShoppingCart,
  Check,
  Package,
  Shield,
  Zap,
  BarChart,
} from 'lucide-react';

interface PageProps {
  params: {
    toolId: string;
  };
}

/**
 * Generate dynamic metadata for tool detail pages
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tool = await getMarketplaceToolById(params.toolId);

  if (!tool) {
    return {
      title: 'Tool Not Found | Strive Tech Marketplace',
    };
  }

  return {
    title: `${tool.name} | Strive Tech Marketplace`,
    description: tool.description || `${tool.name} - Available in the Strive Tech Marketplace`,
    keywords: [tool.name, tool.category, tool.tier, 'marketplace', 'real estate tools'],
    openGraph: {
      title: `${tool.name} | Strive Tech Marketplace`,
      description: tool.description || `${tool.name} - Available in the Strive Tech Marketplace`,
      type: 'website',
    },
  };
}

/**
 * Tool Detail Page
 *
 * Displays complete information about a marketplace tool:
 * - Tool overview (description, pricing, category, tier)
 * - Purchase status and actions
 * - Reviews tab with rating distribution
 * - Review form (only if user purchased tool)
 *
 * SECURITY:
 * - Requires authentication
 * - Purchase verification for review form
 * - Multi-tenant isolation
 */
export default async function ToolDetailPage({ params }: PageProps) {
  await requireAuth();
  const { toolId } = params;

  // Fetch tool details
  const tool = await getMarketplaceToolById(toolId);

  if (!tool) {
    notFound();
  }

  // Check if user/org has purchased this tool
  const purchase = await getToolPurchase(toolId);
  const hasPurchased = !!purchase;

  // Get user's existing review if any
  const userReview = await getUserReviewForTool(toolId);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Tool Header */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{tool.category}</Badge>
              <Badge
                variant={tool.tier === 'FREE' ? 'secondary' : 'default'}
              >
                {tool.tier}
              </Badge>
              {hasPurchased && (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  <Check className="h-3 w-3" />
                  Purchased
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold">{tool.name}</h1>

            {/* Rating */}
            {tool.rating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={tool.rating} size="md" />
                <span className="text-sm text-muted-foreground">
                  {tool.rating.toFixed(1)} ({tool._count?.reviews || 0}{' '}
                  {tool._count?.reviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          <p className="text-lg text-muted-foreground">{tool.description}</p>

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Key Features:</h3>
              <ul className="grid gap-2">
                {(tool.features as string[]).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar: Pricing & Actions */}
        <Card className="w-full md:w-80">
          <CardHeader>
            <CardTitle className="text-3xl">
              {tool.tier === 'FREE' ? 'Free' : `$${tool.price}`}
            </CardTitle>
            <CardDescription>
              {tool.tier === 'FREE' ? 'Pre-installed' : 'One-time purchase'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPurchased ? (
              <Button className="w-full" disabled>
                <Check className="mr-2 h-4 w-4" />
                Already Purchased
              </Button>
            ) : (
              <Button className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>Instant access after purchase</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart className="h-4 w-4" />
                <span>{tool._count?.purchases || 0} organizations using this</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Overview & Reviews */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({tool._count?.reviews || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Tool</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>{tool.description}</p>

              {tool.tags && tool.tags.length > 0 && (
                <div className="mt-6 not-prose">
                  <h4 className="font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(tool.tags as string[]).map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar: Rating Distribution */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<RatingDistributionSkeleton />}>
                    <RatingDistribution toolId={toolId} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Main: Reviews List & Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Review Form (only if purchased) */}
              {hasPurchased && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {userReview ? 'Update Your Review' : 'Write a Review'}
                    </CardTitle>
                    <CardDescription>
                      Share your experience with this tool
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReviewForm toolId={toolId} existingReview={userReview} />
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <Card>
                <CardContent className="pt-6">
                  <Suspense fallback={<ReviewListSkeleton />}>
                    <ReviewList toolId={toolId} limit={20} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RatingDistributionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-16 w-20 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 p-4 rounded-lg border">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
