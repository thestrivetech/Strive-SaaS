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
