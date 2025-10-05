import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <StatusBadge status="ACTIVE" />
      <StatusBadge status="TRIALING" />
      <StatusBadge status="PAST_DUE" />
      <StatusBadge status="CANCELED" />
    </div>
  );
}
