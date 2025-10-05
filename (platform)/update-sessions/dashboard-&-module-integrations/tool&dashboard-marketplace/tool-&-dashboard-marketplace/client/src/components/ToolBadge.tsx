import { Badge } from "@/components/ui/badge";

interface ToolBadgeProps {
  tag: string;
}

export default function ToolBadge({ tag }: ToolBadgeProps) {
  const getVariantStyles = (tag: string) => {
    const tagLower = tag.toLowerCase();
    
    if (tagLower === "beta") {
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    }
    if (tagLower === "ai-powered") {
      return "bg-chart-3/10 text-chart-3 border-chart-3/20";
    }
    if (tagLower === "foundation") {
      return "bg-chart-2/10 text-chart-2 border-chart-2/20";
    }
    if (tagLower === "growth") {
      return "bg-chart-1/10 text-chart-1 border-chart-1/20";
    }
    if (tagLower === "elite") {
      return "bg-chart-3/10 text-chart-3 border-chart-3/20";
    }
    if (tagLower === "integration" || tagLower === "advanced") {
      return "bg-muted text-muted-foreground border-border";
    }
    if (tagLower === "custom") {
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    }
    
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <Badge 
      variant="outline" 
      className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 ${getVariantStyles(tag)}`}
      data-testid={`badge-${tag.toLowerCase()}`}
    >
      {tag}
    </Badge>
  );
}
