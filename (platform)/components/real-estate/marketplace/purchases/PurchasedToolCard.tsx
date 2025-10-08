'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  TrendingUp,
  Calendar,
  MoreVertical,
  Settings,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PurchasedToolCardProps {
  purchase: {
    id: string;
    tool_id: string;
    purchase_date: Date;
    last_used: Date | null;
    usage_count: number;
    price_at_purchase: number;
    status: string;
    tool: {
      id: string;
      name: string;
      description: string;
      category: string;
      icon_url?: string | null;
    };
  };
  fromBundle?: {
    id: string;
    name: string;
  } | null;
}

export function PurchasedToolCard({ purchase, fromBundle }: PurchasedToolCardProps) {
  const { tool } = purchase;
  const isActive = purchase.status === 'ACTIVE';

  // Format price
  const priceLabel = purchase.price_at_purchase === 0
    ? 'FREE'
    : `$${(purchase.price_at_purchase / 100).toFixed(0)}`;

  // Format dates
  const purchasedDate = new Date(purchase.purchase_date).toLocaleDateString();
  const lastUsedText = purchase.last_used
    ? `Used ${formatDistanceToNow(new Date(purchase.last_used), { addSuffix: true })}`
    : 'Never used';

  // Determine border color based on category
  const borderColors: Record<string, string> = {
    MARKETING: 'neon-border-cyan',
    LEGAL: 'neon-border-green',
    ANALYTICS: 'neon-border-orange',
    INTEGRATION: 'neon-border-purple',
    PRODUCTIVITY: 'neon-border-cyan',
    COMMUNICATION: 'neon-border-purple',
  };

  const borderColor = borderColors[tool.category] || 'neon-border-purple';

  return (
    <Card className={`glass ${borderColor} hover:shadow-md transition-all hover:-translate-y-1`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{tool.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <CardDescription className="text-xs">{tool.category}</CardDescription>
                {fromBundle && (
                  <Badge variant="outline" className="text-xs">
                    From {fromBundle.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
              {isActive ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
              ) : (
                'Inactive'
              )}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/real-estate/marketplace/purchases/${tool.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Tool
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/real-estate/marketplace/tools/${tool.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tool.description}
        </p>

        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              <span>Usage</span>
            </div>
            <p className="text-lg font-bold">{purchase.usage_count}</p>
          </div>
          <div className="text-center border-l border-r">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              <span>Last Used</span>
            </div>
            <p className="text-xs font-medium truncate">{lastUsedText}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span>Price</span>
            </div>
            <p className="text-lg font-bold">{priceLabel}</p>
          </div>
        </div>

        {/* Purchase Date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Purchased on {purchasedDate}
        </div>
      </CardContent>
    </Card>
  );
}
