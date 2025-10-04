import { SearchBar } from "@/components/crm/shared/search-bar";
import { ListingCard } from "@/components/crm/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import propertyImage1 from "@assets/generated_images/Luxury_home_exterior_photo_f20993b6.png";
import propertyImage2 from "@assets/generated_images/Modern_condo_building_exterior_b49201dd.png";
import propertyImage3 from "@assets/generated_images/Suburban_family_home_exterior_984aac5f.png";
import propertyImage4 from "@assets/generated_images/Craftsman_bungalow_home_exterior_f363feb8.png";

export default function Listings() {
  const mockListings = [
    {
      id: "1",
      image: propertyImage1,
      price: "$849,000",
      address: "1234 Luxury Lane",
      city: "Beverly Hills",
      state: "CA",
      beds: 4,
      baths: 3,
      sqft: 3200,
      status: "active" as const,
      views: 42,
    },
    {
      id: "2",
      image: propertyImage2,
      price: "$625,000",
      address: "567 Downtown Plaza",
      city: "San Francisco",
      state: "CA",
      beds: 2,
      baths: 2,
      sqft: 1800,
      status: "pending" as const,
      views: 28,
    },
    {
      id: "3",
      image: propertyImage3,
      price: "$475,000",
      address: "890 Suburban Drive",
      city: "Austin",
      state: "TX",
      beds: 3,
      baths: 2,
      sqft: 2400,
      status: "sold" as const,
      views: 15,
    },
    {
      id: "4",
      image: propertyImage4,
      price: "$395,000",
      address: "321 Maple Court",
      city: "Denver",
      state: "CO",
      beds: 3,
      baths: 2,
      sqft: 2100,
      status: "active" as const,
      views: 35,
    },
    {
      id: "5",
      image: propertyImage1,
      price: "$720,000",
      address: "789 Pine Avenue",
      city: "Seattle",
      state: "WA",
      beds: 4,
      baths: 3,
      sqft: 2800,
      status: "active" as const,
      views: 52,
    },
    {
      id: "6",
      image: propertyImage2,
      price: "$550,000",
      address: "456 Oak Street",
      city: "Portland",
      state: "OR",
      beds: 3,
      baths: 2,
      sqft: 2200,
      status: "expired" as const,
      views: 8,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Listings</h1>
          <p className="text-muted-foreground">
            Browse and manage all property listings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-listings">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-add-listing">
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      <SearchBar
        placeholder="Search listings by address, city, or price..."
        onSearch={(query) => console.log("Search:", query)}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockListings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </div>
  );
}
