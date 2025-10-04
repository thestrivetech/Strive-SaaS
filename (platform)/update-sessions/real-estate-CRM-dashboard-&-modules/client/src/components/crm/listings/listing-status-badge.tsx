import { Badge } from "@/components/ui/badge";

type ListingStatus = "active" | "pending" | "sold" | "expired";

interface ListingStatusBadgeProps {
  status: ListingStatus;
}

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  const config = {
    active: {
      label: "Active",
      className: "bg-listing-active/10 text-listing-active border-listing-active/20",
    },
    pending: {
      label: "Pending",
      className: "bg-listing-pending/10 text-listing-pending border-listing-pending/20",
    },
    sold: {
      label: "Sold",
      className: "bg-listing-sold/10 text-listing-sold border-listing-sold/20",
    },
    expired: {
      label: "Expired",
      className: "bg-listing-expired/10 text-listing-expired border-listing-expired/20",
    },
  };

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={className} data-testid={`badge-listing-${status}`}>
      {label}
    </Badge>
  );
}
