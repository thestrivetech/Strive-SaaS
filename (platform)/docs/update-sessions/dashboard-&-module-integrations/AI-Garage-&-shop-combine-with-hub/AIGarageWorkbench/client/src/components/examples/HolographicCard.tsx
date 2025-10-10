import { HolographicCard } from "../HolographicCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HolographicCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-background">
      <HolographicCard glowColor="cyan">
        <CardHeader>
          <CardTitle>Cyan Glow</CardTitle>
          <CardDescription>Holographic card with cyan accent</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hover to see the magnetic effect in action.
          </p>
        </CardContent>
      </HolographicCard>

      <HolographicCard glowColor="violet">
        <CardHeader>
          <CardTitle>Violet Glow</CardTitle>
          <CardDescription>Holographic card with violet accent</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Beautiful aurora glass effect with backdrop blur.
          </p>
        </CardContent>
      </HolographicCard>

      <HolographicCard glowColor="emerald">
        <CardHeader>
          <CardTitle>Emerald Glow</CardTitle>
          <CardDescription>Holographic card with emerald accent</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fluid animations and transitions throughout.
          </p>
        </CardContent>
      </HolographicCard>
    </div>
  );
}
