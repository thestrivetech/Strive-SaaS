import { StatCard } from "../crm/dashboard/stat-card";
import { Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-6">
      <StatCard
        title="New Leads"
        value="24"
        change={12.5}
        changeLabel="vs last 24h"
        icon={Users}
      />
      <StatCard
        title="Pipeline Value"
        value="$2.4M"
        change={8.2}
        changeLabel="vs last month"
        icon={DollarSign}
      />
      <StatCard
        title="Conversion Rate"
        value="32%"
        change={-2.4}
        changeLabel="vs last month"
        icon={TrendingUp}
      />
      <StatCard
        title="Deals Closed"
        value="12"
        change={15.3}
        changeLabel="this month"
        icon={CheckCircle}
      />
    </div>
  );
}
