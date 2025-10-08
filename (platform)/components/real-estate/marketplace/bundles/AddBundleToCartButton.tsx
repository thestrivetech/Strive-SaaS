'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { addToCart } from '@/lib/modules/marketplace';

interface AddBundleToCartButtonProps {
  bundleId: string;
  isPurchased?: boolean;
  isInCart?: boolean;
}

export function AddBundleToCartButton({
  bundleId,
  isPurchased,
  isInCart,
}: AddBundleToCartButtonProps) {
  const queryClient = useQueryClient();

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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add bundle to cart');
    },
  });

  if (isPurchased) {
    return (
      <Button
        disabled
        size="sm"
        className="w-full bg-gray-100 text-gray-600 cursor-not-allowed"
      >
        <Check className="w-4 h-4 mr-2" />
        Already Purchased
      </Button>
    );
  }

  return (
    <Button
      onClick={() => addToCartMutation.mutate()}
      disabled={addToCartMutation.isPending || isInCart}
      size="sm"
      className="w-full bg-green-600 hover:bg-green-700 text-white"
    >
      {isInCart ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          In Cart
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
