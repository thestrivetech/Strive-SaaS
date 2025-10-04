import PerformanceChart from '../PerformanceChart';

export default function PerformanceChartExample() {
  const emailData = [
    { date: "Jan 1", value: 220 },
    { date: "Jan 5", value: 280 },
    { date: "Jan 10", value: 320 },
    { date: "Jan 15", value: 380 },
    { date: "Jan 20", value: 420 },
    { date: "Jan 25", value: 450 },
    { date: "Jan 30", value: 520 },
  ];

  return (
    <div className="p-4">
      <PerformanceChart
        title="Email Campaign Opens"
        description="Total opens over the last 30 days"
        data={emailData}
        color="hsl(var(--chart-1))"
      />
    </div>
  );
}
