import { TierBadge } from "../TierBadge";

export default function TierBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <TierBadge tier="CUSTOM" />
      <TierBadge tier="STARTER" />
      <TierBadge tier="GROWTH" />
      <TierBadge tier="ELITE" />
      <TierBadge tier="ENTERPRISE" />
    </div>
  );
}
