import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  CUSTOM: "hsl(var(--accent))",
  STARTER: "hsl(var(--secondary))",
  GROWTH: "hsl(var(--primary))",
  ELITE: "hsl(var(--chart-4))",
  ENTERPRISE: "hsl(var(--chart-5))"
};

interface SubscriptionChartProps {
  data: { name: string; value: number }[];
}

export function SubscriptionChart({ data }: SubscriptionChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Subscription Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.STARTER} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
