import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { getListingWithFullHistory } from '@/lib/modules/listings';
import { ListingStatusBadge } from '@/components/(platform)/crm/listings/listing-status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Home,
  DollarSign,
  Edit,
  ExternalLink,
} from 'lucide-react';

interface ListingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<ListingDetailSkeleton />}>
        <ListingDetail listingId={id} />
      </Suspense>
    </div>
  );
}

async function ListingDetail({ listingId }: { listingId: string }) {
  const listing = await getListingWithFullHistory(listingId);

  if (!listing) {
    notFound();
  }

  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : '/placeholder-property.jpg';

  const pricePerSqft = listing.price_per_sqft
    ? Number(listing.price_per_sqft)
    : null;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/listings">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="text-muted-foreground">
              {listing.address}, {listing.city}, {listing.state} {listing.zip_code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ListingStatusBadge status={listing.status} />
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative h-96 w-full bg-gray-100">
                <Image
                  src={primaryImage}
                  alt={listing.title}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, 66vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-property.jpg';
                  }}
                />
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {listing.images.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative h-20 bg-gray-100 rounded">
                      <Image
                        src={img}
                        alt={`Property image ${i + 2}`}
                        fill
                        className="object-cover rounded"
                        sizes="100px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          {listing.features && listing.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activities */}
          {listing.activities && listing.activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Property showings and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listing.activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-green-600">
                {formatCurrency(Number(listing.price))}
              </CardTitle>
              {pricePerSqft && (
                <CardDescription>
                  {formatCurrency(pricePerSqft)}/sqft
                </CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bed className="h-4 w-4" />
                  <span>Bedrooms</span>
                </div>
                <span className="font-medium">{listing.bedrooms || 'N/A'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bath className="h-4 w-4" />
                  <span>Bathrooms</span>
                </div>
                <span className="font-medium">{listing.bathrooms ? Number(listing.bathrooms) : 'N/A'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Square className="h-4 w-4" />
                  <span>Square Feet</span>
                </div>
                <span className="font-medium">
                  {listing.square_feet ? listing.square_feet.toLocaleString() : 'N/A'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-4 w-4" />
                  <span>Property Type</span>
                </div>
                <span className="font-medium">
                  {listing.property_type.replace('_', ' ')}
                </span>
              </div>
              {listing.year_built && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Year Built</span>
                    </div>
                    <span className="font-medium">{listing.year_built}</span>
                  </div>
                </>
              )}
              {listing.mls_number && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">MLS Number</span>
                    <span className="font-medium">{listing.mls_number}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Agent Info */}
          {listing.assigned_to && (
            <Card>
              <CardHeader>
                <CardTitle>Listing Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {listing.assigned_to.avatar_url ? (
                    <Image
                      src={listing.assigned_to.avatar_url}
                      alt={listing.assigned_to.name || 'Agent'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium">
                        {listing.assigned_to.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{listing.assigned_to.name}</p>
                    <p className="text-sm text-muted-foreground">{listing.assigned_to.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Virtual Tour */}
          {listing.virtual_tour_url && (
            <Card>
              <CardHeader>
                <CardTitle>Virtual Tour</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href={listing.virtual_tour_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Virtual Tour
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function ListingDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
