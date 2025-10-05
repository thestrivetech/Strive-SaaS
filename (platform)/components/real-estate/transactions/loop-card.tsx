'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import type { transaction_loops } from '@prisma/client';
import { Building2, Calendar, DollarSign } from 'lucide-react';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  ACTIVE: 'bg-blue-500',
  UNDER_CONTRACT: 'bg-yellow-500',
  CLOSING: 'bg-orange-500',
  CLOSED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  ARCHIVED: 'bg-gray-400',
};

interface LoopCardProps {
  loop: transaction_loops;
}

export function LoopCard({ loop }: LoopCardProps) {
  const router = useRouter();

  const formattedPrice = loop.listing_price
    ? `$${Number(loop.listing_price).toLocaleString()}`
    : 'N/A';

  const formattedType = loop.transaction_type.replace(/_/g, ' ');
  const formattedStatus = loop.status.replace(/_/g, ' ');

  const expectedClosing = loop.expected_closing
    ? new Date(loop.expected_closing).toLocaleDateString()
    : 'Not set';

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/transactions/${loop.id}`)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">
            {loop.property_address}
          </CardTitle>
          <Badge className={statusColors[loop.status] || 'bg-gray-500'}>
            {formattedStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{formattedType}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formattedPrice}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Expected: {expectedClosing}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{loop.progress}%</span>
          </div>
          <Progress value={loop.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
