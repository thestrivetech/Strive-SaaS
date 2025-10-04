# Session 6: Listings Module - Real Estate Features

## Session Overview
**Goal:** Implement real estate property listings management with search, filtering, and MLS integration hooks.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-5

## Objectives

1. ✅ Create listings module backend
2. ✅ Implement property search and filtering
3. ✅ Build listing cards with property details
4. ✅ Add image gallery support
5. ✅ Create map integration hooks
6. ✅ Implement MLS integration stubs
7. ✅ Add property comparison features

## Module Structure

```
lib/modules/listings/
├── index.ts
├── schemas.ts
├── queries.ts
├── actions.ts
└── search.ts (advanced property search)

components/(platform)/crm/listings/
├── listing-card.tsx
├── listing-form-dialog.tsx
├── listing-detail-view.tsx
├── listing-filters.tsx
├── listing-gallery.tsx
├── listing-status-badge.tsx
└── listing-map.tsx (optional)
```

## Key Implementation Steps

### 1. Listings Backend Module

**schemas.ts** - Property validation:
```typescript
export const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(5000).optional(),

  // Address
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  zip_code: z.string().min(5).max(10),
  country: z.string().default('USA'),

  // Property Details
  property_type: z.nativeEnum(PropertyType).default('RESIDENTIAL'),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  square_feet: z.number().int().positive().optional(),
  lot_size: z.number().positive().optional(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),

  // Pricing
  price: z.number().positive(),
  price_per_sqft: z.number().positive().optional(),

  // Listing Info
  status: z.nativeEnum(ListingStatus).default('ACTIVE'),
  mls_number: z.string().optional(),
  listing_date: z.coerce.date().optional(),
  expiration_date: z.coerce.date().optional(),

  // Media
  images: z.array(z.string().url()).default([]),
  virtual_tour_url: z.string().url().optional(),

  // Features
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),

  // Multi-tenancy
  organization_id: z.string().uuid(),
  assigned_to_id: z.string().uuid().optional(),
});

export const listingSearchSchema = z.object({
  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),

  // Property filters
  property_type: z.nativeEnum(PropertyType).optional(),
  min_bedrooms: z.number().int().min(0).optional(),
  max_bedrooms: z.number().int().max(20).optional(),
  min_bathrooms: z.number().min(0).optional(),
  max_bathrooms: z.number().max(20).optional(),
  min_sqft: z.number().int().positive().optional(),
  max_sqft: z.number().int().positive().optional(),

  // Price range
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),

  // Status
  status: z.nativeEnum(ListingStatus).optional(),

  // Features
  features: z.array(z.string()).optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});
```

**queries.ts** - Advanced property search:
```typescript
export async function searchListings(filters?: ListingSearchFilters) {
  return withTenantContext(async () => {
    const where: Prisma.listingsWhereInput = {};

    // Location filters
    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.state) {
      where.state = { equals: filters.state, mode: 'insensitive' };
    }
    if (filters?.zip_code) {
      where.zip_code = filters.zip_code;
    }

    // Property type
    if (filters?.property_type) {
      where.property_type = filters.property_type;
    }

    // Bedrooms range
    if (filters?.min_bedrooms || filters?.max_bedrooms) {
      where.bedrooms = {};
      if (filters.min_bedrooms) where.bedrooms.gte = filters.min_bedrooms;
      if (filters.max_bedrooms) where.bedrooms.lte = filters.max_bedrooms;
    }

    // Bathrooms range
    if (filters?.min_bathrooms || filters?.max_bathrooms) {
      where.bathrooms = {};
      if (filters.min_bathrooms) where.bathrooms.gte = filters.min_bathrooms;
      if (filters.max_bathrooms) where.bathrooms.lte = filters.max_bathrooms;
    }

    // Square feet range
    if (filters?.min_sqft || filters?.max_sqft) {
      where.square_feet = {};
      if (filters.min_sqft) where.square_feet.gte = filters.min_sqft;
      if (filters.max_sqft) where.square_feet.lte = filters.max_sqft;
    }

    // Price range
    if (filters?.min_price || filters?.max_price) {
      where.price = {};
      if (filters.min_price) where.price.gte = filters.min_price;
      if (filters.max_price) where.price.lte = filters.max_price;
    }

    // Status
    if (filters?.status) {
      where.status = filters.status;
    }

    // Features (has all specified features)
    if (filters?.features && filters.features.length > 0) {
      where.features = { hasEvery: filters.features };
    }

    return await prisma.listings.findMany({
      where,
      include: {
        assigned_to: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        deals: {
          where: { status: 'ACTIVE' },
          select: { id: true, title: true, value: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  });
}

export async function getListingStats() {
  return withTenantContext(async () => {
    const [
      totalListings,
      activeListings,
      soldListings,
      avgPrice,
      totalValue,
    ] = await Promise.all([
      prisma.listings.count(),
      prisma.listings.count({ where: { status: 'ACTIVE' } }),
      prisma.listings.count({ where: { status: 'SOLD' } }),
      prisma.listings.aggregate({
        where: { status: 'ACTIVE' },
        _avg: { price: true },
      }),
      prisma.listings.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { price: true },
      }),
    ]);

    return {
      totalListings,
      activeListings,
      soldListings,
      avgPrice: avgPrice._avg.price || 0,
      totalValue: totalValue._sum.price || 0,
    };
  });
}
```

**actions.ts** - Listing management:
```typescript
export async function createListing(input: CreateListingInput) {
  const session = await requireAuth();

  if (!canAccessCRM(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createListingSchema.parse(input);

  // Calculate price per sqft if not provided
  if (!validated.price_per_sqft && validated.square_feet) {
    validated.price_per_sqft = validated.price / validated.square_feet;
  }

  return withTenantContext(async () => {
    const listing = await prisma.listings.create({
      data: {
        ...validated,
        organization_id: session.user.organizationId,
      },
    });

    revalidatePath('/crm/listings');
    return listing;
  });
}

export async function updateListingStatus(
  listingId: string,
  status: ListingStatus,
  soldDate?: Date
) {
  const session = await requireAuth();

  return withTenantContext(async () => {
    const listing = await prisma.listings.update({
      where: { id: listingId },
      data: {
        status,
        ...(status === 'SOLD' && soldDate && { expiration_date: soldDate }),
      },
    });

    // Log activity
    await prisma.activities.create({
      data: {
        type: 'NOTE',
        title: `Listing status changed to ${status}`,
        listing_id: listingId,
        organization_id: session.user.organizationId,
        created_by_id: session.user.id,
      },
    });

    revalidatePath('/crm/listings');
    revalidatePath(`/crm/listings/${listingId}`);
    return listing;
  });
}
```

### 2. Listing Components

**listing-card.tsx** - Property card with image:
```typescript
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingStatusBadge } from './listing-status-badge';
import { formatCurrency } from '@/lib/utils';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import Image from 'next/image';

export function ListingCard({ listing }: any) {
  const primaryImage = listing.images[0] || '/placeholder-property.jpg';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={primaryImage}
          alt={listing.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <ListingStatusBadge status={listing.status} />
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-2xl text-green-600">
              {formatCurrency(listing.price)}
            </h3>
            {listing.price_per_sqft && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(listing.price_per_sqft)}/sqft
              </p>
            )}
          </div>
          <Badge variant="outline">{listing.property_type}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <h4 className="font-semibold line-clamp-1">{listing.title}</h4>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {listing.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{listing.bedrooms} bd</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{listing.bathrooms} ba</span>
            </div>
          )}
          {listing.square_feet && (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{listing.square_feet.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">
            {listing.address}, {listing.city}, {listing.state}
          </span>
        </div>

        {listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.features.slice(0, 3).map((feature: string) => (
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
      </CardContent>
    </Card>
  );
}
```

**listing-status-badge.tsx** - Status indicator:
```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { ListingStatus } from '@prisma/client';

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const config = {
    ACTIVE: { label: 'Active', className: 'bg-green-500 text-white' },
    PENDING: { label: 'Pending', className: 'bg-yellow-500 text-white' },
    SOLD: { label: 'Sold', className: 'bg-blue-500 text-white' },
    EXPIRED: { label: 'Expired', className: 'bg-gray-500 text-white' },
    WITHDRAWN: { label: 'Withdrawn', className: 'bg-red-500 text-white' },
    CONTINGENT: { label: 'Contingent', className: 'bg-orange-500 text-white' },
  };

  const statusConfig = config[status];

  return (
    <Badge className={statusConfig.className}>
      {statusConfig.label}
    </Badge>
  );
}
```

### 3. Listings Page with Advanced Filters

**app/(platform)/crm/listings/page.tsx**:
```typescript
import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { searchListings, getListingStats } from '@/lib/modules/listings';
import { ListingCard } from '@/components/(platform)/crm/listings/listing-card';
import { ListingFilters } from '@/components/(platform)/crm/listings/listing-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default async function ListingsPage({ searchParams }: any) {
  await requireAuth();

  const filters = {
    city: searchParams.city,
    state: searchParams.state,
    property_type: searchParams.property_type,
    min_price: searchParams.min_price ? parseFloat(searchParams.min_price) : undefined,
    max_price: searchParams.max_price ? parseFloat(searchParams.max_price) : undefined,
    min_bedrooms: searchParams.min_bedrooms ? parseInt(searchParams.min_bedrooms) : undefined,
    max_bedrooms: searchParams.max_bedrooms ? parseInt(searchParams.max_bedrooms) : undefined,
    status: searchParams.status,
  };

  const [listings, stats] = await Promise.all([
    searchListings(filters),
    getListingStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listings</h1>
          <p className="text-muted-foreground">
            Browse and manage property listings
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeListings}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgPrice)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ListingFilters />

      {/* Listings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No listings found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 4. MLS Integration Stubs

Create hooks for future MLS integration:
```typescript
// lib/modules/listings/mls.ts
export async function syncWithMLS(listingId: string) {
  // Stub for MLS integration
  // TODO: Implement MLS API integration
  console.log('MLS sync not yet implemented');
}

export async function importFromMLS(mlsNumber: string) {
  // Stub for MLS import
  // TODO: Implement MLS data import
  console.log('MLS import not yet implemented');
}
```

## Success Criteria

- [x] Listings module backend complete
- [x] Advanced property search functional
- [x] Listing cards with images
- [x] Property filtering working
- [x] Multi-tenancy enforced
- [x] MLS integration hooks in place
- [x] Responsive property grid

## Files Created

- ✅ `lib/modules/listings/*` (5 files)
- ✅ `components/(platform)/crm/listings/*` (7+ files)
- ✅ `app/(platform)/crm/listings/page.tsx`
- ✅ `app/(platform)/crm/listings/[id]/page.tsx`

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 7: Calendar & Appointments**
2. ✅ Property listings complete
3. ✅ Ready to add scheduling features

---

**Session 6 Complete:** ✅ Listings module with property search implemented
