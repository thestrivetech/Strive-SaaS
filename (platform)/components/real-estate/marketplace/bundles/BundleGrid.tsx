import React from 'react';
import { getToolBundles, getPurchasedBundles } from '@/lib/modules/marketplace';
import { BundleCardWithCart } from './BundleCardWithCart';

interface BundleGridProps {
  cartBundleIds?: string[];
}

export async function BundleGrid({ cartBundleIds = [] }: BundleGridProps) {
  // Fetch bundles and purchases
  const [bundles, purchases] = await Promise.all([
    getToolBundles(),
    getPurchasedBundles().catch(() => []), // Ignore errors if not authenticated
  ]);

  const purchasedBundleIds = new Set(purchases.map((p) => p.bundle_id));
  const cartBundleIdsSet = new Set(cartBundleIds);

  // Sort: Popular first, then by discount percentage
  const sortedBundles = [...bundles].sort((a, b) => {
    // Popular bundles first
    if (a.is_popular && !b.is_popular) return -1;
    if (!a.is_popular && b.is_popular) return 1;

    // Then by discount percentage
    const aDiscount = Number(a.discount) || 0;
    const bDiscount = Number(b.discount) || 0;
    return bDiscount - aDiscount;
  });

  if (sortedBundles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No bundles available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedBundles.map((bundle) => (
        <BundleCardWithCart
          key={bundle.id}
          bundle={bundle}
          isPurchased={purchasedBundleIds.has(bundle.id)}
          isInCart={cartBundleIdsSet.has(bundle.id)}
        />
      ))}
    </div>
  );
}
