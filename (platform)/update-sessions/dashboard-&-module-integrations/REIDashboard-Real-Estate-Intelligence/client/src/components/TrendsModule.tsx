import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const trendData = [
  { month: 'Jan', area: 420000, city: 380000, state: 350000 },
  { month: 'Feb', area: 425000, city: 385000, state: 355000 },
  { month: 'Mar', area: 432000, city: 390000, state: 360000 },
  { month: 'Apr', area: 438000, city: 395000, state: 365000 },
  { month: 'May', area: 445000, city: 400000, state: 370000 },
  { month: 'Jun', area: 450000, city: 405000, state: 375000 },
  { month: 'Jul', area: 458000, city: 410000, state: 380000 },
  { month: 'Aug', area: 462000, city: 415000, state: 385000 },
  { month: 'Sep', area: 468000, city: 420000, state: 390000 },
  { month: 'Oct', area: 472000, city: 425000, state: 395000 },
  { month: 'Nov', area: 478000, city: 430000, state: 400000 },
  { month: 'Dec', area: 485000, city: 435000, state: 405000 },
];

export function TrendsModule() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">12-Month Price Trends Comparison</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="area" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={3}
            name="Selected Area"
            dot={{ fill: 'hsl(var(--chart-1))' }}
          />
          <Line 
            type="monotone" 
            dataKey="city" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="City Average"
            dot={{ fill: 'hsl(var(--chart-2))' }}
          />
          <Line 
            type="monotone" 
            dataKey="state" 
            stroke="hsl(var(--chart-3))" 
            strokeWidth={2}
            name="State Average"
            dot={{ fill: 'hsl(var(--chart-3))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
