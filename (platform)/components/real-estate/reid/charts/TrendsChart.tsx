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
