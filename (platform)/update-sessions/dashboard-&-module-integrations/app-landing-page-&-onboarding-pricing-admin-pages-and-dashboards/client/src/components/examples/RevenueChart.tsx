import { RevenueChart } from "../RevenueChart";

export default function RevenueChartExample() {
  const data = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 22000 },
    { month: "May", revenue: 28000 },
    { month: "Jun", revenue: 35000 }
  ];

  return <RevenueChart data={data} />;
}
