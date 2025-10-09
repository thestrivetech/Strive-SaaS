import { StatsCard } from "../StatsCard";
import { Bot, Wrench, ShoppingCart, Zap } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-background">
      <StatsCard
        title="Active Agents"
        value={24}
        icon={Bot}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Custom Tools"
        value={18}
        icon={Wrench}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard
        title="Pending Orders"
        value={7}
        icon={ShoppingCart}
        trend={{ value: 3, isPositive: false }}
      />
      <StatsCard
        title="Build Credits"
        value={85}
        icon={Zap}
      />
    </div>
  );
}
