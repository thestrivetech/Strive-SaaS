import { Metadata } from 'next';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import { ShoppingCartPanel } from '@/components/real-estate/marketplace/cart/ShoppingCartPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

/**
 * Shopping Cart Page
 *
 * Standalone page for reviewing and managing shopping cart items.
 * Users can:
 * - View all items in cart (tools and bundles)
 * - Remove items from cart
 * - Proceed to checkout
 * - Return to marketplace
 *
 * @protected - Requires authentication and organization membership
 * @route /real-estate/marketplace/cart
 */
export const metadata: Metadata = {
  title: 'Shopping Cart | Strive Platform',
  description: 'Review your selected tools and bundles',
};

async function CartContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ShoppingCartPanel userId={user.id} />;
}

function CartSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/real-estate/marketplace/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
        <p className="text-gray-600 ml-14">
          Review your selected tools and bundles before checkout
        </p>
      </div>

      {/* Cart Panel */}
      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Need help?</strong> Browse our{' '}
          <Link href="/real-estate/marketplace/dashboard" className="underline hover:text-blue-900">
            marketplace
          </Link>{' '}
          for more tools, or{' '}
          <Link href="/settings/billing" className="underline hover:text-blue-900">
            upgrade your subscription
          </Link>{' '}
          for access to premium tools.
        </p>
      </div>
    </div>
  );
}
