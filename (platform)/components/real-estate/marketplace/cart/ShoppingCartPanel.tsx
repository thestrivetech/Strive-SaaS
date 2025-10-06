'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { removeFromCart, checkout } from '@/lib/modules/marketplace';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/auth-helpers';

interface CartItem {
  id: string;
  item_type: 'tool' | 'bundle';
  tool?: { id: string; name: string; price: number } | null;
  bundle?: { id: string; name: string; bundle_price: number } | null;
}

export function ShoppingCartPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['shopping-cart'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return null;

      // For now, return mock data structure until we have the proper query
      return {
        tools: [] as any[],
        bundles: [] as any[],
        totalPrice: 0,
      };
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: 'tool' | 'bundle' }) => {
      return removeFromCart({ item_type: itemType, item_id: itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      return checkout();
    },
    onSuccess: () => {
      toast.success('Purchase completed!');
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      router.push('/real-estate/marketplace/dashboard');
    },
    onError: () => {
      toast.error('Checkout failed');
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading cart...</p>
        </CardContent>
      </Card>
    );
  }

  const tools = cart?.tools || [];
  const bundles = cart?.bundles || [];
  const totalAmount = cart?.totalPrice || 0;
  const totalItems = tools.length + bundles.length;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Shopping Cart
          {totalItems > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalItems}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {totalItems === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Your cart is empty
          </p>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tools.map((tool: any) => (
                <div
                  key={tool.id}
                  className="flex items-start justify-between gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tool.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(tool.price / 100).toFixed(0)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemMutation.mutate({ itemId: tool.id, itemType: 'tool' })}
                    disabled={removeItemMutation.isPending}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {bundles.map((bundle: any) => (
                <div
                  key={bundle.id}
                  className="flex items-start justify-between gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {bundle.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(bundle.bundle_price / 100).toFixed(0)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemMutation.mutate({ itemId: bundle.id, itemType: 'bundle' })}
                    disabled={removeItemMutation.isPending}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(totalAmount / 100).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {totalItems > 0 && (
        <CardFooter>
          <Button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Checkout
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
