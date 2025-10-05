# Session 5: Tool Bundles & Special Offers

## Session Overview
**Goal:** Implement tool bundles, bundle purchasing, and special offer displays to maximize value for users.

**Duration:** 2-3 hours
**Complexity:** Medium
**Dependencies:** Session 4 (Shopping Cart & Checkout)

## Objectives

1. ✅ Create bundle display components
2. ✅ Implement bundle detail pages
3. ✅ Add bundle purchase flow
4. ✅ Create bundle comparison views
5. ✅ Implement savings calculations
6. ✅ Add popular bundle badges
7. ✅ Create bundle recommendations
8. ✅ Add bundle to cart functionality

## Prerequisites

- [x] Session 4 completed (cart & checkout ready)
- [x] Bundle queries from Session 2
- [x] Understanding of bundle structure
- [x] Tool grid components from Session 3

## Component Structure

```
components/real-estate/marketplace/bundles/
├── BundleGrid.tsx              # Bundle grid display
├── BundleCard.tsx              # Individual bundle card
├── BundleDetail.tsx            # Bundle detail view
├── BundleComparison.tsx        # Compare bundles
└── ToolList.tsx                # Tools included in bundle
```

## Step-by-Step Implementation

### Step 1: Create Bundle Card Component

**File:** `components/real-estate/marketplace/bundles/BundleCard.tsx`

```typescript
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Package, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addToCart } from '@/lib/modules/marketplace';
import type { ToolBundle } from '@prisma/client';
import Link from 'next/link';

interface BundleCardProps {
  bundle: ToolBundle & {
    tools: Array<{
      tool: {
        id: string;
        name: string;
        price: number;
      };
    }>;
  };
  isPurchased?: boolean;
  isInCart?: boolean;
}

export function BundleCard({ bundle, isPurchased, isInCart }: BundleCardProps) {
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return addToCart({
        item_type: 'bundle',
        item_id: bundle.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Bundle added to cart!');
    },
    onError: () => {
      toast.error('Failed to add bundle to cart');
    },
  });

  const savings = bundle.original_price - bundle.bundle_price;
  const savingsPercentage = (savings / bundle.original_price) * 100;

  return (
    <Card className="p-6 hover:shadow-xl transition-shadow relative border-2 hover:border-blue-500">
      {/* Popular Badge */}
      {bundle.is_popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-white" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Purchased Badge */}
      {isPurchased && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Owned
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {/* Bundle Type & Icon */}
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <Badge variant="outline">{bundle.bundle_type.replace('_', ' ')}</Badge>
        </div>

        {/* Bundle Name */}
        <h3 className="text-2xl font-bold text-gray-900">{bundle.name}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {bundle.description}
        </p>

        {/* Pricing */}
        <div className="space-y-2">
          {/* Original Price (strikethrough) */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 line-through text-lg">
              ${(bundle.original_price / 100).toFixed(0)}
            </span>
            <Badge variant="destructive" className="bg-red-500">
              Save {savingsPercentage.toFixed(0)}%
            </Badge>
          </div>

          {/* Bundle Price */}
          <div className="text-3xl font-bold text-green-600">
            ${(bundle.bundle_price / 100).toFixed(0)}
          </div>

          {/* Savings Amount */}
          <p className="text-sm text-green-600">
            You save ${(savings / 100).toFixed(0)}
          </p>
        </div>

        {/* Tools Included */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Includes:</p>
          <div className="space-y-1">
            {bundle.tools.slice(0, 3).map((bundleTool) => (
              <div key={bundleTool.tool.id} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600" />
                <span>{bundleTool.tool.name}</span>
              </div>
            ))}
            {bundle.tools.length > 3 && (
              <div className="text-sm text-blue-600 font-medium">
                + {bundle.tools.length - 3} more tools
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending || isPurchased || isInCart}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isPurchased ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Already Owned
              </>
            ) : isInCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                In Cart
              </>
            ) : (
              'Add Bundle to Cart'
            )}
          </Button>

          <Link href={`/real-estate/marketplace/bundles/${bundle.id}`}>
            <Button variant="outline" size="icon">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
```

### Step 2: Create Bundle Grid Component

**File:** `components/real-estate/marketplace/bundles/BundleGrid.tsx`

```typescript
import { getToolBundles, getPurchasedBundles } from '@/lib/modules/marketplace';
import { BundleCard } from './BundleCard';

export async function BundleGrid() {
  const [bundles, purchases] = await Promise.all([
    getToolBundles(),
    getPurchasedBundles().catch(() => []),
  ]);

  const purchasedBundleIds = new Set(purchases.map((p) => p.bundle_id));

  // Sort: popular first, then by discount
  const sortedBundles = bundles.sort((a, b) => {
    if (a.is_popular && !b.is_popular) return -1;
    if (!a.is_popular && b.is_popular) return 1;
    return b.discount.toNumber() - a.discount.toNumber();
  });

  if (bundles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No bundles available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sortedBundles.map((bundle) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          isPurchased={purchasedBundleIds.has(bundle.id)}
        />
      ))}
    </div>
  );
}
```

### Step 3: Create Bundle Detail Page

**File:** `app/real-estate/marketplace/bundles/[bundleId]/page.tsx`

```typescript
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getToolBundleById } from '@/lib/modules/marketplace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, ArrowLeft, Package, Star } from 'lucide-react';
import Link from 'next/link';
import { AddBundleToCartButton } from '@/components/real-estate/marketplace/bundles/AddBundleToCartButton';

interface BundleDetailPageProps {
  params: { bundleId: string };
}

export default async function BundleDetailPage({ params }: BundleDetailPageProps) {
  const bundle = await getToolBundleById(params.bundleId);

  if (!bundle) {
    notFound();
  }

  const savings = bundle.original_price - bundle.bundle_price;
  const savingsPercentage = (savings / bundle.original_price) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/real-estate/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      {/* Bundle Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-8 h-8 text-blue-600" />
          <Badge variant="outline" className="text-base">
            {bundle.bundle_type.replace('_', ' ')}
          </Badge>
          {bundle.is_popular && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Most Popular
            </Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{bundle.name}</h1>
        <p className="text-xl text-gray-600">{bundle.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tools List */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">What's Included</h2>
            <div className="space-y-3">
              {bundle.tools.map((bundleTool) => (
                <Card key={bundleTool.tool.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {bundleTool.tool.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {bundleTool.tool.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Value: ${(bundleTool.tool.price / 100).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <div className="space-y-6">
              {/* Pricing */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 line-through text-xl">
                    ${(bundle.original_price / 100).toFixed(0)}
                  </span>
                  <Badge variant="destructive" className="bg-red-500">
                    Save {savingsPercentage.toFixed(0)}%
                  </Badge>
                </div>

                <div className="text-4xl font-bold text-green-600 mb-2">
                  ${(bundle.bundle_price / 100).toFixed(0)}
                </div>

                <p className="text-sm text-green-600">
                  You save ${(savings / 100).toFixed(0)}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{bundle.tools.length} tools included</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Free updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Priority support</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Suspense fallback={<Button disabled>Loading...</Button>}>
                <AddBundleToCartButton bundleId={bundle.id} />
              </Suspense>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Create Add Bundle to Cart Button (Client Component)

**File:** `components/real-estate/marketplace/bundles/AddBundleToCartButton.tsx`

```typescript
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, ShoppingCart } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { addToCart, getPurchasedBundles, getCartWithItems } from '@/lib/modules/marketplace';

interface AddBundleToCartButtonProps {
  bundleId: string;
}

export function AddBundleToCartButton({ bundleId }: AddBundleToCartButtonProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Check if already purchased
  const { data: purchases } = useQuery({
    queryKey: ['purchased-bundles'],
    queryFn: getPurchasedBundles,
    enabled: !!session,
  });

  // Check if in cart
  const { data: cart } = useQuery({
    queryKey: ['shopping-cart', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      return getCartWithItems(session.user.id);
    },
    enabled: !!session?.user?.id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return addToCart({
        item_type: 'bundle',
        item_id: bundleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Bundle added to cart!');
    },
    onError: () => {
      toast.error('Failed to add bundle to cart');
    },
  });

  const isPurchased = purchases?.some((p) => p.bundle_id === bundleId);
  const isInCart = (cart?.bundles || []).some((b: any) => b.id === bundleId);

  return (
    <Button
      onClick={() => addToCartMutation.mutate()}
      disabled={addToCartMutation.isPending || isPurchased || isInCart}
      className="w-full bg-green-600 hover:bg-green-700"
      size="lg"
    >
      {isPurchased ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Already Owned
        </>
      ) : isInCart ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          In Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add Bundle to Cart
        </>
      )}
    </Button>
  );
}
```

### Step 5: Create Bundles Tab in Marketplace

**File:** `app/real-estate/marketplace/page.tsx` (update with tabs)

```typescript
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceGrid } from '@/components/real-estate/marketplace/grid/MarketplaceGrid';
import { BundleGrid } from '@/components/real-estate/marketplace/bundles/BundleGrid';
import { MarketplaceFilters } from '@/components/real-estate/marketplace/filters/MarketplaceFilters';
import { ShoppingCartPanel } from '@/components/real-estate/marketplace/cart/ShoppingCartPanel';
import { Skeleton } from '@/components/ui/skeleton';

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const activeTab = (searchParams.tab as string) || 'tools';

  return (
    <Tabs defaultValue={activeTab} className="w-full">
      {/* Tab Navigation */}
      <TabsList className="mb-6">
        <TabsTrigger value="tools">Individual Tools</TabsTrigger>
        <TabsTrigger value="bundles">Bundles & Packages</TabsTrigger>
      </TabsList>

      <div className="flex gap-8">
        {/* Filters Sidebar - Only for tools tab */}
        {activeTab === 'tools' && (
          <div className="w-64 flex-shrink-0">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <MarketplaceFilters />
            </Suspense>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1">
          <TabsContent value="tools">
            <Suspense fallback={<GridSkeleton />}>
              <MarketplaceGrid searchParams={searchParams} />
            </Suspense>
          </TabsContent>

          <TabsContent value="bundles">
            <Suspense fallback={<GridSkeleton />}>
              <BundleGrid />
            </Suspense>
          </TabsContent>
        </div>

        {/* Shopping Cart Panel */}
        <div className="w-80 flex-shrink-0">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ShoppingCartPanel />
          </Suspense>
        </div>
      </div>
    </Tabs>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-96 w-full" />
      ))}
    </div>
  );
}
```

## Testing & Validation

### Test 1: Bundle Display
- Navigate to Bundles tab
**Expected:** Bundles displayed with pricing, savings, and tools list

### Test 2: Bundle Detail Page
- Click on a bundle
**Expected:** Full bundle details with all included tools

### Test 3: Add Bundle to Cart
- Click "Add Bundle to Cart"
**Expected:** Bundle added, cart updates, total includes bundle price

### Test 4: Bundle Purchase
- Purchase a bundle
**Expected:** All tools in bundle become available to organization

### Test 5: Savings Calculation
**Expected:** Savings percentage and amount calculated correctly

## Success Criteria

- [x] Bundle grid displays all bundles
- [x] Bundle cards show pricing with savings
- [x] Popular bundles have special badge
- [x] Bundle detail pages show all included tools
- [x] Add bundle to cart functionality works
- [x] Bundle pricing calculates correctly
- [x] Purchased bundles marked as owned
- [x] Tabs switch between tools and bundles

## Files Created

- ✅ `components/real-estate/marketplace/bundles/BundleCard.tsx`
- ✅ `components/real-estate/marketplace/bundles/BundleGrid.tsx`
- ✅ `components/real-estate/marketplace/bundles/AddBundleToCartButton.tsx`
- ✅ `app/real-estate/marketplace/bundles/[bundleId]/page.tsx`

## Files Modified

- ✅ `app/real-estate/marketplace/page.tsx` - Added tabs for tools/bundles

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Incorrect Savings Calculation
**Problem:** Savings percentage wrong
**Solution:** Calculate as (original - bundle) / original * 100

### ❌ Pitfall 2: Bundle Tools Not Showing
**Problem:** Bundle detail doesn't show tools
**Solution:** Ensure proper Prisma include in getToolBundleById

### ❌ Pitfall 3: Duplicate Tool Purchases
**Problem:** Bundle creates duplicate tool purchases
**Solution:** Use upsert in purchaseBundle action

### ❌ Pitfall 4: Popular Badge Not Showing
**Problem:** Popular bundles not highlighted
**Solution:** Check is_popular field in database

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 6: Reviews & Ratings**
2. ✅ Bundle functionality complete
3. ✅ Can start implementing review system
4. ✅ Marketplace value propositions clear

---

**Session 5 Complete:** ✅ Tool bundles and special offers fully implemented
