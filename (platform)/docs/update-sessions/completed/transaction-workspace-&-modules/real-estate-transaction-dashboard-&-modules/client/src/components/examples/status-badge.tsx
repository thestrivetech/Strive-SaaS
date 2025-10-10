import StatusBadge from '../transaction/status-badge';

export default function StatusBadgeExample() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="draft" showIcon />
        <StatusBadge status="active" showIcon />
        <StatusBadge status="underContract" showIcon />
        <StatusBadge status="closing" showIcon />
        <StatusBadge status="closed" showIcon />
        <StatusBadge status="cancelled" showIcon />
      </div>
    </div>
  );
}
