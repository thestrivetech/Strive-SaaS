import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingStatusBadge } from "./listing-status-badge";
import { Bed, Bath, Maximize, MapPin, Eye, Heart } from "lucide-react";

interface ListingCardProps {
  id: string;
  image: string;
  price: string;
  address: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
  status: "active" | "pending" | "sold" | "expired";
  views?: number;
}

export function ListingCard({
  image,
  price,
  address,
  city,
  state,
  beds,
  baths,
  sqft,
  status,
  views = 0,
}: ListingCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate" data-testid="card-listing">
      <div className="relative aspect-[4/3]">
        <img
          src={image}
          alt={address}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <ListingStatusBadge status={status} />
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            data-testid="button-favorite-listing"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        {views > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs">
            <Eye className="h-3 w-3" />
            <span>{views} views</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <div className="text-2xl font-bold text-primary" data-testid="text-listing-price">{price}</div>
          <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-foreground">{address}</div>
              <div>{city}, {state}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{beds} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{baths} baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{sqft.toLocaleString()} sq ft</span>
          </div>
        </div>
        <Button className="w-full mt-3" data-testid="button-view-listing">View Details</Button>
      </CardContent>
    </Card>
  );
}
