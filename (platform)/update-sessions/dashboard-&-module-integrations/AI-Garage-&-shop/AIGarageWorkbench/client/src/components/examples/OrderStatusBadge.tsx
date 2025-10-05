import { OrderStatusBadge } from "../OrderStatusBadge";

export default function OrderStatusBadgeExample() {
  const statuses = [
    "DRAFT", 
    "SUBMITTED", 
    "IN_REVIEW", 
    "APPROVED", 
    "IN_PROGRESS", 
    "TESTING", 
    "COMPLETED", 
    "DELIVERED", 
    "REJECTED"
  ] as const;

  return (
    <div className="flex flex-wrap gap-3 p-8 bg-background">
      {statuses.map((status) => (
        <OrderStatusBadge key={status} status={status} />
      ))}
    </div>
  );
}
