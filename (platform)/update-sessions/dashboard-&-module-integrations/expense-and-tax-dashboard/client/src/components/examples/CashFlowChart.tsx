import { CashFlowChart } from '../cash-flow-chart';

const mockData = [
  { month: "Jan", amount: 3200 },
  { month: "Feb", amount: 4100 },
  { month: "Mar", amount: 3800 },
  { month: "Apr", amount: 5200 },
  { month: "May", amount: 4500 },
  { month: "Jun", amount: 3900 },
];

export default function CashFlowChartExample() {
  return (
    <div className="p-8 bg-background">
      <CashFlowChart data={mockData} />
    </div>
  );
}
