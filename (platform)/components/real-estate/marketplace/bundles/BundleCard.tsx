'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Star, Check, Plus, TrendingDown } from 'lucide-react';
import type { tool_bundles } from '@prisma/client';

interface BundleCardProps {
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
  onAddToCart?: () => void;
}

export function BundleCard({ bundle, isPurchased, isInCart, onAddToCart }: BundleCardProps) {
  // Calculate savings
  const originalPrice = bundle.original_price || 0;
  const bundlePrice = bundle.bundle_price;
  const savings = originalPrice - bundlePrice;
  const savingsPercent = originalPrice > 0
    ? Math.round((savings / originalPrice) * 100)
    : 0;

  // Get bundle type color
  const getBundleTypeColor = (type: string) => {
    const colors = {
      STARTER: 'bg-blue-500 text-white',
      PROFESSIONAL: 'bg-purple-500 text-white',
      ENTERPRISE: 'bg-orange-500 text-white',
      CUSTOM: 'bg-green-500 text-white',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const toolsList = bundle.tools || [];
  const displayTools = toolsList.slice(0, 3);
  const remainingTools = toolsList.length - displayTools.length;

  return (
    <Card className={`glass hover:shadow-lg transition-all hover:-translate-y-1 ${
      bundle.is_popular ? 'neon-border-orange' : 'neon-border-purple'
    } relative`}>
      {/* Popular Badge */}
      {bundle.is_popular && (
        <div className="absolute -top-3 -right-3 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-white" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Purchased/In Cart Badge */}
      {isPurchased && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Purchased
          </Badge>
        </div>
      )}
      {!isPurchased && isInCart && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary">
            <Check className="w-3 h-3 mr-1" />
            In Cart
          </Badge>
        </div>
      )}

      <CardHeader>
        {/* Package Icon and Type */}
        <div className="flex items-start justify-between mb-3">
          <div className="p-3 rounded-full bg-purple-500">
            <Package className="h-6 w-6 text-white" />
          </div>
          <Badge className={getBundleTypeColor(bundle.bundle_type)}>
            {bundle.bundle_type}
          </Badge>
        </div>

        {/* Title and Description */}
        <CardTitle className="text-lg">{bundle.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {bundle.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Pricing Display */}
          <div className="space-y-2">
            {/* Original Price (strikethrough) */}
            {originalPrice > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original price:</span>
                <span className="line-through text-muted-foreground">
                  ${(originalPrice / 100).toFixed(0)}
                </span>
              </div>
            )}

            {/* Bundle Price */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-green-600">
                ${(bundlePrice / 100).toFixed(0)}
              </span>

              {/* Savings Badge */}
              {savingsPercent > 0 && (
                <Badge className="bg-red-500 text-white">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Save {savingsPercent}%
                </Badge>
              )}
            </div>

            {/* Savings Amount */}
            {savings > 0 && (
              <p className="text-sm text-green-600 font-medium">
                You save ${(savings / 100).toFixed(0)}
              </p>
            )}
          </div>

          {/* Tools Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Includes:</h4>
            <div className="space-y-1">
              {displayTools.map((bundleTool) => (
                <div key={bundleTool.tool.id} className="flex items-center gap-2 text-sm">
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <span className="truncate">{bundleTool.tool.name}</span>
                </div>
              ))}
              {remainingTools > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plus className="w-3 h-3 flex-shrink-0" />
                  <span>{remainingTools} more tool{remainingTools !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Link href={`/real-estate/marketplace/bundles/${bundle.id}`}>
                View Details
              </Link>
            </Button>

            {!isPurchased && onAddToCart && (
              <Button
                onClick={onAddToCart}
                disabled={isInCart}
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
