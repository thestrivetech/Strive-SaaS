import { KPICard } from "../crm/analytics/kpi-card";

export default function KPICardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-6">
      <KPICard
        title="Total Revenue"
        value="$2.4M"
        trend="up"
        trendValue="+12.5%"
        subtitle="vs last month"
      />
      <KPICard
        title="Active Deals"
        value="47"
        trend="up"
        trendValue="+8"
        subtitle="this month"
      />
      <KPICard
        title="Avg Deal Size"
        value="$51K"
        trend="down"
        trendValue="-3.2%"
        subtitle="vs last month"
      />
      <KPICard
        title="Close Rate"
        value="32%"
        trend="neutral"
        trendValue="No change"
        subtitle="this quarter"
      />
    </div>
  );
}
