import { CategoryChart } from '../category-chart';

const mockData = [
  { category: "Commission", amount: 12500 },
  { category: "Travel", amount: 4200 },
  { category: "Marketing", amount: 8300 },
  { category: "Office", amount: 2100 },
  { category: "Utilities", amount: 1800 },
];

export default function CategoryChartExample() {
  return (
    <div className="p-8 bg-background">
      <CategoryChart data={mockData} />
    </div>
  );
}
