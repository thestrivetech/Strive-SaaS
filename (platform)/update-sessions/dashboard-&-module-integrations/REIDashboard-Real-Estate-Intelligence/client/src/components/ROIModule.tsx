import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function ROIModule() {
  const [purchasePrice, setPurchasePrice] = useState(450000);
  const [monthlyRent, setMonthlyRent] = useState(3200);
  const [expenses, setExpenses] = useState(800);
  const [downPayment, setDownPayment] = useState(90000);
  const [interestRate, setInterestRate] = useState(6.5);

  const annualRent = monthlyRent * 12;
  const annualExpenses = expenses * 12;
  const noi = annualRent - annualExpenses;
  const capRate = ((noi / purchasePrice) * 100).toFixed(2);
  
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 30 * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualDebtService = monthlyPayment * 12;
  const cashFlow = noi - annualDebtService;
  const cashOnCash = ((cashFlow / downPayment) * 100).toFixed(2);

  const pieData = [
    { name: 'Rental Income', value: annualRent, color: 'hsl(var(--chart-1))' },
    { name: 'Expenses', value: annualExpenses, color: 'hsl(var(--chart-4))' },
    { name: 'Debt Service', value: annualDebtService, color: 'hsl(var(--chart-2))' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Investment Inputs</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="purchase">Purchase Price</Label>
            <Input
              id="purchase"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              data-testid="input-purchase-price"
            />
          </div>
          <div>
            <Label htmlFor="rent">Monthly Rent</Label>
            <Input
              id="rent"
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              data-testid="input-monthly-rent"
            />
          </div>
          <div>
            <Label htmlFor="expenses">Monthly Expenses</Label>
            <Input
              id="expenses"
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              data-testid="input-expenses"
            />
          </div>
          <div>
            <Label htmlFor="down">Down Payment</Label>
            <Input
              id="down"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              data-testid="input-down-payment"
            />
          </div>
          <div>
            <Label htmlFor="rate">Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              data-testid="input-interest-rate"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ROI Analysis</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Cap Rate</p>
              <p className="text-2xl font-bold font-mono text-chart-1" data-testid="result-cap-rate">{capRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Cash on Cash</p>
              <p className="text-2xl font-bold font-mono text-chart-2" data-testid="result-cash-on-cash">{cashOnCash}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Annual Cash Flow</p>
              <p className="text-2xl font-bold font-mono text-chart-3" data-testid="result-cash-flow">
                ${cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
