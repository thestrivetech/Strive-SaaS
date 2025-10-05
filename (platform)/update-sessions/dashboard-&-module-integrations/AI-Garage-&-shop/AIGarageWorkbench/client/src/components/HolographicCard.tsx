import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "violet" | "emerald";
  onClick?: () => void;
}

export function HolographicCard({ children, className, glowColor = "cyan", onClick }: HolographicCardProps) {
  const glowColors = {
    cyan: "shadow-cyan-500/20",
    violet: "shadow-violet-500/20",
    emerald: "shadow-emerald-500/20",
  };

  const borderColors = {
    cyan: "border-cyan-400/30",
    violet: "border-violet-400/30",
    emerald: "border-emerald-400/30",
  };

  return (
    <Card
      className={cn(
        "backdrop-blur-xl bg-gradient-to-br from-card/70 to-card/40",
        "border shadow-2xl transition-all duration-500",
        glowColors[glowColor],
        borderColors[glowColor],
        "magnetic-hover",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}
