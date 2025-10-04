'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingStatusBadge } from './listing-status-badge';
import { ListingActionsMenu } from './listing-actions-menu';
import type { ListingWithAssignee } from '@/lib/modules/listings';
import { formatCurrency } from '@/lib/utils';
import { Bed, Bath, Square, MapPin, Calendar } from 'lucide-react';

interface ListingCardProps {
  listing: ListingWithAssignee;
}

export function ListingCard({ listing }: ListingCardProps) {
  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : '/placeholder-property.jpg';

  const pricePerSqft = listing.price_per_sqft
    ? Number(listing.price_per_sqft)
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/crm/listings/${listing.id}`}>
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-property.jpg';
            }}
          />
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <ListingStatusBadge status={listing.status} />
            <ListingActionsMenu listing={listing} />
          </div>
          {listing.property_type && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {listing.property_type.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="pb-3">
        <Link href={`/crm/listings/${listing.id}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-2xl text-green-600">
                {formatCurrency(Number(listing.price))}
              </h3>
              {pricePerSqft && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(pricePerSqft)}/sqft
                </p>
              )}
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        <Link href={`/crm/listings/${listing.id}`}>
          <h4 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
            {listing.title}
          </h4>
        </Link>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          {listing.bedrooms !== null && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{listing.bedrooms} bd</span>
            </div>
          )}
          {listing.bathrooms !== null && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{Number(listing.bathrooms)} ba</span>
            </div>
          )}
          {listing.square_feet !== null && (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{listing.square_feet.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {listing.address}, {listing.city}, {listing.state} {listing.zip_code}
          </span>
        </div>

        {/* MLS Number */}
        {listing.mls_number && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="font-medium">MLS:</span>
            <span>{listing.mls_number}</span>
          </div>
        )}

        {/* Features */}
        {listing.features && listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {listing.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{listing.features.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Assigned Agent */}
        {listing.assigned_to && (
          <div className="flex items-center gap-2 pt-2 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {listing.assigned_to.avatar_url ? (
                <Image
                  src={listing.assigned_to.avatar_url}
                  alt={listing.assigned_to.name || 'Agent'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {listing.assigned_to.name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <span className="text-xs">{listing.assigned_to.name}</span>
            </div>
          </div>
        )}

        {/* Listing Date */}
        {listing.listing_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Listed {new Date(listing.listing_date).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
