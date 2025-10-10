import ToolBadge from '../ToolBadge';

export default function ToolBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <ToolBadge tag="Beta" />
      <ToolBadge tag="AI-Powered" />
      <ToolBadge tag="Foundation" />
      <ToolBadge tag="Growth" />
      <ToolBadge tag="Elite" />
      <ToolBadge tag="Integration" />
      <ToolBadge tag="Advanced" />
    </div>
  );
}
