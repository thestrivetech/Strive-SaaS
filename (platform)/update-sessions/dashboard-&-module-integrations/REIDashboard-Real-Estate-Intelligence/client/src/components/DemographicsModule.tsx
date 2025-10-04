import { Card } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchNeighborhoodInsights } from "@/lib/api";

interface DemographicsModuleProps {
  selectedAreaCode?: string;
}

export function DemographicsModule({ selectedAreaCode }: DemographicsModuleProps) {
  const { data: insights = [], isLoading, isError } = useQuery({
    queryKey: ["/api/v1/reid/insights", selectedAreaCode],
    queryFn: () => fetchNeighborhoodInsights(selectedAreaCode),
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground">Loading demographics...</div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="text-destructive">Failed to load demographics. Please try again.</div>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground">No demographic data available for selected area</div>
      </Card>
    );
  }

  const primaryInsight = selectedAreaCode 
    ? insights.find(i => i.areaCode === selectedAreaCode) || insights[0]
    : insights[0];

  const radarData = [
    { subject: 'Income', value: Math.min((primaryInsight.demographics.medianIncome / 200000) * 100, 100), fullMark: 100 },
    { subject: 'Age', value: (primaryInsight.demographics.medianAge / 80) * 100, fullMark: 100 },
    { subject: 'Households', value: Math.min((primaryInsight.demographics.households / 20000) * 100, 100), fullMark: 100 },
    { subject: 'Commute', value: 100 - (primaryInsight.demographics.avgCommuteTime / 60) * 100, fullMark: 100 },
    { subject: 'Walk Score', value: primaryInsight.amenities.walkScore, fullMark: 100 },
    { subject: 'Schools', value: primaryInsight.amenities.schoolRating * 10, fullMark: 100 },
  ];

  const tableData = insights.map(insight => ({
    areaCode: insight.areaCode,
    medianAge: `${insight.demographics.medianAge} years`,
    medianIncome: `$${insight.demographics.medianIncome.toLocaleString()}`,
    households: insight.demographics.households.toLocaleString(),
    avgCommute: `${insight.demographics.avgCommuteTime} min`,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Demographic Profile {selectedAreaCode && `- ${selectedAreaCode}`}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.3}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Area Demographics</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zip Code</TableHead>
              <TableHead>Median Age</TableHead>
              <TableHead>Median Income</TableHead>
              <TableHead>Households</TableHead>
              <TableHead>Commute</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.areaCode}>
                <TableCell className="font-medium">{row.areaCode}</TableCell>
                <TableCell className="font-mono" data-testid={`demo-age-${row.areaCode}`}>
                  {row.medianAge}
                </TableCell>
                <TableCell className="font-mono" data-testid={`demo-income-${row.areaCode}`}>
                  {row.medianIncome}
                </TableCell>
                <TableCell className="font-mono">{row.households}</TableCell>
                <TableCell className="font-mono">{row.avgCommute}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
