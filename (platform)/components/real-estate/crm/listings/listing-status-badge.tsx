'use client';

import { Badge } from '@/components/ui/badge';
import { ListingStatus } from '@prisma/client';

interface ListingStatusBadgeProps {
  status: ListingStatus;
}

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  const config = {
    ACTIVE: {
      label: 'Active',
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    SOLD: {
      label: 'Sold',
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    EXPIRED: {
      label: 'Expired',
      className: 'bg-gray-500 hover:bg-gray-600 text-white',
    },
    WITHDRAWN: {
      label: 'Withdrawn',
      className: 'bg-red-500 hover:bg-red-600 text-white',
    },
    CONTINGENT: {
      label: 'Contingent',
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
  };

  const statusConfig = config[status];

  if (!statusConfig) {
    return (
      <Badge variant="outline" className="text-xs">
        Unknown
      </Badge>
    );
  }

  return (
    <Badge className={`${statusConfig.className} text-xs`}>
      {statusConfig.label}
    </Badge>
  );
}
