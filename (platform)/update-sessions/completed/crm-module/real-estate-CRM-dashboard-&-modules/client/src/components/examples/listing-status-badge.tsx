import { ListingStatusBadge } from "../crm/listings/listing-status-badge";

export default function ListingStatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3 p-6">
      <ListingStatusBadge status="active" />
      <ListingStatusBadge status="pending" />
      <ListingStatusBadge status="sold" />
      <ListingStatusBadge status="expired" />
    </div>
  );
}
