'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addToCart } from '@/lib/modules/marketplace';
import { BundleCard } from './BundleCard';
import type { tool_bundles } from '@prisma/client';

interface BundleCardWithCartProps {
  bundle: tool_bundles & {
    tools?: {
      tool: {
        id: string;
        name: string;
        price: number;
      };
    }[];
  };
  isPurchased?: boolean;
  isInCart?: boolean;
}

export function BundleCardWithCart({ bundle, isPurchased, isInCart }: BundleCardWithCartProps) {
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
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add bundle to cart');
    },
  });

  const handleAddToCart = () => {
    if (!isPurchased && !isInCart) {
      addToCartMutation.mutate();
    }
  };

  return (
    <BundleCard
      bundle={bundle}
      isPurchased={isPurchased}
      isInCart={isInCart || addToCartMutation.isPending}
      onAddToCart={handleAddToCart}
    />
  );
}
