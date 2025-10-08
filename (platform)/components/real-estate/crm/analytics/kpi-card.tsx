'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, CheckCircle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

/**
 * KPI Card Component
 *
 * Displays a key performance indicator with:
 * - Title and icon
 * - Primary value (number/currency/percentage)
 * - Optional change indicator (MoM, YoY, etc.)
 *
 * @example
 * ```tsx
 * <KPICard
 *   title="Total Revenue"
 *   value={125000}
 *   change={12.5}
 *   format="currency"
 *   iconName="dollar-sign"
 * />
 * ```
 */

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  format?: 'number' | 'currency' | 'percentage';
  iconName?: 'users' | 'dollar-sign' | 'trending-up' | 'check-circle';
}

const iconMap = {
  'users': Users,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
};

export function KPICard({ title, value, change, format = 'number', iconName }: KPICardProps) {
  const Icon = iconName ? iconMap[iconName] : null;
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return formatNumber(value);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {typeof change !== 'undefined' && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span>vs last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
