import { SubscriptionChart } from "../SubscriptionChart";

export default function SubscriptionChartExample() {
  const data = [
    { name: "STARTER", value: 45 },
    { name: "GROWTH", value: 30 },
    { name: "ELITE", value: 15 },
    { name: "ENTERPRISE", value: 10 }
  ];

  return <SubscriptionChart data={data} />;
}
