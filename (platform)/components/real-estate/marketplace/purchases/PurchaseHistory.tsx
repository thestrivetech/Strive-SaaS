'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
}

interface Bundle {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ToolPurchase {
  id: string;
  purchase_date: Date;
  price_at_purchase: number;
  status: string;
  tool: Tool;
  purchaser: User;
}

interface BundlePurchase {
  id: string;
  purchase_date: Date;
  price_at_purchase: number;
  status: string;
  bundle: Bundle;
  purchaser: User;
}

interface PurchaseHistoryProps {
  toolPurchases: ToolPurchase[];
  bundlePurchases: BundlePurchase[];
}

type PurchaseItem = {
  id: string;
  name: string;
  type: 'Tool' | 'Bundle';
  purchasedBy: string;
  date: Date;
  price: number;
  status: string;
};

export function PurchaseHistory({ toolPurchases, bundlePurchases }: PurchaseHistoryProps) {
  // Combine and sort all purchases
  const allPurchases: PurchaseItem[] = [
    ...toolPurchases.map((p) => ({
      id: p.id,
      name: p.tool.name,
      type: 'Tool' as const,
      purchasedBy: p.purchaser.name || p.purchaser.email,
      date: new Date(p.purchase_date),
      price: p.price_at_purchase,
      status: p.status,
    })),
    ...bundlePurchases.map((p) => ({
      id: p.id,
      name: p.bundle.name,
      type: 'Bundle' as const,
      purchasedBy: p.purchaser.name || p.purchaser.email,
      date: new Date(p.purchase_date),
      price: p.price_at_purchase,
      status: p.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return 'FREE';
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Purchased By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allPurchases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No purchase history found
              </TableCell>
            </TableRow>
          ) : (
            allPurchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {purchase.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {purchase.purchasedBy}
                </TableCell>
                <TableCell className="text-sm">{formatDate(purchase.date)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(purchase.price)}
                </TableCell>
                <TableCell className="text-right">{getStatusBadge(purchase.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
