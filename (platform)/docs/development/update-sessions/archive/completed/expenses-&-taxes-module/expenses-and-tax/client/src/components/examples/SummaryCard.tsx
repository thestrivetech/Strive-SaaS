import { SummaryCard } from '../summary-card';
import { DollarSign } from 'lucide-react';

export default function SummaryCardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="grid grid-cols-3 gap-6">
        <SummaryCard
          title="Total Expenses YTD"
          value="$45,231"
          trend="+12.5% from last year"
          trendUp={false}
          icon={DollarSign}
        />
        <SummaryCard
          title="This Month"
          value="$3,842"
          trend="-8.3% from last month"
          trendUp={true}
          icon={DollarSign}
        />
        <SummaryCard
          title="Tax Deductible"
          value="$38,450"
          trend="85% of total"
          trendUp={true}
          icon={DollarSign}
        />
      </div>
    </div>
  );
}
