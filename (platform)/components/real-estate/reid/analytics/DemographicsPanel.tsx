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
