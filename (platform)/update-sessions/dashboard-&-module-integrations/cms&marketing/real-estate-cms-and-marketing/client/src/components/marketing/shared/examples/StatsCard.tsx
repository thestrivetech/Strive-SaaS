import StatsCard from '../StatsCard';
import { Mail, Users, MousePointer, DollarSign } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatsCard
        title="Total Campaigns"
        value="24"
        icon={Mail}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Total Leads"
        value="1,284"
        icon={Users}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard
        title="Click Rate"
        value="4.2%"
        icon={MousePointer}
        trend={{ value: 2.1, isPositive: false }}
      />
      <StatsCard
        title="Revenue"
        value="$12,840"
        icon={DollarSign}
        trend={{ value: 15, isPositive: true }}
      />
    </div>
  );
}
