import { StatCard } from "../StatCard";
import { Users, DollarSign, Building2, Activity } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Organizations"
        value="1,234"
        icon={Building2}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Active Users"
        value="5,678"
        icon={Users}
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Monthly Revenue"
        value="$45,890"
        icon={DollarSign}
        trend={{ value: 15, isPositive: true }}
      />
      <StatCard
        title="System Health"
        value="99.8%"
        icon={Activity}
        trend={{ value: 0.2, isPositive: true }}
      />
    </div>
  );
}
