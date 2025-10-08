'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCartWithItems, removeFromCart, clearCart, checkout } from '@/lib/modules/marketplace';
import { CartItem } from './CartItem';
import { CheckoutModal } from './CheckoutModal';

interface ShoppingCartPanelProps {
  userId: string;
}

export function ShoppingCartPanel({ userId }: ShoppingCartPanelProps) {
  const queryClient = useQueryClient();
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['shopping-cart', userId],
    queryFn: () => getCartWithItems(userId),
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
    onError: (error: Error) => {
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
                {tools.map((tool: any, index: number) => (
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
                {bundles.map((bundle: any, index: number) => (
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
