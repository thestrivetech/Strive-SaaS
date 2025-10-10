# Session 4: Shopping Cart & Checkout

## Session Overview
**Goal:** Implement the shopping cart panel, cart management, and checkout flow following the exact design from the integration guide.

**Duration:** 3-4 hours
**Complexity:** Medium-High
**Dependencies:** Session 3 (Marketplace UI)

## Objectives

1. ✅ Create shopping cart panel component
2. ✅ Implement add/remove cart items functionality
3. ✅ Build cart item display with pricing
4. ✅ Create checkout flow
5. ✅ Add cart persistence (database-backed)
6. ✅ Implement real-time cart updates
7. ✅ Add empty cart states
8. ✅ Create purchase confirmation

## Prerequisites

- [x] Session 3 completed (marketplace UI ready)
- [x] Cart queries and actions from Session 2
- [x] Understanding of React Query mutations
- [x] Stripe integration (optional for Session 4)

## Component Structure

```
components/real-estate/marketplace/cart/
├── ShoppingCartPanel.tsx      # Main cart panel
├── CartItem.tsx                # Individual cart item
├── CartSummary.tsx             # Total and checkout
└── CheckoutModal.tsx           # Checkout confirmation
```

## Step-by-Step Implementation

### Step 1: Create Shopping Cart Panel Component

**File:** `components/real-estate/marketplace/cart/ShoppingCartPanel.tsx`

```typescript
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { getCartWithItems, removeFromCart, clearCart, checkout } from '@/lib/modules/marketplace';
import { CartItem } from './CartItem';
import { CheckoutModal } from './CheckoutModal';

export function ShoppingCartPanel() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['shopping-cart', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      return getCartWithItems(session.user.id);
    },
    enabled: !!session?.user?.id,
  });

  const removeItemMutation = useMutation({
    mutationFn: async ({
      item_type,
      item_id,
    }: {
      item_type: 'tool' | 'bundle';
      item_id: string;
    }) => {
      return removeFromCart({ item_type, item_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Cart cleared');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      queryClient.invalidateQueries({ queryKey: ['purchased-tools'] });
      toast.success('Purchase completed successfully!');
      setIsCheckoutOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Checkout failed');
    },
  });

  if (isLoading) {
    return (
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tools = cartData?.tools || [];
  const bundles = cartData?.bundles || [];
  const totalItems = tools.length + bundles.length;
  const totalPrice = cartData?.totalPrice || 0;

  return (
    <>
      <Card className="sticky top-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Your Plan
              {totalItems > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {totalItems}
                </span>
              )}
            </CardTitle>
            {totalItems > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {totalItems === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <p className="text-gray-400 text-xs mt-1">
                Browse tools and add them to your cart
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tools.map((tool, index) => (
                  <CartItem
                    key={tool.id}
                    item={tool}
                    itemType="tool"
                    index={index}
                    onRemove={() =>
                      removeItemMutation.mutate({
                        item_type: 'tool',
                        item_id: tool.id,
                      })
                    }
                  />
                ))}
                {bundles.map((bundle, index) => (
                  <CartItem
                    key={bundle.id}
                    item={bundle}
                    itemType="bundle"
                    index={tools.length + index}
                    onRemove={() =>
                      removeItemMutation.mutate({
                        item_type: 'bundle',
                        item_id: bundle.id,
                      })
                    }
                  />
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={checkoutMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Purchase Tools'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Tools will be added to your organization after purchase
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={() => checkoutMutation.mutate()}
        totalPrice={totalPrice}
        itemCount={totalItems}
        isProcessing={checkoutMutation.isPending}
      />
    </>
  );
}
```

### Step 2: Create Cart Item Component

**File:** `components/real-estate/marketplace/cart/CartItem.tsx`

```typescript
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package } from 'lucide-react';
import type { MarketplaceTool, ToolBundle } from '@prisma/client';

interface CartItemProps {
  item: MarketplaceTool | ToolBundle;
  itemType: 'tool' | 'bundle';
  index: number;
  onRemove: () => void;
}

export function CartItem({ item, itemType, index, onRemove }: CartItemProps) {
  const isTool = itemType === 'tool';
  const price = isTool
    ? (item as MarketplaceTool).price
    : (item as ToolBundle).bundle_price;

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      {/* Item Number Badge */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
        {index + 1}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </h4>
            {!isTool && (
              <div className="flex items-center gap-1 mt-1">
                <Package className="w-3 h-3 text-gray-400" />
                <Badge variant="secondary" className="text-xs">
                  Bundle
                </Badge>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right">
            <span className="text-sm font-semibold text-gray-900">
              ${(price / 100).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Bundle discount indicator */}
        {!isTool && (
          <div className="mt-1 text-xs text-green-600">
            Save {((item as ToolBundle).discount.toNumber())}%
          </div>
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

### Step 3: Create Checkout Modal Component

**File:** `components/real-estate/marketplace/cart/CheckoutModal.tsx`

```typescript
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ShoppingCart } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalPrice: number;
  itemCount: number;
  isProcessing: boolean;
}

export function CheckoutModal({
  isOpen,
  onClose,
  onConfirm,
  totalPrice,
  itemCount,
  isProcessing,
}: CheckoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Confirm Purchase
          </DialogTitle>
          <DialogDescription>
            Review your purchase before completing the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Purchase Summary */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Items</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="text-lg font-bold text-blue-600">
                ${(totalPrice / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Important Info */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Tools will be added to your organization</li>
                <li>• All team members will have access</li>
                <li>• Purchase is non-refundable</li>
              </ul>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant access after purchase</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Lifetime access to purchased tools</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Free updates and support</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              `Confirm Purchase`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 4: Add Cart State Management with React Query

**File:** `lib/hooks/useShoppingCart.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  getCartWithItems,
  addToCart,
  removeFromCart,
  clearCart,
  checkout,
} from '@/lib/modules/marketplace';

export function useShoppingCart() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const cart = useQuery({
    queryKey: ['shopping-cart', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      return getCartWithItems(session.user.id);
    },
    enabled: !!session?.user?.id,
  });

  const addItem = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    },
  });

  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    },
  });

  const processCheckout = useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      queryClient.invalidateQueries({ queryKey: ['purchased-tools'] });
    },
  });

  return {
    cart: cart.data,
    isLoading: cart.isLoading,
    addItem,
    removeItem,
    clear,
    checkout: processCheckout,
    totalItems: (cart.data?.tools?.length || 0) + (cart.data?.bundles?.length || 0),
    totalPrice: cart.data?.totalPrice || 0,
  };
}
```

### Step 5: Add Cart Badge to Navigation

**File:** `components/shared/navigation/CartBadge.tsx`

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useShoppingCart } from '@/lib/hooks/useShoppingCart';

export function CartBadge() {
  const { totalItems } = useShoppingCart();

  return (
    <Link
      href="/real-estate/marketplace/cart"
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ShoppingCart className="w-5 h-5 text-gray-700" />
      {totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {totalItems > 9 ? '9+' : totalItems}
        </Badge>
      )}
    </Link>
  );
}
```

### Step 6: Create Standalone Cart Page

**File:** `app/real-estate/marketplace/cart/page.tsx`

```typescript
import { Suspense } from 'react';
import { ShoppingCartPanel } from '@/components/real-estate/marketplace/cart/ShoppingCartPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/real-estate/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          Review your selected tools and bundles
        </p>
      </div>

      {/* Cart Panel */}
      <Suspense fallback={<div>Loading cart...</div>}>
        <ShoppingCartPanel />
      </Suspense>
    </div>
  );
}
```

## Testing & Validation

### Test 1: Add Items to Cart
- Browse marketplace
- Click "Add to Cart" on a tool
**Expected:** Item added, cart count updates, toast notification

### Test 2: Remove Items from Cart
- Click trash icon on cart item
**Expected:** Item removed, total recalculated

### Test 3: Cart Persistence
- Add items to cart
- Refresh page
**Expected:** Cart items persist (database-backed)

### Test 4: Checkout Flow
- Add items to cart
- Click "Purchase Tools"
- Confirm in modal
**Expected:** Purchase completes, cart clears, tools appear in "My Tools"

### Test 5: Empty Cart State
- Clear all items
**Expected:** "Your cart is empty" message with icon

## Success Criteria

- [x] Shopping cart panel displays correctly
- [x] Add/remove items functionality works
- [x] Cart total calculates correctly
- [x] Checkout modal with confirmation
- [x] Cart persists across page refreshes
- [x] Cart badge in navigation shows item count
- [x] Empty cart state with helpful message
- [x] Purchase completes successfully

## Files Created

- ✅ `components/real-estate/marketplace/cart/ShoppingCartPanel.tsx`
- ✅ `components/real-estate/marketplace/cart/CartItem.tsx`
- ✅ `components/real-estate/marketplace/cart/CheckoutModal.tsx`
- ✅ `lib/hooks/useShoppingCart.ts`
- ✅ `components/shared/navigation/CartBadge.tsx`
- ✅ `app/real-estate/marketplace/cart/page.tsx`

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Cart Not Persisting
**Problem:** Cart resets on page refresh
**Solution:** Use database-backed cart (shopping_carts table)

### ❌ Pitfall 2: Race Conditions
**Problem:** Multiple add/remove calls conflict
**Solution:** Use React Query mutations with proper invalidation

### ❌ Pitfall 3: Price Calculation Errors
**Problem:** Total price incorrect
**Solution:** Recalculate on server-side, verify client-side display

### ❌ Pitfall 4: Duplicate Purchases
**Problem:** Same tool purchased twice
**Solution:** Check existing purchases before checkout

### ❌ Pitfall 5: Missing Session Handling
**Problem:** Cart errors when user not logged in
**Solution:** Enable query only when session exists

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 5: Tool Bundles & Special Offers**
2. ✅ Cart functionality complete
3. ✅ Can start implementing bundle features
4. ✅ Checkout flow operational

---

**Session 4 Complete:** ✅ Shopping cart and checkout fully implemented
