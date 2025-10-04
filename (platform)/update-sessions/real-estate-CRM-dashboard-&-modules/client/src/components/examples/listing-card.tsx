import { ListingCard } from "../crm/listings/listing-card";
import propertyImage1 from "@assets/generated_images/Luxury_home_exterior_photo_f20993b6.png";
import propertyImage2 from "@assets/generated_images/Modern_condo_building_exterior_b49201dd.png";
import propertyImage3 from "@assets/generated_images/Suburban_family_home_exterior_984aac5f.png";

export default function ListingCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
      <ListingCard
        id="1"
        image={propertyImage1}
        price="$849,000"
        address="1234 Luxury Lane"
        city="Beverly Hills"
        state="CA"
        beds={4}
        baths={3}
        sqft={3200}
        status="active"
        views={42}
      />
      <ListingCard
        id="2"
        image={propertyImage2}
        price="$625,000"
        address="567 Downtown Plaza"
        city="San Francisco"
        state="CA"
        beds={2}
        baths={2}
        sqft={1800}
        status="pending"
        views={28}
      />
      <ListingCard
        id="3"
        image={propertyImage3}
        price="$475,000"
        address="890 Suburban Drive"
        city="Austin"
        state="TX"
        beds={3}
        baths={2}
        sqft={2400}
        status="sold"
        views={15}
      />
    </div>
  );
}
