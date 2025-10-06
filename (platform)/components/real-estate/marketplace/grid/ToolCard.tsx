'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addToCart } from '@/lib/modules/marketplace';
import type { marketplace_tools } from '@prisma/client';

interface ToolCardProps {
  tool: marketplace_tools & {
    _count?: {
      purchases: number;
      reviews: number;
    };
  };
  isPurchased?: boolean;
  isInCart?: boolean;
}

export function ToolCard({ tool, isPurchased, isInCart }: ToolCardProps) {
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return addToCart({
        item_type: 'tool',
        item_id: tool.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      toast.success('Added to cart!');
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      FOUNDATION: 'bg-blue-500 text-white',
      GROWTH: 'bg-green-500 text-white',
      ELITE: 'bg-purple-500 text-white',
      CUSTOM: 'bg-orange-500 text-white',
      ADVANCED: 'bg-red-500 text-white',
      INTEGRATION: 'bg-indigo-500 text-white',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow relative">
      {isPurchased && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Owned
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {/* Price */}
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">
            ${(tool.price / 100).toFixed(0)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {tool.description}
        </p>

        {/* Category & Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getCategoryColor(tool.category)}>
            {tool.category}
          </Badge>
          {tool.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        {tool._count && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{tool._count.purchases} purchases</span>
            {tool.rating && (
              <span className="flex items-center gap-1">
                ⭐ {tool.rating.toFixed(1)}
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={() => addToCartMutation.mutate()}
          disabled={addToCartMutation.isPending || isPurchased || isInCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
