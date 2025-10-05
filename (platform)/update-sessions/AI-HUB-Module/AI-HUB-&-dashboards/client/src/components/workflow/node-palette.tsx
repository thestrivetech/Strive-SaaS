import { Brain, Database, Zap, Code, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodePaletteProps {
  className?: string;
}

const nodeTypes = [
  { id: 'trigger', icon: Zap, color: 'text-neon-green', label: 'Trigger' },
  { id: 'ai', icon: Brain, color: 'text-primary', label: 'AI' },
  { id: 'action', icon: Database, color: 'text-accent', label: 'Action' },
  { id: 'api', icon: Code, color: 'text-chart-4', label: 'API' },
  { id: 'condition', icon: GitBranch, color: 'text-neon-violet', label: 'Condition' },
];

export default function NodePalette({ className }: NodePaletteProps) {
  return (
    <div className={cn("glass-panel rounded-lg p-3 flex space-x-2", className)} data-testid="node-palette">
      {nodeTypes.map((nodeType) => {
        const Icon = nodeType.icon;
        return (
          <div 
            key={nodeType.id}
            className="node-item p-2 rounded bg-background/50 cursor-pointer hover:bg-background/80 transition-all"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', nodeType.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            title={nodeType.label}
            data-testid={`node-${nodeType.id}`}
          >
            <Icon className={cn("w-4 h-4", nodeType.color)} />
          </div>
        );
      })}
    </div>
  );
}
