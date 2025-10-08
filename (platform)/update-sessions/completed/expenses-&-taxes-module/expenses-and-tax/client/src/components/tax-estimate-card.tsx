import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TaxEstimateProps {
  totalExpenses: number;
  deductibleExpenses: number;
  taxRate?: number;
}

export function TaxEstimateCard({
  totalExpenses,
  deductibleExpenses,
  taxRate = 0.25,
}: TaxEstimateProps) {
  const nonDeductible = totalExpenses - deductibleExpenses;
  const deductiblePercent = (deductibleExpenses / totalExpenses) * 100;
  const estimatedSavings = deductibleExpenses * taxRate;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle>Tax Estimate</CardTitle>
        <Calculator className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Deductible</span>
            <span className="font-mono font-semibold text-chart-2">
              ${deductibleExpenses.toFixed(2)}
            </span>
          </div>
          <Progress value={deductiblePercent} className="h-2" />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">
              {deductiblePercent.toFixed(1)}% of total
            </span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Non-deductible</span>
            <span className="font-mono">${nonDeductible.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax rate</span>
            <span className="font-mono">{(taxRate * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Estimated Savings</span>
            <span className="text-2xl font-bold font-mono text-chart-2" data-testid="text-tax-savings">
              ${estimatedSavings.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {(taxRate * 100).toFixed(0)}% tax bracket
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
