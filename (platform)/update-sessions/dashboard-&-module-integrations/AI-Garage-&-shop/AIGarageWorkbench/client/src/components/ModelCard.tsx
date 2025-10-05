import { cn } from "@/lib/utils";
import { HolographicCard } from "./HolographicCard";
import { CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ModelCardProps {
  name: string;
  provider: string;
  speed: number;
  accuracy: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ModelCard({ 
  name, 
  provider, 
  speed, 
  accuracy, 
  selected = false,
  onClick,
  className 
}: ModelCardProps) {
  return (
    <HolographicCard
      glowColor={selected ? "cyan" : "violet"}
      className={cn(
        "cursor-pointer transition-all",
        selected && "ring-2 ring-cyan-400",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{provider}</p>
          </div>
          {selected && (
            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Speed</span>
              <span className="text-xs font-medium text-cyan-400">{speed}%</span>
            </div>
            <div className="h-1 bg-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500"
                style={{ width: `${speed}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Accuracy</span>
              <span className="text-xs font-medium text-violet-400">{accuracy}%</span>
            </div>
            <div className="h-1 bg-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </HolographicCard>
  );
}
