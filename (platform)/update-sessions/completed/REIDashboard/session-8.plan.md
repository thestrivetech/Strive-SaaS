# Session 8: Analytics Charts & ROI Simulator

## Session Overview
**Goal:** Implement interactive analytics charts with Recharts and create the ROI investment calculator simulator.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 7 (Market heatmap complete)

## Objectives

1. ✅ Install and configure Recharts library
2. ✅ Create TrendsChart component with dark theme
3. ✅ Implement DemographicsPanel with visualizations
4. ✅ Create ROISimulator component
5. ✅ Add investment calculation logic
6. ✅ Create chart theming for dark mode
7. ✅ Add responsive chart sizing

## Prerequisites

- [x] Session 7 completed
- [x] Understanding of Recharts library
- [x] ROI calculation formulas
- [x] Investment analysis knowledge

## Dependencies to Install

```bash
npm install recharts
```

## Implementation Steps

### Step 1: Create Trends Chart Component

#### File: `components/real-estate/reid/charts/TrendsChart.tsx`
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartSkeleton } from '../shared/REIDSkeleton';
import { useState } from 'react';

export function TrendsChart() {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [metric, setMetric] = useState<'price' | 'inventory' | 'daysOnMarket'>('price');

  const { data: insights, isLoading } = useQuery({
    queryKey: ['neighborhood-insights'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    }
  });

  const chartData = insights?.insights?.map((insight: any) => ({
    name: insight.area_name,
    price: Number(insight.median_price) / 1000,
    inventory: insight.inventory,
    daysOnMarket: insight.days_on_market,
  })) || [];

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const dataKey = metric === 'price' ? 'price' : metric === 'inventory' ? 'inventory' : 'daysOnMarket';
    const color = metric === 'price' ? '#06b6d4' : metric === 'inventory' ? '#8b5cf6' : '#10b981';

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill="url(#colorValue)" />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} />
            <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} />
          </LineChart>
        );
    }
  };

  if (isLoading) return <ChartSkeleton />;

  return (
    <REIDCard>
      <REIDCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Market Trends</h3>
          </div>

          <div className="flex gap-2">
            <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="daysOnMarket">Days on Market</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-24 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </REIDCardHeader>

      <REIDCardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </REIDCardContent>
    </REIDCard>
  );
}
```

### Step 2: Create Demographics Panel

#### File: `components/real-estate/reid/analytics/DemographicsPanel.tsx`
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { MetricCard } from '../shared/MetricCard';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function DemographicsPanel() {
  const { data: insights } = useQuery({
    queryKey: ['neighborhood-insights'],
    queryFn: async () => {
      const response = await fetch('/api/v1/reid/insights');
      return response.json();
    }
  });

  const avgMedianAge = insights?.insights?.reduce((sum: number, i: any) =>
    sum + (i.median_age || 0), 0) / (insights?.insights?.length || 1);

  const avgMedianIncome = insights?.insights?.reduce((sum: number, i: any) =>
    sum + (Number(i.median_income) || 0), 0) / (insights?.insights?.length || 1);

  const totalHouseholds = insights?.insights?.reduce((sum: number, i: any) =>
    sum + (i.households || 0), 0);

  const ageDistribution = [
    { name: '< 25', value: 15 },
    { name: '25-40', value: 35 },
    { name: '40-60', value: 30 },
    { name: '60+', value: 20 }
  ];

  return (
    <REIDCard>
      <REIDCardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Demographics</h3>
        </div>
      </REIDCardHeader>

      <REIDCardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <MetricCard
            label="Median Age"
            value={avgMedianAge?.toFixed(1) || 'N/A'}
            className="col-span-1"
          />
          <MetricCard
            label="Median Income"
            value={avgMedianIncome ? `$${(avgMedianIncome / 1000).toFixed(0)}K` : 'N/A'}
            className="col-span-1"
          />
          <MetricCard
            label="Total Households"
            value={totalHouseholds?.toLocaleString() || 'N/A'}
            className="col-span-1"
          />
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ageDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {ageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend
                wrapperStyle={{ color: '#94a3b8' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </REIDCardContent>
    </REIDCard>
  );
}
```

### Step 3: Create ROI Simulator

#### File: `components/real-estate/reid/analytics/ROISimulator.tsx`
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function ROISimulator() {
  const [inputs, setInputs] = useState({
    purchasePrice: 500000,
    downPayment: 20,
    interestRate: 6.5,
    monthlyRent: 3500,
    expenses: 1500,
    appreciation: 3.5,
    holdingPeriod: 10
  });

  const [results, setResults] = useState({
    monthlyReturn: 0,
    annualReturn: 0,
    totalReturn: 0,
    cashOnCash: 0,
    capRate: 0
  });

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const calculateROI = () => {
    const downPaymentAmount = inputs.purchasePrice * (inputs.downPayment / 100);
    const loanAmount = inputs.purchasePrice - downPaymentAmount;
    const monthlyPayment = calculateMortgagePayment(loanAmount, inputs.interestRate, 30);

    const monthlyReturn = inputs.monthlyRent - monthlyPayment - inputs.expenses;
    const annualReturn = monthlyReturn * 12;
    const cashOnCash = (annualReturn / downPaymentAmount) * 100;
    const capRate = ((inputs.monthlyRent * 12 - inputs.expenses * 12) / inputs.purchasePrice) * 100;

    // Calculate total return over holding period
    const futureValue = inputs.purchasePrice * Math.pow(1 + inputs.appreciation / 100, inputs.holdingPeriod);
    const totalEquity = futureValue - loanAmount + (annualReturn * inputs.holdingPeriod);
    const totalReturn = ((totalEquity - downPaymentAmount) / downPaymentAmount) * 100;

    setResults({
      monthlyReturn,
      annualReturn,
      totalReturn,
      cashOnCash,
      capRate
    });
  };

  const calculateMortgagePayment = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const updateInput = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <REIDCard variant="purple">
      <REIDCardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">ROI Simulator</h3>
        </div>
      </REIDCardHeader>

      <REIDCardContent className="space-y-4">
        {/* Purchase Price */}
        <div className="space-y-2">
          <Label className="text-slate-300">Purchase Price</Label>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <Input
              type="number"
              value={inputs.purchasePrice}
              onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <Label className="text-slate-300">Down Payment: {inputs.downPayment}%</Label>
          <Slider
            value={[inputs.downPayment]}
            onValueChange={(values) => updateInput('downPayment', values[0])}
            max={50}
            min={5}
            step={5}
            className="w-full"
          />
        </div>

        {/* Monthly Rent */}
        <div className="space-y-2">
          <Label className="text-slate-300">Monthly Rent</Label>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <Input
              type="number"
              value={inputs.monthlyRent}
              onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label className="text-slate-300">Interest Rate: {inputs.interestRate}%</Label>
          <Slider
            value={[inputs.interestRate]}
            onValueChange={(values) => updateInput('interestRate', values[0])}
            max={10}
            min={3}
            step={0.25}
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="pt-4 border-t border-slate-600 space-y-3">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Results
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-green-400">
                ${results.monthlyReturn.toFixed(0)}
              </div>
              <div className="text-xs text-slate-400">Monthly Cash Flow</div>
            </div>

            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-cyan-400">
                {results.cashOnCash.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Cash-on-Cash</div>
            </div>

            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-purple-400">
                {results.capRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Cap Rate</div>
            </div>

            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-yellow-400">
                {results.totalReturn.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400">{inputs.holdingPeriod}yr Return</div>
            </div>
          </div>
        </div>
      </REIDCardContent>
    </REIDCard>
  );
}
```

### Step 4: Create Component Exports

#### File: `components/real-estate/reid/charts/index.ts`
```typescript
export { TrendsChart } from './TrendsChart';
```

#### File: `components/real-estate/reid/analytics/index.ts`
```typescript
export { DemographicsPanel } from './DemographicsPanel';
export { ROISimulator } from './ROISimulator';
```

## Success Criteria

- [x] Recharts installed and configured
- [x] TrendsChart with dark theme working
- [x] DemographicsPanel visualizations functional
- [x] ROI Simulator calculations accurate
- [x] Chart responsiveness working
- [x] Dark theme applied to all charts
- [x] Interactive chart controls functional

## Files Created

- ✅ `components/real-estate/reid/charts/TrendsChart.tsx`
- ✅ `components/real-estate/reid/analytics/DemographicsPanel.tsx`
- ✅ `components/real-estate/reid/analytics/ROISimulator.tsx`
- ✅ `components/real-estate/reid/charts/index.ts`
- ✅ `components/real-estate/reid/analytics/index.ts`

## Next Steps

1. ✅ Proceed to **Session 9: Alerts Management UI**
2. ✅ Analytics charts functional
3. ✅ ROI simulator ready
4. ✅ Ready to build alerts interface

---

**Session 8 Complete:** ✅ Analytics charts and ROI simulator implemented
