import { AgentAvatar } from "../AgentAvatar";

export default function AgentAvatarExample() {
  return (
    <div className="flex items-center gap-8 p-8 bg-background">
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar size="sm" status="active" />
        <p className="text-xs text-muted-foreground">Small Active</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar size="md" status="building" />
        <p className="text-xs text-muted-foreground">Medium Building</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AgentAvatar size="lg" status="idle" />
        <p className="text-xs text-muted-foreground">Large Idle</p>
      </div>
    </div>
  );
}
