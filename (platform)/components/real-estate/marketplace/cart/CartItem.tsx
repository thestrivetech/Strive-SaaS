'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package } from 'lucide-react';
import type { MarketplaceTool, ToolBundle } from '@/lib/modules/marketplace';

interface CartItemProps {
  item: MarketplaceTool | (ToolBundle & { tools?: unknown[] });
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
        {!isTool && (item as ToolBundle).discount && (
          <div className="mt-1 text-xs text-green-600">
            Save {Number((item as ToolBundle).discount)}%
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
